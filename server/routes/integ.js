import express from 'express'
import { 

    external,
    getExternalUsersByDepartment,
    getUsersByDepartment,
 } from '../controllers/integ.js'
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router()


router.get('/user/:department',authenticateAdmin,getUsersByDepartment)

router.post('/external-login/:department',authenticateAdmin, external);


router.post('/external-login/:department/all',authenticateAdmin, getExternalUsersByDepartment);
export default router