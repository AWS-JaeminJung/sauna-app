from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.booking import Booking
from app.models.review import Review
from app.models.sauna import Sauna
from app.models.user import User
from app.schemas.admin import (
    BookingsBySauna,
    DashboardStats,
    RecentBooking,
    RevenueByDate,
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Get overall dashboard statistics.
    - Total bookings (excluding cancelled)
    - Confirmed/Cancelled booking counts
    - Total revenue (excluding cancelled)
    - Today's bookings and revenue
    - Total unique customers who have made bookings
    - Total active saunas
    - Average rating from all reviews
    """

    today = date.today().isoformat()

    # Total bookings (excluding cancelled)
    total_bookings_result = await db.execute(
        select(func.count(Booking.id)).where(Booking.status != "cancelled")
    )
    total_bookings = total_bookings_result.scalar() or 0

    # Confirmed bookings
    confirmed_result = await db.execute(
        select(func.count(Booking.id)).where(Booking.status == "confirmed")
    )
    confirmed_bookings = confirmed_result.scalar() or 0

    # Cancelled bookings
    cancelled_result = await db.execute(
        select(func.count(Booking.id)).where(Booking.status == "cancelled")
    )
    cancelled_bookings = cancelled_result.scalar() or 0

    # Total revenue (excluding cancelled)
    total_revenue_result = await db.execute(
        select(func.sum(Booking.total_price)).where(Booking.status != "cancelled")
    )
    total_revenue = total_revenue_result.scalar() or 0.0

    # Today's bookings
    today_bookings_result = await db.execute(
        select(func.count(Booking.id)).where(
            and_(Booking.booking_date == today, Booking.status != "cancelled")
        )
    )
    today_bookings = today_bookings_result.scalar() or 0

    # Today's revenue
    today_revenue_result = await db.execute(
        select(func.sum(Booking.total_price)).where(
            and_(Booking.booking_date == today, Booking.status != "cancelled")
        )
    )
    today_revenue = today_revenue_result.scalar() or 0.0

    # Total unique customers who have made bookings
    total_customers_result = await db.execute(
        select(func.count(func.distinct(Booking.user_id))).where(
            Booking.user_id.isnot(None)
        )
    )
    total_customers = total_customers_result.scalar() or 0

    # Total active saunas
    total_saunas_result = await db.execute(
        select(func.count(Sauna.id)).where(Sauna.is_active == True)
    )
    total_saunas = total_saunas_result.scalar() or 0

    # Average rating from all reviews
    avg_rating_result = await db.execute(select(func.avg(Review.rating)))
    average_rating = avg_rating_result.scalar() or 0.0

    return DashboardStats(
        total_bookings=total_bookings,
        confirmed_bookings=confirmed_bookings,
        cancelled_bookings=cancelled_bookings,
        total_revenue=total_revenue,
        today_bookings=today_bookings,
        today_revenue=today_revenue,
        total_customers=total_customers,
        total_saunas=total_saunas,
        average_rating=average_rating,
    )


@router.get("/revenue", response_model=list[RevenueByDate])
async def get_revenue_by_period(
    period: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Get daily revenue for the specified period.
    - period: Number of days to retrieve (default 7, max 90)
    - Results ordered by date (newest first)
    - Excludes cancelled bookings
    """

    today = date.today()
    start_date = (today - timedelta(days=period - 1)).isoformat()

    # Get revenue and booking count by date
    query = (
        select(
            Booking.booking_date,
            func.sum(Booking.total_price).label("revenue"),
            func.count(Booking.id).label("booking_count"),
        )
        .where(
            and_(
                Booking.booking_date >= start_date,
                Booking.status != "cancelled",
            )
        )
        .group_by(Booking.booking_date)
        .order_by(Booking.booking_date.desc())
    )

    result = await db.execute(query)
    rows = result.all()

    return [
        RevenueByDate(
            date=row[0],
            revenue=row[1] or 0.0,
            booking_count=row[2] or 0,
        )
        for row in rows
    ]


@router.get("/bookings-by-sauna", response_model=list[BookingsBySauna])
async def get_bookings_by_sauna(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Get booking count and revenue for each sauna.
    - Excludes cancelled bookings
    - Results ordered by revenue (highest first)
    """

    query = (
        select(
            Sauna.id,
            Sauna.name,
            func.count(Booking.id).label("booking_count"),
            func.sum(Booking.total_price).label("revenue"),
        )
        .join(Booking, Sauna.id == Booking.sauna_id)
        .where(Booking.status != "cancelled")
        .group_by(Sauna.id, Sauna.name)
        .order_by(func.sum(Booking.total_price).desc())
    )

    result = await db.execute(query)
    rows = result.all()

    return [
        BookingsBySauna(
            sauna_id=row[0],
            sauna_name=row[1],
            booking_count=row[2] or 0,
            revenue=row[3] or 0.0,
        )
        for row in rows
    ]


@router.get("/recent-bookings", response_model=list[RecentBooking])
async def get_recent_bookings(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Get recent bookings.
    - limit: Number of bookings to retrieve (default 10, max 50)
    - Results ordered by creation time (newest first)
    - Includes sauna name
    """

    query = (
        select(Booking)
        .order_by(Booking.created_at.desc())
        .limit(limit)
    )

    result = await db.execute(query)
    bookings = result.scalars().all()

    # Fetch sauna names
    sauna_ids = {b.sauna_id for b in bookings}
    sauna_map = {}
    if sauna_ids:
        sauna_result = await db.execute(
            select(Sauna).where(Sauna.id.in_(sauna_ids))
        )
        sauna_map = {s.id: s.name for s in sauna_result.scalars().all()}

    return [
        RecentBooking(
            id=b.id,
            customer_name=b.customer_name,
            sauna_name=sauna_map.get(b.sauna_id),
            booking_date=b.booking_date,
            start_time=b.start_time,
            end_time=b.end_time,
            total_price=b.total_price,
            status=b.status,
            created_at=b.created_at.isoformat() if b.created_at else "",
        )
        for b in bookings
    ]
