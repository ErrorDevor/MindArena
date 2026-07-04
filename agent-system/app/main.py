"""Agent System — HTTP-интерфейс, к которому обращается бэкенд.

Запуск (из каталога agent-system, с активированным venv):
    uvicorn app.main:app --reload --port 8000

Контракт SSE-событий совпадает с тем, что уже умеет рисовать фронтенд.
/debates/run гоняет реальный движок VERIFY (engine/verify.py).
"""
from __future__ import annotations

import asyncio
import json
import logging
import re
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from app import prompt_registry
from app.config import configured_models, settings
from app.engine import prompts
from app.engine.jsonutil import parse_json
from app.engine.mode import detect_mode
from app.engine.quantum import run_quantum
from app.engine.roles import ROLES, resolve_role
from app.engine.verify import _pick_lead, _safe_generate, run_verify
from app.providers.base import LLMMessage
from app.providers.registry import build_registry

_API_DESCRIPTION = """
Сервис консилиума LLM для MindArena. Бэкенд обращается сюда, чтобы согласовать тему, запустить дебат
нескольких моделей и получить ход рассуждений.

### Авторизация
Все эндпоинты (кроме `GET /health`, `GET /roles` и корня) требуют заголовок `X-Agent-Key` с общим секретом
(`AGENT_SYSTEM_API_KEY` из окружения сервиса). Без него — `401`.

### Как обычно ходит бэкенд
1. (опц.) `POST /debates/ping` + `GET /debates/ping/{id}` — проверить, какие модели живы.
2. `POST /debates/intake` — разговорный приёмщик: ведёт пользователя, согласует тему (пока `ready=false`).
3. Когда `ready=true` — запустить дебат: `POST /debates/start` (опрос через `GET /debates/{id}/events`)
   ИЛИ `POST /debates/run` (SSE-поток).
4. (опц.) `POST /debates/baseline` — ответ одной модели «в один промпт» для сравнения.

### Режимы и состав
`strategy`: `VERIFY` (петля истины) или `QUANTUM` (перебор идей). Для VERIFY `mode`:
`CONVERGENT` / `DIVERGENT` / `GEOPOLITICAL`. Состав — `models` (список id) или `participants`
(кто какую роль занимает; роли — из `GET /roles`).
"""

tags_metadata = [
    {"name": "дебаты", "description": "Запуск и получение хода дебатов, приёмщик, baseline."},
    {"name": "служебные", "description": "Живость сервиса и моделей, список ролей."},
]

app = FastAPI(
    title="MindArena Agent System",
    version="0.2.0",
    description=_API_DESCRIPTION,
    openapi_tags=tags_metadata,
    contact={"name": "MindArena agent-system"},
)

# Логи: консоль + logs/agent.log
_LOG_DIR = Path(__file__).resolve().parent.parent / "logs"
_LOG_DIR.mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s | %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(_LOG_DIR / "agent.log", encoding="utf-8"),
    ],
)
log = logging.getLogger("mindarena")


def _brief(data: dict) -> str:
    """Короткая сводка события для лога (без простыней текста)."""
    keep = {k: data[k] for k in ("agent", "role", "round", "roundNumber", "verdict", "survived", "total", "reason") if k in data}
    if "thesis" in data:
        keep["thesis"] = str(data["thesis"])[:80]
    if "content" in data:
        keep["content"] = str(data["content"])[:80]
    return ", ".join(f"{k}={v}" for k, v in keep.items())

# CORS включаем только если задан CORS_ORIGINS (для локального HTML-демо). В проде пусто = выключено.
if settings.cors_origins:
    _origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Дефолтный состав консилиума (переопределяется полем models/participants в запросе).
DEFAULT_CONSILIUM = ["CLAUDE", "KIMI", "DEEPSEEK"]

MIN_THESIS_WORDS = 3  # пред-старт: слишком короткий ввод не запускаем

# На корне отдаём локальное демо, если оно есть (в прод-образ не входит), иначе JSON-справку.
_DEMO_INDEX = Path(__file__).resolve().parent.parent / "demo" / "index.html"


@app.get("/", tags=["служебные"], summary="Локальное демо (или JSON-справка в проде)", include_in_schema=False)
async def root():
    if _DEMO_INDEX.exists():
        return FileResponse(_DEMO_INDEX)
    return {"service": "MindArena Agent System", "health": "/health", "openapi": "/docs"}


