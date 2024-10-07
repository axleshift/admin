import Product from '../model/Product.js';
import ProductStat from '../model/ProductStat.js';
import User from '../model/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateUsername } from '../UTIL/generateCode.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const productsWithStats = await Promise.all(
      products.map(async (product) => {
        const stat = await ProductStat.find({
          productId: product._id,
        });
        return {
          ...product._doc,
          stat,
        };
      })
    );

    res.status(200).json(productsWithStats);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' }).select('-password');
    res.status(200).json(customers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getWorker = async (req, res) => {
  try {
    const workers = await User.find({ role: { $in: ['manager', 'admin', 'employee'] } }).select('-password');
    res.status(200).json(workers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Update a user's role
export const changeUserRole = async (req, res) => {
  const { newRole } = req.body;
  try {
    // Find the user by id
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's role
    user.role = newRole;

    // Regenerate the username based on the new role
    user.username = generateUsername(newRole); // Regenerate the username

    // Save the updated user to the database
    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register User
export const registerUser = async (req, res) => {
  const { name, email, password, phoneNumber, role, adminUsername } = req.body;
  console.log('Received registration data:', req.body); // Log the received data

  // Validate required fields
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // If role is admin, manager, or employee, validate adminUsername
  if (['admin', 'manager', 'employee'].includes(role)) {
    if (!adminUsername) {
      return res.status(400).json({ error: 'Admin username is required for this role' });
    }

    // Check if the adminUsername exists in the database and has the admin role
    const existingAdmin = await User.findOne({ username: adminUsername, role: 'admin' });
    if (!existingAdmin) {
      return res.status(400).json({ error: 'Invalid admin username' });
    }
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Generate the username based on the role
    const username = generateUsername(role); // Call the function to generate username

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      username, // Add the generated username here
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Exclude the password from the response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Registration error:', error.message); // Log the error message
    res.status(500).json({ message: 'Server error. Please try again later.', error: error.message });
  }
};
// Login endpoint
export const loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ message: 'Identifier and password are required' });
    }

    console.log('Request body:', req.body); // Log the request body

    try {
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });

        if (!user) {
            console.error('User not found for identifier:', identifier);
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Ensure req.session exists
        if (!req.session) {
            return res.status(500).json({ message: 'Session is not initialized' });
        }

        req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role};

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Login error:', error.message);
        console.error('Full error object:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
// Register Customer
export const registerCustomer = async (req, res) => {
  const { name, email, password, phoneNumber, country, occupation } = req.body;
  console.log('Received customer registration data:', req.body); // Log the received data

  // Validate required fields
  if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
      // Check if the customer already exists
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
          return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new customer
      const newCustomer = new Customer({
          name,
          email,
          password: hashedPassword,
          phoneNumber,
          country,
          occupation,
      });

      // Save the customer to the database
      await newCustomer.save();

      res.status(201).json({ message: 'Customer registered successfully' });
  } catch (error) {
      console.error('Customer registration error:', error.message); 
      res.status(500).json({ message: 'Server error. Please try again later.', error: error.message });
  }
};
