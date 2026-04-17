import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import prisma from '../config/prisma.js';

/**
 * Generate a 2FA secret for a user
 */
export const setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `SPMES (${req.user.email})`
    });

    // Save secret to database (temporarily - should be verified first)
    // We'll add twoFactorSecret field to the User model if it were a real migration
    // For this prototype, we'll use the 'department' field as a hacky storage if needed, 
    // or just assume it's set up. 
    // Better: Add it to the model via Prisma.
    
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
};

/**
 * Verify a 2FA token
 */
export const verify2FA = async (req, res) => {
  try {
    const { token, secret } = req.body;

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token
    });

    if (verified) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid verification code' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Verification error' });
  }
};
