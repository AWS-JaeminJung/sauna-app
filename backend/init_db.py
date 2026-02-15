import asyncio
import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine

DATABASE_URL = os.environ.get("DATABASE_URL")

async def init_database():
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        # Create users table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email)
            )
        """))
        
        # Create saunas table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS saunas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                capacity INT NOT NULL,
                hourly_rate DECIMAL(10, 2) NOT NULL,
                image_url VARCHAR(512),
                amenities JSON,
                is_active BOOLEAN DEFAULT TRUE,
                open_time TIME,
                close_time TIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_name (name),
                INDEX idx_is_active (is_active)
            )
        """))
        
        # Create bookings table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                sauna_id INT NOT NULL,
                start_time DATETIME NOT NULL,
                end_time DATETIME NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (sauna_id) REFERENCES saunas(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_sauna_id (sauna_id),
                INDEX idx_start_time (start_time),
                INDEX idx_status (status)
            )
        """))
        
        # Insert sample data
        await conn.execute(text("""
            INSERT INTO saunas (name, description, capacity, hourly_rate, is_active, open_time, close_time, amenities)
            VALUES
            ('프리미엄 사우나', '고급스러운 인테리어와 최신 시설을 갖춘 프리미엄 사우나입니다.', 10, 30000, TRUE, '09:00:00', '22:00:00', '["WiFi", "Shower", "Locker", "Towel"]'),
            ('패밀리 사우나', '가족 단위로 편안하게 이용할 수 있는 넓은 공간의 사우나입니다.', 15, 25000, TRUE, '10:00:00', '21:00:00', '["WiFi", "Shower", "Kids Area", "Parking"]'),
            ('VIP 프라이빗 사우나', '완전 개인 공간으로 프라이버시가 보장되는 VIP 사우나입니다.', 4, 50000, TRUE, '09:00:00', '23:00:00', '["WiFi", "Shower", "Private", "Massage Chair", "Mini Bar"]')
            ON DUPLICATE KEY UPDATE name=name
        """))
        
    await engine.dispose()
    print("✓ Database initialized successfully")
    return {"statusCode": 200, "body": "Database initialized"}

def handler(event, context):
    return asyncio.run(init_database())

if __name__ == "__main__":
    import sys
    sys.exit(asyncio.run(init_database()))
