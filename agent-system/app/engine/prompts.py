"""Промпты движков: intake, classify, baseline, VERIFY (attack/improve/verify/final), QUANTUM, inject.

Тексты системных промптов живут в app/prompt_registry.py (дефолты в коде, переопределения по
PROMPTS_URL). Здесь — сборка сообщений с подстановкой переменных.
"""
from __future__ import annotations

from app import prompt_registry as reg
from app.engine.memory import Anchor
from app.providers.base import LLMMessage

_LANG = {"ru": "русском", "en": "английском"}


def _lang(locale: str) -> str:
    return _LANG.get(locale, "русском")


def _mode_key(prefix: str, mode: str) -> str:
    m = (mode or "CONVERGENT").upper()
    key = f"{prefix}.mode.{m}"
    return key if key in reg.DEFAULTS else f"{prefix}.mode.CONVERGENT"


def classify_messages(thesis: str, locale: str = "ru") -> list[LLMMessage]:
    """Классификатор режима (ТЗ Блок H2/I2, Часть 4): Verify/Quantum + подтип + уверенность."""
    return [
        LLMMessage("system", reg.get("classify.system")),
        LLMMessage("user", f"ТЕМА/ВОПРОС: {thesis}"),
    ]


def intake_messages(history: list[LLMMessage], locale: str = "ru",
                    strategy: str = "VERIFY", mode: str = "CONVERGENT") -> list[LLMMessage]:
    """Приёмщик: модель ведёт юзера и согласует тему ДО запуска дебата, с учётом выбранного режима."""
    type_key = "QUANTUM" if (strategy or "").upper() == "QUANTUM" else (mode or "CONVERGENT").upper()
    mode_ctx = reg.get(f"intake.mode.{type_key}" if f"intake.mode.{type_key}" in reg.DEFAULTS
                       else "intake.mode.CONVERGENT")
    system = reg.get("intake.system", mode_ctx=mode_ctx, lang=_lang(locale))
    return [LLMMessage("system", system), *history]


def baseline_messages(thesis: str, locale: str = "ru") -> list[LLMMessage]:
    """Наивный «один промпт» — то, с чем сравниваем результат консилиума (ТЗ Часть 1)."""
    system = reg.get("baseline.system", lang=_lang(locale))
    return [LLMMessage("system", system), LLMMessage("user", f"ТЕЗИС: {thesis}\n\nТвой ответ одним проходом:")]


def attack_messages(anchor: Anchor, role: dict[str, str], locale: str = "ru", mode: str = "CONVERGENT") -> list[LLMMessage]:
    system = reg.get(
        "attack.system",
        role_name=role["name"], lens=role["lens"],
        mode_rule=reg.get(_mode_key("attack", mode)), lang=_lang(locale),
    )
    user = anchor.render() + "\n\nСформулируй одну новую конкретную атаку на текущую версию."
    return [LLMMessage("system", system), LLMMessage("user", user)]


def improve_messages(anchor: Anchor, attacks: list[str], locale: str = "ru", mode: str = "CONVERGENT",
                     force_answer: bool = False) -> list[LLMMessage]:
    system = reg.get(
        "improve.system",
        mode_rule=reg.get(_mode_key("improve", mode)),
        force=reg.get("improve.force") if force_answer else "",
        lang=_lang(locale),
    )
    atk = "\n".join(f"- {a}" for a in attacks)
    user = (
        anchor.render()
        + f"\n\nАТАКИ ЭТОГО РАУНДА:\n{atk}\n\n"
        + 'Верни JSON: {"thesis": "новая улучшенная версия тезиса", '
        '"changed": "что конкретно изменилось", '
        '"closedAttack": "какая атака закрыта", '
        '"stillWeak": "что всё ещё слабо (честно)"}'
    )
    return [LLMMessage("system", system), LLMMessage("user", user)]


