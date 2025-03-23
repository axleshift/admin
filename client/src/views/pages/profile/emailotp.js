export const saveUser = async (req, res) => {
  console.log("Received user data:", req.body);
  
  try {
    const { 
      id, 
      firstName, 
      lastName, 
      email, 
      password, 
      role, 
      department,
      phone = '',
      address = '',
      image = '',
      fullName = '',
      name = ''
    } = req.body;
    
    // Handle name fields with fallbacks
    let userFirstName = firstName || '';
    let userLastName = lastName || '';
    
    // Create full name if not provided, using firstName and lastName
    let userFullName = fullName || '';
    if (!userFullName && (userFirstName || userLastName)) {
      userFullName = `${userFirstName} ${userLastName}`.trim();
    }
    
    // Create name if not provided, using fullName or firstName and lastName
    let userName = name || '';
    if (!userName) {
      userName = userFullName || `${userFirstName} ${userLastName}`.trim();
    }
    
    // If we still don't have names, derive them from each other
    if (!userFullName && userName) {
      userFullName = userName;
    }
    
    // If we have a fullName but no first/last name, try to split it
    if (userFullName && !userFirstName && !userLastName) {
      const nameParts = userFullName.split(' ');
      if (nameParts.length >= 2) {
        userFirstName = nameParts[0];
        userLastName = nameParts.slice(1).join(' ');
      } else {
        userFirstName = userFullName;
        userLastName = '';
      }
    }
    
    // After all the logic, ensure we have at least some value for the name
    if (!userName && !userFullName && !userFirstName && !userLastName) {
      return res.status(400).json({
        success: false,
        error: "At least one name field (firstName, lastName, fullName, or name) must be provided"
      });
    }
    
    // Validate input
    const { error } = userSchema.validate({ 
      id, 
      firstName: userFirstName, 
      lastName: userLastName, 
      email, 
      password, 
      role, 
      department, 
      phone, 
      address, 
      image
    });
    
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.details[0].message 
      });
    }
    
    // Check if email already exists
    const emailExists = await User.findOne({ email });
    
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists in the system'
      });
    }
    
    // Hash the password using bcryptjs
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    
    // Normalize department and role strings
    const userDepartment = department?.trim() || 'general';
    const userRole = role?.trim()?.toLowerCase() || 'employee';
    
    // Create user data for the User model
    const userData = {
      name: userName,
      email,
      password: hashedPassword,
      phoneNumber: phone || '0000000000',
      role: userRole,
      department: capitalizeFirstLetter(userDepartment),
      username: generateUsername(userRole),
      // Additional required fields from User model
      attendance: [],
      performance: [],
      benefits: {
        healthInsurance: false,
        retirementPlan: false,
        vacationDays: 0,
        sickLeave: 0
      },
      payroll: {
        salary: 0,
        payFrequency: 'monthly',
        lastPaymentDate: new Date()
      }
    };
    
    // Save user to the User model
    const newUser = new User(userData);
    
    // Validate before saving
    const userValidation = newUser.validateSync();
    if (userValidation) {
      console.error("Validation error:", userValidation);
      throw new Error(`Validation failed: ${JSON.stringify(userValidation.errors)}`);
    }
    
    const savedUser = await newUser.save();
    
    // Generate password reset token
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h'
    });
    
    // Set up mock request and response objects for resetPassword
    const mockReq = {
      params: {
        id: savedUser._id,
        token: token
      },
      body: {
        password: password
      }
    };
    
    const mockRes = {
      status: (statusCode) => ({
        json: (data) => {
          console.log(`Password reset status: ${statusCode}, data:`, data);
        }
      }),
      json: (data) => {
        console.log("Password reset response:", data);
      }
    };
    
    // Send reset password email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${savedUser._id}/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Set Your Password',
      html: `
        <h2>Welcome to Our Platform!</h2>
        <p>Hello ${userName},</p>
        <p>Your account has been created successfully. Please click the link below to set your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Set Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this account, please ignore this email.</p>
        <p>Thank you,</p>
        <p>The Team</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    // Remove password from response
    const userResponse = savedUser.toObject ? savedUser.toObject() : savedUser;
    delete userResponse.password;
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: `User successfully saved to system and password reset email sent`,
      user: {
        ...userResponse,
        department: capitalizeFirstLetter(userDepartment)
      }
    });
    
  } catch (error) {
    console.error("User registration error:", error.message);
    
    // Handle specific errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists in the system',
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error saving user',
      error: error.message
    });
  }
};