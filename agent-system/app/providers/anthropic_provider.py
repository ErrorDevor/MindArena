"""Claude (Anthropic) — через официальный SDK anthropic (AsyncAnthropic).

Осознанно НЕ передаём temperature / thinking budget: на новых моделях Claude
(Opus 4.7/4.8, Sonnet 5) sampling-параметры и budget_tokens возвращают 400.
Модель берётся из env (ANTHROPIC_MODEL). Для дебатов ответы короткие —
стриминг и thinking не нужны.
"""
from __future__ import annotations

from anthropic import AsyncAnthropic
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings
from app.providers.base import LLMMessage, LLMResult


class AnthropicProvider:
    id = "CLAUDE"

    def __init__(self) -> None:
        self.model = settings.anthropic_model
        self._client = AsyncAnthropic(
            api_key=settings.anthropic_api_key,
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
        system_txt = "\n\n".join(m.content for m in messages if m.role == "system").strip()
        chat = [
            {"role": m.role, "content": m.content}
            for m in messages
            if m.role in ("user", "assistant")
        ]
        if json_mode:
            system_txt = (system_txt + "\n\nОтвечай ТОЛЬКО валидным JSON без markdown-обёрток.").strip()

        kwargs: dict = dict(model=self.model, max_tokens=max_tokens, messages=chat)
        if system_txt:
            kwargs["system"] = system_txt

        resp = await self._client.messages.create(**kwargs)
        text = "".join(getattr(b, "text", "") for b in resp.content if b.type == "text")
        usage = {
            "input_tokens": resp.usage.input_tokens,
            "output_tokens": resp.usage.output_tokens,
        }
        return LLMResult(text=text, usage=usage)
