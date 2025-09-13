// action.js - Action screen specific functionality

// Global variables for current session
let currentItems = [];
let sessionCompleted = 0; // Track how many items completed this session
let itemDisplayStart = null; // Track when current item was first displayed

// Build currentItems array based on mode
async function buildCurrentItems(modeParam = null, debug = false) {
  const currentMode = modeParam || mode;
  let debugLog = [];
  debugLog.push(`Building currentItems for mode: ${currentMode}`);
  
  // Clear current items
  currentItems = [];
  
  if (currentMode === 'improve') {
    try {
      // Get improves data from localStorage
      const content = localStorage.getItem('improves');
      if (!content) {
        throw new Error('Improves data not found in localStorage');
      }
      
      debugLog.push(`Improves content length: ${content.length} characters`);
      
      const lines = content.split(/\r\n|\r|\n/);
      debugLog.push(`Split into ${lines.length} lines`);
      
      // Find header row using dataManager pattern
      let headerRowIndex = null;
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i].trim();
        if (line.includes('# headerRow =')) {
          const match = line.match(/headerRow\s*=\s*(\d+)/);
          if (match) {
            headerRowIndex = parseInt(match[1]) - 1; // Convert to 0-based
            debugLog.push(`Header row found at index: ${headerRowIndex}`);
            break;
          }
        }
      }
      
      // Extract IDs from data lines
      let processedLines = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('#') && i !== headerRowIndex) {
          // For improves.tsv, each line is just an ID
          currentItems.push(line);
          processedLines++;
        }
      }
      
      debugLog.push(`Processed ${processedLines} data lines`);
      debugLog.push(`Loaded ${currentItems.length} improve items: ${currentItems.slice(0, 5).join(', ')}${currentItems.length > 5 ? '...' : ''}`);
      
    } catch (error) {
      debugLog.push(`Error building currentItems: ${error.message}`);
      console.error('Error building currentItems:', error);
      throw error;
    }
  } else if (currentMode === 'review') {
    try {
      // Get current sprint day
      const sprintDay = await calculateSprintDay();
      if (!sprintDay) {
        throw new Error('Could not calculate current sprint day');
      }
      
      debugLog.push(`Current sprint day: ${sprintDay}`);
      
      // Get userData from localStorage
      const content = localStorage.getItem('userData');
      if (!content) {
        throw new Error('UserData not found in localStorage');
      }
      
      debugLog.push(`UserData content length: ${content.length} characters`);
      
      const lines = content.split(/\r\n|\r|\n/);
      debugLog.push(`Split into ${lines.length} lines`);
      
      // Find header row using dataManager pattern
      let headerRowIndex = null;
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i].trim();
        debugLog.push(`Line ${i}: "${line}" - contains headerRow? ${line.includes('# headerRow =')}`);
        if (line.includes('# headerRow =')) {
          const match = line.match(/headerRow\s*=\s*(\d+)/);
          if (match) {
            headerRowIndex = parseInt(match[1]) - 1; // Convert to 0-based
            debugLog.push(`Header row found at index: ${headerRowIndex}`);
            break;
          }
        }
      }
      
      // Extract IDs where NRD <= current SprintDay
      let processedLines = 0;
      let qualifyingLines = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('#') && i !== headerRowIndex) {
          processedLines++;
          const columns = line.split('\t');
          if (columns.length >= 3) {
            const id = columns[0].trim();
            const nrd = parseInt(columns[1].trim());
            
            if (processedLines <= 5) {
              debugLog.push(`Row ${i}: ID="${id}" NRD="${nrd}" - qualifies? ${nrd <= sprintDay}`);
            }
            
            // Include if NRD <= current sprint day
            if (nrd <= sprintDay) {
              currentItems.push(id);
              qualifyingLines++;
            }
          }
        }
      }
      
      debugLog.push(`Processed ${processedLines} data lines`);
      debugLog.push(`Found ${qualifyingLines} qualifying lines`);
      debugLog.push(`Loaded ${currentItems.length} review items: ${currentItems.slice(0, 5).join(', ')}${currentItems.length > 5 ? '...' : ''}`);
      
    } catch (error) {
      debugLog.push(`Error building currentItems for review: ${error.message}`);
      console.error('Error building currentItems for review:', error);
      throw error;
    }
  } else if (currentMode === 'learn') {
    try {
      // Get max ID allowed for learns today
      const maxIDResult = await maxIDForLearnsToday();
      const maxIDForLearns = maxIDResult.maxIDForLearns;
      
      debugLog.push(`Max ID for learns today: ${maxIDForLearns}`);
      
      // Get userData from localStorage
      const content = localStorage.getItem('userData');
      if (!content) {
        throw new Error('UserData not found in localStorage');
      }
      
      debugLog.push(`UserData content length: ${content.length} characters`);
      
      const lines = content.split(/\r\n|\r|\n/);
      debugLog.push(`Split into ${lines.length} lines`);
      
      // Find header row using dataManager pattern
      let headerRowIndex = null;
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i].trim();
        if (line.includes('# headerRow =')) {
          const match = line.match(/headerRow\s*=\s*(\d+)/);
          if (match) {
            headerRowIndex = parseInt(match[1]) - 1; // Convert to 0-based
            debugLog.push(`Header row found at index: ${headerRowIndex}`);
            break;
          }
        }
      }
      
      // Extract IDs where level = 0 and ID <= maxIDForLearns
      let processedLines = 0;
      let levelZeroLines = 0;
      let validLearnItems = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('#') && i !== headerRowIndex) {
          processedLines++;
          const columns = line.split('\t');
          if (columns.length >= 3) {
            const id = parseInt(columns[0].trim());
            const level = parseInt(columns[2].trim());
            
            if (level === 0) {
              levelZeroLines++;
              if (processedLines <= 5) {
                debugLog.push(`Row ${i}: ID="${id}" LEVEL="${level}" - not learned yet`);
              }
              
              // Include if ID <= max allowed for learns
              if (id <= maxIDForLearns) {
                validLearnItems.push({ id: id, originalId: columns[0].trim() });
              }
            }
          }
        }
      }
      
      // Sort by ID to ensure proper order
      validLearnItems.sort((a, b) => a.id - b.id);
      
      // Extract just the original ID strings
      for (const item of validLearnItems) {
        currentItems.push(item.originalId);
      }
      
      debugLog.push(`Processed ${processedLines} data lines`);
      debugLog.push(`Found ${levelZeroLines} items with level=0`);
      debugLog.push(`Found ${currentItems.length} valid learn items (ID <= ${maxIDForLearns})`);
      debugLog.push(`Loaded ${currentItems.length} learn items: ${currentItems.slice(0, 5).join(', ')}${currentItems.length > 5 ? '...' : ''}`);
      
    } catch (error) {
      debugLog.push(`Error building currentItems for learn: ${error.message}`);
      console.error('Error building currentItems for learn:', error);
      throw error;
    }
  } else if (currentMode === 'verbs' || currentMode === 'listening' || currentMode === 'composition' || currentMode === 'errors') {
    try {
      // Map mode to theme
      let targetTheme;
      switch(currentMode) {
        case 'verbs': targetTheme = 'verbConjugation'; break;
        case 'listening': targetTheme = 'listen'; break;
        case 'composition': targetTheme = 'compose'; break;
        case 'errors': targetTheme = 'ERRORS'; break;
      }
      
      debugLog.push(`Looking for curriculum items with theme: ${targetTheme}`);
      
      // Get curriculum data
      const curriculum = await dataManager.loadCurriculum();
      if (!curriculum) {
        throw new Error('Curriculum data not found');
      }
      
      debugLog.push(`Curriculum loaded: ${curriculum.length} items`);
      
      // Filter by theme
      const matchingItems = curriculum.filter(item => item.theme === targetTheme);
      debugLog.push(`Found ${matchingItems.length} items matching theme "${targetTheme}"`);
      
      if (matchingItems.length === 0) {
        debugLog.push(`No items found for theme "${targetTheme}"`);
        // Return empty list if no matches
      } else {
        // Get 10 random items (or all if less than 10)
        const shuffled = [...matchingItems].sort(() => 0.5 - Math.random());
        const selectedItems = shuffled.slice(0, 10);
        
        // Extract IDs
        for (const item of selectedItems) {
          currentItems.push(item.ids);
        }
        
        debugLog.push(`Selected ${currentItems.length} random items from ${matchingItems.length} matches`);
        debugLog.push(`Items: ${currentItems.join(', ')}`);
      }
      
    } catch (error) {
      debugLog.push(`Error building currentItems for ${currentMode}: ${error.message}`);
      console.error(`Error building currentItems for ${currentMode}:`, error);
      throw error;
    }
  } else {
    debugLog.push(`Mode "${currentMode}" not yet implemented`);
  }
  
  if (debug) {
    return { items: currentItems, debugLog: debugLog };
  }
  
  return currentItems;
}

