// profile.js - Profile screen specific functionality

// NewUser class for fresh start functionality
class NewUser {
    constructor() {
        
    }

    async saveSettingsData() {
        // Get form data
        const nickname = document.getElementById('nickname')?.value || '';
        const licence = document.getElementById('licence')?.value || '';
        const version = document.getElementById('version')?.value || '';
        const prefix = document.getElementById('prefix')?.value || '';
        
      
      
      
        
        // Create settings TSV format
        const settingsLines = [
            "# Settings for FreshStart app",
            "# Key-value pairs",
            "KEY\tVALUE",
            `nickname\t${nickname}`,
            `licence\t${licence}`,
            `version\t${version}`,
            `prefix\t${prefix}`,
            `startDate\t${startDate}`
        ];
        
        const settingsContent = settingsLines.join('\n');
        
        // Save to localStorage
        localStorage.setItem('settings', settingsContent);
        
        // Show alert with settings data
        alert(`Settings Data Saved:\n\nNickname: ${nickname}\nLicence: ${licence}\nVersion: ${version}\nPrefix: ${prefix}\nStart Date: ${startDate}`);
    }

    async createInitialDataStores() {
        // Create empty events store
        const eventsLines = [
            "# headerRow = 5",
            "# Action: improve | review | Learn | conjugate | listen | compose | errors",
            "#  Result: new | familiar | known | 0 | 0.5 | 1",
            "#  sDay: sprintDay ; A/P: active | passive ; warning: starting row = 5 is fixed",
            "ID\tACTION\tRESULT\tDURATION\tSDAY\tA/P"
        ];
        localStorage.setItem('events', eventsLines.join('\n'));

        // Create empty improves store
        const improvesLines = [
            "# headerRow = 2",
            "ID"
        ];
        localStorage.setItem('improves', improvesLines.join('\n'));

        // Create full userData store with 3000 items (ID 1-3000, empty NRD, level 0)
        const userDataLines = [
            "# headerRow = 3",
            "# NRD = NextReviewDate in terms of sprintDay",
            "ID\tNRD\tLEVEL"
        ];
        
        for (let i = 1; i <= 3000; i++) {
            userDataLines.push(`${i}\t\t0`);
        }
        
        localStorage.setItem('userData', userDataLines.join('\n'));
        
        // Verify stores were created correctly
        const eventsContent = localStorage.getItem('events');
        const improvesContent = localStorage.getItem('improves');
        const userDataContent = localStorage.getItem('userData');
        
        // Check events store is empty (only headers, no data rows)
        const eventsCheckLines = eventsContent.split('\n');
        const eventsDataRows = eventsCheckLines.filter(line => 
            line.trim() && 
            !line.startsWith('#') && 
            !line.includes('ID\tACTION\tRESULT')
        );
        const eventsEmpty = eventsDataRows.length === 0;
        
        // Check improves store is empty (only headers, no data rows)
        const improvesCheckLines = improvesContent.split('\n');
        const improvesDataRows = improvesCheckLines.filter(line => 
            line.trim() && 
            !line.startsWith('#') && 
            !line.includes('ID')
        );
        const improvesEmpty = improvesDataRows.length === 0;
        
        // Check userData store has 3000 items with sum of levels = 0
        const userDataCheckLines = userDataContent.split('\n');
        const userDataRows = userDataCheckLines.filter(line => 
            line.trim() && 
            !line.startsWith('#') && 
            !line.includes('ID\tNRD\tLEVEL')
        );
        
        let levelSum = 0;
        userDataRows.forEach(line => {
            const columns = line.split('\t');
            if (columns.length >= 3) {
                const level = parseInt(columns[2]) || 0;
                levelSum += level;
            }
        });
        
        const levelsCorrect = userDataRows.length === 3000 && levelSum === 0;
        
        // Show summary alert
        alert(`Data Stores Created:\n\n` +
              `${eventsEmpty ? '✅' : '❌'} Events ${eventsEmpty ? 'empty' : 'not empty'}\n` +
              `${improvesEmpty ? '✅' : '❌'} Improves ${improvesEmpty ? 'empty' : 'not empty'}\n` +
              `${levelsCorrect ? '✅' : '❌'} Levels ${levelsCorrect ? 'correct' : 'incorrect'} (${userDataRows.length} items, sum=${levelSum})`);
    }

