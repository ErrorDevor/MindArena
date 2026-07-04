"""Gemini (Google) — через google-genai (async).

ВНИМАНИЕ: переданный ключ не похож на платный AI Studio (обычно "AIza..."),
поэтому вызовы могут падать по auth — это изолируется на уровне движка
(атака помечается failed, дебат продолжается). Модель из env (GEMINI_MODEL).
"""
from __future__ import annotations

from google import genai
from google.genai import errors as genai_errors
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_exponential

from app.config import settings
from app.providers.base import LLMMessage, LLMResult


def _is_transient(e: BaseException) -> bool:
    # Ретраим 5xx/429 и сетевые сбои; невалидный ключ (400/401/403) повторять бессмысленно.
    if isinstance(e, genai_errors.APIError):
        return e.code in (429, 500, 502, 503, 504)
    return isinstance(e, (ConnectionError, TimeoutError))


class GeminiProvider:
    id = "GEMINI"

    def __init__(self) -> None:
        self.model = settings.gemini_model
        self._client = genai.Client(api_key=settings.gemini_api_key)

    @retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, max=8),
           retry=retry_if_exception(_is_transient), reraise=True)
    async def generate(
        self,
        messages: list[LLMMessage],
        *,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        json_mode: bool = False,
    ) -> LLMResult:
        system_txt = "\n\n".join(m.content for m in messages if m.role == "system").strip()
        contents = [
            {
                "role": "user" if m.role == "user" else "model",
                "parts": [{"text": m.content}],
            }
            for m in messages
            if m.role in ("user", "assistant")
        ]

        config: dict = {"max_output_tokens": max_tokens, "temperature": temperature}
        if system_txt:
            config["system_instruction"] = system_txt
        if json_mode:
            config["response_mime_type"] = "application/json"

        resp = await self._client.aio.models.generate_content(
            model=self.model, contents=contents, config=config
        )
        return LLMResult(text=resp.text or "", usage={})
