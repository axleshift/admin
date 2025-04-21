import express from "express";
import { 
   downloadVehicleZip,
   downloadzip,
   downloadLeaveRequestPdf ,
   testsend

} from "../controllers/management.js";

const router = express.Router();

router.post('/downloadZip',downloadzip)

router.post('/downloadVehicleZip', downloadVehicleZip)

router.post('/downloadLeaveRequest',downloadLeaveRequestPdf )


router.post("/emailsent",testsend)
export default router;
