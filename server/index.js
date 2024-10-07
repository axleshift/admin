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
import session from 'express-session';
import MongoStore from 'connect-mongo';

// Data imports
import User from "./model/User.js";
import Product from './model/Product.js';
import { products, users } from './data/index.js'; // Renamed import

// Configuration
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Update CORS to include PUT method
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Added PUT and DELETE methods
    })
);

// Set up session middleware before routes
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URL, // Ensure it's MONGO_URL, not MONGO_URI
        }),
        cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    })
);

// Routes
app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/sales", salesRoutes);

// Mongoose connection
const PORT = process.env.PORT || 9000;

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
        
        // Insert data into the database
        // Uncomment the following lines as needed
        // User.insertMany(users)
        // Product.insertMany(products)
        // Transaction.insertMany(transaction) 
    })
    .catch((err) => console.log(`${err} did not connect`));
