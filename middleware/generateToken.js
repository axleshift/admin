// filepath: c:\Users\ryans\OneDrive\Desktop\withsecurity\admin - Copy\server\middleware\generateToken.js
import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => 
    jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: "15m" });

export const generateRefreshToken = (user) => 
    jwt.sign(user, process.env.REFRESH_SECRET, { expiresIn: "7d" });