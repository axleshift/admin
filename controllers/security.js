import LoginAttempt from "../model/LoginAttempt.js";
import SecurityAlert from "../model/SecurityAlert.js";
import Anomaly from "../model/Anomaly.js";
//{* Registere possible with ai*}
import Joi from "joi";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

export const getAllAnomalies = async (req, res) => {
    try {
        const anomalies = await Anomaly.find().populate("userId", "name email").sort({ timestamp: -1 });
        return res.json(anomalies);
    } catch (error) {
        console.error("Error fetching anomalies:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
export const getAllSecurityAlerts = async (req, res) => {
    try {
        const { userId, alertType, status } = req.query; // Optional filters

        // Build dynamic filter object
        const filter = {};
        if (userId) filter.userId = userId;
        if (alertType) filter.alertType = alertType;
        if (status) filter.status = status;

        // Fetch security alerts with filters, sorted by latest
        const securityAlerts = await SecurityAlert.find(filter)
            .populate("userId", "name email") // Populate user details
            .populate("resolution.resolvedBy", "name email") // Populate resolver details
            .sort({ timestamp: -1 });

        return res.json(securityAlerts);
    } catch (error) {
        console.error("Error fetching security alerts:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
export const getAllLoginAttempts = async (req, res) => {
    try {
        const { userId, status, ipAddress } = req.query; // Optional filters

        // Create a filter object dynamically
        const filter = {};
        if (userId) filter.userId = userId;
        
        // Case-insensitive status filtering
        if (status) {
            // Use regex for case-insensitive matching
            filter.status = { 
                $regex: new RegExp(`^${status}$`, 'i') 
            };
        }
        
        if (ipAddress) filter.ipAddress = ipAddress;

        // Fetch login attempts with filters, sorted by latest
        const loginAttempts = await LoginAttempt.find(filter).sort({ timestamp: -1 });

        return res.json(loginAttempts);
    } catch (error) {
        console.error("Error fetching login attempts:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};



dotenv.config();

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Schema for security validation
const securityValidationSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().required(),
  department: Joi.string().required()
});

/**
 * Analyzes user data for security risks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Security analysis results
 */
export const analyzeUserSecurity = async (req, res) => {
  try {
    // Validate request body
    const { error } = securityValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        error: error.details[0].message
      });
    }

    const { firstName, lastName, email, password, role, department } = req.body;

    // Basic security checks
    const securityChecks = {
      passwordStrength: checkPasswordStrength(password),
      emailRisk: checkEmailRisk(email),
      rolePrivilegeLevel: getRolePrivilegeLevel(role, department)
    };

    // Use Gemini AI to analyze the security aspects
    const aiAnalysis = await performGeminiSecurityAnalysis({
      firstName,
      lastName,
      email,
      role,
      department,
      passwordStrength: securityChecks.passwordStrength.score
    });

    return res.status(200).json({
      success: true,
      securityAnalysis: {
        basicChecks: securityChecks,
        aiRecommendations: aiAnalysis
      }
    });
  } catch (error) {
    console.error("Security analysis error:", error);
    return res.status(500).json({
      success: false,
      message: "Error performing security analysis",
      error: error.message
    });
  }
};

/**
 * Analyzes user data for potential security risks using Gemini AI
 * @param {Object} userData - Sanitized user data for AI analysis
 * @returns {Object} AI security recommendations
 */
async function performGeminiSecurityAnalysis(userData) {
  try {
    // Don't send the password to the API
    const prompt = `
      Analyze the following user registration data for potential security risks:
      - Name: ${userData.firstName} ${userData.lastName}
      - Email: ${userData.email} 
      - Role: ${userData.role}
      - Department: ${userData.department}
      - Password Strength Score: ${userData.passwordStrength}/100
      
      Please provide:
      1. An overall risk assessment (low, medium, high)
      2. Specific security concerns if any
      3. Recommendations to improve security
    `;

    // Get the text generation model with the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Extract risk level from the response
    let riskLevel = "medium"; // Default
    if (aiResponse.toLowerCase().includes("low risk")) riskLevel = "low";
    if (aiResponse.toLowerCase().includes("high risk")) riskLevel = "high";

    return {
      analysis: aiResponse,
      riskLevel,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Gemini AI analysis error:", error);
    return {
      analysis: "Unable to perform AI analysis at this time.",
      riskLevel: "unknown",
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Checks password strength based on multiple criteria
 * @param {string} password - The password to check
 * @returns {Object} Password strength analysis
 */
function checkPasswordStrength(password) {
  // Calculate a score from 0-100
  let score = 0;
  let feedback = [];
  
  // Length check (0-25 points)
  if (password.length >= 12) {
    score += 25;
  } else if (password.length >= 10) {
    score += 20;
  } else if (password.length >= 8) {
    score += 10;
    feedback.push("Password could be longer (12+ characters recommended)");
  } else {
    feedback.push("Password is too short (minimum 8 characters required)");
  }
  
  // Character variety (0-25 points)
  if (/[a-z]/.test(password)) score += 5;
  else feedback.push("Missing lowercase letters");
  
  if (/[A-Z]/.test(password)) score += 5;
  else feedback.push("Missing uppercase letters");
  
  if (/[0-9]/.test(password)) score += 5;
  else feedback.push("Missing numbers");
  
  if (/[@$!%*?&#]/.test(password)) score += 10;
  else feedback.push("Missing special characters");
  
  // Complexity (0-25 points)
  if (/(.)\1\1/.test(password)) {
    feedback.push("Password contains repeated character sequences");
  } else {
    score += 10;
  }
  
  if (/123|abc|qwerty|password|admin|user/i.test(password)) {
    feedback.push("Password contains common patterns");
  } else {
    score += 15;
  }
  
  // Uniqueness (0-25 points)
  const uniqueChars = new Set(password.split('')).size;
  const uniqueRatio = uniqueChars / password.length;
  score += Math.round(uniqueRatio * 25);
  
  // Determine strength category
  let strength = "weak";
  if (score >= 80) strength = "strong";
  else if (score >= 60) strength = "good";
  else if (score >= 40) strength = "moderate";
  
  return {
    score,
    strength,
    feedback
  };
}

/**
 * Checks for potential risks in email addresses
 * @param {string} email - The email to check
 * @returns {Object} Email risk assessment
 */
function checkEmailRisk(email) {
  const riskFactors = [];
  
  // Check for disposable email domains
  const disposableDomains = ['temp-mail.org', 'guerrillamail.com', 'mailinator.com', 'tempmail.com'];
  const domain = email.split('@')[1];
  
  if (disposableDomains.some(d => domain?.includes(d))) {
    riskFactors.push("Potential disposable email domain detected");
  }
  
  // Check for unusual patterns
  if (email.includes('admin') || email.includes('system') || email.includes('security')) {
    riskFactors.push("Email contains sensitive system-related terms");
  }
  
  // Determine risk level
  let riskLevel = "low";
  if (riskFactors.length >= 2) riskLevel = "high";
  else if (riskFactors.length === 1) riskLevel = "medium";
  
  return {
    riskLevel,
    riskFactors
  };
}

/**
 * Assesses privilege level based on role and department
 * @param {string} role - User role
 * @param {string} department - User department
 * @returns {Object} Privilege assessment
 */
function getRolePrivilegeLevel(role, department) {
  const normalizedRole = role.toLowerCase();
  
  // Define high privilege roles
  const highPrivilegeRoles = ['admin', 'superadmin', 'manager'];
  
  // Define high sensitivity departments
  const sensitiveDepartments = ['finance', 'hr', 'administrative'];
  
  // Determine privilege level
  const isHighPrivilege = highPrivilegeRoles.some(r => normalizedRole.includes(r));
  const isInSensitiveDept = sensitiveDepartments.some(d => department.toLowerCase().includes(d));
  
  let privilegeLevel = "standard";
  if (isHighPrivilege && isInSensitiveDept) {
    privilegeLevel = "critical";
  } else if (isHighPrivilege || isInSensitiveDept) {
    privilegeLevel = "elevated";
  }
  
  return {
    privilegeLevel,
    requiresAdditionalVerification: privilegeLevel !== "standard"
  };
}

/**
 * Logs security events for auditing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const logSecurityEvent = async (req, res) => {
  try {
    const { userId, eventType, details } = req.body;
    
    // Here you would typically log to a database
    console.log(`SECURITY EVENT: ${eventType} for user ${userId}`, details);
    
    // In a real implementation, this would be saved to a security log collection
    
    return res.status(200).json({
      success: true,
      message: "Security event logged successfully"
    });
  } catch (error) {
    console.error("Security logging error:", error);
    return res.status(500).json({
      success: false,
      message: "Error logging security event",
      error: error.message
    });
  }
};