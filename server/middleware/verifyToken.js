import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Check if the token is provided and formatted as "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token is required or badly formatted' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part after "Bearer "

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Verify the token with the secret
    req.user = verified; // Attach the user info (from token payload) to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
