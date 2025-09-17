const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const validateToken = async (req, res, next) => {
  try {
    const token = req.body.accessToken || req.headers['authorization'];
    const uId = req.body.id;

    if (!token) {
      return res.status(401).json({
        status: 1,
        message: 'ACCESS_DENIED',
      });
    }

    // Handle "Bearer <token>"
    const actualToken = token.startsWith('Bearer ')
      ? token.slice(7).trim()
      : token;

    // 🔹 Decode request token
    let decodedReq;
    try {
      decodedReq = jwt.decode(actualToken);
      if (!decodedReq) throw new Error('FAILED_TO_DECODE_REQUEST_TOKEN');
    } catch (err) {
      return res.status(401).json({
        status: 0,
        message: 'INVALID_REQUEST_TOKEN',
        error: err.message,
      });
    }

    // Step 1: Check request token expiry
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedReq.exp && decodedReq.exp < currentTime) {
      return res.status(401).json({
        status: 0,
        message: 'NOT_MATCHED', // expired
      });
    }

    // Step 2: Fetch user from DB
    const dbUser = await User.findById(uId);
    if (!dbUser || !dbUser.token) {
      return res.status(401).json({
        status: 0,
        message: 'USER_NOT_FOUND_OR_NO_TOKEN',
      });
    }

    // 🔹 Decode DB token
    let decodedDb;
    try {
      decodedDb = jwt.decode(dbUser.token);
      if (!decodedDb) throw new Error('FAILED_TO_DECODE_DB_TOKEN');
    } catch (err) {
      return res.status(401).json({
        status: 0,
        message: 'INVALID_DB_TOKEN',
        error: err.message,
      });
    }

    // Step 3: Compare randomId (request vs DB)
    if (decodedReq.randomId !== decodedDb.randomId) {
      return res.status(401).json({
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
      id: uId,
      randomId: decodedReq.randomId,
      role: decodedReq.role,
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
