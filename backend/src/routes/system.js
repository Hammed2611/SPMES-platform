import express from 'express';
import { getNotifications, markAsRead, markAllAsRead, getAuditLogs, streamNotifications } from '../controllers/systemController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// User notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/mark-all-read', markAllAsRead);
router.patch('/notifications/:id/read', markAsRead);
router.get('/stream', streamNotifications);

// Admin audit logs
router.get('/audit', authorize(['admin']), getAuditLogs);

export default router;
