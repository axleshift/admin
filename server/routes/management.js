import express from "express";
import { 
   downloadzip
} from "../controllers/management.js";

const router = express.Router();

router.post('/downloadZip',downloadzip)



export default router;
