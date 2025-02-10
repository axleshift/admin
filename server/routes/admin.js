import express from "express";
import { setBackupDirectory,backupDatabase, restoreDatabase, generateAnnouncement } from "../controllers/admin.js";
const router = express.Router();

router.post('/set-directory', setBackupDirectory);
router.post('/backup',backupDatabase)
router.post('/restore', restoreDatabase);
router.post('/generate', generateAnnouncement)
export default router;