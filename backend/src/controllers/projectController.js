import prisma from '../config/prisma.js';
import { sendSSEToUser } from './systemController.js';

/**
 * Get all projects visible to the current user
 */
export const getProjects = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let projects;

    if (role === 'admin') {
      projects = await prisma.project.findMany({
        include: { student: { select: { name: true, avatar: true } }, lecturer: { select: { name: true } } }
      });
    } else if (role === 'lecturer') {
      projects = await prisma.project.findMany({
        where: { lecturerId: userId },
        include: { student: { select: { name: true, avatar: true } } }
      });
    } else {
      projects = await prisma.project.findMany({
        where: { studentId: userId },
        include: { lecturer: { select: { name: true } } }
      });
    }

    res.json(projects);
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ error: 'Internal server error fetching projects' });
  }
};

/**
 * Get a single project with details
 */
export const getProjectDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true, department: true } },
        lecturer: { select: { name: true } },
        milestones: true,
        scores: { include: { criterion: true } },
        peerReviews: { include: { reviewer: { select: { name: true, avatar: true } } } }
      }
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    res.json(project);
  } catch (error) {
    console.error('Fetch project detail error:', error);
    res.status(500).json({ error: 'Internal server error fetching project detail' });
  }
};

/**
 * Create a new project (Lecturer/Admin only)
 */
export const createProject = async (req, res) => {
  try {
    const { title, description, category, semester, studentId, deadline, tags } = req.body;

    const isStudent = req.user.role === 'student';

    const project = await prisma.project.create({
      data: {
        title,
        description,
        category,
        semester,
        studentId: isStudent ? req.user.id : studentId,
        lecturerId: isStudent ? req.body.lecturerId : req.user.id,
        deadline: deadline ? new Date(deadline) : null,
        status: 'PENDING',
        tags: tags ? (Array.isArray(tags) ? tags.join(',') : tags) : '',
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'PROJECT_CREATED',
        target: project.id,
        userId: req.user.id,
        details: `Project "${title}" created for student ${isStudent ? req.user.id : studentId}`
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error creating project' });
  }
};

/**
 * Submit a project (Student only)
 */
export const submitProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { lecturer: true }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.studentId !== userId) {
       return res.status(403).json({ error: 'Not authorized to submit this project' });
    }

    // Handle file upload if present
    let filePath = '';
    if (req.file) {
      filePath = req.file.path; // Multer saves this
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        status: 'UNDER_REVIEW',
        submittedAt: new Date(),
        fileUrl: filePath || null
      }
    });

    // Notify Lecturer
    if (project.lecturerId) {
      const dbNotif = await prisma.notification.create({
         data: {
           type: 'SUBMISSION',
           message: `Project "${project.title}" has been submitted by student and requires grading.`,
           userId: project.lecturerId
         }
      });
      // Push via SSE
      sendSSEToUser(project.lecturerId, 'NEW_NOTIFICATION', dbNotif);
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'PROJECT_SUBMITTED',
        target: project.id,
        userId,
        details: `Project submitted. File: ${filePath || 'None'}`
      }
    });

    res.json({ message: 'Project submitted successfully', project: updatedProject });

  } catch (error) {
    console.error('Submit project error:', error);
    res.status(500).json({ error: 'Internal server error submitting project' });
  }
};

/**
 * Update project details
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, semester, deadline, tags, lecturerId } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Authorization: Admin, Assigned Lecturer, or the Student themselves
    if (role !== 'admin' && project.lecturerId !== userId && project.studentId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this project' });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        category,
        semester,
        lecturerId: lecturerId || project.lecturerId,
        deadline: deadline ? new Date(deadline) : project.deadline,
        tags: tags ? (Array.isArray(tags) ? tags.join(',') : tags) : project.tags,
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error updating project' });
  }
};
