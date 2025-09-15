// index.js - App initialization and new user detection
// This runs on app launch to check if user data exists

// Check IndexedDB for existing user data and redirect appropriately
async function checkUserDataAndRedirect() {
    console.log('🚀 App initialization - checking for existing user data...');
    
    try {
        // Try to open the IndexedDB database
        let isNewDatabase = false;
        
        const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open('FreshStartDB', 1);
            
            request.onerror = () => {
                console.log('❌ IndexedDB not available, redirecting to profile');
                window.location.href = 'profile.html';
                return;
            };
            
            request.onsuccess = () => {
                console.log('✅ IndexedDB opened successfully');
                resolve(request.result);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('🆕 New database detected - creating object stores and redirecting to profile');
                isNewDatabase = true;
                
                // Create object stores for new database
                const stores = ['userData', 'improves', 'events', 'curriculum'];
                stores.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath: 'id' });
                    }
                });
                
                resolve(db);
            };
        });
        
        if (!db) return; // Already redirected in onerror
        
        // If this was a new database, redirect to profile immediately
        if (isNewDatabase) {
            db.close();
            console.log('🆕 New user detected - redirecting to profile');
            window.location.href = 'profile.html';
            return;
        }
        
        // Check if userData exists in existing database
        const transaction = db.transaction(['userData'], 'readonly');
        const store = transaction.objectStore('userData');
        
        const userData = await new Promise((resolve, reject) => {
            const request = store.get('current');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });
        
        db.close();
        
        if (!userData || !userData.data) {
            console.log('🆕 New user detected - no userData in IndexedDB, redirecting to profile');
            window.location.href = 'profile.html';
        } else {
            console.log('👤 Existing user detected - userData found in IndexedDB, proceeding to start page');
            window.location.href = 'start.html';
        }
        
    } catch (error) {
        console.error('❌ Error checking user data:', error);
        console.log('🆕 Assuming new user due to error, redirecting to profile');
        window.location.href = 'profile.html';
    }
}

// Run check when DOM is ready
document.addEventListener('DOMContentLoaded', checkUserDataAndRedirect);