def _validate_thesis(thesis: str) -> str | None:
    """Пред-старт «стоит ли запускать дебат». Возвращает причину отказа или None (ок)."""
    t = (thesis or "").strip()
    if len(t) < 8 or len(t.split()) < MIN_THESIS_WORDS:
        return "Слишком короткий ввод — сформулируйте тезис или вопрос (хотя бы несколько слов)."
    return None


# Порядок выбора модели приёмщика (переопределяется INTAKE_MODEL в env; фолбэк при пустом ответе).
_INTAKE_PREFERENCE = ["CLAUDE", "KIMI", "DEEPSEEK", "GLM", "GPT", "GEMINI"]


# Вырезаем из message артефакты вида foo["bar"] = "..."; — там должен быть только текст.
_CODE_ARTIFACT = re.compile(r'[\w.]*\[\s*["\'][^"\']*["\']\s*\]\s*=\s*["\'][^"\']*["\']\s*;?')


def _clean_intake_message(msg: str) -> str:
    msg = _CODE_ARTIFACT.sub(" ", msg)
    return re.sub(r"\s{2,}", " ", msg).strip()


def _intake_order(registry: dict, requested: str | None) -> list[str]:
    """Порядок кандидатов: явная модель из запроса → из env → преференс. Только те, что в реестре."""
    order: list[str] = []
    for pid in [requested, settings.intake_model, *_INTAKE_PREFERENCE]:
        if pid and pid in registry and pid not in order:
            order.append(pid)
    return order


_VERIFY_SUBTYPES = ("CONVERGENT", "DIVERGENT", "GEOPOLITICAL")
_QUANTUM_SUBTYPES = ("IDEAS", "MECHANISMS", "SOLUTIONS", "ANOMALIES")
_CLASSIFY_BORDERLINE = 0.6


async def _classify(thesis: str, registry: dict, locale: str = "ru") -> dict:
    """Определяет режим по ТЗ дешёвой моделью; при сбое — эвристика engine/mode.py.

    Возвращает: strategy (VERIFY|QUANTUM), mode (подтип VERIFY), exploreType (подтип QUANTUM),
    confidence, borderline (низкая уверенность → показать переключатель), reason, by.
    """
    for pid in _intake_order(registry, settings.classify_model or None):
        text, err = await _safe_generate(
            registry[pid], prompts.classify_messages(thesis, locale),
            max_tokens=150, json_mode=True, timeout=30,
        )
        if err:
            continue
        d = parse_json(text) or {}
        strat = str(d.get("strategy", "")).upper()
        if strat not in ("VERIFY", "QUANTUM"):
            continue
        sub = str(d.get("subtype", "")).upper()
        try:
            conf = max(0.0, min(1.0, float(d.get("confidence", 0))))
        except (TypeError, ValueError):
            conf = 0.0
        mode = sub if (strat == "VERIFY" and sub in _VERIFY_SUBTYPES) else "CONVERGENT"
        explore = sub if (strat == "QUANTUM" and sub in _QUANTUM_SUBTYPES) else ""
        log.info("[classify] %s/%s conf=%.2f моделью %s", strat, sub or "-", conf, pid)
        return {
            "strategy": strat, "mode": mode, "exploreType": explore,
            "confidence": conf, "borderline": conf < _CLASSIFY_BORDERLINE,
            "reason": str(d.get("reason", "")), "by": pid,
        }
    strat, reason = detect_mode(thesis)   # фолбэк: ключевые слова
    return {
        "strategy": strat, "mode": "CONVERGENT", "exploreType": "",
        "confidence": 0.0, "borderline": True, "reason": reason + " (эвристика)", "by": "heuristic",
    }


class Participant(BaseModel):
    model: str          # id агента (см. GET /roles → availableModels в /health): CLAUDE, KIMI, DEEPSEEK, ...
    role: str = ""      # id роли из GET /roles (strategist/architect/...) ИЛИ произвольная метка; "" = авто


