/**
 * Database Utility for VolunteerHub
 *
 * Provides persistent storage using IndexedDB with localStorage fallback.
 * This module implements a database-independent data access layer following
 * OOP principles as per project requirements.
 *
 * Key Features:
 * - Object-oriented design with singleton pattern
 * - Database-independent operations through abstraction
 * - Indexed access for optimized queries
 * - Graceful fallback to localStorage if IndexedDB unavailable
 *
 * Architecture:
 * - Uses IndexedDB for client-side persistent storage
 * - Implements generic CRUD operations for all entities
 * - Supports indexed queries (by email, userId, eventId, etc.)
 *
 * @module utils/database
 */

// Database configuration
const DB_NAME = 'VolunteerHubDB';
const DB_VERSION = 1;
const STORES = {
  USERS: 'users',
  EVENTS: 'events',
  REGISTRATIONS: 'registrations',
  NOTIFICATIONS: 'notifications',
  PASSWORD_HASHES: 'password_hashes'
};

// Type definitions
interface DBStore {
  name: string;
  keyPath: string;
  indexes?: Array<{ name: string; keyPath: string; unique: boolean }>;
}

const STORE_CONFIGS: DBStore[] = [
  {
    name: STORES.USERS,
    keyPath: 'id',
    indexes: [
      { name: 'email', keyPath: 'email', unique: true }
    ]
  },
  {
    name: STORES.EVENTS,
    keyPath: 'id',
    indexes: [
      { name: 'status', keyPath: 'status', unique: false },
      { name: 'date', keyPath: 'date', unique: false }
    ]
  },
  {
    name: STORES.REGISTRATIONS,
    keyPath: 'id',
    indexes: [
      { name: 'userId', keyPath: 'userId', unique: false },
      { name: 'eventId', keyPath: 'eventId', unique: false }
    ]
  },
  {
    name: STORES.NOTIFICATIONS,
    keyPath: 'id',
    indexes: [
      { name: 'userId', keyPath: 'userId', unique: false },
      { name: 'read', keyPath: 'read', unique: false }
    ]
  },
  {
    name: STORES.PASSWORD_HASHES,
    keyPath: 'email',
    indexes: []
  }
];

/**
 * Main Database class using IndexedDB
 */
class IndexedDatabase {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the database
   */
  public async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('[Database] IndexedDB not available, will use localStorage fallback');
        reject(new Error('IndexedDB not available'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[Database] Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[Database] IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        STORE_CONFIGS.forEach(config => {
          if (!db.objectStoreNames.contains(config.name)) {
            const store = db.createObjectStore(config.name, { keyPath: config.keyPath });

            // Create indexes
            config.indexes?.forEach(index => {
              store.createIndex(index.name, index.keyPath, { unique: index.unique });
            });

            console.log(`[Database] Created object store: ${config.name}`);
          }
        });
      };
    });

    return this.initPromise;
  }

  /**
   * Get all records from a store
   */
  public async getAll<T>(storeName: string): Promise<T[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a single record by key
   */
  public async get<T>(storeName: string, key: number | string): Promise<T | undefined> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get records by index
   */
  public async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add a new record
   */
  public async add<T>(storeName: string, data: T): Promise<number | string> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result as number | string);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update an existing record
   */
  public async put<T>(storeName: string, data: T): Promise<number | string> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result as number | string);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a record
   */
  public async delete(storeName: string, key: number | string): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all records from a store
   */
  public async clear(storeName: string): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Count records in a store
   */
  public async count(storeName: string): Promise<number> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * LocalStorage fallback for browsers without IndexedDB
 */
class LocalStorageDatabase {
  private prefix = 'volunteerhub_';

  private getKey(storeName: string): string {
    return `${this.prefix}${storeName}`;
  }

  public async init(): Promise<void> {
    console.log('[Database] Using localStorage fallback');
    return Promise.resolve();
  }

