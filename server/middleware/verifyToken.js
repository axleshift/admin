import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ message: 'Token is required' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Verify the token with the same secret
    req.user = verified; // Attach the user info (from token payload) to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
