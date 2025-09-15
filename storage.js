class StorageManager {
      constructor() {
          this.events = null;
          this.userData = null;
          this.testScores = null;
          this.settings = null;
          this.improves = null;
          this.conjugations = null;
          this.curriculum = null;
      }

      async syncFromIndexedDBToLocalStorage() {
    try {
        const files = ['events', 'userData', 'testScores', 'settings', 'improves', 'conjugations', 'curriculum'];
        
        for (const filename of files) {
            const data = await this.loadFromIndexedDB(filename);
            if (data) {
                localStorage.setItem(filename, data);
            }
        }
        
        console.log('Sync from IndexedDB to localStorage complete');
    } catch (error) {
        console.error('Error syncing from IndexedDB to localStorage:', error);
  }
}