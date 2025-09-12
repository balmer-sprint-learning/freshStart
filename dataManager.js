/**
 * Data Manager - Step 1: Load files to localStorage and verify line counts
 */
class DataManager {
    constructor() {
        this.files = ['events', 'userData', 'testScores', 'settings', 'improves', 'conjugations'];
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
                const response = await fetch(`data/${filename}.tsv`);
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
    async loadImprovements() { throw new Error('loadImprovements not implemented yet'); }
    calculateOverallAnalytics() { throw new Error('calculateOverallAnalytics not implemented yet'); }
}

const dataManager = new DataManager();
