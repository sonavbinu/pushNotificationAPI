import { Router } from 'express';
import { sendNotification } from '../controllers/notification.controller';

const router = Router();

// Define routes relative to the mount point (e.g. app.use('/api', notificationRoute))
router.post('/send-notification', sendNotification);

export default router;
