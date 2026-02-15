import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class OperatingHours(Base):
    __tablename__ = "operating_hours"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    sauna_id: Mapped[str] = mapped_column(String, ForeignKey("saunas.id"), nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer)  # 0=Monday, 6=Sunday (Korean standard)
    open_time: Mapped[str] = mapped_column(String(5))  # HH:MM
    close_time: Mapped[str] = mapped_column(String(5))  # HH:MM
    is_closed: Mapped[bool] = mapped_column(Boolean, default=False)  # Whether the sauna is closed on this day
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    # Relationship back to Sauna
    sauna: Mapped["Sauna"] = relationship("Sauna", back_populates="operating_hours")
