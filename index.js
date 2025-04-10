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
import notificationsRoutes from './routes/notification.js';
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
import { Server } from "socket.io";
import http from "http";
import { GoogleGenerativeAI } from "@google/generative-ai";

import backupRoutes from './routes/backupauto.js'
// Add imports for file uploads
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { setupSocketEvents } from "./UTIL/socketHandlers.js";

// ✅ 1. Load environment variables at the very top
dotenv.config();

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ 2. Initialize Express app
const app = express();

// ✅ 3. Create HTTP server and Socket.io instance
const server = http.createServer(app);
//uncommet niyo nlang pag may problema
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", process.env.CLIENT_URL],
        methods: ["GET", "POST"]
    }
});

// ✅ 4. Attach io instance to app so routes can use `req.app.get("io")`
app.set("io", io);

// FIX 1: Add middleware to set correct MIME types for all relevant file types
app.use((req, res, next) => {
  const path = req.path;
  
  if (path.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (path.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css');
  } else if (path.endsWith('.json')) {
    res.setHeader('Content-Type', 'application/json');
  } else if (path.endsWith('.mjs')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
  
  next();
});

// ✅ 5. Middleware
app.use(express.json());
app.use(cookieParser()); 
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
    cors({
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    })
);

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
      sameSite: 'strict',
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
app.use("/notifications", notificationsRoutes);
app.use('/webhook',webhookRoutes);
app.use('/integ',integRoutes);
// ✅ 9. Load AI service
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// FIX 2: Define the client build path properly and ensure it exists
const clientBuildPath = path.join(__dirname, '../client/build');

// FIX 3: Serve static files from the React app build folder with proper caching
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath, {
    maxAge: '1d', // Cache static assets for 1 day
    etag: true,   // Enable ETag for caching
    index: false  // Don't automatically serve index.html for directories
  }));
  
  // FIX 4: Updated catch-all route with improved error handling
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || 
        req.path.startsWith('/client/') || 
        req.path.startsWith('/general/') ||
        req.path.startsWith('/sales/') ||
        req.path.startsWith('/admin/') ||
        req.path.startsWith('/hr/') ||
        req.path.startsWith('/core/') ||
        req.path.startsWith('/logistics/') ||
        req.path.startsWith('/finance/') ||
        req.path.startsWith('/notifications/') ||
        req.path.startsWith('/webhook/') ||
        req.path.startsWith('/integ/') ||
        req.path.startsWith('/security/') ||
        req.path.startsWith('/management/') ||
        req.path.startsWith('/uploads/')) {
      return next();
    }
    
    // For all other routes, serve the React app
    const indexPath = path.join(clientBuildPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Application not properly deployed. Missing index.html');
    }
  });
}

// ✅ 10. Connect to MongoDB and start the server
const PORT = process.env.PORT || 9000;

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        server.listen(PORT, () => {
          console.log(`🚀 Server running on port: ${PORT}`);
          console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
          console.log(`Client URL: ${process.env.CLIENT_URL || 'not set'}`);
        });
       // startAutoSync();
    })
    .catch((err) => console.log(`❌ MongoDB connection failed: ${err}`));

// ✅ 11. Handle WebSocket connections
setupSocketEvents(io);
io.on("connection", (socket) => {
    console.log(`✅ A user connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});

// ✅ 12. Export io instance
export { io };