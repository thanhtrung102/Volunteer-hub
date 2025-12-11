class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public getPermission(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return 'denied';
    }
    const permission = await Notification.requestPermission();
    return permission;
  }

  // Simulate Web Push Subscription process
  public async subscribeToPushNotifications(): Promise<boolean> {
     // In a real application, this would involve:
     // 1. Registering a Service Worker
     // 2. Calling registration.pushManager.subscribe() with applicationServerKey (VAPID)
     // 3. Sending the subscription object to the backend
     
     if ('serviceWorker' in navigator) {
        try {
            console.log("Simulating Web Push Subscription sequence...");
            // Simulating network delay for subscription
            await new Promise(resolve => setTimeout(resolve, 800)); 
            console.log("Subscribed to push notifications successfully!");
            return true;
        } catch (error) {
            console.error("Push subscription failed", error);
            return false;
        }
     }
     return false;
  }

  public notify(title: string, body: string, icon: string = '/vite.svg') {
     if (Notification.permission === 'granted') {
         // In a real PWA with Web Push, this would be handled by the Service Worker's 'push' event listener.
         // Here we simulate the result of that event by directly creating a notification.
         try {
            new Notification(title, {
                body,
                icon,
                badge: icon,
                tag: 'volunteer-hub-notification', // Group notifications
            });
         } catch (e) {
             console.error("Notification creation failed", e);
         }
     }
  }
}

export const notificationService = NotificationService.getInstance();