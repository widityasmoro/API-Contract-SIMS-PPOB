const db = require('../config/db');

exports.getBanners = async (_req, res) => {
  try {
    const query = `
      SELECT banner_name, banner_image, description
      FROM banners
      ORDER BY sort_order ASC, id ASC
    `;
    const { rows } = await db.query(query);

    return res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: rows,
    });
  } catch (err) {
    console.error('getBanners error:', err);
    return res.status(500).json({
      status: 1,
      message: 'Gagal mengambil banner',
      data: null,
    });
  }
};
