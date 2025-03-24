import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Use the secret key from environment variables
const SECRET_KEY = process.env.JWT_SECRET;

// Define the function to generate OAuth 2.0-compliant token
const generateOAuthToken = (userId) => {
  const payload = {
    sub: userId, // 'sub' claim represents the subject (user ID in this case)
    iss: "YourAppName", // 'iss' (Issuer) claim, replace with your app's name or domain
    aud: "YourAppAudience", // 'aud' (Audience) claim, optional but recommended
    iat: Math.floor(Date.now() / 1000), // 'iat' (Issued At) claim, in seconds
  };

  // Generate token with expiration
  const token = jwt.sign(payload, SECRET_KEY, {
    expiresIn: "1h", // Token expiration time
  });

  return token;
};

// Export the function if needed
export { generateOAuthToken };