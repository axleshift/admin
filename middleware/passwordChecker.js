export const validatePasswordBeforeSave = async (req, res, next) => {
    const { password } = req.body;
  
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
  
    const result = await checkPasswordSecurity(password);
  
    if (result === "Bad") {
      return res.status(400).json({ error: "Weak password. Please use a stronger password." });
    }
  
    next();
  };