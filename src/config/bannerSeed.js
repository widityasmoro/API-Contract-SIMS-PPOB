const defaultBanners = [
  ['Banner 1', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 1],
  ['Banner 2', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 2],
  ['Banner 3', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 3],
  ['Banner 4', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 4],
  ['Banner 5', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 5],
  ['Banner 6', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet', 6],
];

async function ensureBannerData(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS banners (
      id SERIAL PRIMARY KEY,
      banner_name VARCHAR(100) NOT NULL,
      banner_image TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query('ALTER TABLE banners ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0');
  await db.query('ALTER TABLE banners ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
  await db.query('ALTER TABLE banners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');

  const { rows } = await db.query('SELECT COUNT(*)::int AS total FROM banners');
  if (rows[0].total > 0) {
    return;
  }

  const insertQuery = `
    INSERT INTO banners (banner_name, banner_image, description, sort_order)
    VALUES ($1, $2, $3, $4)
  `;

  for (const banner of defaultBanners) {
    await db.query(insertQuery, banner);
  }
}

module.exports = ensureBannerData;
