const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      validate: {
        validator: (v) => /^[A-Za-z\s]+$/.test(v),
        message: 'Name must contain only letters and spaces'
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (v) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v),
        message: 'Invalid email format'
      },
    },
    phone: {
      type: String,
      required: true,
      minlength: 10,
      validate: {
        validator: (v) => /^[0-9]{10}$/.test(v),
        message: 'Phone must be 10 digits'
      },
    },
    password: {
      type: String, 
      required: true, 
      minlength: 8 
    },
    role: { 
      type: String, 
      default: 'user', 
      enum: ['user', 'admin', 'super-admin'] 
    },
    token: { type: String, default: '' },
    refreshToken: { type: String, default: '' },
    randomId: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const User = mongoose.model('users', userSchema);
module.exports = User;