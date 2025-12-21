/**
 * VolunteerHub Database Import Script
 *
 * Usage:
 * 1. Load your backup JSON file and store it in a variable called 'backupData'
 * 2. Copy and paste this entire script into the browser console (F12)
 * 3. The script will clear the existing database and restore from backup
 *
 * Example:
 *   const backupData = { ... paste your backup JSON here ... };
 *   // Then run this script
 */

(async function importVolunteerHubDatabase() {
  console.log('🔄 Starting VolunteerHub database import...');

  if (typeof backupData === 'undefined') {
    console.error('❌ Error: backupData variable not found!');
    console.log('ℹ️ Please load your backup JSON into a variable called "backupData" first.');
    console.log('Example: const backupData = { ...your backup data... };');
    return;
  }

  const dbName = 'VolunteerHubDB';

  try {
    // Clear existing database
    console.log('🗑️ Clearing existing database...');
    await new Promise((resolve) => {
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      deleteRequest.onsuccess = () => {
        console.log('✅ Old database deleted');
        resolve();
      };
      deleteRequest.onerror = () => {
        console.log('⚠️ No existing database to delete');
        resolve();
      };
    });

    // Create new database with schema
    console.log('🔨 Creating new database...');
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, backupData.version || 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('📐 Setting up database schema...');

        // Create users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
          userStore.createIndex('email', 'email', { unique: true });
          console.log('✅ Created users store');
        }

        // Create events store
        if (!db.objectStoreNames.contains('events')) {
          const eventStore = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
          eventStore.createIndex('status', 'status');
          eventStore.createIndex('createdBy', 'createdBy');
          console.log('✅ Created events store');
        }

        // Create registrations store
        if (!db.objectStoreNames.contains('registrations')) {
          const regStore = db.createObjectStore('registrations', { keyPath: 'id', autoIncrement: true });
          regStore.createIndex('userId', 'userId');
          regStore.createIndex('eventId', 'eventId');
          regStore.createIndex('status', 'status');
          console.log('✅ Created registrations store');
        }

        // Create posts store
        if (!db.objectStoreNames.contains('posts')) {
          const postStore = db.createObjectStore('posts', { keyPath: 'id', autoIncrement: true });
          postStore.createIndex('authorId', 'authorId');
          postStore.createIndex('createdAt', 'createdAt');
          console.log('✅ Created posts store');
        }

        // Create comments store
        if (!db.objectStoreNames.contains('comments')) {
          const commentStore = db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
          commentStore.createIndex('postId', 'postId');
          commentStore.createIndex('authorId', 'authorId');
          console.log('✅ Created comments store');
        }
      };

      request.onsuccess = () => {
        console.log('✅ Database created successfully');
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Failed to create database');
        reject(request.error);
      };
    });

    // Import data into each store
    const importStats = {};

    for (const [storeName, data] of Object.entries(backupData.stores)) {
      console.log(`📦 Importing ${data.length} records into ${storeName}...`);

      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      let successCount = 0;
      let errorCount = 0;

      for (const item of data) {
        try {
          await new Promise((resolve, reject) => {
            const request = store.add(item);
            request.onsuccess = () => {
              successCount++;
              resolve();
            };
            request.onerror = () => {
              errorCount++;
              console.warn(`⚠️ Failed to import item in ${storeName}:`, item);
              resolve(); // Continue on error
            };
          });
        } catch (err) {
          errorCount++;
          console.warn(`⚠️ Error importing to ${storeName}:`, err);
        }
      }

      importStats[storeName] = {
        total: data.length,
        success: successCount,
        errors: errorCount
      };

      console.log(`✅ Imported ${successCount}/${data.length} records to ${storeName}`);
    }

    db.close();

    // Display summary
    console.log('\n📊 Import Summary:');
    console.table(importStats);

    if (backupData.exportDate) {
      console.log(`📅 Backup Date: ${new Date(backupData.exportDate).toLocaleString()}`);
    }

    console.log('\n✅ Database imported successfully!');
    console.log('🔄 Reloading page to apply changes...');

    // Reload the page after a short delay
    setTimeout(() => {
      location.reload();
    }, 2000);

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
})();
