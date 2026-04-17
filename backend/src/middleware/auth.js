import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

/**
 * Middleware to verify JWT and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token; // Fallback for SSE EventSource
    }

    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, department: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware for Role-Based Access Control
 * @param {string[]} allowedRoles - Array of roles permitted to access the route
 */
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role?.toUpperCase().trim();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase().trim());

    console.log(`[RBAC] User: ${req.user.email}, Role: ${userRole}, Allowed: ${normalizedAllowedRoles}`);

    if (!normalizedAllowedRoles.includes(userRole)) {
      console.warn(`[RBAC] ACCESS DENIED for ${req.user.email}. Role '${userRole}' not in [${normalizedAllowedRoles}]`);
      return res.status(403).json({ 
        error: `Access denied: insufficient permissions.`,
        required: normalizedAllowedRoles,
        actual: userRole
      });
    }

    next();
  };
};

/**
 * Contextual Middleware: Verifies if the authenticated lecturer is assigned to the target project.
 * Expects project ID in req.params.id or req.params.projectId
 */
export const verifyLecturerOwnsProject = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') return next(); // Admins can bypass

    const projectId = req.params.id || req.params.projectId;
    if (!projectId) return res.status(400).json({ error: 'Project ID is required for verification' });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { lecturerId: true }
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.lecturerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You are not assigned to evaluate this project.' });
    }

    next();
  } catch (error) {
    console.error('Project Ownership Verifier Error:', error);
    res.status(500).json({ error: 'Internal server error during authorization checks' });
  }
};
