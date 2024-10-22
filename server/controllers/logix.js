import Logistics from "../model/logix.js";
import nodemailer from 'nodemailer';


// Get all logistics data
export const getLogistics = async (req, res) => {
    try {
        const logistics = await Logistics.find();
        res.status(200).json(logistics);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Get specific logistics by ID
export const getLogisticsById = async (req, res) => {
    const { id } = req.params;
    try {
        const logistics = await Logistics.findById(id);
        if (!logistics) {
            return res.status(404).json({ message: "Logistics not found" });
        }
        res.status(200).json(logistics);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Get logistics by tracking number
export const getLogisticsByTrackingNum = async (req, res) => {
    const { trackingNumber } = req.body; // Expecting trackingNumber from the body
    try {
        const logistics = await Logistics.findOne({ trackingNumber });
        if (!logistics) {
            return res.status(404).json({ message: "Logistics not found" });
        }
        res.status(200).json(logistics);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Delete logistics by ID
export const deleteLogistics = async (req, res) => {
    const { id } = req.params;

    try {
        await Logistics.findByIdAndRemove(id);
        res.status(200).json({ message: "Logistics deleted successfully" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Update logistics
export const updateLogistics = async (req, res) => {
    const { id } = req.params;
    const { currentLocation } = req.body;

    try {
        const updatedLogistics = await Logistics.findByIdAndUpdate(
            id,
            { currentLocation },
            { new: true }
        );

        if (!updatedLogistics) {
            return res.status(404).json({ message: "Logistics not found" });
        }

        res.status(200).json(updatedLogistics);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



export const sendLogisticsEmail = async (req, res) => {
    const { email, currentLocation } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "ryansangasina1@gmail.com",
                pass: "dytd rorh jqdv wynb",
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Tracking Update",
            html: `
                <div style="font-family: Arial, sans-serif; font-size: 16px;">
                    <h2 style="font-size: 20px;">Cargo Tracking Update</h2>
                    <p>Your cargo's current location is:</p>
                    <p style="font-size: 18px; color: blue;">${currentLocation}</p>
                    <p>Thank you for using our service!</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${email}`); // Log successful email sending
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};