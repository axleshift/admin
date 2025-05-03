import express from 'express';
import { 
  termandaccept,
  termandreject,
	getAllAgreements
} from '../controllers/agreement.js';

const router = express.Router();
router.post('/accept', termandaccept);
router.post('/reject', termandreject);
router.get('/getAgree',getAllAgreements)




export default router;