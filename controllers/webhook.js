import axios from 'axios'
import { verifyAccess } from "../middleware/verifySignature.js";
import User from '../model/user.js';
import dotenv from 'dotenv';
dotenv.config();



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

