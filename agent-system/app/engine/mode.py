"""Определение стратегии дебата: VERIFY (петля истины) vs QUANTUM (эволюц. дерево).

MVP: лёгкая эвристика по ключевым словам (быстро, бесплатно). Позже можно усилить
дешёвым LLM-классификатором (Gemini Flash / Deepseek), формат ответа не изменится.
"""
from __future__ import annotations

import re

_QUANTUM_HINTS = (
    "как ", "почему", "что если", "каким образом", "идеи", "идей", "варианты",
    "механизм", "объяснени", "пути", "способы",
    "how ", "why", "what if", "ideas", "options", "mechanism", "ways",
)
_VERIFY_HINTS = (
    "заменит", "безопас", "эффективнее", "приведёт", "приведет", "доказано", "лучше",
    "will replace", "is safe", "better than", "proven",
)
# Явные глаголы-утверждения + продуктивные окончания 3-го лица (убивает/снижает/заменит…).
# Многобуквенные окончания, чтобы не путать с существительными на -ет/-ит (интернет, совет).
_CLAIM_VERB = re.compile(r"\b(is|are|will|заменит|заменят|будет|будут|приведёт|приведет)\b")
_ASSERT_SUFFIX = re.compile(r"\w{3,}(ает|яет|ует|ают|яют|уют|ится|ается|шает|жает|зит|сит|бьёт)\b")


_OPEN_LEAD = ("почему", "как ", "что если", "каким образом", "how ", "why ", "what if")


def _has_claim(t: str) -> bool:
    return bool(_CLAIM_VERB.search(t) or _ASSERT_SUFFIX.search(t))


def detect_mode(thesis: str) -> tuple[str, str]:
    """Возвращает (strategy, reason). strategy ∈ {"VERIFY","QUANTUM"}."""
    t = thesis.strip().lower()
    words = t.split()

    quantum = any(h in t for h in _QUANTUM_HINTS)
    verify = any(h in t for h in _VERIFY_HINTS) or _has_claim(t) or bool(re.search(r"\d", t))

    # Открытый вопрос («почему…», «как…») ведёт к исследованию, даже если есть глагол.
    if t.startswith(_OPEN_LEAD):
        return "QUANTUM", "открытый вопрос — исследуем пространство ответов"
    if verify and not quantum:
        return "VERIFY", "конкретное утверждение или цифра — проверяем тезис"
    if quantum and not verify:
        return "QUANTUM", "открытый вопрос или запрос вариантов — исследуем пространство идей"
    if not verify and not quantum and len(words) < 5:
        return "QUANTUM", "короткий запрос без утверждения — похоже на область для исследования"
    return "VERIFY", "по умолчанию проверяем тезис (режим можно переключить вручную)"
