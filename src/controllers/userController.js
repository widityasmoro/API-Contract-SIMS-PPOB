const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateInvoiceNumber() {
  const now = new Date();
  const date = [
    String(now.getUTCDate()).padStart(2, '0'),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    now.getUTCFullYear(),
  ].join('');
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-6);

  return `INV${date}-${suffix}`;
}

exports.getUsers = async (req, res) => {
  try {
    const query = "SELECT id, email, first_name, last_name, created_at, updated_at, is_active, profile_image FROM users";
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({
      message: err.message,
      debug: {
        source: 'userController.getUsers',
        pid: process.pid,
        hasDbPass: typeof process.env.DB_PASS === 'string',
        hasDbPassword: typeof process.env.DB_PASSWORD === 'string',
        hasPgPassword: typeof process.env.PGPASSWORD === 'string',
      },
    });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    if (!EMAIL_REGEX.test(String(email || '').trim())) {
      return res.status(400).json({
        status: 102,
        message: 'Paramter email tidak sesuai format',
        data: null,
      });
    }

    const query = "SELECT id, email, first_name, last_name, created_at, updated_at, is_active, profile_image FROM users WHERE email = $1";
    const { rows } = await db.query(query, [email]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error('getUserByEmail error:', err);
    res.status(500).json({
      message: err.message,
      debug: {
        source: 'userController.getUserByEmail',
        pid: process.pid,
      },
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !email || !password) {
      return res.status(400).json({
        status: 1,
        message: 'Registrasi gagal, data wajib belum lengkap',
        data: null,
      });
    }
    if (!EMAIL_REGEX.test(String(email || '').trim())) {
      return res.status(400).json({
        status: 102,
        message: 'Paramter email tidak sesuai format',
        data: null,
      });
    }
    if (String(password || '').length < 8) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter request password Length minimal 8 karakter',
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const query = "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id";
    await db.query(query, [first_name, last_name, email, hashedPassword]);
    res.status(201).json({
      status: 0,
      message: 'Registrasi berhasil silahkan login',
      data: null,
    });
  } catch (err) {
    console.error('createUser error:', err);
    if (err.code === '23505') {
      return res.status(409).json({
        status: 1,
        message: 'Registrasi gagal, email sudah terdaftar',
        data: null,
      });
    }

    res.status(500).json({
      status: 1,
      message: 'Registrasi gagal',
      data: null,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!EMAIL_REGEX.test(String(email || '').trim())) {
      return res.status(400).json({
        status: 102,
        message: 'Paramter email tidak sesuai format',
        data: null,
      });
    }

    if (String(password || '').length < 8) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter request password Length minimal 8 karakter',
        data: null,
      });
    }

    const query = 'SELECT email, password FROM users WHERE email = $1 LIMIT 1';
    const { rows } = await db.query(query, [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        status: 103,
        message: 'Username atau password salah',
        data: null,
      });
    }

    const isPasswordValid = await bcrypt.compare(String(password), user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 103,
        message: 'Username atau password salah',
        data: null,
      });
    }

    const secret = process.env.JWT_SECRET || 'dev-jwt-secret-change-this';
    const token = jwt.sign({ email: user.email }, secret, { expiresIn: '12h' });

    return res.status(200).json({
      status: 0,
      message: 'Login Sukses',
      data: {
        token,
      },
    });
  } catch (err) {
    console.error('loginUser error:', err);
    return res.status(500).json({
      status: 1,
      message: 'Login gagal',
      data: null,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const email = req.user?.email;
    const query = `
      SELECT email, first_name, last_name, profile_image
      FROM users
      WHERE email = $1
      LIMIT 1
    `;
    const { rows } = await db.query(query, [email]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        status: 1,
        message: 'User tidak ditemukan',
        data: null,
      });
    }

    return res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_image: user.profile_image,
      },
    });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({
      status: 1,
      message: 'Gagal mengambil profile',
      data: null,
    });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const email = req.user?.email;
    const query = `
      SELECT balance
      FROM users
      WHERE email = $1
      LIMIT 1
    `;
    const { rows } = await db.query(query, [email]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        status: 1,
        message: 'User tidak ditemukan',
        data: null,
      });
    }

    return res.status(200).json({
      status: 0,
      message: 'Get Balance Berhasil',
      data: {
        balance: user.balance,
      },
    });
  } catch (err) {
    console.error('getBalance error:', err);
    return res.status(500).json({
      status: 1,
      message: 'Gagal mengambil balance',
      data: null,
    });
  }
};

