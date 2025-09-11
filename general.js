// general.js - Shared utilities and functions used across screens

// Screen switching functionality
const themes = {
  'f1': 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)', // soft blue-gray gradient for start screen
  'f2': 'rgb(225,255,255)', // light cyan for action screen  
  'f3': 'rgb(225,225,255)'  // light blue for profile screen
};

function showScreen(screenId) {
  // Hide all screens
  const screens = document.querySelectorAll('.screen-profile, .screen-start, .screen-action');
  screens.forEach(screen => screen.classList.remove('active'));
  
  // Show the selected screen
  let targetScreen;
  switch(screenId) {
    case 'f1':
      targetScreen = document.querySelector('.screen-start');
      break;
    case 'f2':
      targetScreen = document.querySelector('.screen-action');
      break;
    case 'f3':
      targetScreen = document.querySelector('.screen-profile');
      break;
  }
  
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
  
  // Set background color
  document.querySelector('.responsive-box').style.background = themes[screenId];
}

// Utility functions that might be used across screens
function formatDate(date) {
  // Placeholder for date formatting utility
  return date.toLocaleDateString();
}

function validateInput(value, maxLength) {
  // Placeholder for input validation utility
  return value && value.length <= maxLength;
}

// Initialize app - show profile by default
document.addEventListener('DOMContentLoaded', function() {
  showScreen('f3');
});
