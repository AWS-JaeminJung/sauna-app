from datetime import timedelta
from typing import Any

from pydantic import BaseModel, field_validator


class SaunaCreate(BaseModel):
    name: str
    description: str | None = None
    capacity: int
    hourly_rate: float
    image_url: str | None = None
    amenities: str | None = None
    open_time: str = "10:00"
    close_time: str = "22:00"


class SaunaUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    capacity: int | None = None
    hourly_rate: float | None = None
    image_url: str | None = None
    amenities: str | None = None
    is_active: bool | None = None
    open_time: str | None = None
    close_time: str | None = None


class SaunaResponse(BaseModel):
    id: str
    name: str
    description: str | None
    capacity: int
    hourly_rate: float
    image_url: str | None
    amenities: str | None
    is_active: bool
    open_time: str
    close_time: str

    @field_validator("id", mode="before")
    @classmethod
    def coerce_id(cls, v: Any) -> str:
        return str(v)

    @field_validator("open_time", "close_time", mode="before")
    @classmethod
    def coerce_time(cls, v: Any) -> str:
        if isinstance(v, timedelta):
            total_seconds = int(v.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            return f"{hours:02d}:{minutes:02d}"
        return str(v)
