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
    import hr1Routes from './routes/hr1.js'
    import session from 'express-session';
    import MongoStore from 'connect-mongo';

    import Employee from './model/hr1.js'
    import { employee } from "./data/index.js";


// Configuration
    dotenv.config();
    const app = express();
    app.use(express.json());
    app.use(helmet());
    app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
    app.use(morgan("common"));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(
        cors({
            origin: "http://localhost:3000", 
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE","PATCH", "OPTIONS"],
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
    app.use('/hr1',hr1Routes);


    
  

    // Mongoose connection
    const PORT = process.env.PORT || 9000;

    mongoose
        .connect(process.env.MONGO_URL)
        .then(() => {
            app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

               // Employee.insertMany(employee)
     
        })
        .catch((err) => console.log(`${err} did not connect`));
