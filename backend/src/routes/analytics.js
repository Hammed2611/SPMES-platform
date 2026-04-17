import express from 'express';
import { getClassAnalytics } from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Analytics is restricted to Lecturers and Admins
router.get('/class', authorize(['lecturer', 'admin']), getClassAnalytics);

export default router;
