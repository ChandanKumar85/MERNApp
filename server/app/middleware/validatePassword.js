const validatePassword = (req, res, next) => {
  const { password, confirmPassword } = req.body;
  
  if (!password || !confirmPassword) {
    return res.status(400).json({
      status: 0,
      message: 'Password and Confirm Password are required',
    });
  }
  
  if (password !== confirmPassword) {
    return res.status(400).json({
      status: 0,
      message: 'Password and Confirm Password do not match',
    });
  }

  // ✅ Validate raw password before hashing
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ status: 0, message: 'Password must contain uppercase, lowercase, number, special char and min 8 chars' });
  }

  next();
};

module.exports = validatePassword;
