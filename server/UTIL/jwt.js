import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Use the secret key from environment variables
const SECRET_KEY = process.env.JWT_SECRET;

const generateOAuthToken = (userId) => {
  // Define the payload
  const payload = { userId };

  // Generate token with expiration
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

  return token;
};

// Use named export for the function
export { generateOAuthToken };
