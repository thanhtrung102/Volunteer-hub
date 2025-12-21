/**
 * VolunteerHub Database Export Script
 *
 * Usage: Copy and paste this entire script into the browser console (F12)
 * while the VolunteerHub application is running.
 *
 * This will download a JSON file containing the complete database backup.
 */

(async function exportVolunteerHubDatabase() {
  console.log('🔄 Starting VolunteerHub database export...');

  const dbName = 'VolunteerHubDB';

  try {
    // Open the database
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onsuccess = () => {
        console.log('✅ Database connection opened');
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('❌ Failed to open database');
        reject(request.error);
      };
    });

    const storeNames = ['users', 'events', 'registrations', 'posts', 'comments'];
    const backup = {
      exportDate: new Date().toISOString(),
      version: db.version,
      databaseName: dbName,
      stores: {}
    };

    // Export each object store
    for (const storeName of storeNames) {
      console.log(`📦 Exporting ${storeName}...`);

      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const data = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      backup.stores[storeName] = data;
      console.log(`✅ Exported ${data.length} records from ${storeName}`);
    }

    db.close();

    // Create statistics
    const stats = {
      totalUsers: backup.stores.users.length,
      totalEvents: backup.stores.events.length,
      totalRegistrations: backup.stores.registrations.length,
      totalPosts: backup.stores.posts.length,
      totalComments: backup.stores.comments.length
    };

    backup.statistics = stats;

    // Log summary
    console.log('\n📊 Export Summary:');
    console.table(stats);

    // Download as JSON file
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `volunteerhub-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('\n✅ Database exported successfully!');
    console.log(`📁 File: volunteerhub-backup-${new Date().toISOString().split('T')[0]}.json`);
    console.log(`📦 Size: ${(jsonString.length / 1024).toFixed(2)} KB`);

    return backup;

  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
})();
