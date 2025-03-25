import express from 'express';
import { fetchCore1Data } from '../controllers/core.js';

const router = express.Router();

router.get('/fetch-core', fetchCore1Data);

export default router;
