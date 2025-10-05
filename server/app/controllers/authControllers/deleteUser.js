const User = require('../../models/user.model');

// Delete a user with the specified userId in the request
const deleteUser = async (req, res) => {
  try {
    const id = req.user.id;
    const deletedUser = await User.findByIdAndUpdate( id, 
      { isDeleted: true, tokenId: '', refreshTokenId: '' }
    );

    if (!deletedUser) {
      return res.status(404).json({
        status: 0,
        message: "USER_NOT_FOUND",
      });
    }

    return res.status(200).json({
      status: 1,
      id,
      message: "USER_DELETED_SUCCESSFULLY",
    });
  } catch (err) {
    console.error("DeleteUser error:", err);
    return res.status(500).json({
      status: 0,
      message: "SERVER_ERROR",
      error: err.message,
    });
  }
};

module.exports = deleteUser;