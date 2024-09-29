// This function generates a random 12-digit code
function generateCode() {
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += Math.floor(Math.random() * 10); // Random digit between 0-9
    }
    return code;
  }
  
  module.exports = { generateCode };
  