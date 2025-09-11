// start.js - Start screen specific functionality (chart and related features)

let retentionChart = null;

// Initialize the doughnut chart
function initializeChart() {
  const ctx = document.getElementById('retentionChart');
  if (!ctx) return;
  
  retentionChart = new Chart(ctx.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['First Slice', 'Second Slice', 'Third Slice', 'Fourth Slice'],
      datasets: [{
        data: [300, 150, 50, 250],
        backgroundColor: [
          'rgb(0,119,123)',      // first slice - original color
          'rgba(0,119,123,0.7)',  // second slice - lighter
          'rgba(0,119,123,0.4)',  // third slice - lighter still
          'rgba(0,119,123,0.1)'   // fourth slice - super faint almost white
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
document.addEventListener('DOMContentLoaded', function() {
  // Initialize chart after Chart.js is loaded
  if (typeof Chart !== 'undefined') {
    initializeChart();
    calculatePercentage();
  }
});
