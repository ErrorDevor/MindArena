"""Anchor-память (ТЗ Часть 3): компактный «якорь» вместо всей истории —
исходный тезис, текущая версия, закрытые атаки, открытые слабости."""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Anchor:
    original: str
    current: str
    closed: list[str] = field(default_factory=list)  # закрытые атаки (не повторять)
    open: list[str] = field(default_factory=list)     # открытые слабости

    def render(self) -> str:
        closed = "\n".join(f"  - {c}" for c in self.closed[-12:]) or "  (пока нет)"
        openw = "\n".join(f"  - {o}" for o in self.open[-12:]) or "  (пока нет)"
        return (
            f"ИСХОДНЫЙ ТЕЗИС: {self.original}\n"
            f"ТЕКУЩАЯ ВЕРСИЯ: {self.current}\n"
            f"ЗАКРЫТЫЕ АТАКИ (не повторять):\n{closed}\n"
            f"ОТКРЫТЫЕ СЛАБОСТИ:\n{openw}"
        )
