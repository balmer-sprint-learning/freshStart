/**
 * Data Manager - Step 1: Load files to localStorage and verify line counts
 */
class DataManager {
    constructor() {
        this.files = ['events', 'userData', 'testScores', 'settings', 'improves', 'conjugations', 'curriculum'];
        this.performanceLog = []; // For the test page
    }

    // Shared utility to find header row index from TSV content
    findHeaderRowIndex(lines) {
        // Header row comment is typically in the first few lines
        const maxLinesToCheck = Math.min(10, lines.length);
        for (let i = 0; i < maxLinesToCheck; i++) {
            const line = lines[i].trim();
            if (line.includes('# headerRow =')) {
                const match = line.match(/headerRow\s*=\s*(\d+)/);
                if (match) {
                    return parseInt(match[1]) - 1; // Convert to 0-based
                }
                break; // Stop after finding the header row comment
            }
        }
        return null;
    }

    async loadAllToStorage() {
        console.log('🔄 Loading files to localStorage...');
        
        for (const filename of this.files) {
            try {
                // Add cache-busting to ensure fresh data
                const timestamp = new Date().getTime();
                const response = await fetch(`data/${filename}.tsv?t=${timestamp}`, {
                    cache: 'no-cache',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                const content = await response.text();
                const lineCount = content.split(/\r\n|\r|\n/).length;
                
                localStorage.setItem(filename, content);
                console.log(`✅ ${filename}: ${lineCount} lines loaded`);
                
            } catch (error) {
                console.log(`❌ ${filename}: ${error.message}`);
            }
        }
    }

    checkStorage() {
        let report = '📊 localStorage Status:\n';
        for (const filename of this.files) {
            const content = localStorage.getItem(filename);
            if (content) {
                const lineCount = content.split('\n').length;
                const hasNewlines = content.includes('\n');
                const hasCarriageReturns = content.includes('\r');
                const chars = content.length;
                report += `✅ ${filename}: ${lineCount} lines, ${chars} chars (newlines: ${hasNewlines}, CR: ${hasCarriageReturns})\n`;
            } else {
                report += `❌ ${filename}: not found in storage\n`;
            }
        }
        console.log(report);
        
        // Add to performance log so it shows on page
        this.performanceLog.push({
            timestamp: new Date().toLocaleTimeString(),
            function: 'checkStorage',
            result: report,
            type: 'info'
        });
        
        return report;
    }

    // Stub functions to prevent errors
    logStorageStatus() { 
        const report = this.checkStorage();
        return report;
    }
    
    clearStorage() { console.log('clearStorage not implemented yet'); }
    getPerformanceSummary() { return { totalCalls: 0 }; }
    clearPerformanceLog() { this.performanceLog = []; }
    async loadEventsData() { 
        const content = localStorage.getItem('events');
        if (!content) return null;
        
        const lines = content.split(/\r\n|\r|\n/);
        const headerRowIndex = this.findHeaderRowIndex(lines);
        const events = [];
        
        // Parse data lines
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('#') && i !== headerRowIndex) {
                const columns = line.split('\t');
                if (columns.length >= 6) {
                    events.push({
                        id: columns[0].trim(),
                        action: columns[1].trim(),
                        result: columns[2].trim(),
                        duration: parseInt(columns[3].trim()),
                        sday: columns[4].trim(),
                        ap: columns[5].trim()
                    });
                }
            }
        }
        
        return events;
    }
    async loadUserData() { 
        const content = localStorage.getItem('userData');
        if (!content) return null;
        
        const lines = content.split(/\r\n|\r|\n/);
        const headerRowIndex = this.findHeaderRowIndex(lines);
        const userData = [];
        
        // Parse data lines
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('#') && i !== headerRowIndex) {
                const columns = line.split('\t');
                if (columns.length >= 3) {
                    userData.push({
                        id: columns[0].trim(),
                        nrd: columns[1].trim(),
                        level: parseInt(columns[2].trim())
                    });
                }
            }
        }
        
        return userData;
    }
    async loadTestScores() { throw new Error('loadTestScores not implemented yet'); }
    async loadSettings() { 
        const content = localStorage.getItem('settings');
        if (!content) return null;
        
        const lines = content.split(/\r\n|\r|\n/);
        const headerRowIndex = this.findHeaderRowIndex(lines);
        const settings = {};
        
        // Parse data lines into key-value pairs
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('#') && i !== headerRowIndex) {
                const columns = line.split('\t');
                if (columns.length >= 2) {
                    settings[columns[0].trim()] = columns[1].trim();
                }
            }
        }
        
        return settings;
    }
    async loadCurriculum() { 
        const content = localStorage.getItem('curriculum');
        if (!content) return null;
        
        const lines = content.split(/\r\n|\r|\n/);
        const headerRowIndex = this.findHeaderRowIndex(lines);
        const curriculum = [];
        
        // Parse data lines
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('#') && i !== headerRowIndex) {
                const columns = line.split('\t');
                curriculum.push({
                    ids: (columns[0]||"").trim(),
                    question: (columns[1]||"").trim(),
                    answer: (columns[2]||"").trim(),
                    audio: (columns[3]||"").trim(),
                    info: (columns[4]||"").trim(),
                    clue: (columns[5]||"").trim(),
                    theme: (columns[6]||"").trim(),
                    subtype: (columns[7]||"").trim(),
                    level: (columns[8]||"").trim(),
                    seq: columns[9] ? parseInt(columns[9].trim()) : "",
                    type: (columns[10]||"").trim(),
                    person: (columns[11]||"").trim(),
                    tense: (columns[12]||"").trim(),
                    comment: (columns[13]||"").trim()
                });
            }
        }
        
        return curriculum;
    }
    async loadImprovements() { throw new Error('loadImprovements not implemented yet'); }
    calculateOverallAnalytics() { throw new Error('calculateOverallAnalytics not implemented yet'); }
    
    async maxIDForLearnsToday() {
        try {
            const settings = await this.loadSettings();
            if (!settings || !settings.licence) {
                console.log('No settings or licence found');
                return { maxIDForLearns: 0 };
            }
            
            // Parse licence to get tier (e.g., BB-015-34-R4-U-025 -> R4)
            const licenceParts = settings.licence.split('-');
            if (licenceParts.length < 4) {
                console.log('Invalid licence format');
                return { maxIDForLearns: 0 };
            }
            
            const tier = licenceParts[3];
            const tierMap = {
                'T1': 750,
                'N2': 1500,
                'M3': 2250,
                'R4': 3000
            };
            
            const maxIDForTier = tierMap[tier];
            if (!maxIDForTier) {
                console.log('Unknown tier:', tier);
                return { maxIDForLearns: 0 };
            }
            
            // Get current sprint day
            const currentSprintDay = this.getCurrentSprintDay(settings);
            
            // Calculate how many items should be available based on progress
            // For now, allow learning up to the tier limit
            // This could be refined to limit daily learning based on curriculum pacing
            
            return { 
                maxIDForLearns: maxIDForTier,
                currentSprintDay: currentSprintDay,
                tier: tier
            };
            
        } catch (error) {
            console.error('Error in maxIDForLearnsToday:', error);
            return { maxIDForLearns: 0 };
        }
    }
    
    getCurrentSprintDay(settings = null) {
        try {
            if (!settings) {
                const settingsContent = localStorage.getItem('settings');
                if (!settingsContent) return 1;
                
                const lines = settingsContent.split(/\r\n|\r|\n/);
                const headerRowIndex = this.findHeaderRowIndex(lines);
                settings = {};
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line && !line.startsWith('#') && i !== headerRowIndex) {
                        const columns = line.split('\t');
                        if (columns.length >= 2) {
                            settings[columns[0].trim()] = columns[1].trim();
                        }
                    }
                }
            }
            
            const startDate = settings.cStartDate || settings.startDate;
            if (!startDate) return 1;
            
            const start = new Date(startDate);
            const today = new Date();
            const diffTime = today.getTime() - start.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            return Math.max(1, diffDays + 1); // Sprint day starts at 1
            
        } catch (error) {
            console.error('Error calculating current sprint day:', error);
            return 1;
        }
    }
}

const dataManager = new DataManager();

// Expose maxIDForLearnsToday function globally for action.js
window.maxIDForLearnsToday = async function() {
    return await dataManager.maxIDForLearnsToday();
};
