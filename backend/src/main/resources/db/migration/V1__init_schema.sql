CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(30) NOT NULL,
    apartment_name VARCHAR(100),
    block_no VARCHAR(20),
    flat_no VARCHAR(20),
    meter_id VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unique constraint for flat within a specific block/apartment
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_flat ON users (apartment_name, block_no, flat_no) 
WHERE apartment_name IS NOT NULL AND block_no IS NOT NULL AND flat_no IS NOT NULL;