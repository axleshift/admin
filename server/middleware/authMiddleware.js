import dotenv from "dotenv";
dotenv.config();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

console.log("Loaded ADMIN_TOKEN from .env:", ADMIN_TOKEN); 

export const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Received Auth Header:", authHeader); 

  if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  console.log("Authentication successful!"); 
  next(); 
};
