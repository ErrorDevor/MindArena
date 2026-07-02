"""Устойчивый парсинг JSON из ответов моделей (снимаем markdown-обёртки, берём
первый валидный объект)."""
from __future__ import annotations

import json
import re


def parse_json(text: str | None) -> dict | None:
    if not text:
        return None
    candidate = text.strip()
    # срезаем ```json ... ``` если есть
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", candidate, re.DOTALL)
    if fenced:
        candidate = fenced.group(1)
    else:
        brace = re.search(r"\{.*\}", candidate, re.DOTALL)
        if brace:
            candidate = brace.group(0)
    try:
        obj = json.loads(candidate)
        return obj if isinstance(obj, dict) else None
    except Exception:
        return None
