from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_admin, require_user
from app.core.database import get_db
from app.models.booking import Booking
from app.models.review import Review
from app.models.sauna import Sauna
from app.models.user import User
from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
    BookingUpdate,
    TimeSlot,
)

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _to_minutes(time_val) -> int:
    if isinstance(time_val, timedelta):
        return int(time_val.total_seconds()) // 60
    h, m = str(time_val).split(":")[:2]
    return int(h) * 60 + int(m)


def _from_minutes(minutes: int) -> str:
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


@router.get("/availability", response_model=list[TimeSlot])
async def get_availability(
    sauna_id: str = Query(...),
    date: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Sauna).where(Sauna.id == sauna_id))
    sauna = result.scalar_one_or_none()
    if not sauna:
        raise HTTPException(status_code=404, detail="Sauna not found")

    result = await db.execute(
        select(Booking).where(
            and_(
                Booking.sauna_id == sauna_id,
                Booking.booking_date == date,
                Booking.status != "cancelled",
            )
        )
    )
    booked = result.scalars().all()
    booked_ranges = [(_to_minutes(b.start_time), _to_minutes(b.end_time)) for b in booked]

    open_min = _to_minutes(sauna.open_time)
    close_min = _to_minutes(sauna.close_time)
    slots = []
    current = open_min
    while current < close_min:
        time_str = _from_minutes(current)
        available = all(
            not (start <= current < end) for start, end in booked_ranges
        )
        slots.append(TimeSlot(time=time_str, available=available))
        current += 60  # 1-hour slots

    return slots


@router.get("/my")
async def list_my_bookings(
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
):
    """
    Get all bookings for the logged-in user.
    - User must be authenticated
    - Results are sorted by booking date (newest first)
    - Optional status filter (confirmed, completed, cancelled)
    """
    query = select(Booking).where(Booking.user_id == user.id)
    if status:
        query = query.where(Booking.status == status)
    query = query.order_by(Booking.booking_date.desc(), Booking.start_time.desc())
    result = await db.execute(query)
    bookings = result.scalars().all()

    # Fetch sauna names
    sauna_ids = {b.sauna_id for b in bookings}
    sauna_map = {}
    if sauna_ids:
        r = await db.execute(select(Sauna).where(Sauna.id.in_(sauna_ids)))
        sauna_map = {s.id: s.name for s in r.scalars().all()}

    # Check which bookings have reviews
    booking_ids = [b.id for b in bookings]
    review_map = {}
    if booking_ids:
        r = await db.execute(
            select(Review.booking_id).where(Review.booking_id.in_(booking_ids))
        )
        review_map = {booking_id for (booking_id,) in r.all()}

    return [
        BookingResponse(
            id=b.id,
            sauna_id=b.sauna_id,
            booking_date=b.booking_date,
            start_time=b.start_time,
            end_time=b.end_time,
            guest_count=b.guest_count,
            total_price=b.total_price,
            customer_name=b.customer_name,
            customer_phone=b.customer_phone,
            customer_email=b.customer_email,
            notes=b.notes,
            status=b.status,
            sauna_name=sauna_map.get(b.sauna_id),
            has_review=b.id in review_map,
        )
        for b in bookings
    ]


