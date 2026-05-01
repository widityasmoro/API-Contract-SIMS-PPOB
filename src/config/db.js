const { Pool } = require('pg');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const poolConfig = databaseUrl
  ? {
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      // Keep password as string to satisfy SCRAM auth requirement.
      password: String(
        process.env.DB_PASS ??
        process.env.DB_PASSWORD ??
        process.env.PGPASSWORD ??
        ''
      ).trim(),
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 5432,
    };

if (!databaseUrl) {
  const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

const pool = new Pool(poolConfig);

module.exports = pool;
