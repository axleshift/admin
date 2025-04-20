import express from "express";
import multer from 'multer';
import path from 'path';
import { 
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



router.post('/announcement', upload.single('banner'), announce);
router.get('/getannounce', getannounce);
router.delete('/delannounce/:id', delannounce);

router.post('/generate-banner', generateAiBanner);


export default router;
