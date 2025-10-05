const registerUser = require('./authControllers/registerUser');
const loginUser = require('./authControllers/loginUser');
const deleteUser = require('./authControllers/deleteUser');
const getUser = require('./authControllers/getUser');
const logout = require('./authControllers/logout');
const refreshToken = require('./authControllers/refreshToken');
const forgotPassword = require('./authControllers/forgotPassword');
const resetPassword = require('./authControllers/resetPassword');

// Export all methods
module.exports = {
  registerUser,
  loginUser,
  deleteUser,
  getUser,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
};