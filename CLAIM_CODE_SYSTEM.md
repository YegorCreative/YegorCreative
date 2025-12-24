# Fasting Tracker - Claim Code System Implementation

## Overview
This document summarizes the implementation of a secure claim code system for the fasting tracker, enabling users to earn milestone badges and certificates.

## Files Created/Modified

### New Files
1. **badges.html** - Badge claiming page
   - Form to enter name and claim code
   - Canvas preview of badge
   - Certificate button for 40-day milestone
   - Mobile-first responsive design
   - Proper navigation and footer matching site design

2. **badges.js** - Core badge logic
   - FNV-1a hash function for deterministic claim codes
   - Claim code parsing and validation
   - Canvas badge rendering (1080x1080)
   - PNG download functionality
   - 40-day mega certificate generation (print-to-PDF via browser)
   - URL query parameter support (?code=XXXX)

### Modified Files
1. **fasting.html**
   - Added milestone banner container
   - Updated tracker script with:
     - FNV-1a hash function
     - Milestone detection logic
     - localStorage for milestone dates and shown milestones
     - Banner UI for displaying claim codes
     - Copy button functionality
   - Updated navigation to include Badges link

2. **index.html**
   - Updated navigation to include Badges link (Home, Creative, Fasting, Badges, About, Contact)

3. **CSS/styles.css**
   - Milestone banner styles (mobile-first)
   - Badge generator form styles
   - Canvas container styles
   - Certificate section styles
   - Status message styles (success/error/info)
   - Form input and label styles
   - Responsive media queries for desktop

## System Architecture

### Claim Code Format
```
FAST-{milestone}-{dateStr}-{hash}
Example: FAST-10-20260110-7K3P2W

Components:
- FAST: Fixed prefix
- {milestone}: One of [5, 10, 15, 20, 25, 30, 35, 40]
- {dateStr}: Date in YYYYMMDD format (local time when earned)
- {hash}: 6-character FNV-1a hash (base36, uppercase)
```

### Hash Generation (Both Tracker & Badges)
```javascript
const CLAIM_SECRET = 'YEGORCREATIVE_FASTING_2026';
const hashInput = `${milestone}|${dateStr}|${CLAIM_SECRET}`;
const hash = fnv1a(hashInput); // Returns 6-char base36 string
```

Both fasting.html and badges.js implement the same FNV-1a function to ensure:
- Tracker generates valid codes
- Badges page can validate without network
- Codes cannot be easily guessed

### Data Flow

#### 1. Fasting Tracker (fasting.html)
When user completes days:
1. Click day button → toggle progress[i]
2. saveProgress() called
3. calculateCompletedCount()
4. checkAndShowMilestone():
   - Check if completedCount >= any milestone
   - Load milestoneDates from localStorage
   - If milestone not yet earned: save date to localStorage
   - If milestone not yet shown: 
     - Generate claim code using stored date
     - Show banner with code + copy button
     - Mark milestone as shown in localStorage
     - Provide link to badges.html?code=XXXX

#### 2. Badges Page (badges.html)
When user submits claim:
1. Validate name (required, max 30 chars)
2. Parse claim code (FAST-{m}-{d}-{h} format)
3. Verify hash:
   - Extract milestone, date, hash from code
   - Recompute hash using same algorithm
   - Compare (case-insensitive)
4. If valid:
   - Draw badge on canvas (1080x1080)
   - Display in preview
   - Enable PNG download
   - If milestone==40: show certificate button
5. PNG download: canvas.toDataURL() → blob → download
6. Certificate: Open new window with HTML + CSS printable page

### LocalStorage Keys

**fasting.html:**
- `fasting40_progress`: Array of 40 booleans (completed days)
- `fasting40_milestoneDates`: Object {milestone: dateStr} (when earned)
- `fasting40_shownMilestones`: Array of milestone numbers (already displayed)
- `fasting40_mywhy`: User's fasting reason (existing)

**badges.html:**
- Reads only (no writing)

## Features

### ✅ Milestone Badges (5, 10, 15, 20, 25, 30, 35, 40 days)
- Automatically detected based on completed days
- One code per milestone per user/device
- Codes are deterministic (same milestone+date always = same code)
- No expiration

### ✅ Badge Generation
- Canvas-based PNG (no external libs)
- 1080x1080px, high quality
- Includes:
  - Milestone number in badge circle
  - User name
  - Completion date (formatted)
  - YegorCreative branding
  - Purple + gold color scheme matching site

### ✅ 40-Day Mega Certificate
- Full-page HTML + CSS
- Printable to PDF via browser
- Shows all 8 milestones as circles
- Includes scripture: "Draw near to God..." (James 4:8)
- Professional layout with proper spacing

### ✅ Accessibility
- aria-live for status updates
- Proper form labels
- Focus management
- Keyboard support (Enter to validate)
- Min touch targets: 44px
- Semantic HTML (section, main, footer)
- ARIA descriptions for inputs

### ✅ Mobile-First Design
- Stacked layout on mobile
- Responsive canvas sizing
- Touch-friendly buttons
- Form inputs full-width on mobile
- Horizontal layout on desktop (900px+)

### ✅ Security Considerations
- No backend required
- Claim code is deterministic but includes:
  - Secret phrase (YEGORCREATIVE_FASTING_2026)
  - Date of earning (can't claim future dates)
  - Specific milestone (can't claim wrong amount)
- FNV-1a hash is simple but effective for this use case
  (not cryptographic; proof-of-work, not auth)
- Users could theoretically brute-force codes, but:
  - Limited to 8 milestones × 365 dates = 2920 possibilities per secret
  - Date validation prevents false claims
  - Intended for honor system (not high-security)

## Testing Workflow

### Setup (Jan 1, 2026 onwards)
1. Visit fasting.html
2. Days auto-unlock starting Jan 1, 2026
3. Click days to mark complete

### Milestone Trigger (reaching 5 completed days)
1. Complete 5 days → banner appears
2. Copy code button → copies to clipboard
3. "Claim your badge" link → opens badges.html?code=FAST-5-...

### Badge Claiming
1. Name pre-filled (optional)
2. Code auto-filled from URL
3. Click "Validate & Generate"
4. Canvas renders badge preview
5. Click "Download Badge (PNG)" → downloads PNG
6. If milestone 40: "Open Certificate" button appears
7. Click button → opens new window with printable certificate
8. Ctrl+P or browser Print → Save as PDF

### Mobile Testing
- Banner appears with readable layout
- Buttons/inputs are 44px+ tall
- Copy button works (visual feedback)
- Badge canvas responsive
- Touch-friendly form inputs

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Canvas API support required
- LocalStorage support required
- ES6+ JavaScript (arrow functions, spread operator, etc.)
- No external libraries - pure vanilla JS

## Notes
- All times use local browser time (no timezone conversion)
- localStorage persists across browser sessions
- Clearing cache will reset progress (design choice for privacy)
- Users can claim codes on different devices (stored dates are device-local)
- Code format is base36, supports both uppercase/lowercase input
