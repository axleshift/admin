import express from "express";
import { 
   downloadVehicleZip,
   downloadzip,

} from "../controllers/management.js";

const router = express.Router();

router.post('/downloadZip',downloadzip)

router.post('/downloadVehicleZip', downloadVehicleZip)


export default router;
