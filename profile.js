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
      saveProfileToStorage();
    });
  }
}

// Calculate license and prefix values
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
      console.error('Error reading stored profile:', error);
    }
  }
  
  // If we have a valid existing prefix, use it and make field read-only
  if (existingPrefix && existingPrefix.trim().length > 0) {
    prefixField.value = existingPrefix;
    prefixField.readOnly = true;
    prefixField.style.backgroundColor = '#f8f9fa';
    prefixField.style.color = '#666';
    return;
  }
  
  // Only calculate new prefix if we don't have one AND conditions are met
  if (nickname.length === 2 && version.trim().length > 0) {
    try {
      // Generate prefix in format: NICKNAME-YYYYMM-UNIXTIME-RANDOM6
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      
      // Part 2: Year (2 digits) + Month (2 digits)
      const yearMonth = year.toString().slice(-2) + month;
      
      // Part 3: Unix timestamp in seconds
      const unixTime = Math.floor(now.getTime() / 1000);
      
      // Part 4: Cryptographically secure random 6-digit number
      const randomArray = new Uint32Array(1);
      crypto.getRandomValues(randomArray);
      const random6 = (randomArray[0] % 1000000).toString().padStart(6, '0');
      
      const prefix = `${nickname.toUpperCase()}-${yearMonth}-${unixTime}-${random6}`;
      
      // Set the prefix and make it read-only permanently
      prefixField.value = prefix;
      prefixField.readOnly = true;
      prefixField.style.backgroundColor = '#f8f9fa';
      prefixField.style.color = '#666';
      
      // Update localStorage with the new prefix
      let profileData = {};
      if (stored) {
        try {
          profileData = JSON.parse(stored);
        } catch (error) {
          console.error('Error parsing stored profile:', error);
        }
      }
      profileData.prefix = prefix;
      localStorage.setItem('freshStartProfile', JSON.stringify(profileData));
      
    } catch (error) {
      console.error('Error generating prefix:', error);
    }
  } else {
    // Clear field if conditions not met and no existing prefix
    prefixField.value = '';
  }
}

// Save profile data to localStorage
async function saveProfileToStorage() {
  const nickname = document.getElementById('nickname')?.value || '';
  const licence = document.getElementById('licence')?.value || '';
  const version = document.getElementById('version')?.value || '';
  const prefix = document.getElementById('prefix')?.value || '';
  
  // Validate that all fields are filled
  if (!nickname || !licence || !version || !prefix) {
    alert('Please complete all fields before starting.');
    return;
  }
  
  // Show loading message
  alert('Setting up your profile and downloading curriculum...');
  
  try {
    const profileData = {
      nickname: nickname,
      licence: licence,
      version: version,
      prefix: prefix,
      created: new Date().toISOString(),
      startDate: new Date().toISOString().split('T')[0]
    };
    
    // Download curriculum from Dropbox
    console.log('Downloading curriculum from Dropbox...');
    const curriculum = await downloadCurriculum();
    
    // Generate initial userData structure based on userData.tsv format
    const userData = generateInitialUserData();
    
    // Generate initial improves structure (starts empty)
    const improves = generateInitialImproves();
    
    // Save all data to localStorage
    localStorage.setItem('freshStartProfile', JSON.stringify(profileData));
    localStorage.setItem('freshStartUserData', JSON.stringify(userData));
    localStorage.setItem('freshStartImproves', JSON.stringify(improves));
    localStorage.setItem('freshStartCurriculum', JSON.stringify(curriculum));
    
    // Show the stored data for verification
    console.log('Profile saved to localStorage:');
    console.log('Profile:', JSON.stringify(profileData, null, 2));
    console.log('UserData entries:', userData.data.length);
    console.log('Improves entries:', improves.data.length);
    console.log('Curriculum entries:', curriculum.data.length);
    
    // Display success message
    alert(`✅ Setup Complete!\n\nSaved:\n- Profile data\n- UserData (${userData.data.length} entries)\n- Improves (${improves.data.length} entries)\n- Curriculum (${curriculum.data.length} entries)`);
    
    // Could navigate to start screen here
    // showScreen('f1');
    
  } catch (error) {
    console.error('Error during setup:', error);
    alert(`❌ Setup failed: ${error.message}\n\nPlease check your internet connection and try again.`);
  }
}

