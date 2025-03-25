import express from 'express'
import { 

    getUsersByDepartment,
 } from '../controllers/integ.js'
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router()


router.get('/user/:department',authenticateAdmin,getUsersByDepartment)
export default router