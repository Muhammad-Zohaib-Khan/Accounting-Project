const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.authenticate = async (req, res, next) => {
  try {
    // Skip auth for health check
    if (req.path === '/api/health') return next();

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};