    async DevDownloadCurriculumFile() {
        try {
            // Load curriculum from local file
            const response = await fetch('/data/curriculum.tsv');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const curriculumContent = await response.text();
            
            // Store in localStorage
            localStorage.setItem('curriculum', curriculumContent);
            
            // Use existing dataManager to parse the curriculum
            const curriculumData = await dataManager.loadCurriculum();
            
            if (!curriculumData || !Array.isArray(curriculumData)) {
                throw new Error('Failed to parse curriculum data');
            }
            
            // Analyze the parsed data
            const rowCount = curriculumData.length;
            const firstItem = curriculumData[0];
            const columnCount = firstItem ? Object.keys(firstItem).length : 0;
            
            const rowsOK = rowCount > 4000;
            const columnsOK = columnCount > 0;
            const success = rowsOK && columnsOK;
            
            if (success) {
                // Show first 5 rows, first 7 columns (using object keys)
                const first5Items = curriculumData.slice(0, 5);
                const columnKeys = Object.keys(firstItem).slice(0, 7);
                
                const preview = first5Items.map(item => {
                    return columnKeys.map(key => item[key] || '').join('\t');
                }).join('\n');
                
                alert(`✅ Curriculum Downloaded:\n\n` +
                      `Rows: ${rowCount} (> 4000)\n` +
                      `Columns: ${columnCount} (parsed successfully)\n\n` +
                      `First 5 rows (7 columns):\n${preview}`);
            } else {
                alert(`❌ Curriculum Download Issues:\n\n` +
                      `Rows: ${rowCount} ${rowsOK ? '✅' : '❌'} (need > 4000)\n` +
                      `Columns: ${columnCount} ${columnsOK ? '✅' : '❌'} (parsing failed)`);
            }
            
        } catch (error) {
            alert(`❌ Curriculum Download Failed:\n\n${error.message}`);
        }
    }

    async navigateToStartScreen() {
        // Navigate to start.html after all fresh start processes complete
        window.location.href = 'start.html';
    }
}

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
      // Calculate license when nickname changes
      calculateLicense();
    });
  }
  
  // Auto-calculate prefix when version field changes
  const versionField = document.getElementById('version');
  if (versionField) {
    versionField.addEventListener('input', function() {
      calculatePrefix();
    });
    versionField.addEventListener('blur', function() {
      calculatePrefix();
    });
  }
  
  // Handle start button click
  const startButton = document.querySelector('.start-button');
  if (startButton) {
    startButton.addEventListener('click', async function() {
      const confirmed = confirm('This will clear all your data and create a fresh start. Are you sure?');
      if (confirmed) {
        try {
          alert('Starting fresh start process...');
          
          const newUser = new NewUser();
          await newUser.clearAllStorage();
          await newUser.saveSettingsData();
          await newUser.createInitialDataStores();
          await newUser.DevDownloadCurriculumFile();
          await newUser.navigateToStartScreen();
        } catch (error) {
          alert('Error during fresh start: ' + error.message);
        }
      }
    });
  }
}

