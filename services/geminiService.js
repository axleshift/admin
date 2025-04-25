import dotenv from 'dotenv';
import fs from 'fs';

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

// Helper function to create a response for activity analysis
const createActivityAnalysis = (activity) => {
  const { name, role, department, route, action, description } = activity;
  
  // Define high-risk routes and actions
  const highRiskRoutes = ['/admin', '/system', '/settings', '/users', '/permissions', '/security', '/logs', '/config'];
  const highRiskActions = ['DELETE', 'MODIFY', 'UPDATE', 'CREATE', 'GRANT', 'REVOKE'];
  
  // Define role-based risk levels
  const roleLevels = {
    'admin': 0,
    'administrator': 0,
    'sysadmin': 0,
    'system administrator': 0,
    'manager': 1,
    'supervisor': 1,
    'team lead': 1,
    'developer': 2,
    'engineer': 2,
    'analyst': 2,
    'staff': 3,
    'user': 4,
    'employee': 4,
    'contractor': 5,
    'intern': 5,
    'guest': 6,
    'visitor': 6,
    'external': 7
  };
  
  // Calculate base risk score
  let riskScore = 0;
  const normalizedRole = role.toLowerCase();
  const roleLevel = roleLevels[normalizedRole] !== undefined ? roleLevels[normalizedRole] : 4;
  
  // Factor in role risk (higher number = higher risk)
  riskScore += roleLevel * 5;
  
  // Factor in route risk
  const routeLower = route.toLowerCase();
  for (const highRiskRoute of highRiskRoutes) {
    if (routeLower.includes(highRiskRoute.toLowerCase())) {
      riskScore += 15;
      break;
    }
  }
  
  // Factor in action risk
  const actionUpper = action.toUpperCase();
  for (const highRiskAction of highRiskActions) {
    if (actionUpper.includes(highRiskAction)) {
      riskScore += 20;
      break;
    }
  }
  
  // Check for suspicious keywords in description
  const suspiciousKeywords = ['password', 'credential', 'token', 'secret', 'key', 'access', 'sudo', 'override', 'bypass'];
  for (const keyword of suspiciousKeywords) {
    if (description.toLowerCase().includes(keyword)) {
      riskScore += 10;
    }
  }
  
  // Determine risk level
  let riskLevel = 'LOW';
  if (riskScore >= 50) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 25) {
    riskLevel = 'MEDIUM';
  }
  
  // Determine category based on route and action
  let category = 'General Activity';
  if (route.toLowerCase().includes('user') || description.toLowerCase().includes('user')) {
    category = 'User Management';
  } else if (route.toLowerCase().includes('data') || description.toLowerCase().includes('data')) {
    category = 'Data Access';
  } else if (route.toLowerCase().includes('config') || route.toLowerCase().includes('setting')) {
    category = 'System Configuration';
  } else if (route.toLowerCase().includes('report') || route.toLowerCase().includes('dashboard')) {
    category = 'Reporting';
  } else if (route.toLowerCase().includes('log') || description.toLowerCase().includes('log')) {
    category = 'Logging';
  } else if (route.toLowerCase().includes('security') || description.toLowerCase().includes('security')) {
    category = 'Security Operation';
  }
  
  // Detect unusual patterns
  let patterns = 'No unusual patterns detected';
  if (roleLevel > 3 && (route.includes('admin') || route.includes('system'))) {
    patterns = 'Low-privilege user accessing high-privilege route';
  } else if (description.toLowerCase().includes('fail') || description.toLowerCase().includes('error')) {
    patterns = 'Failed operation detected';
  } else if (description.toLowerCase().includes('multiple') || description.toLowerCase().includes('repeated')) {
    patterns = 'Multiple or repeated actions detected';
  } else if (actionUpper === 'DELETE' && roleLevel > 2) {
    patterns = 'Low-privilege user performing deletion';
  }
  
  // Generate full analysis based on gathered data
  let fullAnalysis = `User ${name} (${role} in ${department}) performed ${action} on ${route}. `;
  
  if (riskLevel === 'HIGH') {
    fullAnalysis += `This is a HIGH risk activity due to the sensitive nature of the ${category.toLowerCase()} and the user's role permissions. `;
  } else if (riskLevel === 'MEDIUM') {
    fullAnalysis += `This is a MEDIUM risk activity that warrants regular monitoring within the ${category.toLowerCase()}. `;
  } else {
    fullAnalysis += `This is a LOW risk activity that appears to be normal for the user's role and the ${category.toLowerCase()}. `;
  }
  
  if (patterns !== 'No unusual patterns detected') {
    fullAnalysis += `Warning: ${patterns}. `;
  }
  
  fullAnalysis += `Action description: ${description}`;
  
  return {
    fullAnalysis,
    category,
    patterns,
    riskLevel
  };
};

// Main function to analyze user activity 
export const analyzeActivityWithAI = async (activityData) => {
  try {
    const { name, role, department, route, action, description } = activityData;

    // Validate that all required fields are present
    if (!name || !role || !department || !route || !action || !description) {
      console.error('Activity analysis error: Missing required fields');
      return {
        fullAnalysis: 'Activity analysis unavailable - missing required fields',
        category: 'General activity',
        patterns: 'No unusual patterns detected',
        riskLevel: 'MEDIUM'
      };
    }

    console.log('Performing local activity analysis...');
    return createActivityAnalysis(activityData);
  } catch (error) {
    console.error('Unexpected error during activity analysis:', error.message);
    return {
      fullAnalysis: `Analysis error: ${error.message || 'Unknown error'}`,
      category: 'General activity',
      patterns: 'No unusual patterns detected',
      riskLevel: 'MEDIUM'
    };
  }
};

