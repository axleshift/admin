import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const DEFAULT_MODEL = 'gemini-1.5-pro-latest';

// Enhanced environment loading
const loadEnvironment = () => {
  // Try loading from different possible .env locations
  const envPaths = ['.env', '../.env', '../../.env'];
  
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      console.log(`Loading environment from ${envPath}`);
      dotenv.config({ path: envPath });
      break;
    }
  }
  
  // Always call the default config as fallback
  dotenv.config();
};

// Load environment variables
loadEnvironment();

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';
// Check if we should force local analysis (bypass API) regardless of environment
const forceLocalAnalysis = process.env.FORCE_LOCAL_ANALYSIS === 'true';

if (isProduction) {
  console.log('🔒 Running in PRODUCTION mode - Using local analysis by default');
}

if (forceLocalAnalysis) {
  console.log('🔒 FORCE_LOCAL_ANALYSIS is enabled - All AI API calls will be bypassed');
}

// Helper function to create a default response
const createDefaultResponse = (message) => {
  return {
    fullAnalysis: message,
    category: 'General activity',
    patterns: 'No unusual patterns detected',
    riskLevel: 'MEDIUM'  // Changed from UNKNOWN to MEDIUM
  };
};

const API_KEYS = [
  process.env.GEMINI_API_KEY1,
  process.env.GEMINI_API_KEY2,
  process.env.GEMINI_API_KEY3,
  process.env.GEMINI_API_KEY4, 
  process.env.GEMINI_API_KEY5, 
  process.env.GEMINI_API_KEY6, 
];

// Create a key status tracking object
const apiKeyStatus = API_KEYS.map((key, index) => ({
  key: key ? key.substring(0, 5) + '...' : 'undefined',
  index,
  quotaExceeded: false,
  lastUsed: null
}));

// Add this function to visualize API key status
const logApiKeyStatus = () => {
  console.log('\n=== API Key Status ===');
  apiKeyStatus.forEach(key => {
    const status = key.quotaExceeded ? 
      'QUOTA EXCEEDED' : 
      'AVAILABLE';
    const lastUsed = key.lastUsed ? 
      `Last used: ${key.lastUsed.toLocaleTimeString()}` : 
      'Not used yet';
    console.log(`Key ${key.index + 1} (${key.key}): ${status} - ${lastUsed}`);
  });
  console.log('=====================\n');
};

let currentKeyIndex = 0;

// Function to perform local activity analysis without using the API
const performLocalActivityAnalysis = (activityData) => {
  const { role, action, route } = activityData;
  
  // Simple rule-based analysis logic
  let riskLevel = 'MEDIUM';
  let category = 'General Activity';
  
  // Determine category based on route
  if (route.includes('/admin')) {
    category = 'Admin Access';
  } else if (route.includes('/user')) {
    category = 'User Management';
  } else if (route.includes('/data') || route.includes('/report')) {
    category = 'Data Access';
  } else if (route.includes('/settings')) {
    category = 'System Configuration';
  }
  
  // Determine risk level based on role and action
  if (role === 'Admin' || role === 'Administrator') {
    // Admin actions are generally lower risk unless destructive
    if (action === 'DELETE' || action === 'MODIFY') {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }
  } else if (role === 'Guest' || role === 'Anonymous') {
    // Guest actions are generally higher risk
    if (action === 'VIEW' || action === 'READ') {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'HIGH';
    }
  } else {
    // Regular users
    if (action === 'DELETE') {
      riskLevel = 'HIGH';
    } else if (action === 'MODIFY' || action === 'UPDATE') {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }
  }
  
  // Special high-risk cases
  if (route.includes('/admin') && role !== 'Admin' && role !== 'Administrator') {
    riskLevel = 'HIGH';
  }
  
  return {
    fullAnalysis: `Local analysis performed for ${role} performing ${action} on ${route}. Risk assessed as ${riskLevel}.`,
    category,
    patterns: 'Analysis performed locally without AI assistance',
    riskLevel,
    isLocalAnalysis: true
  };
};

