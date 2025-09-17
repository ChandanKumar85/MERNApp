const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { GenerateToken } = require('../utils/tokenGenerate');

const validateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken || req.headers['authorization'];

    if (!refreshToken) {
      return res.status(401).json({
        status: 0,
        message: "NO_TOKEN_PROVIDED",
      });
    }
    
    // Verify refresh token
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_JWT_SECRET,
      async (err, decoded) => {
        const { id } = decoded || {};
        if (err) {
          return res.status(403).json({
            status: 0,
            message: "INVALID_REFRESH_TOKEN",
          });
        }

        // Check user in DB
        const userData = await User.findById(id);
        if (!userData) {
          return res.status(404).json({
            status: 0,
            message: "USER_NOT_FOUND",
          });
        }

        // (Optional) Check if refresh token is expired manually
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
          return res.status(403).json({
            status: 0,
            message: "REFRESH_TOKEN_EXPIRED",
          });
        }

        // Access token
        const randomId = crypto.randomUUID();
        const accessToken = GenerateToken({ id: String(userData._id), randomId: randomId, role: userData.role }, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN, issuer: process.env.APP_NAME });
        
        req.user = {
          id: String(userData._id),
          accessToken: accessToken,
          refreshToken: refreshToken
        };

        next();
      }
    );
  } catch (err) {
    return res.status(401).json({
      status: 0,
      message: 'INVALID_REFRESH_TOKEN',
      error: err.message,
    });
  }
};

module.exports = validateRefreshToken;
