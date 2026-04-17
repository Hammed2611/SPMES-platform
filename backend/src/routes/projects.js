import express from 'express';
import { getProjects, getProjectDetail, createProject, updateProject, submitProject } from '../controllers/projectController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure uploads dir exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const upload = multer({ storage: storage })

// All project routes require authentication
router.use(authenticate);

// Get list of projects visible to user
router.get('/', getProjects);

// Get specific project details
router.get('/:id', getProjectDetail);

// Create new project (Student can propose, Lecturer/Admin can assign)
router.post('/', authorize(['lecturer', 'admin', 'student']), createProject);

// Update project
router.put('/:id', updateProject);

// Submit project (Student only)
router.post('/:id/submit', authorize(['STUDENT']), upload.single('projectFile'), submitProject);

export default router;
