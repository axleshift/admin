import express from 'express';
import { getUser,loginUser } from '../controllers/general.js'; // Ensure .js is here

const router = express.Router();

router.get('/user/:id', getUser);
router.get('/user/login', loginUser);


export default router;