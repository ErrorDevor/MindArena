# MindArena — Agent System

HTTP-сервис консилиума LLM: принимает тему/тезис, гоняет несколько моделей (спор «критикуй и улучшай»
или перебор идей (4 режима)) и отдаёт ход рассуждений. **К этому сервису обращается бэкенд.**

- **Как вызывать** — [API.md](./API.md). Интерактивная документация — на запущенном сервисе: `/docs` (Swagger), `/redoc`.
- **Как развернуть** — [DEPLOY.md](./DEPLOY.md).

## Стек
Python 3.11+, FastAPI, asyncio + httpx, SSE. SDK: `openai` (GPT + GLM/Kimi/Deepseek через base_url),
`anthropic` (Claude), `google-genai` (Gemini).

## Быстрый старт (локально)
```bash
cd agent-system
python -m venv .venv
.\.venv\Scripts\Activate.ps1      # PowerShell   (bash: source .venv/Scripts/activate)
pip install -r requirements.txt
cp .env.example .env              # вписать ключи и AGENT_SYSTEM_API_KEY
uvicorn app.main:app --reload --port 8000
```
Проверка: `GET http://localhost:8000/health`. Полный список эндпоинтов — в `/docs` и `API.md`.
Ключи берутся из `.env` (он приоритетнее переменных окружения ОС; в Docker — из `--env-file`).
