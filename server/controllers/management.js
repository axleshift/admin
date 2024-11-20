import User from '../model/User.js'

export const sendToLogistics = async (req, res) => {
    try {
      const { username, email, department, oauthToken } = req.body;
  
      if (!username || !email || !oauthToken) {
        return res.status(400).json({ message: 'Invalid data provided.' });
      }
  
      if (department !== 'Logistics') {
        return res.status(400).json({ message: 'Invalid department.' });
      }
  
      // Simulate logistics processing
      console.log('Logistics data:', req.body);
  
      res.status(200).json({ message: 'Data sent to Logistics successfully!' });
    } catch (error) {
      console.error('Error sending to Logistics:', error);
      res.status(500).json({ message: 'Failed to send data to Logistics.' });
    }
  };
export const sendToHR = async (req, res) => {
    try {
      const { username, email, department, oauthToken } = req.body;
  
      if (!username || !email || !oauthToken) {
        return res.status(400).json({ message: 'Invalid data provided.' });
      }
  
      if (department !== 'HR') {
        return res.status(400).json({ message: 'Invalid department.' });
      }
  
      // Simulate HR processing
      console.log('hr data:', req.body);
  
      res.status(200).json({ message: 'Data sent to hr successfully!' });
    } catch (error) {
      console.error('Error sending to hr:', error);
      res.status(500).json({ message: 'Failed to send data to hr.' });
    }
  };

  export const sendTocore = async (req, res) => {
    try {
      const { username, email, department, oauthToken } = req.body;
  
      if (!username || !email || !oauthToken) {
        return res.status(400).json({ message: 'Invalid data provided.' });
      }
  
      if (department !== 'CORE') {
        return res.status(400).json({ message: 'Invalid department.' });
      }
  
      // Simulate Core processing
      console.log('core data:', req.body);
  
      res.status(200).json({ message: 'Data sent to core successfully!' });
    } catch (error) {
      console.error('Error sending to core:', error);
      res.status(500).json({ message: 'Failed to send data to core.' });
    }
  };

  export const sendTofinance = async (req, res) => {
    try {
      const { username, email, department, oauthToken } = req.body;
  
      if (!username || !email || !oauthToken) {
        return res.status(400).json({ message: 'Invalid data provided.' });
      }
  
      if (department !== 'FINANCE') {
        return res.status(400).json({ message: 'Invalid department.' });
      }
  
      // Simulate Finance processing
      console.log('finance data:', req.body);
  
      res.status(200).json({ message: 'Data sent to finance successfully!' });
    } catch (error) {
      console.error('Error sending to finance:', error);
      res.status(500).json({ message: 'Failed to send data to finance.' });
    }
  };
  
  