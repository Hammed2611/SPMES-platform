import express from 'express';
import { getRubricTemplates, createRubricTemplate, deleteRubricTemplate } from '../controllers/rubricController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// List templates (Lecturers/Admins/Students can view)
router.get('/', getRubricTemplates);

// Create/Delete restricted to Lecturer/Admin
router.post('/', authorize(['lecturer', 'admin']), createRubricTemplate);
router.delete('/:id', authorize(['lecturer', 'admin']), deleteRubricTemplate);

export default router;
