const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { GenerateToken, GenerateRefreshToken } = require('../utils/tokenGenerate');

// Create and Save a new User
const registerUser = async (req, res) => {
  try {
    let { name, email, phone, password, confirmPassword } = req.body;

    // Basic validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        status: 0,
        message: 'ALL_FIELDS_REQUIRED',
      });
    }

    // Normalize email & Check if user already exists
    email = email.toLowerCase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 0,
        message: 'USER_ALREADY_EXISTS',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({ name, email, phone, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({
      status: 1,
      message: 'USER_REGISTERED',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: 'SERVER_ERROR',
    });
  }
};

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

    // Verify password
    const user = await User.findOne({ email: email.toLowerCase() });
    const isMatch = await bcrypt.compare(password, user.password);

    // Check if password matches
    if (!isMatch) {
      return res.status(400).json({
        status: 0,
        message: 'INVALID_CREDENTIALS',
      });
    }

    // Access token
    const randomId = crypto.randomUUID();
    const accessToken = GenerateToken({ id: user._id, randomId: randomId, role: user.role }, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN, issuer: process.env.APP_NAME });

    // Refresh token
    const refreshToken = GenerateRefreshToken({ id: user._id }, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN, issuer: process.env.APP_NAME });

    // store token in db
    await User.findByIdAndUpdate(
      String(user._id), 
      { token: accessToken }
    )

    // Successful login
    res.status(200).json({
      status: 1,
      message: 'LOGIN_SUCCESSFUL',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 0,
      message: 'SERVER_ERROR',
    });
  }
};

// Update Password
const forgotPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { id } = req.user;

    if (!id) {
      return res.status(400).json({ status: 0, message: 'USER_ID_REQUIRE' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { password: hashedPassword }, 
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return res.status(404).json({
        status: 0,
        id,
        message: 'USER_NOT_FOUND',
      })
    }

    return res.status(200).json({
      status: 1,
      message: 'RESET_PASSWORD_SUCCESSFUL',
      userId: updatedUser._id,
    })

  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: 'SERVER_ERROR',
      error: err.message,
    });
  }
};

// Delete a user with the specified userId in the request
const deleteUser = async (req, res) => {
  try {
    const { id } = req.user;

    const deletedUser = await User.findByIdAndDelete(id);

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


// Retrieve and return single user from the database.
const getUser = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await User.findById(id).select("_id name email phone role"); 
    // ✅ use select to fetch only needed fields

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
    console.error("GetUser error:", err);
    return res.status(500).json({
      status: 0,
      message: "SERVER_ERROR",
    });
  }
};


const logout = async (req, res) => {
  try {
    const { id } = req.user;

    // Invalidate the token by clearing it in DB
    const user = await User.findByIdAndUpdate(
      id,
      { $unset: { token: "" } }, // safer than setting null
      { new: true } // return updated doc if needed
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

//
//
//
//
// // Retrieve and return all users from the database.
// const getUsers = (req, res) => {
//   User.find()
//     .then((users) => {
//       if (users.length > 0) {
//         res.status(200).json({
//           status: 1,
//           length: users.length,
//           message: 'Users retrieved successfully',
//           users: users,
//         });
//       } else {
//         res.status(404).json({
//           status: 0,
//           message: 'No users found',
//         });
//       }
//     })
//     .catch((err) => {
//       res.status(500).json({
//         status: 0,
//         message: 'Error retrieving users',
//         error: err.message,
//       });
//     });
// };





module.exports = { loginUser, registerUser, forgotPassword, deleteUser, getUser, logout }; // getUsers
