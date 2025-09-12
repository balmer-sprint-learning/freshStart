// Simple data manager - we'll rebuild this step by step
console.log('DataManager: Starting fresh and simple');

class DataManager {
    constructor() {
        this.cache = new Map();
        this.performanceLog = [];
        this.storageKeys = ['events', 'userData', 'testScores', 'settings', 'improves', 'conjugations'];
        this.fileExtension = '.tsv';
        
        // Check storage status on initialization
        this.logStorageStatus();
    }

    /**
     * Initialize localStorage with TSV data if empty
     */
    async initializeStorage() {
        const startTime = performance.now();
        
        try {
            // Check if any data exists in localStorage
            const hasData = this.storageKeys.some(key => localStorage.getItem(key) !== null);
            
            if (!hasData) {
                console.log('📦 No data found in localStorage, loading from files...');
                await this.loadAllToStorage();
            } else {
                console.log('📦 Data found in localStorage, ready to use');
                this.logStorageStatus();
            }
            
            const endTime = performance.now();
            this.logPerformance('initializeStorage', 'localStorage', endTime - startTime);
            
        } catch (error) {
            const endTime = performance.now();
            this.logPerformance('initializeStorage', 'localStorage', endTime - startTime, error.message);
            console.error('❌ Storage initialization failed:', error);
        }
    }

    /**
     * Load all TSV files into localStorage
     */
    async loadAllToStorage() {
        const startTime = performance.now();
        
        try {
            console.log('🔄 Loading all TSV files to localStorage...');
            
            for (const key of this.storageKeys) {
                const filename = `data/${key}${this.fileExtension}`;
                try {
                    const response = await fetch(filename);
                    if (!response.ok) {
                        console.warn(`⚠️ Could not load ${filename}: ${response.status}`);
                        continue;
                    }
                    
                    const content = await response.text();
                    localStorage.setItem(key, content);
                    console.log(`✅ Stored ${key}: ${content.length} chars, ${content.split('\n').length} lines`);
                    
                } catch (error) {
                    console.warn(`⚠️ Error loading ${filename}: ${error.message}`);
                }
            }
            
            const endTime = performance.now();
            this.logPerformance('loadAllToStorage', 'all-files', endTime - startTime);
            
            this.logStorageStatus();
            return true;
            
        } catch (error) {
            const endTime = performance.now();
            this.logPerformance('loadAllToStorage', 'all-files', endTime - startTime, error.message);
            throw error;
        }
    }

    /**
     * Get TSV content from localStorage only
     */
    getTSVContent(key) {
        const startTime = performance.now();
        
        try {
            const content = localStorage.getItem(key);
            
            if (!content) {
                throw new Error(`${key} not found in localStorage. Use "Reload All Data" button to load from files.`);
            }
            
            const endTime = performance.now();
            this.logPerformance('getTSVContent', `localStorage:${key}`, endTime - startTime);
            return content;
            
        } catch (error) {
            const endTime = performance.now();
            this.logPerformance('getTSVContent', key, endTime - startTime, error.message);
            throw error;
        }
    }

    /**
     * Log current localStorage status
     */
    logStorageStatus() {
        console.log('📊 localStorage Status:');
        this.storageKeys.forEach(key => {
            const content = localStorage.getItem(key);
            if (content) {
                const lines = content.split('\n').length;
                const size = (content.length / 1024).toFixed(1);
                console.log(`  ✅ ${key}: ${lines} lines, ${size}KB`);
            } else {
                console.log(`  ❌ ${key}: not found`);
            }
        });
    }

    /**
     * Clear all TSV data from localStorage
     */
    clearStorage() {
        const startTime = performance.now();
        
        this.storageKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        const endTime = performance.now();
        this.logPerformance('clearStorage', 'localStorage', endTime - startTime);
        
        console.log('🗑️ Cleared all TSV data from localStorage');
    }

