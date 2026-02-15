from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.sauna import Sauna
from app.models.sauna_image import SaunaImage
from app.models.operating_hours import OperatingHours
from app.models.user import User
from app.schemas.sauna import (
    SaunaCreate,
    SaunaResponse,
    SaunaUpdate,
    SaunaDetailResponse,
    SaunaImageResponse,
    OperatingHoursResponse,
)

router = APIRouter(prefix="/saunas", tags=["saunas"])


def _sauna_to_response(s: Sauna) -> SaunaResponse:
    """Convert Sauna model to SaunaResponse"""
    return SaunaResponse(
        id=s.id,
        name=s.name,
        description=s.description,
        capacity=s.capacity,
        hourly_rate=s.hourly_rate,
        image_url=s.image_url,
        amenities=s.amenities,
        is_active=s.is_active,
        open_time=s.open_time,
        close_time=s.close_time,
        address=s.address,
        road_address=s.road_address,
        latitude=s.latitude,
        longitude=s.longitude,
        phone=s.phone,
        sauna_type=s.sauna_type,
        temperature_min=s.temperature_min,
        temperature_max=s.temperature_max,
    )


def _sauna_to_detail_response(s: Sauna) -> SaunaDetailResponse:
    """Convert Sauna model to SaunaDetailResponse with images and operating hours"""
    images = [
        SaunaImageResponse(
            id=img.id,
            image_url=img.image_url,
            display_order=img.display_order,
            is_primary=img.is_primary,
        )
        for img in sorted(s.images, key=lambda x: (not x.is_primary, x.display_order))
    ]

    hours = [
        OperatingHoursResponse(
            id=h.id,
            day_of_week=h.day_of_week,
            open_time=h.open_time,
            close_time=h.close_time,
            is_closed=h.is_closed,
        )
        for h in sorted(s.operating_hours, key=lambda x: x.day_of_week)
    ]

    return SaunaDetailResponse(
        id=s.id,
        name=s.name,
        description=s.description,
        capacity=s.capacity,
        hourly_rate=s.hourly_rate,
        image_url=s.image_url,
        amenities=s.amenities,
        is_active=s.is_active,
        open_time=s.open_time,
        close_time=s.close_time,
        address=s.address,
        road_address=s.road_address,
        latitude=s.latitude,
        longitude=s.longitude,
        phone=s.phone,
        sauna_type=s.sauna_type,
        temperature_min=s.temperature_min,
        temperature_max=s.temperature_max,
        images=images,
        operating_hours=hours,
    )


@router.get("", response_model=list[SaunaResponse])
async def list_saunas(
    sauna_type: str | None = Query(None),
    min_price: float | None = Query(None),
    max_price: float | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    List all active saunas with optional filtering.

    Query parameters:
    - sauna_type: Filter by sauna type (traditional, smoke, infrared, steam, etc.)
    - min_price: Filter by minimum hourly rate
    - max_price: Filter by maximum hourly rate
    """
    query = select(Sauna).where(Sauna.is_active == True)

    if sauna_type:
        query = query.where(Sauna.sauna_type == sauna_type)

    if min_price is not None:
        query = query.where(Sauna.hourly_rate >= min_price)

    if max_price is not None:
        query = query.where(Sauna.hourly_rate <= max_price)

    query = query.order_by(Sauna.name)
    result = await db.execute(query)

    return [_sauna_to_response(s) for s in result.scalars().all()]


@router.get("/{sauna_id}", response_model=SaunaDetailResponse)
async def get_sauna(sauna_id: str, db: AsyncSession = Depends(get_db)):
    """Get detailed sauna information including images and operating hours"""
    result = await db.execute(
        select(Sauna)
        .where(Sauna.id == sauna_id)
        .options(
            selectinload(Sauna.images),
            selectinload(Sauna.operating_hours),
        )
    )
    sauna = result.scalar_one_or_none()
    if not sauna:
        raise HTTPException(status_code=404, detail="사우나를 찾을 수 없습니다")
    return _sauna_to_detail_response(sauna)


@router.post("", response_model=SaunaResponse)
async def create_sauna(
    data: SaunaCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create a new sauna (admin only)"""
    sauna = Sauna(**data.model_dump())
    db.add(sauna)
    await db.commit()
    await db.refresh(sauna)
    return _sauna_to_response(sauna)


@router.put("/{sauna_id}", response_model=SaunaResponse)
async def update_sauna(
    sauna_id: str,
    data: SaunaUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update sauna information (admin only)"""
    result = await db.execute(select(Sauna).where(Sauna.id == sauna_id))
    sauna = result.scalar_one_or_none()
    if not sauna:
        raise HTTPException(status_code=404, detail="사우나를 찾을 수 없습니다")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(sauna, key, value)
    await db.commit()
    await db.refresh(sauna)
    return _sauna_to_response(sauna)


@router.post("/{sauna_id}/images", response_model=SaunaImageResponse)
async def add_sauna_image(
    sauna_id: str,
    image_url: str = Query(...),
    display_order: int = Query(0),
    is_primary: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Add an image to a sauna (admin only)"""
    result = await db.execute(select(Sauna).where(Sauna.id == sauna_id))
    sauna = result.scalar_one_or_none()
    if not sauna:
        raise HTTPException(status_code=404, detail="사우나를 찾을 수 없습니다")

    # If marking as primary, unmark other primary images
    if is_primary:
        await db.execute(
            update(SaunaImage)
            .where(and_(SaunaImage.sauna_id == sauna_id, SaunaImage.is_primary == True))
            .values(is_primary=False)
        )

    image = SaunaImage(
        sauna_id=sauna_id,
        image_url=image_url,
        display_order=display_order,
        is_primary=is_primary,
    )
    db.add(image)
    await db.commit()
    await db.refresh(image)

    return SaunaImageResponse(
        id=image.id,
        image_url=image.image_url,
        display_order=image.display_order,
        is_primary=image.is_primary,
    )


@router.delete("/{sauna_id}/images/{image_id}", status_code=204)
async def delete_sauna_image(
    sauna_id: str,
    image_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete an image from a sauna (admin only)"""
    result = await db.execute(
        select(SaunaImage).where(
            and_(SaunaImage.id == image_id, SaunaImage.sauna_id == sauna_id)
        )
    )
    image = result.scalar_one_or_none()
    if not image:
        raise HTTPException(status_code=404, detail="이미지를 찾을 수 없습니다")

    await db.delete(image)
    await db.commit()
