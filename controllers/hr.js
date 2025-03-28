import User from "../model/User.js";
import { generateUsername } from "../UTIL/generateCode.js";
import {generateOAuthToken }from '../UTIL/jwt.js'
import JobPosting from "../model/h2.js";
import {io}  from '../index.js'
import axios from 'axios';
import newuser from '../model/newuserhr.js';
import dotenv from 'dotenv';
  
dotenv.config();

const EXTERNAL_HR_API = process.env.EXTERNAL_HR;

const formatUserName = (userData) => {
  if (!userData.name) {
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    return userData.firstName || userData.lastName || 'Unknown';
  }
  return userData.name;
};

export const fetchAndStoreUsers = async () => {
  try {
    const response = await axios.get(EXTERNAL_HR_API);
    const users = response.data;

    for (const userData of users) {
      await newuser.findOneAndUpdate(
        { externalId: userData.id },
        { 
          name: formatUserName(userData), 
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email 
        },
        { upsert: true, new: true }
      );
    }
    console.log('Users synchronized successfully');
  } catch (error) {
    console.error('Error fetching users', error);
  }
};

export const handleWebhook = async (req, res) => {
  try {
    console.log('Webhook received:', req.body);
    const { event, user } = req.body;
    
    if (event === 'user_created' || event === 'user_updated') {
      await newuser.findOneAndUpdate(
        { externalId: user.id },
        { 
          name: formatUserName(user),
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email 
        },
        { upsert: true, new: true }
      );
    } else if (event === 'user_deleted') {
      await newuser.findOneAndDelete({ externalId: user.id });
    }

    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Error processing webhook', error });
  }
};

export const ExternalHR = async (req, res) => {
  try {
    const users = await newuser.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};


export const getWorker = async (req, res) => {
    try {
      const workers = await User.find({ role: { $in: ["manager", "admin", "employee","superadmin"] } }).select("-password");
  
      // Ensure consistent data
      const sanitizedWorkers = workers.map((worker) => ({
        ...worker._doc,
        username: worker.username || "", // Ensure username is never undefined
        email: worker.email || "", // Ensure email is never undefined
      }));
  
      res.status(200).json(sanitizedWorkers);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };
  
export const generateOAuth = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        // Find the user in the database
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the user already has a token and if it is still valid
        if (user.token && user.tokenExpiry > new Date()) {
            return res
                .status(200)
                .json({ token: user.token, message: "Token already exists and is valid." });
        }

        // Generate a new token using the imported function
        const token = generateOAuthToken(userId);
        const tokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

        // Update the user record with the new token
        user.token = token;
        user.tokenExpiry = tokenExpiry;
        await user.save();

        // Respond with the new token
        res.status(200).json({ token, message: "New token generated successfully." });
    } catch (err) {
        console.error("Error generating token:", err);
        res.status(500).json({ error: "Failed to generate token" });
    }
};