// Action screen form handling
function handleActionForm() {
  const questionField = document.getElementById('question');
  const clueField = document.getElementById('clue');
  const answerField = document.getElementById('answer');
  const infoField = document.getElementById('info');
  
  // Limit question and answer to 10 words
  [questionField, answerField].forEach(field => {
    if (field) {
      field.addEventListener('input', function(e) {
        const words = e.target.value.split(/\s+/).filter(word => word.length > 0);
        if (words.length > 10) {
          e.target.value = words.slice(0, 10).join(' ');
        }
      });
    }
  });
}

// Handle button functionality
function handleActionButtons() {
  const btn1 = document.getElementById('btn1');
  const btn2 = document.getElementById('btn2');
  const btn3 = document.getElementById('btn3');
  
  if (btn1) {
    btn1.addEventListener('click', function() {
      console.log('Button 1 clicked');
      // Create event with appropriate result value
      const resultValue = (mode === 'learn') ? 'known' : 0;
      createEvent(resultValue).then(() => {
        removeCurrentItem(false);
      }).catch(error => {
        console.error('Error in button 1 handler:', error);
        removeCurrentItem(false); // Still remove item even if event creation fails
      });
    });
  }
  
  if (btn2) {
    btn2.addEventListener('click', function() {
      console.log('Button 2 clicked');
      // Create event with appropriate result value
      const resultValue = (mode === 'learn') ? 'familiar' : 0.5;
      createEvent(resultValue).then(() => {
        removeCurrentItem(false);
      }).catch(error => {
        console.error('Error in button 2 handler:', error);
        removeCurrentItem(false); // Still remove item even if event creation fails
      });
    });
  }
  
  if (btn3) {
    btn3.addEventListener('click', function() {
      console.log('Button 3 clicked');
      // Create event with appropriate result value
      const resultValue = (mode === 'learn') ? 'new' : 1;
      createEvent(resultValue).then(() => {
        removeCurrentItem(true);
      }).catch(error => {
        console.error('Error in button 3 handler:', error);
        removeCurrentItem(true); // Still remove item even if event creation fails
      });
    });
  }
}

