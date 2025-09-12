# FreshStart App - Claude AI Context Document

## Project Overview
A responsive single-page web application with three main screens: Profile, Start (analytics), and Action (Q&A interface). Built with modern web standards and clean architecture.

## Current Architecture

### File Structure
```
├── index.html          # Main HTML structure containing all screens
├── styles.css          # All styling centralized here
├── general.js          # Shared utilities and navigation
├── profile.js          # Profile screen functionality
├── start.js           # Chart/analytics screen functionality
├── action.js          # Q&A interface functionality
└── README.md          # This context document
```

### Key Design Principles Established

1. **NO inline styles** - All CSS must be in styles.css
2. **Responsive design** - Uses CSS variables `--vw` and `--vh` for scaling
3. **Clean separation** - HTML structure, CSS styling, JS functionality separated
4. **Single-page app** - All screens in index.html, switched via JavaScript
5. **Modern aesthetics** - Clean lines, proper spacing, subtle animations

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
| `parseTSV(tsvContent, filename)` | Parse TSV files with comments/headers | All | Reads `# headerRow = X` comments for precise parsing |
| `loadEventsData(tsvContent)` | Load and analyze events.tsv | All | Returns events + analytics |
| `loadUserData(tsvContent)` | Load and analyze userData.tsv | All | Returns user data + level analytics |
| `loadTestScores(tsvContent)` | Load and analyze testScores.tsv | All | Returns scores + skill analytics |
| `loadSettings(tsvContent)` | Load settings.tsv key:value pairs | All | Returns settings object |
| `loadImprovements(tsvContent)` | Load and analyze improves.tsv | All | Returns improvements + analytics |
| `calculateOverallAnalytics(allData)` | Cross-data analytics calculation | All | Comprehensive insights across all data |
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
