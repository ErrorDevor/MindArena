"""Движок VERIFY — «петля истины» (ТЗ Части 2–4).

Раунд: параллельные атаки (каждая модель по своей роли) → синтез улучшенного
тезиса (3 блока) → верификация атак (closed/partial/open) → стоп-условие.
Возвращает поток событий (event_name, data) — их стримит FastAPI как SSE.
Падение одной модели изолируется: её атака пропускается, дебат продолжается.
"""
from __future__ import annotations

import asyncio
import uuid
from typing import AsyncIterator

from app.config import settings
from app.engine import prompts
from app.engine.jsonutil import parse_json
from app.engine.memory import Anchor
from app.engine.roles import role_for
from app.providers.base import LLMMessage, LLMProvider

Event = tuple[str, dict]

# Кто ведёт синтез/верификацию/финал (первый доступный из списка)
_LEAD_PREFERENCE = ["CLAUDE", "GPT", "GLM", "DEEPSEEK", "KIMI", "GEMINI", "GROK"]


def _pick_lead(registry: dict[str, LLMProvider]) -> LLMProvider | None:
    for pid in _LEAD_PREFERENCE:
        if pid in registry:
            return registry[pid]
    return next(iter(registry.values()), None)


async def _safe_generate(provider: LLMProvider, messages: list[LLMMessage], *,
                         timeout: float | None = None, **kw) -> tuple[str | None, str | None]:
    try:
        coro = provider.generate(messages, **kw)
        res = await (asyncio.wait_for(coro, timeout) if timeout else coro)
        return (res.text or "").strip(), None
    except Exception as e:  # noqa: BLE001
        return None, f"{type(e).__name__}: {e}"


_PROMPT_ECHO = ("сформулируй", "верни строго json", "верни json", "исходный тезис:", "текущая версия:")


def _valid_attack(text: str | None) -> bool:
    """Отсеиваем мусор: пустой/слишком короткий ответ или эхо инструкции промпта."""
    t = (text or "").strip()
    if len(t) < 40:
        return False
    head = t.lower()[:80]
    return not any(p in head for p in _PROMPT_ECHO)


def _is_repeat(text: str, prior: list[str], thresh: float = 0.6) -> bool:
    """Грубая проверка повтора по пересечению слов (без эмбеддингов — это V2)."""
    nw = set(text.lower().split())
    if not nw:
        return True
    for p in prior:
        pw = set(p.lower().split())
        if pw and len(nw & pw) / max(len(nw), 1) > thresh:
            return True
    return False


_FORM_MARKERS = (
    "критери", "метрик", "определени", "операционализ", "уточнит", "горизонт", "квантифиц",
    "формулировк", "порог", "единиц измерения", "не задаёт", "не задает", "не содержит критери",
    "субъектив", "неоднозначн", "терминолог",
)


def _is_form_attack(text: str) -> bool:
    """Атака про форму (критерии/метрики/определения), а не про содержание — по маркерам."""
    low = (text or "").lower()
    return sum(m in low for m in _FORM_MARKERS) >= 2


