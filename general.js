// general.js - Shared utilities and functions used across screens

// Global variable for action mode
let mode = localStorage.getItem('mode') || null;

// Utility functions that might be used across screens
function formatDate(date) {
  // Placeholder for date formatting utility
  return date.toLocaleDateString();
}

function validateInput(value, maxLength) {
  // Placeholder for input validation utility
  return value && value.length <= maxLength;
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
  let clickedInsideMenu = false;
  
  menus.forEach(menu => {
    if (menu.contains(event.target)) {
      clickedInsideMenu = true;
    }
  });
  
  if (!clickedInsideMenu) {
    hideAllMenus();
  }
}

// Hide all popup menus
function hideAllMenus() {
  const menus = document.querySelectorAll('[id$="-menu"]');
  menus.forEach(menu => {
    menu.remove();
  });
  document.removeEventListener('click', handleClickOutside);
}

// Setup footer menu functionality (works on all pages)
function setupFooterMenus() {
  const vocabButton = document.querySelector('.footer-field:nth-child(1)');
  const fluencyButton = document.querySelector('.footer-field:nth-child(2)');
  const otherButton = document.querySelector('.footer-field:nth-child(3)');
  
  if (vocabButton) {
    // Add event listeners for vocab button (F1)
    vocabButton.addEventListener('click', handleVocabMenuClick);
    vocabButton.addEventListener('mouseover', handleVocabMenuHover);
  }
  
  if (fluencyButton) {
    // Add event listeners for fluency button (F2)
    fluencyButton.addEventListener('click', handleFluencyMenuClick);
    fluencyButton.addEventListener('mouseover', handleFluencyMenuHover);
  }
  
  if (otherButton) {
    // Add event listeners for other button (F3)
    otherButton.addEventListener('click', handleOtherMenuClick);
    otherButton.addEventListener('mouseover', handleOtherMenuHover);
  }
}

// Handle vocab menu click/hover
async function handleVocabMenuClick(event) {
  event.preventDefault();
  event.stopPropagation();
  await showVocabMenu();
}

async function handleVocabMenuHover(event) {
  await showVocabMenu();
}

// Handle fluency menu click/hover
async function handleFluencyMenuClick(event) {
  event.preventDefault();
  event.stopPropagation();
  await showFluencyMenu();
}

async function handleFluencyMenuHover(event) {
  await showFluencyMenu();
}

// Handle other menu click/hover
async function handleOtherMenuClick(event) {
  event.preventDefault();
  event.stopPropagation();
  await showOtherMenu();
}

async function handleOtherMenuHover(event) {
  await showOtherMenu();
}

// Calculate learns remaining based on license tier minus already learned
// This is a copy of the tested function from start.js for use in general.js
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
    
    // Count items that are available for learning (level = 0)
    const userData = await dataManager.loadUserData();
    if (!userData) return null;
    
    let availableForLearning = 0;
    userData.forEach(user => {
        if (user.level === 0) {
            availableForLearning += 1;
        }
    });
    
    console.log(`📊 Found ${availableForLearning} items available for learning (level = 0)`);
    return availableForLearning;
}

// Show vocab menu using reusable popup function
async function showVocabMenu() {
  console.log('🎯 showVocabMenu called');
  
  try {
    // Get remaining learns count
    console.log('📊 Calling learnsRemaining()...');
    const remaining = await learnsRemaining();
    console.log('📊 learnsRemaining() result:', remaining);
    
    // Create menu items
    const menuItems = ['improve', 'review'];
    
    // Add 'learn' only if learns remaining
    if (remaining && remaining > 0) {
      menuItems.push('learn');
      console.log('✅ Added "learn" to menu items');
    } else {
      console.log('❌ No learns remaining, learn option not added');
    }
    
    console.log('📋 Menu items:', menuItems);
    
    // Use reusable popup menu function
    await showPopupMenu(
      'vocab-menu',
      'calc(16.67 * var(--vw))',
      menuItems,
      (selectedItem) => {
        console.log('🎯 Menu item selected:', selectedItem);
        mode = selectedItem;
        localStorage.setItem('mode', mode);
        // Trigger sync on mode change
        if (window.syncManager) {
          window.syncManager.onModeChange();
        }
        // Trigger sync on page change
        if (window.syncManager) {
          window.syncManager.onPageChange();
        }
        window.location.href = 'action.html';
      }
    );
    
    console.log('✅ showPopupMenu completed');
  } catch (error) {
    console.error('❌ Error in showVocabMenu:', error);
  }
}

// Show fluency menu using reusable popup function
async function showFluencyMenu() {
  const menuItems = ['verbs', 'listening', 'composition', 'errors'];
  
  // Use reusable popup menu function
  await showPopupMenu(
    'fluency-menu',
    'calc(50 * var(--vw))',
    menuItems,
    (selectedItem) => {
      mode = selectedItem;
      localStorage.setItem('mode', mode);
      // Trigger sync on mode change
      if (window.syncManager) {
        window.syncManager.onModeChange();
      }
      // Trigger sync on page change
      if (window.syncManager) {
        window.syncManager.onPageChange();
      }
      window.location.href = 'action.html';
    }
  );
}

// Show other menu using reusable popup function
async function showOtherMenu() {
  const menuItems = ['profile', 'settings'];
  
  // Use reusable popup menu function
  await showPopupMenu(
    'other-menu',
    'calc(83.33 * var(--vw))',
    menuItems,
    (selectedItem) => {
      mode = selectedItem;
      localStorage.setItem('mode', mode);
      // Trigger sync on mode change
      if (window.syncManager) {
        window.syncManager.onModeChange();
      }
      // Trigger sync on page change
      if (window.syncManager) {
        window.syncManager.onPageChange();
      }
      window.location.href = 'profile.html';
    }
  );
}

// Initialize footer menus on page load
document.addEventListener('DOMContentLoaded', function() {
  setupFooterMenus();
  
  // Update h1 with current mode value
  updateH1WithMode();
});

// Update H1 header field with mode value
function updateH1WithMode() {
  const h1Field = document.querySelector('.header-field:first-child');
  
  if (h1Field) {
    if (typeof mode !== 'undefined' && mode) {
      h1Field.textContent = mode;
    } else {
      h1Field.textContent = 'home'; // fallback to default
    }
  }
}