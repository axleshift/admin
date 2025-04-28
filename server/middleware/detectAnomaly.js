// middleware/detectAnomaly.js
import LoginAttempt from '../model/LoginAttempt.js';
import User from '../model/User.js'

import Anomaly from '../model/Anomaly.js';
import { createSecurityAlert } from '../UTIL/securityUtils.js';

// Feature extraction and scoring functions
const extractFeatures = (currentLogin, historicalData) => {
  // Initialize feature vector
  const features = {
    timeOfDayAnomaly: 0,
    locationAnomaly: 0,
    deviceAnomaly: 0,
    behavioralAnomaly: 0,
    rapidLoginAttempts: 0
  };
  
  // Skip if no historical data
  if (!historicalData || historicalData.length === 0) {
    return features;
  }
  
  // Extract current login data
  const currentTime = new Date(currentLogin.timestamp || Date.now());
  const currentHour = currentTime.getHours();
  const currentIP = currentLogin.ipAddress;
  const currentUA = currentLogin.userAgent;
  
  // Time-based anomaly: Check if user typically logs in at this hour
  const hourCounts = {};
  historicalData.forEach(login => {
    const loginHour = new Date(login.timestamp).getHours();
    hourCounts[loginHour] = (hourCounts[loginHour] || 0) + 1;
  });
  
  const totalLogins = historicalData.length;
  const timeFrequency = (hourCounts[currentHour] || 0) / totalLogins;
  if (timeFrequency < 0.1) { // Less than 10% of logins at this hour
    features.timeOfDayAnomaly = 1 - timeFrequency;
  }
  
  // IP-based anomaly: Check if IP has been used before
  const knownIPs = new Set(historicalData.map(login => login.ipAddress));
  if (!knownIPs.has(currentIP)) {
    features.locationAnomaly = 1.0;
  } else {
    // How frequently this IP is used
    const ipFrequency = historicalData.filter(login => login.ipAddress === currentIP).length / totalLogins;
    features.locationAnomaly = 1 - ipFrequency;
  }
  
  // User-Agent/Device anomaly
  const knownUAs = new Set(historicalData.map(login => login.userAgent));
  if (!knownUAs.has(currentUA)) {
    features.deviceAnomaly = 1.0;
  } else {
    // How frequently this device is used
    const uaFrequency = historicalData.filter(login => login.userAgent === currentUA).length / totalLogins;
    features.deviceAnomaly = 1 - uaFrequency;
  }
  
  // Rapid login attempts
  const recentAttempts = historicalData.filter(login => {
    const attemptTime = new Date(login.timestamp);
    const timeDiff = currentTime - attemptTime;
    return timeDiff <= 5 * 60 * 1000; // Last 5 minutes
  });
  
  if (recentAttempts.length >= 3) {
    features.rapidLoginAttempts = Math.min(1.0, (recentAttempts.length - 2) / 8); // Scale from 0 to 1
  }
  
  // Behavioral anomaly (pattern of success/failure)
  const recentBehavior = historicalData.slice(0, 10).map(login => login.status === 'success' ? 1 : 0);
  const successRate = recentBehavior.reduce((sum, val) => sum + val, 0) / recentBehavior.length;
  
  // If recent success rate is low, could indicate brute force attempts
  if (successRate < 0.5 && recentBehavior.length >= 5) {
    features.behavioralAnomaly = 1 - successRate;
  }
  
  return features;
};

const scoreAnomaly = (features) => {
  // Weights for different features
  const weights = {
    timeOfDayAnomaly: 0.15,
    locationAnomaly: 0.3,
    deviceAnomaly: 0.25,
    behavioralAnomaly: 0.2,
    rapidLoginAttempts: 0.1
  };
  
  // Calculate weighted score
  let score = 0;
  for (const [feature, value] of Object.entries(features)) {
    score += value * weights[feature];
  }
  
  return score;
};

const classifyThreat = (score) => {
  if (score > 0.8) return { level: 'critical', action: 'block' };
  if (score > 0.6) return { level: 'high', action: 'challenge' };
  if (score > 0.4) return { level: 'medium', action: 'monitor' };
  if (score > 0.2) return { level: 'low', action: 'log' };
  return { level: 'normal', action: 'allow' };
};

const detectAnomaly = async (req, res, next) => {
  const { identifier } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  try {
    // First check if user exists (but don't reveal this info to client)
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });
    
    // If no user, still proceed but we'll just log without AI analysis
    if (!user) {
      req.anomalyData = {
        detected: false,
        score: 0,
        threat: { level: 'normal', action: 'allow' }
      };
      return next();
    }
    
    // Get historical login data
    const historicalLogins = await LoginAttempt.find({ 
      userId: user._id 
    })
    .sort({ timestamp: -1 })
    .limit(20);
    
    // Current login attempt data
    const currentLogin = {
      userId: user._id,
      ipAddress,
      userAgent,
      timestamp: new Date()
    };
    
    // Extract features and calculate anomaly score
    const features = extractFeatures(currentLogin, historicalLogins);
    const anomalyScore = scoreAnomaly(features);
    const threat = classifyThreat(anomalyScore);
    
    // Store the detection results in the request for later use
    req.anomalyData = {
      detected: anomalyScore > 0.2, // Low threshold for "detected"
      score: anomalyScore,
      features,
      threat
    };
    
    // Critical threats get special handling
    if (threat.level === 'critical') {
      // Log the anomaly
      const anomaly = new Anomaly({
        userId: user._id,
        ipAddress,
        userAgent,
        score: anomalyScore,
        features,
        threatLevel: threat.level,
        reason: 'AI detected critical security threat'
      });
      await anomaly.save();
      
      // Create security alert
      await createSecurityAlert(user._id, 'critical_login_anomaly', {
        ipAddress,
        userAgent,
        anomalyScore,
        features
      });
      
      // Block the login attempt for critical threats
      return res.status(403).json({
        message: "Login blocked due to security concerns. Please contact support."
      });
    }
    
    // For high threats, we could implement additional verification but for now just log
    if (threat.level === 'high') {
      const anomaly = new Anomaly({
        userId: user._id,
        ipAddress,
        userAgent,
        score: anomalyScore,
        features,
        threatLevel: threat.level,
        reason: 'AI detected high-risk login pattern'
      });
      await anomaly.save();
      
      // We'll pass through to the login handler, which can implement additional verification
    }
    
    // Proceed to the login handler
    next();
    
  } catch (error) {
    console.error("AI Anomaly Detection Error:", error);
    // Don't block login on detection errors, just log and proceed
    req.anomalyData = {
      error: error.message,
      detected: false
    };
    next();
  }
};


export default detectAnomaly;