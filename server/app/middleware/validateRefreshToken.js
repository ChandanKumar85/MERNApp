const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const User = require('../models/user.model');
const { GenerateToken, GenerateRefreshToken } = require('../utils/tokenGenerate');

const validateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken || req.headers['authorization'];

    if (!refreshToken) {
      return res.status(401).json({
        status: 0,
        message: "NO_TOKEN_PROVIDED",
      });
    }

    // ✅ Decode token without verification first to check expiry manually
    const decodedUnverified = jwt.decode(refreshToken);
    if (!decodedUnverified) {
      return res.status(401).json({
        status: 0,
        message: "INVALID_REFRESH_TOKEN",
      });
    }

    const currentTime = Math.floor(Date.now() / 1000);

    // ✅ Stop regenerating if refresh token is expired
    if (decodedUnverified.exp && decodedUnverified.exp < currentTime) {
      return res.status(401).json({
        status: 0,
        message: "REFRESH_TOKEN_EXPIRED",
      });
    }

    // ✅ Verify refresh token signature
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_JWT_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({
            status: 0,
            message: "INVALID_REFRESH_TOKEN",
          });
        }

        const { id, refreshTokenId } = decoded || {};

        // ✅ Validate user in DB
        const userData = await User.findById(id);
        if (!userData) {
          return res.status(404).json({
            status: 0,
            message: "USER_NOT_FOUND",
          });
        }

        // ✅ Ensure refresh token matches the latest stored one
        if (refreshTokenId !== userData.refreshTokenId) {
          return res.status(403).json({
            status: 0,
            message: "USER_LOGGED_OUT",
          });
        }

        // ✅ Generate new Access Token
        const tokenId = crypto.randomUUID();
        const accessToken = GenerateToken(
          { id: String(userData._id), tokenId, role: userData.role },
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN, issuer: process.env.APP_NAME }
        );

        // ✅ Generate new Refresh Token
        const newRefreshTokenId = crypto.randomUUID();
        const newRefreshToken = GenerateRefreshToken(
          { id: userData._id, refreshTokenId: newRefreshTokenId },
          { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN, issuer: process.env.APP_NAME }
        );

        // ✅ Attach user info for next handler
        req.user = {
          id: String(userData._id),
          accessToken,
          refreshToken: newRefreshToken,
          tokenId,
          refreshTokenId: newRefreshTokenId,
        };

        next();
      }
    );
  } catch (err) {
    console.error("Refresh token validation error:", err);
    return res.status(401).json({
      status: 0,
      message: "INVALID_REFRESH_TOKEN",
      error: err.message,
    });
  }
};

module.exports = validateRefreshToken;