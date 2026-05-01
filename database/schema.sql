-- Database Design / DDL for SIMS PPOB API
-- Target database: PostgreSQL

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  password TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  profile_image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  banner_name VARCHAR(100) NOT NULL,
  banner_image TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  service_code VARCHAR(50) NOT NULL UNIQUE,
  service_name VARCHAR(100) NOT NULL,
  service_icon TEXT NOT NULL,
  service_tariff INTEGER NOT NULL CHECK (service_tariff >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invoice_number VARCHAR(100),
  service_code VARCHAR(50),
  service_name VARCHAR(100),
  transaction_type VARCHAR(50) NOT NULL DEFAULT 'TOPUP',
  amount INTEGER NOT NULL DEFAULT 0 CHECK (amount >= 0),
  total_amount INTEGER NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  balance_after INTEGER NOT NULL DEFAULT 0 CHECK (balance_after >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_services_service_code ON services(service_code);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

INSERT INTO banners (banner_name, banner_image, description, sort_order)
VALUES
  ('Banner 1', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 1),
  ('Banner 2', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 2),
  ('Banner 3', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 3),
  ('Banner 4', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 4),
  ('Banner 5', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 5),
  ('Banner 6', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 6);

INSERT INTO services (service_code, service_name, service_icon, service_tariff, sort_order)
VALUES
  ('PAJAK', 'Pajak PBB', 'https://nutech-integrasi.app/dummy.jpg', 40000, 1),
  ('PLN', 'Listrik', 'https://nutech-integrasi.app/dummy.jpg', 10000, 2),
  ('PDAM', 'PDAM Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 40000, 3),
  ('PULSA', 'Pulsa', 'https://nutech-integrasi.app/dummy.jpg', 40000, 4),
  ('PGN', 'PGN Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 50000, 5),
  ('MUSIK', 'Musik Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 50000, 6),
  ('TV', 'TV Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 50000, 7),
  ('PAKET_DATA', 'Paket data', 'https://nutech-integrasi.app/dummy.jpg', 50000, 8),
  ('VOUCHER_GAME', 'Voucher Game', 'https://nutech-integrasi.app/dummy.jpg', 100000, 9),
  ('VOUCHER_MAKANAN', 'Voucher Makanan', 'https://nutech-integrasi.app/dummy.jpg', 100000, 10),
  ('QURBAN', 'Qurban', 'https://nutech-integrasi.app/dummy.jpg', 200000, 11),
  ('ZAKAT', 'Zakat', 'https://nutech-integrasi.app/dummy.jpg', 300000, 12)
ON CONFLICT (service_code) DO NOTHING;
