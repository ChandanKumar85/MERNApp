const express = require('express');
const { addUser, getUser, deleteUser, updateUser } = require('../controllers/userController');
const userRoute = express.Router();

userRoute.get('/users', getUser);
userRoute.post('/users', addUser);
userRoute.delete('/users', deleteUser);
userRoute.put('/users', updateUser);

module.exports = userRoute;
