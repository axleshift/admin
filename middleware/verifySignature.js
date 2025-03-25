import axios from 'axios'

export const verifySignature = (req, res, next) => {
    const secret = process.env.WEBHOOK_SECRET; 
    const signature = req.headers['x-webhook-signature'];

    console.log('Received Signature:', signature);  // Check if the signature is coming through
    console.log('Expected Secret:', secret);        // Check if the secret is correctly loaded

    if (!signature) {
        return res.status(403).json({ error: 'No signature provided.' });
    }

    if (signature !== secret) {
        return res.status(403).json({ error: 'Invalid signature.' });
    }

    next();
};

export const verifyAccess = (department) => {
    try {
        if (!department || typeof department !== 'string') {
            throw new Error('Invalid or missing department. Department must be a non-empty string.');
        }

        const departmentUrls = {
            hr: process.env.EXTERNALHr,
            logistics: process.env.EXTERNALLogistic,
            core: process.env.EXTERNALCore,
            finance: process.env.EXTERNALFinance
        };

        const systemUrl = departmentUrls[department.toLowerCase()];

        if (!systemUrl) {
            throw new Error('Access denied. You are not authorized to access this system.');
        }

        return systemUrl;
    } catch (error) {
        console.error('Error verifying access:', error.message);
        throw error;
    }
};
