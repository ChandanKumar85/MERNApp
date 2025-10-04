const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const User = require('../../models/user.model');
const { GenerateToken, GenerateRefreshToken } = require('../../utils/tokenGenerate');
const { decrypt } = require('../../utils/crypto');

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    if (!email || !password) {
      return res.status(400).json({
        status: 0,
        message: 'EMAIL_AND_PASSWORD_REQUIRED',
      });
    }

    // Decrypt password from frontend
    const plainPassword = decrypt(password);
    
    if (!plainPassword) {
      return res.status(400).json({
        status: 0,
        message: 'INVALID_PASSWORD_FORMAT',
      });
    }
    
    // Verify password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        status: 0,
        message: "INVALID_CREDENTIALS",
      });
    }

    if(user.isDeleted === true){
      return res.status(401).json({
        status: 0,
        message: "USER_NOT_EXIST",
      })
    }

    const isMatch = await bcrypt.compare(plainPassword, user.password);
    // Check if password matches
    if (!isMatch) {
      return res.status(401).json({
        status: 0,
        message: 'INVALID_CREDENTIALS',
      });
    }

    // Generate unique random ID for this session
    const randomUId = crypto.randomUUID();

    // Access token with random ID
    const accessToken = GenerateToken(
      { id: user._id, randomId: randomUId, role: user.role }, 
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN, issuer: process.env.APP_NAME }
    );

    // Refresh token
    const refreshToken = GenerateRefreshToken(
      { id: user._id }, 
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN, issuer: process.env.APP_NAME }
    );

    // Store token AND randomId in db for validation
    await User.findByIdAndUpdate(
      String(user._id), 
      { 
        token: accessToken, 
        refreshToken: refreshToken,
        randomId: randomUId
      }
    );

    // Successful login
    res.status(200).json({
      status: 1,
      message: 'LOGIN_SUCCESSFUL',
      accessToken,
      refreshToken,
      id: user._id,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      status: 0,
      message: 'SERVER_ERROR',
    });
  }
};

module.exports = loginUser;