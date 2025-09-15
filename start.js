// start.js - Start screen specific functionality (chart and related features)

let retentionChart = null;

// Find nickname from settings in localStorage, with default fallback
async function findNickname() {
    const settingsContent = localStorage.getItem('settings');
    if (!settingsContent) return ''; // Empty default
    
    const lines = settingsContent.split(/\r\n|\r|\n/);
    for (const line of lines) {
        if (line.trim() && !line.startsWith('#')) {
            const columns = line.split('\t');
            if (columns.length >= 2 && columns[0].trim() === 'nickname') {
                return columns[1].trim();
            }
        }
    }
    return ''; // Empty default
}

// Calculate sprint day from settings startDate in localStorage, with default fallback
async function calculateSprintDay() {
    const settingsContent = localStorage.getItem('settings');
    if (!settingsContent) return 0; // Default: DAY 0
    
    const lines = settingsContent.split(/\r\n|\r|\n/);
    let startDate = null;
    
    for (const line of lines) {
        if (line.trim() && !line.startsWith('#')) {
            const columns = line.split('\t');
            if (columns.length >= 2 && columns[0].trim() === 'startDate') {
                startDate = columns[1].trim();
                break;
            }
        }
    }
    
    if (!startDate) return 0; // Default: DAY 0
    
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1;
}

// Calculate total time spent from events duration column in localStorage, with default fallback
async function calculateTotalTime() {
    const eventsContent = localStorage.getItem('events');
    if (!eventsContent) return ''; // Empty default
    
    const lines = eventsContent.split(/\r\n|\r|\n/);
    let totalSeconds = 0;
    
    for (const line of lines) {
        if (line.trim() && !line.startsWith('#') && !line.includes('ID\t')) {
            const columns = line.split('\t');
            if (columns.length >= 4) {
                const duration = parseInt(columns[3]);
                if (!isNaN(duration)) {
                    const cappedDuration = Math.min(duration, 60);
                    totalSeconds += cappedDuration;
                }
            }
        }
    }
    
    if (totalSeconds === 0) return ''; // Empty if no time logged
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
}

// Get learn counts from userData in localStorage based on level
async function getLearnCountsFromUserData() {
    const userDataContent = localStorage.getItem('userData');
    if (!userDataContent) return null;
    
    const lines = userDataContent.split(/\r\n|\r|\n/);
    const counts = { new: 0, familiar: 0, known: 0 };
    
    // Debug: Track level distribution
    const levelDistribution = {};
    let totalItems = 0;
    
    for (const line of lines) {
        if (line.trim() && !line.startsWith('#') && !line.includes('ID\t')) {
            const columns = line.split('\t');
            if (columns.length >= 3) {
                const level = parseInt(columns[2]);
                if (!isNaN(level)) {
                    totalItems++;
                    levelDistribution[level] = (levelDistribution[level] || 0) + 1;
                    
                    // FIXED: Level 0 = not yet learned (doesn't count as new/familiar/known)
                    // Only count items that have been learned (level > 0)
                    if (level >= 1 && level < 5) {
                        counts.new += 1;
                    } else if (level >= 5 && level < 10) {
                        counts.familiar += 1;
                    } else if (level >= 10) {
                        counts.known += 1;
                    }
                    // Level 0 items are ignored - they contribute to "remaining"
                }
            }
        }
    }
    
    // Debug output
    console.log('📊 UserData Analysis:');
    console.log('Total items:', totalItems);
    console.log('Level distribution:', levelDistribution);
    console.log('Counts:', counts);
    
    return counts;
}

// Calculate learns remaining based on license tier minus already learned from localStorage
async function learnsRemaining() {
    const settingsContent = localStorage.getItem('settings');
    if (!settingsContent) return 750; // Default T1 tier for new users
    
    const lines = settingsContent.split(/\r\n|\r|\n/);
    let licence = null;
    
    for (const line of lines) {
        if (line.trim() && !line.startsWith('#')) {
            const columns = line.split('\t');
            if (columns.length >= 2 && columns[0].trim() === 'licence') {
                licence = columns[1].trim();
                break;
            }
        }
    }
    
    if (!licence) return 750; // Default T1 tier for new users
    
    const licenceParts = licence.split('-');
    if (licenceParts.length < 4) return null;
    
    const tier = licenceParts[3];
    const tierMap = {
        'T1': 750,
        'N2': 1500,
        'M3': 2250,
        'R4': 3000
    };
    
    const totalForTier = tierMap[tier];
    if (!totalForTier) return null;
    
    const counts = await getLearnCountsFromUserData();
    if (!counts) return 750; // Default T1 tier for new users
    
    const alreadyLearned = counts.new + counts.familiar + counts.known;
    return totalForTier - alreadyLearned;
}