// Create event when button is pressed
async function createEvent(result) {
  console.log(`🎯 Button clicked with result: ${result}`);
  
  if (currentItems.length === 0 || itemDisplayStart === null) {
    console.log('❌ Cannot create event: no current item or display start time');
    console.log(`  - currentItems.length: ${currentItems.length}`);
    console.log(`  - itemDisplayStart: ${itemDisplayStart}`);
    return;
  }
  
  const itemId = currentItems[0];
  const action = mode || 'unknown';
  const duration = Math.round((Date.now() - itemDisplayStart) / 1000); // Duration in seconds
  
  console.log(`📊 Event details: itemId=${itemId}, action=${action}, duration=${duration}s`);
  
  const sprintDay = await calculateSprintDay();
  
  if (sprintDay !== null) {
    console.log(`📅 Sprint day calculated: ${sprintDay}`);
    await addEventToStorage(itemId, action, result, duration, sprintDay);
  } else {
    console.error('❌ Could not calculate sprint day for event');
  }
}

// Remove current item from currentItems and optionally from storage
function removeCurrentItem(deleteFromStorage = false) {
  if (currentItems.length === 0) {
    console.log('No items remaining in currentItems');
    return;
  }
  
  // Get the first item (current item being processed)
  const currentItemId = currentItems[0];
  
  // Remove from currentItems array
  currentItems.shift(); // Remove first item
  
  // Increment session progress
  sessionCompleted++;
  updateH2WithProgress();
  
  console.log(`Removed item ${currentItemId} from currentItems. Remaining: ${currentItems.length}`);
  
  if (deleteFromStorage && typeof mode !== 'undefined' && mode === 'improve') {
    // Remove from improves storage
    removeFromImprovesStorage(currentItemId);
  }
  
  // Load the next item
  loadCurrentItem();
}