exports.topUpBalance = async (req, res) => {
  const topUpAmount = req.body?.top_up_amount;
  const isValidAmount = (
    typeof topUpAmount === 'number' &&
    Number.isFinite(topUpAmount) &&
    Number.isInteger(topUpAmount) &&
    topUpAmount >= 0
  );

  if (!isValidAmount) {
    return res.status(400).json({
      status: 102,
      message: 'Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0',
      data: null,
    });
  }

  const client = await db.connect();

  try {
    const email = req.user?.email;

    await client.query('BEGIN');

    const updateQuery = `
      UPDATE users
      SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP
      WHERE email = $2
      RETURNING id, balance
    `;
    const { rows } = await client.query(updateQuery, [topUpAmount, email]);
    const user = rows[0];

    if (!user) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: 1,
        message: 'User tidak ditemukan',
        data: null,
      });
    }

    const invoiceNumber = generateInvoiceNumber();
    const transactionQuery = `
      INSERT INTO transactions (
        user_id,
        invoice_number,
        service_name,
        transaction_type,
        amount,
        total_amount,
        balance_after
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await client.query(transactionQuery, [
      user.id,
      invoiceNumber,
      'Top Up balance',
      'TOPUP',
      topUpAmount,
      topUpAmount,
      user.balance,
    ]);

    await client.query('COMMIT');

    return res.status(200).json({
      status: 0,
      message: 'Top Up Balance berhasil',
      data: {
        balance: user.balance,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('topUpBalance error:', err);
    return res.status(500).json({
      status: 1,
      message: 'Top Up Balance gagal',
      data: null,
    });
  } finally {
    client.release();
  }
};

exports.createTransaction = async (req, res) => {
  const serviceCode = String(req.body?.service_code || '').trim();

  if (!serviceCode) {
    return res.status(400).json({
      status: 102,
      message: 'Service ataus Layanan tidak ditemukan',
      data: null,
    });
  }

  const client = await db.connect();

  try {
    const email = req.user?.email;

    await client.query('BEGIN');

    const serviceQuery = `
      SELECT service_code, service_name, service_tariff
      FROM services
      WHERE service_code = $1
      LIMIT 1
    `;
    const serviceResult = await client.query(serviceQuery, [serviceCode]);
    const service = serviceResult.rows[0];

    if (!service) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 102,
        message: 'Service ataus Layanan tidak ditemukan',
        data: null,
      });
    }

    const userQuery = `
      SELECT id, balance
      FROM users
      WHERE email = $1
      LIMIT 1
      FOR UPDATE
    `;
    const userResult = await client.query(userQuery, [email]);
    const user = userResult.rows[0];

    if (!user) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: 1,
        message: 'User tidak ditemukan',
        data: null,
      });
    }

    if (user.balance < service.service_tariff) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 102,
        message: 'Saldo tidak mencukupi',
        data: null,
      });
    }

    const balanceAfter = user.balance - service.service_tariff;
    const invoiceNumber = generateInvoiceNumber();
    const updateQuery = `
      UPDATE users
      SET balance = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    await client.query(updateQuery, [balanceAfter, user.id]);

    const transactionQuery = `
      INSERT INTO transactions (
        user_id,
        invoice_number,
        service_code,
        service_name,
        transaction_type,
        amount,
        total_amount,
        balance_after
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING invoice_number, service_code, service_name, transaction_type, total_amount, created_at
    `;
    const transactionResult = await client.query(transactionQuery, [
      user.id,
      invoiceNumber,
      service.service_code,
      service.service_name,
      'PAYMENT',
      service.service_tariff,
      service.service_tariff,
      balanceAfter,
    ]);
    const transaction = transactionResult.rows[0];

    await client.query('COMMIT');

    return res.status(200).json({
      status: 0,
      message: 'Transaksi berhasil',
      data: {
        invoice_number: transaction.invoice_number,
        service_code: transaction.service_code,
        service_name: transaction.service_name,
        transaction_type: transaction.transaction_type,
        total_amount: transaction.total_amount,
        created_on: transaction.created_at,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('createTransaction error:', err);
    return res.status(500).json({
      status: 1,
      message: 'Transaksi gagal',
      data: null,
    });
  } finally {
    client.release();
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const email = req.user?.email;
    const offset = Number.parseInt(req.query.offset, 10) || 0;
    const rawLimit = req.query.limit;
    const limit = rawLimit === undefined ? null : Number.parseInt(rawLimit, 10);

    const params = [email, Math.max(offset, 0)];
    let limitClause = '';

    if (Number.isInteger(limit) && limit >= 0) {
      params.push(limit);
      limitClause = 'LIMIT $3';
    }

    const query = `
      SELECT
        COALESCE(
          t.invoice_number,
          'INV' || TO_CHAR(t.created_at, 'DDMMYYYY') || '-' || LPAD(t.id::text, 3, '0')
        ) AS invoice_number,
        t.transaction_type,
        CASE
          WHEN t.transaction_type = 'TOPUP' THEN 'Top Up balance'
          ELSE COALESCE(t.service_name, '')
        END AS description,
        COALESCE(NULLIF(t.total_amount, 0), t.amount) AS total_amount,
        t.created_at AS created_on
      FROM transactions t
      INNER JOIN users u ON u.id = t.user_id
      WHERE u.email = $1
      ORDER BY t.created_at DESC, t.id DESC
      OFFSET $2
      ${limitClause}
    `;
    const { rows } = await db.query(query, params);

    return res.status(200).json({
      status: 0,
      message: 'Get History Berhasil',
      data: {
        offset: Math.max(offset, 0),
        limit: Number.isInteger(limit) && limit >= 0 ? limit : rows.length,
        records: rows,
      },
    });
  } catch (err) {
    console.error('getTransactionHistory error:', err);
    return res.status(500).json({
      status: 1,
      message: 'Gagal mengambil history transaksi',
      data: null,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const email = req.user?.email;
    const { first_name, last_name } = req.body;

    const updateQuery = `
      UPDATE users
      SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP
      WHERE email = $3
      RETURNING email, first_name, last_name, profile_image
    `;
    const { rows } = await db.query(updateQuery, [
      String(first_name || '').trim(),
      String(last_name || '').trim(),
      email,
    ]);

    const user = rows[0];
    if (!user) {
      return res.status(404).json({
        status: 1,
        message: 'User tidak ditemukan',
        data: null,
      });
    }

    return res.status(200).json({
      status: 0,
      message: 'Update Pofile berhasil',
      data: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_image: user.profile_image,
      },
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({
      status: 1,
      message: 'Update Profile gagal',
      data: null,
    });
  }
};

exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 102,
        message: 'Format Image tidak sesuai',
        data: null,
      });
    }

    const email = req.user?.email;
    const profileImageUrl = req.file.buffer
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const query = `
      UPDATE users
      SET profile_image = $1, updated_at = CURRENT_TIMESTAMP
      WHERE email = $2
      RETURNING email, first_name, last_name, profile_image
    `;
    const { rows } = await db.query(query, [profileImageUrl, email]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        status: 1,
        message: 'User tidak ditemukan',
        data: null,
      });
    }

    return res.status(200).json({
      status: 0,
      message: 'Update Profile Image berhasil',
      data: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_image: user.profile_image,
      },
    });
  } catch (err) {
    console.error('updateProfileImage error:', err);
    return res.status(500).json({
      status: 1,
      message: 'Update Profile Image gagal',
      data: null,
    });
  }
};
