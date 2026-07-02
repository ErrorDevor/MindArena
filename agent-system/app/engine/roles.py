"""Роли-критики консилиума (ТЗ Часть 3). Каждой модели в раунде — своя «линза»,
роли сдвигаются по раундам, чтобы покрыть все углы и не дублировать атаки."""
from __future__ import annotations

ROLES: list[dict[str, str]] = [
    {"id": "strategist", "name": "Стратег-скептик",
     "lens": "дыра в логике и тайминге: «Почему именно сейчас и именно это?»"},
    {"id": "architect", "name": "Системный архитектор",
     "lens": "скрытый системный риск: «Что мы не видим? Что ломается при масштабе?»"},
    {"id": "practitioner", "name": "Практик",
     "lens": "проверка реальностью: «Где доказательства, что это работает на практике?»"},
    {"id": "innovator", "name": "Инноватор-скептик",
     "lens": "контр-гипотеза: «А что если всё наоборот? Какая альтернатива сильнее?»"},
    {"id": "market", "name": "Рыночный аналитик",
     "lens": "рынок и спрос: «Кто платит, почему и вместо чего?»"},
    {"id": "risk", "name": "Риск-менеджер",
     "lens": "риски и провалы: «Что убьёт это через год? Юр./этика/регуляторика?»"},
]


def role_for(agent_index: int, round_number: int) -> dict[str, str]:
    return ROLES[(agent_index + round_number - 1) % len(ROLES)]


ROLES_BY_ID: dict[str, dict[str, str]] = {r["id"]: r for r in ROLES}


def resolve_role(role: str) -> dict[str, str]:
    """id роли из ROLES → её словарь; произвольная метка → кастомная роль с этой линзой."""
    role = (role or "").strip()
    if role in ROLES_BY_ID:
        return ROLES_BY_ID[role]
    return {"id": "custom", "name": role, "lens": f"фокус на: {role}."}
