# FreshStart App - Claude AI Context Document

## FIRST USE AND ONLOAD

### New User Flow Architecture

**Initial State Check:**
1. **New user downloads the app** - localStorage is empty and IndexedDB is empty
2. **System automatically redirects to profile page** (because no data exists)
3. **If IndexedDB had data** - user would be taken to start page instead

**Profile Page Setup:**
1. **User fills out form** on profile page (nickname, etc.)
2. **User presses "Start" button** - This CREATES:
   - `userData` data structure
   - `settings` data structure  
   - Empty shell for `improves` data
   - Empty shell for `events` data
3. **Page change trigger fires** - As soon as they leave profile page, localStorage is automatically saved to IndexedDB
4. **On second visit** - User starts at start page (because IndexedDB now has data)

**Production Behavior:**
- When "Start" button is pressed, it will also **download the curriculum file** directly into IndexedDB
- **No local files will exist** - files are temporary for development only
- Files are temporary measure for development and importing existing information

**App Load Sequence:**
1. **Check IndexedDB** - Look for existing user data
2. **Move IndexedDB to localStorage** (caching for performance)  
3. **Every page change** - Update IndexedDB from localStorage
4. **If IndexedDB and localStorage are empty** - Use default values

**Default Values for Empty Start Page:**
- **H1** = "nickname" (or fallback text)
- **H2** = "DAY 0" 
- **H3** = "0h 0m"

**Data Flow Pattern:**
```
New User: Profile Page → localStorage → IndexedDB
Returning User: IndexedDB → localStorage → Start Page
Always: Page Changes → localStorage → IndexedDB (sync)
```

**File Development Note:**
- Current files in `/data/` folder are temporary for development
- In production, curriculum will be downloaded directly to IndexedDB
- Files allow importing existing development data into the app
- No file system dependencies in final production version

## Project Overview
A responsive single-page web application with three main screens: Profile, Start (analytics), and Action (Q&A interface). Built with modern web standards, clean architecture, and robust IndexedDB persistence.

## Current Architecture

### File Structure
```
├── index.html          # Redirect to start.html
├── profile.html        # Profile screen with license/prefix generation
├── start.html          # Chart/analytics screen
├── action.html         # Q&A interface screen
├── profile.css         # Profile-specific styling
├── start.css          # Start screen styling  
├── action.css         # Action screen styling
├── general.css        # Shared styling
├── general.js         # Shared utilities, navigation, and sync triggers
├── profile.js         # Profile functionality with localStorage integration
├── start.js           # Chart/analytics functionality
├── action.js          # Q&A interface functionality
├── dataManager.js     # TSV parsing and data analytics
├── syncManager.js     # IndexedDB persistence layer
├── data/              # TSV data files including curriculum.tsv
├── BEHAVIOR_REGISTRY.md    # Development best practices
├── VARIABLES_REGISTRY.md   # Global variables documentation
├── INDEXEDDB_SYNC_DOCS.md  # Persistence system documentation
└── README.md          # This context document
```

### Development Principles

### Code Quality Standards
- **No Silent Conditions**: Never add filtering conditions (like `if (array.length >= N)`) without explicit discussion and justification
- **Systematic Debugging**: When problems arise, check own code systematically before making assumptions about external factors
- **Honest Problem Assessment**: Do not claim to have "found the problem" without verification through testing
- **Discuss Before Code**: Always discuss approach and reasoning before implementing, especially for data parsing and filtering logic

### Established Patterns

1. **NO inline styles** - All CSS must be in styles.css
2. **Responsive design** - Uses CSS variables `--vw` and `--vh` for scaling
3. **Clean separation** - HTML structure, CSS styling, JS functionality separated
4. **Single-page app** - All screens in index.html, switched via JavaScript
5. **Modern aesthetics** - Clean lines, proper spacing, subtle animations

### Skillful Programming Practices

