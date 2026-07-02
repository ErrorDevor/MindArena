# MindArena Agent System — образ для отдельного деплоя.
# Сервис слушает :8000; бэкенд обращается к нему по HTTP (см. API.md).
# Секреты (ключи LLM, AGENT_SYSTEM_API_KEY) передаются переменными окружения при запуске,
# в образ НЕ зашиваются (.env в .dockerignore).
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Сначала зависимости — лучше кэшируется между сборками
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Код сервиса
COPY app ./app

EXPOSE 8000

# Проверка живости (сервис отдаёт /health без авторизации)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health').status==200 else 1)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
