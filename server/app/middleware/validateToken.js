const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const validateToken = async (req, res, next) => {
  try {
    const token = req.body.accessToken || req.headers['authorization'];

    if (!token) {
      return res.status(401).json({
        status: 1,
        message: 'ACCESS_DENIED',
      });
    }

    // 🔹 Decode request token
    let decodedToken;
    try {
      decodedToken = jwt.decode(token);
      if (!decodedToken) throw new Error('FAILED_TO_DECODE_REQUEST_TOKEN');
    } catch (err) {
      return res.status(401).json({
        status: 0,
        message: 'INVALID_REQUEST_TOKEN',
        error: err.message,
      });
    }

    // Handle "Bearer <token>"
    const actualToken = token.startsWith('Bearer ')
      ? token.slice(7).trim()
      : token;

    // Step 1: Check request token expiry
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      return res.status(401).json({
        status: 0,
        message: 'NOT_MATCHED', // expired
      });
    }

    // Step 2: Fetch user from DB
    const dbUser = await User.findById(decodedToken.id);
    if (!dbUser || !dbUser.token) {
      return res.status(401).json({
        status: 0,
        message: 'USER_NOT_FOUND_OR_NO_TOKEN',
      });
    }

    // Step 3: Compare random Id (request vs DB)
    if (decodedToken.randomId !== decodedToken.randomId) {
      return res.status(403).json({
        status: 0,
        message: 'TOKEN_MISMATCH',
      });
    }

    // Step 4: Verify request token signature
    jwt.verify(actualToken, process.env.ACCESS_JWT_SECRET, {
      issuer: process.env.APP_NAME,
    });

    // Attach user info
    req.user = {
      id: decodedToken.id,
      randomId: decodedToken.randomId,
      role: decodedToken.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      status: 0,
      message: 'INVALID_TOKEN',
      error: err.message,
    });
  }
};

module.exports = validateToken;
