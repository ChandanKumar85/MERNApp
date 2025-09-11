const express = require('express');
const { registerUser, loginUser, forgotPassword, deleteUser, getUser, logout } = require('../controllers/userController');
const validatePassword = require('../middleware/validatePassword');
const validateToken = require('../middleware/validateToken');
const userRoute = express.Router();

userRoute.post('/login', loginUser);// Login user
userRoute.post('/register', validatePassword, registerUser);// Create user
userRoute.patch('/update-password', validateToken, validatePassword, forgotPassword);// Update user
userRoute.delete('/user', validateToken, deleteUser); // Delete user
userRoute.get('/user', validateToken, getUser); // Get users
userRoute.post('/logout', validateToken, logout); // Get users

// userRoute.get('/users', getUsers); // Get users

module.exports = userRoute;
