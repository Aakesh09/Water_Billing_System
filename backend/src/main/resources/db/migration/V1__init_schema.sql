-- Flyway Database Migration Script
-- Schema Initialization for Smart Water Usage and Consumer Billing System

-- 1. Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(30) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'BUILDING_OWNER', 'RESIDENT')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Buildings Table
CREATE TABLE buildings (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Apartments / Flats Table
CREATE TABLE apartments (
    id BIGSERIAL PRIMARY KEY,
    building_id BIGINT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    flat_number VARCHAR(20) NOT NULL,
    resident_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (building_id, flat_number)
);

-- 4. Water Meters Table
CREATE TABLE water_meters (
    id BIGSERIAL PRIMARY KEY,
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    apartment_id BIGINT UNIQUE REFERENCES apartments(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Meter Readings Table (Smart Usage Tracking)
CREATE TABLE usage_readings (
    id BIGSERIAL PRIMARY KEY,
    meter_id BIGINT NOT NULL REFERENCES water_meters(id) ON DELETE CASCADE,
    liters_consumed NUMERIC(10, 2) NOT NULL,
    reading_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Billing Rates / Tariff Table
CREATE TABLE billing_tariffs (
    id BIGSERIAL PRIMARY KEY,
    rate_per_liter NUMERIC(8, 4) NOT NULL,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Water Bills Table
CREATE TABLE bills (
    id BIGSERIAL PRIMARY KEY,
    apartment_id BIGINT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    billing_start_date DATE NOT NULL,
    billing_end_date DATE NOT NULL,
    total_liters NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID', 'OVERDUE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Payments Table
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    bill_id BIGINT UNIQUE NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Query Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_usage_readings_meter_timestamp ON usage_readings(meter_id, reading_timestamp);
CREATE INDEX idx_bills_apartment_status ON bills(apartment_id, status);

-- Initial Data: Default Super Admin User (Password: admin123)
INSERT INTO users (full_name, email, password, phone_number, role)
VALUES (
    'System Super Admin',
    'admin@aquatrack.com',
    '$2a$10$e8O09P/WpS5mO311d9G6jO43B1K9xS0sL/mQfM.yS55fS4j8A2M.O', -- BCrypt hash of 'admin123'
    '9999999999',
    'SUPER_ADMIN'
);

-- Initial Data: Default Tariff Rate ($0.05 per liter)
INSERT INTO billing_tariffs (rate_per_liter) VALUES (0.0500);