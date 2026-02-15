from pydantic import BaseModel


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


class AvailabilityQuery(BaseModel):
    sauna_id: str
    date: str  # YYYY-MM-DD


class TimeSlot(BaseModel):
    time: str  # HH:MM
    available: bool
