-- Create Database
CREATE DATABASE iot_db;

-- Use Database
-- (psql me \c iot_db use karna)

-- ==============================
-- 1. USERS TABLE
-- ==============================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    password TEXT NOT NULL
);

-- ==============================
-- 2. MINERS TABLE
-- ==============================
CREATE TABLE miners (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT UNIQUE
);

-- ==============================
-- 3. SENSOR DATA TABLE (UPDATED)
-- ==============================
CREATE TABLE sensor_data (
    id SERIAL PRIMARY KEY,
    miner_id INT REFERENCES miners(id) ON DELETE CASCADE,
    
    -- Multi-sensor values
    mq5 INT,
    mq9 INT,
    mq135 INT,
    
    temp FLOAT,
    humidity FLOAT,
    bpm FLOAT,
    
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 4. ALERTS TABLE (UPDATED)
-- ==============================
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    miner_id INT REFERENCES miners(id) ON DELETE CASCADE,
    
    trigger_value FLOAT,        -- value that triggered alert
    alert_type TEXT,            -- HIGH_TEMPERATURE / GAS_LEAKAGE / etc
    sensor_type TEXT,           -- Multi-Sensor / Manual SOS
    
    source TEXT,                -- auto / manual
    is_resolved BOOLEAN DEFAULT FALSE,
    
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);