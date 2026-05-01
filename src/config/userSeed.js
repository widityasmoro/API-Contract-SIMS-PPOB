async function ensureUserData(db) {
  await db.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL UNIQUE,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100),
      password TEXT NOT NULL,
      balance INTEGER NOT NULL DEFAULT 0,
      profile_image TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query('ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS balance INTEGER NOT NULL DEFAULT 0');
  await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT');
  await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE');
  await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
  await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
  await db.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      invoice_number VARCHAR(100),
      service_code VARCHAR(50),
      service_name VARCHAR(100),
      transaction_type VARCHAR(50) NOT NULL,
      amount INTEGER NOT NULL,
      total_amount INTEGER NOT NULL DEFAULT 0,
      balance_after INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100)');
  await db.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS service_code VARCHAR(50)');
  await db.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS service_name VARCHAR(100)');
  await db.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) NOT NULL DEFAULT \'TOPUP\'');
  await db.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount INTEGER NOT NULL DEFAULT 0');
  await db.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS total_amount INTEGER NOT NULL DEFAULT 0');
  await db.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS balance_after INTEGER NOT NULL DEFAULT 0');
  await db.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
}

module.exports = ensureUserData;
