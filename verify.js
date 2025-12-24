/**
 * verify.js
 * Certificate verification system for yegorcreative.com fasting badges
 * Trust: Deterministic code validation allows offline verification without backend
 * A11y: All status updates announced via aria-live regions
 */

(function initVerification() {
    /* ============================================
       CONSTANTS & DOM REFERENCES
       ============================================ */
    
    const CLAIM_SECRET = 'YEGORCREATIVE_FASTING_2026';
    
    // DOM elements
    const verifyCodeInput = document.getElementById('verifyCode');
    const verifyBtn = document.getElementById('verifyBtn');
    const verifyStatus = document.getElementById('verifyStatus');
    const verifyResults = document.getElementById('verifyResults');
    const detailMilestone = document.getElementById('detailMilestone');
    const detailDate = document.getElementById('detailDate');
    const detailStatus = document.getElementById('detailStatus');
    const megaCertIndicator = document.getElementById('megaCertIndicator');
    const claimBadgeLink = document.getElementById('claimBadgeLink');
    const verifyNote = document.getElementById('verifyNote');

    // Early exit if not on verify page
    if (!verifyCodeInput || !verifyBtn) {
        return;
    }

    /* ============================================
       HASHING ALGORITHM (FNV-1a, 32-bit)
       Identical to badges.js and fasting.html for cross-validation
       Trust: Deterministic function ensures consistent code generation
       ============================================ */
    
    function fnv1a(str) {
        let hash = 2166136261;
        const prime = 16777619;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = (hash * prime) >>> 0; // Keep 32-bit unsigned
        }
        return hash.toString(36).toUpperCase().padStart(6, '0').slice(-6);
    }

    /* ============================================
       CODE PARSING & VALIDATION
       Logic: Parse format FAST-{milestone}-{YYYYMMDD}-{hash6}
       ============================================ */
    
    function parseCode(code) {
        // Validation: Check format (case-insensitive)
        const regex = /^FAST-(\d+)-(\d{8})-([A-Z0-9]{6})$/i;
        const match = code.trim().toUpperCase().match(regex);
        
        if (!match) {
            return null;
        }

        return {
            milestone: parseInt(match[1], 10),
            dateStr: match[2],
            providedHash: match[3]
        };
    }

    /* ============================================
       CODE VERIFICATION
       Logic: Recompute hash from milestone+date, compare with provided
       Trust: If hashes match, code was generated with same secret
       ============================================ */
    
    function verifyCode(milestone, dateStr, providedHash) {
        // Recompute expected hash
        const hashInput = `${milestone}|${dateStr}|${CLAIM_SECRET}`;
        const expectedHash = fnv1a(hashInput);
        
        // Case-insensitive comparison
        return expectedHash === providedHash.toUpperCase();
    }

    /* ============================================
       DATE FORMATTING
       Logic: Convert YYYYMMDD string to readable format
       ============================================ */
    
    function formatDate(dateStr) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        
        const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    /* ============================================
       VERIFY HANDLER
       Logic: Parse code, validate, display results
       A11y: Announce results via aria-live status region
       ============================================ */
    
    function handleVerify() {
        const code = verifyCodeInput.value.trim();
        
        // Clear previous results
        verifyStatus.textContent = '';
        verifyStatus.className = 'status-message';
        verifyResults.hidden = true;

        if (!code) {
            verifyStatus.textContent = 'Please enter a certificate code.';
            verifyStatus.classList.add('status-error');
            return;
        }

        // Parse the code
        const parsed = parseCode(code);
        if (!parsed) {
            verifyStatus.textContent = 'Invalid code format. Expected: FAST-{days}-{date}-{hash}';
            verifyStatus.classList.add('status-error');
            return;
        }

        const { milestone, dateStr, providedHash } = parsed;

        // Validate milestone (must be 5-40, in increments)
        const validMilestones = [5, 10, 15, 20, 25, 30, 35, 40];
        if (!validMilestones.includes(milestone)) {
            verifyStatus.textContent = 'Invalid milestone. Must be one of: 5, 10, 15, 20, 25, 30, 35, 40.';
            verifyStatus.classList.add('status-error');
            return;
        }

        // Validate date format (YYYYMMDD)
        if (!/^\d{8}$/.test(dateStr)) {
            verifyStatus.textContent = 'Invalid date format in code.';
            verifyStatus.classList.add('status-error');
            return;
        }

        // Verify the code
        if (!verifyCode(milestone, dateStr, providedHash)) {
            verifyStatus.textContent = 'Invalid certificate code. This code was not generated by yegorcreative.com.';
            verifyStatus.classList.add('status-error');
            return;
        }

        // Code is valid! Display results
        displayResults(milestone, dateStr, providedHash);
        verifyStatus.textContent = '✓ Certificate verified successfully!';
        verifyStatus.classList.add('status-success');
    }

    /* ============================================
       DISPLAY RESULTS
       Logic: Show verification details and action buttons
       A11y: Hidden section becomes visible with aria-live announcement
       ============================================ */
    
    function displayResults(milestone, dateStr, code) {
        const formattedDate = formatDate(dateStr);

        // Update detail rows
        detailMilestone.textContent = `${milestone} days`;
        detailDate.textContent = formattedDate;
        detailStatus.textContent = 'Valid ✓';

        // Show mega certificate indicator if 40-day
        if (milestone === 40) {
            megaCertIndicator.hidden = false;
            verifyNote.textContent = 'This is a 40-Day Mega Certificate. Congratulations on completing the full journey!';
        } else {
            megaCertIndicator.hidden = true;
            verifyNote.textContent = `This ${milestone}-day milestone was earned on ${formattedDate}.`;
        }

        // Set claim badge link with code pre-filled
        claimBadgeLink.href = `badges.html?code=${code}`;
        claimBadgeLink.hidden = false;

        // Show results section
        verifyResults.hidden = false;
    }

    /* ============================================
       EVENT LISTENERS
       ============================================ */
    
    verifyBtn.addEventListener('click', handleVerify);
    
    // Allow Enter key to submit
    verifyCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleVerify();
        }
    });

    /* ============================================
       URL PARAMETER HANDLING
       Logic: If code is in ?code=... parameter, pre-fill and verify
       Use case: Badges page can link to verify.html?code=...
       ============================================ */
    
    function checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (code) {
            verifyCodeInput.value = code;
            // Auto-verify if code is provided
            setTimeout(handleVerify, 100);
        }
    }

    // Check for URL parameters on page load
    checkUrlParams();
})();
