-- Migration: Add foto column to users table
-- Run this SQL script if your database already exists and you need to add the foto column

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS foto VARCHAR(500);

-- If you want to set a default value for existing records (optional):
-- UPDATE users SET foto = NULL WHERE foto IS NULL;