**Essential Development Workflow:**
1. **Discuss First, Action Second** - ALWAYS clarify requirements and understand context before coding
2. **Read Existing Code** - Review function registry and current implementations before writing anything new
3. **Build One Function at a Time** - Incremental development prevents debugging nightmares
4. **Check for Duplication** - Search existing codebase before creating new functions
5. **Performance Awareness** - Monitor execution times and optimize bottlenecks
6. **Simplicity Over Complexity** - Prefer simple solutions; avoid caching/optimization until necessary

**Code Quality Guidelines:**
- **Function Registry Maintenance** - Document all functions with purpose, location, and line counts
- **Centralized Data Management** - Use dataManager for all TSV parsing operations
- **Shared Utilities** - Extract common patterns (like header row parsing) into reusable functions
- **Incremental Testing** - Create simple test pages to validate functionality before integration

## Principles for Working with GitHub Copilot

- Always work step-by-step, one small change at a time, confirming each step before moving on.
- Do not add any code, error handling, or conditions that have not been discussed and agreed upon.
- Never add defensive or filtering logic (such as column count checks) unless explicitly requested.
- Only do the work requested, with minimal necessary error handling.
- If unsure about data format or requirements, ask for clarification before coding.
- Communicate clearly about any assumptions or changes before implementation.
- If you deviate from these principles, expect to be called out and correct course immediately.

## Programming Method - Lessons from Development

### The Golden Rule: "Discuss First, Action Second"
**This principle could have saved 2 hours today.**

- **Always clarify requirements** before writing any code
- **Understand the existing codebase** before proposing solutions  
- **Ask questions about context** rather than making assumptions
- **Read the function registry** and current files before starting
- **Discuss the approach** and get confirmation before implementation

### Key Learning Patterns Observed

**The "Morning Struggle → Afternoon Success" Pattern:**
- **Problem**: Starting with assumptions instead of understanding existing code structure
- **Solution**: Always begin new sessions by reading current codebase and function registry
- **Lesson**: Context gathering prevents false starts and duplicate work

**The "Duplicate Code Detection" Method:**
1. **Recognize**: When copy-pasting similar code blocks (red flag!)
2. **Extract**: Identify the common pattern and variable parts  
3. **Parameterize**: Create reusable function with parameters for differences
4. **Refactor**: Replace all duplicates with calls to shared function
5. **Document**: Update function registry with new shared utility

**Example: Popup Menu Refactoring Success**
- **Before**: 150+ lines of duplicate menu code in start.js
- **After**: Single 50-line `showPopupMenu()` function in general.js
- **Parameters**: `menuId`, `leftPosition`, `menuItems`, `clickHandler`
- **Result**: 90% code reduction, consistent behavior, easy to extend

**The "Performance Discovery" Method:**
- **Always Time Operations**: Use `console.time()` or custom logging
- **Unexpected Bottlenecks**: Header row parsing was taking longer than TSV parsing
- **Simple Fixes**: Adding `break` statements eliminated unnecessary iteration
- **Document Performance**: Track execution times to catch regressions

**The "Read Before Write" Principle:**
- **Anti-Pattern**: Writing new functions without checking existing codebase
- **Better Pattern**: Search for similar functionality first (`grep_search`, `semantic_search`)
- **Best Practice**: Check function registry and read related files before coding
- **Result**: Avoided recreating `findHeaderRowIndex()` function that already existed

**The "Incremental Validation" Method:**
1. **Build Small**: Create minimal working version first
2. **Test Immediately**: Verify each piece works before adding complexity
3. **Add Features**: Layer on additional functionality incrementally  
4. **Validate Each Step**: Catch errors early when they're easier to debug

**The "Responsive Design from Start" Principle:**
- **Wrong Approach**: Using fixed pixel positioning (`getBoundingClientRect()`)
- **Right Approach**: CSS calc() with responsive variables (`--vw`, `--vh`) from beginning
- **Lesson**: Responsive design is easier to build than to retrofit

**The "Function Registry as Navigation" Method:**
- **Discovery Tool**: Use registry to understand existing capabilities
- **Planning Tool**: See where new functions should be located
- **Documentation Tool**: Keep registry updated as living documentation
- **Context Tool**: Helps new conversations start with accurate understanding

### Anti-Patterns to Avoid