  public async getAll<T>(storeName: string): Promise<T[]> {
    const key = this.getKey(storeName);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  public async get<T>(storeName: string, id: number | string): Promise<T | undefined> {
    const all = await this.getAll<any>(storeName);
    return all.find((item: any) => item.id === id);
  }

  public async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    const all = await this.getAll<any>(storeName);
    return all.filter((item: any) => item[indexName] === value);
  }

  public async add<T>(storeName: string, data: T): Promise<number | string> {
    const all = await this.getAll<any>(storeName);
    all.push(data);
    localStorage.setItem(this.getKey(storeName), JSON.stringify(all));
    return (data as any).id;
  }

  public async put<T>(storeName: string, data: T): Promise<number | string> {
    const all = await this.getAll<any>(storeName);
    const index = all.findIndex((item: any) => item.id === (data as any).id || item.email === (data as any).email);

    if (index >= 0) {
      all[index] = data;
    } else {
      all.push(data);
    }

    localStorage.setItem(this.getKey(storeName), JSON.stringify(all));
    return (data as any).id || (data as any).email;
  }

  public async delete(storeName: string, id: number | string): Promise<void> {
    const all = await this.getAll<any>(storeName);
    const filtered = all.filter((item: any) => item.id !== id && item.email !== id);
    localStorage.setItem(this.getKey(storeName), JSON.stringify(filtered));
  }

  public async clear(storeName: string): Promise<void> {
    localStorage.removeItem(this.getKey(storeName));
  }

  public async count(storeName: string): Promise<number> {
    const all = await this.getAll(storeName);
    return all.length;
  }
}

/**
 * Database Manager - Singleton pattern
 * Automatically uses IndexedDB or localStorage fallback
 */
class DatabaseManager {
  private static instance: DatabaseManager;
  private db: IndexedDatabase | LocalStorageDatabase;
  private isIndexedDB: boolean = true;

