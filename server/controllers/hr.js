import User from "../model/User.js";
import { generateUsername } from "../UTIL/generateCode.js";
import {generateOAuthToken }from '../UTIL/jwt.js'
import JobPosting from "../model/h2.js";
import {io}  from '../index.js'

export const ExternalHR = async (req, res) => {
  try {
    const externalSystemUrl = process.env.EXTERNALHr;
    console.log("External HR URL:", externalSystemUrl);

    // Check if we're in development mode or the URL isn't configured
    if (!externalSystemUrl || process.env.NODE_ENV === 'development') {
      console.log("Using mock data for HR users");
      
      // Return mock data instead of making an API call
      return res.status(200).json([
        { 
          id: 1, 
          firstName: 'John', 
          lastName: 'Doe', 
          email: 'john.doe@example.com',
          department: 'IT',
          role: 'Developer'
        },
        { 
          id: 2, 
          firstName: 'Jane', 
          lastName: 'Smith', 
          email: 'jane.smith@example.com',
          department: 'Finance',
          role: 'Analyst'
        },
        { 
          id: 3, 
          firstName: 'Michael', 
          lastName: 'Johnson', 
          email: 'michael.j@example.com',
          department: 'HR',
          role: 'Manager'
        },
        { 
          id: 4, 
          firstName: 'Sarah', 
          lastName: 'Williams', 
          email: 'sarah.w@example.com',
          department: 'Marketing',
          role: 'Specialist'
        },
        { 
          id: 5, 
          firstName: 'Robert', 
          lastName: 'Brown', 
          email: 'robert.b@example.com',
          department: 'Operations',
          role: 'Director'
        }
      ]);
    }

    // If we're not in development mode and have a URL, proceed with the API call
    try {
      const response = await axios.get(`${externalSystemUrl}/users`);
      res.status(200).json(response.data);
    } catch (axiosError) {
      console.error("Axios error:", axiosError.message);
      if (axiosError.response) {
        console.error("Response data:", axiosError.response.data);
        console.error("Response status:", axiosError.response.status);
        res.status(axiosError.response.status).json({ 
          error: `External system error: ${axiosError.response.data.message || axiosError.message}` 
        });
      } else if (axiosError.request) {
        console.error("No response received:", axiosError.request);
        res.status(503).json({ error: "External service unavailable" });
      } else {
        res.status(500).json({ error: axiosError.message });
      }
    }
  } catch (error) {
    console.error("General error in ExternalHR:", error);
    res.status(500).json({ error: error.message });
  }
};



export const getWorker = async (req, res) => {
    try {
      const workers = await User.find({ role: { $in: ["manager", "admin", "employee"] } }).select("-password");
  
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
  
    
  