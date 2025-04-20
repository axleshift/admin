import path from 'path';

/**
 * Sanitizes a directory path to prevent command injection
 * @param {string} dirPath - The directory path to sanitize
 * @returns {string} - The sanitized path
 */
export const sanitizePath = (dirPath) => {
  // Remove any characters that could be used for command injection
  return dirPath.replace(/[;&|`$(){}[\]<>\\]/g, '');
};

/**
 * Validates if a directory path is acceptable
 * @param {string} dirPath - The directory path to validate
 * @returns {boolean} - Whether the path is valid
 */
export const validateDirectory = (dirPath) => {
  // Check for suspicious patterns that might indicate command injection
  if (/[;&|`$(){}[\]<>\\]/.test(dirPath)) {
    return false;
  }
  
  // Prevent paths with too many parent directory references
  const parentDirCount = (dirPath.match(/\.\./g) || []).length;
  if (parentDirCount > 2) {
    return false;
  }
  
  // Additional validation logic can be added here
  return true;
};