// Remove item from improves storage by ID
function removeFromImprovesStorage(itemId) {
  try {
    const content = localStorage.getItem('improves');
    if (!content) {
      console.error('Improves data not found in localStorage');
      return;
    }
    
    const lines = content.split(/\r\n|\r|\n/);
    const updatedLines = [];
    let removed = false;
    
    // Find header row
    let headerRowIndex = null;
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();
      if (line.includes('# headerRow =')) {
        const match = line.match(/headerRow\s*=\s*(\d+)/);
        if (match) {
          headerRowIndex = parseInt(match[1]) - 1;
          break;
        }
      }
    }
    
    // Filter out the target item
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Keep comments and header row
      if (line.startsWith('#') || i === headerRowIndex) {
        updatedLines.push(lines[i]);
      } else if (line === itemId) {
        // This is the item to remove
        removed = true;
        console.log(`Removed item ${itemId} from improves storage`);
      } else if (line) {
        // Keep other data lines
        updatedLines.push(lines[i]);
      } else {
        // Keep empty lines
        updatedLines.push(lines[i]);
      }
    }
    
    if (removed) {
      // Update localStorage with modified content
      const updatedContent = updatedLines.join('\n');
      localStorage.setItem('improves', updatedContent);
      console.log(`Updated improves storage. Item ${itemId} permanently removed.`);
    } else {
      console.log(`Item ${itemId} not found in improves storage`);
    }
    
  } catch (error) {
    console.error('Error removing item from improves storage:', error);
  }
}

// Increment session progress and update H2
function incrementSessionProgress() {
  // This function is no longer needed as removeCurrentItem handles the progress
  updateH2WithProgress();
}

// Load and display the current item from curriculum
async function loadCurrentItem() {
  if (currentItems.length === 0) {
    console.log('No items in currentItems to load');
    clearActionFields();
    return;
  }
  
  const currentItemId = currentItems[0];
  console.log(`Loading curriculum item for ID: ${currentItemId}`);
  
  try {
    // Use the proper dataManager to get curriculum objects
    const curriculum = await dataManager.loadCurriculum();
    if (!curriculum) {
      throw new Error('Curriculum data not found');
    }
    
    console.log(`Curriculum loaded: ${curriculum.length} items`);
    
    // Find the matching curriculum item by ID (ids property)
    const foundItem = curriculum.find(item => item.ids === currentItemId);
    
    if (foundItem) {
      console.log(`Found curriculum item:`, foundItem);
      // Display the item in the form fields using proper object properties
      displayCurrentItem(foundItem);
    } else {
      console.log(`No curriculum item found for ID: ${currentItemId}`);
      clearActionFields();
    }
    
  } catch (error) {
    console.error('Error loading current item from curriculum:', error);
    clearActionFields();
  }
}

