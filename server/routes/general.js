import express from 'express';
import { getUser } from '../controllers/general.js'; // Ensure .js is here

const router = express.Router();

router.get('/user/:id', getUser);


export default router;