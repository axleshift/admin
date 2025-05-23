import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import archiver from 'archiver';
import extract from 'extract-zip';
import dotenv from 'dotenv';
import os from 'os';



import { GoogleGenerativeAI } from "@google/generative-ai";
import Message from '../model/message.js'
import User from '../model/User.js'
import passport from 'passport'
import { Strategy as GitHubStrategy } from "passport-github2";
import jwt  from 'jsonwebtoken'


dotenv.config();


const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



const mongoURL = process.env.MONGO_URL;
const databaseName = process.env.DATABASE_NAME || 'adminis';

const getDownloadDirectory = () => {
  const homeDir = os.homedir();  // Get the user's home directory

  if (process.platform === 'win32') {
    // Windows: Use the Downloads folder in the user's home directory
    return path.join(homeDir, 'Downloads', 'my-backups');
  } else {
    // Linux/macOS: Use the Downloads folder in the user's home directory
    return path.join(homeDir, 'Downloads', 'my-backups');
  }
};

const backupDir = getDownloadDirectory();

if (!fs.existsSync(backupDir)) {
  try {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`Created backup directory at: ${backupDir}`);
  } catch (error) {
    console.error(`Failed to create backup directory: ${error.message}`);
  }
}

const normalizePath = (filepath) => {
  if (!filepath) return '';
  return path.normalize(filepath).replace(/\\/g, '/');
};


// Fix for setBackupDirectory function
export const backupDatabase = async (req, res) => {
  const collectionsToBackup = process.env.BACKUP_COLLECTIONS
      ? process.env.BACKUP_COLLECTIONS.split(',')
      : []; // Read collections from the environment variable

  if (collectionsToBackup.length === 0) {
      return res.status(400).json({ message: 'No collections specified for backup in the configuration.' });
  }

  console.log(`Backing up collections: ${collectionsToBackup.join(', ')}`);

  const now = new Date();
  const timestamp = now.toISOString().replace(/:/g, '-').replace(/\..+/, '').replace('T', '_');
  const backupDirPath = normalizePath(path.join(backupDir, timestamp));

  try {
      if (!mongoURL) {
          return res.status(500).json({ message: 'MongoDB connection URL is not configured' });
      }

      // Create a directory for this backup
      fs.mkdirSync(backupDirPath, { recursive: true });

      const mongoCommand = process.env.MONGODUMP_PATH || 'mongodump';

      for (const collectionName of collectionsToBackup) {
          const collectionBackupPath = path.join(backupDirPath, `${collectionName}.bson`);

          let command;
          if (process.platform === 'win32') {
              command = `${mongoCommand} --uri="${mongoURL}" --db=${databaseName} --collection=${collectionName} --out="${backupDirPath}"`;
          } else {
              command = `${mongoCommand} --uri='${mongoURL}' --db=${databaseName} --collection=${collectionName} --out='${backupDirPath}'`;
          }

          console.log(`Executing command for collection '${collectionName}': ${command.replace(mongoURL, '***REDACTED***')}`);

          await new Promise((resolve, reject) => {
              exec(command, (error, stdout, stderr) => {
                  if (error) {
                      console.error(`Error backing up collection '${collectionName}':`, error);
                      return reject(new Error(`mongodump failed for collection '${collectionName}': ${stderr || error.message}`));
                  }
                  if (stderr) console.warn(`mongodump stderr for collection '${collectionName}':`, stderr);
                  console.log(`mongodump stdout for collection '${collectionName}':`, stdout);
                  resolve(stdout);
              });
          });
      }

      // Optionally, zip the backup directory
      const archivePath = normalizePath(path.join(backupDir, `${timestamp}.zip`));
      const output = fs.createWriteStream(archivePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      const archivePromise = new Promise((resolve, reject) => {
          archive.on('error', reject);
          output.on('close', resolve);
      });

      archive.pipe(output);
      archive.directory(backupDirPath, false);
      await archive.finalize();
      await archivePromise;

      // Clean up the temporary directory after successful zip creation
      fs.rm(backupDirPath, { recursive: true, force: true }, () => {});

      res.status(200).json({
          message: `Backup for collections '${collectionsToBackup.join(', ')}' created successfully`,
          archivePath: `${timestamp}.zip`,
      });
  } catch (error) {
      console.error('Backup error:', error);
      res.status(500).json({ message: 'Backup failed', error: error.message });
  }
};

export const listBackups = (req, res) => {
  try {
    if (!fs.existsSync(backupDir)) {
      return res.status(400).json({ message: 'Backup directory does not exist', backups: [] });
    }

    const files = fs.readdirSync(backupDir);
    const backups = files
      .filter(file => file.endsWith('.zip'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: normalizePath(filePath),
          created: stats.birthtime,
          size: stats.size,
        };
      })
      .sort((a, b) => b.created - a.created);

    res.status(200).json({ backups });
  } catch (error) {
    res.status(500).json({ message: 'Failed to list backups', error: error.message, backups: [] });
  }
};

