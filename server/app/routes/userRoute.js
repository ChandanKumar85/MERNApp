const express = require('express');
const { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  deleteUser, 
  getUser, 
  logout, 
  refreshToken, 
  resetPassword 
} = require('../controllers/authController');
const validatePassword = require('../middleware/validatePassword');
const validateToken = require('../middleware/validateToken');
const validateRefreshToken = require('../middleware/validateRefreshToken');
const userRoute = express.Router();

userRoute.post('/login', loginUser);
userRoute.post('/register', validatePassword, registerUser);
userRoute.post('/logout', validateToken, logout);
userRoute.post('/refresh-token', validateRefreshToken, refreshToken);
userRoute.post('/forgot-password', forgotPassword);
userRoute.post('/reset-password/:token', resetPassword);

userRoute.get('/user', validateToken, getUser);
userRoute.delete('/user', validateToken, deleteUser);

module.exports = userRoute;