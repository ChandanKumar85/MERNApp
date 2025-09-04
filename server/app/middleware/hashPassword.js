const bcrypt = require("bcryptjs");

const hashPassword = async (req, res, next) => {
    try {
        const { password, confirmPassword } = req.body;

        // If no password in request → skip
        if (!password) {
            return next();
        }

        // Require confirmPassword
        if (!confirmPassword) {
            return res.status(400).json({
                status: 0,
                message: "Confirm Password is required",
            });
        }

        // Compare passwords
        if (password !== confirmPassword) {
            return res.status(400).json({
                status: 0,
                message: "Passwords do not match",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);

        // Remove confirmPassword
        delete req.body.confirmPassword;

        next();
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error processing password",
            error: err.message,
        });
    }
};

module.exports = hashPassword;
