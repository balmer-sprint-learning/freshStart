// action.js - Action screen specific functionality

// Global variables for current session
let currentItems = [];

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
      // Placeholder for B1 functionality
    });
  }
  
  if (btn2) {
    btn2.addEventListener('click', function() {
      console.log('Button 2 clicked');
      // Placeholder for B2 functionality
    });
  }
  
  if (btn3) {
    btn3.addEventListener('click', function() {
      console.log('Button 3 clicked');
      // Placeholder for B3 functionality
    });
  }
}

// Update button labels dynamically
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
document.addEventListener('DOMContentLoaded', function() {
  handleActionForm();
  handleActionButtons();
});
