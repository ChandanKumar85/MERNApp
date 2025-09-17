const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
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
    const { id, accessToken, refreshToken } = req.user;

    if (!accessToken) {
      return res.status(401).json({
        status: 0,
        message: "NO_TOKEN_PROVIDED",
      });
    }

    // Update user record with new access token + randomId
    await User.findByIdAndUpdate(id, {
      token: accessToken,
    });

    // Send response
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

// Update Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ status: 0, message: 'EMAIL_REQUIRED' });
    }
    
    const checkUser = await User.findOne({ email: email.toLowerCase() });
    if (!checkUser) {
      return res.status(404).json({ status: 0, message: 'USER_NOT_FOUND' });
    }

    // // Access token
    const randomId = crypto.randomUUID();
    const accessToken = GenerateToken({ id: String(checkUser._id), randomId: randomId, role: checkUser.role }, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN, issuer: process.env.APP_NAME });

    const transport = nodemailer.createTransport({
      host: "gmail",
      // port: 587,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // generated ethereal user
        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
      },
    });

    const recivers = {
      from: "mernapp@gmail.com", // sender address
      to: email, // list of receivers
      subject: "Password Reset - MERNApp", // Subject line
      text: `You requested for password reset. Use the token below to reset your password. \n\n 
      ${process.env.CLIENT_URL}/reset-password/${accessToken} \n\n Note: This token is valid for a short period. If you did not request this, please ignore this email.`, // plain text body
    }

    await transport.sendMail(recivers);

    return res.status(200).json({
      status: 1,
      message: 'FORGOT_PASSWORD_EMAIL_SENT',
    });

  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: 'SERVER_ERROR',
      error: err.message,
    });
  }
};

module.exports = { loginUser, registerUser, forgotPassword, deleteUser, getUser, logout, refreshToken }; // getUsers



// const forgotPassword = async (req, res) => {
//   try {
//     const { password } = req.body;
//     const id = req.user.id;

//     if (!id) {
//       return res.status(400).json({ status: 0, message: 'USER_ID_REQUIRE' });
//     }

//     // Hash the new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     const updatedUser = await User.findByIdAndUpdate(
//       id, 
//       { password: hashedPassword }, 
//       { new: true, runValidators: true }
//     )

//     if (!updatedUser) {
//       return res.status(404).json({
//         status: 0,
//         id,
//         message: 'USER_NOT_FOUND',
//       })
//     }

//     return res.status(200).json({
//       status: 1,
//       message: 'RESET_PASSWORD_SUCCESSFUL',
//       userId: updatedUser._id,
//     })

//   } catch (err) {
//     return res.status(500).json({
//       status: 0,
//       message: 'SERVER_ERROR',
//       error: err.message,
//     });
//   }
// };