def quantum_generate_messages(topic: str, survivors: list[str], n: int, locale: str = "ru") -> list[LLMMessage]:
    """QUANTUM/Explore: сгенерировать n РАЗНЫХ веток-идей по теме (при наличии — развивая выживших)."""
    system = reg.get("quantum.generate.system", lang=_lang(locale))
    base = f"ТЕМА: {topic}\n"
    if survivors:
        base += "ЛУЧШИЕ ВЕТКИ ПРОШЛОГО ПОКОЛЕНИЯ (развей их или скомбинируй, дай НОВЫЕ повороты):\n"
        base += "\n".join(f"- {s}" for s in survivors) + "\n"
    user = base + (
        f"\nДай ровно {n} веток. Каждая — одно ёмкое предложение (идея/механизм/подход).\n"
        '{"branches": ["ветка 1", "ветка 2", ...]}'
    )
    return [LLMMessage("system", system), LLMMessage("user", user)]


def quantum_score_messages(topic: str, branches: list[dict], locale: str = "ru") -> list[LLMMessage]:
    """QUANTUM: оценить каждую ветку 0–100 по 5 критериям (ТЗ H4)."""
    system = reg.get("quantum.score.system", lang=_lang(locale))
    listing = "\n".join(f'- id={b["id"]}: {b["text"]}' for b in branches)
    user = (
        f"ТЕМА: {topic}\n\nВЕТКИ:\n{listing}\n\n"
        'Верни JSON: {"scores":[{"id":"...","score":<0-100 целое>,'
        '"breakdown":{"novelty":0-100,"feasibility":0-100,"scale":0-100,"hiddenDemand":0-100,"analogy":0-100}}]}'
    )
    return [LLMMessage("system", system), LLMMessage("user", user)]


def verify_own_messages(current: str, attack: str, locale: str = "ru") -> list[LLMMessage]:
    """По ТЗ: тот, кто атаковал, сам проверяет — закрыла ли новая версия именно ЕГО атаку."""
    user = (
        f"ТВОЯ АТАКА: {attack}\n\nТЕКУЩАЯ ВЕРСИЯ ТЕЗИСА: {current}\n\n"
        'Верни JSON: {"verdict":"closed|partial|open","note":"1 короткая фраза почему"}'
    )
    return [LLMMessage("system", reg.get("verify_own.system")), LLMMessage("user", user)]


def final_messages(original: str, current: str, rounds_summary: str, locale: str = "ru", mode: str = "CONVERGENT") -> list[LLMMessage]:
    system = reg.get("final.system", mode_rule=reg.get(_mode_key("final", mode)), lang=_lang(locale))
    user = (
        f"РЕЖИМ: {(mode or 'CONVERGENT').upper()}\n"
        f"ИСХОДНЫЙ ТЕЗИС: {original}\nФИНАЛЬНАЯ ВЕРСИЯ: {current}\n\nХОД ДЕБАТА:\n{rounds_summary}\n\n"
        "conclusion — 2–4 предложения, итог ИМЕННО по правилу режима (см. выше).\n"
        "opportunityScore — целое 0–100, ЧЕСТНАЯ оценка ценности/силы итога. Для Divergent — насколько ясно "
        "разведено противоречие; для Geopolitical — насколько ясна карта интересов. Ориентиры:\n"
        "  0–39 — слабо/опровергнуто; 40–69 — с серьёзными оговорками; 70–89 — сильно; 90–100 — исключительно.\n"
        "НЕ жмись к середине — дай оценку, отражающую именно этот дебат.\n\n"
        "Верни JSON строго по схеме:\n"
        '{"opportunityScore": <0-100 целое>,'
        ' "conclusion": "итог по правилу режима",'
        ' "childQuestions": ["3 дочерних вопроса"],'
        ' "researchGaps": ["пробелы в данных"],'
        ' "crossDomainHypotheses": ["гипотезы на стыке областей"],'
        ' "profitPatterns": ["название: краткое описание"],'
        ' "fundingBranches": ["направления для финансирования"]}'
    )
    return [LLMMessage("system", system), LLMMessage("user", user)]


def inject_classify_messages(text: str, thesis: str, locale: str = "ru") -> list[LLMMessage]:
    """Классификатор комментария пользователя во время дебата (human injection)."""
    user = f"Комментарий: {text}\nТекущий тезис: {thesis or '(не менялся)'}"
    return [LLMMessage("system", reg.get("inject.classify.system")), LLMMessage("user", user)]