export const getperform = async (req, res)=>{
    try{
        const users =await User.find({}, 'name performance'); // Get names and performance reviews
        res.json(users);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
    
    
// Update a user's role
export const changeUserRole = async (req, res) => {
    const { newRole } = req.body;
    try {
        // Find the user by id
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the user's role
        user.role = newRole;

        // Regenerate the username based on the new role
        user.username = generateUsername(newRole); // Regenerate the username

        // Save the updated user to the database
        const updatedUser = await user.save();

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
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//hr2
export const getJobPostings = async (req, res) => {
    try {
      const jobPostings = await JobPosting.find(); // Fetch all job postings
      res.status(200).json(jobPostings);
    } catch (error) {
      console.error("Error fetching job postings:", error);
      res.status(500).json({ message: "Failed to fetch job postings" });
    }
  };
  
  export const getJobPostingById = async (req, res) => {
    try {
      const { id } = req.params;
      const jobPosting = await JobPosting.findById(id);
  
      if (!jobPosting) {
        return res.status(404).json({ message: "Job posting not found" });
      }
  
      res.status(200).json(jobPosting); // Send job posting including applications
    } catch (error) {
      console.error("Error fetching job posting by ID:", error);
      res.status(500).json({ message: "Failed to fetch job posting" });
    }
  };

  export const getpayroll = async (req, res) => {
    try {
      // Fetch name and payroll only
      const payroll = await User.find({}, 'name payroll');
      
      if (!payroll || payroll.length === 0) {
        return res.status(404).json({ message: "Payroll not found" });
      }
  
      // Send payroll data along with the user's name
      res.status(200).json(payroll);
    } catch (error) {
      console.error("Error fetching Payroll:", error);
      res.status(500).json({ message: "Failed to fetch Payroll" });
    }
  };
  
  export const getHrDashStats = async (req,res)=>{
    try{
      const workers = await User.find({ role: { $in: ["manager", "admin", "employee"] } }).select("-password");
  
  
      const totalWorkers = workers.length;
  
      const hrStats = {
        totalWorkers,}
        res.status(200).json(hrStats);
      } catch (error) {
          console.error("Error fetching HR Dashboard stats:", error);
          res.status(500).json({ message: "Failed to fetch HR Dashboard stats" });
      }
    } 

  export const getUserPermissions = async (req, res) => {
      try {
          const { userId } = req.params;
    
          const user = await User.findById(userId);
          if (!user) return res.status(404).json({ message: 'User not found' });
  
          console.log("🔹 Sending user permissions:", user.permissions || []);
    
          res.json({ permissions: user.permissions || [] });
      } catch (error) {
          res.status(500).json({ message: 'Error fetching permissions', error });
      }
  };
  
  export const access = async (req, res) => {
    try {
      const { userId, newPermissions, grantedBy } = req.body; // Add 'grantedBy' to track the user who granted access
  
      if (!userId || !newPermissions || !Array.isArray(newPermissions)) {
        return res.status(400).json({ message: 'User ID and valid permissions array are required' });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(now.getDate() + 1);
  
      const updatedPermissions = new Set(user.permissions || []);
      const updatedExpiryMap = new Map(user.expiryMap || {});
  
      newPermissions.forEach((perm) => {
        updatedPermissions.add(perm);
        updatedExpiryMap.set(perm, expiryDate);
      });
  
      user.permissions = [...updatedPermissions];
      user.expiryMap = Object.fromEntries(updatedExpiryMap);
  
      await user.save();
  
      // Emit an event through the socket, including the granted permissions
      io.emit('permissionUpdated', {
        userId,
        grantedBy,
        name: user.name,
        permissions: newPermissions, // Include granted permissions
      });
  
      res.json({
        message: 'Permissions granted successfully',
        permissions: user.permissions,
        expiryMap: user.expiryMap,
      });
    } catch (error) {
      console.error("❌ Error granting access:", error);
      res.status(500).json({ message: 'Error granting access', error });
    }
  };
  
  
  export const revokeAccess = async (req, res) => {
    try {
      const { userId, permissionsToRemove } = req.body;
  
      if (!userId || !permissionsToRemove || !Array.isArray(permissionsToRemove)) {
        return res.status(400).json({ message: 'User ID and valid permissions array are required' });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        console.log("❌ User not found:", userId);
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Debug before updating
      console.log("🔹 User Permissions Before:", user.permissions);
  
      // Remove permissions from the user
      user.permissions = (user.permissions || []).filter(
        (perm) => !permissionsToRemove.includes(perm)
      );
  
      // Remove from expiryMap
      const updatedExpiryMap = new Map(user.expiryMap || {});
      permissionsToRemove.forEach((perm) => {
        updatedExpiryMap.delete(perm);
      });
      user.expiryMap = Object.fromEntries(updatedExpiryMap);
  
      // Debug after updating
      console.log("🔹 User Permissions After:", user.permissions);
  
      await user.save();
  
      // Emit an event for revoked permissions
      console.log("📢 Emitting permissionRevoked event:", {
        userId,
        name: user.name,
        revokedPermissions: permissionsToRemove,
      });
  
      io.emit('permissionRevoked', {
        userId,
        name: user.name,
        revokedPermissions: permissionsToRemove,
      });
  
      res.json({
        message: 'Permissions revoked successfully',
        permissions: user.permissions,
        expiryMap: user.expiryMap,
      });
    } catch (error) {
      console.error("❌ Error revoking access:", error);
      res.status(500).json({ message: 'Error revoking access', error });
    }
  };
  

   // Ensure environment variables are loaded
  
  const HR3 = process.env.EXTERNALHr3;
  
  export const leave = async (req, res) => {
    try {
      if (!HR3) {
        console.error("Error: EXTERNAL_HR3 is not defined in the environment variables.");
        return res.status(500).json({ error: "Server configuration error: Missing HR3 API URL" });
      }
  
      console.log("Fetching data from External HR3 API...");
  
      const response = await axios.get(`${HR3}/api/leave-requests`);
      
      console.log("Full Response:", JSON.stringify(response.data, null, 2));
      
      return res.json(response.data);  // Send only the data to the frontend
    } catch (error) {
      console.error("Error fetching leave requests:", error.message);
      
      return res.status(500).json({ 
        error: "Failed to fetch leave requests", 
        details: error.response?.data || error.message 
      });
    }
  };
  export const updateLeaveRequest = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, comments } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: "Request ID is required" });
      }
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      if (!HR3) {
        console.error("Error: EXTERNAL_HR3 is not defined in the environment variables.");
        return res.status(500).json({ error: "Server configuration error: Missing HR3 API URL" });
      }
      
      console.log(`Updating leave request ${id} status to ${status}`);
      
      // Make the PUT request to update the status
      const response = await axios.put(
        `${HR3}/api/leave-requests/${id}`,
        { status, comments }
      );
      
      console.log("Update Response:", JSON.stringify(response.data, null, 2));
      
      return res.status(200).json({
        success: true,
        message: `Leave request has been ${status.toLowerCase()} successfully`,
        data: response.data
      });
    } catch (error) {
      console.error(`Error updating leave request:`, error.message);
      
      return res.status(500).json({
        error: "Failed to update leave request",
        details: error.response?.data || error.message
      });
    }
  };
  