❌ **"Assumption Coding"** - Starting to code without understanding existing structure  
❌ **"Copy-Paste Development"** - Duplicating code instead of extracting shared functions  
❌ **"Pixel-Perfect Positioning"** - Using fixed measurements instead of responsive units  
❌ **"Performance Ignorance"** - Not timing operations to identify bottlenecks  
❌ **"Documentation Neglect"** - Failing to update function registry after changes  

### Successful Patterns to Repeat

✅ **"Context First"** - Read existing code and documentation before starting  
✅ **"Extract Early"** - Recognize duplication and refactor immediately  
✅ **"Parameter Thinking"** - Design functions with parameters for reusability  
✅ **"Performance Consciousness"** - Time operations and optimize discovered bottlenecks  
✅ **"Responsive by Default"** - Use CSS variables and calc() from the start  
✅ **"Documentation as Development"** - Update function registry as part of coding process  

### The "End-of-Session Review" Process
1. **Update README** - Capture new functions and lessons learned
2. **Clean Up Code** - Remove debugging code and console.logs  
3. **Performance Check** - Verify no regressions in timing
4. **Test Core Features** - Quick validation that main functionality still works
5. **Document Context** - Note what was accomplished and what's next

This method creates a feedback loop where each session improves on the previous one, leading to increasingly sophisticated and efficient development patterns.

### Screen Architecture

#### Screen Navigation
- **F1 button** → Start screen (chart/analytics)
- **F2 button** → Action screen (Q&A interface)  
- **F3 button** → Profile screen (user setup)

#### CSS Screen Management
```css
.screen-profile, .screen-start, .screen-action {
  display: none; /* hidden by default */
}
.screen-[name].active {
  display: flex; /* shown when active */
}
```

### Screen Details

#### Profile Screen (`screen-profile`)
- **Purpose**: User onboarding and setup
- **Fields**: nickname (2 chars), licence (calculated), version, prefix (calculated)
- **Action**: Large "Start my 31 days now!" button
- **Styling**: Modern form layout with responsive sizing

#### Start Screen (`screen-start`)
- **Purpose**: Analytics dashboard
- **Main feature**: Doughnut chart (Chart.js) with centered "87%" text
- **Data**: 4 slices [300, 150, 50, 250]
- **Colors**: Brand color `rgb(0,119,123)` with opacity variations
- **Background**: Sophisticated gradient for modern look

#### Action Screen (`screen-action`)
- **Purpose**: Q&A interface for content creation
- **Layout**: 
  - Top 20%: question (2 lines), clue (1 line, 60% width), answer (2 lines)
  - Middle: 3 horizontal buttons (B1, B2, B3) 
  - Bottom 30%: info textarea (90% width, no label)
- **Validation**: Question/answer limited to 10 words

### Technical Specifications

#### Responsive Design
- Uses CSS custom properties: `--vw: calc(100vw / 100)`, `--vh: calc(100vh / 100)`
- All dimensions scale with viewport: `calc(var(--vh) * X)`
- Touch-friendly buttons: minimum 48px height for mobile

#### Color Scheme
- **Primary brand**: `rgb(0,119,123)` (teal)
- **Backgrounds**: Subtle gradients and light tints
- **Text**: Modern grays (`#1f2937`, `#374151`)
- **Borders**: Light grays (`#e5e7eb`)

#### JavaScript Organization
- **general.js**: `showScreen()`, theme management, shared utilities
- **profile.js**: Form validation, auto-calculations, button handlers
- **start.js**: Chart initialization, data updates, percentage calculations  
- **action.js**: Form management, button handlers, data operations

### Development Guidelines

1. **Always check current architecture** before making changes
2. **Maintain separation of concerns** - HTML/CSS/JS in proper files
3. **Use established CSS variables** for responsive sizing
4. **Follow naming conventions** - `.screen-[name]`, `.action-[element]`, etc.
5. **Test navigation** between all screens after changes
6. **Preserve modern aesthetic** - clean, minimal, professional

