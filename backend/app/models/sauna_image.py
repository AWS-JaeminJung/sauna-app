import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SaunaImage(Base):
    __tablename__ = "sauna_images"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    sauna_id: Mapped[str] = mapped_column(String, ForeignKey("saunas.id"), nullable=False)
    image_url: Mapped[str] = mapped_column(String(500))
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    # Relationship back to Sauna
    sauna: Mapped["Sauna"] = relationship("Sauna", back_populates="images")
