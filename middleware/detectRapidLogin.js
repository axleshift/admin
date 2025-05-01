// middleware/detectRapidLogin.js
import User from '../model/User.js'

import LoginAttempt from '../model/LoginAttempt.js';
import Anomaly from '../model/Anomaly.js';
import { createSecurityAlert } from '../UTIL/securityUtils.js';

/**
 * Middleware that specifically detects rapid login attempts
 * This will always store anomalies in MongoDB for rapid logins
 */
const detectRapidLogin = async (req, res, next) => {
  const { identifier } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  try {
    // Find user if exists
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });
    
    // If no user exists, we can't track their login patterns
    if (!user) {
      return next();
    }
    
    const userId = user._id;
    const currentTime = new Date();
    
    // Get recent login attempts in the last 5 minutes
    const timeWindow = 5 * 60 * 1000; // 5 minutes
    const cutoffTime = new Date(currentTime.getTime() - timeWindow);
    
    const recentAttempts = await LoginAttempt.find({
      userId: userId,
      timestamp: { $gte: cutoffTime }
    }).sort({ timestamp: -1 });
    
    console.log(`Found ${recentAttempts.length} recent login attempts in the last 5 minutes for user ${userId}`);
    
    // Define thresholds for rapid login detection
    const MEDIUM_THRESHOLD = 3;  // 3 attempts in 5 minutes = medium risk
    const HIGH_THRESHOLD = 5;    // 5 attempts in 5 minutes = high risk
    const CRITICAL_THRESHOLD = 8; // 8 attempts in 5 minutes = critical risk
    
    let threatLevel = 'normal';
    let reason = '';
    let score = 0;
    
    // Calculate score and determine threat level
    if (recentAttempts.length >= CRITICAL_THRESHOLD) {
      threatLevel = 'critical';
      reason = `${recentAttempts.length} login attempts in 5 minutes - possible brute force attack`;
      score = 0.9;
    } else if (recentAttempts.length >= HIGH_THRESHOLD) {
      threatLevel = 'high';
      reason = `${recentAttempts.length} login attempts in 5 minutes - suspicious activity`;
      score = 0.7;
    } else if (recentAttempts.length >= MEDIUM_THRESHOLD) {
      threatLevel = 'medium';
      reason = `${recentAttempts.length} login attempts in 5 minutes - unusual activity`;
      score = 0.5;
    } else {
      // Not enough attempts to be concerned
      return next();
    }
    
    // Calculate time between attempts to detect scripted attacks
    let minTimeBetweenAttempts = Number.MAX_VALUE;
    for (let i = 1; i < recentAttempts.length; i++) {
      const timeDiff = new Date(recentAttempts[i-1].timestamp) - new Date(recentAttempts[i].timestamp);
      minTimeBetweenAttempts = Math.min(minTimeBetweenAttempts, timeDiff);
    }
    
    // If attempts are too regular or too fast, increase threat level
    if (minTimeBetweenAttempts < 2000 && recentAttempts.length > 3) { // less than 2 seconds between attempts
      threatLevel = 'critical';
      reason += ' - Automated attack suspected (attempts too rapid)';
      score = 0.95;
    }
    
    // Create and store the anomaly record
    try {
      const anomaly = new Anomaly({
        userId: userId,
        ipAddress: ipAddress,
        userAgent: userAgent,
        score: score,
        features: {
          rapidLoginAttempts: score,
          timeOfDayAnomaly: 0,
          locationAnomaly: 0,
          deviceAnomaly: 0,
          behavioralAnomaly: 0
        },
        threatLevel: threatLevel,
        reason: reason,
        timestamp: currentTime
      });
      
      await anomaly.save();
      console.log("Rapid login anomaly saved successfully:", {
        userId: userId.toString(),
        threatLevel,
        score,
        reason
      });
      
      // Create security alert
      await createSecurityAlert(userId, 'rapid_login_detected', {
        ipAddress,
        userAgent,
        attemptCount: recentAttempts.length,
        timeWindow: '5 minutes',
        minTimeBetweenAttempts: `${minTimeBetweenAttempts}ms`
      });
      
      // Store data in request for login handler to use
      req.rapidLoginData = {
        detected: true,
        score,
        threatLevel,
        reason,
        attemptCount: recentAttempts.length
      };
      
      // If threat is critical, block login
      if (threatLevel === 'critical') {
        return res.status(403).json({
          message: "Login blocked due to too many rapid attempts. Please try again later or contact support.",
          cooldown: true,
          cooldownMinutes: 15
        });
      }
    } catch (error) {
      console.error("Error saving rapid login anomaly:", error);
    }
    
    // Continue to next middleware/handler
    next();
    
  } catch (error) {
    console.error("Error in rapid login detection:", error);
    // Don't block the login process on error
    next();
  }
};

export default detectRapidLogin;