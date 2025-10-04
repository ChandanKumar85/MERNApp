const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const validateToken = async (req, res, next) => {
  try {
    const token = req.body.accessToken || req.headers['authorization'];

    // 🔹 FIXED: Status should be 0 for error
    if (!token) {
      return res.status(401).json({
        status: 0,
        message: 'ACCESS_DENIED',
      });
    }

    // Handle "Bearer <token>"
    const actualToken = token.startsWith('Bearer ')
      ? token.slice(7).trim()
      : token;

    // 🔹 FIXED: Verify token first to get decoded data
    let decodedToken;
    try {
      decodedToken = jwt.verify(actualToken, process.env.ACCESS_JWT_SECRET, {
        issuer: process.env.APP_NAME,
      });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 0,
          message: 'TOKEN_EXPIRED',
        });
      }
      return res.status(401).json({
        status: 0,
        message: 'INVALID_TOKEN',
        error: err.message,
      });
    }

    // Step 1: Fetch user from DB
    const dbUser = await User.findById(decodedToken.id);
    if (!dbUser || !dbUser.token) {
      return res.status(401).json({
        status: 0,
        message: 'USER_NOT_FOUND_OR_NO_TOKEN',
      });
    }

    // 🔹 FIXED: Compare random ID from token with stored randomId in DB
    if (decodedToken.randomId !== dbUser.randomId) {
      return res.status(403).json({
        status: 0,
        message: 'TOKEN_MISMATCH_SESSION_INVALID',
      });
    }

    // Attach user info
    req.user = {
      id: decodedToken.id,
      randomId: decodedToken.randomId,
      role: decodedToken.role,
    };

    next();
  } catch (err) {
    console.error("Token validation error:", err);
    return res.status(401).json({
      status: 0,
      message: 'INVALID_TOKEN',
      error: err.message,
    });
  }
};

module.exports = validateToken;