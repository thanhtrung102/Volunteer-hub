# Database Backup Guide for VolunteerHub

## Overview
This document provides instructions for backing up and restoring the VolunteerHub database for submission and demonstration purposes.

## Database Technology
- **Storage**: IndexedDB (Browser-based NoSQL database)
- **Database Name**: `VolunteerHubDB`
- **Version**: 1

## Database Schema

### Object Stores
1. **users** - Stores user account information
   - Key: `id` (auto-increment)
   - Indexes: `email` (unique)

2. **events** - Stores volunteer events
   - Key: `id` (auto-increment)
   - Indexes: `status`, `createdBy`

3. **registrations** - Stores event registrations
   - Key: `id` (auto-increment)
   - Indexes: `userId`, `eventId`, `status`

4. **posts** - Stores community posts
   - Key: `id` (auto-increment)
   - Indexes: `authorId`, `createdAt`

5. **comments** - Stores post comments
   - Key: `id` (auto-increment)
   - Indexes: `postId`, `authorId`

## Current Database Contents (2026 Data)

### Users
- 1 Admin account
- 2 Manager accounts
- 101 Volunteer accounts (1 main + 100 generated)

### Events
- 11 volunteer events scheduled for June-July 2026
- Categories: Environment, Education, Community, Health, Crisis Support, Administrative

### Registrations
- 90 registrations across 4 events
- Mix of CONFIRMED and PENDING statuses

## Backup Methods

### Method 1: Export Database via Browser Console

Run this script in the browser console (F12) to export the database:

```javascript
// Export VolunteerHub Database
async function exportDatabase() {
  const dbName = 'VolunteerHubDB';
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const storeNames = ['users', 'events', 'registrations', 'posts', 'comments'];
  const backup = { version: db.version, stores: {} };

  for (const storeName of storeNames) {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const data = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    backup.stores[storeName] = data;
  }

  db.close();

  // Download as JSON file
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `volunteerhub-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  console.log('Database exported successfully!');
  return backup;
}

// Run the export
exportDatabase();
```

### Method 2: Reset to Default Mock Data

To restore the database to the default state with 2026 events:

```javascript
// Clear and reinitialize database
localStorage.clear();
indexedDB.deleteDatabase('VolunteerHubDB');
location.reload();
```

The application will automatically seed the database with mock data from `mockData.ts`.

## Restore from Backup

To restore a previously exported backup:

```javascript
async function importDatabase(backupData) {
  // First, clear existing database
  await new Promise((resolve) => {
    const deleteRequest = indexedDB.deleteDatabase('VolunteerHubDB');
    deleteRequest.onsuccess = resolve;
    deleteRequest.onerror = resolve;
  });

  // Create new database
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('VolunteerHubDB', backupData.version || 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('email', 'email', { unique: true });
      }

      if (!db.objectStoreNames.contains('events')) {
        const eventStore = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
        eventStore.createIndex('status', 'status');
        eventStore.createIndex('createdBy', 'createdBy');
      }

      if (!db.objectStoreNames.contains('registrations')) {
        const regStore = db.createObjectStore('registrations', { keyPath: 'id', autoIncrement: true });
        regStore.createIndex('userId', 'userId');
        regStore.createIndex('eventId', 'eventId');
        regStore.createIndex('status', 'status');
      }

      if (!db.objectStoreNames.contains('posts')) {
        const postStore = db.createObjectStore('posts', { keyPath: 'id', autoIncrement: true });
        postStore.createIndex('authorId', 'authorId');
        postStore.createIndex('createdAt', 'createdAt');
      }

      if (!db.objectStoreNames.contains('comments')) {
        const commentStore = db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
        commentStore.createIndex('postId', 'postId');
        commentStore.createIndex('authorId', 'authorId');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // Import data
  for (const [storeName, data] of Object.entries(backupData.stores)) {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    for (const item of data) {
      await new Promise((resolve, reject) => {
        const request = store.add(item);
        request.onsuccess = resolve;
        request.onerror = resolve; // Continue on error
      });
    }
  }

  db.close();
  console.log('Database imported successfully!');
  location.reload();
}

// Usage: Load your backup JSON file content into backupData variable, then:
// importDatabase(backupData);
```

## Verification Steps

After backup or restore, verify the database contents:

```javascript
async function verifyDatabase() {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('VolunteerHubDB');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const stats = {};
  const storeNames = ['users', 'events', 'registrations', 'posts', 'comments'];

  for (const storeName of storeNames) {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const count = await new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    stats[storeName] = count;
  }

  db.close();
  console.table(stats);
  return stats;
}

// Run verification
verifyDatabase();
```

Expected output:
```
┌───────────────┬───────┐
│   (index)     │ Values│
├───────────────┼───────┤
│ users         │ 103   │
│ events        │ 11    │
│ registrations │ 90    │
│ posts         │ 0     │
│ comments      │ 0     │
└───────────────┴───────┘
```

## Submission Package

For submission, include:
1. **Source Code** - All TypeScript/React files
2. **Mock Data** - `mockData.ts` with 2026 events
3. **Database Schema** - Documented in `DATABASE_IMPLEMENTATION.md`
4. **This Backup Guide** - `DATABASE_BACKUP.md`
5. **Demo Credentials** - Located in `README.md`

## Demo Account Credentials

| Role      | Email                      | Password |
|-----------|----------------------------|----------|
| Admin     | admin@volunteerhub.com     | demo123  |
| Manager   | manager@volunteerhub.com   | demo123  |
| Volunteer | volunteer@volunteerhub.com | demo123  |

## Notes

- The database is automatically seeded on first load from `mockData.ts`
- All dates have been updated to 2026 for the current submission
- IndexedDB data persists in the browser until manually cleared
- Each browser profile maintains its own separate database
- For grading/testing: Simply load the application - no database setup required!

## Technical Implementation

The database initialization happens in:
- **File**: `index.tsx` (lines 13-18)
- **Implementation**: `utils/database.ts`
- **Data Source**: `mockData.ts`

The database is automatically initialized when:
1. User first visits the application
2. After clearing browser data
3. After running `indexedDB.deleteDatabase('VolunteerHubDB')`

---

*Last Updated: December 21, 2025*
*Database Version: 1*
*Event Dates: 2026*
