import express from 'express'
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 

    external,
    getExternalUsersByDepartment,
    getUsersByDepartment,
    updateProfileImage,
    changePasswordSimple
 } from '../controllers/integ.js'
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profile-images';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP are allowed.'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});



const router = express.Router()


router.get('/user/:department',authenticateAdmin,getUsersByDepartment)

router.post('/external-login/:department',authenticateAdmin, external);
router.put('/external-login/:username', authenticateAdmin, upload.single('profileImage'), updateProfileImage);


router.get('/external-login/:department/all',authenticateAdmin, getExternalUsersByDepartment);

router.post('/change-password',authenticateAdmin, changePasswordSimple);
export default router