// Display item data in the form fields
function displayCurrentItem(item) {
  const questionField = document.getElementById('action-question');
  const clueField = document.getElementById('action-clue');
  const answerField = document.getElementById('action-answer');
  
  if (questionField) questionField.value = item.question || '';
  if (clueField) clueField.value = item.clue || '';
  
  // Start with completely blank answer field
  if (answerField) {
    answerField.value = '';
  }
  
  // Determine delay based on mode
  let delay;
  if (typeof mode !== 'undefined') {
    if (mode === 'improve') {
      delay = 6000; // 6 seconds for improve mode
    } else if (mode === 'learn') {
      delay = 2000; // 2 seconds for learn mode
    } else {
      delay = 3000; // 3 seconds for other modes
    }
  } else {
    delay = 3000; // 3 seconds default
  }
  
  console.log(`Answer will appear in ${delay/1000} seconds (mode: ${mode || 'default'})`);
  
  // Show answer after delay with fade-in effect on text only
  setTimeout(() => {
    if (answerField) {
      answerField.style.opacity = '0';
      answerField.value = item.answer || '';
      answerField.style.transition = 'opacity 1s ease';
      
      // Fade in the text
      setTimeout(() => {
        answerField.style.opacity = '1';
      }, 50);
      
      console.log(`Answer revealed: "${item.answer}"`);
    }
  }, delay);
  
  // Reset timer for new item display
  itemDisplayStart = Date.now();
  
  console.log(`Displayed item ${item.ids}: Q="${item.question}" C="${item.clue}" A="${item.answer}"`);
  console.log(`Item display timer started at: ${new Date(itemDisplayStart).toLocaleTimeString()}`);
}

// Load and display recent events for development
async function loadRecentEvents() {
  try {
    console.log('🔄 Loading recent events...');
    const content = localStorage.getItem('events');
    if (!content) {
      console.log('⚠️ No events content in localStorage');
      updateEventsDisplay('Events count: 0\n\nNo events data found.');
      return;
    }
    
    console.log(`📄 Events content length: ${content.length} characters`);
    
    const lines = content.split(/\r\n|\r|\n/);
    console.log(`📄 Split into ${lines.length} lines`);
    
    let eventLines = [];
    let headerRowIndex = null;
    
    // Find header row
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();
      if (line.includes('# headerRow =')) {
        const match = line.match(/headerRow\s*=\s*(\d+)/);
        if (match) {
          headerRowIndex = parseInt(match[1]) - 1;
          console.log(`📍 Header row found at index: ${headerRowIndex}`);
          break;
        }
      }
    }
    
    // Collect data lines (skip comments and header)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#') && i !== headerRowIndex) {
        eventLines.push(line);
        if (eventLines.length <= 3) {
          console.log(`📊 Event line ${i}: "${line}"`);
        }
      }
    }
    
    console.log(`📊 Found ${eventLines.length} event data lines`);
    
    // Get last 3 events
    const recentEvents = eventLines.slice(-3);
    const totalEvents = eventLines.length;
    
    console.log(`📊 Recent events: ${recentEvents.length}, Total events: ${totalEvents}`);
    
    // Format display
    let displayText = `Events count: ${totalEvents}\n\n`;
    
    if (recentEvents.length === 0) {
      displayText += 'No events found.';
    } else {
      displayText += 'Recent events (last 3):\n';
      recentEvents.forEach((event, index) => {
        const columns = event.split('\t');
        const id = columns[0] || '';
        const action = columns[1] || '';
        const result = columns[2] || '';
        const duration = columns[3] || '';
        const sprintDay = columns[4] || '';
        const ap = columns[5] || '';
        
        displayText += `${index + 1}. ID:${id} Action:${action} Result:${result} Duration:${duration}s SprintDay:${sprintDay} A/P:${ap}\n`;
      });
    }
    
    console.log(`📝 Display text: "${displayText}"`);
    updateEventsDisplay(displayText);
    
  } catch (error) {
    console.error('❌ Error loading recent events:', error);
    updateEventsDisplay('Error loading events data.');
  }
}

