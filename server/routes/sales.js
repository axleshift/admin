import express from 'express';
const router= express.Router()
import { getshipping, createShipping } from '../controllers/sales.js';

router.get('/shipping', getshipping)

router.post('/shipping', createShipping); 


export default router