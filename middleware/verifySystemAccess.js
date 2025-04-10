export const verifySystemAccess = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token is required' 
      });
    }
    
    try {
      // Verify token using JWT_SECRET_KEY from your .env file
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      
      // Check if system is authorized for the requested department
      const { department } = req.params;
      
      if (decoded.department !== department) {
        return res.status(403).json({ 
          success: false, 
          message: `Not authorized to access ${department} department data` 
        });
      }
      
      // Add decoded info to request for use in controller
      req.system = decoded;
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expired' 
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
  };


export const generateSystemToken = (systemId, department) => {
    // Use the JWT_SECRET_KEY from your .env file
    const secretKey = process.env.JWT_SECRET_KEY;
    
    const payload = {
      systemId,
      department,
      issuedAt: new Date().getTime()
    };
    
    const token = jwt.sign(
      payload,
      secretKey,
      { expiresIn: '30d' }
    );
    
    return token;
  };