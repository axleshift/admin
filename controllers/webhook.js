import express from 'express';
import User from '../model/User.js'
import axios from 'axios'
import { verifyAccess } from "../middleware/verifySignature.js";
export const web = async (req, res) => {
    try {
        const eventType = req.headers['x-event-type'];
        const userType = req.headers['x-user-type'];
        const data = req.body;

        console.log(`✅ Received Event Type: ${eventType}`);
        console.log(`📌 User Type: ${userType}`);
        console.log('📋 Data Received:', data);

        switch (eventType) {
          case 'user_created':
            console.log('📥 New user data received. Processing...');
            break;
          case 'user_updated':
            console.log('🔄 User data updated. Processing...');
            break;
          case 'payroll_updated':
            console.log('💵 Payroll data received. Processing...');
            break;
          case 'invoice_generated':
            console.log('📄 New invoice received. Processing...');
            break;
          case 'request_submitted':
            console.log('📝 New request received. Processing...');
            break;
          default:
            console.log('❓ Unknown event type received. No action taken.');
        }

        res.status(200).send('Webhook received and processed successfully.');
    } catch (error) {
        console.error('❌ Error processing webhook:', error.message);
        res.status(500).send('Webhook processing failed.');
    }
};



export const fetch = async (req, res) => {
  try {
      const { userId } = req.body;

      if (!userId) {
          return res.status(400).json({ error: 'User ID is required.' });
      }

      const user = await User.findById(userId).select('-password -refreshToken');

      if (!user) {
          return res.status(404).json({ error: 'User not found.' });
      }

      if (!user.department || typeof user.department !== 'string') {
          return res.status(403).json({ error: 'User department is not defined or is invalid.' });
      }

      const systemUrl = verifyAccess(user.department.trim()); // Ensure department is a trimmed string

      const externalResponse = await axios.get(`${systemUrl}/user-data`, { params: { userId } });

      res.status(200).json({ user, externalData: externalResponse.data });
  } catch (error) {
      console.error('Error fetching user data:', error.message);
      res.status(500).json({ error: 'Internal server error.' });
  }
};


export const fetchByDepartment = async (req, res) => {
  try {
      const { department } = req.body;

      if (!department) {
          return res.status(400).json({ error: 'Department is required.' });
      }

      // Find users by department, excluding sensitive fields
      const users = await User.find({ department }).select('-password -refreshToken');

      if (!users || users.length === 0) {
          return res.status(404).json({ error: 'No users found for the specified department.' });
      }

      res.status(200).json({ users });
  } catch (error) {
      console.error('Error fetching users by department:', error.message);
      res.status(500).json({ error: 'Internal server error.' });
  }
};
