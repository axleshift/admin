import mongoose from "mongoose";
import User from "./model/User.js"; // Adjust the path if needed
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Function to Fetch and Show Users in Logistics Department
const showLogisticsUsers = async () => {
  try {
    await connectDB();

    const users = await User.find({ department: { $regex: /^Logistics$/i } });

    if (users.length === 0) {
      console.log("⚠️ No users found in the Logistics department.");
    } else {
      console.log("📋 Users in Logistics Department:");
      console.table(users.map(user => ({
        ID: user._id,
        Name: user.name,
        Email: user.email,
        Password: user.password,
        Phone: user.phoneNumber,
        Role: user.role,
        Department: user.department
      })));
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    mongoose.connection.close();
  }
};

// Run the function
showLogisticsUsers();
