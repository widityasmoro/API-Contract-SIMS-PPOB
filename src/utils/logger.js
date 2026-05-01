const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const logDir = path.resolve(__dirname, '../../logs');

function getLogFilePath(date = new Date()) {
  const fileName = `${date.toISOString().slice(0, 10)}.log`;
  return path.join(logDir, fileName);
}

function writeLog(level, message, meta = {}) {
  fs.mkdirSync(logDir, { recursive: true });

  const entry = {
    time: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  fs.appendFileSync(getLogFilePath(), `${JSON.stringify(entry)}\n`, 'utf8');
}

function getUserFromAuthorization(authHeader = '') {
  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) {
    return null;
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev-jwt-secret-change-this';
    const payload = jwt.verify(token, secret);
    return payload.email || null;
  } catch (_err) {
    return null;
  }
}

function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    writeLog('info', 'HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      status_code: res.statusCode,
      duration_ms: Date.now() - startedAt,
      ip: req.ip,
      user: getUserFromAuthorization(req.headers.authorization || ''),
    });
  });

  next();
}

module.exports = {
  requestLogger,
  writeLog,
};
