// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../model/User.js';

// For routes that need store verification
export const storeAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    if (!user.storeId) {
      return res.status(403).json({ success: false, error: 'Store access required' });
    }

    req.user = user; // Attach user to request
    next();
    
  } catch (error) {
    console.error('Store auth error:', error);
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};
