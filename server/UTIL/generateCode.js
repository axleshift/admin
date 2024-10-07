// This function generates a random 12-digit code
export function generateCode() {
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += Math.floor(Math.random() * 10); // Random digit between 0-9
  }
  return code;
}

// Function to generate a username based on the user's role and a random number
export const generateUsername = (role) => {
  if (!role || role.length < 2) {
    throw new Error("Role must be at least 2 characters long.");
  }

  const rolePrefix = role.substring(0, 2).toLowerCase(); // Take the first two letters of the role
  const randomDigits = Math.random().toString().slice(2, 12); // Generate 10 random digits
  return `${rolePrefix}${randomDigits}`; // Combine them to create the username
};

// Export both functions
export default { generateCode, generateUsername };
