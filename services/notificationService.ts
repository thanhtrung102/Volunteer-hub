interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationService {
  private static instance: NotificationService;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;

  private constructor() {
    this.initializeServiceWorker();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize and register the Service Worker
   */
  private async initializeServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers are not supported in this browser');
      return;
    }

    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[NotificationService] Service Worker registered:', registration.scope);
      this.swRegistration = registration;

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('[NotificationService] Service Worker is ready');

      // Check for existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        this.pushSubscription = existingSubscription;
        console.log('[NotificationService] Existing push subscription found');
      }

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('[NotificationService] New Service Worker found');

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[NotificationService] New Service Worker installed, update available');
            }
          });
        }
      });

    } catch (error) {
      console.error('[NotificationService] Service Worker registration failed:', error);
    }
  }

  public getPermission(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return 'denied';
    }
    const permission = await Notification.requestPermission();
    console.log('[NotificationService] Permission status:', permission);
    return permission;
  }

  /**
   * Subscribe to Web Push Notifications with VAPID
   * In production, you would:
   * 1. Generate VAPID keys on your server
   * 2. Use the public key here
   * 3. Send the subscription to your backend
   */
  public async subscribeToPushNotifications(): Promise<boolean> {
     if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications are not supported in this browser');
        return false;
     }

     try {
        // Ensure service worker is registered
        if (!this.swRegistration) {
          await new Promise(resolve => setTimeout(resolve, 500));
          this.swRegistration = await navigator.serviceWorker.ready;
        }

        // Request notification permission if not granted
        if (Notification.permission !== 'granted') {
          const permission = await this.requestPermission();
          if (permission !== 'granted') {
            console.log('[NotificationService] Notification permission denied');
            return false;
          }
        }

        // Check if already subscribed
        const existingSubscription = await this.swRegistration.pushManager.getSubscription();
        if (existingSubscription) {
          this.pushSubscription = existingSubscription;
          console.log('[NotificationService] Already subscribed to push notifications');
          return true;
        }

        // VAPID public key (In production, this would be your actual VAPID public key)
        // For demo purposes, we'll use a dummy key
        // To generate real VAPID keys, use: npx web-push generate-vapid-keys
        const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrLcK0IcLDz7JqBzqgCEZzW7SbODu8h8_K5KQGqV1xNTdvH8oU8';

        // Convert VAPID key from base64 to Uint8Array
        const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey);

        // Subscribe to push notifications
        const subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true, // Required: all pushes must show a notification
          applicationServerKey: convertedVapidKey
        });

        this.pushSubscription = subscription;

        // In production, send this subscription to your backend server
        const subscriptionJSON = subscription.toJSON();
        console.log('[NotificationService] Push subscription created:', subscriptionJSON);

        // Store subscription in localStorage (in production, send to backend)
        this.saveSubscription(subscriptionJSON);

        console.log('[NotificationService] Successfully subscribed to push notifications');
        return true;

     } catch (error) {
        console.error('[NotificationService] Push subscription failed:', error);
        return false;
     }
  }

  /**
   * Convert base64 VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Save subscription to localStorage (in production, send to backend)
   */
  private saveSubscription(subscription: PushSubscriptionJSON): void {
    localStorage.setItem('pushSubscription', JSON.stringify(subscription));
    console.log('[NotificationService] Subscription saved to localStorage');
  }

  /**
   * Get stored subscription
   */
  public getStoredSubscription(): PushSubscriptionJSON | null {
    const stored = localStorage.getItem('pushSubscription');
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Unsubscribe from push notifications
   */
  public async unsubscribe(): Promise<boolean> {
    try {
      if (this.pushSubscription) {
        await this.pushSubscription.unsubscribe();
        this.pushSubscription = null;
        localStorage.removeItem('pushSubscription');
        console.log('[NotificationService] Unsubscribed from push notifications');
        return true;
      }
      return false;
    } catch (error) {
      console.error('[NotificationService] Unsubscribe failed:', error);
      return false;
    }
  }

  /**
   * Send a notification via the Service Worker
   * This method uses the Service Worker's messaging API to show notifications
   */
  public async notify(title: string, body: string, icon: string = 'https://cdn-icons-png.flaticon.com/128/18891/18891286.png', tag: string = 'volunteer-hub-notification'): Promise<void> {
     if (Notification.permission !== 'granted') {
         console.warn('[NotificationService] Notification permission not granted');
         return;
     }

     try {
        if (this.swRegistration && this.swRegistration.active) {
          // Send message to service worker to show notification
          this.swRegistration.active.postMessage({
            type: 'SHOW_NOTIFICATION',
            payload: {
              title,
              body,
              icon,
              tag
            }
          });
          console.log('[NotificationService] Notification sent via Service Worker');
        } else {
          // Fallback: show notification directly if service worker not available
          new Notification(title, {
              body,
              icon,
              badge: icon,
              tag,
          });
          console.log('[NotificationService] Notification shown directly (fallback)');
        }
     } catch (e) {
         console.error('[NotificationService] Notification creation failed:', e);
     }
  }

  /**
   * Simulate receiving a push notification (for demo purposes)
   * In production, pushes would come from your backend server
   */
  public async simulatePushNotification(title: string, body: string): Promise<void> {
    if (!this.swRegistration) {
      console.warn('[NotificationService] Service Worker not registered');
      return;
    }

    // Use the notify method which goes through the service worker
    await this.notify(title, body);
    console.log('[NotificationService] Simulated push notification sent');
  }

  /**
   * Check if push notifications are supported
   */
  public isPushSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Get current subscription status
   */
  public async getSubscriptionStatus(): Promise<{
    isSubscribed: boolean;
    subscription: PushSubscription | null;
  }> {
    if (!this.swRegistration) {
      return { isSubscribed: false, subscription: null };
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      return {
        isSubscribed: !!subscription,
        subscription
      };
    } catch (error) {
      console.error('[NotificationService] Failed to get subscription status:', error);
      return { isSubscribed: false, subscription: null };
    }
  }
}

export const notificationService = NotificationService.getInstance();