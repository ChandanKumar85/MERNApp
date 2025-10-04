const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');
const { decrypt } = require('../../utils/crypto');

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({ status: 0, message: 'TOKEN_REQUIRED' });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({ status: 0, message: 'PASSWORD_AND_CONFIRM_PASSWORD_REQUIRED' });
    }

    // Decrypt password from frontend
    const plainPassword = decrypt(password);
    const plainConfirmPassword = decrypt(confirmPassword);

    if (!plainPassword || !plainConfirmPassword) {
      return res.status(400).json({ status: 0, message: 'INVALID_PASSWORD_FORMAT' });
    }

    if (plainPassword !== plainConfirmPassword) {
      return res.status(400).json({ status: 0, message: 'PASSWORDS_DO_NOT_MATCH' });
    }

    // Verify token first, then check expiry from verified token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
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
      });
    }

    // Find user by ID from token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ status: 0, message: 'USER_NOT_FOUND' });
    }

    // Hash new password
    const newHashedPassword = await bcrypt.hash(plainPassword, 10);
    if(user.isDeleted === true) {
      user.isDeleted = false;
    }
    user.password = newHashedPassword;
    await user.save();

    return res.status(200).json({
      status: 1,
      message: 'PASSWORD_RESET_SUCCESSFUL',
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      status: 0,
      message: 'SERVER_ERROR',
      error: error.message,
    });
  }
};

module.exports = resetPassword;