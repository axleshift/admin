import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyBlGfiToGE4_D_86kpLw_7QSzvaAySDASA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const analyzePasswordWithAI = async (password) => {
  try {
    const passwordFeatures = {
      length: password.length,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSymbols: /[^A-Za-z0-9]/.test(password),
      patterns: {
        hasRepeatedChars: /(.)\1{2,}/.test(password),
        hasSequentialNumbers: /(?:012|123|234|345|456|567|678|789)/.test(password),
        hasKeyboardPatterns: /(?:qwer|asdf|zxcv|wasd)/i.test(password),
      }
    };

    const prompt = `
    Analyze the following password features and provide a JSON response:
    - Length: ${passwordFeatures.length}
    - Contains lowercase: ${passwordFeatures.hasLowercase}
    - Contains uppercase: ${passwordFeatures.hasUppercase}
    - Contains numbers: ${passwordFeatures.hasNumbers}
    - Contains symbols: ${passwordFeatures.hasSymbols}
    - Contains repeated characters: ${passwordFeatures.patterns.hasRepeatedChars}
    - Contains sequential numbers: ${passwordFeatures.patterns.hasSequentialNumbers}
    - Contains keyboard patterns: ${passwordFeatures.patterns.hasKeyboardPatterns}

    Return a JSON object with:
    {
      "score": (0-100),
      "strength": "Weak | Moderate | Strong | Very Strong",
      "feedback": ["list of improvement suggestions"],
      "explanation": "brief explanation of the score"
    }
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

    const responseText = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                      responseText.match(/\{[\s\S]*\}/);
    
    const jsonResponse = jsonMatch ? 
      JSON.parse(jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1]) : 
      null;

    if (!jsonResponse || typeof jsonResponse.score !== 'number') {
      console.warn('AI response invalid, using fallback analysis.');
      return fallbackPasswordAnalysis(password);
    }

    return jsonResponse;
  } catch (error) {
    console.error('AI Password Analysis Error:', error);
    return fallbackPasswordAnalysis(password);
  }
};

const fallbackPasswordAnalysis = (password) => {
  let score = 0;
  const feedback = [];
  const commonPasswords = ['password', '123456', 'qwerty', 'letmein', 'welcome'];

  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push("Avoid excessive repetition of characters.");
  }
  if (commonPasswords.includes(password.toLowerCase())) {
    score -= 30;
    feedback.push("Avoid using common passwords.");
  }

  if (password.length < 8) feedback.push("Use at least 8 characters.");
  if (!/[a-z]/.test(password)) feedback.push("Add lowercase letters.");
  if (!/[A-Z]/.test(password)) feedback.push("Add uppercase letters.");
  if (!/\d/.test(password)) feedback.push("Add numbers.");
  if (!/[^A-Za-z0-9]/.test(password)) feedback.push("Add special characters.");

  const entropy = calculateEntropy(password);
  if (entropy < 28) feedback.push("Increase password complexity for better security.");

  let strength = "Weak";
  if (score >= 30) strength = "Moderate";
  if (score >= 60) strength = "Strong";
  if (score >= 80) strength = "Very Strong";

  return {
    score,
    strength,
    feedback: feedback.length > 0 ? feedback : ["Good password!"],
    explanation: "Basic password analysis (AI fallback)."
  };
};

export const calculateEntropy = (password) => {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/\d/.test(password)) charsetSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32;

  return password.length * Math.log2(charsetSize);
};