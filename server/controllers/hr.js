import User from "../model/User.js";
import { generateUsername } from "../UTIL/generateCode.js";
import {generateOAuthToken }from '../UTIL/jwt.js'
import JobPosting from "../model/h2.js";


  


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