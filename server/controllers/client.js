import Product from '../model/Product.js'
import ProductStat from '../model/ProductStat.js'
import User from '../model/User.js'
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'


export const getProducts = async( req,res) =>{
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
      }}
      
export const getCustomers = async( req,res) =>{
  try {
      const customers = await User.find({role:'user'}).select('-password')
      res.status(200).json(customers);
  
    } catch (error) {
      res.status(404).json({ message: error.message });

}}


export const getWorker = async (req, res) => {
  try {
    const workers = await User.find({ role: { $in: ['manager', 'admin','employee'] } }).select('-password');
    res.status(200).json(workers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};



// Update a user's role
export const changeUserRole = async (req, res) => {
  const { newRole } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role: newRole },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
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

//register a user
export const registerUser = async (req, res) => {
  const { name, email, password, phoneNumber, role } = req.body;
  console.log('Received registration data:', req.body); // Add this line for logging

  // Validate required fields
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Exclude the password from the response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Registration error:', error.message); // Log the error
    res.status(500).json({ message: error.message });
  }
};

// Login endpoint

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};