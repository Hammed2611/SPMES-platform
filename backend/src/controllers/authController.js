import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

/**
 * Handle user login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        userId: user.id,
        details: `User logged in from ${req.ip}`
      }
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

/**
 * Handle self-registration for students and lecturers
 * Admins can only be created via the Admin Portal
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, department, matricNumber, staffId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    // Prevent self-registration as admin
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === 'admin') {
      return res.status(403).json({ error: 'Admin accounts must be created by an administrator' });
    }

    if (!['student', 'lecturer'].includes(normalizedRole)) {
      return res.status(400).json({ error: 'Role must be either "student" or "lecturer"' });
    }

    if (normalizedRole === 'student' && !matricNumber) {
      return res.status(400).json({ error: 'Matriculation number is required for students' });
    }
    
    if (normalizedRole === 'lecturer' && !staffId) {
      return res.status(400).json({ error: 'Staff ID is required for lecturers' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check uniqueness constraints
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    if (normalizedRole === 'student') {
      const existingMatric = await prisma.user.findUnique({ where: { matricNumber } });
      if (existingMatric) return res.status(409).json({ error: 'Matriculation number is already registered' });
    } else {
      const existingStaff = await prisma.user.findUnique({ where: { staffId } });
      if (existingStaff) return res.status(409).json({ error: 'Staff ID is already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate avatar initials from name
    const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: normalizedRole,
        department: department?.trim() || null,
        avatar: initials,
        matricNumber: normalizedRole === 'student' ? matricNumber.trim() : null,
        staffId: normalizedRole === 'lecturer' ? staffId.trim() : null,
      }
    });

    // Log the registration
    await prisma.auditLog.create({
      data: {
        action: 'USER_REGISTERED',
        userId: user.id,
        target: user.id,
        details: `New ${normalizedRole} account registered: ${email}`
      }
    });

    // Auto-login: generate token on successful registration
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

/**
 * Get current authenticated user details
 */
export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

/**
 * Password Reset via Role ID Verification
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, role, idNumber, newPassword } = req.body;
    
    if (!email || !role || !idNumber || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const normalizedRole = role.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user || user.role !== normalizedRole) {
      return res.status(404).json({ error: 'User not found or role mismatch' });
    }

    // Verify ID matches the stored ID for that role
    let isValid = false;
    if (normalizedRole === 'student' && user.matricNumber === idNumber.trim()) {
      isValid = true;
    } else if (normalizedRole === 'lecturer' && user.staffId === idNumber.trim()) {
      isValid = true;
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Identity verification failed. ID does not match records.' });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    await prisma.auditLog.create({
      data: {
        action: 'PASSWORD_RESET',
        userId: user.id,
        target: user.id,
        details: 'User reset password via ID verification flow'
      }
    });

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error during password reset' });
  }
};