// Password analysis function
export const analyzePasswordWithAI = async (password) => {
  try {
    // Perform basic validation
    if (!password || typeof password !== 'string') {
      console.error('Password analysis error: Invalid password input');
      return createDefaultPasswordAnalysis('');
    }
    
    console.log('Performing local password analysis...');
    return createPasswordAnalysis(password);
  } catch (error) {
    console.error('Unexpected password analysis error:', error.message || 'Unknown error');
    return createDefaultPasswordAnalysis(password);
  }
};

// Enhanced password analysis function
const createPasswordAnalysis = (password) => {
  // Scoring variables
  let score = 0;
  let strength = 'Very Weak';
  let feedback = [];
  
  // Length check with graduated scoring
  if (password.length >= 16) {
    score += 25;
    feedback.push('Excellent password length.');
  } else if (password.length >= 12) {
    score += 20;
    feedback.push('Good password length.');
  } else if (password.length >= 8) {
    score += 15;
    feedback.push('Acceptable password length.');
  } else if (password.length >= 6) {
    score += 5;
    feedback.push('Password is too short. It should be at least 8 characters long.');
  } else {
    feedback.push('Password is critically short. It should be at least 8 characters long.');
  }
  
  // Character diversity checks
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (hasUppercase) score += 10;
  else feedback.push('Add uppercase letters to strengthen your password.');
  
  if (hasLowercase) score += 10;
  else feedback.push('Add lowercase letters to strengthen your password.');
  
  if (hasNumbers) score += 10;
  else feedback.push('Add numbers to strengthen your password.');
  
  if (hasSpecialChars) score += 15;
  else feedback.push('Add special characters to strengthen your password.');
  
  // Bonus for character diversity
  const charTypes = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  if (charTypes >= 4) score += 15;
  else if (charTypes >= 3) score += 10;
  
  // Check for common patterns
  const commonPatterns = [
    '123', '1234', '12345', '123456', 'password', 'qwerty', 'admin', 'welcome',
    'abc', 'abcd', 'abcde', 'qwert', 'asdf', 'zxcv'
  ];
  
  for (const pattern of commonPatterns) {
    if (password.toLowerCase().includes(pattern)) {
      score -= 15;
      feedback.push(`Password contains a common pattern (${pattern}). Avoid predictable sequences.`);
      break;
    }
  }
  
  // Check for repeated characters
  const repeatedChars = /(.)\1{2,}/.test(password);
  if (repeatedChars) {
    score -= 10;
    feedback.push('Password contains repeated characters. Avoid using the same character multiple times in a row.');
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  // Determine strength based on score
  if (score >= 80) strength = 'Very Strong';
  else if (score >= 60) strength = 'Strong';
  else if (score >= 40) strength = 'Moderate';
  else if (score >= 20) strength = 'Weak';
  
  // Add general improvement tips if score is not perfect
  if (score < 100) {
    if (feedback.length === 0) {
      feedback.push('Consider using a longer password with a mix of character types.');
    }
    
    // Add suggestion for a strong password if current one is weak
    if (score < 60) {
      feedback.push('Example of a strong password pattern: Mix uppercase, lowercase, numbers and special characters in an unpredictable way.');
    }
  } else if (feedback.length === 0) {
    feedback.push('Excellent password! Keep it secure and don\'t reuse it across different services.');
  }
  
  let explanation = `This password scores ${score}/100. `;
  
  if (score >= 80) {
    explanation += 'This is a very strong password with good complexity and length.';
  } else if (score >= 60) {
    explanation += 'This is a strong password, but could be improved further.';
  } else if (score >= 40) {
    explanation += 'This password provides moderate security but has room for improvement.';
  } else if (score >= 20) {
    explanation += 'This password is weak and should be strengthened before use.';
  } else {
    explanation += 'This password is very weak and highly vulnerable to being compromised.';
  }
  
  return {
    score,
    strength,
    feedback,
    explanation
  };
};

// Helper function to create a default password analysis
const createDefaultPasswordAnalysis = (password) => {
  // Basic strength calculation
  let score = 0;
  let strength = 'Very Weak';
  let feedback = ['Unable to analyze password properly.', 'Use a mix of character types and avoid common patterns.'];
  
  return {
    score,
    strength,
    feedback,
    explanation: 'This is a fallback analysis due to an error in the password analysis system.',
    isDefaultAnalysis: true
  };
};

// These functions are kept for compatibility but they don't do anything meaningful now
export const getApiKeyStatus = () => {
  return {
    totalKeys: 0,
    availableKeys: 0,
    keyStatus: [],
    currentKeyIndex: 0,
    isLocalOnly: true
  };
};

export const resetApiKeyQuota = () => {
  console.log('This is a local-only implementation. No API keys to reset.');
  return false;
};

export const resetAllApiKeyQuotas = () => {
  console.log('This is a local-only implementation. No API keys to reset.');
  return false;
};