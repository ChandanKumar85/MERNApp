const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const User = require('../models/user.model');
const { GenerateToken, GenerateRefreshToken } = require('../utils/tokenGenerate');
const { decrypt } = require('../utils/crypto');

// Create and Save a new User
const registerUser = async (req, res) => {
  try {
    let { name, email, phone, password } = req.body;

    // Basic validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        status: 0,
        message: "ALL_FIELDS_REQUIRED",
      });
    }

    // Normalize email & Check if user exists
    email = email.toLowerCase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 0,
        message: "USER_ALREADY_EXISTS",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save new user
    const newUser = new User({ name, email, phone, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({
      status: 1,
      message: "USER_REGISTERED",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 0,
      message: "SERVER_ERROR",
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

    // Decrypt password from frontend
    const plainPassword = decrypt(password);
    
    // Verify password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        status: 0,
        message: "INVALID_CREDENTIALS",
      });
    }

    const isMatch = await bcrypt.compare(plainPassword, user.password);
    // Check if password matches
    if (!isMatch) {
      return res.status(401).json({
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
      { token: accessToken, refreshToken: refreshToken }
    )

    // Successful login
    res.status(200).json({
      status: 1,
      message: 'LOGIN_SUCCESSFUL',
      accessToken,
      refreshToken,
      id: user._id,
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
      { $unset: { token: 1, refreshToken: 1 } }, // safer than setting null
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

    // Generate unique random ID for reset
    const randomId = crypto.randomUUID();
    // Generate JWT with user ID + randomId
    const accessToken = GenerateToken(
      { id: String(checkUser._id), randomId },
      { expiresIn: process.env.GENERATE_TOKEN_EXPIREIN, issuer: process.env.APP_NAME }
    );

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - MERNApp",
      text: `You requested a password reset. Click the link below to reset your password:\n\n
      ${process.env.CLIENT_WEB_URL}?reset=${accessToken}\n\n
      Note: This link is valid for a short period(${process.env.GENERATE_TOKEN_EXPIREIN}). If you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

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

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({ status: 0, message: 'TOKEN_REQUIRED' });
    }

    // Step 1: Check request token expiry
    const decode = jwt.decode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    if (decode.exp && decode.exp < currentTime) {
      return res.status(401).json({
        status: 0,
        message: 'TOKEN_EXPIRED', // expired
      });
    }

    // Decrypt password from frontend
    const plainPassword = decrypt(password);
    const plainConfirmPassword = decrypt(confirmPassword);

    if (!plainPassword) {
      return res.status(400).json({ status: 0, message: 'PASSWORD_REQUIRED' });
    }

    if (plainPassword !== plainConfirmPassword) {
      return res.status(400).json({ status: 0, message: 'PASSWORDS_DO_NOT_MATCH' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);

    // Find user by ID from token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ status: 0, message: 'USER_NOT_FOUND' });
    }

    // Hash new password
    const newHashedPassword = await bcrypt.hash(plainPassword, 10);
    user.password = newHashedPassword;
    await user.save();

    return res.status(200).json({
      status: 1,
      message: 'PASSWORD_RESET_SUCCESSFUL',
    });

  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: 'SERVER_ERROR',
      error: error.message,
    });
  }
};


module.exports = { 
  loginUser, 
  registerUser, 
  forgotPassword, 
  deleteUser, 
  getUser, 
  logout, 
  refreshToken, 
  resetPassword 
}; // getUsers
