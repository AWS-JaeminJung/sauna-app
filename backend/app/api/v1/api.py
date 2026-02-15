from fastapi import APIRouter

from app.api.v1.endpoints import admin, auth, bookings, reviews, saunas

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(saunas.router)
api_router.include_router(bookings.router)
api_router.include_router(reviews.router)
api_router.include_router(admin.router)
