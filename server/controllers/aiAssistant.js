import openai from 'openai';
import ActivityTracker from '../model/Activitytracker.js';
import User from '../model/User.js';
// Set the API key
openai.apiKey = process.env.OPENAI_API_KEY;

// AI Assistant for User Management
export const aiAssistant = async (req, res) => {
  const { prompt } = req.body;

  try {
    // Handle specific commands
    if (prompt.toLowerCase().includes('show users with access')) {
      const module = prompt.split('access to')[1]?.trim();
      const users = await User.find({ modules: module }); // Assuming `modules` field exists
      return res.status(200).json({ response: `Users with access to ${module}: ${users.map(user => user.name).join(', ')}` });
    }

    if (prompt.toLowerCase().includes('inactive users')) {
      const inactiveUsers = await User.find({ lastLogin: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } });
      return res.status(200).json({ response: `Inactive users: ${inactiveUsers.map(user => user.name).join(', ')}` });
    }

    if (prompt.toLowerCase().includes('assign role')) {
      const [userName, role] = prompt.split('assign role to')[1]?.trim().split(' as ');
      const user = await User.findOne({ name: userName });
      if (!user) return res.status(404).json({ response: `User ${userName} not found.` });

      user.role = role;
      await user.save();
      return res.status(200).json({ response: `Assigned role '${role}' to user '${userName}'.` });
    }

    // Default AI response
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    res.status(200).json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error('Error with AI assistant:', error.message);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
};

// Analyze User Activity Logs
export const analyzeActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityTracker.find().sort({ timestamp: -1 }).limit(100);

    const analysisPrompt = `Analyze the following user activity logs and identify unusual patterns or risks:\n\n${JSON.stringify(logs)}`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: analysisPrompt }],
    });

    res.status(200).json({ analysis: response.choices[0].message.content });
  } catch (error) {
    console.error('Error analyzing activity logs:', error.message);
    res.status(500).json({ error: 'Failed to analyze activity logs' });
  }
};



// AI-Powered Password Analysis
export const analyzePasswordWithAI = async (password) => {
  try {
    const prompt = `
      Analyze the following password for strength and provide feedback:
      Password: "${password}"
      Feedback should include:
      - Strength level (Weak, Moderate, Strong, Very Strong)
      - Suggestions for improvement if the password is weak or moderate.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const feedback = response.choices[0].message.content;
    return feedback;
  } catch (error) {
    console.error('Error analyzing password with AI:', error.message);
    return 'Failed to analyze password with AI.';
  }
};
