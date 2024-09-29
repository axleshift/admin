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

