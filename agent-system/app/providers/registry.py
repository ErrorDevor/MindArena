"""Реестр готовых провайдеров: id -> провайдер.

Инициализация Anthropic/Gemini обёрнута в try/except: сломанный SDK или ключ
не должны валить весь реестр (остальные агенты продолжают работать).
"""
from __future__ import annotations

from app.config import settings
from app.providers.base import LLMProvider
from app.providers.openai_like import make_openai_like


def build_registry() -> dict[str, LLMProvider]:
    registry: dict[str, LLMProvider] = {}
    registry.update(make_openai_like())  # GPT, GLM, KIMI, DEEPSEEK, GROK

    if settings.anthropic_api_key:
        try:
            from app.providers.anthropic_provider import AnthropicProvider

            registry["CLAUDE"] = AnthropicProvider()
        except Exception as e:  # noqa: BLE001
            print(f"[registry] Anthropic init failed: {e}")

    if settings.gemini_api_key:
        try:
            from app.providers.gemini_provider import GeminiProvider

            registry["GEMINI"] = GeminiProvider()
        except Exception as e:  # noqa: BLE001
            print(f"[registry] Gemini init failed: {e}")

    return registry
