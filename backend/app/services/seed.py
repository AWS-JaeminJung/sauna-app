from sqlalchemy import select

from app.core.database import async_session
from app.core.security import get_password_hash
from app.models.sauna import Sauna
from app.models.user import User


async def seed_data():
    async with async_session() as db:
        # Check if data already exists
        result = await db.execute(select(Sauna).limit(1))
        if result.scalar_one_or_none():
            return

        # Create admin user
        admin = User(
            email="admin@sauna.fi",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin",
            phone="010-0000-0000",
            is_admin=True,
        )
        db.add(admin)

        # Create sample saunas
        saunas = [
            Sauna(
                name="Traditional Finnish Sauna",
                description="Experience the authentic Finnish sauna tradition. Our traditional wood-heated sauna reaches temperatures of 80-100°C with natural steam from water thrown on hot stones (löyly). Includes birch whisks (vihta) for the full experience.",
                capacity=6,
                hourly_rate=80000,
                image_url="/images/traditional.jpg",
                amenities='["Shower", "Towels", "Birch Whisks", "Changing Room", "Rest Area"]',
                open_time="10:00",
                close_time="22:00",
            ),
            Sauna(
                name="Smoke Sauna (Savusauna)",
                description="The king of all saunas. Our smoke sauna is heated for 6-8 hours before use, creating an incredibly soft and gentle heat. The dark interior and smoky aroma provide an unforgettable experience that connects you to centuries of Finnish tradition.",
                capacity=8,
                hourly_rate=120000,
                image_url="/images/smoke.jpg",
                amenities='["Shower", "Towels", "Lake Access", "Changing Room", "Rest Area", "Refreshments"]',
                open_time="14:00",
                close_time="22:00",
            ),
            Sauna(
                name="Steam Room (Höyrysauna)",
                description="A gentler alternative with 100% humidity. Our steam room operates at a comfortable 40-50°C, perfect for those who prefer milder heat. Infused with eucalyptus essence for a refreshing respiratory experience.",
                capacity=4,
                hourly_rate=60000,
                image_url="/images/steam.jpg",
                amenities='["Shower", "Towels", "Aromatherapy", "Changing Room"]',
                open_time="10:00",
                close_time="21:00",
            ),
            Sauna(
                name="Infrared Sauna",
                description="Modern infrared technology for deep tissue warmth. Operating at a comfortable 45-60°C, our infrared sauna is perfect for muscle recovery and relaxation. Individual panels allow you to customize your experience.",
                capacity=2,
                hourly_rate=50000,
                image_url="/images/infrared.jpg",
                amenities='["Shower", "Towels", "Music System", "Changing Room"]',
                open_time="09:00",
                close_time="22:00",
            ),
        ]

        for sauna in saunas:
            db.add(sauna)

        await db.commit()