// Calculate license 
function calculateLicense() {
  const licenseField = document.getElementById('licence');
  const nickname = document.getElementById('nickname')?.value || '';
  
  // Don't regenerate if nickname is read-only and license already exists
  if (licenseField && licenseField.value && document.getElementById('nickname')?.readOnly) {
    return;
  }
  
  if (licenseField && nickname.length === 2) {
    // Generate license in format: NICKNAME-SUM-UNIX4-TIER-DEFAULT-DEFAULT
    // Formula: NICKNAME-{(lastTwoYearDigits + month + date)}-{firstFourUnixDigits}-T1-7-025
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() returns 0-11
    const date = now.getDate();
    const lastTwoYearDigits = year % 100; // e.g., 2025 -> 25
    
    // Calculate sum: last 2 year digits + month + date
    const sum = lastTwoYearDigits + month + date;
    
    // Get first 4 digits of unix timestamp
    const unixTime = Math.floor(now.getTime() / 1000);
    const unixString = unixTime.toString();
    const firstFourUnix = unixString.substring(0, 4);
    
    // Default values
    const tier = 'T1';
    const defaultPart = '7';
    const finalPart = '025';
    
    const license = `${nickname.toUpperCase()}-${sum}-${firstFourUnix}-${tier}-${defaultPart}-${finalPart}`;
    licenseField.value = license;
  } else if (licenseField) {
    licenseField.value = '';
  }
}

// Calculate prefix
function calculatePrefix() {
  const prefixField = document.getElementById('prefix');
  const nickname = document.getElementById('nickname')?.value || '';
  const version = document.getElementById('version')?.value || '';
  
  if (!prefixField) return;
  
  // Check if we already have a stored prefix
  const stored = localStorage.getItem('freshStartProfile');
  let existingPrefix = '';
  
  if (stored) {
    try {
      const profileData = JSON.parse(stored);
      existingPrefix = profileData.prefix || '';
    } catch (error) {
      console.log('Error reading stored profile:', error);
    }
  }
  
  // Don't regenerate if prefix is read-only and already has a value
  if (prefixField.readOnly && prefixField.value) {
    return;
  }
  
  // Generate prefix if we have both nickname and version
  if (nickname.length === 2 && version.length > 0) {
    // Use existing prefix if available, otherwise generate new one
    if (existingPrefix) {
      prefixField.value = existingPrefix;
      // Make field read-only once set
      prefixField.readOnly = true;
      prefixField.style.backgroundColor = '#f8f9fa';
      prefixField.style.color = '#666';
    } else {
      // Generate new prefix: NICKNAME-YYMM-UNIX4-RANDOM6
      const now = new Date();
      const year = now.getFullYear() % 100; // e.g., 2025 -> 25
      const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 01-12
      const yearMonth = `${year}${month}`;
      
      const unixTime = Math.floor(now.getTime() / 1000);
      const unix4 = unixTime.toString().substring(0, 4);
      
      // Generate random 6-digit number
      const random6 = Math.floor(Math.random() * 900000) + 100000; // 100000-999999
      
      const prefix = `${nickname.toUpperCase()}-${yearMonth}-${unix4}-${random6}`;
      prefixField.value = prefix;
      
      // Make field read-only once set
      prefixField.readOnly = true;
      prefixField.style.backgroundColor = '#f8f9fa';
      prefixField.style.color = '#666';
    }
  } else {
    // Clear field if conditions not met and no existing prefix
    prefixField.value = '';
  }
}

