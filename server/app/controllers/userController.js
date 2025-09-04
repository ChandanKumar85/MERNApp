const User = require("../models/user.model");

// Create and Save a new User
const addUser = (req, res) => {
    const { name, email, phone, password } = req.body;
    let userData = new User({
        name, email, phone, password
    });
    userData.save().then((result) => {
        res.status(201).json({
            status: 1,
            message: "User added successfully",
        });
    }).catch((err) => {
        res.status(500).json({
            status: 0,
            message: "Error adding user",
            error: err.message
        });
    });
}

// Retrieve and return all users from the database.
const getUser = (req, res) => {
    User.find().then((users) => {
        res.status(200).json({
            status: 1,
            length: users.length,
            message: "Users retrieved successfully",
            users: users
        });
    }).catch((err) => {
        res.status(500).json({
            status: 0,
            message: "Error retrieving users",
            error: err.message
        });
    });
}

// Update a user identified by the userId in the request
const updateUser = (req, res) => {
    const userId = req.body.id;
    const updateData = req.body;
    User.findByIdAndUpdate(userId, updateData).then((result) => {
        if (result) {
            res.status(200).json({
                status: 1,
                id: result.id,
                message: "User updated successfully"
            });
        } else {
            res.status(404).json({
                status: 0,
                id: userId,
                message: "User not found"
            });
        }
    }).catch((err) => {
        res.status(500).json({
            status: 0,
            message: "Error updating user",
            error: err.message
        });
    });
}

// Delete a user with the specified userId in the request
const deleteUser = (req, res) => {
    const userId = req.body.id;
    User.findByIdAndDelete(userId).then((result) => {
        if (result) {
            res.status(200).json({
                status: 1,
                id: result.id,
                message: "User deleted successfully"
            });
        } else {
            res.status(404).json({
                status: 0,
                message: "User not found"
            });
        }
    }).catch((err) => {
        res.status(500).json({
            status: 0,
            message: "Error deleting user",
            error: err.message
        });
    });
}

module.exports = { addUser, getUser, updateUser, deleteUser };