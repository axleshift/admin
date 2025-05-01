import express from 'express';
import { 
  termandaccept,
  termandreject,

} from '../controllers/agreement.js';

const router = express.Router();
router.post('/accept', termandaccept);
router.post('/reject', termandreject);





export default router;