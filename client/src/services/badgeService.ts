/**
 * PWA Badge Service
 * Manages app icon badge notifications for unread counts
 * Works on Android Chrome, Edge, and other supporting browsers
 */

class BadgeService {
  private static instance: BadgeService;
  private isSupported: boolean = false;
  private currentCount: number = 0;

  private constructor() {
    this.checkSupport();
  }

  public static getInstance(): BadgeService {
    if (!BadgeService.instance) {
      BadgeService.instance = new BadgeService();
    }
    return BadgeService.instance;
  }

  /**
   * Check if Badge API is supported on this device
   */
  private checkSupport(): void {
    this.isSupported = 'setAppBadge' in navigator && 'clearAppBadge' in navigator;
    
    if (this.isSupported) {
      console.log('[BADGE_SERVICE] ✅ Badge API supported on this device');
    } else {
      console.log('[BADGE_SERVICE] ⚠️ Badge API not supported on this device');
    }
  }

  /**
   * Set the badge count on the app icon
   * @param count Number of unread notifications (0 to clear)
   */
  public async setBadge(count: number): Promise<void> {
    if (!this.isSupported) {
      console.log('[BADGE_SERVICE] Badge API not supported - skipping');
      return;
    }

    try {
      this.currentCount = count;

      if (count === 0) {
        // Clear the badge when count is 0
        await (navigator as any).clearAppBadge();
        console.log('[BADGE_SERVICE] ✅ Badge cleared');
      } else {
        // Set the badge with the count
        await (navigator as any).setAppBadge(count);
        console.log(`[BADGE_SERVICE] ✅ Badge set to ${count}`);
      }
    } catch (error) {
      console.error('[BADGE_SERVICE] ❌ Failed to set badge:', error);
    }
  }

  /**
   * Clear the badge completely
   */
  public async clearBadge(): Promise<void> {
    await this.setBadge(0);
  }

  /**
   * Increment the badge count
   * @param amount Amount to increment by (default 1)
   */
  public async incrementBadge(amount: number = 1): Promise<void> {
    const newCount = this.currentCount + amount;
    await this.setBadge(newCount);
  }

  /**
   * Decrement the badge count
   * @param amount Amount to decrement by (default 1)
   */
  public async decrementBadge(amount: number = 1): Promise<void> {
    const newCount = Math.max(0, this.currentCount - amount);
    await this.setBadge(newCount);
  }

  /**
   * Get current badge count
   */
  public getCurrentCount(): number {
    return this.currentCount;
  }

  /**
   * Check if Badge API is supported
   */
  public isBadgeSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Sync badge with server unread count
   * @param unreadCount Server unread notification count
   */
  public async syncWithServer(unreadCount: number): Promise<void> {
    console.log(`[BADGE_SERVICE] 🔄 Syncing badge with server: ${unreadCount} unread`);
    await this.setBadge(unreadCount);
  }
}

// Export singleton instance
const badgeService = BadgeService.getInstance();
export default badgeService;
