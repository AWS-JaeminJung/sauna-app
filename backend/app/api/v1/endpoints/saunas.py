from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.sauna import Sauna
from app.models.user import User
from app.schemas.sauna import SaunaCreate, SaunaResponse, SaunaUpdate

router = APIRouter(prefix="/saunas", tags=["saunas"])


@router.get("", response_model=list[SaunaResponse])
async def list_saunas(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Sauna).where(Sauna.is_active == True).order_by(Sauna.name)
    )
    return [
        SaunaResponse(
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
        )
        for s in result.scalars().all()
    ]


@router.get("/{sauna_id}", response_model=SaunaResponse)
async def get_sauna(sauna_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Sauna).where(Sauna.id == sauna_id))
    sauna = result.scalar_one_or_none()
    if not sauna:
        raise HTTPException(status_code=404, detail="Sauna not found")
    return SaunaResponse(
        id=sauna.id,
        name=sauna.name,
        description=sauna.description,
        capacity=sauna.capacity,
        hourly_rate=sauna.hourly_rate,
        image_url=sauna.image_url,
        amenities=sauna.amenities,
        is_active=sauna.is_active,
        open_time=sauna.open_time,
        close_time=sauna.close_time,
    )


@router.post("", response_model=SaunaResponse)
async def create_sauna(
    data: SaunaCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    sauna = Sauna(**data.model_dump())
    db.add(sauna)
    await db.commit()
    await db.refresh(sauna)
    return SaunaResponse(
        id=sauna.id,
        name=sauna.name,
        description=sauna.description,
        capacity=sauna.capacity,
        hourly_rate=sauna.hourly_rate,
        image_url=sauna.image_url,
        amenities=sauna.amenities,
        is_active=sauna.is_active,
        open_time=sauna.open_time,
        close_time=sauna.close_time,
    )


@router.put("/{sauna_id}", response_model=SaunaResponse)
async def update_sauna(
    sauna_id: str,
    data: SaunaUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Sauna).where(Sauna.id == sauna_id))
    sauna = result.scalar_one_or_none()
    if not sauna:
        raise HTTPException(status_code=404, detail="Sauna not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(sauna, key, value)
    await db.commit()
    await db.refresh(sauna)
    return SaunaResponse(
        id=sauna.id,
        name=sauna.name,
        description=sauna.description,
        capacity=sauna.capacity,
        hourly_rate=sauna.hourly_rate,
        image_url=sauna.image_url,
        amenities=sauna.amenities,
        is_active=sauna.is_active,
        open_time=sauna.open_time,
        close_time=sauna.close_time,
    )