// Update the events display field
function updateEventsDisplay(text) {
  console.log(`📺 Updating events display with: "${text.substring(0, 100)}..."`);
  const eventsField = document.getElementById('events-display');
  if (eventsField) {
    eventsField.value = text;
    // Scroll to bottom to show newest events
    eventsField.scrollTop = eventsField.scrollHeight;
    console.log('✅ Events display updated successfully');
  } else {
    console.log('❌ Events display field not found!');
  }
}

// Clear all action form fields
function clearActionFields() {
  const questionField = document.getElementById('action-question');
  const clueField = document.getElementById('action-clue');
  const answerField = document.getElementById('action-answer');
  
  if (questionField) questionField.value = '';
  if (clueField) clueField.value = '';
  if (answerField) answerField.value = '';
}
function updateH2WithProgress() {
  const h2Field = document.querySelector('.header-field:nth-child(2)');
  
  if (h2Field && typeof mode !== 'undefined' && mode === 'improve') {
    const remaining = currentItems.length - sessionCompleted;
    h2Field.textContent = `${sessionCompleted}/${currentItems.length}`;
  } else if (h2Field) {
    h2Field.textContent = 'h2'; // fallback to default
  }
}
function updateButtonLabels(label1, label2, label3) {
  const btn1 = document.getElementById('btn1');
  const btn2 = document.getElementById('btn2');
  const btn3 = document.getElementById('btn3');
  
  if (btn1) btn1.textContent = label1 || 'B1';
  if (btn2) btn2.textContent = label2 || 'B2';
  if (btn3) btn3.textContent = label3 || 'B3';
}

// Get form data
function getActionFormData() {
  return {
    question: document.getElementById('question')?.value || '',
    clue: document.getElementById('clue')?.value || '',
    answer: document.getElementById('answer')?.value || '',
    info: document.getElementById('info')?.value || ''
  };
}

// Set form data
function setActionFormData(data) {
  if (data.question) document.getElementById('question').value = data.question;
  if (data.clue) document.getElementById('clue').value = data.clue;
  if (data.answer) document.getElementById('answer').value = data.answer;
  if (data.info) document.getElementById('info').value = data.info;
}

// Clear form
function clearActionForm() {
  document.getElementById('question').value = '';
  document.getElementById('clue').value = '';
  document.getElementById('answer').value = '';
  document.getElementById('info').value = '';
}

// Initialize action screen functionality
// Update action button labels based on mode
function setActionButtonLabelsByMode() {
  let label1, label2, label3;
  if (typeof mode !== 'undefined' && mode === 'learn') {
    label1 = 'known';    // Button 1 = known
    label2 = 'familiar'; // Button 2 = familiar  
    label3 = 'new';      // Button 3 = new
  } else {
    label1 = 'improve';
    label2 = 'OK';
    label3 = 'Good';
  }
  updateButtonLabels(label1, label2, label3);
}

// Listen for action screen activation
function observeActionScreen() {
  const actionScreen = document.querySelector('.screen-action');
  if (!actionScreen) return;
  const observer = new MutationObserver(() => {
    if (actionScreen.classList.contains('active')) {
      setActionButtonLabelsByMode();
    }
  });
  observer.observe(actionScreen, { attributes: true, attributeFilter: ['class'] });
}

// Calculate current sprint day (moved outside DOMContentLoaded for global access)
async function calculateSprintDay() {
  try {
    const settings = await dataManager.loadSettings();
    if (!settings || !settings.startDate) return null;
    
    const today = new Date();
    const start = new Date(settings.startDate);
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1;
  } catch (error) {
    console.error('Error calculating sprint day:', error);
    return null;
  }
}

