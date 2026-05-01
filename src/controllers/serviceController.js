const db = require('../config/db');

exports.getServices = async (_req, res) => {
  try {
    const query = `
      SELECT service_code, service_name, service_icon, service_tariff
      FROM services
      ORDER BY sort_order ASC, id ASC
    `;
    const { rows } = await db.query(query);

    return res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: rows,
    });
  } catch (err) {
    console.error('getServices error:', err);
    return res.status(500).json({
      status: 1,
      message: 'Gagal mengambil service',
      data: null,
    });
  }
};
