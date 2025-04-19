import axios from 'axios';

// Updated API key - replace with your actual key
const GEMINI_API_KEY = 'AIzaSyA3hQsrM4vH-80RUQU-ZJWX7v3QLRhAzA0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const analyzePasswordWithAI = async (password) => {
  try {
    // Create a prompt that doesn't expose the actual password
    // We extract features instead of sending the raw password
    const passwordFeatures = {
      length: password.length,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSymbols: /[^A-Za-z0-9]/.test(password),
      // Add pattern detection without revealing the actual password
      patterns: {
        hasRepeatedChars: /(.)\1{2,}/.test(password),
        hasSequentialNumbers: /(?:012|123|234|345|456|567|678|789)/.test(password),
        hasKeyboardPatterns: /(?:qwer|asdf|zxcv|wasd)/i.test(password),
      }
    };

    const prompt = `
      As a password security AI, analyze this password's strength based on these features:
      - Length: ${passwordFeatures.length} characters
      - Contains lowercase letters: ${passwordFeatures.hasLowercase}
      - Contains uppercase letters: ${passwordFeatures.hasUppercase}
      - Contains numbers: ${passwordFeatures.hasNumbers}
      - Contains symbols: ${passwordFeatures.hasSymbols}
      - Contains repeated characters: ${passwordFeatures.patterns.hasRepeatedChars}
      - Contains sequential numbers: ${passwordFeatures.patterns.hasSequentialNumbers}
      - Contains keyboard patterns: ${passwordFeatures.patterns.hasKeyboardPatterns}
      
      Provide a JSON response with:
      1. A numerical score from 0-100
      2. A strength classification (Weak, Moderate, Strong, Very Strong)
      3. An array of specific improvement suggestions
      4. A brief explanation of the scoring
      
      Return ONLY valid JSON without any other text.
    `;

    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    // Extract and parse the JSON response from Gemini
    const responseText = response.data.candidates[0].content.parts[0].text;
    
    // Handle different response formats from Gemini
    let jsonResponse;
    try {
      // First try direct parsing in case response is already clean JSON
      jsonResponse = JSON.parse(responseText);
    } catch (e) {
      // If direct parsing fails, try to extract JSON from markdown code blocks or text
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                        responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const extractedJson = jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1];
        try {
          jsonResponse = JSON.parse(extractedJson);
        } catch (err) {
          console.error('Failed to parse extracted JSON:', err);
          throw new Error('Invalid JSON format in AI response');
        }
      } else {
        throw new Error('Could not find JSON in AI response');
      }
    }

    if (!jsonResponse) {
      throw new Error('Failed to parse AI response');
    }

    return jsonResponse;
  } catch (error) {
    console.error('AI Password Analysis Error:', error);
    
    // Fallback to basic analysis if AI fails
    return fallbackPasswordAnalysis(password);
  }
};

// Fallback function in case the API call fails
const fallbackPasswordAnalysis = (password) => {
  let score = 0;
  const feedback = [];
  
  // Simple scoring algorithm as fallback
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  if (/(.)\1{2,}/.test(password)) score -= 10;
  
  // Generate feedback
  if (password.length < 8) feedback.push("Use at least 8 characters");
  if (!/[a-z]/.test(password)) feedback.push("Add lowercase letters");
  if (!/[A-Z]/.test(password)) feedback.push("Add uppercase letters");
  if (!/\d/.test(password)) feedback.push("Add numbers");
  if (!/[^A-Za-z0-9]/.test(password)) feedback.push("Add special characters");
  if (/(.)\1{2,}/.test(password)) feedback.push("Avoid repeated characters");
  
  // Determine strength
  let strength = "Weak";
  if (score >= 30) strength = "Moderate";
  if (score >= 60) strength = "Strong";
  if (score >= 80) strength = "Very Strong";
  
  return {
    score,
    strength,
    feedback: feedback.length > 0 ? feedback : ["Good password!"],
    explanation: "Basic password analysis (AI fallback)"
  };
};