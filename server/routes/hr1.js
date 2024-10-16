import express from 'express';
import { getAllEmployees } from '../controllers/hr1.js'; 


const router = express.Router();


router.get('/employee', getAllEmployees);

export default router;