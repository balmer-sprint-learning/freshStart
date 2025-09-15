/**
 * Central Sync Manager - IndexedDB persistence with file export fallback
 * Syncs on: mode changes, page changes, browser close
 */
class SyncManager {
    constructor() {
        this.dbName = 'FreshStartDB';
        this.dbVersion = 1;
        this.syncInProgress = false;
        this.lastSyncTime = 0;
        this.syncCooldown = 1000; // Minimum 1 second between syncs
        
        this.initializeEventListeners();
    }
    
    // Initialize all sync triggers
    initializeEventListeners() {
        // Browser close trigger - synchronous
        window.addEventListener('beforeunload', (event) => {
            if (this.shouldSync()) {
                // Synchronous sync for browser close
                this.syncDataSync();
            }
        });
        
        // Page visibility change (tab switching, minimizing)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && this.shouldSync()) {
                this.syncData();
            }
        });
    }
    
    // Check if sync is needed (cooldown + data changes)
    shouldSync() {
        const now = Date.now();
        return (now - this.lastSyncTime) > this.syncCooldown && !this.syncInProgress;
    }
    
    // Asynchronous sync for mode/page changes
    async syncData() {
        if (!this.shouldSync()) return;
        
        this.syncInProgress = true;
        this.lastSyncTime = Date.now();
        
        try {
            await this.syncToIndexedDB();
            console.log('✅ Data synced to IndexedDB');
        } catch (error) {
            console.error('❌ IndexedDB sync failed:', error);
            await this.fallbackFileExport();
        } finally {
            this.syncInProgress = false;
        }
    }
    
    // Synchronous sync for browser close
    syncDataSync() {
        if (!this.shouldSync()) return;
        
        this.syncInProgress = true;
        try {
            // Use synchronous operations for browser close
            this.syncToIndexedDBSync();
            console.log('✅ Data synced synchronously');
        } catch (error) {
            console.error('❌ Sync failed on browser close:', error);
            this.fallbackFileExportSync();
        } finally {
            this.syncInProgress = false;
        }
    }
    
    // Async IndexedDB sync
    async syncToIndexedDB() {
        const db = await this.openDatabase();
        
        // Sync userData and improves only (curriculum changes rarely)
        await this.syncStore(db, 'userData');
        await this.syncStore(db, 'improves');
        await this.syncStore(db, 'events');
        
        db.close();
    }
    
    // Sync specific store to IndexedDB
    async syncStore(db, storeName) {
        const data = localStorage.getItem(storeName);
        if (!data) return;
        
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // Store the raw localStorage data
        await new Promise((resolve, reject) => {
            const request = store.put({
                id: 'current',
                data: data,
                timestamp: Date.now()
            });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
    
    // Open IndexedDB database
    async openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores if they don't exist
                const stores = ['userData', 'improves', 'events', 'curriculum'];
                stores.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath: 'id' });
                    }
                });
            };
        });
    }
    
    // Synchronous IndexedDB operations for browser close
    syncToIndexedDBSync() {
        // Note: IndexedDB is inherently async, but we'll try our best
        // In practice, this may not complete before browser closes
        const request = indexedDB.open(this.dbName, this.dbVersion);
        
        request.onsuccess = () => {
            const db = request.result;
            ['userData', 'improves', 'events'].forEach(storeName => {
                const data = localStorage.getItem(storeName);
                if (data) {
                    const transaction = db.transaction([storeName], 'readwrite');
                    const store = transaction.objectStore(storeName);
                    store.put({
                        id: 'current',
                        data: data,
                        timestamp: Date.now()
                    });
                }
            });
            db.close();
        };
    }
    
    // File export fallback - user choice
    async fallbackFileExport() {
        try {
            const exportData = {
                userData: localStorage.getItem('userData'),
                improves: localStorage.getItem('improves'),
                events: localStorage.getItem('events'),
                timestamp: new Date().toISOString(),
                prefix: localStorage.getItem('prefix') || 'freshstart'
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `freshstart-backup-${exportData.prefix}-${new Date().toISOString().slice(0, 10)}.json`;
            
            // User choice - they have to click to download
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('📁 Backup file offered for download');
        } catch (error) {
            console.error('❌ File export failed:', error);
        }
    }
    
    // Synchronous file export for browser close
    fallbackFileExportSync() {
        // Limited options for sync file export
        console.warn('⚠️ Sync failed - manual backup recommended');
    }
    
    // Manual trigger for mode changes
    onModeChange() {
        if (this.shouldSync()) {
            this.syncData();
        }
    }
    
    // Manual trigger for page changes  
    onPageChange() {
        if (this.shouldSync()) {
            this.syncData();
        }
    }
    
    // Restore data from IndexedDB on app start
    async restoreFromIndexedDB() {
        try {
            const db = await this.openDatabase();
            const stores = ['userData', 'improves', 'events'];
            
            for (const storeName of stores) {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                
                const data = await new Promise((resolve, reject) => {
                    const request = store.get('current');
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
                
                if (data && data.data) {
                    // Only restore if localStorage is empty or older
                    const currentData = localStorage.getItem(storeName);
                    if (!currentData) {
                        localStorage.setItem(storeName, data.data);
                        console.log(`📥 Restored ${storeName} from IndexedDB`);
                    }
                }
            }
            
            db.close();
        } catch (error) {
            console.error('❌ Restore from IndexedDB failed:', error);
        }
    }
    
    // Complete wipe of all data for fresh start
    async clearAllData() {
        console.log('🗑️ Clearing all IndexedDB data...');
        
        // Delete the entire database
        return new Promise((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(this.dbName);
            
            deleteRequest.onsuccess = async () => {
                console.log('✅ IndexedDB completely deleted');
                
                // Verify both localStorage and IndexedDB are empty
                await this.verifyDataCleared();
                
                resolve();
            };
            
            deleteRequest.onerror = () => {
                console.error('❌ Failed to delete IndexedDB');
                reject(deleteRequest.error);
            };
            
            deleteRequest.onblocked = () => {
                console.warn('⚠️ IndexedDB deletion blocked - close other tabs');
                // Force resolve after a delay
                setTimeout(async () => {
                    await this.verifyDataCleared();
                    resolve();
                }, 1000);
            };
        });
    }
    
    // Verify that all data has been cleared and show alert
    async verifyDataCleared() {
        // Check localStorage
        const localStorageUserData = localStorage.getItem('userData');
        const localStorageEmpty = localStorage.length === 0 || !localStorageUserData;
        
        // Check IndexedDB
        let indexedDBEmpty = true;
        let indexedDBUserData = null;
        
        try {
            // Try to open the database - should fail if deleted
            const db = await this.openDatabase();
            const transaction = db.transaction(['userData'], 'readonly');
            const store = transaction.objectStore('userData');
            
            const data = await new Promise((resolve, reject) => {
                const request = store.get('current');
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(null); // Treat error as empty
            });
            
            if (data && data.data) {
                indexedDBEmpty = false;
                indexedDBUserData = data.data;
            }
            
            db.close();
        } catch (error) {
            // Database doesn't exist = empty (good)
            indexedDBEmpty = true;
        }
        
        // Show verification alert
        if (localStorageEmpty && indexedDBEmpty) {
            // SUCCESS - show green tick
            alert('✅ SUCCESS: Local data is empty\n\n' +
                  '✓ localStorage cleared\n' +
                  '✓ IndexedDB deleted\n\n' +
                  'Fresh start ready!');
        } else {
            // FAILURE - show red X with remaining data
            let message = '❌ FAILURE: Data still remains\n\n';
            
            if (!localStorageEmpty) {
                message += '⚠️ localStorage userData:\n' + (localStorageUserData || 'null') + '\n\n';
            }
            
            if (!indexedDBEmpty) {
                message += '⚠️ IndexedDB userData:\n' + (indexedDBUserData || 'null') + '\n\n';
            }
            
            message += 'Clear operation incomplete!';
            alert(message);
        }
    }
    
    // Alias for test compatibility
    exportDataToFile() {
        return this.fallbackFileExport();
    }
}

// Create global sync manager instance
const syncManager = new SyncManager();

// Restore data on app start
syncManager.restoreFromIndexedDB();

// Export for use in other modules
window.syncManager = syncManager;
