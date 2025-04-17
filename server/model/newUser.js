import mongoose from "mongoose";

const newUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Full name is required"],
    trim: true
  },
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    required: [true, "Role is required"],
    trim: true
  },
  department: {
    type: String,
    required: [true, "Department is required"],
    trim: true
  },
  phone: {
    type: String,
    default: ""
  },
  address: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: ""
  },
  registered: {
    type: Boolean,
    default: false
  },
  registrationDate: {
    type: Date
  },
  registrationError: {
    type: String
  },
  generatedPassword: {
    type: String
  }
}, {
  timestamps: true
});

// Pre-save middleware to handle full name
newUserSchema.pre("validate", function(next) {
  // If we have a name but no firstName/lastName, split the name
  if (this.name && (!this.firstName || !this.lastName)) {
    const nameParts = this.name.trim().split(/\s+/);
    
    if (nameParts.length >= 2) {
      // First part becomes firstName
      this.firstName = nameParts[0];
      
      // The rest becomes lastName
      this.lastName = nameParts.slice(1).join(" ");
    } else if (nameParts.length === 1) {
      // If only one word is provided, set it as firstName
      this.firstName = nameParts[0];
      this.lastName = ""; // You might want to handle this differently
    }
  }
  
  // If we have firstName and lastName but no name, create a name
  if (!this.name && this.firstName && this.lastName) {
    this.name = `${this.firstName} ${this.lastName}`.trim();
  }
  
  next();
});

const NewUser = mongoose.model("NewUser", newUserSchema);

export default NewUser;