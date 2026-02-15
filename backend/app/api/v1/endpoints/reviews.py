from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.api.deps import get_current_user, require_user
from app.core.database import get_db
from app.models.booking import Booking
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse, ReviewSummary

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewResponse)
async def create_review(
    data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
):
    """
    Create a new review for a sauna.
    - User must be logged in
    - User must have a completed or confirmed booking for the sauna
    - Only one review per booking is allowed
    """
    # Check if booking exists and belongs to the user
    result = await db.execute(
        select(Booking).where(Booking.id == data.booking_id)
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="예약을 찾을 수 없습니다.",
        )

    if booking.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="본인의 예약에만 리뷰를 작성할 수 있습니다.",
        )

    if booking.sauna_id != data.sauna_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="예약된 사우나와 리뷰 대상이 일치하지 않습니다.",
        )

    # Check if booking status is confirmed or completed
    if booking.status not in ["confirmed", "completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="완료되었거나 확인된 예약에만 리뷰를 작성할 수 있습니다.",
        )

    # Check for duplicate review
    result = await db.execute(
        select(Review).where(Review.booking_id == data.booking_id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이 예약에 대한 리뷰는 이미 작성되었습니다.",
        )

    # Create review
    review = Review(
        sauna_id=data.sauna_id,
        user_id=user.id,
        booking_id=data.booking_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    return ReviewResponse(
        id=review.id,
        sauna_id=review.sauna_id,
        user_id=review.user_id,
        booking_id=review.booking_id,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
        user_name=user.full_name,
    )


@router.get("", response_model=list[ReviewResponse])
async def list_reviews(
    sauna_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all reviews for a specific sauna.
    - No authentication required
    - Results are sorted by creation date (newest first)
    """
    result = await db.execute(
        select(Review)
        .where(Review.sauna_id == sauna_id)
        .options(joinedload(Review.user))
        .order_by(Review.created_at.desc())
    )
    reviews = result.unique().scalars().all()

    return [
        ReviewResponse(
            id=r.id,
            sauna_id=r.sauna_id,
            user_id=r.user_id,
            booking_id=r.booking_id,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
            user_name=r.user.full_name if r.user else "익명",
        )
        for r in reviews
    ]


@router.get("/summary", response_model=ReviewSummary)
async def get_review_summary(
    sauna_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Get review statistics for a specific sauna.
    - No authentication required
    - Returns average rating, total count, and distribution by star rating
    """
    # Get all reviews for the sauna
    result = await db.execute(
        select(Review).where(Review.sauna_id == sauna_id)
    )
    reviews = result.scalars().all()

    if not reviews:
        return ReviewSummary(
            average_rating=0.0,
            review_count=0,
            rating_distribution={1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
        )

    # Calculate average and distribution
    ratings = [r.rating for r in reviews]
    average_rating = sum(ratings) / len(ratings)

    rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for rating in ratings:
        rating_distribution[rating] += 1

    return ReviewSummary(
        average_rating=average_rating,
        review_count=len(reviews),
        rating_distribution=rating_distribution,
    )


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
):
    """
    Delete a review.
    - User must be logged in
    - User can only delete their own reviews
    """
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="리뷰를 찾을 수 없습니다.",
        )

    if review.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="본인의 리뷰만 삭제할 수 있습니다.",
        )

    await db.delete(review)
    await db.commit()
