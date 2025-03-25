import User from "../model/User.js";
import axios from 'axios';



export const getUsersByDepartment = async (req, res) => {
    try {
        const { department } = req.params;
        const validDepartments = ["HR", "Core", "Logistics", "Finance"];

        if (!validDepartments.includes(department)) {
            return res.status(400).json({ message: "Invalid department" });
        }

        // Fetch users from the specified department
        const users = await User.find({ department });

        if (users.length === 0) {
            return res.status(404).json({ message: `No users found in the ${department} department` });
        }

        // Check if WEBHOOK_URL is defined
        const webhookUrl = process.env.WEBHOOK_URL;
        if (!webhookUrl) {
            console.error("WEBHOOK_URL is missing in .env file!");
            return res.status(500).json({ message: "Webhook URL is not configured" });
        }

        // Send a webhook after retrieving the users
        const webhookPayload = {
            eventType: 'user_fetched',
            department,
            data: users,
        };

        console.log("Sending webhook to:", webhookUrl);
        console.log("Webhook Payload:", webhookPayload);

        try {
            await axios.post(webhookUrl, webhookPayload, {
                headers: {
                    'x-event-type': 'user_fetched',
                    'Content-Type': 'application/json',
                }
            });
            console.log("Webhook sent successfully.");
        } catch (webhookError) {
            console.error("Failed to send webhook:", webhookError.response?.data || webhookError.message);
        }

        res.status(200).json(users);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};