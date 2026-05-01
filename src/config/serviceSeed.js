const defaultServices = [
  ['PAJAK', 'Pajak PBB', 'https://nutech-integrasi.app/dummy.jpg', 40000, 1],
  ['PLN', 'Listrik', 'https://nutech-integrasi.app/dummy.jpg', 10000, 2],
  ['PDAM', 'PDAM Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 40000, 3],
  ['PULSA', 'Pulsa', 'https://nutech-integrasi.app/dummy.jpg', 40000, 4],
  ['PGN', 'PGN Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 50000, 5],
  ['MUSIK', 'Musik Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 50000, 6],
  ['TV', 'TV Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 50000, 7],
  ['PAKET_DATA', 'Paket data', 'https://nutech-integrasi.app/dummy.jpg', 50000, 8],
  ['VOUCHER_GAME', 'Voucher Game', 'https://nutech-integrasi.app/dummy.jpg', 100000, 9],
  ['VOUCHER_MAKANAN', 'Voucher Makanan', 'https://nutech-integrasi.app/dummy.jpg', 100000, 10],
  ['QURBAN', 'Qurban', 'https://nutech-integrasi.app/dummy.jpg', 200000, 11],
  ['ZAKAT', 'Zakat', 'https://nutech-integrasi.app/dummy.jpg', 300000, 12],
];

async function ensureServiceData(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      service_code VARCHAR(50) NOT NULL UNIQUE,
      service_name VARCHAR(100) NOT NULL,
      service_icon TEXT NOT NULL,
      service_tariff INTEGER NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query('ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0');
  await db.query('ALTER TABLE services ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
  await db.query('ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');

  const { rows } = await db.query('SELECT COUNT(*)::int AS total FROM services');
  if (rows[0].total > 0) {
    return;
  }

  const insertQuery = `
    INSERT INTO services (service_code, service_name, service_icon, service_tariff, sort_order)
    VALUES ($1, $2, $3, $4, $5)
  `;

  for (const service of defaultServices) {
    await db.query(insertQuery, service);
  }
}

module.exports = ensureServiceData;
