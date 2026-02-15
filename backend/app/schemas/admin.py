from datetime import timedelta
from typing import Any

from pydantic import BaseModel, field_validator


class DashboardStats(BaseModel):
    total_bookings: int
    confirmed_bookings: int
    cancelled_bookings: int
    total_revenue: float
    today_bookings: int
    today_revenue: float
    total_customers: int
    total_saunas: int
    average_rating: float

    @field_validator("total_revenue", "today_revenue", "average_rating", mode="before")
    @classmethod
    def coerce_float(cls, v: Any) -> float:
        if v is None:
            return 0.0
        return float(v)

    @field_validator(
        "total_bookings",
        "confirmed_bookings",
        "cancelled_bookings",
        "today_bookings",
        "total_customers",
        "total_saunas",
        mode="before",
    )
    @classmethod
    def coerce_int(cls, v: Any) -> int:
        if v is None:
            return 0
        return int(v)


class RevenueByDate(BaseModel):
    date: str
    revenue: float
    booking_count: int

    @field_validator("revenue", mode="before")
    @classmethod
    def coerce_revenue(cls, v: Any) -> float:
        if v is None:
            return 0.0
        return float(v)

    @field_validator("booking_count", mode="before")
    @classmethod
    def coerce_count(cls, v: Any) -> int:
        if v is None:
            return 0
        return int(v)


class BookingsBySauna(BaseModel):
    sauna_id: str
    sauna_name: str
    booking_count: int
    revenue: float

    @field_validator("sauna_id", mode="before")
    @classmethod
    def coerce_id(cls, v: Any) -> str:
        return str(v)

    @field_validator("revenue", mode="before")
    @classmethod
    def coerce_revenue(cls, v: Any) -> float:
        if v is None:
            return 0.0
        return float(v)

    @field_validator("booking_count", mode="before")
    @classmethod
    def coerce_count(cls, v: Any) -> int:
        if v is None:
            return 0
        return int(v)


class RecentBooking(BaseModel):
    id: str
    customer_name: str
    sauna_name: str | None
    booking_date: str
    start_time: str
    end_time: str
    total_price: float
    status: str
    created_at: str

    @field_validator("id", mode="before")
    @classmethod
    def coerce_id(cls, v: Any) -> str:
        return str(v)

    @field_validator("booking_date", "start_time", "end_time", mode="before")
    @classmethod
    def coerce_time_fields(cls, v: Any) -> str:
        if isinstance(v, timedelta):
            total_seconds = int(v.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            return f"{hours:02d}:{minutes:02d}"
        return str(v)

    @field_validator("total_price", mode="before")
    @classmethod
    def coerce_price(cls, v: Any) -> float:
        if v is None:
            return 0.0
        return float(v)

    @field_validator("created_at", mode="before")
    @classmethod
    def coerce_datetime(cls, v: Any) -> str:
        if hasattr(v, "isoformat"):
            return v.isoformat()
        return str(v)
