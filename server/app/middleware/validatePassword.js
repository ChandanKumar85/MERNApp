const bcrypt = require("bcryptjs");

const validatePassword = (req, res, next) => {
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword){
        return res.status(400).json({
            status: 0,
            message: "Password and Confirm Password are required"
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            status: 0,
            message: "Password and Confirm Password do not match"
        });
    }

    delete req.body.confirmPassword; // Remove confirmPassword from request body
    next();
}

module.exports = validatePassword;