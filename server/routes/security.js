import express from "express";
import { 
    getAllLoginAttempts,
    getAllSecurityAlerts,
    getAllAnomalies,
    logSecurityEvent, 
    checkPasswordStrength, 
    checkPasswordBreach ,
} from "../controllers/security.js";
import User from '../model/User.js'


const router = express.Router();

// GET /api/login-attempts - Fetch all login attempts (with optional filters)
router.get("/login-attemp", getAllLoginAttempts);
router.get("/security-alert", getAllSecurityAlerts);
router.get("/anomalies", getAllAnomalies); 



// Route for logging security events
router.post('/log-security-event', logSecurityEvent);

router.get('/analyze-passwords', async (req, res) => {
    try {
        const users = await User.find();
        const results = [];

        for (const user of users) {
            // Since passwords are stored as hashes, we assume they were strong at hashing time
            // If you also store plain text passwords (not recommended), you can analyze them directly
            const strength = checkPasswordStrength(user.password);
            const breachResult = await checkPasswordBreach(user.password);

            results.push({
                username: user.username,
                email: user.email,
                strength: strength.score,
                strengthMessage: strength.message,
                isBreached: breachResult.isBreached,
                breachMessage: breachResult.message,
            });
        }

        return res.json(results);
    } catch (error) {
        return res.status(500).json({ message: 'Error analyzing passwords', error });
    }
});

export default router;
