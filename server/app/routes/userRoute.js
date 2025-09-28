const express = require('express');
const { registerUser, loginUser, forgotPassword, deleteUser, getUser, logout, refreshToken, resetPassword } = require('../controllers/userController');
const validatePassword = require('../middleware/validatePassword');
const validateToken = require('../middleware/validateToken');
const validateRefreshToken = require('../middleware/validateRefreshToken');
const userRoute = express.Router();

userRoute.post('/login', loginUser);// Login user
userRoute.post('/register', validatePassword, registerUser);// Create user
userRoute.post('/logout', validateToken, logout); // Get users
userRoute.post('/refresh-token', validateRefreshToken, refreshToken); // Get refresh token
userRoute.post('/forgot-password', forgotPassword); // forgot password
userRoute.post('/reset-password/:token', resetPassword); // reset password

// Get & Delete user
userRoute.get('/user', validateToken, getUser);
userRoute.delete('/user', validateToken, deleteUser);

module.exports = userRoute;