class RunRequest(BaseModel):
    thesis: str = Field(description="Тема или тезис пользователя")
    strategy: str = Field("VERIFY", description="VERIFY (петля критики) | QUANTUM (перебор идей). Пустая строка \"\" = авто-определение по ТЗ")
    mode: str = Field("CONVERGENT", description="Подтип VERIFY: CONVERGENT | DIVERGENT | GEOPOLITICAL")
    maxRounds: int = Field(settings.debate_max_rounds, description="VERIFY: число раундов (1–10)")
    models: list[str] = Field(default=DEFAULT_CONSILIUM, description="Состав консилиума по id; модели без ключа отсеиваются")
    participants: list[Participant] | None = Field(None, description="[{model, role}] — кто какую роль занимает; перекрывает models")
    attackTimeoutSeconds: int | None = Field(None, description="Ожидание ответов в раунде/поколении, сек (5–300; иначе из env)")
    quantumGenerations: int | None = Field(None, description="QUANTUM: число поколений (1–6; иначе из env)")
    quantumBranchesPerGen: int | None = Field(None, description="QUANTUM: веток за поколение (2–60; иначе из env)")
    quantumTopK: int | None = Field(None, description="QUANTUM: сколько лучших проходит дальше (1–20; иначе из env)")
    debateId: str | None = Field(None, description="Id на стороне бэкенда; если нет — сгенерируется")
    budgetUsd: float | None = Field(None, description="Потолок стоимости (пока не форсится)")
    locale: str = Field("ru", description="Язык вывода агентов")


def _resolve_roster(req: "RunRequest", registry: dict) -> tuple[list[str], dict | None]:
    """Возвращает (список моделей, карту ролей). Если заданы participants — берём их состав и роли."""
    if req.participants:
        models = [p.model for p in req.participants]
        roles_map = {p.model: resolve_role(p.role) for p in req.participants if p.role}
    else:
        models, roles_map = req.models, None
    available = [m for m in models if m in registry]
    roles_map = {m: r for m, r in (roles_map or {}).items() if m in available} or None
    return available, roles_map


def _tuning(req: "RunRequest") -> dict:
    """Параметры движка из запроса с лимитами (иначе — дефолты из env)."""
    def clip(v, lo, hi):
        return max(lo, min(hi, int(v))) if v else None
    return {
        "max_rounds": max(1, min(10, int(req.maxRounds))),
        "attack_timeout": clip(req.attackTimeoutSeconds, 5, 300),
        "q_generations": clip(req.quantumGenerations, 1, 6),
        "q_branches": clip(req.quantumBranchesPerGen, 2, 60),
        "q_top_k": clip(req.quantumTopK, 1, 20),
    }


class DetectRequest(BaseModel):
    thesis: str
    models: list[str] = DEFAULT_CONSILIUM
    maxRounds: int = settings.debate_max_rounds


class DetectResponse(BaseModel):
    canRun: bool = Field(description="Можно ли запускать: ввод осмыслен и есть хотя бы одна модель с ключом")
    reason: str = Field(description="Причина отказа либо объяснение выбранного режима")
    strategy: str = Field(description="VERIFY (проверить утверждение) или QUANTUM (открытый вопрос → генерировать ответы)")
    mode: str = Field(description="Подтип VERIFY: CONVERGENT | DIVERGENT | GEOPOLITICAL")
    exploreType: str = Field(description="Подтип QUANTUM: IDEAS | MECHANISMS | SOLUTIONS | ANOMALIES (пусто для VERIFY)")
    confidence: float = Field(description="Уверенность классификатора 0–1")
    borderline: bool = Field(description="Низкая уверенность → покажите переключатель на alternative")
    alternative: str = Field(description="Другой режим для переключателя (VERIFY↔QUANTUM)")
    classifiedBy: str = Field(description="Какая модель классифицировала режим (или 'heuristic' при фолбэке)")
    availableModels: list[str] = Field(description="Реально поднятые модели, которыми пойдёт дебат")
    estimatedCostUsd: float = Field(description="Грубая оценка стоимости, уточняется по факту")
    estimatedRounds: int


class BaselineRequest(BaseModel):
    thesis: str
    model: str | None = None  # какой моделью считать baseline; по умолчанию — ведущая
    locale: str = "ru"


