import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Review(Base):
    """
    Customer review model for saunas.
    - Only customers with completed/confirmed bookings can leave reviews
    - One review per booking to prevent duplicates
    """
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    sauna_id: Mapped[str] = mapped_column(String, ForeignKey("saunas.id"), index=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    booking_id: Mapped[str] = mapped_column(
        String, ForeignKey("bookings.id"), index=True, unique=True
    )
    rating: Mapped[int] = mapped_column(Integer)  # 1-5
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    sauna = relationship("Sauna")
    user = relationship("User")
    booking = relationship("Booking")