// Download curriculum from Dropbox
async function downloadCurriculum() {
  // Use CORS proxy for development - remove in production
  const directUrl = 'https://www.dropbox.com/scl/fi/8s5jdk4d0twg8d8xpyp23/15Curriculum.tsv?rlkey=vu2xjllxqlwuvbwqra5gh4fu5&dl=1';
  const corsProxyUrl = `https://cors-anywhere.herokuapp.com/${directUrl}`;
  
  try {
    console.log('🔄 Starting curriculum download...');
    console.log('Direct URL:', directUrl);
    console.log('Using CORS proxy:', corsProxyUrl);
    
    // Try direct URL first, fallback to CORS proxy
    let response;
    try {
      response = await fetch(directUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'text/plain, text/tab-separated-values, */*'
        }
      });
    } catch (corsError) {
      console.log('📡 Direct fetch failed (CORS), trying proxy...');
      response = await fetch(corsProxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain, text/tab-separated-values, */*',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
    }
    
    console.log('📡 Response received:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const tsvContent = await response.text();
    console.log('✅ Curriculum downloaded successfully');
    console.log('📊 Content stats:', {
      length: tsvContent.length,
      lines: tsvContent.split('\n').length,
      preview: tsvContent.substring(0, 200) + '...'
    });
    
    // Parse TSV content into JSON format
    const curriculum = parseCurriculumTSV(tsvContent);
    
    return curriculum;
    
  } catch (error) {
    console.error('❌ Curriculum download failed:', error);
    
    // Fallback: Load from local data directory if available
    console.log('🔄 Attempting to load local curriculum file...');
    try {
      const localResponse = await fetch('/data/curriculum.tsv');
      if (localResponse.ok) {
        const localContent = await localResponse.text();
        console.log('✅ Loaded curriculum from local file');
        const curriculum = parseCurriculumTSV(localContent);
        console.log('📊 Local curriculum stats:', {
          length: localContent.length,
          lines: localContent.split('\n').length,
          parsedItems: curriculum.length
        });
        return curriculum;
      } else {
        console.log('❌ Local file request failed:', localResponse.status);
      }
    } catch (localError) {
      console.log('❌ Local file error:', localError.message);
    }
    
    throw new Error(`Download failed: ${error.message}. Please download the curriculum file manually and place it in the data/ folder.`);
  }
}

// Use the existing dataManager loadCurriculum method
async function parseCurriculumTSV(tsvContent) {
  // Store the content temporarily in localStorage so dataManager can parse it
  const originalContent = localStorage.getItem('curriculum');
  localStorage.setItem('curriculum', tsvContent);
  
  try {
    // Use the existing, tested dataManager.loadCurriculum() method
    const curriculumData = await dataManager.loadCurriculum();
    
    const curriculum = {
      metadata: {
        downloadedAt: new Date().toISOString(),
        source: 'Local file'
      },
      data: curriculumData || []
    };
    
    console.log(`Parsed ${curriculum.data.length} curriculum entries using existing dataManager.loadCurriculum()`);
    return curriculum;
    
  } finally {
    // Restore original content
    if (originalContent) {
      localStorage.setItem('curriculum', originalContent);
    } else {
      localStorage.removeItem('curriculum');
    }
  }
}

// Generate initial userData structure based on userData.tsv format
function generateInitialUserData() {
  const userData = {
    metadata: {
      headerRow: 3,
      description: "NRD = NextReviewDate in terms of sprintDay",
      created: new Date().toISOString()
    },
    data: []
  };
  
  // Generate initial entries (1-3000) for production
  // All items start fresh: NRD blank, LEVEL 0
  for (let i = 1; i <= 3000; i++) {
    userData.data.push({
      ID: i,
      NRD: "",  // Blank for new users
      LEVEL: 0  // All start at level 0 (need to learn)
    });
  }
  
  return userData;
}

// Generate initial improves structure (starts empty)
function generateInitialImproves() {
  const improves = {
    metadata: {
      headerRow: 2,
      created: new Date().toISOString()
    },
    data: []
  };
  
  // Starts empty - items will be added as user progresses
  
  return improves;
}

// Function to retrieve and display current storage (for debugging)
function showStoredProfile() {
  const stored = localStorage.getItem('freshStartProfile');
  if (stored) {
    console.log('Current stored profile:');
    console.log(JSON.stringify(JSON.parse(stored), null, 2));
    return JSON.parse(stored);
  } else {
    console.log('No profile data found in storage');
    return null;
  }
}

// Initialize profile screen functionality
document.addEventListener('DOMContentLoaded', function() {
  handleProfileForm();
  
  // Load existing profile data if it exists
  loadExistingProfile();
  
  // Auto-calculate license when nickname changes
  const nicknameField = document.getElementById('nickname');
  if (nicknameField) {
    nicknameField.addEventListener('input', function() {
      calculateLicense();
    });
  }
  
  // Auto-calculate prefix when version field is completed
  const versionField = document.getElementById('version');
  if (versionField) {
    versionField.addEventListener('input', function() {
      calculatePrefix();
    });
    versionField.addEventListener('blur', function() {
      calculatePrefix();
    });
  }
});

// Load existing profile data from localStorage and populate fields
function loadExistingProfile() {
  const stored = localStorage.getItem('freshStartProfile');
  if (stored) {
    try {
      const profileData = JSON.parse(stored);
      
      // Populate fields with existing data
      const nicknameField = document.getElementById('nickname');
      const licenceField = document.getElementById('licence');
      const versionField = document.getElementById('version');
      const prefixField = document.getElementById('prefix');
      
      if (profileData.nickname && nicknameField) {
        nicknameField.value = profileData.nickname;
        // Make nickname read-only once set
        nicknameField.readOnly = true;
        nicknameField.style.backgroundColor = '#f8f9fa';
        nicknameField.style.color = '#666';
      }
      
      if (profileData.licence && licenceField) {
        licenceField.value = profileData.licence;
      }
      
      if (profileData.version && versionField) {
        versionField.value = profileData.version;
      }
      
      if (profileData.prefix && prefixField) {
        prefixField.value = profileData.prefix;
        // Make prefix read-only once set
        prefixField.readOnly = true;
        prefixField.style.backgroundColor = '#f8f9fa';
        prefixField.style.color = '#666';
      }
      
      console.log('Loaded existing profile from localStorage:', profileData);
      
    } catch (error) {
      console.error('Error loading profile from localStorage:', error);
    }
  }
}
