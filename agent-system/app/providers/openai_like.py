"""Провайдер для OpenAI и всех OpenAI-совместимых API (GLM, Kimi, Deepseek).

Один класс, разные base_url/api_key/model. Anthropic и Gemini — отдельные адаптеры.
"""
from __future__ import annotations

from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings
from app.providers.base import LLMMessage, LLMResult


class OpenAILikeProvider:
    def __init__(self, id: str, model: str, api_key: str, base_url: str | None = None):
        self.id = id
        self.model = model
        self._client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=settings.llm_timeout_seconds,
        )

    @retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, max=8))
    async def generate(
        self,
        messages: list[LLMMessage],
        *,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        json_mode: bool = False,
    ) -> LLMResult:
        kwargs: dict = dict(
            model=self.model,
            messages=[{"role": m.role, "content": m.content} for m in messages],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        resp = await self._client.chat.completions.create(**kwargs)
        return LLMResult(
            text=resp.choices[0].message.content or "",
            usage=resp.usage.model_dump() if resp.usage else {},
        )


# Фабрика OpenAI-совместимых агентов. Пустой ключ => агент пропускается (не используется).
def make_openai_like() -> dict[str, OpenAILikeProvider]:
    out: dict[str, OpenAILikeProvider] = {}
    if settings.openai_api_key:
        out["GPT"] = OpenAILikeProvider("GPT", settings.openai_model, settings.openai_api_key)
    if settings.glm_api_key:
        out["GLM"] = OpenAILikeProvider(
            "GLM", settings.glm_model, settings.glm_api_key, settings.glm_base_url
        )
    if settings.kimi_api_key:
        out["KIMI"] = OpenAILikeProvider(
            "KIMI", settings.kimi_model, settings.kimi_api_key, settings.kimi_base_url
        )
    if settings.deepseek_api_key:
        out["DEEPSEEK"] = OpenAILikeProvider(
            "DEEPSEEK", settings.deepseek_model, settings.deepseek_api_key, settings.deepseek_base_url
        )
    if settings.grok_api_key:
        out["GROK"] = OpenAILikeProvider(
            "GROK", settings.grok_model, settings.grok_api_key, settings.grok_base_url
        )
    return out