    /**
     * Reload specific file to localStorage
     */
    async reloadToStorage(key) {
        const startTime = performance.now();
        
        try {
            const filename = `data/${key}${this.fileExtension}`;
            const response = await fetch(filename);
            
            if (!response.ok) {
                throw new Error(`Failed to reload ${filename}: ${response.status}`);
            }
            
            const content = await response.text();
            localStorage.setItem(key, content);
            
            const endTime = performance.now();
            this.logPerformance('reloadToStorage', key, endTime - startTime);
            
            console.log(`🔄 Reloaded ${key}: ${content.length} chars, ${content.split('\n').length} lines`);
            return true;
            
        } catch (error) {
            const endTime = performance.now();
            this.logPerformance('reloadToStorage', key, endTime - startTime, error.message);
            throw error;
        }
    }

    /**
     * Parse TSV content into structured data with performance timing
     * @param {string} tsvContent - Raw TSV file content
     * @param {string} filename - Name of the file for logging
     * @returns {Object} Parsed data with headers and rows
     */
    parseTSV(tsvContent, filename = 'unknown') {
        const startTime = performance.now();
        
        try {
            const lines = tsvContent.trim().split('\n');
            console.log(`📋 parseTSV: Processing ${lines.length} lines from ${filename}`);
            console.log(`📋 First 3 lines: ${lines.slice(0, 3).map((l, i) => `\n  ${i+1}: "${l}"`).join('')}`);
            
            let headerRowIndex = null;
            
            // Look for headerRow comment to find exact header location
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('# headerRow =') || line.startsWith('#headerRow =')) {
                    const match = line.match(/headerRow\s*=\s*(\d+)/);
                    if (match) {
                        headerRowIndex = parseInt(match[1]) - 1; // Convert to 0-based index
                        console.log(`📍 Found headerRow comment: row ${match[1]} (0-based: ${headerRowIndex})`);
                        break;
                    }
                }
            }
            
