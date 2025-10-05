const bcrypt = require('bcryptjs');
const User = require('../../models/user.model');

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

    // Hash password (already decrypted by validatePassword middleware)
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

module.exports = registerUser;