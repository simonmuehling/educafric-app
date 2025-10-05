import { storage } from '../storage';
import { NotFoundError, type UpdateProfile } from '@shared/types';

export class ProfileService {
  static async getProfile(userId: number) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const { password: _, passwordResetToken: __, passwordResetExpiry: ___, ...profile } = user;
    return profile;
  }

  static async updateProfile(userId: number, profileData: UpdateProfile) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const updatedUser = await storage.updateUser(userId, {
      ...profileData,
      updatedAt: new Date(),
    });

    const { password: _, passwordResetToken: __, passwordResetExpiry: ___, ...profile } = updatedUser;
    return profile;
  }

  static async uploadProfilePicture(userId: number, imageUrl: string) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const updatedUser = await storage.updateUser(userId, {
      profilePictureUrl: imageUrl,
      updatedAt: new Date(),
    });

    return { profilePictureUrl: updatedUser.profilePictureUrl };
  }

  static async deleteAccount(userId: number) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Soft delete by marking as inactive
    await storage.updateUser(userId, {
      email: `deleted_${Date.now()}_${user.email}`,
      subscriptionStatus: 'cancelled',
      updatedAt: new Date(),
    });

    return { message: 'Account deleted successfully' };
  }
}