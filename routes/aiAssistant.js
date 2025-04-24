import express from 'express';
import { aiAssistant, analyzeActivityLogs,analyzePasswordWithAI} from '../controllers/aiAssistant.js';

const router = express.Router();

router.post('/assistant', aiAssistant);
router.get('/analyze-logs', analyzeActivityLogs);



router.post('/analyze', async (req, res) => {
    const { password } = req.body;
    try {
      const feedback = await analyzePasswordWithAI(password);
      res.status(200).json({ feedback });
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze password.' });
    }
  });
export default router;