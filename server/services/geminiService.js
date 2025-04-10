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

// Helper function to create a default response
const createDefaultResponse = (message) => {
  return {
    fullAnalysis: message,
    category: 'General activity',
    patterns: 'No unusual patterns detected',
    riskLevel: 'MEDIUM'  // Changed from UNKNOWN to MEDIUM
  };
};

// Make sure to export the function with the exact name that's being imported
export const analyzeActivityWithAI = async (activityData, model = DEFAULT_MODEL) => {
  try {
    // Direct retrieval of API key (more reliable than relying on dotenv alone)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyA3hQsrM4vH-80RUQU-ZJWX7v3QLRhAzA0';
    
    // Define API URL inside the function so it has access to the model parameter
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    
    // Enhanced debugging - create a safe version of the key for logging
    const keyFirstChars = GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 5) : 'null';
    const keyLength = GEMINI_API_KEY ? GEMINI_API_KEY.length : 0;
    console.log(`API Key check: First chars: ${keyFirstChars}..., Length: ${keyLength}`);
    console.log(`Using model: ${model}`);
    
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      console.error('AI analysis error: Missing API key');
      console.error('Available env vars:', Object.keys(process.env).filter(key => !key.includes('SECRET')));
      return createDefaultResponse('AI analysis unavailable - API key not configured');
    }
    
    const { name, role, department, route, action, description } = activityData;
    
    // Validate that all required fields are present
    if (!name || !role || !department || !route || !action || !description) {
      console.error('AI analysis error: Missing required fields');
      return createDefaultResponse('AI analysis unavailable - missing required fields');
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
      3. Risk assessment: LOW, MEDIUM, or HIGH based on the activity context, user role, and action
      
      Format your response as JSON:
      {
        "fullAnalysis": "detailed explanation of your overall analysis",
        "category": "brief category name",
        "patterns": "description of any unusual patterns or 'No unusual patterns detected'",
        "riskLevel": "LOW", "MEDIUM", or "HIGH"
      }
    `;
    
    // Log the request for debugging
    console.log(`Sending request to Gemini API with key: ${keyFirstChars}...`);
    
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
        throw new Error(`Failed to parse AI response JSON: ${nestedParseError.message}`);
      }
    }
    
    // Validate the parsed response has the required fields
    if (!parsedResponse.fullAnalysis || !parsedResponse.category || 
        !parsedResponse.patterns || !parsedResponse.riskLevel) {
      throw new Error('Incomplete analysis data from AI');
    }
    
    // Force riskLevel to be one of the accepted values
    parsedResponse.riskLevel = parsedResponse.riskLevel.toUpperCase();
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(parsedResponse.riskLevel)) {
      parsedResponse.riskLevel = 'MEDIUM'; // Default to MEDIUM if invalid
    }
    
    console.log('Successfully received and parsed AI response');
    return parsedResponse;
  } catch (error) {
    // Enhanced error logging with more details
    if (error.response) {
      console.error('AI analysis error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else {
      console.error('AI analysis error:', error.message);
    }
    return createDefaultResponse(`AI analysis error: ${error.message || 'Unknown error'}`);
  }
};

// Export any other functions needed for the geminiService
export const analyzePasswordWithAI = async (password, model = DEFAULT_MODEL) => {
  try {
    // Perform basic validation before sending to API
    if (!password || password.length < 4) {
      return createDefaultPasswordAnalysis(password);
    }
    
    // Direct retrieval of API key
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
    
    // Define API URL inside the function
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      console.error('Password analysis: Missing API key');
      return createDefaultPasswordAnalysis(password);
    }
    
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
      return createDefaultPasswordAnalysis(password);
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
        return createDefaultPasswordAnalysis(password);
      }
      
      try {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (nestedParseError) {
        return createDefaultPasswordAnalysis(password);
      }
    }
    
    // Validate the parsed response has the required fields
    if (!parsedResponse.score || !parsedResponse.strength || 
        !Array.isArray(parsedResponse.feedback) || !parsedResponse.explanation) {
      return createDefaultPasswordAnalysis(password);
    }
    
    // Ensure score is a number between 0-100
    parsedResponse.score = parseInt(parsedResponse.score);
    if (isNaN(parsedResponse.score) || parsedResponse.score < 0 || parsedResponse.score > 100) {
      parsedResponse.score = 50; // Default to middle if invalid
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('Password analysis error:', error.message || 'Unknown error');
    return createDefaultPasswordAnalysis(password);
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
    isDefaultAnalysis: true
  };
};