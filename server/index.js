import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import salesRoutes from "./routes/sales.js";
import hrRoutes from "./routes/hr.js";
import coreRoutes from "./routes/core.js";
import logisticsRoutes from "./routes/logistics.js";
import financeRoutes from "./routes/finance.js";
import adminRoutes from './routes/admin.js';
import securityRoutes from './routes/security.js'
import webhookRoutes from './routes/webhook.js'
import integRoutes from './routes/integ.js'

import { startAutoSync } from "./UTIL/scheduler.js";

import session from 'express-session';
import MongoStore from 'connect-mongo';
import http from "http";
import { GoogleGenerativeAI } from "@google/generative-ai";

import backupRoutes from './routes/backupauto.js'
// Add imports for file uploads
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ✅ 1. Load environment variables at the very top
dotenv.config();

import NewUser from "./model/newUser.js";
import {newuser} from './data/index.js'

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ 2. Initialize Express app
const app = express();

// ✅ 3. Create HTTP server
const server = http.createServer(app);

// ✅ 5. Middleware
app.use(helmet());
app.use(
  cors({
      origin: [
          "https://admin.axleshift.com", 
          "https://backend-admin.axleshift.com",
          // Add any other domains you need
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

// Add preflight OPTIONS handling
app.options('*', cors());
app.use(express.json());
app.use(cookieParser()); 
app.use(morgan("common"));
app.use(bodyParser.json());



// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ 6. Set up session middleware before routes
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 14 * 24 * 60 * 60 * 1000
    }
  }));
app.use('/backupauto/',backupRoutes)
// ✅ 7. Register routes
app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/sales", salesRoutes);
app.use("/admin", adminRoutes);
app.use('/security', securityRoutes)
// ✅ 8. Integration routes
app.use("/hr", hrRoutes);
app.use("/core", coreRoutes);
app.use("/logistics", logisticsRoutes);
app.use("/finance", financeRoutes);
app.use('/webhook',webhookRoutes);
app.use('/integ',integRoutes);
// ✅ 9. Load AI service
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Serve your React app's build folder if it exists
// Modify this path to match your React app's build folder location
const clientBuildPath = path.join(__dirname, '../client/build');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  
  // Catch-all route for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// ✅ 10. Connect to MongoDB and start the server
const PORT = process.env.PORT || 9000;

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        server.listen(PORT, () => console.log(`🚀 Server running on port: ${PORT}`));
       // startAutoSync();
    })
    .catch((err) => console.log(`❌ MongoDB connection failed: ${err}`));