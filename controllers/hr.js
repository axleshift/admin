import User from "../model/User.js";
import { generateUsername } from "../UTIL/generateCode.js";
import axios from 'axios';
import dotenv from 'dotenv';
import NewUser from "../model/newUser.js";
dotenv.config();




export const getWorker = async (req, res) => {
    try {
      const workers = await User.find({ role: { $in: [  
        "admin", 
        "manager", 
        "superadmin",
        'employee',
        "user",
        "inpector",
        "driver",
        "chief mechanic",
        "user"
      ] } }).select("-password");
  
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
  

  const HR1 = 'https://backend-hr1.axleshift.com';
//hr1
export const getAllUsers = async (req, res) => {
  try {
    const users = await NewUser.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      message: 'Error fetching users',
      error: err.message || JSON.stringify(err) || 'Unknown error'
    });
  }
};

// controllers/attendanceController.js

// Main controller to fetch all attendance records
export const getAllAttendance = async (req, res) => {
  try {
    // You might want to add authentication headers here if needed
    const response = await axios.get(`${HR1}/api/attendance/all`);
    
    // Return the data from the external API
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    
    // Forward the status code from the API if available
    const statusCode = error.response ? error.response.status : 500;
    const errorMessage = error.response && error.response.data 
      ? error.response.data.message 
      : 'Failed to fetch attendance data';
    
    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage 
    });
  }
};

// Get attendance for a specific employee (if the API supports it)
export const getEmployeeAttendance = async (req, res) => {
  try {
    const employeeId = req.params.id;
    
    // Assuming the API supports filtering by employee ID
    const response = await axios.get(`${HR1}/api/attendance/employee/${employeeId}`);
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error(`Error fetching attendance for employee ${req.params.id}:`, error);
    
    const statusCode = error.response ? error.response.status : 500;
    const errorMessage = error.response && error.response.data 
      ? error.response.data.message 
      : 'Failed to fetch employee attendance data';
    
    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage 
    });
  }
};

// Get attendance for a specific date range (if the API supports it)
export const getAttendanceByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Assuming the API supports date range filtering
    const response = await axios.get(`${HR1}/api/attendance/all`, {
      params: { startDate, endDate }
    });
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching attendance by date range:', error);
    
    const statusCode = error.response ? error.response.status : 500;
    const errorMessage = error.response && error.response.data 
      ? error.response.data.message 
      : 'Failed to fetch attendance data for date range';
    
    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage 
    });
  }
};



//hr2
  const HR2 = process.env.EXTERNAL_Hr2;
  const Api_Key = process.env.Hr2_api_key;
  
  export const getJobPostings = async (req, res) => {
    try {
      if (!HR2) {
        console.error("Error: EXTERNAL_Hr2 is not defined in the environment variables.");
        
        // Create notification for configuration error
        
        
        return res.status(500).json({ error: "Server configuration error: Missing HR2 API URL" });
      }
  
      if (!Api_Key) {
        console.error("Error: Hr2_api_key is not defined in the environment variables.");
        
        // Create notification for configuration error
        
        
        return res.status(500).json({ error: "Server configuration error: Missing HR2 API key" });
      }
  
      console.log("Fetching data from External HR2 API...");
  
      const response = await axios.get(`${HR2}request/jobposting/all`, {
        headers: {
          'x-api-key': Api_Key
        }
      });
      
      
      // Extract job postings data for notification
      const jobPostings = response.data.jobPostings || [];
      const count = Array.isArray(jobPostings) ? jobPostings.length : 0;
      
      // Create notification for successful job postings fetch
      
      // Return the complete response data
      return res.status(200).json(response.data);
    } catch (error) {
      console.error("Error fetching job postings:", error.message);
      
      // Create notification for fetch error
    
      return res.status(500).json({ 
        error: "Failed to fetch job postings", 
        details: error.response?.data || error.message 
      });
    }
  };
   // Ensure environment variables are loaded
  
  const HR3 = process.env.EXTERNAL_Hr3;
  
  export const leave = async (req, res) => {
    try {
      if (!HR3) {
        console.error("Error: EXTERNAL_HR3 is not defined in the environment variables.");
        
        // Create notification for configuration error
        
        
        return res.status(500).json({ error: "Server configuration error: Missing HR3 API URL" });
      }
  
      console.log("Fetching data from External HR3 API...");
  
      const response = await axios.get(`${HR3}/api/leave-requests`);
      
      
      // Extract the leaveRequests array from the response
      const leaveRequests = response.data.leaveRequests || [];
      
      // Count the number of leave requests
      const count = leaveRequests.length;
      
      // Create notification for successful fetch with count information
      
      // Return both the count and the data
      return res.json({
        count: count,
        data: leaveRequests
      });
    } catch (error) {
      console.error("Error fetching leave requests:", error.message);
      
      // Create notification for fetch error
      
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
    
  export const getpayroll = async (req, res) => {
    try {
      const response = await fetch(`${HR3}/api/payrolls`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Create notification for successful payroll data fetch
      const payrollEntries = data.payrollEntries || [];
      const count = Array.isArray(payrollEntries) ? payrollEntries.length : 0;
      
     
      
      return res.json(data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      
      // Create notification for fetch error
      

      
      return res.status(500).json({ error: 'Failed to fetch payroll data' });
    }
  };


 
 // Controller function remains the same



  

