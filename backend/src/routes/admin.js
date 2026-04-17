import express from 'express';
import { 
  getAssignmentMatrix, assignLecturer, autoAssign, 
  getUsers, getAuditLogs, createUser, updateUser, deleteUser,
  getDashboardStats
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes here must be ADMIN only
router.use(authenticate, authorize(['ADMIN']));

// Dashboard
router.get('/stats', getDashboardStats);

// Assignment routes
router.get('/matrix', getAssignmentMatrix);
router.patch('/projects/:projectId/assign', assignLecturer);
router.post('/auto-assign', autoAssign);

// User and Audit routes
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/audit', getAuditLogs);

export default router;
