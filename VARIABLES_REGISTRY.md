# Variables Registry - Global Variables Reference

## Global Variables by File

### general.js
| Variable | Type | Purpose | Persistence |
|----------|------|---------|-------------|
| `mode` | string | Current learning mode ('improve', 'review', 'learn', 'verbs', 'listening', 'composition', 'errors') | localStorage |

### start.js  
| Variable | Type | Purpose | Persistence |
|----------|------|---------|-------------|
| `retentionChart` | Chart.js | Chart instance for doughnut chart | Memory only |
| `window.learnsRemaining` | function | Calculate remaining items to learn | Memory only |

### action.js
| Variable | Type | Purpose | Persistence |
|----------|------|---------|-------------|
| `currentItems` | array | Current session items to work through | Memory only |
| `sessionCompleted` | number | Count of items completed this session | Memory only |
| `itemDisplayStart` | timestamp | When current item was first displayed | Memory only |
| `sessionStartTime` | timestamp | When current session started | Memory only |
| `totalDailyTime` | number | Total time spent today | Memory only |

### dataManager.js
| Variable | Type | Purpose | Persistence |
|----------|------|---------|-------------|
| `dataManager` | DataManager | Global instance for TSV parsing and analytics | Memory only |
| `window.maxIDForLearnsToday` | function | Calculate max item ID for today's learning | Memory only |

## Sync Triggers
- **Mode changes**: When `mode` variable changes in general.js
- **Page changes**: Navigation between screens  
- **Browser close**: beforeunload event
