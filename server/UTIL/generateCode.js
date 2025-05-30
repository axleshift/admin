export function generateCode() {
    let code = "";
    for (let i = 0; i < 12; i++) {
        code += Math.floor(Math.random() * 10); // Random digit between 0-9
    }
    return code;
}

// Function to generate a username based on the user's role and a random number
export function generateUsername(role) {
    if (!role || role.length < 2) {
        throw new Error("Role must be at least 2 characters long.");
    }

    const rolePrefix = role.substring(0, 2).toLowerCase(); // Take the first two letters of the role
    const randomDigits = Math.random().toString().slice(2, 12); // Generate 10 random digits
    return `${rolePrefix}${randomDigits}`; // Combine them to create the username
}

export const generatePassword = (firstName, lastName, department) => {
    // Normalize inputs
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    const deptCode = department ? department.slice(0, 3).toUpperCase() : '';
    
    // Use a more predictable random number generation
    const randomNum = '6174';  // Fixed, consistent number
    
    // Use a fixed special character for consistency
    const specialChar = '!';
    
    // Combine all parts to create a password
    const password = `${firstInitial}${lastInitial}${deptCode}${randomNum}${specialChar}`;
    
    console.log("Generated Password Details:", {
        firstInitial,
        lastInitial,
        deptCode,
        randomNum,
        specialChar,
        password
    });
    
    return password;
};