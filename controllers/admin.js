import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import archiver from 'archiver';
import extract from "extract-zip";
import { pipeline } from 'stream/promises';

import { GoogleGenerativeAI } from "@google/generative-ai";
import Message from '../model/message.js'
import User from '../model/User.js'
import passport from 'passport'
import { Strategy as GitHubStrategy } from "passport-github2";
import jwt  from 'jsonwebtoken'


import coreuserModel from '../model/coreuser.js'
import financeuserModel from '../model/financeuser.js'
import hruserModel from '../model/hruser.js';
import logisticuserModel from '../model/logisticuser.js'


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
        let coreuser = await coreuserModel.findOne({githubId:profile.id})
        let financeuser = await financeuserModel.findOne({githubId:profile.id})
        let logisticuser = await logisticuserModel.findOne({githubId:profile.id})
        let hruser = await hruserModel.findOne({githubId:profile.id})
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
export const getCoreUsers = async (req, res) => {
  try {
    const users = await coreuserModel.find();
    
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found in Core department" });
    }
    
    res.json({ 
      department: "Core",
      users 
    });
  } catch (error) {
    console.error("Error fetching Core users:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Finance department users endpoint
export const getFinanceUsers = async (req, res) => {
  try {
    const users = await financeuserModel.find();
    
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found in Finance department" });
    }
    
    res.json({ 
      department: "Finance",
      users 
    });
  } catch (error) {
    console.error("Error fetching Finance users:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// HR department users endpoint
export const getHRUsers = async (req, res) => {
  try {
    const users = await hruserModel.find();
    
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found in HR department" });
    }
    
    res.json({ 
      department: "HR",
      users 
    });
  } catch (error) {
    console.error("Error fetching HR users:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Logistics department users endpoint
export const getLogisticsUsers = async (req, res) => {
  try {
    const users = await logisticuserModel.find();
    
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found in Logistics department" });
    }
    
    res.json({ 
      department: "Logistics",
      users 
    });
  } catch (error) {
    console.error("Error fetching Logistics users:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// export const getUsersBy = async (req, res) => {
//   try {
//     const department = req.params.department.toLowerCase();
//     const users = await User.find({ department });

//     if (users.length === 0) {
//       return res.status(404).json({ message: `No users found in ${department} department` });
//     }
//     res.json({ department, users });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

async function generateImage(prompt, username) {
  try {
    // Use gemini-1.5-pro model which supports image generation
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Create the generation request
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: `Generate a detailed image of: ${prompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      }
    });
    
    // Process the response
    const response = result.response;
    const imageData = response.candidates[0].content.parts.find(part => part.inlineData);
    
    if (!imageData) {
      throw new Error("No image was generated by the model");
    }
    
    // Get the base64 image data
    const imageBase64 = imageData.inlineData.data;
    const mimeType = imageData.inlineData.mimeType || 'image/png';
    
    // Store image generation in database
    const timestamp = Date.now();
    const filename = `${username || 'anonymous'}_${timestamp}.png`;
    
    const imageRecord = new Message({
      content: prompt,
      type: 'image',
      metadata: {
        requester: username || 'anonymous',
        prompt,
        filename,
        timestamp
      },
      status: 'completed'
    });
    
    await imageRecord.save();
    
    return {
      success: true,
      imageId: imageRecord._id,
      imageData: imageBase64,
      mimeType,
      prompt
    };
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
}


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

  // Check if backupDir is defined
  if (!backupDir) {
    return res.status(400).json({ message: 'Backup directory not set' });
  }

  let tempDir = null;
  
  try {
    console.log(`Restoration request: ${JSON.stringify(req.body)}`);
    
    // Construct the complete path to the backup file
    const backupPath = normalizePath(path.join(backupDir, timestamp));
    console.log(`Backup path: ${backupPath}`);
    
    // Verify the backup file exists before proceeding
    if (!fs.existsSync(backupPath)) {
      return res.status(400).json({ 
        message: `Backup file not found: ${backupPath}` 
      });
    }
    
    // Create a temporary directory with a unique name for extraction
    tempDir = path.join(backupDir, `temp_restore_${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`Created temp directory: ${tempDir}`);
    
    // Extract the archive
    console.log(`Extracting ${backupPath} to ${tempDir}`);
    await extract(backupPath, { dir: tempDir });
    
    // Construct the path to the BSON file
    const dbDir = path.join(tempDir, databaseName);
    const filePath = path.join(dbDir, filename);
    
    console.log(`Looking for file at: ${filePath}`);
    
    // Check if the extracted files and directories exist
    if (!fs.existsSync(dbDir)) {
      throw new Error(`Database directory not found: ${dbDir}`);
    }
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Collection file not found: ${filePath}`);
    }

    // Get collection name from filename (remove .bson extension)
    const collectionName = path.basename(filename, '.bson');
    
    // Ensure mongoURL is properly defined in your environment
    if (!mongoURL) {
      throw new Error('MongoDB connection URL is not defined');
    }
    
    // Create the mongorestore command
    const command = `mongorestore --uri="${mongoURL}" --nsInclude="${databaseName}.${collectionName}" --drop "${filePath}"`;
    console.log(`Executing restore command: ${command}`);

    // Execute the command and capture output
    const { stdout, stderr } = await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`mongorestore error: ${error.message}`);
          console.error(`stderr: ${stderr}`);
          return reject(error);
        }
        resolve({ stdout, stderr });
      });
    });
    
    console.log(`Restore stdout: ${stdout}`);
    if (stderr) console.log(`Restore stderr: ${stderr}`);
    
    res.status(200).json({ 
      message: `Collection '${collectionName}' restored successfully` 
    });
  } catch (error) {
    console.error('Restore failed:', error);
    
    res.status(500).json({ 
      message: `Restore failed: ${error.message}`,
      error: error.toString()
    });
  } finally {
    // Clean up the temporary directory regardless of success or failure
    if (tempDir && fs.existsSync(tempDir)) {
      console.log(`Cleaning up temp directory: ${tempDir}`);
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Failed to clean up temp directory:', cleanupError);
      }
    }
  }
};
//announcement .js

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


//chat.js

export const chatbox = async (req, res) => {
  const { message, conversationHistory } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  try {
    // Simple response logic based on input
    let botReply;
    const userMessage = message.toLowerCase().trim();
    const username = req.session?.username;

    // Check if the message is an image generation request
    if (
      userMessage.startsWith('generate image') || 
      userMessage.startsWith('create image') || 
      userMessage.startsWith('make image') || 
      userMessage.startsWith('draw') || 
      userMessage.includes('make a picture of') || 
      userMessage.includes('show me an image of')
    ) {
      // Extract the image prompt from the message
      let imagePrompt = '';
      
      if (userMessage.startsWith('generate image')) {
        imagePrompt = message.substring('generate image'.length).trim();
      } else if (userMessage.startsWith('create image')) {
        imagePrompt = message.substring('create image'.length).trim();
      } else if (userMessage.startsWith('make image')) {
        imagePrompt = message.substring('make image'.length).trim();
      } else if (userMessage.startsWith('draw')) {
        imagePrompt = message.substring('draw'.length).trim();
      } else if (userMessage.includes('make a picture of')) {
        imagePrompt = message.substring(message.indexOf('make a picture of') + 'make a picture of'.length).trim();
      } else if (userMessage.includes('show me an image of')) {
        imagePrompt = message.substring(message.indexOf('show me an image of') + 'show me an image of'.length).trim();
      }
      
      // Remove any leading colons or "of" word
      imagePrompt = imagePrompt.replace(/^[:\s]+|of\s+/, '').trim();
      
      if (!imagePrompt) {
        botReply = "Please provide a description for the image you want me to generate.";
        
        // Standard text response
        const updatedHistory = [
          ...(conversationHistory || []),
          { text: message, sender: 'user' },
          { text: botReply, sender: 'gemini' },
        ];
        
        return res.json({
          response: botReply,
          conversationHistory: updatedHistory,
        });
      }
      
      try {
        // Generate the image
        const imageResult = await generateImage(imagePrompt, username);
        
        botReply = `I've created an image based on: "${imagePrompt}"`;
        
        // Return with the image data
        const updatedHistory = [
          ...(conversationHistory || []),
          { text: message, sender: 'user' },
          { 
            text: botReply, 
            sender: 'gemini',
            type: 'image',
            imageData: imageResult.imageData,
            imageId: imageResult.imageId,
            prompt: imagePrompt
          },
        ];
        
        return res.json({
          response: botReply,
          imageData: imageResult.imageData,
          imageId: imageResult.imageId,
          conversationHistory: updatedHistory,
        });
      } catch (error) {
        console.error("Image generation failed:", error);
        botReply = "I'm sorry, I wasn't able to generate that image. Could you try a different description?";
      }
    } 
    // Check if the message is a request status check
    else if (userMessage.includes('request status') || userMessage.includes('check status')) {
      // Find pending requests for the user from the session
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
3. Generating images (say "generate image of..." or "draw...")
4. General assistance

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
      // Try using Gemini for a more intelligent response
      try {
        const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                { text: message }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1024,
          }
        });
        
        const aiResponse = result.response.text();
        if (aiResponse && aiResponse.trim()) {
          botReply = aiResponse;
        } else {
          // Default response for unrecognized input
          botReply = `You said: "${message}". If you need help, just ask!`;
        }
      } catch (error) {
        console.error('Error getting AI response:', error);
        // Fallback response
        botReply = `You said: "${message}". If you need help, just ask!`;
      }
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
      const { 
        requestType, 
        pageName, 
        name, 
        department, 
        username, 
        requestDetails 
      } = req.body;
  
      // Log the entire request body for debugging
      console.log('Received request body:', req.body);
  
      // Detailed validation with specific error messages
      const missingFields = [];
      if (!requestType) missingFields.push('requestType');
      if (!pageName) missingFields.push('pageName');
      if (!department) missingFields.push('department');
      if (!username) missingFields.push('username');
      if (!name) missingFields.push('name');
  
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields",
          missingFields: missingFields
        });
      }
  
      // Ensure requestDetails is an object
      if (!requestDetails || typeof requestDetails !== 'object') {
        return res.status(400).json({
          success: false,
          error: "Invalid or missing requestDetails"
        });
      }
  
      // Generate message content
      const messageContent = generateAccessRequestMessage(
        username,
        name,
        department,
        pageName,
        requestDetails
      );
  
      const newMessage = new Message({
        content: messageContent,
        department: 'Administrative', // Explicitly set to Administrative
        targetRole: 'superadmin', // Ensure only superadmin can view
        status: 'pending',
        metadata: {
          requestType,
          pageName,
          requester: username,
          name: name,
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
        error: "Failed to process message",
        details: error.message 
      });
    }
  };
  
  export const getDepartmentMessages = async (req, res) => {
    try {
      const { department } = req.params;
      const { role } = req.query;
  
      console.log("Received request for messages:", { department, role });
  
      // Check if the user is a superadmin in the Administrative department
      if (department.toLowerCase() !== 'administrative' || role.toLowerCase() !== 'superadmin') {
        console.log("Authorization failed:", { department, role });
        return res.status(403).json({ 
          success: false, 
          error: "Unauthorized access" 
        });
      }
  
      const messages = await Message.find({ 
        department: 'Administrative', // Exact match for department
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

        console.log('Received update request:', { id, status, responderUsername });

        if (!id || !status || !responderUsername) {
            console.error('Missing required fields', { id, status, responderUsername });
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        if (!['accepted', 'cancelled'].includes(status)) {
            console.error('Invalid status', { status });
            return res.status(400).json({ success: false, error: "Invalid status" });
        }

        // Find the request in the database
        const message = await Message.findById(id);
        if (!message) {
            console.error('Message not found', { id });
            return res.status(404).json({ success: false, error: "Message not found" });
        }

        // CRITICAL DEBUG LOGGING
        console.log('Message Metadata:', {
            requester: message.metadata?.requester,
            pageName: message.metadata?.pageName
        });

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
                const userId = message.metadata?.requester;
                if (!userId) {
                    throw new Error('No requester ID found in message metadata');
                }

                // Clean up pagePath - remove double slashes and ensure single leading slash
                const pagePath = message.metadata.pageName 
                    ? `/${message.metadata.pageName.toLowerCase().replace(/^\/+/, '')}` 
                    : null;

                if (!pagePath) {
                    throw new Error('No valid page path found');
                }

                console.log('Attempting to grant access:', { userId, pagePath });

                // Find user and update permissions
                const user = await User.findOne({ 
                    $or: [
                        { username: userId },
                        { _id: userId }
                    ]
                });

                if (!user) {
                    console.error('User not found', { 
                        userId, 
                        searchCriteria: ['username', 'id'] 
                    });
                    throw new Error(`User not found for ID: ${userId}`);
                }

                // Set up expiry date (24 hours from now)
                const now = new Date();
                const expiryDate = new Date();
                expiryDate.setDate(now.getDate() + 1);

                // Update user's permissions
                user.permissions = user.permissions || [];
                user.expiryMap = user.expiryMap || {};

                if (!user.permissions.includes(pagePath)) {
                    user.permissions.push(pagePath);
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
            } catch (accessError) {
                console.error("Detailed access granting error:", {
                    message: accessError.message,
                    stack: accessError.stack
                });
                return res.status(500).json({ 
                    success: false, 
                    error: "Failed to grant access",
                    details: accessError.message 
                });
            }
        }

        res.json({ 
            success: true, 
            message: `Request ${status} and permissions ${status === 'accepted' ? 'granted' : 'unchanged'}`, 
            data: message 
        });
    } catch (error) {
        console.error("Comprehensive error in updateMessageStatus:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ 
            success: false, 
            error: "Failed to update request status",
            details: error.message 
        });
    }
};

export const getallmessage = async(req,res)=>{
  try {
      const messages = await Message.find();
      res.json({ success: true, messages });
  } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
}


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
  
  

  const generateUsername = (role, name) => {
    const sanitizedName = name.toLowerCase().replace(/\s+/g, '');
    const random = Math.floor(100 + Math.random() * 900);
    return `${role}-${sanitizedName}${random}`;
};

export const registerUser = async (req, res) => {
    const { name, email, password, phoneNumber, role, adminUsername, department, address } = req.body;
    console.log("Received registration data:", req.body);
    
    // Validate input using Joi
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string()
            .min(8)
            .pattern(/[a-z]/, "lowercase")
            .pattern(/[A-Z]/, "uppercase")
            .pattern(/[0-9]/, "numbers")
            .pattern(/[@$!%*?&#]/, "special characters")
            .required(),
        phoneNumber: Joi.string().required(),
        role: Joi.string().valid("admin", "manager", "employee", "user", "staff", "superadmin", "technician").required(),
        adminUsername: Joi.string().when("role", { is: Joi.valid("admin", "manager", "employee"), then: Joi.required() }),
        department: Joi.string().valid("HR", "Core", "Logistics", "Finance", "Administrative").required(),
        address: Joi.string().optional()
    });
    
    const { error } = schema.validate({ 
        name, email, password, phoneNumber, role, adminUsername, department, address 
    });
    
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    
    try {
        // Check for existing user in main User model
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }
        
        // Check for admin username if applicable
        if (["admin", "manager", "employee"].includes(role)) {
            const existingAdmin = await User.findOne({ username: adminUsername, role: "admin" });
            if (!existingAdmin) {
                return res.status(400).json({ error: "Invalid admin username" });
            }
        }
        
        // Generate username for main User model only
        const username = generateUsername(role, name);
        
        // Save user to the main User model
        const newUser = new User({
            name,
            email,
            password, // The pre-save hook will hash this
            phoneNumber,
            role,
            department,
            username
        });
        
        const savedUser = await newUser.save();
        console.log(`User saved to main User model: ${savedUser._id}`);
        
        // Now add the user to the appropriate department model
        let departmentUser;
        
        switch(department) {
            case 'Finance':
                departmentUser = new FinanceUser({
                    userNumber: '', // Left blank as requested
                    fullName: name,
                    email,
                    password: savedUser.password, // Already hashed from main model
                    role,
                    phone: phoneNumber,
                    address: address || '',
                    image: ''
                });
                break;
                
            case 'HR':
            case 'Core':
            case 'Logistics':
                // Extract first and last name
                const nameParts = name.split(' ');
                const firstname = nameParts[0];
                const lastname = nameParts.slice(1).join(' ');
                
                // Use the appropriate model based on department
                const DeptModel = department === 'HR' ? HRUser : 
                                  department === 'Core' ? CoreUser : LogisticsUser;
                
                departmentUser = new DeptModel({
                    userNumber: '', // Left blank as requested
                    firstname,
                    lastname,
                    email,
                    password: savedUser.password, // Already hashed from main model
                    role,
                    phone: phoneNumber,
                    address: address || '',
                    image: ''
                });
                break;
                
            case 'Administrative':
                departmentUser = new AdminUser({
                    userNumber: '', // Left blank as requested
                    fullName: name,
                    email,
                    password: savedUser.password, // Already hashed from main model
                    role,
                    phone: phoneNumber,
                    address: address || '',
                    image: ''
                });
                break;
                
            default:
                throw new Error(`Department model not found for ${department}`);
        }
        
        const savedDeptUser = await departmentUser.save();
        console.log(`User added to ${department} department successfully. ID: ${savedDeptUser._id}`);
        
        // Prepare response (removing sensitive data)
        const userResponse = {
            _id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role,
            phoneNumber: savedUser.phoneNumber,
            department: savedUser.department,
            username: savedUser.username,
            departmentUserId: savedDeptUser._id
        };
        
        res.status(201).json({
            user: userResponse,
            message: `User successfully registered and added to ${department} department`
        });
        
    } catch (error) {
        console.error("Registration error:", error.message);
        // If there's a database error like duplicate key, provide more specific error
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: "Registration failed", 
                error: "Duplicate email or username" 
            });
        }
        res.status(500).json({ 
            message: "Server error. Please try again later.", 
            error: error.message 
        });
    }
};

