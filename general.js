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
      // Update H1 with nickname when start screen becomes active
      if (typeof updateH1WithNickname === 'function') {
        updateH1WithNickname();
      }
      // Update H2 with sprint day
      if (typeof updateH2WithSprintDay === 'function') {
        updateH2WithSprintDay();
      }
      // Update H3 with total time
      if (typeof updateH3WithTotalTime === 'function') {
        updateH3WithTotalTime();
      }
      // Update footer button labels for start screen
      const footerButtons = document.querySelectorAll('.footer-field');
      if (footerButtons.length >= 3) {
        footerButtons[0].textContent = 'Vocab';
        footerButtons[1].textContent = 'Fluency';
        footerButtons[2].textContent = 'Other';
      }
      break;
    case 'f2':
      targetScreen = document.querySelector('.screen-action');
      // Restore default footer button labels
      const actionFooterButtons = document.querySelectorAll('.footer-field');
      if (actionFooterButtons.length >= 3) {
        actionFooterButtons[0].textContent = 'F1';
        actionFooterButtons[1].textContent = 'F2';
        actionFooterButtons[2].textContent = 'F3';
      }
      break;
    case 'f3':
      targetScreen = document.querySelector('.screen-profile');
      // Restore default footer button labels
      const profileFooterButtons = document.querySelectorAll('.footer-field');
      if (profileFooterButtons.length >= 3) {
        profileFooterButtons[0].textContent = 'F1';
        profileFooterButtons[1].textContent = 'F2';
        profileFooterButtons[2].textContent = 'F3';
      }
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

// Get maximum ID based on user license tier
async function maxID() {
  try {
    // Get user settings to find license
    const settings = await dataManager.loadSettings();
    if (!settings || !settings.licence) {
      throw new Error('License not found in settings');
    }
    
    const license = settings.licence;
    console.log(`License: ${license}`);
    
    // Extract tier from license (format: XX-XXX-XX-TX-X-XXX where TX is the tier)
    const tierMatch = license.match(/-(T1|N2|M3|R4)-/);
    if (!tierMatch) {
      throw new Error(`Could not extract tier from license: ${license}`);
    }
    
    const tier = tierMatch[1];
    console.log(`Tier: ${tier}`);
    
    // Return max ID based on tier
    switch(tier) {
      case 'T1': return 750;
      case 'N2': return 1500;
      case 'M3': return 2250;
      case 'R4': return 3000;
      default: 
        throw new Error(`Unknown tier: ${tier}`);
    }
  } catch (error) {
    console.error('Error in maxID():', error);
    throw error;
  }
}

// Calculate maximum ID allowed for learns today
async function maxIDForLearnsToday() {
  try {
    // Get current sprint day
    const currentSprintDay = await calculateSprintDay();
    if (!currentSprintDay) {
      throw new Error('Could not calculate current sprint day');
    }
    
    // Calculate time-based limit (sprintDay * 25)
    const timeBasedLimit = currentSprintDay * 25;
    
    // Get license-based limit from tier
    const licenseBasedLimit = await maxID();
    
    // Max ID for learns is the smaller of the two limits
    const maxIDForLearns = Math.min(timeBasedLimit, licenseBasedLimit);
    
    return {
      currentSprintDay: currentSprintDay,
      timeBasedLimit: timeBasedLimit,
      licenseBasedLimit: licenseBasedLimit,
      maxIDForLearns: maxIDForLearns,
      breakdown: `Sprint day: ${currentSprintDay}, Time limit (${currentSprintDay} × 25): ${timeBasedLimit}, License limit: ${licenseBasedLimit}, Max ID for learns: ${maxIDForLearns} (smaller of both)`
    };
    
  } catch (error) {
    console.error('Error in maxIDForLearnsToday():', error);
    throw error;
  }
}

// Reusable popup menu function
async function showPopupMenu(menuId, leftPosition, menuItems, clickHandler) {
  // Remove existing menus if present
  hideAllMenus();
  
  // Create menu container
  const menu = document.createElement('div');
  menu.id = menuId;
  menu.style.cssText = `
    position: fixed;
    bottom: calc(10 * var(--vh));
    left: ${leftPosition};
    transform: translateX(-50%);
    background: white;
    border: 1px solid #ccc;
    border-radius: calc(1 * var(--vh));
    box-shadow: 0 calc(0.5 * var(--vh)) calc(1.5 * var(--vh)) rgba(0,0,0,0.15);
    padding: calc(1 * var(--vh)) 0;
    min-width: calc(15 * var(--vw));
    opacity: 0;
    transition: opacity 0.1s ease-in-out;
    z-index: 1000;
  `;
  
  // Create menu items
  menuItems.forEach((item, index) => {
    const menuItem = document.createElement('div');
    menuItem.textContent = item;
    menuItem.style.cssText = `
      padding: calc(1 * var(--vh)) calc(2 * var(--vw));
      cursor: pointer;
      text-transform: capitalize;
      border-bottom: ${index === menuItems.length - 1 ? 'none' : '1px solid #eee'};
    `;
    
    // Add hover effect
    menuItem.addEventListener('mouseover', () => {
      menuItem.style.backgroundColor = '#f5f5f5';
    });
    menuItem.addEventListener('mouseout', () => {
      menuItem.style.backgroundColor = 'transparent';
    });
    
    // Add click handler
    menuItem.addEventListener('click', () => {
      clickHandler(item);
      hideAllMenus();
    });
    
    menu.appendChild(menuItem);
  });
  
  // Add menu to page
  document.body.appendChild(menu);
  
  // Fade in
  setTimeout(() => {
    menu.style.opacity = '1';
  }, 10);
  
  // Add click-outside handler
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 100);
}

// Handle click outside menu to close it
function handleClickOutside(event) {
  const menus = document.querySelectorAll('[id$="-menu"]');
  let clickedInside = false;
  
  menus.forEach(menu => {
    if (menu.contains(event.target)) {
      clickedInside = true;
    }
  });
  
  if (!clickedInside) {
    hideAllMenus();
  }
}

// Hide all popup menus
function hideAllMenus() {
  const menus = document.querySelectorAll('[id$="-menu"]');
  menus.forEach(menu => menu.remove());
  document.removeEventListener('click', handleClickOutside);
}

// Initialize app - show profile by default
document.addEventListener('DOMContentLoaded', function() {
  showScreen('f3');
});
