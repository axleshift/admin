// services/geminiService.js
import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const analyzeActivityWithAI = async (activityData) => {
  try {
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      console.error('AI analysis error: Missing API key');
      return {
        fullAnalysis: 'AI analysis unavailable - API key not configured',
        category: 'General activity',
        patterns: 'No unusual patterns detected',
        riskLevel: 'UNKNOWN'
      };
    }
    
    const { name, role, department, route, action, description } = activityData;
    
    // Validate that all required fields are present
    if (!name || !role || !department || !route || !action || !description) {
      console.error('AI analysis error: Missing required fields');
      return {
        fullAnalysis: 'AI analysis unavailable - missing required fields',
        category: 'General activity',
        patterns: 'No unusual patterns detected',
        riskLevel: 'UNKNOWN'
      };
    }
    
    // Create a structured prompt for Gemini to analyze
    const prompt = `
      Analyze this user activity:
      User: ${name}
      Role: ${role}
      Department: ${department}
      Route: ${route}
      Action: ${action}
      Description: ${description}
      
      Provide your analysis in the following JSON format:
      {
        "fullAnalysis": "detailed explanation of activity analysis",
        "category": "brief category of activity (e.g., 'Data Access', 'User Management', 'System Configuration')",
        "patterns": "description of any unusual patterns or 'No unusual patterns detected'",
        "riskLevel": "LOW", "MEDIUM", or "HIGH"
      }
    `;
    
    console.log('Sending request to Gemini API with key:', GEMINI_API_KEY.substring(0, 3) + '...');
    
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
          maxOutputTokens: 500
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // Add a timeout of 10 seconds
      }
    );
    
    // Extract and parse the JSON response from Gemini
    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) {
      throw new Error('Empty or invalid response from Gemini API');
    }
    
    // Extract JSON from the response (handling potential text before/after JSON)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }
    
    try {
      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      // Validate the parsed response has the required fields
      if (!parsedResponse.fullAnalysis || !parsedResponse.category || 
          !parsedResponse.patterns || !parsedResponse.riskLevel) {
        throw new Error('Incomplete analysis data from Gemini');
      }
      
      return parsedResponse;
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new Error('Failed to parse Gemini response');
    }
    
  } catch (error) {
    console.error('AI analysis error:', error.response?.data || error.message);
    // Return a structured fallback response
    return {
      fullAnalysis: `AI analysis unavailable: ${error.message || 'Unknown error'}`,
      category: 'General activity',
      patterns: 'No unusual patterns detected',
      riskLevel: 'UNKNOWN'
    };
  }
};