export const analyzeActivityWithAI = async (activityData, model = DEFAULT_MODEL, forceLocal = false) => {
  try {
    const { name, role, department, route, action, description } = activityData;

    // Validate that all required fields are present
    if (!name || !role || !department || !route || !action || !description) {
      console.error('AI analysis error: Missing required fields');
      return createDefaultResponse('AI analysis unavailable - missing required fields');
    }
    
    // Skip API calls if we're in production, forcing local analysis, or if the override parameter is true
    if (isProduction || forceLocalAnalysis || forceLocal) {
      console.log('🔒 Using local activity analysis (API bypassed)');
      return performLocalActivityAnalysis(activityData);
    }

    // Create a structured prompt for the AI to analyze
    const prompt = `
    You are a security and user behavior analysis expert. Analyze this user activity:
  
    User: ${name}
    Role: ${role}
    Department: ${department}
    Route: ${route}
    Action: ${action}
    Description: ${description}
  
    Provide detailed analysis about:
    1. Categorization of this activity (e.g., Data Access, User Management, System Configuration)
    2. Any unusual patterns or behaviors
    3. Risk assessment: LOW, MEDIUM, or HIGH based on:
       - User role and permissions (e.g., "Guest" performing "DELETE" is HIGH risk)
       - Sensitivity of the route or action (e.g., accessing "/admin/settings" is HIGH risk)
       - Unusual patterns or behaviors (e.g., repeated failed login attempts)
  
    Examples:
    - A "Guest" user attempting to "DELETE" sensitive data is HIGH risk.
    - An "Admin" user viewing a dashboard is LOW risk.
    - A "Manager" updating user permissions is MEDIUM risk.
  
    Format your response as JSON:
    {
      "fullAnalysis": "detailed explanation of your overall analysis",
      "category": "brief category name",
      "patterns": "description of any unusual patterns or 'No unusual patterns detected'",
      "riskLevel": "LOW", "MEDIUM", or "HIGH"
    }
  `;
    while (currentKeyIndex < API_KEYS.length) {
      const GEMINI_API_KEY = API_KEYS[currentKeyIndex];
      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

      // Update last used timestamp
      apiKeyStatus[currentKeyIndex].lastUsed = new Date();
      
      console.log(`Using API Key ${currentKeyIndex + 1}: ${GEMINI_API_KEY?.substring(0, 5)}...`);

      try {
        // Skip the API call if the key is undefined or empty
        if (!GEMINI_API_KEY) {
          throw new Error('API key is undefined or empty');
        }
        
        const response = await axios.post(
          `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 800
            }
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 15000 // 15 seconds timeout
          }
        );

        // Extract and parse the JSON response from the AI
        const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          throw new Error('Empty or invalid response from AI API');
        }

        let parsedResponse;
        try {
          parsedResponse = JSON.parse(rawText);
        } catch (parseError) {
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('No valid JSON found in AI response');
          }
          parsedResponse = JSON.parse(jsonMatch[0]);
        }

        if (!parsedResponse.fullAnalysis || !parsedResponse.category || 
            !parsedResponse.patterns || !parsedResponse.riskLevel) {
          throw new Error('Incomplete analysis data from AI');
        }

        parsedResponse.riskLevel = parsedResponse.riskLevel.toUpperCase();
        if (!['LOW', 'MEDIUM', 'HIGH'].includes(parsedResponse.riskLevel)) {
          parsedResponse.riskLevel = 'MEDIUM';
        }

        console.log('Successfully received and parsed AI response');
        return parsedResponse;

      } catch (error) {
        if (error.response && error.response.status === 429) {
          console.warn(`⚠️ QUOTA EXCEEDED for API Key ${currentKeyIndex + 1}`);
          // Mark this key as exceeded
          apiKeyStatus[currentKeyIndex].quotaExceeded = true;
          currentKeyIndex++;
          // Log the updated status of all keys
          logApiKeyStatus();
        } else {
          console.error('AI analysis error:', error.message);
          // If we encounter a non-quota error, fall back to local analysis
          console.log('Falling back to local activity analysis');
          return performLocalActivityAnalysis(activityData);
        }
      }
    }

    console.error('❌ ALERT: All API keys have exceeded their quotas!');
    logApiKeyStatus();
    console.log('Falling back to local activity analysis');
    return performLocalActivityAnalysis(activityData);
  } catch (error) {
    console.error('Unexpected error:', error.message);
    console.log('Falling back to local activity analysis due to unexpected error');
    return performLocalActivityAnalysis(activityData);
  }
};

// Function to perform local password analysis without using the API
const performLocalPasswordAnalysis = (password) => {
  return createDefaultPasswordAnalysis(password);
};

// Export any other functions needed for the geminiService
export const analyzePasswordWithAI = async (password, model = DEFAULT_MODEL, forceLocal = false) => {
  try {
    // Perform basic validation before sending to API
    if (!password || password.length < 4) {
      return createDefaultPasswordAnalysis(password);
    }
    
    // Skip API calls if we're in production, forcing local analysis, or if the override parameter is true
    if (isProduction || forceLocalAnalysis || forceLocal) {
      console.log('🔒 Using local password analysis (API bypassed)');
      return performLocalPasswordAnalysis(password);
    }
    
    // Use the API key rotation system for password analysis as well
    while (currentKeyIndex < API_KEYS.length) {
      const GEMINI_API_KEY = API_KEYS[currentKeyIndex];
      
      // Update last used timestamp
      apiKeyStatus[currentKeyIndex].lastUsed = new Date();
      
      // Define API URL inside the function
      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      
      // Check if API key is available
      if (!GEMINI_API_KEY) {
        console.error('Password analysis: Missing API key');
        currentKeyIndex++;
        continue;
      }
      
      console.log(`Password analysis using API Key ${currentKeyIndex + 1}: ${GEMINI_API_KEY.substring(0, 5)}...`);
      
      // Create a structured prompt for the AI to analyze
      const prompt = `
        You are a password security expert. Analyze this password (shown between triple quotes) to determine its strength:
        
        """${password}"""
        
        Provide:
        1. A numeric score from 0-100 (with 100 being strongest)
        2. A categorical strength assessment (Very Weak, Weak, Moderate, Strong, Very Strong)
        3. Specific feedback on how to improve this password
        4. A brief explanation of your assessment
        
        Format your response as JSON:
        {
          "score": number between 0-100,
          "strength": "categorical assessment",
          "feedback": ["suggestion1", "suggestion2", ...],
          "explanation": "brief explanation of assessment"
        }
      `;
      
      try {
        const response = await axios.post(
          `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 800
            }
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 5000 // 5 seconds timeout - shorter for better UX
          }
        );
        
        // Extract and parse the JSON response from the AI
        const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!rawText) {
          throw new Error('Empty response from AI API');
        }
        
        // Improved JSON extraction - handle potential text before/after JSON
        let parsedResponse;
        try {
          // First try to parse the entire response as JSON
          parsedResponse = JSON.parse(rawText);
        } catch (parseError) {
          // If that fails, try to extract JSON from the text
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('No valid JSON found in AI response');
          }
          
          try {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } catch (nestedParseError) {
            throw new Error('Failed to parse JSON from AI response');
          }
        }
        
        // Validate the parsed response has the required fields
        if (!parsedResponse.score || !parsedResponse.strength || 
            !Array.isArray(parsedResponse.feedback) || !parsedResponse.explanation) {
          throw new Error('Incomplete analysis data from AI');
        }
        
        // Ensure score is a number between 0-100
        parsedResponse.score = parseInt(parsedResponse.score);
        if (isNaN(parsedResponse.score) || parsedResponse.score < 0 || parsedResponse.score > 100) {
          parsedResponse.score = 50; // Default to middle if invalid
        }
        
        console.log('Successfully received and parsed password analysis');
        return parsedResponse;
        
      } catch (error) {
        if (error.response && error.response.status === 429) {
          console.warn(`⚠️ QUOTA EXCEEDED for API Key ${currentKeyIndex + 1} during password analysis`);
          // Mark this key as exceeded
          apiKeyStatus[currentKeyIndex].quotaExceeded = true;
          currentKeyIndex++;
          // Log the updated status of all keys
          logApiKeyStatus();
        } else {
          console.error('Password analysis error:', error.message);
          return performLocalPasswordAnalysis(password);
        }
      }
    }
    
    // If we've exhausted all keys
    console.error('❌ ALERT: All API keys have exceeded their quotas during password analysis!');
    logApiKeyStatus();
    return performLocalPasswordAnalysis(password);
  } catch (error) {
    console.error('Unexpected password analysis error:', error.message || 'Unknown error');
    return performLocalPasswordAnalysis(password);
  }
};

