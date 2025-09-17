const jwt = require('jsonwebtoken');

// Access Token
const GenerateToken = (payload, options = {}) => {
  return jwt.sign(payload, process.env.ACCESS_JWT_SECRET, options);
};

// Refresh Token
const GenerateRefreshToken = (payload, options = {}) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_JWT_SECRET, options);
};

module.exports = { GenerateToken, GenerateRefreshToken };