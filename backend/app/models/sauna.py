import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Sauna(Base):
    __tablename__ = "saunas"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    capacity: Mapped[int] = mapped_column(Integer)
    hourly_rate: Mapped[float] = mapped_column(Float)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    amenities: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    open_time: Mapped[str] = mapped_column(String(5), default="10:00")
    close_time: Mapped[str] = mapped_column(String(5), default="22:00")

    # New fields for location and details
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    road_address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    sauna_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    temperature_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    temperature_max: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    images: Mapped[list["SaunaImage"]] = relationship("SaunaImage", back_populates="sauna", cascade="all, delete-orphan")
    operating_hours: Mapped[list["OperatingHours"]] = relationship("OperatingHours", back_populates="sauna", cascade="all, delete-orphan")
