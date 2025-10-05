const User = require('../../models/user.model');

// Logout user
const logout = async (req, res) => {
  try {
    const id = req.user.id;
    // Also unset Token ID & Refresh Token ID
    const user = await User.findByIdAndUpdate( id,
      { $unset: { tokenId: 1, refreshTokenId: 1 } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 0,
        message: 'USER_NOT_FOUND',
      });
    }

    return res.status(200).json({
      status: 1,
      message: 'LOGOUT_SUCCESSFUL',
    });

  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({
      status: 0,
      message: 'SERVER_ERROR',
    });
  }
};

module.exports = logout;