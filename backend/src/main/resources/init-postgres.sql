-- PostgreSQL Database Initialization Script
-- This script will be run when the PostgreSQL container starts

-- Create database if not exists (already handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS aicodereview;

-- Switch to the database
\c aicodereview;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE aicodereview TO postgres;