// Add event to events storage
async function addEventToStorage(itemId, action, result, duration, sprintDay) {
  try {
    console.log(`🔄 Creating event: ID=${itemId}, Action=${action}, Result=${result}, Duration=${duration}, SprintDay=${sprintDay}`);
    
    // Get current events data from localStorage
    let content = localStorage.getItem('events');
    if (!content) {
      console.log('⚠️ Events data not found in localStorage, creating header structure...');
      // Create the header structure if it doesn't exist
      content = `# headerRow = 5
# Action: improve | review | Learn | conjugate | listen | compose | errors
#  Result: new | familiar | known | 0 | 0.5 | 1
#  sDay: sprintDay ; A/P: active | passive ; warning: starting row = 5 is fixed
ID	ACTION	RESULT	DURATION	SDAY	A/P`;
      localStorage.setItem('events', content);
      console.log('✅ Created events header structure in localStorage');
    }
    
    // Get next event ID
    let nextId = 1;
    const lines = content.split(/\r\n|\r|\n/);
    
    // Find the highest existing ID
    for (const line of lines) {
      if (line && !line.startsWith('#') && !line.includes('ID\t')) {
        const columns = line.split('\t');
        if (columns.length > 0) {
          const id = parseInt(columns[0]);
          if (!isNaN(id) && id >= nextId) {
            nextId = id + 1;
          }
        }
      }
    }
    
    // Create new event entry with curriculum item ID (not sequential event ID)
    const newEvent = `${itemId}	${action}	${result}	${duration}	${sprintDay}	a`;
    
    // Append to existing content
    const updatedContent = content + '\n' + newEvent;
    
    // Save back to localStorage
    localStorage.setItem('events', updatedContent);
    
    console.log(`✅ Added event with curriculum item ID ${itemId}: Action=${action}, Result=${result}, Duration=${duration}, SprintDay=${sprintDay}`);
    
    // Try to save to file (this will work if we have a proper server)
    try {
      await saveEventsToFile(updatedContent);
      console.log('✅ Events saved to file successfully');
    } catch (error) {
      console.log('⚠️ Could not save to file (requires server-side support):', error.message);
      console.log('💡 Events are preserved in localStorage for this session');
    }
    
    // Refresh events display for development
    await loadRecentEvents();
    
  } catch (error) {
    console.error('❌ Error adding event to storage:', error);
  }
}

