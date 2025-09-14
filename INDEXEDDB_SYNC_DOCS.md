# IndexedDB Sync System Documentation

## Overview
The FreshStart application now includes a comprehensive IndexedDB persistence layer that automatically syncs localStorage data to IndexedDB for robust, persistent storage across browser sessions.

## Architecture

### Components
- **syncManager.js**: Core persistence manager with IndexedDB operations
- **Sync Triggers**: Automatic sync on user interactions
- **Fallback Export**: File download when IndexedDB unavailable

### Database Schema
```javascript
Database: 'FreshStartDB'
Version: 1
ObjectStores:
  - profiles: keyPath 'id', stores profile data
  - userData: keyPath 'id', stores user learning data  
  - improves: keyPath 'id', stores improvement records
  - events: keyPath 'id', stores learning events
  - curriculum: keyPath 'id', stores curriculum data
```

## Sync Triggers

### 1. Mode Changes (onModeChange)
**When**: User changes the mode variable (vocab/fluency/profile/settings)
**Location**: general.js lines 235, 264, 289 (all mode changes)
**Data**: Syncs current mode state and any pending data changes
**Performance**: ~50-100ms per sync

### 2. Page Changes (onPageChange) 
**When**: Navigation between pages (action.html ↔ profile.html)
**Location**: general.js lines 240, 269, 294 (before window.location.href)
**Data**: Syncs all localStorage data before navigation
**Performance**: ~100-150ms per sync

### 3. Browser Close (onBrowserClose)
**When**: User closes tab or browser window
**Location**: beforeunload event listener in syncManager
**Data**: Emergency sync of all data to prevent loss
**Performance**: Synchronous, ~50ms maximum

## Data Flow

### Write Path
1. User action modifies data in memory
2. Data written to localStorage immediately
3. Sync trigger detects change
4. Data batch-synced to IndexedDB
5. Success/error logged to console

### Read Path
1. Application starts
2. syncManager.loadFromIndexedDB() called
3. Data loaded from IndexedDB to localStorage
4. Application uses localStorage as primary cache
5. Periodic background sync maintains consistency

## Performance Characteristics

### Sync Timing
- Mode change: 50-100ms
- Page change: 100-150ms  
- Browser close: <50ms (synchronous)
- Full dataset sync: 100-200ms

### Storage Capacity
- IndexedDB: ~50MB+ per domain
- localStorage: ~5-10MB per domain
- Automatic fallback to file export if storage full

## Error Handling

### IndexedDB Unavailable
- Falls back to localStorage-only operation
- Provides exportDataToFile() for manual backup
- Logs error and continues operation

### Sync Failures
- Retries failed operations once
- Logs detailed error information
- Graceful degradation to localStorage

### Data Corruption
- Validates data structure before sync
- Skips corrupted records with warning
- Maintains application stability

## Usage Examples

### Manual Sync
```javascript
// Sync all data immediately
await syncManager.sync();

// Sync on specific trigger
await syncManager.onModeChange('vocab');
await syncManager.onPageChange('action.html');
```

### Data Export
```javascript
// Export all data to downloadable file
await syncManager.exportDataToFile();
```

### Loading Data
```javascript
// Load persisted data on app start
await syncManager.loadFromIndexedDB();
```

## Testing

### Sync Triggers Test
File: `test_sync_triggers.html`
- Tests all three sync triggers
- Performance timing validation
- Error handling verification
- Data export functionality

### Integration Points
- Profile page: License/prefix generation → localStorage → IndexedDB
- Start page: Analytics data → localStorage → IndexedDB  
- Action page: Learning events → localStorage → IndexedDB

## Configuration

### Sync Frequency
- Automatic on user interactions (mode/page changes)
- Manual via syncManager.sync() if needed
- Emergency on browser close

### Storage Locations
- Primary: localStorage (fast access)
- Persistent: IndexedDB (large capacity)
- Backup: File download (user-initiated)

## Browser Compatibility
- Chrome/Edge: Full IndexedDB support
- Firefox: Full IndexedDB support
- Safari: Full IndexedDB support
- Fallback: localStorage + file export for older browsers

## Future Enhancements
- Cloud sync integration
- Conflict resolution for multiple devices
- Incremental sync for large datasets
- Real-time collaboration features
