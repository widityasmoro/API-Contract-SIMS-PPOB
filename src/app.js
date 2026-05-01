const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();
const db = require('./config/db');
const ensureUserData = require('./config/userSeed');
const ensureBannerData = require('./config/bannerSeed');
const ensureServiceData = require('./config/serviceSeed');
const bannerController = require('./controllers/bannerController');
const userController = require('./controllers/userController');
const { verifyToken } = require('./middlewares/authMiddleware');
const { requestLogger, writeLog } = require('./utils/logger');

console.log(`[BOOT] PID ${process.pid}`);

db.query('SELECT 1')
  .then(async () => {
    console.log('DB Connected');
    await ensureUserData(db);
    await ensureBannerData(db);
    await ensureServiceData(db);
  })
  .then(() => console.log('Master data ready'))
  .catch(err => console.error('DB Error:', err));

const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use('/uploads', express.static(path.resolve(__dirname, '../public/uploads')));

app.get('/banner', bannerController.getBanners);
app.get('/balance', verifyToken, userController.getBalance);
app.post('/topup', verifyToken, userController.topUpBalance);
app.post('/transaction', verifyToken, userController.createTransaction);
app.get('/transaction/history', verifyToken, userController.getTransactionHistory);
app.use('/api', userRoutes);

app.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: 102,
      message: 'Format Image tidak sesuai',
      data: null,
    });
  }
  return next(err);
});

app.use((err, _req, res, _next) => {
  console.error('[UNHANDLED ERROR]', err);
  writeLog('error', 'Unhandled Error', {
    error: err.message,
    stack: err.stack,
  });
  return res.status(500).json({
    status: 1,
    message: 'Internal Server Error',
    data: null,
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('[SERVER ERROR]', err);
  writeLog('error', 'Server Error', {
    error: err.message,
    stack: err.stack,
  });
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  writeLog('error', 'Uncaught Exception', {
    error: err.message,
    stack: err.stack,
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
  writeLog('error', 'Unhandled Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});
