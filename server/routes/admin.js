import express from "express";
import { setBackupDirectory,backupDatabase, restoreDatabase } from "../controllers/admin.js";
const router = express.Router();

router.post('/set-directory', setBackupDirectory);
router.post('/backup',backupDatabase)
router.post('/restore', restoreDatabase);
export default router;