import express from "express";
import multer from 'multer';
import path from 'path';
import { 
    sendToLogistics,
    sendTocore,
    sendTofinance,
    sendToHR, 
    announce,
    getannounce,
    delannounce,
    generateAiBanner,
    // getUserDep,
    // genSysToken
   
} from "../controllers/management.js";
import upload from "../middleware/multer.js";
import { verifySystemAccess } from "../middleware/verifySystemAccess.js";

const router = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Make sure this directory exists
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
} );

router.post("/logistics", sendToLogistics);
router.post("/hr", sendToHR);
router.post("/core", sendTocore);
router.post("/finance", sendTofinance);

router.post('/announcement', upload.single('banner'), announce);
router.get('/getannounce', getannounce);
router.delete('/delannounce/:id', delannounce);

router.post('/generate-banner', generateAiBanner);

// router.get('/user/:department', verifySystemAccess,getUserDep)
// router.post('/generate-system-token',genSysToken);
export default router;