// Function to save events data back to the server file
async function saveEventsToFile(content) {
  // Note: This requires a server that can handle file writes
  // The current Python HTTP server is read-only
  const response = await fetch('/save-events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: 'events.tsv',
      content: content
    })
  });
  
  if (!response.ok) {
    throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Debug function to check userData loading and learnsRemaining calculation
async function debugUserDataAndLearnsRemaining() {
  const debugInfo = [];
  
  try {
    // 1. Check raw userData file
    debugInfo.push("=== DEBUGGING USERDATA AND LEARNS REMAINING ===");
    
    // Load raw file content
    const response = await fetch('data/userData.tsv');
    const rawContent = await response.text();
    const rawLines = rawContent.split(/\r\n|\r|\n/);
    
    // Count level 0 items in raw file
    let rawLevel0Count = 0;
    let totalRawItems = 0;
    
    for (let i = 4; i < rawLines.length; i++) { // Skip header rows
      const line = rawLines[i].trim();
      if (line && !line.startsWith('#')) {
        const columns = line.split('\t');
        if (columns.length >= 3) {
          totalRawItems++;
          const level = parseInt(columns[2].trim());
          if (level === 0) {
            rawLevel0Count++;
          }
        }
      }
    }
    
    debugInfo.push(`1. RAW FILE CHECK:`);
    debugInfo.push(`   - Total items in raw file: ${totalRawItems}`);
    debugInfo.push(`   - Level 0 items in raw file: ${rawLevel0Count}`);
    debugInfo.push(`   - Raw file shows unlearned items: ${rawLevel0Count > 0 ? 'YES' : 'NO'}`);
    
    // 2. Check localStorage content
    const storageContent = localStorage.getItem('userData');
    if (!storageContent) {
      debugInfo.push(`2. LOCALSTORAGE CHECK: NO DATA FOUND`);
    } else {
      const storageLines = storageContent.split(/\r\n|\r|\n/);
      let storageLevel0Count = 0;
      let totalStorageItems = 0;
      
      for (let i = 4; i < storageLines.length; i++) { // Skip header rows
        const line = storageLines[i].trim();
        if (line && !line.startsWith('#')) {
          const columns = line.split('\t');
          if (columns.length >= 3) {
            totalStorageItems++;
            const level = parseInt(columns[2].trim());
            if (level === 0) {
              storageLevel0Count++;
            }
          }
        }
      }
      
      debugInfo.push(`2. LOCALSTORAGE CHECK:`);
      debugInfo.push(`   - Total items in localStorage: ${totalStorageItems}`);
      debugInfo.push(`   - Level 0 items in localStorage: ${storageLevel0Count}`);
      debugInfo.push(`   - localStorage shows unlearned items: ${storageLevel0Count > 0 ? 'YES' : 'NO'}`);
    }
    
    // 3. Check dataManager.loadUserData()
    const userData = await dataManager.loadUserData();
    if (!userData) {
      debugInfo.push(`3. DATAMANAGER CHECK: NO DATA RETURNED`);
    } else {
      let dataManagerLevel0Count = 0;
      userData.forEach(user => {
        if (user.level === 0) {
          dataManagerLevel0Count++;
        }
      });
      
      debugInfo.push(`3. DATAMANAGER CHECK:`);
      debugInfo.push(`   - Total items from dataManager: ${userData.length}`);
      debugInfo.push(`   - Level 0 items from dataManager: ${dataManagerLevel0Count}`);
      debugInfo.push(`   - DataManager shows unlearned items: ${dataManagerLevel0Count > 0 ? 'YES' : 'NO'}`);
    }
    
    // 4. Check learnsRemaining() function from general.js
    if (typeof learnsRemaining === 'function') {
      const remaining = await learnsRemaining();
      debugInfo.push(`4. LEARNSREMAINING() RESULT: ${remaining}`);
    } else {
      debugInfo.push(`4. LEARNSREMAINING() FUNCTION: NOT AVAILABLE`);
    }
    
  } catch (error) {
    debugInfo.push(`ERROR IN DEBUG: ${error.message}`);
  }
  
  // Display in events area
  const eventsDiv = document.getElementById('events');
  if (eventsDiv) {
    eventsDiv.innerHTML = '<pre style="font-family: monospace; font-size: 12px; white-space: pre-wrap;">' + 
                         debugInfo.join('\n') + '</pre>';
  }
  
  // Also log to console
  console.log(debugInfo.join('\n'));
}

// DOMContentLoaded event handler
document.addEventListener('DOMContentLoaded', async function() {
  // Remove preload class to enable transitions after page is loaded
  setTimeout(() => {
    document.body.classList.remove('preload');
  }, 100);
  
  // Load all data files to localStorage first
  console.log('🔄 Loading data files to localStorage...');
  try {
    await dataManager.loadAllToStorage();
    console.log('✅ Data files loaded to localStorage');
    
    // Debug userData loading and learnsRemaining calculation
    await debugUserDataAndLearnsRemaining();
  } catch (error) {
    console.error('❌ Error loading data files:', error);
  }
  
  handleActionForm();
  handleActionButtons();
  setActionButtonLabelsByMode();
  observeActionScreen();
  
  // Auto-load currentItems based on mode when page loads
  if (typeof mode !== 'undefined' && mode) {
    try {
      console.log(`Loading items for mode: ${mode}`);
      await buildCurrentItems(mode);
      console.log(`Loaded ${currentItems.length} items for mode ${mode}`);
      
      // Update H2 header field with session progress after loading items
      updateH2WithProgress();
      
      // Load and display the first item
      await loadCurrentItem();
      
      // Load recent events for development display
      await loadRecentEvents();
    } catch (error) {
      console.error(`Error loading items for mode ${mode}:`, error);
    }
  }
});
