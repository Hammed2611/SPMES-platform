import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, department } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, department }
    });

    res.json({ message: 'Profile updated', user: { name: updatedUser.name, department: updatedUser.department } });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect old password' });
    }

    if (newPassword.length < 6) {
       return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNew }
    });

    await prisma.auditLog.create({
      data: {
        action: 'PASSWORD_CHANGED',
        target: userId,
        userId: userId,
        details: 'User completely changed their password'
      }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
