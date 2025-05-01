import mongoose from "mongoose";
import Agreement from "../model/agreement.js";
import User from "../model/User.js";
import jwt from "jsonwebtoken";

export const termandaccept = async (req, res) => {
  const { userId, token } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Verify the token if provided
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // Verify the token belongs to this user
        if (decoded.id !== userId) {
          return res.status(403).json({ error: "Invalid token for this user" });
        }
      } catch (tokenError) {
        console.error("Token verification error:", tokenError);
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    }
    
    // Convert string ID to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // First check if an agreement already exists for this user
    let agreement = await Agreement.findOne({ userId: userObjectId });
    
    if (agreement) {
      // Update existing agreement
      agreement.status = 'accepted';
      agreement.updatedAt = new Date();
      await agreement.save();
    } else {
      // Create new agreement
      agreement = new Agreement({ 
        userId: userObjectId,
        status: 'accepted'
      });
      await agreement.save();
    }
    
    console.log("Agreement accepted successfully for user:", userId);
    res.status(201).json({ message: 'Terms accepted successfully.' });
  } catch (error) {
    console.error("Error saving agreement:", error);
    
    // Better error handling
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    } else if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    res.status(500).json({ error: 'Server error occurred while saving agreement' });
  }
};

export const termandreject = async (req, res) => {
  const { userId, token } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Verify the token if provided
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // Verify the token belongs to this user
        if (decoded.id !== userId) {
          return res.status(403).json({ error: "Invalid token for this user" });
        }
      } catch (tokenError) {
        console.error("Token verification error:", tokenError);
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    }
    
    // Convert string ID to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // First check if an agreement already exists for this user
    let agreement = await Agreement.findOne({ userId: userObjectId });
    
    if (agreement) {
      // Update existing agreement
      agreement.status = 'rejected';
      agreement.updatedAt = new Date();
      await agreement.save();
    } else {
      // Create new agreement
      agreement = new Agreement({ 
        userId: userObjectId,
        status: 'rejected'
      });
      await agreement.save();
    }
    
    console.log("Agreement rejected successfully for user:", userId);
    res.status(201).json({ message: 'Terms rejection recorded successfully.' });
  } catch (error) {
    console.error("Error recording rejection:", error);
    
    // Better error handling
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    } else if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    res.status(500).json({ error: 'Server error occurred while recording rejection' });
  }
};
export const requireAgreementAcceptance = async (req, res, next) => {
  try {
    // Get the token from the authorization header
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required", redirectTo: "/login" });
    }
    
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    
    // Check if the user has an accepted agreement
    const agreement = await Agreement.findOne({ 
      userId: new mongoose.Types.ObjectId(userId),
      status: 'accepted'
    });
    
    if (!agreement) {
      // User hasn't accepted the agreement, send a special response
      return res.status(403).json({ 
        error: "Terms and Conditions not accepted", 
        requiresAgreement: true,
        redirectTo: "/terms-and-conditions" 
      });
    }
    
    // User has accepted, continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error("Agreement check error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token", redirectTo: "/login" });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired", redirectTo: "/login" });
    }
    
    res.status(500).json({ error: "Server error during agreement verification" });
  }
};

