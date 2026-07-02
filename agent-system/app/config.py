"""Конфигурация agent-system: чтение env, реестр моделей."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @classmethod
    def settings_customise_sources(cls, settings_cls, init_settings, env_settings,
                                   dotenv_settings, file_secret_settings):
        # .env приоритетнее переменных окружения ОС (в Docker без .env — fallback на env).
        return (init_settings, dotenv_settings, env_settings, file_secret_settings)

    # Агенты: ключ + модель (+ base_url для OpenAI-совместимых).
    # Пустой *_api_key => агент не используется.
    openai_api_key: str = ""
    openai_model: str = "gpt-4.1-mini"

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-6"

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-pro"

    glm_api_key: str = ""
    glm_base_url: str = "https://api.z.ai/api/paas/v4"
    glm_model: str = "glm-4.6"

    kimi_api_key: str = ""
    kimi_base_url: str = "https://api.moonshot.cn/v1"
    kimi_model: str = "moonshot-v1-32k"

    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-chat"

    grok_api_key: str = ""
    grok_base_url: str = "https://api.x.ai/v1"
    grok_model: str = "grok-2-latest"

    # Параметры движка
    debate_max_rounds: int = 3
    attack_timeout_seconds: int = 45  # сколько ждать атаки раунда; кто не успел — пропускается
    quantum_branches_per_gen: int = 12
    quantum_top_k: int = 5
    quantum_max_generations: int = 3
    llm_timeout_seconds: int = 60

    # Доступ бэкенда к сервису
    agent_system_api_key: str = "change-me-shared-secret"

    # CORS: пусто = выключен (для локального HTML-демо в браузере: CORS_ORIGINS=*).
    cors_origins: str = ""

    # Модель приёмщика /debates/intake; пусто = авто по преференсу.
    intake_model: str = ""


settings = Settings()


def configured_models() -> dict[str, bool]:
    """Какие агенты реально готовы к работе (есть ключ). Нет ключа => не используется."""
    return {
        "GPT": bool(settings.openai_api_key),
        "CLAUDE": bool(settings.anthropic_api_key),
        "GEMINI": bool(settings.gemini_api_key),
        "GLM": bool(settings.glm_api_key),
        "KIMI": bool(settings.kimi_api_key),
        "DEEPSEEK": bool(settings.deepseek_api_key),
        "GROK": bool(settings.grok_api_key),
    }
