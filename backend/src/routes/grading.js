import express from 'express';
import { getRubric, submitGrade, getAIFeedback } from '../controllers/gradingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All grading routes require authentication
router.use(authenticate);

// Get rubric for a project
router.get('/:projectId/rubric', getRubric);

// Generate AI feedback suggestions
router.post('/:projectId/ai-feedback', authorize(['lecturer', 'admin']), getAIFeedback);

// Submit grade (Lecturer/Admin only)
router.post('/:projectId', authorize(['lecturer', 'admin']), submitGrade);

export default router;
