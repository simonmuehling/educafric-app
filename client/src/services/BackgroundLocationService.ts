import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { registerPlugin } from '@capacitor/core';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  speed?: number;
  bearing?: number;
  altitude?: number;
}

class BackgroundLocationService {
  private watcherId: string | null = null;
  private isRunning = false;
  private serverEndpoint = '/api/student/geolocation/update-location';
  private updateInterval = 60000; // Send every 60 seconds
  private lastSentTime = 0;

  async startTracking(): Promise<boolean> {
    if (this.isRunning) {
      console.log('[BG_LOCATION] Already tracking');
      return true;
    }

    try {
      console.log('[BG_LOCATION] Starting background location tracking...');

      this.watcherId = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: "Educafric suit votre position pour votre sécurité",
          backgroundTitle: "Suivi de sécurité actif",
          requestPermissions: true,
          stale: false,
          distanceFilter: 50 // Minimum 50 meters between updates
        },
        (location, error) => {
          if (error) {
            if (error.code === "NOT_AUTHORIZED") {
              console.error('[BG_LOCATION] Permission denied');
              this.handlePermissionDenied();
            } else {
              console.error('[BG_LOCATION] Error:', error.message);
            }
            return;
          }

          if (location) {
            this.handleLocationUpdate({
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy,
              timestamp: new Date().toISOString(),
              speed: location.speed || undefined,
              bearing: location.bearing || undefined,
              altitude: location.altitude || undefined
            });
          }
        }
      );

      this.isRunning = true;
      console.log('[BG_LOCATION] ✅ Background tracking started, watcher ID:', this.watcherId);
      return true;
    } catch (error) {
      console.error('[BG_LOCATION] Failed to start tracking:', error);
      return false;
    }
  }

  async stopTracking(): Promise<void> {
    if (!this.isRunning || !this.watcherId) {
      console.log('[BG_LOCATION] Not currently tracking');
      return;
    }

    try {
      await BackgroundGeolocation.removeWatcher({ id: this.watcherId });
      this.watcherId = null;
      this.isRunning = false;
      console.log('[BG_LOCATION] ✅ Background tracking stopped');
    } catch (error) {
      console.error('[BG_LOCATION] Failed to stop tracking:', error);
    }
  }

  private async handleLocationUpdate(location: LocationUpdate): Promise<void> {
    const now = Date.now();
    
    // Throttle updates to every 60 seconds to save battery
    if (now - this.lastSentTime < this.updateInterval) {
      console.log('[BG_LOCATION] Throttled update, waiting...');
      return;
    }

    console.log('[BG_LOCATION] 📍 New location:', {
      lat: location.latitude.toFixed(6),
      lng: location.longitude.toFixed(6),
      accuracy: Math.round(location.accuracy)
    });

    try {
      const response = await fetch(this.serverEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: location.timestamp,
          speed: location.speed,
          bearing: location.bearing,
          altitude: location.altitude,
          source: 'background'
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.lastSentTime = now;
        console.log('[BG_LOCATION] ✅ Position sent to server:', data.message);

        // Check if any alerts were created
        if (data.alerts && data.alerts.length > 0) {
          console.log('[BG_LOCATION] 🚨 Zone exit alerts created:', data.alerts.length);
        }
      } else {
        console.error('[BG_LOCATION] ❌ Server error:', response.status);
      }
    } catch (error) {
      console.error('[BG_LOCATION] ❌ Network error:', error);
      // Store for later sync when network is available
      this.storeOfflineLocation(location);
    }
  }

  private handlePermissionDenied(): void {
    console.log('[BG_LOCATION] User denied location permission');
    // Could trigger a notification to parent about disabled tracking
  }

  private storeOfflineLocation(location: LocationUpdate): void {
    // Store location in localStorage for later sync
    try {
      const offlineLocations = JSON.parse(localStorage.getItem('offlineLocations') || '[]');
      offlineLocations.push(location);
      // Keep only last 100 locations
      if (offlineLocations.length > 100) {
        offlineLocations.shift();
      }
      localStorage.setItem('offlineLocations', JSON.stringify(offlineLocations));
      console.log('[BG_LOCATION] Stored offline location for later sync');
    } catch (error) {
      console.error('[BG_LOCATION] Failed to store offline location:', error);
    }
  }

  async syncOfflineLocations(): Promise<void> {
    try {
      const offlineLocations = JSON.parse(localStorage.getItem('offlineLocations') || '[]');
      if (offlineLocations.length === 0) return;

      console.log('[BG_LOCATION] Syncing', offlineLocations.length, 'offline locations...');

      for (const location of offlineLocations) {
        await this.handleLocationUpdate(location);
      }

      localStorage.removeItem('offlineLocations');
      console.log('[BG_LOCATION] ✅ Offline locations synced');
    } catch (error) {
      console.error('[BG_LOCATION] Failed to sync offline locations:', error);
    }
  }

  isTracking(): boolean {
    return this.isRunning;
  }

  getWatcherId(): string | null {
    return this.watcherId;
  }
}

export const backgroundLocationService = new BackgroundLocationService();
export default backgroundLocationService;