@router.post("", response_model=BookingResponse)
async def create_booking(
    data: BookingCreate,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    result = await db.execute(select(Sauna).where(Sauna.id == data.sauna_id))
    sauna = result.scalar_one_or_none()
    if not sauna:
        raise HTTPException(status_code=404, detail="Sauna not found")

    if data.guest_count > sauna.capacity:
        raise HTTPException(status_code=400, detail="Guest count exceeds capacity")

    # Check for time conflicts
    result = await db.execute(
        select(Booking).where(
            and_(
                Booking.sauna_id == data.sauna_id,
                Booking.booking_date == data.booking_date,
                Booking.status != "cancelled",
            )
        )
    )
    existing = result.scalars().all()
    new_start = _to_minutes(data.start_time)
    new_end = _to_minutes(data.end_time)

    for b in existing:
        b_start = _to_minutes(b.start_time)
        b_end = _to_minutes(b.end_time)
        if new_start < b_end and new_end > b_start:
            raise HTTPException(
                status_code=409,
                detail="Time slot conflicts with existing booking",
            )

    hours = (new_end - new_start) / 60
    total_price = hours * sauna.hourly_rate

    booking = Booking(
        sauna_id=data.sauna_id,
        user_id=user.id if user else None,
        booking_date=data.booking_date,
        start_time=data.start_time,
        end_time=data.end_time,
        guest_count=data.guest_count,
        total_price=total_price,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        customer_email=data.customer_email,
        notes=data.notes,
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    return BookingResponse(
        id=booking.id,
        sauna_id=booking.sauna_id,
        booking_date=booking.booking_date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        guest_count=booking.guest_count,
        total_price=booking.total_price,
        customer_name=booking.customer_name,
        customer_phone=booking.customer_phone,
        customer_email=booking.customer_email,
        notes=booking.notes,
        status=booking.status,
        sauna_name=sauna.name,
        has_review=False,
    )


@router.get("", response_model=list[BookingResponse])
async def list_bookings(
    date: str | None = Query(None),
    sauna_id: str | None = Query(None),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = select(Booking)
    if date:
        query = query.where(Booking.booking_date == date)
    if sauna_id:
        query = query.where(Booking.sauna_id == sauna_id)
    if status:
        query = query.where(Booking.status == status)
    query = query.order_by(Booking.booking_date.desc(), Booking.start_time)
    result = await db.execute(query)
    bookings = result.scalars().all()

    # Fetch sauna names
    sauna_ids = {b.sauna_id for b in bookings}
    sauna_map = {}
    if sauna_ids:
        r = await db.execute(select(Sauna).where(Sauna.id.in_(sauna_ids)))
        sauna_map = {s.id: s.name for s in r.scalars().all()}

    # Check which bookings have reviews
    booking_ids = [b.id for b in bookings]
    review_map = {}
    if booking_ids:
        r = await db.execute(
            select(Review.booking_id).where(Review.booking_id.in_(booking_ids))
        )
        review_map = {booking_id for (booking_id,) in r.all()}

    return [
        BookingResponse(
            id=b.id,
            sauna_id=b.sauna_id,
            booking_date=b.booking_date,
            start_time=b.start_time,
            end_time=b.end_time,
            guest_count=b.guest_count,
            total_price=b.total_price,
            customer_name=b.customer_name,
            customer_phone=b.customer_phone,
            customer_email=b.customer_email,
            notes=b.notes,
            status=b.status,
            sauna_name=sauna_map.get(b.sauna_id),
            has_review=b.id in review_map,
        )
        for b in bookings
    ]


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(booking_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    sauna_result = await db.execute(select(Sauna).where(Sauna.id == booking.sauna_id))
    sauna = sauna_result.scalar_one_or_none()

    # Check if booking has a review
    review_result = await db.execute(
        select(Review).where(Review.booking_id == booking.id)
    )
    has_review = review_result.scalar_one_or_none() is not None

    return BookingResponse(
        id=booking.id,
        sauna_id=booking.sauna_id,
        booking_date=booking.booking_date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        guest_count=booking.guest_count,
        total_price=booking.total_price,
        customer_name=booking.customer_name,
        customer_phone=booking.customer_phone,
        customer_email=booking.customer_email,
        notes=booking.notes,
        status=booking.status,
        sauna_name=sauna.name if sauna else None,
        has_review=has_review,
    )


@router.patch("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
):
    """
    Cancel a booking.
    - User must be authenticated
    - User can only cancel their own bookings
    - Cannot cancel already cancelled bookings
    """
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="예약을 찾을 수 없습니다.",
        )

    if booking.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="본인의 예약만 취소할 수 있습니다.",
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 취소된 예약입니다.",
        )

    booking.status = "cancelled"
    await db.commit()
    await db.refresh(booking)

    sauna_result = await db.execute(select(Sauna).where(Sauna.id == booking.sauna_id))
    sauna = sauna_result.scalar_one_or_none()

    # Check if booking has a review
    review_result = await db.execute(
        select(Review).where(Review.booking_id == booking.id)
    )
    has_review = review_result.scalar_one_or_none() is not None

    return BookingResponse(
        id=booking.id,
        sauna_id=booking.sauna_id,
        booking_date=booking.booking_date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        guest_count=booking.guest_count,
        total_price=booking.total_price,
        customer_name=booking.customer_name,
        customer_phone=booking.customer_phone,
        customer_email=booking.customer_email,
        notes=booking.notes,
        status=booking.status,
        sauna_name=sauna.name if sauna else None,
        has_review=has_review,
    )


@router.patch("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: str,
    data: BookingUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(booking, key, value)
    await db.commit()
    await db.refresh(booking)
    sauna_result = await db.execute(select(Sauna).where(Sauna.id == booking.sauna_id))
    sauna = sauna_result.scalar_one_or_none()

    # Check if booking has a review
    review_result = await db.execute(
        select(Review).where(Review.booking_id == booking.id)
    )
    has_review = review_result.scalar_one_or_none() is not None

    return BookingResponse(
        id=booking.id,
        sauna_id=booking.sauna_id,
        booking_date=booking.booking_date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        guest_count=booking.guest_count,
        total_price=booking.total_price,
        customer_name=booking.customer_name,
        customer_phone=booking.customer_phone,
        customer_email=booking.customer_email,
        notes=booking.notes,
        status=booking.status,
        sauna_name=sauna.name if sauna else None,
        has_review=has_review,
    )
