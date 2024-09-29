const User = require('../models/User');
const { generateCode } = require('../utils/generateCode'); // Import code generator

// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const currentUserRole = req.user.role; // Assume req.user has the role of the logged-in user (admin/manager)

  // Only allow admin or manager to register new users
  if (currentUserRole !== 'admin' && currentUserRole !== 'manager') {
    return res.status(403).json({ message: 'You do not have permission to register users' });
  }

  try {
    // Generate verification code
    const verificationCode = generateCode();

    const newUser = new User({
      name,
      email,
      password, // Ideally, you'd hash this password before saving
      role,
      verificationCode,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', verificationCode });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

module.exports = { registerUser };
