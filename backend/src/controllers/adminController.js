import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({
      where: { role: { in: ['STUDENT', 'LECTURER', 'student', 'lecturer'] } }
    });
    
    const gradedProjects = await prisma.project.count({
      where: { finalScore: { not: null } }
    });

    const unassignedProjects = await prisma.project.count({
      where: { lecturerId: null }
    });

    const overdueCount = await prisma.project.count({
      where: { AND: [ { finalScore: null }, { deadline: { lt: new Date() } } ] }
    });

    const recentLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { user: { select: { name: true, role: true } } }
    });

    res.json({
      users: totalUsers,
      graded: gradedProjects,
      unassigned: unassignedProjects,
      overdue: overdueCount,
      logs: recentLogs
    });
  } catch (err) {
    console.error('Stats Error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getAssignmentMatrix = async (req, res) => {
  try {
    const unassignedProjects = await prisma.project.findMany({
      where: { lecturerId: null },
      include: {
        student: { select: { id: true, name: true, department: true } }
      }
    });

    const lecturers = await prisma.user.findMany({
      where: { role: 'lecturer' },
      select: { 
        id: true, 
        name: true, 
        department: true,
        _count: {
          select: { projectsAsLecturer: true }
        }
      }
    });

    res.json({ unassigned: unassignedProjects, lecturers });
  } catch (error) {
    console.error('Assignment Matrix Error:', error);
    res.status(500).json({ error: 'Failed to load assignment matrix' });
  }
};

export const assignLecturer = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { lecturerId } = req.body;

    if (!lecturerId) {
      return res.status(400).json({ error: 'Lecturer ID is required' });
    }

    // Assign
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { lecturerId },
      include: { student: { select: { name: true } } }
    });

    // Log admin action
    await prisma.auditLog.create({
      data: {
        action: 'PROJECT_ASSIGNED',
        target: projectId,
        details: `Assigned project '${project.title}' to Lecturer ID: ${lecturerId}`,
        userId: req.user.id
      }
    });

    res.json({ message: 'Assignment successful', project });
  } catch (error) {
    console.error('Assignment Error:', error);
    res.status(500).json({ error: 'Failed to assign lecturer' });
  }
};

export const autoAssign = async (req, res) => {
  try {
    // Very basic auto-assign logic: randomly evenly distribute to lecturers
    const unassignedProjects = await prisma.project.findMany({
      where: { lecturerId: null }
    });

    if (unassignedProjects.length === 0) {
      return res.json({ message: 'No unassigned projects.' });
    }

    const lecturers = await prisma.user.findMany({
      where: { role: 'lecturer' },
      select: { id: true, _count: { select: { projectsAsLecturer: true } } }
    });

    if (lecturers.length === 0) {
      return res.status(400).json({ error: 'No lecturers available in the system.' });
    }

    // Sort lecturers by lowest workload first
    lecturers.sort((a, b) => a._count.projectsAsLecturer - b._count.projectsAsLecturer);

    let assignedCount = 0;
    let lecturerIdx = 0;

    for (const project of unassignedProjects) {
      const lecturer = lecturers[lecturerIdx];
      await prisma.project.update({
        where: { id: project.id },
        data: { lecturerId: lecturer.id }
      });
      lecturer._count.projectsAsLecturer += 1;
      assignedCount++;

      // Re-sort or round-robin
      lecturerIdx = (lecturerIdx + 1) % lecturers.length;
    }

    // Log
    await prisma.auditLog.create({
      data: {
        action: 'AUTO_ASSIGN_EXECUTED',
        details: `Auto-assigned ${assignedCount} projects to lecturers.`,
        userId: req.user.id
      }
    });

    res.json({ message: `Successfully auto-assigned ${assignedCount} projects.` });
  } catch (error) {
    console.error('AutoAssign Error:', error);
    res.status(500).json({ error: 'Failed to execute auto-assign' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(users);
  } catch (error) {
    console.error('GetUsers Error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (error) {
    console.error('GetAuditLogs Error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role.toLowerCase(),
        department,
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'USER_CREATED',
        target: newUser.id,
        details: `Created new ${role} user: ${email}`,
        userId: req.user.id
      }
    });

    res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, email: newUser.email, name: newUser.name } });
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === req.user.id) {
       return res.status(400).json({ error: 'Cannot delete your own admin account.' });
    }

    const deletedUser = await prisma.user.delete({
      where: { id }
    });

    await prisma.auditLog.create({
      data: {
        action: 'USER_DELETED',
        target: deletedUser.id,
        details: `Deleted user: ${deletedUser.email}`,
        userId: req.user.id
      }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    // Note: Deleting a user with existing foreign keys (projects) might fail unless Cascade is configured.
    // For this prototype, we'll return a generic error if that happens.
    res.status(500).json({ error: 'Failed to delete user. They may have dependent records.' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, password } = req.body;

    const data = {
      name,
      email,
      role: role?.toLowerCase(),
      department,
    };

    if (password && password.trim() !== '') {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data
    });

    await prisma.auditLog.create({
      data: {
        action: 'USER_UPDATED',
        target: id,
        details: `Updated user info for: ${email}`,
        userId: req.user.id
      }
    });

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};
