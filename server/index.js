import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import clientRoutes from './routes/client.js'
import generalRoutes from './routes/general.js'
import managementRoutes from './routes/management.js'
import salesRoutes from './routes/sales.js'

//data imports
import User from './model/User.js'
import Product from './model/Product.js'
import ProductStat from './model/ProductStat.js'
import {dataUser, dataProduct, dataProductStat} from './data/index.js'

//configuration
dotenv.config()
const app = express()
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({policy:'cross-origin'}))
app.use(morgan("common"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cors({origin: 'http://localhost:3000',}))

//routes
app.use("/client",clientRoutes)
app.use("/general",generalRoutes)
app.use("/management",managementRoutes)
app.use("/sales",salesRoutes)

//mongooose
const PORT = process.env.PORT || 9000
mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    app.listen(PORT,() => console.log(`server port:${PORT}`));
    
   // User.insertMany(dataUser)
   // Product.insertMany(dataProduct)
    //ProductStat.insertMany(dataProductStat)
}).catch((err) => console.log(`${err} did not connect`));