const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
    const accessToken = GenerateToken({ randomId: randomId, role: user.role }, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN, issuer: process.env.APP_NAME });

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
    const id = req.user.id;

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
    const id = req.user.id;

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
    const id = req.user.id;
    const user = await User.findById(id).select("_id name email phone role"); 
    // use select to fetch only needed fields

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

// Logout user
const logout = async (req, res) => {
  try {
    const id = req.user.id;
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

// Generate Refresh Token
const refreshToken = async (req, res) => {
  try {
    const { id, refreshToken } = req.body;

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
        if (err) {
          return res.status(403).json({
            status: 0,
            message: "INVALID_REFRESH_TOKEN",
          });
        }

        // Step 1: Check user in DB
        const userData = await User.findById(id);
        if (!userData) {
          return res.status(404).json({
            status: 0,
            message: "USER_NOT_FOUND",
          });
        }

        // Step 2: (Optional) Check if refresh token is expired manually
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
          return res.status(403).json({
            status: 0,
            message: "REFRESH_TOKEN_EXPIRED",
          });
        }

        // Step 3: Generate new randomId for access token
        const randomId = crypto.randomUUID();

        // Step 4: Generate new access token
        const newAccessToken = GenerateToken(
          {
            id: userData._id,
            randomId,
            role: userData.role,
          },
          {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN,
            issuer: process.env.APP_NAME,
          }
        );

        // Step 5: Update user record with new access token + randomId
        await User.findByIdAndUpdate(String(id), {
          token: newAccessToken,
          randomId: randomId,
        });

        // Step 6: Send response
        return res.status(200).json({
          status: 1,
          message: "GENERATE_REFRESH_SUCCESSFUL",
          accessToken: newAccessToken,
          refreshToken, // still return same refresh token
        });
      }
    );
  } catch (error) {
    console.error("RefreshToken error:", error);
    return res.status(500).json({
      status: 0,
      message: "SERVER_ERROR",
      error: error.message,
    });
  }
};


// const refreshToken = async (req, res, next) => {
//   try {
//     const {id, refreshToken } = req.body;
    
//     if (!refreshToken) {
//       return res.status(401).json({
//         status: 0,
//         message: 'NO_TOKEN_PROVIDED'
//       });
//     };


//     jwt.verify(refreshToken, process.env.REFRESH_TOKEN_JWT_SECRET, async (err, user) => {

//       if (err) {
//         return res.status(403).json({ 
//           status: 0,
//           message: 'INVALID_REFRESH_TOKEN' 
//         })
//       };

//       // Step 1: Check user in DB
//       const userData = await User.findById(id);

//       // Access token
//       const randomId = crypto.randomUUID();
//       const newAccessToken = GenerateToken({ randomId: randomId, role: userData.role }, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN, issuer: process.env.APP_NAME });

//       // store token in db
//       await User.findByIdAndUpdate(
//         String(id), 
//         { token: newAccessToken }
//       )

//       res.status(200).json({
//         status: 1,
//         message: 'GENERATE_REFRESH_SUCCESSFUL',
//         accessToken: newAccessToken,
//         refreshToken
//       });
//     });

//   } catch (error) {
//     res.status(500).json({
//       status: 0,
//       message: 'SERVER_ERROR',
//     });
//   }
// }

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

module.exports = { loginUser, registerUser, forgotPassword, deleteUser, getUser, logout, refreshToken }; // getUsers