### Dependencies
- **Chart.js**: For doughnut chart visualization
- **Inter font**: Google Fonts for typography
- **No framework**: Pure HTML/CSS/JS architecture

### Known Working Features
✅ Screen navigation (F1/F2/F3 buttons)  
✅ Responsive layout across devices  
✅ Doughnut chart with overlay text  
✅ Form validation and auto-calculations  
✅ Modern styling with animations  
✅ Touch-friendly interface  

### Future Development Notes
- Architecture supports easy addition of new screens
- JavaScript modules are isolated and conflict-free
- CSS variables make theme changes simple
- Single-page app structure is performance-optimized

---
*This document serves as context for Claude AI to maintain consistency across conversation sessions while preserving established architecture and design decisions.*

## Function Registry
*Complete reference of all JavaScript functions and their purposes*

### General Functions (general.js)
| Function Name | Purpose | Screen | Notes |
|---------------|---------|---------|-------|
| `showScreen(screenId)` | Navigate between screens | All | Core navigation - handles F1/F2/F3 |
| `formatDate(date)` | Format dates consistently | All | Utility - placeholder for date formatting |
| `validateInput(value, maxLength)` | Input validation | All | Utility - placeholder for validation |
| `showPopupMenu(menuId, leftPosition, menuItems, clickHandler)` | Reusable popup menu system | All | Universal menu function with parameters |
| `hideAllMenus()` | Close all popup menus | All | Cleanup function for menu management |
| `handleClickOutside(event)` | Handle click-outside-menu events | All | Universal click handler for menu closing |

### Profile Functions (profile.js)
| Function Name | Purpose | Screen | Notes |
|---------------|---------|---------|-------|
| `handleProfileForm()` | Initialize profile form events | Profile | Sets up nickname validation and start button |
| `calculateLicense()` | Auto-generate license value | Profile | Creates LIC-XXXXXX format |
| `calculatePrefix()` | Auto-generate prefix from nickname | Profile | Format: NICKNAME-YEAR |

### Start Functions (start.js)
| Function Name | Purpose | Screen | Notes |
|---------------|---------|---------|-------|
| `initializeChart()` | Create Chart.js doughnut chart | Start | Sets up chart with brand colors |
| `updateChartData(newData)` | Update chart with new values | Start | Accepts array of 4 numbers |
| `updateCenterText(percentage)` | Update center overlay text | Start | Changes the "87%" display |
| `calculatePercentage()` | Calculate percentage from chart data | Start | Auto-updates center text |
| `findNickname()` | Get nickname from settings | Start | Uses dataManager.loadSettings() |
| `calculateSprintDay()` | Calculate day number from startDate | Start | Today minus startDate plus 1 |
| `calculateTotalTime()` | Sum duration from events in h/m format | Start | Uses dataManager.loadEventsData() |
| `getLearnCountsFromUserData()` | Count new/familiar/known by level | Start | Uses dataManager.loadUserData() |
| `updateH1WithNickname()` | Update H1 header with nickname | Start | Called when F1 screen activates |
| `updateH2WithSprintDay()` | Update H2 header with sprint day | Start | Called when F1 screen activates |
| `updateH3WithTotalTime()` | Update H3 header with total time | Start | Called when F1 screen activates |
| `learnsRemaining()` | Calculate remaining items to learn | Start | Used for vocab menu conditional logic |
| `calculateRetentionPercentage()` | Calculate retention rate from user data | Start | Performance analytics |
| `setupStartScreenFooterMenus()` | Initialize footer button event listeners | Start | Sets up hover/click for all 3 buttons |
| `handleVocabMenuClick/Hover(event)` | Handle vocab button interactions | Start | F1 button event handlers |
| `handleFluencyMenuClick/Hover(event)` | Handle fluency button interactions | Start | F2 button event handlers |
| `handleOtherMenuClick/Hover(event)` | Handle other button interactions | Start | F3 button event handlers |
| `showVocabMenu()` | Display vocab menu using reusable popup | Start | Items: improve, review, learn (conditional) |
| `showFluencyMenu()` | Display fluency menu using reusable popup | Start | Items: verbs, listening, composition, errors |
| `showOtherMenu()` | Display other menu using reusable popup | Start | Items: profile, settings |

