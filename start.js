// start.js - Start screen specific functionality (chart and related features)

let retentionChart = null;

// Find nickname from settings.tsv
async function findNickname() {
    const settings = await dataManager.loadSettings();
    return settings ? settings.nickname : null;
}

// Calculate sprint day from settings startDate
async function calculateSprintDay() {
    const settings = await dataManager.loadSettings();
    if (!settings || !settings.startDate) return null;
    
    const today = new Date();
    const start = new Date(settings.startDate);
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1;
}

// Calculate total time spent from events duration column
async function calculateTotalTime() {
    const events = await dataManager.loadEventsData();
    if (!events) return null;
    
    const totalSeconds = events.reduce((sum, event) => {
        const cappedDuration = Math.min(event.duration, 60);
        return sum + cappedDuration;
    }, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
}

// Get learn counts from userData based on level
async function getLearnCountsFromUserData() {
    const userData = await dataManager.loadUserData();
    if (!userData) return null;
    
    const counts = { new: 0, familiar: 0, known: 0 };
    
    userData.forEach(user => {
        if (user.level < 5) {
            counts.new += 1;
        } else if (user.level >= 5 && user.level < 10) {
            counts.familiar += 1;
        } else if (user.level >= 10) {
            counts.known += 1;
        }
    });
    
    return counts;
}

// Calculate learns remaining based on license tier minus already learned
async function learnsRemaining() {
    const settings = await dataManager.loadSettings();
    if (!settings || !settings.licence) return null;
    
    const licenceParts = settings.licence.split('-');
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
    if (!counts) return null;
    
    const alreadyLearned = counts.new + counts.familiar + counts.known;
    return totalForTier - alreadyLearned;
}

// Calculate retention percentage from last 200 review events
async function calculateRetentionPercentage() {
    const events = await dataManager.loadEventsData();
    if (!events) return null;
    
    // Filter for review actions and get last 200
    const reviewEvents = events.filter(event => event.action.toLowerCase() === 'review');
    const last200Reviews = reviewEvents.slice(-200); // Get last 200 entries
    
    if (last200Reviews.length === 0) return null;
    
    // Sum the results (0, 0.5, or 1) and count rows
    const sum = last200Reviews.reduce((total, event) => {
        const result = parseFloat(event.result);
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
        if (nickname) {
            h1Field.textContent = nickname;
        } else {
            h1Field.textContent = 'h1'; // fallback to default
        }
    }
}

// Update H2 header field with sprint day
async function updateH2WithSprintDay() {
    const sprintDay = await calculateSprintDay();
    const h2Field = document.querySelector('.header-field:nth-child(2)');
    
    if (h2Field) {
        if (sprintDay) {
            h2Field.textContent = sprintDay;
        } else {
            h2Field.textContent = 'h2'; // fallback to default
        }
    }
}

// Update H3 header field with total time
async function updateH3WithTotalTime() {
    const totalTime = await calculateTotalTime();
    const h3Field = document.querySelector('.header-field:nth-child(3)');
    
    if (h3Field) {
        if (totalTime) {
            h3Field.textContent = totalTime;
        } else {
            h3Field.textContent = 'h3'; // fallback to default
        }
    }
}

// Initialize the doughnut chart with real data
async function initializeChart() {
  const ctx = document.getElementById('retentionChart');
  if (!ctx) return;
  
  // Get real data from our functions
  const counts = await getLearnCountsFromUserData();
  const remaining = await learnsRemaining();
  const retentionPercentage = await calculateRetentionPercentage();
  
  if (!counts || remaining === null) {
    return null;
  }
  
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
  
  // Update center text with real retention percentage
  if (retentionPercentage !== null) {
    updateCenterText(retentionPercentage);
  }
}

// Update chart data
function updateChartData(newData) {
  if (retentionChart && newData && newData.length === 4) {
    retentionChart.data.datasets[0].data = newData;
    retentionChart.update();
  }
}

// Update the center percentage text
function updateCenterText(percentage) {
  const centerText = document.querySelector('.chart-center-text');
  if (centerText) {
    centerText.textContent = percentage + '%';
  }
}

// Calculate percentage from chart data
function calculatePercentage() {
  if (retentionChart) {
    const data = retentionChart.data.datasets[0].data;
    const total = data.reduce((sum, value) => sum + value, 0);
    const percentage = Math.round((data[0] / total) * 100);
    updateCenterText(percentage);
  }
}

// Initialize start screen functionality
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize chart after Chart.js is loaded
  if (typeof Chart !== 'undefined') {
    await initializeChart();
  }
});

// Show vocab menu

