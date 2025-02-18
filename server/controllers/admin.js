
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Message from '../model/message.js'
import User from '../model/User.js'

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let backupDir = ''; // The base directory for backups
const mongoURL = process.env.MONGO_URL || 'your-default-mongo-uri-here';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const setBackupDirectory = (req, res) => {
    const { directory } = req.body;

    if (!directory) {
        return res.status(400).json({ message: 'Directory is required' });
    }

    backupDir = directory;
    console.log(`Backup directory set to: ${backupDir}`);
    res.status(200).json({ message: `Backup directory set to: ${backupDir}` });
};

export const backupDatabase = (req, res) => {
    if (!backupDir) {
        return res.status(400).json({ message: 'Backup directory not set' });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = String(hours % 12 || 12).padStart(2, '0');

    const timestamp = `${year}-${month}-${day}_${formattedHours}-${minutes}-${seconds}-${ampm}`;
    const filePath = path.join(backupDir, `${timestamp}`);

    const databaseName = 'adminis';
    const command = `mongodump --uri "${mongoURL}" --db ${databaseName} --out ${filePath}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing mongodump:', error);
            return res.status(500).json({ message: 'Backup failed', error: error.message });
        }
        res.status(200).json({ message: 'Backup successful', filePath });
    });
};

export const restoreDatabase = (req, res) => {
    const { timestamp, filename, databaseName } = req.body;

    if (!timestamp || !filename || !databaseName) {
        return res.status(400).json({ message: 'All inputs are required: timestamp, filename, and database name.' });
    }

    const timestampRegex = /^\d{4}-\d{2}-\d{2}_[0-1]?[0-9]-[0-5]?[0-9]-[0-5]?[0-9]-[AP]{1}[M]{1}$/;
    if (!timestamp.match(timestampRegex)) {
        return res.status(400).json({ message: 'Invalid timestamp format. Use YYYY-MM-DD_HH-MM-SS-AM/PM.' });
    }

    const filePath = path.join(backupDir, timestamp, databaseName, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(400).json({ message: `Backup file not found at ${filePath}. Ensure the file exists.` });
    }

    const collectionName = path.basename(filename, '.bson');
    const command = `mongorestore --uri="${mongoURL}" --nsInclude=${databaseName}.${collectionName} "${filePath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Restore failed:', stderr);
            return res.status(500).json({ message: `Restore failed. Error: ${stderr}` });
        }
        res.json({ message: `Collection '${collectionName}' restored successfully into database '${databaseName}' from ${filePath}` });
    });
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
                const pageName = message.metadata.pageName;

                // Emit event via socket.io
                const io = req.app.get("io");
                if (io) {
                    io.emit("requestStatusUpdate", {
                        userId,
                        status,
                        messageId: message._id,
                        respondedBy: responderUsername,
                        pageName
                    });
                    console.log(`Sent real-time notification to ${userId}`);
                }
            } catch (error) {
                console.error("Error granting access:", error);
                return res.status(500).json({ success: false, error: "Failed to grant access" });
            }
        }

        res.json({ success: true, message: `Request ${status}`, data: message });
    } catch (error) {
        console.error("Error updating message:", error);
        res.status(500).json({ success: false, error: "Failed to update request status" });
    }
};
