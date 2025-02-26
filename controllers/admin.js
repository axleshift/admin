import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import archiver from 'archiver';
import extract from "extract-zip";
import { pipeline } from 'stream/promises';


import { GoogleGenerativeAI } from "@google/generative-ai";
import Message from '../model/message.js'
import User from '../model/User.js'
import Log from '../model/Log.js';
import passport from 'passport'
import { Strategy as GitHubStrategy } from "passport-github2";
import jwt  from 'jsonwebtoken'
import dotenv from 'dotenv'
import axios from 'axios'
import mongoose from 'mongoose'



const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let backupDir = ''; 
const mongoURL = process.env.MONGO_URL

const normalizePath = (filepath) => {
  return path.normalize(filepath).replace(/\\/g, '/');
};


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('GitHub access token:', accessToken);
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          const departments = ["HR", "Administrative", "Finance", "Core", "Logistics"];
          const roles = ["admin", "manager", "superadmin", "employee"];

          user = new User({
            githubId: profile.id,
            name: profile.displayName || "GitHub User",
            email: profile.emails?.[0]?.value || `user${profile.id}@example.com`,
            password: "N/A", // Password not required for OAuth users
            phoneNumber: "N/A",
            role: roles[Math.floor(Math.random() * roles.length)],
            username: profile.username,
            department: departments[Math.floor(Math.random() * departments.length)],
            accessToken,
            refreshToken,
          });

          await user.save();
        }

        const token = jwt.sign(
          {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            phoneNumber: user.phoneNumber,
            department: user.department,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return done(null, { token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export const githubAuth = passport.authenticate("github", { scope: ["profile", "email"] });
export const githubCallback = passport.authenticate("github", { session: false });
export const sendToken = (req, res) => {
  res.json({ token: req.user.token });
};

export const getUsersBy = async (req, res) => {
  try {
    const department = req.params.department.toLowerCase();
    const users = await User.find({ department });

    if (users.length === 0) {
      return res.status(404).json({ message: `No users found in ${department} department` });
    }
    res.json({ department, users });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


export const setBackupDirectory = (req, res) => {
  const { directory } = req.body;

  if (!directory) {
    return res.status(400).json({ message: 'Directory is required' });
  }

  // Create absolute path based on OS
  const absolutePath = path.resolve(directory);
  backupDir = normalizePath(absolutePath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    try {
      fs.mkdirSync(backupDir, { recursive: true });
    } catch (error) {
      return res.status(500).json({ 
        message: `Failed to create directory: ${error.message}`,
        error: error.toString()
      });
    }
  }

  console.log(`Backup directory set to: ${backupDir}`);
  res.status(200).json({ message: `Backup directory set to: ${backupDir}` });
};

export const listBackups = (req, res) => {
  if (!backupDir) {
      return res.status(400).json({ message: "Backup directory not set" });
  }

  try {
      if (!fs.existsSync(backupDir)) {
          return res.status(400).json({ message: "Backup directory does not exist", backups: [] });
      }

      const files = fs.readdirSync(backupDir);
      const backups = files
          .filter(file => file.endsWith(".zip")) // Only show ZIP archives
          .map(file => ({
              name: file,
              path: path.join(backupDir, file),
              created: fs.statSync(path.join(backupDir, file)).birthtime,
          }))
          .sort((a, b) => b.created - a.created); // Sort newest first

      res.status(200).json({ backups });
  } catch (error) {
      console.error("Error listing backups:", error);
      res.status(500).json({ message: "Failed to list backups", error: error.message, backups: [] });
  }
};

// Rest of the code remains the same...
export const listCollections = async (req, res) => {
  const { backupName } = req.params;
  const { databaseName } = req.query; // Use query parameters for database name

  if (!backupDir) {
      return res.status(400).json({ message: "Backup directory not set" });
  }

  const archivePath = path.join(backupDir, backupName);
  const tempDir = path.join(backupDir, `temp_${Date.now()}`);

  try {
      // ✅ Ensure the backup file exists before extracting
      if (!fs.existsSync(archivePath)) {
          return res.status(400).json({ message: `Backup file ${backupName} not found.` });
      }

      // ✅ Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
      }

      // ✅ Extract the backup archive
      console.log(`Extracting backup: ${archivePath} to ${tempDir}`);
      await extract(archivePath, { dir: tempDir });

      if (!databaseName) {
          // ✅ If no database is specified, return a list of databases
          const databases = fs.readdirSync(tempDir).filter(dir =>
              fs.statSync(path.join(tempDir, dir)).isDirectory()
          );

          console.log(`Databases found: ${databases}`);
          return res.status(200).json({ databases });
      }

      // ✅ Check if the selected database exists
      const dbPath = path.join(tempDir, databaseName);
      if (!fs.existsSync(dbPath)) {
          return res.status(400).json({ message: `Database ${databaseName} not found in backup.` });
      }

      // ✅ Return BSON collections inside the selected database
      const collections = fs.readdirSync(dbPath).filter(file => file.endsWith(".bson"));

      console.log(`Collections found in ${databaseName}: ${collections}`);
      return res.status(200).json({ collections });
  } catch (error) {
      console.error("Error listing collections:", error);
      res.status(500).json({ message: "Failed to list collections", error: error.message });
  } finally {
      // ✅ Cleanup extracted files safely
      setTimeout(() => {
          fs.rm(tempDir, { recursive: true, force: true }, (err) => {
              if (err) console.error("Failed to remove temp extraction folder:", err);
          });
      }, 5000);
  }
};

export const backupDatabase = async (req, res) => {
  if (!backupDir) {
      return res.status(400).json({ message: 'Backup directory not set' });
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/:/g, '-').replace(/\..+/, '').replace('T', '_');
  const backupDirPath = normalizePath(path.join(backupDir, timestamp));
  const archivePath = normalizePath(`${backupDirPath}.zip`);
  const databaseName = 'adminis';

  try {
      // Ensure backup directory exists
      if (!fs.existsSync(backupDirPath)) {
          fs.mkdirSync(backupDirPath, { recursive: true });
      }

      // Run `mongodump` and wait for completion
      await new Promise((resolve, reject) => {
          const command = `mongodump --uri "${mongoURL}" --db ${databaseName} --out "${backupDirPath}"`;
          exec(command, (error, stdout, stderr) => {
              if (error) {
                  console.error('Error executing mongodump:', error);
                  return reject(error);
              }
              resolve(stdout);
          });
      });

      // Create a zip archive
      const output = fs.createWriteStream(archivePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      // Handle archive errors
      archive.on('error', (err) => {
          console.error('Archiver Error:', err);
          return res.status(500).json({ message: 'Error compressing backup', error: err.message });
      });

      output.on('close', () => {
          console.log(`Backup archived: ${archivePath} (${archive.pointer()} bytes)`);
          
          // Cleanup: Remove original backup folder asynchronously
          fs.rm(backupDirPath, { recursive: true, force: true }, (err) => {
              if (err) {
                  console.error('Failed to remove backup folder:', err);
              }
          });

          // ✅ Ensure response is sent
          res.status(200).json({
              message: 'Backup created and archived successfully',
              archivePath: archivePath,
          });
      });

      // Pipe archive to file
      archive.pipe(output);
      archive.directory(backupDirPath, false);
      await archive.finalize();
  } catch (error) {
      console.error('Backup failed:', error);
      return res.status(500).json({ message: 'Backup failed', error: error.message });
  }
};

export const restoreDatabase = async (req, res) => {
  const { timestamp, filename, databaseName } = req.body;

  if (!timestamp || !filename || !databaseName) {
    return res.status(400).json({ 
      message: 'All inputs are required: timestamp, filename, and database name.' 
    });
  }

  try {
    let backupPath = normalizePath(path.join(backupDir, timestamp));
    let tempDir = null;
    
    // Check if we're restoring from a zip archive
    if (timestamp.endsWith('.zip')) {
      // Create a temporary directory for extraction
      tempDir = path.join(backupDir, `temp_${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });
      
      // Extract the archive to the temp directory
      await new Promise((resolve, reject) => {
        const extract = require('extract-zip');
        extract(backupPath, { dir: tempDir })
          .then(resolve)
          .catch(reject);
      });
      
      // Update the path to point to the extracted content
      backupPath = tempDir;
    }
    
    // Construct the path to the BSON file
    const filePath = normalizePath(path.join(backupPath, databaseName, filename));
    
    if (!fs.existsSync(filePath)) {
      // Clean up temp directory if it was created
      if (tempDir) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      
      return res.status(400).json({ 
        message: `Backup file not found at ${filePath}. Ensure the file exists.` 
      });
    }

    const collectionName = path.basename(filename, '.bson');
    const command = `mongorestore --uri="${mongoURL}" --nsInclude=${databaseName}.${collectionName} "${filePath}"`;

    // Execute the restore command
    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Restore failed:', stderr);
          reject(new Error(stderr));
          return;
        }
        resolve(stdout);
      });
    });
    
    // Clean up temp directory if it was created
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    
    res.status(200).json({ 
      message: `Collection '${collectionName}' restored successfully into database '${databaseName}'` 
    });
  } catch (error) {
    console.error('Restore failed:', error);
    res.status(500).json({ 
      message: `Restore failed: ${error.message}` 
    });
  }
};

export const generateAnnouncement = async (req, res) => {
    try {
        const { input, type } = req.body;

        let prompt = "";
        if (type === "achievement") {
            prompt = `Write a short announcement about this achievement: ${input}`;
        } else if (type === "event") {
            prompt = `Write a short announcement about this event: ${input}`;
        } else if (type === "product") {
            prompt = `Write a short announcement about this product: ${input}`;
        } else {
            return res.status(400).json({ message: "Invalid type" });
        }

        const model = gemini.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response.candidates[0].content.parts[0].text;

        res.json({ announcement: response });
    } catch (error) {
        console.error("Gemini API Error", error);
        res.status(500).json({ message: "An error occurred with the Gemini API", error: error.message });
    }
};

export const chatbox = async (req, res) => {
  const { message, conversationHistory } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  try {
    // Simple response logic based on input
    let botReply;
    const userMessage = message.toLowerCase().trim();

    // Check if the message is a request status check
    if (userMessage.includes('request status') || userMessage.includes('check status')) {
      // Find pending requests for the user from the session
      const username = req.session?.username;
      if (!username) {
        botReply = "Please log in to check your request status.";
      } else {
        // Query the Message collection for pending requests
        const pendingRequests = await Message.find({
          'metadata.requester': username,
          status: { $in: ['pending', 'accepted', 'cancelled'] }
        }).sort({ createdAt: -1 }).limit(5);

        if (pendingRequests.length === 0) {
          botReply = "You don't have any recent access requests.";
        } else {
          // Format the requests status
          botReply = "Here are your recent requests:\n\n";
          pendingRequests.forEach(request => {
            const statusEmoji = {
              'pending': '⏳',
              'accepted': '✅',
              'cancelled': '❌'
            }[request.status];
            
            const pageName = request.metadata.pageName;
            const requestDate = new Date(request.createdAt).toLocaleDateString();
            
            botReply += `${statusEmoji} ${pageName} - ${request.status.toUpperCase()} (${requestDate})\n`;
            
            if (request.status === 'accepted') {
              const expiryDate = new Date(request.metadata.expiryDate).toLocaleDateString();
              botReply += `   Access expires on: ${expiryDate}\n`;
            }
          });
        }
      }
    } else if (userMessage.includes('hi') || userMessage.includes('hello')) {
      botReply = "Hi there! How can I assist you today?";
    } else if (userMessage.includes('help')) {
      botReply = `I can help you with:
1. Requesting access to pages
2. Checking your request status (just say "check status")
3. General assistance

What would you like help with?`;
    } else if (userMessage.includes('make a paragrap')) {
      botReply = `
        You have the following pending requests:

        1. Grant access to the **Dashboard Page**.
        2. Grant access to the **Admin Settings**.
        3. Grant access to the **User Analytics Page**.

        Please choose an option:
        - Type the number of the request you want to process (e.g., "1" for Dashboard Page).
        - Or type "Cancel" to dismiss all requests.
      `;
    } else if (["1", "2", "3"].includes(userMessage)) {
      const responses = {
        "1": "Access to the Dashboard Page has been granted.",
        "2": "Access to Admin Settings has been granted.",
        "3": "Access to the User Analytics Page has been granted.",
      };
      botReply = responses[userMessage];
    } else if (userMessage === "cancel") {
      botReply = "All pending requests have been dismissed.";
    } else {
      // Default response for unrecognized input
      botReply = `You said: "${message}". If you need help, just ask!`;
    }

    // Optionally update conversation history
    const updatedHistory = [
      ...(conversationHistory || []),
      { text: message, sender: 'user' },
      { text: botReply, sender: 'gemini' },
    ];

    // Respond with the bot's reply and updated history
    res.json({
      response: botReply,
      conversationHistory: updatedHistory,
    });

  } catch (error) {
    console.error('Error in chatbox controller:', error);
    res.status(500).json({
      error: 'An error occurred while processing your message',
      details: error.message
    });
  }
};
  
export const getRequestStatus = async (req, res) => {
  try {
    const { username } = req.params;
    const updates = await Message.find({
      'metadata.requester': username,
      status: { $in: ['accepted', 'cancelled'] },
      'responseMetadata.notified': { $ne: true }
    });

    // Mark updates as notified
    await Message.updateMany(
      { _id: { $in: updates.map(u => u._id) } },
      { $set: { 'responseMetadata.notified': true } }
    );

    res.json({ success: true, updates });
  } catch (error) {
    console.error('Error fetching request status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const handleStatusUpdate = async (req, res) => {
  try {
    const { userId, status, messageId, respondedBy } = req.body;
    
    // Get the socket ID for the specific user
    const socketId = userSockets.get(userId);
    
    if (socketId) {
      // Emit to specific user's room
      io.to(userId).emit('requestStatusUpdate', {
        userId,
        status,
        messageId,
        respondedBy
      });
    }
    
    // Update the message in database
    await Message.findByIdAndUpdate(messageId, {
      status,
      'responseMetadata.respondedBy': respondedBy,
      'responseMetadata.responseTime': new Date()
    });
    
    res.json({ success: true, message: 'Status update sent successfully' });
  } catch (error) {
    console.error('Error sending status update:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

  export const generateAccessRequestMessage = (username, name, department, pageName, details) => {
    const timestamp = new Date().toLocaleString();
    return `Access Request Details:
  - Username: ${username}
  - Full Name: ${name || 'N/A'}
  - Department: ${department}
  - Page Requested: ${pageName}
  - Request Time: ${timestamp}
  - Page URL: /${pageName.toLowerCase()}
  
  Please review this access request and either approve or deny it through the messaging system.`;
  };
  
  export const sendMessage = async (req, res) => {
    try {
      const { requestType, pageName, name, department, username, requestDetails } = req.body;
  
      if (!requestType || !pageName || !department || !username) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields" 
        });
      }
  
      // Now correctly passing the name parameter
      const messageContent = generateAccessRequestMessage(
        username,
        name,  // Passing name here
        department,
        pageName,
        requestDetails
      );
  
      const newMessage = new Message({
        content: messageContent,
        department,
        targetRole: 'superadmin',
        status: 'pending',
        metadata: {
          requestType,
          pageName,
          requester: username,
          name: name,  // Storing name properly in metadata
          requestDetails: {
            ...requestDetails,
            requestTime: new Date()
          }
        }
      });
  
      await newMessage.save();
  
      res.json({ 
        success: true, 
        message: messageContent,
        messageId: newMessage._id 
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to process message" 
      });
    }
  };
  
  export const getDepartmentMessages = async (req, res) => {
    try {
      const { department } = req.params;
      const { role } = req.query;
  
      console.log("Received request for messages:", { department, role });
  
      if (!department || role !== 'superadmin') {
        console.log("Authorization failed:", { department, role });
        return res.status(403).json({ 
          success: false, 
          error: "Unauthorized access" 
        });
      }
  
      const messages = await Message.find({ 
        department,
        targetRole: 'superadmin',
        status: 'pending'
      }).sort({ createdAt: -1 });
  
      console.log("Found messages:", messages);
  
      res.json({ 
        success: true, 
        messages 
      });
    } catch (error) {
      console.error("Error in getDepartmentMessages:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch messages" 
      });
    }
  };
  

  export const updateMessageStatus = async (req, res) => {
      try {
          const { id } = req.params;
          const { status, responderUsername } = req.body;
  
          if (!id || !status || !responderUsername) {
              return res.status(400).json({ success: false, error: "Missing required fields" });
          }
  
          if (!['accepted', 'cancelled'].includes(status)) {
              return res.status(400).json({ success: false, error: "Invalid status" });
          }
  
          // Find the request in the database
          const message = await Message.findById(id);
          if (!message) {
              return res.status(404).json({ success: false, error: "Message not found" });
          }
  
          // Update the request status
          message.status = status;
          message.responseMetadata = {
              respondedBy: responderUsername,
              responseTime: new Date()
          };
  
          await message.save();
  
          // Grant access if request was accepted
          if (status === "accepted") {
              try {
                  const userId = message.metadata.requester;
                  const pagePath = `/${message.metadata.pageName.toLowerCase()}`;
  
                  // Find user and update permissions
                  const user = await User.findOne({ username: userId });
                  if (!user) {
                      throw new Error('User not found');
                  }
  
                  // Set up expiry date (24 hours from now)
                  const now = new Date();
                  const expiryDate = new Date();
                  expiryDate.setDate(now.getDate() + 1);
  
                  // Update user's permissions
                  if (!user.permissions) {
                      user.permissions = [];
                  }
                  if (!user.permissions.includes(pagePath)) {
                      user.permissions.push(pagePath);
                  }
  
                  // Update expiry map
                  if (!user.expiryMap) {
                      user.expiryMap = {};
                  }
                  user.expiryMap[pagePath] = expiryDate;
  
                  // Save the updated user
                  await user.save();
                  console.log(`Updated permissions for user ${userId}:`, {
                      permissions: user.permissions,
                      expiryMap: user.expiryMap
                  });
  
                  // Emit event via socket.io
                  const io = req.app.get("io");
                  if (io) {
                      io.emit("permissionUpdated", {
                          userId,
                          grantedBy: responderUsername,
                          name: user.name,
                          permissions: [pagePath]
                      });
                      console.log(`Sent real-time notification to ${userId}`);
                  }
              } catch (error) {
                  console.error("Error granting access:", error);
                  return res.status(500).json({ 
                      success: false, 
                      error: "Failed to grant access",
                      details: error.message 
                  });
              }
          }
  
          res.json({ 
              success: true, 
              message: `Request ${status} and permissions ${status === 'accepted' ? 'granted' : 'unchanged'}`, 
              data: message 
          });
      } catch (error) {
          console.error("Error updating message:", error);
          res.status(500).json({ 
              success: false, 
              error: "Failed to update request status",
              details: error.message 
          });
      }
  };


  export const createLog = async (user, action, description, route ) => {
      try {
          const newLog = new Log({
              username: user.username,
              name: user.name,
              department: user.department,
              role: user.role,
              action,
              description,
              route, // Ensure route is always provided
          });
          await newLog.save();
      } catch (error) {
          console.error('Error creating log:', error);
      }
  };
  
  
  // Log user route visits
  export const logRouteVisit = async (req, res, next) => {
      if (req.session.user) {
          const { username, name, department, role } = req.session.user;
          const route = req.originalUrl;
          const description = `User visited ${route}`;
  
          // Exclude logging for /logs/activity route
          if (route !== '/try/logs/activity') { // <- This is the crucial change
              try {
                  await createLog({ username, name, department, role }, 'Route Visit', description, route);
              } catch (error) {
                  console.error('Error logging route visit:', error);
              }
          }
  
      }
      next();
  };
  
  // Fetch all logs
  export const getLogs = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;
  
      // Build filter query
      const filterQuery = {};
      if (req.query.username) filterQuery.username = new RegExp(req.query.username, 'i');
      if (req.query.department) filterQuery.department = new RegExp(req.query.department, 'i');
      if (req.query.role) filterQuery.role = new RegExp(req.query.role, 'i');
      if (req.query.action) filterQuery.action = new RegExp(req.query.action, 'i');
      if (req.query.startDate || req.query.endDate) {
        filterQuery.timestamp = {};
        if (req.query.startDate) filterQuery.timestamp.$gte = new Date(req.query.startDate);
        if (req.query.endDate) filterQuery.timestamp.$lte = new Date(req.query.endDate);
      }
  
      // Execute queries in parallel
      const [logs, total] = await Promise.all([
        Log.find(filterQuery)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(), // Use lean() for better performance
        Log.countDocuments(filterQuery)
      ]);
  
      res.status(200).json({
        logs,
        total,
        pages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  export const logFrontendActivity = async (req, res) => {
      try {
          const user = req.session.user; // Get user session
  
          if (!user) {
              return res.status(401).json({ message: "Unauthorized: No user session found" });
          }
  
          const { route, action, description } = req.body; // Get frontend data
  
          if (!route || !action || !description) {
              return res.status(400).json({ message: "Missing required fields" });
          }
  
          // Log activity
          await Log.create({
              username: user.username,
              name: user.name,
              department: user.department,
              role: user.role,
              route,        // Store the route from frontend
              action,       // Store the action from frontend
              description,  // Store the description from frontend
              timestamp: new Date()
          });
  
          res.status(200).json({ message: "Activity logged successfully" });
      } catch (error) {
          console.error("❌ Error logging activity:", error);
          res.status(500).json({ message: "Internal Server Error" });
      }
  };
  
  
  export const getUserActivity = async (req, res) => {
      try {
          if (!req.session.user) {
              return res.status(401).json({ message: "Unauthorized: No user session found" });
          }
  
          const { username } = req.session.user; // Get username from session
  
          const logs = await Log.find({ username }).sort({ timestamp: -1 }); // Fetch logs by username
  
          if (!logs.length) {
              return res.status(404).json({ message: "No activity found for this user" });
          }
  
          res.status(200).json(logs);
      } catch (error) {
          console.error("❌ Error fetching user activity:", error);
          res.status(500).json({ message: "Internal Server Error" });
      }
  };