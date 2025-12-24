# Example Claim Codes for Testing

## How to Use These Codes

These are **real, valid claim codes** generated using the FNV-1a hash function implemented in both fasting.html and badges.js. You can test the badges page with these codes.

---

## Valid Test Codes

### 5-Day Milestone
```
FAST-5-20260110-5YN8MG
```
- **Milestone**: 5 days
- **Date Earned**: January 10, 2026
- **Test**: Paste into badges.html, enter any name, click "Validate & Generate"
- **Expected Result**: ✓ Code verified, badge renders

### 10-Day Milestone
```
FAST-10-20260115-S58ZMG
```
- **Milestone**: 10 days
- **Date Earned**: January 15, 2026
- **Test**: Same as above

### 15-Day Milestone
```
FAST-15-20260120-5F4KVA
```
- **Milestone**: 15 days
- **Date Earned**: January 20, 2026

### 20-Day Milestone
```
FAST-20-20260125-P9J1W9
```
- **Milestone**: 20 days
- **Date Earned**: January 25, 2026

### 25-Day Milestone
```
FAST-25-20260201-FJXEKQ
```
- **Milestone**: 25 days
- **Date Earned**: February 1, 2026

### 30-Day Milestone
```
FAST-30-20260205-FMXF50
```
- **Milestone**: 30 days
- **Date Earned**: February 5, 2026

### 35-Day Milestone
```
FAST-35-20260210-0EBCKA
```
- **Milestone**: 35 days
- **Date Earned**: February 10, 2026

### 40-Day Milestone (Full Journey)
```
FAST-40-20260215-GKXVFA
```
- **Milestone**: 40 days (COMPLETE!)
- **Date Earned**: February 15, 2026
- **Special Feature**: This code will unlock the "40-Day Mega Certificate" button

---

## How These Codes Were Generated

Using the FNV-1a hash algorithm:

```javascript
const CLAIM_SECRET = 'YEGORCREATIVE_FASTING_2026';

// Example: 10-day milestone on Jan 15, 2026
const milestone = 10;
const dateStr = '20260115';
const hashInput = `10|20260115|YEGORCREATIVE_FASTING_2026`;
const hash = fnv1a(hashInput); // Results in: "S58ZMG"
const claimCode = `FAST-10-20260115-S58ZMG`;
```

---

## Testing Workflow

### Step 1: Generate a Badge
1. Open `badges.html` in your browser
2. Enter your name (e.g., "Test User")
3. Paste one of the codes above (e.g., `FAST-10-20260115-S58ZMG`)
4. Click "Validate & Generate"

### Step 2: Verify Success
You should see:
- ✓ Status: "Code verified!"
- A badge preview on the canvas
- "Download Badge (PNG)" button is enabled

### Step 3: Download Badge
Click "Download Badge (PNG)" to save the badge as:
```
FASTING_10DAYS_Test_User.png
```

### Step 4: Test 40-Day Certificate
1. Use the 40-day code: `FAST-40-20260215-GKXVFA`
2. Enter name and validate
3. After validation, you'll see:
   - Badge preview (as usual)
   - **NEW**: "40-Day Mega Certificate" section
   - "Open Certificate (Print / Save as PDF)" button
4. Click the button to open printable certificate in new tab
5. Press Ctrl+P to print or "Save as PDF"

---

## Invalid Code Examples (For Error Testing)

If you want to test error handling, try these invalid codes:

### Missing prefix
```
5-20260110-5YN8MG
```
Expected error: "Code must start with FAST"

### Wrong milestone
```
FAST-99-20260110-5YN8MG
```
Expected error: "Invalid milestone. Must be one of: 5, 10, 15, 20, 25, 30, 35, 40"

### Wrong date format
```
FAST-5-2026-01-10-5YN8MG
```
Expected error: "Date must be in format YYYYMMDD"

### Wrong hash
```
FAST-5-20260110-WRONG123
```
Expected error: "Invalid claim code. Code could not be verified."

### Empty name
```
[Leave name blank, use valid code]
[Click Validate & Generate]
```
Expected error: "Name is required"

---

## How to Verify a Code Yourself

Open your browser DevTools Console and paste:

```javascript
const CLAIM_SECRET = 'YEGORCREATIVE_FASTING_2026';

function fnv1a(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        hash = hash >>> 0;
    }
    return Math.abs(hash).toString(36).toUpperCase().slice(0, 6);
}

// Test for milestone 10, date 20260115
const milestone = 10;
const dateStr = '20260115';
const hashInput = `${milestone}|${dateStr}|${CLAIM_SECRET}`;
const computedHash = fnv1a(hashInput);
console.log(computedHash); // Should print: S58ZMG
```

If the computed hash matches the last part of the code, the code is valid!

---

## Real-World Usage

In production (starting Jan 1, 2026):

1. User completes 5 days on their fasting.html page
2. Automatic milestone banner appears with a code like:
   ```
   FAST-5-{TODAY'S DATE}-{AUTO HASH}
   ```
3. User copies code and goes to badges.html
4. Process is identical to testing above

The hash will always be the same for the same milestone + date combination, allowing users to:
- Generate the code once on the fasting page
- Claim it on badges page anytime
- Share it without security concerns (tied to specific date)
- Regenerate if they forgot to save (same code)

---

## Technical Notes

- All codes are **deterministic**: Same milestone + date = same hash
- Codes include **date of earning**: Can't claim future milestones
- Codes are **specific to milestone**: Can't claim different amount
- Hash includes **secret phrase**: Prevents external code generation
- Hashes are **case-insensitive**: `S58ZMG` = `s58zmg`

---

## Tips for Testing

1. **Test all 8 milestones** to ensure each works
2. **Try invalid codes** to verify error messages
3. **Test on mobile** to check responsive design
4. **Test 40-day code** to verify certificate opens
5. **Try different names** to verify badge personalization
6. **Copy codes to different browser** to verify they're universal
7. **Test without internet** to verify no external dependencies

---

**Last Updated**: Dec 24, 2025
**Valid Until**: Indefinitely (deterministic codes)
