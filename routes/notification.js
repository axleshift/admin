import express from 'express';
import { 
    getnotif, 
    addnotif,
    getUserNotifications,
    markAsRead
} from '../controllers/notification.js';
const router = express.Router();

router.get('/getnotif', getnotif);
router.get('/user/:userId', getUserNotifications);
router.post('/postnotif', addnotif);
router.patch('/read/:notificationId', markAsRead);

export default router;