export const listCollections = async (req, res) => {
  const { backupName } = req.params;

  const archivePath = normalizePath(path.join(backupDir, backupName));
  const tempDirName = `temp_${Date.now()}`;
  const tempDir = normalizePath(path.join(backupDir, tempDirName));

  try {
    if (!fs.existsSync(archivePath)) {
      return res.status(400).json({ message: `Backup file ${backupName} not found.` });
    }

    // Extract the backup zip file
    fs.mkdirSync(tempDir, { recursive: true });
    await extract(archivePath, { dir: tempDir });

    // Automatically detect collections
    const dbDirectories = fs.readdirSync(tempDir).filter(item =>
      fs.statSync(path.join(tempDir, item)).isDirectory()
    );

    if (dbDirectories.length === 0) {
      return res.status(400).json({ message: 'No database directories found in the backup.' });
    }

    const databasePath = path.join(tempDir, dbDirectories[0]); // Assume the first directory is the database
    const dbContents = fs.readdirSync(databasePath);
    const collections = dbContents
      .filter(file => file.endsWith('.bson'))
      .map(file => path.basename(file, '.bson')); // Extract collection names

    if (collections.length === 0) {
      return res.status(200).json({ collections: [] });
    }

    return res.status(200).json({ collections });
  } catch (error) {
    console.error('Error listing collections:', error);
    res.status(500).json({ message: 'Failed to list collections', error: error.message });
  } finally {
    // Cleanup temporary directory
    setTimeout(() => {
      fs.rm(tempDir, { recursive: true, force: true }, () => {});
    }, 5000);
  }
};

export const restoreDatabase = async (req, res) => {
  const { timestamp, filename } = req.body;

  if (!timestamp || !filename) {
    return res.status(400).json({ message: 'All inputs are required: timestamp and filename.' });
  }

  let tempDir = null;

  try {
    // Step 1: Validate the backup file path
    const backupPath = normalizePath(path.join(backupDir, timestamp));
    console.log('Backup path:', backupPath);

    if (!fs.existsSync(backupPath)) {
      return res.status(400).json({ message: `Backup file not found: ${backupPath}` });
    }

    // Step 2: Create a temporary directory for extraction
    const tempDirName = `temp_restore_${Date.now()}`;
    tempDir = normalizePath(path.join(backupDir, tempDirName));
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('Temporary directory created:', tempDir);

    // Step 3: Extract the backup file
    await extract(backupPath, { dir: tempDir });
    console.log('Backup extracted successfully.');

    // Step 4: Detect the database directory
    const dbDirectories = fs.readdirSync(tempDir).filter(item =>
      fs.statSync(path.join(tempDir, item)).isDirectory()
    );
    console.log('Detected database directories:', dbDirectories);

    if (dbDirectories.length === 0) {
      throw new Error(`No database directories found in the backup. Backup path: ${tempDir}`);
    }

    const databaseName = dbDirectories[0]; // Assume the first directory is the database
    console.log('Detected database name:', databaseName);

    // Step 5: Validate the collection file path
    const dbDir = path.join(tempDir, databaseName);

    // Ensure the filename includes the `.bson` extension
    const bsonFilename = filename.endsWith('.bson') ? filename : `${filename}.bson`;
    const filePath = path.join(dbDir, bsonFilename);
    console.log('File path for restoration:', filePath);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}. Ensure the filename is correct.`);
    }

    // Step 6: Prepare the `mongorestore` command
    const collectionName = path.basename(bsonFilename, '.bson');
    if (!mongoURL) throw new Error('MongoDB connection URL is not defined');

    const mongoCommand = process.env.MONGORESTORE_PATH || 'mongorestore';
    const filePathQuoted = process.platform === 'win32' ? `"${filePath}"` : `'${filePath}'`;
    const mongoUrlQuoted = process.platform === 'win32' ? `"${mongoURL}"` : `'${mongoURL}'`;
    const command = `${mongoCommand} --uri=${mongoUrlQuoted} --nsInclude="${databaseName}.${collectionName}" --drop ${filePathQuoted}`;
    console.log('Executing command:', command);

    // Step 7: Execute the `mongorestore` command
    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Command error:', error);
          console.error('Command stderr:', stderr);
          return reject(new Error(`mongorestore failed: ${stderr || error.message}`));
        }
        console.log('Command stdout:', stdout);
        resolve(stdout);
      });
    });

    // Step 8: Respond with success
    res.status(200).json({ message: `Collection '${collectionName}' restored successfully` });
  } catch (error) {
    console.error('Restore failed:', error);
    res.status(500).json({ message: `Restore failed: ${error.message}`, error: error.toString() });
  } finally {
    // Step 9: Cleanup the temporary directory
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log('Temporary directory cleaned up:', tempDir);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
  }
};

//announcement .js




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
