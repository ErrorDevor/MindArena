"""Движок QUANTUM / Explore (ТЗ Блок B, H, I) — эволюционное дерево идей.

Поколение: параллельная генерация веток всеми моделями → оценка каждой (0–100) →
коллапс к топ-K → следующее поколение развивает выживших. Возвращает поток событий
branch.created / branch.scored / branch.promoted / generation.completed + debate.completed.
Это перебор идей с фильтрацией — «квантовый» эффект: ~log(N) итераций вместо перебора всех.
"""
from __future__ import annotations

import asyncio
import uuid
from typing import AsyncIterator

from app.config import settings
from app.engine import prompts
from app.engine.jsonutil import parse_json
from app.engine.verify import _is_repeat, _pick_lead, _safe_generate, Event
from app.providers.base import LLMProvider

_SCORE_CHUNK = 12  # оценка веток батчами: один гигантский запрос обрезает JSON и обнуляет оценки


def _clamp(v) -> int:
    try:
        return max(0, min(100, int(float(v))))
    except (TypeError, ValueError):
        return 0


async def run_quantum(
    *,
    debate_id: str,
    thesis: str,
    models: list[str],
    registry: dict[str, LLMProvider],
    locale: str = "ru",
    max_generations: int | None = None,
    branches_per_gen: int | None = None,
    top_k: int | None = None,
    attack_timeout: int | None = None,
    injections: dict | None = None,
) -> AsyncIterator[Event]:
    agents = [m for m in models if m in registry]
    lead = _pick_lead(registry)
    if not agents or lead is None:
        yield "debate.failed", {"debateId": debate_id, "reason": "нет доступных моделей (проверь ключи)"}
        return

    generations = max_generations or settings.quantum_max_generations
    per_model = max(2, (branches_per_gen or settings.quantum_branches_per_gen) // max(len(agents), 1))
    top_k = top_k or settings.quantum_top_k
    timeout = attack_timeout or settings.attack_timeout_seconds

    yield "debate.started", {
        "debateId": debate_id, "thesis": thesis, "mode": "EXPLORE",
        "strategy": "QUANTUM", "models": agents,
    }

    survivors: list[dict] = []  # [{id, text, agent, score}]

    for gen in range(1, generations + 1):
        seed = [s["text"] for s in survivors]
        branches: list[dict] = []

        # 0) HUMAN INJECTIONS — гипотезы пользователя входят в пул поколения наравне с ветками моделей
        if injections is not None:
            injections["generation"] = gen
            injections["thesis"] = thesis
            pending = injections.get("pending") or []
            injections["pending"] = []
            for inj in pending:
                text = (inj.get("text") or "").strip()
                if len(text) < 12:
                    yield "human.injection.rejected", {
                        "debateId": debate_id, "generation": gen, "text": text,
                        "reason": "слишком коротко для гипотезы — переформулируйте конкретнее",
                    }
                    continue
                bid = uuid.uuid4().hex[:8]
                branches.append({"id": bid, "text": text, "agent": "HUMAN", "generation": gen, "score": 0})
                yield "human.injection.applied", {
                    "debateId": debate_id, "generation": gen, "type": "hypothesis",
                    "content": text, "assignedTo": "консилиум (оценка наравне с ветками)",
                    "metadata": {"branchId": bid, "author": "human"},
                }
                yield "branch.created", {
                    "debateId": debate_id, "id": bid, "generation": gen, "lens": "HUMAN", "text": text,
                }

        # 1) ГЕНЕРАЦИЯ — все модели параллельно
        async def _gen(agent_id: str):
            text, err = await _safe_generate(
                registry[agent_id], prompts.quantum_generate_messages(thesis, seed, per_model, locale),
                max_tokens=700, json_mode=True,
            )
            ideas = (parse_json(text) or {}).get("branches", []) if not err else []
            return agent_id, ideas

        tasks = [asyncio.create_task(_gen(a)) for a in agents]
        try:
            for fut in asyncio.as_completed(tasks, timeout=timeout):
                agent_id, ideas = await fut
                for idea in ideas:
                    if not isinstance(idea, str) or len(idea.strip()) < 12:
                        continue
                    # дубликаты между моделями (и с выжившими прошлого поколения) не пускаем
                    if _is_repeat(idea, [b["text"] for b in branches] + seed):
                        continue
                    bid = uuid.uuid4().hex[:8]
                    b = {"id": bid, "text": idea.strip(), "agent": agent_id, "generation": gen, "score": 0}
                    branches.append(b)
                    yield "branch.created", {
                        "debateId": debate_id, "id": bid, "generation": gen,
                        "lens": agent_id, "text": b["text"],
                    }
        except asyncio.TimeoutError:
            pass
        finally:
            for t in tasks:
                if not t.done():
                    t.cancel()

        if not branches:
            break

        # 2) ОЦЕНКА — батчами: один гигантский запрос по 40+ веткам обрезает JSON и обнуляет хвост
        chunks = [branches[i:i + _SCORE_CHUNK] for i in range(0, len(branches), _SCORE_CHUNK)]
        score_tasks = [
            asyncio.create_task(_safe_generate(
                lead, prompts.quantum_score_messages(thesis, chunk, locale),
                max_tokens=1400, json_mode=True, timeout=timeout,
            ))
            for chunk in chunks
        ]
        scores: dict = {}
        for res in await asyncio.gather(*score_tasks, return_exceptions=True):
            if isinstance(res, Exception):
                continue
            text, _err = res
            for s in (parse_json(text) or {}).get("scores", []):
                if isinstance(s, dict) and s.get("id"):
                    scores[s["id"]] = s
        for b in branches:
            sc = scores.get(b["id"], {})
            b["score"] = _clamp(sc.get("score", 0))
            yield "branch.scored", {
                "debateId": debate_id, "id": b["id"], "score": b["score"],
                "breakdown": sc.get("breakdown", {}) if isinstance(sc.get("breakdown"), dict) else {},
            }

        # 3) КОЛЛАПС — топ-K
        ranked = sorted(branches, key=lambda x: x["score"], reverse=True)
        survivors = ranked[:top_k]
        for s in survivors:
            yield "branch.promoted", {"debateId": debate_id, "id": s["id"], "verifiedScore": s["score"]}
        yield "generation.completed", {
            "debateId": debate_id, "generation": gen,
            "explored": len(branches), "survived": len(survivors),
        }

    # ФИНАЛ — топ выживших идей
    top = sorted(survivors, key=lambda x: x["score"], reverse=True)
    final = {
        "opportunityScore": top[0]["score"] if top else 0,
        "conclusion": (
            f"Исследовано поколений: {generations}. Топ идей после перебора и отбора."
            if top else "Не удалось получить ветки (проверь ключи/модели)."
        ),
        "topBranches": [{"id": b["id"], "text": b["text"], "score": b["score"], "agent": b["agent"]} for b in top],
        "childQuestions": [],
        "researchGaps": [],
        "crossDomainHypotheses": [],
        "profitPatterns": [],
        "fundingBranches": [],
    }
    yield "debate.completed", {"debateId": debate_id, "thesis": thesis, "final": final}