async def run_verify(
    *,
    debate_id: str,
    thesis: str,
    mode: str,
    models: list[str],
    max_rounds: int,
    registry: dict[str, LLMProvider],
    locale: str = "ru",
    roles_map: dict[str, dict] | None = None,
    attack_timeout: int | None = None,
    injections: dict | None = None,
) -> AsyncIterator[Event]:
    agents = [m for m in models if m in registry]
    timeout = attack_timeout or settings.attack_timeout_seconds
    lead = _pick_lead(registry)
    if not agents or lead is None:
        yield "debate.failed", {"debateId": debate_id, "reason": "нет доступных моделей (проверь ключи)"}
        return

    yield "debate.started", {
        "debateId": debate_id, "thesis": thesis, "mode": mode,
        "strategy": "VERIFY", "models": agents,
    }

    anchor = Anchor(original=thesis, current=thesis)
    rounds_summary: list[str] = []
    rounds_without_improvement = 0
    form_streak = 0          # сколько атак подряд про форму (критерии/метрики), а не про суть
    had_substance = False    # была ли хоть одна содержательная атака / конкретный кандидат

    _INJECT_LABEL = {"attack": "Атака (человек)", "clarify": "Уточнение рамки (человек)",
                     "alternative": "Альтернативный тезис (человек)", "example": "Проверка примером (человек)"}

    for rnd in range(1, max_rounds + 1):
        yield "round.started", {"debateId": debate_id, "round": rnd}
        if injections is not None:
            injections["round"] = rnd
            injections["thesis"] = anchor.current

        # 0) HUMAN INJECTIONS — из очереди в этот раунд, наравне с атаками ИИ
        attacks: list[dict] = []
        pending = injections.pop("pending", []) if injections is not None else []
        if injections is not None:
            injections["pending"] = []
        for i, inj in enumerate(pending):
            text = (inj.get("text") or "").strip()
            if not _valid_attack(text) or _is_repeat(text, anchor.closed + [a["content"] for a in attacks]):
                yield "human.injection.rejected", {
                    "debateId": debate_id, "round": rnd, "text": text,
                    "reason": "не прошла проверку аргумента (слишком коротко/повтор) — переформулируйте конкретнее",
                }
                continue
            verifier = agents[(rnd + i) % len(agents)]  # закрытие проверяет модель, не пользователь
            attack_id = str(uuid.uuid4())
            attacks.append({"attackId": attack_id, "agent": "HUMAN", "verifier": verifier,
                            "role": _INJECT_LABEL.get(inj.get("type", "attack"), "Аргумент (человек)"),
                            "content": text})
            form_streak = 0
            had_substance = True
            yield "human.injection.applied", {
                "debateId": debate_id, "round": rnd, "type": inj.get("type", "attack"),
                "content": text, "assignedTo": verifier,
                "metadata": {"attackId": attack_id, "author": "human"},
            }

        # 1) АТАКИ — параллельно, эмитим по мере готовности
        async def _attack(agent_id: str, idx: int):
            # Фиксированная роль из roster (если задана) или авто-ротация по раундам.
            role = (roles_map or {}).get(agent_id) or role_for(idx, rnd)
            text, err = await _safe_generate(
                registry[agent_id], prompts.attack_messages(anchor, role, locale, mode),
                max_tokens=400,
            )
            return agent_id, role, text, err

        tasks = [asyncio.create_task(_attack(a, i)) for i, a in enumerate(agents)]
        # Эмитим атаки по мере готовности, но не ждём дольше attack_timeout: одна медленная
        # модель не должна держать весь раунд. Не успевшие — пропускаются в этом раунде.
        try:
            for fut in asyncio.as_completed(tasks, timeout=timeout):
                agent_id, role, text, err = await fut
                if err or not _valid_attack(text):
                    continue
                # не пускаем переформулировку уже закрытой атаки или дубль в этом раунде
                if _is_repeat(text, anchor.closed + [a["content"] for a in attacks]):
                    continue
                attack_id = str(uuid.uuid4())
                attacks.append({"attackId": attack_id, "agent": agent_id, "role": role["name"], "content": text})
                if _is_form_attack(text):
                    form_streak += 1
                else:
                    form_streak = 0
                    had_substance = True
                yield "agent.attack.created", {
                    "debateId": debate_id, "eventId": str(uuid.uuid4()), "roundNumber": rnd,
                    "agent": agent_id, "role": role["name"], "content": text,
                    "metadata": {"attackId": attack_id, "provider": agent_id},
                }
        except asyncio.TimeoutError:
            pass
        finally:
            for t in tasks:
                if not t.done():
                    t.cancel()

        if not attacks:
            yield "round.completed", {"debateId": debate_id, "round": rnd, "survived": 0, "total": 0}
            continue

        # 2) УЛУЧШЕНИЕ — редактор переписывает тезис (3 блока). Если пошла череда критики формы
        # (3+ атаки подряд про критерии/метрики) — форсируем «дай конкретный ответ».
        imp_text, imp_err = await _safe_generate(
            lead, prompts.improve_messages(anchor, [a["content"] for a in attacks], locale, mode,
                                           force_answer=form_streak >= 3),
            max_tokens=1200, json_mode=True, timeout=timeout,
        )
        imp = parse_json(imp_text) or {}
        new_thesis = (imp.get("thesis") or "").strip()
        improved = bool(new_thesis) and new_thesis != anchor.current
        if improved:
            anchor.current = new_thesis
            rounds_without_improvement = 0
        else:
            rounds_without_improvement += 1
        yield "thesis.improved", {
            "debateId": debate_id, "round": rnd, "thesis": anchor.current,
            "agent": getattr(lead, "id", "?"), "role": "Редактор-защитник",
            "changed": imp.get("changed", ""), "closedAttack": imp.get("closedAttack", ""),
            "stillWeak": imp.get("stillWeak", ""),
        }

        # 3) ВЕРИФИКАЦИЯ — по ТЗ КАЖДЫЙ проверяет СВОЮ атаку; human-атаку проверяет назначенная модель
        async def _verify(a: dict):
            checker = registry[a.get("verifier") or a["agent"]]
            text, err = await _safe_generate(
                checker, prompts.verify_own_messages(anchor.current, a["content"], locale),
                max_tokens=200, json_mode=True, timeout=timeout,
            )
            verdict = (parse_json(text) or {}).get("verdict", "partial") if not err else "partial"
            return a, verdict if verdict in ("closed", "partial", "open") else "partial"

        vtasks = [asyncio.create_task(_verify(a)) for a in attacks]
        survived = 0
        verified: set[str] = set()
        try:
            for fut in asyncio.as_completed(vtasks, timeout=timeout):
                a, verdict = await fut
                verified.add(a["attackId"])
                if verdict == "closed":
                    anchor.closed.append(a["content"])
                else:
                    survived += 1
                    anchor.open.append(a["content"])
                yield "attack.verified", {
                    "debateId": debate_id, "attackId": a["attackId"],
                    "agent": a.get("verifier") or a["agent"], "verdict": verdict,
                }
        except asyncio.TimeoutError:
            pass
        finally:
            for t in vtasks:
                if not t.done():
                    t.cancel()
        # атаки без вердикта (модель не успела) — по ТЗ «не закрыто → продолжаем» => open
        for a in attacks:
            if a["attackId"] not in verified:
                survived += 1
                anchor.open.append(a["content"])
                yield "attack.verified", {
                    "debateId": debate_id, "attackId": a["attackId"],
                    "agent": a.get("verifier") or a["agent"], "verdict": "open",
                }

        rounds_summary.append(
            f"Раунд {rnd}: атак {len(attacks)}, выжило {survived}. "
            f"Тезис: {anchor.current[:200]}"
        )
        yield "round.completed", {"debateId": debate_id, "round": rnd, "survived": survived, "total": len(attacks)}

        # Если за 4 раунда так и нет ни одной содержательной атаки (только критика формы) —
        # значит это открытый вопрос, а не тезис: переключаемся в Quantum (генерация ответов).
        if rnd >= 4 and not had_substance:
            yield "mode.switched", {
                "debateId": debate_id, "from": "VERIFY", "to": "QUANTUM",
                "reason": "4 раунда критики формы без конкретного ответа — переходим к генерации ответов",
            }
            from app.engine.quantum import run_quantum  # ленивый импорт: избегаем цикла
            async for name, data in run_quantum(
                debate_id=debate_id, thesis=thesis, models=agents, registry=registry,
                locale=locale, attack_timeout=timeout, injections=injections,
            ):
                if name == "debate.started":
                    continue  # уже был один debate.started; переход обозначен mode.switched
                yield name, data
            return

        # Стоп-условия (CONVERGENT): тезис выдержал все атаки, либо 3 раунда без улучшения
        if survived == 0:
            break
        if rounds_without_improvement >= 3:
            break

    # ФИНАЛ — сборка сводки возможностей. Заземляем оценку фактами дебата (закрыто/открыто).
    summary = "\n".join(rounds_summary) + (
        f"\nИТОГО по дебату: атак закрыто = {len(anchor.closed)}, осталось открытыми = {len(anchor.open)}."
    )
    fin_text, _ = await _safe_generate(
        lead, prompts.final_messages(thesis, anchor.current, summary, locale, mode),
        max_tokens=1500, json_mode=True, timeout=timeout,
    )
    final = _normalize_final(parse_json(fin_text), anchor.current)
    yield "debate.completed", {"debateId": debate_id, "thesis": anchor.current, "final": final}


def _normalize_final(raw: dict | None, current: str) -> dict:
    raw = raw or {}

    def as_list(key: str) -> list[str]:
        v = raw.get(key)
        return [str(x) for x in v] if isinstance(v, list) else []

    try:
        score = int(float(raw.get("opportunityScore", 0)))
    except (TypeError, ValueError):
        score = 0
    return {
        "opportunityScore": max(0, min(100, score)),
        "conclusion": str(raw.get("conclusion") or ""),
        "childQuestions": as_list("childQuestions"),
        "researchGaps": as_list("researchGaps"),
        "crossDomainHypotheses": as_list("crossDomainHypotheses"),
        "profitPatterns": as_list("profitPatterns"),
        "fundingBranches": as_list("fundingBranches"),
    }
