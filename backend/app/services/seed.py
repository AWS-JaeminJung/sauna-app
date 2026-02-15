from sqlalchemy import select

from app.core.database import async_session
from app.core.security import get_password_hash
from app.models.sauna import Sauna
from app.models.sauna_image import SaunaImage
from app.models.operating_hours import OperatingHours
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

        # Create sample saunas with enhanced location data (용인시 양지면 근처)
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
                address="경기도 용인시 양지면 양지중로 123",
                road_address="경기도 용인시 양지면 봉양로 45",
                latitude=37.2401,
                longitude=127.0742,
                phone="031-234-5678",
                sauna_type="traditional",
                temperature_min=80,
                temperature_max=100,
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
                address="경기도 용인시 양지면 양지남로 456",
                road_address="경기도 용인시 양지면 봉양로 100",
                latitude=37.2425,
                longitude=127.0765,
                phone="031-234-5679",
                sauna_type="smoke",
                temperature_min=70,
                temperature_max=95,
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
                address="경기도 용인시 양지면 양지동로 789",
                road_address="경기도 용인시 양지면 봉양로 200",
                latitude=37.2380,
                longitude=127.0720,
                phone="031-234-5680",
                sauna_type="steam",
                temperature_min=40,
                temperature_max=50,
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
                address="경기도 용인시 양지면 양지서로 321",
                road_address="경기도 용인시 양지면 봉양로 300",
                latitude=37.2410,
                longitude=127.0780,
                phone="031-234-5681",
                sauna_type="infrared",
                temperature_min=45,
                temperature_max=60,
            ),
        ]

        # Add saunas and their associated images and operating hours
        for idx, sauna in enumerate(saunas):
            db.add(sauna)
            await db.flush()  # Flush to generate IDs

            # Add sample images for each sauna (2-3 images each)
            images = [
                SaunaImage(
                    sauna_id=sauna.id,
                    image_url=f"/images/sauna_{idx}_main.jpg",
                    display_order=0,
                    is_primary=True,
                ),
                SaunaImage(
                    sauna_id=sauna.id,
                    image_url=f"/images/sauna_{idx}_interior.jpg",
                    display_order=1,
                    is_primary=False,
                ),
                SaunaImage(
                    sauna_id=sauna.id,
                    image_url=f"/images/sauna_{idx}_relaxation.jpg",
                    display_order=2,
                    is_primary=False,
                ),
            ]

            for img in images:
                db.add(img)

            # Add operating hours for each sauna (매일 다른 시간, 월요일 휴무 예시)
            hours_data = [
                (0, True, None, None),  # Monday - closed
                (1, False, "10:00", "23:00"),  # Tuesday
                (2, False, "10:00", "23:00"),  # Wednesday
                (3, False, "10:00", "23:00"),  # Thursday
                (4, False, "09:00", "24:00"),  # Friday
                (5, False, "09:00", "24:00"),  # Saturday
                (6, False, "10:00", "22:00"),  # Sunday
            ]

            for day_of_week, is_closed, open_time, close_time in hours_data:
                # Use sauna's default open/close time if not specified
                if open_time is None:
                    open_time = sauna.open_time
                if close_time is None:
                    close_time = sauna.close_time

                operating_hour = OperatingHours(
                    sauna_id=sauna.id,
                    day_of_week=day_of_week,
                    open_time=open_time,
                    close_time=close_time,
                    is_closed=is_closed,
                )
                db.add(operating_hour)

        await db.commit()