// Sync localStorage from IndexedDB on page load
async function syncFromIndexedDB() {
  try {
    console.log('🔄 Syncing from IndexedDB to localStorage...');
    
    // Open IndexedDB connection
    const dbRequest = indexedDB.open('FreshStartDB', 1);
    
    return new Promise((resolve, reject) => {
      dbRequest.onerror = function(event) {
        console.log('⚠️ IndexedDB not available, using existing localStorage data');
        resolve(false);
      };
      
      dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        
        // Check if userData object store exists
        if (!db.objectStoreNames.contains('userData')) {
          console.log('⚠️ userData object store not found, using existing localStorage data');
          db.close();
          resolve(false);
          return;
        }
        
        // Start transaction to read userData
        const transaction = db.transaction(['userData'], 'readonly');
        const objectStore = transaction.objectStore('userData');
        
        // Get all records
        const getAllRequest = objectStore.getAll();
        
        getAllRequest.onerror = function(event) {
          console.log('⚠️ Error reading from IndexedDB, using existing localStorage data');
          db.close();
          resolve(false);
        };
        
        getAllRequest.onsuccess = function(event) {
          const records = event.target.result;
          
          if (records.length > 0) {
            console.log(`📥 Found ${records.length} userData records in IndexedDB`);
            
            // Convert records back to TSV format
            let tsvContent = `# headerRow = 3\n# NRD = NextReviewDate in terms of sprintDay\nID\tNRD\tLEVEL\n`;
            
            // Sort records by ID to maintain order
            records.sort((a, b) => {
              const idA = parseInt(a.id) || 0;
              const idB = parseInt(b.id) || 0;
              return idA - idB;
            });
            
            records.forEach(record => {
              tsvContent += `${record.id}\t${record.nrd}\t${record.level}\n`;
            });
            
            // Update localStorage with synced data
            localStorage.setItem('userData', tsvContent);
            console.log('✅ Synced userData from IndexedDB to localStorage');
          } else {
            console.log('📭 No userData records in IndexedDB, keeping localStorage data');
          }
          
          db.close();
          resolve(true);
        };
      };
      
      dbRequest.onupgradeneeded = function(event) {
        console.log('💡 IndexedDB needs initialization, using existing localStorage data');
        resolve(false);
      };
    });
    
  } catch (error) {
    console.error('❌ Error syncing from IndexedDB:', error);
    return false;
  }
}

// Load and populate profile form from localStorage settings
function loadProfileFromSettings() {
  try {
    const settingsContent = localStorage.getItem('settings');
    if (!settingsContent) {
      console.log('⚠️ No settings found in localStorage');
      return;
    }
    
    const lines = settingsContent.split(/\r\n|\r|\n/);
    const settings = {};
    
    // Parse settings data
    for (const line of lines) {
      if (line && !line.startsWith('#') && !line.includes('KEY\tVALUE')) {
        const parts = line.split('\t');
        if (parts.length >= 2) {
          settings[parts[0]] = parts[1];
        }
      }
    }
    
    console.log('📄 Loaded settings:', settings);
    
    // Populate form fields
    if (settings.nickname) {
      const nicknameField = document.getElementById('nickname');
      if (nicknameField) {
        nicknameField.value = settings.nickname;
        // Make read-only if already set
        nicknameField.readOnly = true;
        nicknameField.style.backgroundColor = '#f8f9fa';
        nicknameField.style.color = '#666';
      }
    }
    
    if (settings.licence) {
      const licenceField = document.getElementById('licence');
      if (licenceField) {
        licenceField.value = settings.licence;
        // Make read-only if already set
        licenceField.readOnly = true;
        licenceField.style.backgroundColor = '#f8f9fa';
        licenceField.style.color = '#666';
      }
    }
    
    if (settings.version) {
      const versionField = document.getElementById('version');
      if (versionField) {
        versionField.value = settings.version;
      }
    }
    
    if (settings.prefix) {
      const prefixField = document.getElementById('prefix');
      if (prefixField) {
        prefixField.value = settings.prefix;
        // Make read-only if already set
        prefixField.readOnly = true;
        prefixField.style.backgroundColor = '#f8f9fa';
        prefixField.style.color = '#666';
      }
    }
    
    // Show start date if available
    if (settings.startDate) {
      console.log(`📅 Start date: ${settings.startDate}`);
    }
    
    console.log('✅ Profile form populated from settings');
    
  } catch (error) {
    console.error('❌ Error loading profile from settings:', error);
  }
}

// Initialize profile screen functionality
document.addEventListener('DOMContentLoaded', async function() {
  // First sync from IndexedDB to localStorage on page load
  console.log('📥 Syncing from IndexedDB to localStorage on profile page load...');
  await syncFromIndexedDB();
  
  // Then load and populate the profile form
  loadProfileFromSettings();
  
  handleProfileForm();
});
