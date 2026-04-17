import express from 'express';
import { getMyPeerAssignments, submitPeerReview } from '../controllers/peerReviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Peer review is only for students (and maybe admins for testing)
router.get('/my-assignments', authorize(['student']), getMyPeerAssignments);
router.post('/submit', authorize(['student']), submitPeerReview);

export default router;
