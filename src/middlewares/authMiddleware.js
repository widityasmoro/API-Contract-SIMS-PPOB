const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return res.status(401).json({
        status: 108,
        message: 'Token tidak tidak valid atau kadaluwarsa',
        data: null,
      });
    }

    const secret = process.env.JWT_SECRET || 'dev-jwt-secret-change-this';
    const payload = jwt.verify(token, secret);

    req.user = {
      email: payload.email,
    };

    return next();
  } catch (err) {
    return res.status(401).json({
      status: 108,
      message: 'Token tidak tidak valid atau kadaluwarsa',
      data: null,
    });
  }
};