// Calculate retention percentage from last 200 review events in localStorage
async function calculateRetentionPercentage() {
    const eventsContent = localStorage.getItem('events');
    if (!eventsContent) return null;
    
    const lines = eventsContent.split(/\r\n|\r|\n/);
    const reviewEvents = [];
    
    for (const line of lines) {
        if (line.trim() && !line.startsWith('#') && !line.includes('ID\t')) {
            const columns = line.split('\t');
            if (columns.length >= 3 && columns[1].trim().toLowerCase() === 'review') {
                reviewEvents.push({
                    result: parseFloat(columns[2])
                });
            }
        }
    }
    
    // Get last 200 entries
    const last200Reviews = reviewEvents.slice(-200);
    
    if (last200Reviews.length === 0) return null;
    
    // Sum the results (0, 0.5, or 1) and count rows
    const sum = last200Reviews.reduce((total, event) => {
        const result = event.result;
        return total + (isNaN(result) ? 0 : result);
    }, 0);
    
    const percentage = Math.round((sum / last200Reviews.length) * 100);
    return percentage;
}

// Update H1 header field with nickname
async function updateH1WithNickname() {
    const nickname = await findNickname();
    const h1Field = document.querySelector('.header-field:first-child');
    
    if (h1Field) {
        h1Field.textContent = nickname; // Will be 'nickname' default or actual nickname
    }
}

// Update H2 header field with sprint day
async function updateH2WithSprintDay() {
    const sprintDay = await calculateSprintDay();
    const h2Field = document.querySelector('.header-field:nth-child(2)');
    
    if (h2Field) {
        if (sprintDay === 0) {
            h2Field.textContent = ''; // Empty when no data
        } else {
            h2Field.textContent = `Day ${sprintDay}`;
        }
    }
}

// Update H3 header field with total time
async function updateH3WithTotalTime() {
    const totalTime = await calculateTotalTime();
    const h3Field = document.querySelector('.header-field:nth-child(3)');
    
    if (h3Field) {
        h3Field.textContent = totalTime; // Will be '0h 0m' default or actual time
    }
}

// Initialize the doughnut chart with real data
async function initializeChart() {
  const ctx = document.getElementById('retentionChart');
  
  // Get counts - convert null to zeros
  const counts = await getLearnCountsFromUserData() || { new: 0, familiar: 0, known: 0 };
  const remaining = await learnsRemaining() || 750;
  
  // Create chart with actual data
  retentionChart = new Chart(ctx.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Known', 'Familiar', 'New', 'Remaining'],
      datasets: [{
        data: [counts.known, counts.familiar, counts.new, remaining],
        backgroundColor: [
          'rgb(0,119,123)',      // known - original color
          'rgba(0,119,123,0.7)',  // familiar - lighter
          'rgba(0,119,123,0.4)',  // new - lighter still
          'rgba(0,119,123,0.1)'   // remaining - super faint almost white
        ],
        borderWidth: 0,
        cutout: '60%' // creates the doughnut hole
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false // hide legend for cleaner look
        },
        tooltip: {
          enabled: true
        }
      }
    }
  });
  
  // Update center text with retention percentage
  const retentionPercentage = await calculateRetentionPercentage();
  const centerText = document.querySelector('.chart-center-text');
  centerText.textContent = (typeof retentionPercentage === 'number' && retentionPercentage > 0) ? retentionPercentage + '%' : '';
  
  // Update chart data with current values
  retentionChart.data.datasets[0].data = [counts.known, counts.familiar, counts.new, remaining];
  retentionChart.update();
}

// Initialize start screen functionality
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Start page DOMContentLoaded');
  
  // Load data from IndexedDB to localStorage for this session
  console.log('🔄 Loading data from IndexedDB to localStorage...');
  
  try {
    // Use syncManager to restore from IndexedDB to localStorage
    if (typeof syncManager !== 'undefined' && syncManager.restoreFromIndexedDB) {
      await syncManager.restoreFromIndexedDB();
      console.log('✅ Data restored from IndexedDB to localStorage');
    } else {
      console.log('⚠️ syncManager not available, checking localStorage directly');
    }
  } catch (error) {
    console.error('❌ Error restoring from IndexedDB:', error);
  }
  
  // Show userData count alert
  const userDataContent = localStorage.getItem('userData');
  let userDataCount = 0;
  
  if (userDataContent) {
    const lines = userDataContent.split(/\r\n|\r|\n/);
    // Count non-header, non-empty lines
    userDataCount = lines.filter(line => 
      line.trim() && 
      !line.startsWith('#') && 
      !line.includes('ID\t')
    ).length;
  }
  
  alert(`📊 Start Page Loaded\n\nUserData items in localStorage: ${userDataCount}\n\n${userDataCount === 0 ? '✅ No items learned yet' : '📈 ' + userDataCount + ' items in progress'}`);
  
  // Initialize chart
  console.log('📊 Initializing chart...');
  try {
    await initializeChart();
    console.log('✅ Chart initialized successfully');
  } catch (error) {
    console.log('❌ Chart initialization failed:', error);
  }
  
  // Update header fields
  try {
    await updateH1WithNickname();
    await updateH2WithSprintDay();
    await updateH3WithTotalTime();
    console.log('✅ Header fields updated');
  } catch (error) {
    console.log('❌ Header update failed:', error);
  }
});

// Expose learnsRemaining function globally for use in other modules
window.learnsRemaining = learnsRemaining;

// Show vocab menu

