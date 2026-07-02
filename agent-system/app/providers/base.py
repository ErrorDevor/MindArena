"""Единый интерфейс LLM-провайдера."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol


@dataclass
class LLMMessage:
    role: str  # "system" | "user" | "assistant"
    content: str


@dataclass
class LLMResult:
    text: str
    usage: dict = field(default_factory=dict)
    raw: dict | None = None


class LLMProvider(Protocol):
    """Любой провайдер реализует один асинхронный метод generate()."""

    id: str  # "GPT" | "CLAUDE" | "GEMINI" | "GLM" | "KIMI" | "DEEPSEEK"

    async def generate(
        self,
        messages: list[LLMMessage],
        *,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        json_mode: bool = False,
    ) -> LLMResult: ...
