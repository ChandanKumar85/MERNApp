const { decrypt } = require("../utils/crypto");

const validatePassword = (req, res, next) => {
  try {
    let { password, confirmPassword } = req.body;

    // Check required fields
    if (!password || !confirmPassword) {
      return res.status(400).json({
        status: 0,
        message: "PASSWORD_AND_CONFIRM_PASSWORD_REQUIRED",
      });
    }

    // Decrypt (if encrypted from frontend)
    const plainPassword = decrypt(password);
    const plainConfirmPassword = decrypt(confirmPassword);

    if (!plainPassword || !plainConfirmPassword) {
      return res.status(400).json({
        status: 0,
        message: "INVALID_PASSWORD_FORMAT",
      });
    }

    // Match confirm password
    if (plainPassword !== plainConfirmPassword) {
      return res.status(400).json({
        status: 0,
        message: "PASSWORDS_DO_NOT_MATCH",
      });
    }

    // Optional: enforce password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(plainPassword)) {
      return res.status(400).json({
        status: 0,
        message:
          "PASSWORD_INVALID (Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)",
      });
    }

    // Attach decrypted password to req.body for controller
    req.body.password = plainPassword;
    req.body.confirmPassword = plainConfirmPassword;

    next();
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: "PASSWORD_VALIDATION_ERROR",
    });
  }
};

module.exports = validatePassword;