  private constructor() {
    this.db = new IndexedDatabase();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize the database (call this on app startup)
   */
  public async init(): Promise<void> {
    try {
      await this.db.init();
      this.isIndexedDB = true;
    } catch (error) {
      console.warn('[Database] IndexedDB failed, using localStorage fallback');
      this.db = new LocalStorageDatabase();
      await this.db.init();
      this.isIndexedDB = false;
    }
  }

  /**
   * Get database type
   */
  public getType(): string {
    return this.isIndexedDB ? 'IndexedDB' : 'localStorage';
  }

  /**
   * User operations
   */
  public async getAllUsers<T>(): Promise<T[]> {
    return this.db.getAll<T>(STORES.USERS);
  }

  public async getUser<T>(id: number): Promise<T | undefined> {
    return this.db.get<T>(STORES.USERS, id);
  }

  public async getUserByEmail<T>(email: string): Promise<T | undefined> {
    if (this.isIndexedDB) {
      const users = await this.db.getByIndex<T>(STORES.USERS, 'email', email);
      return users[0];
    } else {
      const all = await this.db.getAll<any>(STORES.USERS);
      return all.find((u: any) => u.email === email);
    }
  }

  public async addUser<T>(user: T): Promise<number | string> {
    return this.db.add(STORES.USERS, user);
  }

  public async updateUser<T>(user: T): Promise<number | string> {
    return this.db.put(STORES.USERS, user);
  }

  public async deleteUser(id: number): Promise<void> {
    return this.db.delete(STORES.USERS, id);
  }

  /**
   * Event operations
   */
  public async getAllEvents<T>(): Promise<T[]> {
    return this.db.getAll<T>(STORES.EVENTS);
  }

  public async getEvent<T>(id: number): Promise<T | undefined> {
    return this.db.get<T>(STORES.EVENTS, id);
  }

  public async addEvent<T>(event: T): Promise<number | string> {
    return this.db.add(STORES.EVENTS, event);
  }

  public async updateEvent<T>(event: T): Promise<number | string> {
    return this.db.put(STORES.EVENTS, event);
  }

  public async deleteEvent(id: number): Promise<void> {
    return this.db.delete(STORES.EVENTS, id);
  }

  /**
   * Registration operations
   */
  public async getAllRegistrations<T>(): Promise<T[]> {
    return this.db.getAll<T>(STORES.REGISTRATIONS);
  }

  public async getRegistration<T>(id: number): Promise<T | undefined> {
    return this.db.get<T>(STORES.REGISTRATIONS, id);
  }

  public async getRegistrationsByUser<T>(userId: number): Promise<T[]> {
    if (this.isIndexedDB) {
      return this.db.getByIndex<T>(STORES.REGISTRATIONS, 'userId', userId);
    } else {
      const all = await this.db.getAll<any>(STORES.REGISTRATIONS);
      return all.filter((r: any) => r.userId === userId);
    }
  }

  public async getRegistrationsByEvent<T>(eventId: number): Promise<T[]> {
    if (this.isIndexedDB) {
      return this.db.getByIndex<T>(STORES.REGISTRATIONS, 'eventId', eventId);
    } else {
      const all = await this.db.getAll<any>(STORES.REGISTRATIONS);
      return all.filter((r: any) => r.eventId === eventId);
    }
  }

  public async addRegistration<T>(registration: T): Promise<number | string> {
    return this.db.add(STORES.REGISTRATIONS, registration);
  }

  public async updateRegistration<T>(registration: T): Promise<number | string> {
    return this.db.put(STORES.REGISTRATIONS, registration);
  }

  public async deleteRegistration(id: number): Promise<void> {
    return this.db.delete(STORES.REGISTRATIONS, id);
  }

  /**
   * Notification operations
   */
  public async getAllNotifications<T>(): Promise<T[]> {
    return this.db.getAll<T>(STORES.NOTIFICATIONS);
  }

  public async getNotification<T>(id: number): Promise<T | undefined> {
    return this.db.get<T>(STORES.NOTIFICATIONS, id);
  }

  public async getNotificationsByUser<T>(userId: number): Promise<T[]> {
    if (this.isIndexedDB) {
      return this.db.getByIndex<T>(STORES.NOTIFICATIONS, 'userId', userId);
    } else {
      const all = await this.db.getAll<any>(STORES.NOTIFICATIONS);
      return all.filter((n: any) => n.userId === userId);
    }
  }

  public async addNotification<T>(notification: T): Promise<number | string> {
    return this.db.add(STORES.NOTIFICATIONS, notification);
  }

  public async updateNotification<T>(notification: T): Promise<number | string> {
    return this.db.put(STORES.NOTIFICATIONS, notification);
  }

  public async deleteNotification(id: number): Promise<void> {
    return this.db.delete(STORES.NOTIFICATIONS, id);
  }

  /**
   * Password hash operations
   */
  public async getPasswordHash(email: string): Promise<string | undefined> {
    const result = await this.db.get<any>(STORES.PASSWORD_HASHES, email);
    return result?.hash;
  }

  public async setPasswordHash(email: string, hash: string): Promise<void> {
    await this.db.put(STORES.PASSWORD_HASHES, { email, hash });
  }

  public async deletePasswordHash(email: string): Promise<void> {
    await this.db.delete(STORES.PASSWORD_HASHES, email);
  }

  /**
   * Utility operations
   */
  public async clearAll(): Promise<void> {
    await Promise.all(
      Object.values(STORES).map(store => this.db.clear(store))
    );
  }

  public async getStats(): Promise<{
    users: number;
    events: number;
    registrations: number;
    notifications: number;
  }> {
    const [users, events, registrations, notifications] = await Promise.all([
      this.db.count(STORES.USERS),
      this.db.count(STORES.EVENTS),
      this.db.count(STORES.REGISTRATIONS),
      this.db.count(STORES.NOTIFICATIONS)
    ]);

    return { users, events, registrations, notifications };
  }
}

// Export singleton instance
export const db = DatabaseManager.getInstance();
export { STORES };