// Helper function to create a default password analysis
const createDefaultPasswordAnalysis = (password) => {
  // Basic strength calculation
  let score = 0;
  let strength = 'Very Weak';
  let feedback = [];
  
  // Length check
  if (password.length >= 8) {
    score += 20;
    feedback.push('Password length is acceptable.');
  } else {
    feedback.push('Password should be at least 8 characters long.');
  }
  
  // Character diversity checks
  if (/[A-Z]/.test(password)) score += 10;
  else feedback.push('Add uppercase letters to strengthen your password.');
  
  if (/[a-z]/.test(password)) score += 10;
  else feedback.push('Add lowercase letters to strengthen your password.');
  
  if (/[0-9]/.test(password)) score += 10;
  else feedback.push('Add numbers to strengthen your password.');
  
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;
  else feedback.push('Add special characters to strengthen your password.');
  
  // Determine strength based on score
  if (score >= 50) strength = 'Strong';
  else if (score >= 30) strength = 'Moderate';
  else if (score >= 20) strength = 'Weak';
  
  return {
    score,
    strength,
    feedback,
    explanation: 'This is a basic analysis generated locally. AI analysis was unavailable.',
    isLocalAnalysis: true
  };
};

// Export a function to get the current API key status
export const getApiKeyStatus = () => {
  return {
    totalKeys: API_KEYS.length,
    availableKeys: API_KEYS.length - apiKeyStatus.filter(key => key.quotaExceeded).length,
    keyStatus: apiKeyStatus,
    currentKeyIndex,
    isProduction,
    forceLocalAnalysis
  };
};

