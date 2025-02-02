import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import salesRoutes from "./routes/sales.js";
import notificationsRoutes from './routes/notification.js'
import hrRoutes from "./routes/hr.js";
import coreRoutes from "./routes/core.js";
import logisticsRoutes from "./routes/logistics.js";
import financeRoutes from "./routes/finance.js";
import adminRoutes from './routes/admin.js'
import tryRoutes from './routes/try.js'

import session from "express-session";
import MongoStore from "connect-mongo";

import { Server } from "socket.io";
import http from 'http';

import JobPosting from "./model/h2.js";
import user from "./model/User.js"
import Shipping from "./model/Shipping.js";
import overall from "./model/overall.js";
import { employee, mockLogisticsData ,users, transactions, overalldata, jobPostings} from "./data/index.js";

// Configuration
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    })
);
// Set up session middleware before routes
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URL,
        }),
        cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    })
);

// Routes
app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/sales", salesRoutes);
app.use('/admin', adminRoutes);
app.use('/try', tryRoutes);

// Integration
app.use('/hr', hrRoutes);
app.use('/core', coreRoutes);
app.use('/logistics', logisticsRoutes);
app.use('/finance', financeRoutes);

app.use('/notifications', notificationsRoutes);

const server = http.createServer(app);
const io = new Server(server);

// Mongoose connection
const PORT = process.env.PORT || 9000;

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

        // Optionally, populate the database with some initial data
        // Employee.insertMany(employee)
        // Logistics.insertMany(mockLogisticsData)
        // user.insertMany(users)
        // Shipping.insertMany(transactions)
        // overall.insertMany(overalldata)
        // JobPosting.insertMany(jobPostings)
    })
    .catch((err) => console.log(`${err} did not connect`));

// Socket.io event listeners
io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

export { io };