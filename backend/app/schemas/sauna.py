from pydantic import BaseModel


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
