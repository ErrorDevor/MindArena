"""Реестр готовых провайдеров: id -> провайдер.

Реестр строится один раз на процесс и кэшируется: SDK-клиенты держат connection-pool,
пересоздавать их на каждый запрос дорого. Инициализация Anthropic/Gemini обёрнута в
try/except: сломанный SDK или ключ не должны валить весь реестр.
"""
from __future__ import annotations

from app.config import settings
from app.providers.base import LLMProvider
from app.providers.openai_like import make_openai_like

_cache: dict[str, LLMProvider] | None = None


def build_registry(fresh: bool = False) -> dict[str, LLMProvider]:
    global _cache
    if _cache is not None and not fresh:
        return _cache

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

    _cache = registry
    return registry
