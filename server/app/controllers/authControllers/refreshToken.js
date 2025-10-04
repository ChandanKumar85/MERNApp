const User = require('../../models/user.model');

// Generate Refresh Token
const refreshToken = async (req, res) => {
  try {
    const { id, accessToken, refreshToken } = req.user;

    if (!accessToken) {
      return res.status(401).json({
        status: 0,
        message: "NO_TOKEN_PROVIDED",
      });
    }

    // Update user record with new access token
    await User.findByIdAndUpdate(id, {
      token: accessToken,
    });

    return res.status(200).json({
      status: 1,
      message: "GENERATE_ACCESS_TOKEN_SUCCESSFUL",
      accessToken: accessToken,
      refreshToken
    });

  } catch (error) {
    console.error("RefreshToken error:", error);
    return res.status(500).json({
      status: 0,
      message: "SERVER_ERROR",
      error: error.message,
    });
  }
};

module.exports = refreshToken;