            // If no headerRow comment found, look for line starting with "ID"
            if (headerRowIndex === null) {
                console.log('📍 No headerRow comment found, looking for line starting with "ID"');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line.startsWith('#') && line.startsWith('ID\t')) {
                        headerRowIndex = i;
                        console.log(`📍 Found header row starting with "ID" at line ${i + 1}`);
                        break;
                    }
                }
            }
            
            // Final fallback to old method
            if (headerRowIndex === null) {
                console.log('📍 Using fallback method: first non-comment line');
                headerRowIndex = 0;
                // Skip comment lines (starting with # or empty lines)
                while (headerRowIndex < lines.length && 
                       (lines[headerRowIndex].trim() === '' || 
                        lines[headerRowIndex].trim().startsWith('#'))) {
                    headerRowIndex++;
                }
            }
            
            if (headerRowIndex >= lines.length) {
                throw new Error(`No header row found in TSV file. Checked ${lines.length} lines.`);
            }
            
            console.log(`📍 Using header row at index ${headerRowIndex} (line ${headerRowIndex + 1}): "${lines[headerRowIndex].substring(0, 50)}..."`);
            
            // Get headers from specified row
            const headers = lines[headerRowIndex].split('\t').map(h => h.trim());
            const rows = [];
            
            // Parse data rows (skip comments and empty lines)
            for (let i = headerRowIndex + 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line && !line.startsWith('#')) {
                    const values = line.split('\t').map(v => v.trim());
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    rows.push(row);
                }
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            this.logPerformance('parseTSV', filename, executionTime);
            
            return {
                headers,
                rows,
                filename,
                headerRowIndex: headerRowIndex + 1, // Return 1-based for user reference
                totalLines: lines.length,
                dataRows: rows.length,
                executionTime
            };
            
        } catch (error) {
            const endTime = performance.now();
            this.logPerformance('parseTSV', filename, endTime - startTime, error.message);
            throw error;
        }
    }

    /**
     * Load and parse events.tsv data with performance timing
     * @param {string} tsvContent - Optional: Raw TSV content. If not provided, loads from storage/file
     * @returns {Object} Structured events data with analytics
     */
    async loadEventsData(tsvContent = null) {
        const startTime = performance.now();
        
        try {
            // Get content from parameter, localStorage, or file
            if (!tsvContent) {
                tsvContent = await this.getTSVContent('events');
            }
            
            const parsed = this.parseTSV(tsvContent, 'events.tsv');
            const events = parsed.rows;
            
            // Calculate analytics
            const analytics = {
                totalEvents: events.length,
                actionTypes: {},
                resultTypes: {},
                dayDistribution: {},
                averageDuration: 0,
                totalDuration: 0
            };
            
            let totalDuration = 0;
            
            events.forEach(event => {
                // Count action types
                const action = event.ACTION || 'unknown';
                analytics.actionTypes[action] = (analytics.actionTypes[action] || 0) + 1;
                
                // Count result types
                const result = event.RESULT || 'unknown';
                analytics.resultTypes[result] = (analytics.resultTypes[result] || 0) + 1;
                
                // Count by day
                const day = event.SDAY || 'unknown';
                analytics.dayDistribution[day] = (analytics.dayDistribution[day] || 0) + 1;
                
                // Sum duration
                const duration = parseFloat(event.DURATION) || 0;
                totalDuration += duration;
            });
            
            analytics.totalDuration = totalDuration;
            analytics.averageDuration = events.length > 0 ? totalDuration / events.length : 0;
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            this.logPerformance('loadEventsData', 'events.tsv', executionTime);
            
            return {
                events,
                analytics,
                executionTime
            };
            
        } catch (error) {
            const endTime = performance.now();
            this.logPerformance('loadEventsData', 'events.tsv', endTime - startTime, error.message);
            throw error;
        }
    }

    /**
     * Load and parse userData.tsv with performance timing
     * @param {string} tsvContent - Optional: Raw TSV content. If not provided, loads from storage/file
     * @returns {Object} Structured user data with level analytics
     */
    async loadUserData(tsvContent = null) {
        const startTime = performance.now();
        
        try {
            // Get content from parameter, localStorage, or file
            if (!tsvContent) {
                tsvContent = await this.getTSVContent('userData');
            }
            
            const parsed = this.parseTSV(tsvContent, 'userData.tsv');
            const userData = parsed.rows;
            
            // Calculate level analytics
            const analytics = {
                totalEntries: userData.length,
                levelDistribution: {},
                nrdDistribution: {},
                averageLevel: 0,
                levelProgression: {}
            };
            
            let totalLevel = 0;
            
            userData.forEach(entry => {
                const level = parseInt(entry.LEVEL) || 0;
                const nrd = parseInt(entry.NRD) || 0;
                
                // Count level distribution
                analytics.levelDistribution[level] = (analytics.levelDistribution[level] || 0) + 1;
                
                // Count NRD distribution
                analytics.nrdDistribution[nrd] = (analytics.nrdDistribution[nrd] || 0) + 1;
                
                // Track level progression by NRD
                if (!analytics.levelProgression[nrd]) {
                    analytics.levelProgression[nrd] = [];
                }
                analytics.levelProgression[nrd].push(level);
                
                totalLevel += level;
            });
            
            analytics.averageLevel = userData.length > 0 ? totalLevel / userData.length : 0;
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            this.logPerformance('loadUserData', 'userData.tsv', executionTime);
            
            return {
                userData,
                analytics,
                executionTime
            };
            
        } catch (error) {
            const endTime = performance.now();
            this.logPerformance('loadUserData', 'userData.tsv', endTime - startTime, error.message);
            throw error;
        }
    }

    /**
     * Load and parse testScores.tsv with performance timing
     * @param {string} tsvContent - Optional: Raw TSV content. If not provided, loads from storage/file
     * @returns {Object} Structured test scores with skill analytics
     */
    async loadTestScores(tsvContent = null) {
        const startTime = performance.now();
        
        try {
            // Get content from parameter, localStorage, or file
            if (!tsvContent) {
                tsvContent = await this.getTSVContent('testScores');
            }
            
            const parsed = this.parseTSV(tsvContent, 'testScores.tsv');
            const scores = parsed.rows;
            
            // Calculate skill analytics
            const analytics = {
                totalTests: scores.length,
                skillAverages: {
                    READING: 0,
                    WRITING: 0,
                    SPEAKING: 0,
                    LISTENING: 0
                },
                levelProgression: {},
                dayProgression: {}
            };
            
            let skillTotals = { READING: 0, WRITING: 0, SPEAKING: 0, LISTENING: 0 };
            
            scores.forEach(score => {
                const day = parseInt(score.DAY) || 0;
                const level = score.LEVEL || 'unknown';
                
                // Sum skills for averages
                ['READING', 'WRITING', 'SPEAKING', 'LISTENING'].forEach(skill => {
                    const value = parseFloat(score[skill]) || 0;
                    skillTotals[skill] += value;
                });
                
                // Track progression by level
                if (!analytics.levelProgression[level]) {
                    analytics.levelProgression[level] = [];
                }
                analytics.levelProgression[level].push({
                    day,
                    reading: parseFloat(score.READING) || 0,
                    writing: parseFloat(score.WRITING) || 0,
                    speaking: parseFloat(score.SPEAKING) || 0,
                    listening: parseFloat(score.LISTENING) || 0
                });
                
                // Track by day
                analytics.dayProgression[day] = {
                    level,
                    reading: parseFloat(score.READING) || 0,
                    writing: parseFloat(score.WRITING) || 0,
                    speaking: parseFloat(score.SPEAKING) || 0,
                    listening: parseFloat(score.LISTENING) || 0
                };
            });
            
            // Calculate averages
            if (scores.length > 0) {
                Object.keys(skillTotals).forEach(skill => {
                    analytics.skillAverages[skill] = skillTotals[skill] / scores.length;
                });
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            this.logPerformance('loadTestScores', 'testScores.tsv', executionTime);
            
            return {
                scores,
                analytics,
                executionTime
            };
            
        } catch (error) {
            const endTime = performance.now();
            this.logPerformance('loadTestScores', 'testScores.tsv', endTime - startTime, error.message);
            throw error;
        }
    }

    /**
     * Load and parse settings.tsv with performance timing
     * @param {string} tsvContent - Optional: Raw TSV content. If not provided, loads from storage/file
     * @returns {Object} Structured settings data
     */
    async loadSettings(tsvContent = null) {
        const startTime = performance.now();
        
        try {
            // Get content from parameter, localStorage, or file
            if (!tsvContent) {
                tsvContent = await this.getTSVContent('settings');
            }
            
            const lines = tsvContent.trim().split('\n');
            const settings = {};
            
            lines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed && trimmed.includes(':')) {
                    const [key, value] = trimmed.split(':').map(s => s.trim());
                    settings[key] = value;
                }
            });
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            this.logPerformance('loadSettings', 'settings.tsv', executionTime);
            
            return {
                settings,
                executionTime
            };
            
        } catch (error) {
            const endTime = performance.now();
            this.logPerformance('loadSettings', 'settings.tsv', endTime - startTime, error.message);
            throw error;
        }
    }

    /**
     * Load and parse improves.tsv with performance timing
     * @param {string} tsvContent - Optional: Raw TSV content. If not provided, loads from storage/file
     * @returns {Object} Structured improvements data
     */
    async loadImprovements(tsvContent = null) {
        const startTime = performance.now();
        
        try {
            // Get content from parameter, localStorage, or file
            if (!tsvContent) {
                tsvContent = await this.getTSVContent('improves');
            }
            
            const parsed = this.parseTSV(tsvContent, 'improves.tsv');
            const improvements = parsed.rows;
            
            const analytics = {
                totalImprovements: improvements.length,
                idDistribution: {}
            };
            
            improvements.forEach(improvement => {
                const id = improvement.ID || 'unknown';
                analytics.idDistribution[id] = (analytics.idDistribution[id] || 0) + 1;
            });
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            this.logPerformance('loadImprovements', 'improves.tsv', executionTime);
            
            return {
                improvements,
                analytics,
                executionTime
            };
            
        } catch (error) {
            const endTime = performance.now();
            this.logPerformance('loadImprovements', 'improves.tsv', endTime - startTime, error.message);
            throw error;
        }
    }

    /**
     * Calculate comprehensive analytics across all data sources
     * @param {Object} allData - Object containing all loaded data
     * @returns {Object} Cross-data analytics with performance timing
     */
    calculateOverallAnalytics(allData) {
        const startTime = performance.now();
        
        try {
            const analytics = {
                summary: {
                    totalEvents: allData.events?.analytics?.totalEvents || 0,
                    totalUserEntries: allData.userData?.analytics?.totalEntries || 0,
                    totalTestScores: allData.testScores?.analytics?.totalTests || 0,
                    totalImprovements: allData.improvements?.analytics?.totalImprovements || 0
                },
                performance: {
                    totalDataLoadTime: 0,
                    averageLoadTime: 0,
                    loadTimes: {}
                },
                insights: []
            };
            
            // Calculate total load times
            let totalLoadTime = 0;
            let loadCount = 0;
            
            Object.keys(allData).forEach(key => {
                if (allData[key]?.executionTime) {
                    const time = allData[key].executionTime;
                    analytics.performance.loadTimes[key] = time;
                    totalLoadTime += time;
                    loadCount++;
                }
            });
            
            analytics.performance.totalDataLoadTime = totalLoadTime;
            analytics.performance.averageLoadTime = loadCount > 0 ? totalLoadTime / loadCount : 0;
            
            // Generate insights
            if (allData.testScores?.analytics?.skillAverages) {
                const skills = allData.testScores.analytics.skillAverages;
                const bestSkill = Object.keys(skills).reduce((a, b) => skills[a] > skills[b] ? a : b);
                analytics.insights.push(`Strongest skill: ${bestSkill} (${skills[bestSkill].toFixed(2)})`);
            }
            
            if (allData.events?.analytics?.actionTypes) {
                const actions = allData.events.analytics.actionTypes;
                const mostCommonAction = Object.keys(actions).reduce((a, b) => actions[a] > actions[b] ? a : b);
                analytics.insights.push(`Most common activity: ${mostCommonAction} (${actions[mostCommonAction]} times)`);
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            this.logPerformance('calculateOverallAnalytics', 'all-data', executionTime);
            
            return {
                analytics,
                executionTime
            };
            
        } catch (error) {
            const endTime = performance.now();
            this.logPerformance('calculateOverallAnalytics', 'all-data', endTime - startTime, error.message);
            throw error;
        }
    }

    /**
     * Log performance metrics for function execution
     * @param {string} functionName - Name of the function
     * @param {string} dataSource - Data source being processed
     * @param {number} executionTime - Time in milliseconds
     * @param {string} error - Error message if any
     */
    logPerformance(functionName, dataSource, executionTime, error = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            function: functionName,
            dataSource: dataSource,
            executionTime: Math.round(executionTime * 100) / 100, // Round to 2 decimal places
            status: error ? 'error' : 'success',
            error: error
        };
        
        this.performanceLog.push(logEntry);
        
        // Console output for immediate feedback
        const status = error ? '❌' : '✅';
        console.log(`${status} ${functionName}(${dataSource}): ${logEntry.executionTime}ms${error ? ` - ${error}` : ''}`);
    }

    /**
     * Get performance summary for all executed functions
     * @returns {Object} Performance summary with timing statistics
     */
    getPerformanceSummary() {
        const startTime = performance.now();
        
        const summary = {
            totalCalls: this.performanceLog.length,
            successfulCalls: this.performanceLog.filter(log => log.status === 'success').length,
            failedCalls: this.performanceLog.filter(log => log.status === 'error').length,
            totalExecutionTime: this.performanceLog.reduce((sum, log) => sum + log.executionTime, 0),
            averageExecutionTime: 0,
            functionStats: {},
            recentLogs: this.performanceLog.slice(-10) // Last 10 entries
        };
        
        if (summary.totalCalls > 0) {
            summary.averageExecutionTime = summary.totalExecutionTime / summary.totalCalls;
        }
        
        // Calculate per-function statistics
        this.performanceLog.forEach(log => {
            if (!summary.functionStats[log.function]) {
                summary.functionStats[log.function] = {
                    calls: 0,
                    totalTime: 0,
                    averageTime: 0,
                    minTime: Infinity,
                    maxTime: 0,
                    errors: 0
                };
            }
            
            const stats = summary.functionStats[log.function];
            stats.calls++;
            stats.totalTime += log.executionTime;
            stats.minTime = Math.min(stats.minTime, log.executionTime);
            stats.maxTime = Math.max(stats.maxTime, log.executionTime);
            if (log.status === 'error') stats.errors++;
            stats.averageTime = stats.totalTime / stats.calls;
        });
        
        const endTime = performance.now();
        this.logPerformance('getPerformanceSummary', 'performance-log', endTime - startTime);
        
        return summary;
    }

    /**
     * Clear performance log
     */
    clearPerformanceLog() {
        this.performanceLog = [];
        console.log('📊 Performance log cleared');
    }
}

// Global instance for use across the application
window.dataManager = new DataManager();