### Action Functions (action.js)
| Function Name | Purpose | Screen | Notes |
|---------------|---------|---------|-------|
| `handleActionForm()` | Initialize action form validation | Action | Limits question/answer to 10 words |
| `handleActionButtons()` | Set up button event listeners | Action | B1, B2, B3 click handlers |
| `updateButtonLabels(label1, label2, label3)` | Change button text dynamically | Action | Updates B1/B2/B3 labels |
| `getActionFormData()` | Retrieve all form values | Action | Returns object with question/clue/answer/info |
| `setActionFormData(data)` | Populate form with data | Action | Accepts object with form fields |
| `clearActionForm()` | Reset all form fields | Action | Clears question/clue/answer/info |

### Data Manager Functions (dataManager.js)
| Function Name | Purpose | Screen | Notes |
|---------------|---------|---------|-------|
| `loadAllToStorage()` | Load all TSV files to localStorage | All | Handles cross-platform line endings |
| `checkStorage()` | Verify localStorage contents | All | Shows line counts and status |
| `findHeaderRowIndex(lines)` | Find header row from TSV lines | All | Shared utility for all TSV parsing |
| `loadSettings()` | Load settings.tsv as key-value object | All | Handles TSV parsing with header detection |
| `loadEventsData()` | Load events.tsv as array of objects | All | Parses ID/ACTION/RESULT/DURATION/SDAY/AP columns |
| `loadUserData()` | Load userData.tsv as array of objects | All | Parses ID/NRD/LEVEL columns |
| `parseTSV(tsvContent, filename)` | Parse TSV files with comments/headers | All | Reads `# headerRow = X` comments for precise parsing |
| `loadUserData(tsvContent)` | Load and analyze userData.tsv | All | Returns user data + level analytics |
| `loadTestScores(tsvContent)` | Load and analyze testScores.tsv | All | Returns scores + skill analytics |
| `loadImprovements(tsvContent)` | Load and analyze improves.tsv | All | Returns improvements + analytics |
| `calculateOverallAnalytics(allData)` | Cross-data analytics calculation | All | Comprehensive insights across all data |
| `maxIDForLearnsToday()` | Calculate max item ID available for learning today | All | Returns max ID based on license tier and progress |
| `getCurrentSprintDay(settings)` | Calculate current sprint day from start date | All | Returns day number (1-based) from curriculum start |
| `logPerformance(func, source, time, error)` | Log function execution timing | All | Performance monitoring |
| `getPerformanceSummary()` | Get timing statistics summary | All | Returns performance metrics |
| `clearPerformanceLog()` | Clear performance log | All | Reset timing data |

### TSV File Format Support
- **Comment lines**: Start with `#` (automatically skipped)
- **Header location**: Use `# headerRow = X` to specify exact header row number
- **Fallback parsing**: If no headerRow comment, finds first non-comment line
- **Performance tracking**: All parsing operations are timed and logged

### Variables & Objects
| Name | Type | Purpose | Screen | Notes |
|------|------|---------|---------|-------|
| `themes` | Object | Screen background colors | All | Maps F1/F2/F3 to CSS values |
| `retentionChart` | Chart.js | Chart instance reference | Start | Global for updates/manipulation |
| `dataManager` | DataManager | Global data handling instance | All | TSV parsing and analytics with timing |
| `syncManager` | SyncManager | IndexedDB persistence manager | All | Auto-syncs on mode/page changes |

### Storage & Persistence
| Component | Purpose | Capacity | Performance |
|-----------|---------|----------|-------------|
| **localStorage** | Primary cache for fast access | ~5-10MB | <1ms read/write |
| **IndexedDB** | Persistent storage across sessions | ~50MB+ | 50-200ms sync |
| **File Export** | Backup fallback when IndexedDB fails | Unlimited | User-initiated |

**Sync Triggers**: Mode changes, page navigation, browser close
**Documentation**: See `INDEXEDDB_SYNC_DOCS.md` for complete persistence details
