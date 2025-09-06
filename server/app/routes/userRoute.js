const express = require('express');
const { addUser, getUser, deleteUser, updateUser } = require('../controllers/userController');
// const validatePassword = require('../middleware/validatePassword');
const validatePassword = require('../middleware/validatePassword');
const userRoute = express.Router();

userRoute.post('/', validatePassword, addUser); // Create user
userRoute.get('/', getUser);    // Get users
userRoute.delete('/', deleteUser);  // Delete user
userRoute.put('/', updateUser); // Update user

module.exports = userRoute;
