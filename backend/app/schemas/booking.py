from datetime import timedelta
from typing import Any

from pydantic import BaseModel, field_validator


class BookingCreate(BaseModel):
    sauna_id: str
    booking_date: str  # YYYY-MM-DD
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    guest_count: int
    customer_name: str
    customer_phone: str
    customer_email: str
    notes: str | None = None


class BookingUpdate(BaseModel):
    status: str | None = None
    notes: str | None = None


class BookingResponse(BaseModel):
    id: str
    sauna_id: str
    booking_date: str
    start_time: str
    end_time: str
    guest_count: int
    total_price: float
    customer_name: str
    customer_phone: str
    customer_email: str
    notes: str | None
    status: str
    sauna_name: str | None = None
    has_review: bool = False

    @field_validator("id", "sauna_id", mode="before")
    @classmethod
    def coerce_id(cls, v: Any) -> str:
        return str(v)

    @field_validator("start_time", "end_time", mode="before")
    @classmethod
    def coerce_time(cls, v: Any) -> str:
        if isinstance(v, timedelta):
            total_seconds = int(v.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            return f"{hours:02d}:{minutes:02d}"
        return str(v)

    @field_validator("booking_date", mode="before")
    @classmethod
    def coerce_date(cls, v: Any) -> str:
        return str(v)


class AvailabilityQuery(BaseModel):
    sauna_id: str
    date: str  # YYYY-MM-DD


class TimeSlot(BaseModel):
    time: str  # HH:MM
    available: bool
