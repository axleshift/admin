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
import { GoogleGenerativeAI } from "@google/generative-ai";
import backupRoutes from './routes/backupauto.js'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import NewUser from "./model/newUser.js";
import { newuser } from './data/index.js'

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Middleware
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

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.use('/backupauto/', backupRoutes);

// Routes
app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/sales", salesRoutes);
app.use("/admin", adminRoutes);
app.use('/security', securityRoutes);
app.use("/hr", hrRoutes);
app.use("/core", coreRoutes);
app.use("/logistics", logisticsRoutes);
app.use("/finance", financeRoutes);
app.use('/webhook', webhookRoutes);
app.use('/integ', integRoutes);

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const clientBuildPath = path.join(__dirname, '../client/build');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 9000;

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        app.listen(PORT, () => console.log(`🚀 Server running on port: ${PORT}`));
        // startAutoSync();
    })
    .catch((err) => console.log(`❌ MongoDB connection failed: ${err}`));
