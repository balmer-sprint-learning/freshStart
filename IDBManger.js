class IDBManager {
      static DB_NAME = 'myDatabase';
      static DB_VERSION = 4;
      static dbPromise = null;
    
      // Initialize DB and schema setup on first open
      static openDB() {
        if (this.dbPromise) return this.dbPromise;
    
        this.dbPromise = new Promise((resolve, reject) => {
          const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
    
          request.onupgradeneeded = event => {
            const db = event.target.result;
            // settings - keyPath = setting, no indexes
            if (!db.objectStoreNames.contains('settings')) {
              db.createObjectStore('settings', { keyPath: 'setting' });
            }
            // events - autoIncrement id + index on sprintDay
            if (!db.objectStoreNames.contains('events')) {
              const eventsStore = db.createObjectStore('events', {
                keyPath: 'id',
                autoIncrement: true,
              });
              eventsStore.createIndex('sprintDay', 'sprintDay', { unique: false });
            }
            // improves - keyPath id no indexes
            if (!db.objectStoreNames.contains('improves')) {
              db.createObjectStore('improves', { keyPath: 'id' });
            }
            // userData - keyPath id no indexes
            if (!db.objectStoreNames.contains('userData')) {
              db.createObjectStore('userData', { keyPath: 'id' });
            }
            // curriculum - keyPath id, indexed on id
            if (!db.objectStoreNames.contains('curriculum')) {
              const curriculumStore = db.createObjectStore('curriculum', { keyPath: 'id' });
              curriculumStore.createIndex('id', 'id', { unique: true });
            }
            // errors - autoIncrement primary key + index on id
            if (!db.objectStoreNames.contains('errors')) {
              const errorsStore = db.createObjectStore('errors', { autoIncrement: true });
              errorsStore.createIndex('id', 'id', { unique: true });
            }
            // composition - autoIncrement primary key + index on id
            if (!db.objectStoreNames.contains('composition')) {
              const compositionStore = db.createObjectStore('composition', { autoIncrement: true });
              compositionStore.createIndex('id', 'id', { unique: true });
            }
            // listening - autoIncrement primary key + index on id
            if (!db.objectStoreNames.contains('listening')) {
              const listeningStore = db.createObjectStore('listening', { autoIncrement: true });
              listeningStore.createIndex('id', 'id', { unique: true });
            }
            // conjugations - autoIncrement primary key + index on id
            if (!db.objectStoreNames.contains('conjugations')) {
              const conjugationsStore = db.createObjectStore('conjugations', { autoIncrement: true });
              conjugationsStore.createIndex('id', 'id', { unique: true });
            }
          };
    
          request.onsuccess = event => {
            resolve(event.target.result);
          };
    
          request.onerror = event => {
            reject(event.target.error);
          };
        });
    
        return this.dbPromise;
      }
    
      // Query 1: Get 10 random rows filtered by level (errors, composition, listening, conjugations)
      static async getRandomRowsByLevel(storeName, level, count = 10) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const req = store.getAll();
    
          req.onsuccess = () => {
            const filtered = req.result.filter(row => row.level === level);
            for (let i = filtered.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
            }
            resolve(filtered.slice(0, count));
          };
    
          req.onerror = () => reject(req.error);
        });
      }
    
      // Query 2: Total time used so far from sprintDay to sprintDay (sum duration in events store)
      static async getTotalDuration(sprintDayStart, sprintDayEnd) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('events', 'readonly');
          const store = tx.objectStore('events');
          let total = 0;
          const request = store.openCursor();
    
          request.onsuccess = event => {
            const cursor = event.target.result;
            if (cursor) {
              const rec = cursor.value;
              if (rec.sprintDay >= sprintDayStart && rec.sprintDay <= sprintDayEnd) {
                total += rec.duration || 0;
              }
              cursor.continue();
            } else {
              resolve(total);
            }
          };
    
          request.onerror = event => reject(event.target.error);
        });
      }
    
      // Query 3: Total time used today filtered by sprintDay index
      static async getTotalDurationToday(sprintDayToday) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('events', 'readonly');
          const store = tx.objectStore('events');
          const index = store.index('sprintDay');
          const range = IDBKeyRange.only(sprintDayToday);
          let total = 0;
    
          index.openCursor(range).onsuccess = event => {
            const cursor = event.target.result;
            if (cursor) {
              total += cursor.value.duration || 0;
              cursor.continue();
            } else {
              resolve(total);
            }
          };
    
          tx.onerror = event => reject(event.target.error);
        });
      }
    
      // Query 4: Return all columns from row 1 of settings store as JSON object
      static async getSettings() {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('settings', 'readonly');
          const store = tx.objectStore('settings');
          const req = store.get('row1');
    
          req.onsuccess = () => resolve(req.result || {});
          req.onerror = () => reject(req.error);
        });
      }
    
      // Query 5: Get count of all items learned by level from userData, group by level
      static async getLearnedCountByLevel() {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('userData', 'readonly');
          const store = tx.objectStore('userData');
          const req = store.getAll();
    
          req.onsuccess = () => {
            const counts = {};
            req.result.forEach(row => {
              const level = row.level || 'unknown';
              counts[level] = (counts[level] || 0) + 1;
            });
            resolve(counts);
          };
    
          req.onerror = () => reject(req.error);
        });
      }
    
      // Query 6: Get review performance from sprintDay to sprintDay (100 * sum(results)/count)
      static async getReviewPerformance(sprintDayStart, sprintDayEnd) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('events', 'readonly');
          const store = tx.objectStore('events');
          let sum = 0, count = 0;
          const req = store.openCursor();
    
          req.onsuccess = event => {
            const cursor = event.target.result;
            if (cursor) {
              const rec = cursor.value;
              if (rec.sprintDay >= sprintDayStart && rec.sprintDay <= sprintDayEnd) {
                sum += rec.result || 0;
                count++;
              }
              cursor.continue();
            } else {
              resolve(count === 0 ? 0 : Math.round(100 * sum / count));
            }
          };
    
          req.onerror = () => reject(req.error);
        });
      }
    
      // Query 7: Get ids for all rows with NRD < sprintDay (variable defined elsewhere)
      static async getIdsDueForReview(sprintDay) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('userData', 'readonly');
          const store = tx.objectStore('userData');
          const req = store.getAll();
    
          req.onsuccess = () => {
            const ids = req.result
              .filter(row => row.NRD < sprintDay)
              .map(row => row.id);
            resolve(ids);
          };
    
          req.onerror = () => reject(req.error);
        });
      }
    
      // Query 8: Get next n records for learning: level=0 and id <= maxID
      static async getNextLearningRecords(maxID, count = 10) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('userData', 'readonly');
          const store = tx.objectStore('userData');
          const req = store.getAll();
    
          req.onsuccess = () => {
            const filtered = req.result
              .filter(row => row.level === 0 && row.id <= maxID)
              .slice(0, count);
            resolve(filtered);
          };
    
          req.onerror = () => reject(req.error);
        });
      }
    
      // Query 9: Get matching row from curriculum by id
      static async getCurriculumById(id) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('curriculum', 'readonly');
          const store = tx.objectStore('curriculum');
          const req = store.get(id);
    
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      }
    
      // Query 10: Update a specific userData row by id with new NRD and new Level
      static async updateUserData(id, newNRD, newLevel) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('userData', 'readwrite');
          const store = tx.objectStore('userData');
          const getReq = store.get(id);
    
          getReq.onsuccess = () => {
            const data = getReq.result;
            if (!data) return reject(`No userData found with id ${id}`);
            data.NRD = newNRD;
            data.level = newLevel;
            const putReq = store.put(data);
    
            putReq.onsuccess = () => resolve(`Updated userData with id ${id}`);
            putReq.onerror = () => reject(putReq.error);
          };
    
          getReq.onerror = () => reject(getReq.error);
        });
      }
    
      // Query 11: Update a specific setting (one column) and return confirmation message
      static async updateSetting(column, value) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('settings', 'readwrite');
          const store = tx.objectStore('settings');
          const getReq = store.get('row1'); // assuming single settings row with key 'row1'
    
          getReq.onsuccess = () => {
            const data = getReq.result || {};
            data[column] = value;
            const putReq = store.put(data);
    
            putReq.onsuccess = () => resolve('settings updated');
            putReq.onerror = () => reject(putReq.error);
          };
    
          getReq.onerror = () => reject(getReq.error);
        });
      }
    
      // Query 12: Append one row to events store
      static async addEvent(eventData) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('events', 'readwrite');
          const store = tx.objectStore('events');
          const addReq = store.add(eventData);
    
          addReq.onsuccess = () => resolve();
          addReq.onerror = () => reject(addReq.error);
        });
      }
    
      // Query 13: Insert a row into improves store (just id number)
      static async addImprove(id) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('improves', 'readwrite');
          const store = tx.objectStore('improves');
          const addReq = store.add({ id });
    
          addReq.onsuccess = () => resolve();
          addReq.onerror = () => reject(addReq.error);
        });
      }
    
      // Query 14: Delete a row from improves store by id
      static async deleteImprove(id) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('improves', 'readwrite');
          const store = tx.objectStore('improves');
          const delReq = store.delete(id);
    
          delReq.onsuccess = () => resolve();
          delReq.onerror = () => reject(delReq.error);
        });
      }
    }
    
    export default IDBManager;
    