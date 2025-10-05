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
    let clientToken;
    try {
      clientToken = jwt.verify(actualToken, process.env.ACCESS_JWT_SECRET, {
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
    
    // Fetch user from DB
    const dbUser = await User.findById(clientToken.id);
    if (!dbUser || !dbUser.tokenId) {
      return res.status(401).json({
        status: 0,
        message: 'USER_NOT_FOUND',
      });
    }

    // Compare random ID from token with stored randomId in DB
    if (clientToken.tokenId !== dbUser.tokenId) {
      return res.status(403).json({
        status: 0,
        message: 'TOKEN_MISMATCH_SESSION_INVALID',
      });
    }

    // Attach user info
    req.user = {
      id: clientToken.id,
      tokenId: clientToken.tokenId,
      role: clientToken.role,
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