// Reset a specific API key's quota exceeded status (useful if keys reset after time period)
export const resetApiKeyQuota = (keyIndex) => {
  if (keyIndex >= 0 && keyIndex < apiKeyStatus.length) {
    apiKeyStatus[keyIndex].quotaExceeded = false;
    console.log(`Reset quota status for API Key ${keyIndex + 1}`);
    logApiKeyStatus();
    return true;
  }
  return false;
};

// Reset all API keys' quota exceeded status
export const resetAllApiKeyQuotas = () => {
  apiKeyStatus.forEach(key => {
    key.quotaExceeded = false;
  });
  currentKeyIndex = 0;
  console.log('Reset quota status for all API keys');
  logApiKeyStatus();
  return true;
};

// Toggle force local analysis mode - allows you to switch modes at runtime
export const setForceLocalAnalysis = (force) => {
  const oldValue = forceLocalAnalysis;
  // Update the forceLocalAnalysis value with the environment variable or the passed value
  // Only update if the passed value is a boolean or the strings 'true'/'false'
  if (typeof force === 'boolean' || force === 'true' || force === 'false') {
    process.env.FORCE_LOCAL_ANALYSIS = String(force);
    if (force === 'true' || force === true) {
      console.log('🔒 Enabled force local analysis mode - All AI API calls will be bypassed');
    } else {
      console.log('🔓 Disabled force local analysis mode - AI API calls will be allowed (subject to environment)');
    }
    return { previous: oldValue, current: force === 'true' || force === true };
  }
  return { previous: oldValue, current: oldValue, unchanged: true };
};