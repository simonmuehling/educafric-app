import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { storage } from '../storage';
import { validatePhoneNumber } from '../utils/phoneValidation';
import { 
  NotFoundError, 
  ConflictError, 
  UnauthorizedError,
  type CreateUser,
  type LoginRequest,
  type ChangePassword,
  type PasswordResetRequest,
  type PasswordReset 
} from '@shared/types';

export class AuthService {
  static async register(userData: CreateUser) {
    // Check if user exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    // Validate phone number uniqueness (if provided)
    if (userData.phone) {
      const phoneValidation = await validatePhoneNumber(userData.phone);
      if (!phoneValidation.isValid) {
        throw new ConflictError(phoneValidation.message || 'Invalid phone number');
      }
    }

    // Validate WhatsApp number uniqueness (if provided)
    if (userData.whatsappNumber) {
      const whatsappValidation = await validatePhoneNumber(userData.whatsappNumber);
      if (!whatsappValidation.isValid) {
        throw new ConflictError(`WhatsApp number validation failed: ${whatsappValidation.message}`);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
      schoolId: userData.schoolId || 1, // Default school
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async login(credentials: LoginRequest) {
    const user = await storage.getUserByEmail(credentials.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await storage.updateUser(user.id, { lastLoginAt: new Date() });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async requestPasswordReset(request: PasswordResetRequest) {
    const user = await storage.getUserByEmail(request.email);
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If email exists, reset instructions have been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    await storage.updateUser(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpiry: resetExpiry,
    });

    // TODO: Send email with reset link
    // For now, return token (in production, only send email)
    return { 
      message: 'Reset instructions sent to email',
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    };
  }

  static async resetPassword(resetData: PasswordReset) {
    const user = await storage.getUserByPasswordResetToken(resetData.token);
    if (!user || !user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(resetData.password, 12);

    await storage.updateUser(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
    });

    return { message: 'Password reset successful' };
  }

  static async changePassword(userId: number, passwordData: ChangePassword) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const isValidPassword = await bcrypt.compare(passwordData.currentPassword, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(passwordData.newPassword, 12);
    await storage.updateUser(userId, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  }
}