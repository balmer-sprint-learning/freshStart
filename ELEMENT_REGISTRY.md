# FreshStart Element Registry

## Purpose
This registry documents all HTML elements with IDs, classes, and their purposes across all pages in the FreshStart app. Use this to find exact element names and avoid guessing.

---

## start.html (Analytics/Dashboard Page)

### Main Content Elements
- **retentionChart** (canvas) - Chart.js doughnut chart for retention analytics
- **chart-container** (div) - container for the chart and center text
- **chart-center-text** (div) - displays percentage in center of doughnut chart

### Structure Elements
- **app-skeleton** (div) - main app container
- **responsive-box** (div) - responsive content wrapper
- **skeleton-header** (div) - header section
- **skeleton-content** (div) - main content area
- **skeleton-footer** (div) - footer section
- **header-fields** (div) - container for header field items
- **footer-fields** (div) - container for footer field items
- **header-field** (div class) - individual header items (BB, Day 196, 42h 3m)
- **footer-field** (div class) - individual footer items (Vocab, Fluency, Other)

---

## action.html (Main Interaction Page)

### Form Input Elements
- **action-question** (textarea) - displays curriculum question, readonly
- **action-clue** (input) - displays curriculum clue, readonly
- **action-answer** (textarea) - displays curriculum answer with delay, readonly
- **info** (textarea) - displays curriculum info with answer, readonly
- **events-display** (textarea) - shows recent events, readonly

### Interactive Elements
- **btn1** (button) - action button 1 (labels change by mode)
- **btn2** (button) - action button 2 (labels change by mode)  
- **btn3** (button) - action button 3 (labels change by mode)

### Container Elements
- **action-fields-container** (div) - holds question/clue/answer fields
- **action-buttons** (div) - holds the three action buttons
- **action-info-section** (div) - holds the info field
- **action-events-section** (div) - holds the events display field

### CSS Classes
- **action-btn** (class) - styling for action buttons
- **action-field-90** (class) - styling for info field
- **action-events-field** (class) - styling for events display field
- **preload** (body class) - prevents transitions during page load

### Structure Elements (same as start.html)
- **app-skeleton** (div) - main app container
- **responsive-box** (div) - responsive content wrapper
- **skeleton-header** (div) - header section
- **skeleton-content** (div) - main content area
- **skeleton-footer** (div) - footer section

---

## profile.html (Profile Configuration Page)

### Form Input Elements
- **nickname** (input) - user nickname input, 2 character max
- **licence** (input) - calculated licence value, readonly
- **version** (input) - version input field
- **prefix** (input) - calculated prefix value, readonly

### Interactive Elements
- **start-button** (button) - "Start my 31 days now!" button

### Container Elements
- **profile-form** (form) - main form container
- **profile-field** (div class) - individual field containers

### Structure Elements (same as other pages)
- **app-skeleton** (div) - main app container
- **responsive-box** (div) - responsive content wrapper
- **skeleton-header** (div) - header section
- **skeleton-content** (div) - main content area
- **skeleton-footer** (div) - footer section

---

## quickTest.html (Performance Test Page)

### Display Elements
- **status** (div) - shows loading/success/error status
- **results** (div) - container for test results
- **eventCount** (div) - displays big number count
- **totalTime** (div) - displays timing information
- **breakdown** (div) - shows performance breakdown

### CSS Classes
- **result-box** (class) - white container with shadow
- **big-number** (class) - large blue number display
- **timing** (class) - green timing text
- **status** (class) - base status styling
- **loading** (class) - yellow loading status
- **success** (class) - green success status
- **error** (class) - red error status
- **breakdown** (class) - monospace breakdown display

---

## testLearnsRemaining.html (Test Page)

### Interactive Elements
- **output** (textarea) - displays test results, 10 rows x 60 cols

### Functions
- **testLearnsRemaining()** - onclick function for test button

---

## index.html (Redirect Page)

No interactive elements - simple redirect to start.html

---

## Common Patterns

### Navigation Elements
All pages use popup menus created in general.js:
- **popup-menu** (div class) - popup menu container
- **popup-option** (div class) - individual menu options

### Shared Structure
All main pages share this structure:
```
app-skeleton
└── responsive-box
    ├── skeleton-header
    │   └── header-fields
    │       └── header-field (x3)
    ├── skeleton-content
    │   └── [page-specific content]
    └── skeleton-footer
        └── footer-fields
            └── footer-field (x3)
```

### CSS Naming Conventions
- **action-*** - elements specific to action page
- **profile-*** - elements specific to profile page
- **skeleton-*** - structural elements shared across pages
- ***-field** - form field containers
- ***-btn** - button elements

---

## Usage Notes

1. **Always check this registry first** before guessing element IDs
2. **Use exact IDs** as documented - no variations
3. **Check CSS classes** for styling purposes
4. **Note readonly attributes** on display-only fields
5. **Remember popup elements** are created dynamically by general.js

Last updated: September 14, 2025
