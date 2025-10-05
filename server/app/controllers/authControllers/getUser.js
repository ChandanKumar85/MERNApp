const User = require('../../models/user.model');

// Retrieve and return single user from the database
const getUser = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id).select("_id name email phone role"); 

    if (!user) {
      return res.status(404).json({
        status: 0,
        message: "USER_NOT_FOUND",
      });
    }

    return res.status(200).json({
      status: 1,
      user,
    });

  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "SERVER_ERROR",
    });
  }
};

module.exports = getUser;