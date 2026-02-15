from datetime import datetime
from typing import Any

from pydantic import BaseModel, field_validator


class ReviewCreate(BaseModel):
    """Schema for creating a new review"""
    sauna_id: str
    booking_id: str
    rating: int  # 1-5
    comment: str | None = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError("평점은 1~5 사이의 숫자여야 합니다.")
        return v


class ReviewResponse(BaseModel):
    """Schema for review response"""
    id: str
    sauna_id: str
    user_id: str
    booking_id: str
    rating: int
    comment: str | None
    created_at: datetime
    user_name: str  # Name of the reviewer

    @field_validator("id", "sauna_id", "user_id", "booking_id", mode="before")
    @classmethod
    def coerce_id(cls, v: Any) -> str:
        return str(v)

    @field_validator("rating", mode="before")
    @classmethod
    def coerce_rating(cls, v: Any) -> int:
        return int(v)

    @field_validator("created_at", mode="before")
    @classmethod
    def coerce_datetime(cls, v: Any) -> datetime:
        if isinstance(v, datetime):
            return v
        return datetime.fromisoformat(str(v))


class ReviewSummary(BaseModel):
    """Schema for review summary statistics"""
    average_rating: float
    review_count: int
    rating_distribution: dict[int, int]  # {1: count, 2: count, ...}

    @field_validator("average_rating", mode="before")
    @classmethod
    def coerce_average(cls, v: Any) -> float:
        return float(v) if v is not None else 0.0

    @field_validator("review_count", mode="before")
    @classmethod
    def coerce_count(cls, v: Any) -> int:
        return int(v) if v is not None else 0
