// profile.js - Profile screen specific functionality

// Profile form handling
function handleProfileForm() {
  const form = document.querySelector('.profile-form');
  if (!form) return;
  
  // Handle nickname validation (2 characters max)
  const nicknameField = document.getElementById('nickname');
  if (nicknameField) {
    nicknameField.addEventListener('input', function(e) {
      // Auto-uppercase and limit to 2 characters
      e.target.value = e.target.value.toUpperCase().slice(0, 2);
    });
  }
  
  // Handle start button click
  const startButton = document.querySelector('.start-button');
  if (startButton) {
    startButton.addEventListener('click', function() {
      // Placeholder for start button functionality
      console.log('Starting 31 days program...');
      // Could navigate to start screen or perform other actions
      showScreen('f1');
    });
  }
}

// Calculate license and prefix values
function calculateLicense() {
  // Placeholder for license calculation logic
  const licenseField = document.getElementById('licence');
  if (licenseField) {
    licenseField.value = 'LIC-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
}

function calculatePrefix() {
  // Placeholder for prefix calculation logic
  const prefixField = document.getElementById('prefix');
  const nickname = document.getElementById('nickname')?.value || '';
  if (prefixField && nickname) {
    prefixField.value = nickname + '-' + new Date().getFullYear();
  }
}

// Initialize profile screen functionality
document.addEventListener('DOMContentLoaded', function() {
  handleProfileForm();
  
  // Auto-calculate license and prefix when nickname changes
  const nicknameField = document.getElementById('nickname');
  if (nicknameField) {
    nicknameField.addEventListener('input', function() {
      calculateLicense();
      calculatePrefix();
    });
  }
});
