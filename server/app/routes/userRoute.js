const express = require('express');
const { addUser, getUser, deleteUser, updateUser } = require('../controllers/userController');
// const validatePassword = require('../middleware/validatePassword');
const hashPassword = require('../middleware/hashPassword');
const userRoute = express.Router();

userRoute.post('/', hashPassword, addUser); // Create user
userRoute.get('/', getUser);    // Get users
userRoute.delete('/', deleteUser);  // Delete user
userRoute.put('/', hashPassword, updateUser); // Update user

module.exports = userRoute;
