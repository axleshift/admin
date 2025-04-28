import Complaint from "../../model/Complains.js";
import axios from "axios";

// Create complaint
export const createComplaint = async (req, res) => {
    try {
        const { userId, complaintText } = req.body;
        const complaint = new Complaint({ userId, complaintText });
        await complaint.save();
        res.status(201).json(complaint);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all complaints
export const getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find();
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Resolve complaint
export const resolveComplaintWithAI = async (req, res) => {
    const { complaintText, complaintId } = req.body;

    try {
        // Call OpenAI / Local AI Model
        const aiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful support agent resolving user complaints." },
                { role: "user", content: `Complaint: ${complaintText}` }
            ],
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        const aiGeneratedSolution = aiResponse.data.choices[0]?.message?.content || 'Resolution generated.';

        // Update the complaint
        const complaint = await Complaint.findByIdAndUpdate(complaintId, {
            status: 'Resolved',
            resolutionText: aiGeneratedSolution
        }, { new: true });

        res.json(complaint);

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ message: 'AI failed to resolve complaint.' });
    }
};