class ChatMsg(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class IntakeRequest(BaseModel):
    messages: list[ChatMsg]        # весь диалог приёмщика; память передаёт бэкенд
    locale: str = "ru"
    model: str | None = None       # каким агентом вести приём; по умолчанию — дешёвый
    strategy: str = "VERIFY"       # выбранный тип: VERIFY | QUANTUM — приёмщик ведёт под него
    mode: str = "CONVERGENT"       # CONVERGENT | DIVERGENT | GEOPOLITICAL (для VERIFY)


def _check_auth(x_agent_key: str | None) -> None:
    if x_agent_key != settings.agent_system_api_key:
        raise HTTPException(status_code=401, detail="bad agent key")


def _estimate_cost(strategy: str, n_models: int, max_rounds: int) -> float:
    """Грубая пред-запускная оценка стоимости в USD (уточняется по факту)."""
    if strategy == "QUANTUM":
        per_gen = settings.quantum_branches_per_gen * 0.001 + settings.quantum_top_k * 0.30
        return round(settings.quantum_max_generations * per_gen, 2)
    return round(max(n_models, 1) * max_rounds * 0.02, 2)


@app.get("/health", tags=["служебные"], summary="Живость сервиса и состав моделей")
async def health() -> dict:
    return {
        "status": "ok",
        "models": configured_models(),          # у кого есть ключ (true/false)
        "registry": list(build_registry().keys()),  # какие агенты подняты в рантайме
    }


@app.get("/roles", tags=["служебные"], summary="Доступные роли-линзы для участников дебата")
async def roles() -> dict:
    """Список ролей консилиума. `id` можно передавать в `participants[].role` для `/debates/run` и
    `/debates/start`. Если роль не задать — движок сам ротирует роли по раундам."""
    return {"roles": [{"id": r["id"], "name": r["name"], "lens": r["lens"]} for r in ROLES]}


@app.get("/prompts", tags=["служебные"], summary="Эффективные промпты агентов и схема переопределения")
async def prompts_view(x_agent_key: str | None = Header(default=None)) -> dict:
    """Все промпты агентов: текущий текст, источник (default/override) и допустимые $плейсхолдеры.

    Переопределение: задать `PROMPTS_URL` в env сервиса — GET по нему должен вернуть JSON
    `{"prompts": {"<ключ>": "<текст>", ...}}` (ключи из этого ответа). Неизвестные ключи игнорируются.
    Если URL недоступен/вернул мусор — работают дефолты. Кэш обновляется раз в PROMPTS_TTL_SECONDS.
    """
    _check_auth(x_agent_key)
    await prompt_registry.ensure_fresh()
    return {
        "promptsUrl": settings.prompts_url or None,
        "ttlSeconds": settings.prompts_ttl_seconds,
        "overridesLoaded": prompt_registry.overrides_count(),
        "prompts": {
            key: {
                "text": prompt_registry.get(key),
                "source": prompt_registry.source(key),
                "placeholders": prompt_registry.PLACEHOLDERS.get(key, []),
            }
            for key in prompt_registry.DEFAULTS
        },
    }


@app.post("/debates/detect", tags=["дебаты"], summary="Пред-старт: режим, стоимость, можно ли запускать",
          response_model=DetectResponse)
async def detect(req: DetectRequest, x_agent_key: str | None = Header(default=None)) -> dict:
    """Пред-запускной экран: определяет режим (Verify/Explore + подтип), стоимость, можно ли запускать.

    Классификация — дешёвой моделью по ТЗ; при низкой уверенности `borderline=true` (фронт показывает
    переключатель Verify↔Explore). Дебат НЕ запускается.
    """
    _check_auth(x_agent_key)
    await prompt_registry.ensure_fresh()
    reject = _validate_thesis(req.thesis)
    registry = build_registry()
    available = [m for m in req.models if m in registry]
    cls = await _classify(req.thesis, registry, "ru") if available else None
    strategy = cls["strategy"] if cls else "VERIFY"
    return {
        "canRun": reject is None and bool(available),
        "reason": reject or (cls["reason"] if cls else "нет доступных моделей (проверь ключи)"),
        "strategy": strategy,
        "mode": cls["mode"] if cls else "CONVERGENT",
        "exploreType": cls["exploreType"] if cls else "",
        "confidence": cls["confidence"] if cls else 0.0,
        "borderline": cls["borderline"] if cls else True,
        "alternative": ("QUANTUM" if strategy == "VERIFY" else "VERIFY"),
        "classifiedBy": cls["by"] if cls else "",
        "availableModels": available,
        "estimatedCostUsd": _estimate_cost(strategy, len(available), req.maxRounds),
        "estimatedRounds": req.maxRounds,
    }


@app.post("/debates/baseline", tags=["дебаты"], summary="Ответ одной модели «в один промпт» (для сравнения)")
async def baseline(req: BaselineRequest, x_agent_key: str | None = Header(default=None)) -> dict:
    """Наивный «один промпт» одной моделью — эталон для сравнения с результатом консилиума."""
    _check_auth(x_agent_key)
    await prompt_registry.ensure_fresh()
    reject = _validate_thesis(req.thesis)
    if reject:
        raise HTTPException(status_code=400, detail=reject)
    registry = build_registry()
    provider = registry.get(req.model) if req.model else _pick_lead(registry)
    if provider is None:
        raise HTTPException(status_code=400, detail="нет доступных моделей (проверь ключи)")
    text, err = await _safe_generate(
        provider, prompts.baseline_messages(req.thesis, req.locale), max_tokens=600, timeout=60,
    )
    if err:
        raise HTTPException(status_code=502, detail=err)
    return {"model": getattr(provider, "id", req.model or "?"), "answer": text}


@app.post("/debates/intake", tags=["дебаты"], summary="Разговорный приёмщик: согласовать тему до запуска")
async def intake(req: IntakeRequest, x_agent_key: str | None = Header(default=None)) -> dict:
    """Разговорный приёмщик: дешёвая модель ведёт юзера и согласует тему ДО запуска.

    Бэкенд шлёт весь диалог (`messages`), получает `ready` + реплику пользователю. Пока `ready=false`
    — показывает `message`, берёт ответ юзера, зовёт снова. Когда `ready=true` — запускает `/debates/run`
    с согласованным `thesis`. Память = переданная история, сервис состояния не хранит.
    """
    _check_auth(x_agent_key)
    await prompt_registry.ensure_fresh()
    if not req.messages or req.messages[-1].role != "user":
        raise HTTPException(status_code=422, detail="messages пуст или последний ход не от пользователя")
    registry = build_registry()
    order = _intake_order(registry, req.model)
    if not order:
        raise HTTPException(status_code=400, detail="нет доступных моделей (проверь ключи)")

    history = [LLMMessage(m.role, m.content) for m in req.messages]
    msgs = prompts.intake_messages(history, req.locale, req.strategy, req.mode)

    # Пробуем модели по порядку: если модель вернула ошибку или пустой ответ — берём следующую.
    data: dict = {}
    used: str | None = None
    for pid in order:
        text, err = await _safe_generate(registry[pid], msgs, max_tokens=700, json_mode=True, timeout=45)
        if err:
            continue
        parsed = parse_json(text) or {}
        if str(parsed.get("message") or "").strip():
            data, used = parsed, pid
            break
    if used is None:
        raise HTTPException(status_code=502, detail="приёмщик не смог ответить (проверь ключи моделей)")

    thesis = str(data.get("thesis") or "").strip()
    ready = bool(data.get("ready")) and bool(thesis)
    # Стратегию задаёт пользователь (селектор), не приёмщик. Если пусто — авто по тезису.
    strategy = (req.strategy or "").upper() or (detect_mode(thesis)[0] if thesis else "")
    message = _clean_intake_message(str(data.get("message") or "").strip())
    if not message:  # модель иногда отдаёт пусто или мусор — не показываем юзеру пустоту
        message = (f"Запускаю по теме: «{thesis}»." if ready
                   else "Уточни, пожалуйста, какую тему или вопрос ты хочешь обсудить?")
    return {
        "ready": ready,
        "message": message,
        "thesis": thesis,
        "strategy": strategy,
        "mode": (req.mode or "CONVERGENT").upper(),
        "model": used,
    }


# Проверка живости моделей: старт + опрос по checkId. Хранится в памяти ~5 мин.
_PINGS: dict[str, dict] = {}
_PING_TTL = 300
_PING_PROMPT = "Ответь одним словом: ок"
_PING_TIMEOUT = 60  # если модель не ответила за 60с — смысла ждать нет, помечаем ошибкой


async def _ping_one(check_id: str, agent_id: str, provider) -> None:
    """Маленький запрос — проверяем, что модель реально отвечает, и сохраняем сам ответ/ошибку."""
    t0 = time.perf_counter()
    try:
        res = await asyncio.wait_for(
            provider.generate([LLMMessage("user", _PING_PROMPT)], max_tokens=16),
            timeout=_PING_TIMEOUT,
        )
        ok: bool = True
        detail = (res.text or "").strip()[:80] or "(пустой ответ)"
    except asyncio.TimeoutError:
        ok, detail = False, f"нет ответа за {_PING_TIMEOUT}с"
    except Exception as e:  # noqa: BLE001
        ok, detail = False, f"{type(e).__name__}: {e}"[:120]
    entry = _PINGS.get(check_id)
    if entry is not None:
        entry["models"][agent_id] = ok
        entry["latency"][agent_id] = round(time.perf_counter() - t0, 1)
        entry["response"][agent_id] = detail
    log.info("[ping %s] %s -> %s (%.1fс): %s", check_id[:8], agent_id, ok,
             time.perf_counter() - t0, detail)


def _gc_pings() -> None:
    now = time.time()
    for k in [k for k, v in _PINGS.items() if now - v["ts"] > _PING_TTL]:
        _PINGS.pop(k, None)


@app.post("/debates/ping", tags=["дебаты"], summary="Проверка живости всех моделей (старт, вернёт checkId)")
async def ping_start(x_agent_key: str | None = Header(default=None)) -> dict:
    """Пингует ВСЕ модели с ключами крошечным запросом и сразу отдаёт checkId + статусы pending."""
    _check_auth(x_agent_key)
    _gc_pings()
    registry = build_registry()
    if not registry:
        raise HTTPException(status_code=400, detail="нет моделей с ключами")
    check_id = str(uuid.uuid4())
    entry = {
        "models": {m: "pending" for m in registry},
        "latency": {},
        "response": {},
        "ts": time.time(),
        "tasks": [],
    }
    _PINGS[check_id] = entry
    entry["tasks"] = [asyncio.create_task(_ping_one(check_id, m, p)) for m, p in registry.items()]
    log.info("[ping %s] START, моделей: %s, отправляем: %r", check_id[:8], list(registry), _PING_PROMPT)
    return {"checkId": check_id, "done": False, "sent": _PING_PROMPT, "models": entry["models"]}


@app.get("/debates/ping/{check_id}", tags=["дебаты"], summary="Опрос статуса пинга по checkId")
async def ping_status(check_id: str, x_agent_key: str | None = Header(default=None)) -> dict:
    """Опрос по checkId: карта модель -> true (ответила) | false (ошибка) | "pending" (ещё ждём)."""
    _check_auth(x_agent_key)
    entry = _PINGS.get(check_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="неизвестный checkId (возможно, истёк)")
    models = entry["models"]
    done = all(v != "pending" for v in models.values())
    return {
        "checkId": check_id, "done": done, "sent": _PING_PROMPT,
        "models": models, "latency": entry["latency"], "response": entry["response"],
    }


@app.post("/debates/run", tags=["дебаты"], summary="Запустить дебат, стримить ход через SSE")
async def run_debate(req: RunRequest, x_agent_key: str | None = Header(default=None)):
    """Запускает реальный дебат и стримит ход как SSE."""
    _check_auth(x_agent_key)
    await prompt_registry.ensure_fresh()
    reject = _validate_thesis(req.thesis)
    if reject:
        raise HTTPException(status_code=400, detail=reject)
    registry = build_registry()
    available, roles_map = _resolve_roster(req, registry)
    if not available:
        raise HTTPException(status_code=400, detail="нет доступных моделей (проверь ключи)")

    debate_id = req.debateId or str(uuid.uuid4())
    strategy, mode = (req.strategy or "").upper(), req.mode
    if not strategy:                          # авто-определение режима по ТЗ
        cls = await _classify(req.thesis, registry, req.locale)
        strategy, mode = cls["strategy"], cls["mode"]

    tuning = _tuning(req)
    injections = _register_injections(debate_id, strategy)
    log.info("[%s] debate START strategy=%s mode=%s models=%s roster=%s tuning=%s",
             debate_id, strategy, mode, available, bool(roles_map), tuning)

    async def event_gen():
        # Стартовый паддинг ~2КБ: пробивает буфер браузера, который иначе копит поток до конца.
        yield {"comment": "-" * 2048}
        n = 0
        try:
            async for name, data in _engine_stream(
                debate_id, req.thesis, mode, strategy, available, registry, req.locale, roles_map, tuning, injections,
            ):
                n += 1
                log.info("[%s] event #%d %s | %s", debate_id, n, name, _brief(data))
                yield _evt(name, data)
            log.info("[%s] debate STREAM DONE (%d событий)", debate_id, n)
        except Exception as e:  # noqa: BLE001
            log.exception("[%s] debate FAILED после %d событий", debate_id, n)
            yield _evt("debate.failed", {"debateId": debate_id, "reason": f"{type(e).__name__}: {e}"})
        finally:
            injections["done"] = True

    return EventSourceResponse(
        event_gen(),
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache, no-transform"},
    )


def _evt(event: str, data: dict) -> dict:
    return {"event": event, "data": json.dumps(data, ensure_ascii=False)}


def _engine_stream(debate_id, thesis, mode, strategy, models, registry, locale, roles_map, tuning, injections=None):
    """Выбирает движок по стратегии: QUANTUM (дерево идей) или VERIFY (петля истины)."""
    if (strategy or "").upper() == "QUANTUM":
        return run_quantum(
            debate_id=debate_id, thesis=thesis, models=models, registry=registry, locale=locale,
            max_generations=tuning["q_generations"] or tuning["max_rounds"],
            branches_per_gen=tuning["q_branches"], top_k=tuning["q_top_k"],
            attack_timeout=tuning["attack_timeout"], injections=injections,
        )
    return run_verify(
        debate_id=debate_id, thesis=thesis, mode=mode, models=models,
        max_rounds=tuning["max_rounds"], registry=registry, locale=locale,
        roles_map=roles_map, attack_timeout=tuning["attack_timeout"], injections=injections,
    )


# --- Human injection: очередь комментариев пользователя в идущий дебат ---
# Комментарий классифицируется дешёвой моделью (attack/clarify/alternative/example/redirect/noise)
# и входит в СЛЕДУЮЩИЙ раунд (VERIFY) или поколение (QUANTUM) наравне с ходами моделей.
_INJECT: dict[str, dict] = {}


def _register_injections(debate_id: str, strategy: str) -> dict:
    entry = {"pending": [], "round": 0, "generation": 0, "thesis": "",
             "strategy": strategy, "done": False, "ts": time.time()}
    _INJECT[debate_id] = entry
    return entry


def _gc_injections() -> None:
    now = time.time()
    for k in [k for k, v in _INJECT.items() if v.get("done") and now - v["ts"] > _DEBATE_TTL]:
        _INJECT.pop(k, None)


_INJECT_TYPES = ("attack", "clarify", "alternative", "example", "redirect", "noise")


class InjectRequest(BaseModel):
    text: str = Field(description="Свободный текст комментария пользователя (тип определит система)")


@app.post("/debates/{debate_id}/inject", tags=["дебаты"],
          summary="Human injection: комментарий пользователя в идущий дебат")
async def inject(debate_id: str, req: InjectRequest, x_agent_key: str | None = Header(default=None)) -> dict:
    """Комментарий классифицируется лёгкой моделью и встаёт в очередь на ближайший раунд/поколение.

    Ответ: `status` = `queued` (принят, поле `willApplyRound`/`willApplyGeneration`) или
    `rejected` (noise/слишком коротко — показать пользователю `reason` и попросить переформулировать).
    Если дебат уже завершён — 409. Тип определяется автоматически: attack / clarify / alternative /
    example (redirect в MVP приравнен к alternative). В петле аргумент помечен author=human, отвечает
    на него редактор, а закрытие проверяет назначенная модель (не пользователь).
    """
    _check_auth(x_agent_key)
    entry = _INJECT.get(debate_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="неизвестный debateId (возможно, истёк)")
    if entry["done"]:
        raise HTTPException(status_code=409, detail="дебат уже завершён — инъекция не применена")

    text = (req.text or "").strip()
    if len(text) < 15:
        return {"status": "rejected", "reason": "слишком коротко — сформулируйте аргумент конкретнее"}

    registry = build_registry()
    inj_type, reason = "attack", ""
    for pid in _intake_order(registry, None):
        out, err = await _safe_generate(
            registry[pid], prompts.inject_classify_messages(text, entry.get("thesis", "")),
            max_tokens=100, json_mode=True, timeout=20,
        )
        if err:
            continue
        d = parse_json(out) or {}
        t = str(d.get("type", "")).lower()
        if t in _INJECT_TYPES:
            inj_type, reason = t, str(d.get("reason", ""))
            break

    if inj_type == "noise":
        return {"status": "rejected",
                "reason": reason or "не удалось встроить как аргумент — попробуйте конкретнее"}
    if inj_type == "redirect":
        inj_type = "alternative"  # MVP: полноценный redirect с архивацией веток — позже

    entry["pending"].append({"text": text, "type": inj_type, "author": "human"})
    is_quantum = entry["strategy"] == "QUANTUM"
    result = {"status": "queued", "type": inj_type, "author": "human"}
    if is_quantum:
        result["willApplyGeneration"] = entry["generation"] + 1
    else:
        result["willApplyRound"] = entry["round"] + 1
    log.info("[%s] inject queued type=%s: %s", debate_id, inj_type, text[:80])
    return result


# --- Дебат через ОПРОС (для браузеров, где SSE-поток буферизуется) ---
# Дебат крутится в фоне и копит события; фронт забирает их по debateId батчами (GET ?since=N).
# Не зависит от буферизации потока и от живости соединения.
# Кэш активных/недавних дебатов. Персистентность и история — на стороне бэкенда (он релеит и хранит события).
_DEBATES: dict[str, dict] = {}
_DEBATE_TTL = 3600


def _gc_debates() -> None:
    # Выселяем ТОЛЬКО завершённые дебаты; активные не трогаем никогда.
    now = time.time()
    for k in [k for k, v in _DEBATES.items() if v.get("done") and now - v["ts"] > _DEBATE_TTL]:
        _DEBATES.pop(k, None)


async def _run_debate_bg(debate_id, thesis, mode, strategy, models, registry, locale, roles_map, tuning, injections) -> None:
    entry = _DEBATES[debate_id]
    log.info("[%s] debate START (poll) strategy=%s models=%s roster=%s tuning=%s", debate_id, strategy, models, bool(roles_map), tuning)
    n = 0
    try:
        async for name, data in _engine_stream(
            debate_id, thesis, mode, strategy, models, registry, locale, roles_map, tuning, injections,
        ):
            n += 1
            log.info("[%s] event #%d %s | %s", debate_id, n, name, _brief(data))
            entry["events"].append({"event": name, "data": data})
        log.info("[%s] debate DONE (%d событий)", debate_id, n)
    except Exception as e:  # noqa: BLE001
        log.exception("[%s] debate FAILED после %d событий", debate_id, n)
        entry["events"].append({"event": "debate.failed", "data": {"debateId": debate_id, "reason": f"{type(e).__name__}: {e}"}})
    finally:
        entry["done"] = True
        injections["done"] = True


@app.post("/debates/start", tags=["дебаты"], summary="Запустить дебат в фоне (для опроса), вернуть debateId")
async def debate_start(req: RunRequest, x_agent_key: str | None = Header(default=None)) -> dict:
    """Запускает дебат в фоне и сразу отдаёт debateId. Ход забирать через GET /debates/{id}/events."""
    _check_auth(x_agent_key)
    await prompt_registry.ensure_fresh()
    reject = _validate_thesis(req.thesis)
    if reject:
        raise HTTPException(status_code=400, detail=reject)
    registry = build_registry()
    available, roles_map = _resolve_roster(req, registry)
    if not available:
        raise HTTPException(status_code=400, detail="нет доступных моделей (проверь ключи)")
    _gc_debates()
    _gc_injections()
    debate_id = req.debateId or str(uuid.uuid4())
    strategy, mode = (req.strategy or "").upper(), req.mode
    if not strategy:                          # авто-определение режима по ТЗ
        cls = await _classify(req.thesis, registry, req.locale)
        strategy, mode = cls["strategy"], cls["mode"]
    entry = {"events": [], "done": False, "ts": time.time(), "task": None}
    _DEBATES[debate_id] = entry
    injections = _register_injections(debate_id, strategy)
    entry["task"] = asyncio.create_task(
        _run_debate_bg(debate_id, req.thesis, mode, strategy, available, registry, req.locale, roles_map, _tuning(req), injections)
    )
    roster = [
        {"model": m, "role": ((roles_map or {}).get(m, {}).get("name")) or "авто (ротация)"}
        for m in available
    ]
    return {"debateId": debate_id, "strategy": strategy, "models": available, "roster": roster}


@app.get("/debates/{debate_id}/events", tags=["дебаты"], summary="Новые события дебата с индекса since (опрос)")
async def debate_events(debate_id: str, since: int = 0, x_agent_key: str | None = Header(default=None)) -> dict:
    """Новые события дебата начиная с индекса `since`. Опрашивать раз в ~0.7с, пока `done=false`."""
    _check_auth(x_agent_key)
    entry = _DEBATES.get(debate_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="неизвестный debateId (возможно, истёк)")
    since = max(0, since)
    return {
        "debateId": debate_id,
        "done": entry["done"],
        "events": entry["events"][since:],
        "nextIndex": len(entry["events"]),
    }
