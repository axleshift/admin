// routes/incidentreport.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { 
  uploadIncidentReport, 
  getAllIncidentReports, 
  getIncidentReportById,
  updateIncidentReport,
  deleteIncidentReport
} from '../controllers/incidentreport.js';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Set up storage configuration for multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads/incident-reports/');
    },
    filename: function(req, file, cb) {
      // Create unique filename with original extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExt = path.extname(file.originalname);
      cb(null, 'incident-' + uniqueSuffix + fileExt);
    }
  });

// Create file filter function
const fileFilter = (req, file, cb) => {
    // Define allowed file types
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      // Accept file
      cb(null, true);
    } else {
      // Reject file
      cb(new Error('Invalid file type. Only PDF, Word, Excel, images, and text documents are allowed.'), false);
    }
  };

// Set up multer with our configuration
const upload = multer({ 
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: fileFilter
  });
  

// Define routes
router.post('/upload',  upload.single('file'), uploadIncidentReport);

// Route for uploads via token URL (from email link)
router.post('/upload/:userId/:token', async (req, res, next) => {
  try {
    const { userId, token } = req.params;
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Check if token is valid for this user
    if (decoded.id !== userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
    
    // If token is valid, attach userId to request and proceed
    req.params.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please request a new link."
    });
  }
}, upload.single('file'), uploadIncidentReport);

router.get('/incidentall', getAllIncidentReports);
router.get('/incident/:id', getIncidentReportById);
router.put('/incident/:id', updateIncidentReport);
router.delete('/incident/:id', deleteIncidentReport);

export default router;