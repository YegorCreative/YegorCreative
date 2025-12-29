/* ===================================
   BADGES PAGE - CLAIM CODE VALIDATION & BADGE GENERATION
   Maintainability: Full doc comments explain trust/a11y/logic
   Trust: Deterministic code validation, no backend required
   A11y: All interactive elements keyboard accessible, status updates announced
   =================================== */

(function initBadgesPage() {
    const CLAIM_SECRET = 'YEGORCREATIVE_FASTING_2026';
    const MILESTONES = [5, 10, 15, 20, 25, 30, 35, 40];

    // DOM elements
    const nameInput = document.getElementById('badgeName');
    const codeInput = document.getElementById('claimCode');
    const validateBtn = document.getElementById('validateBtn');
    const statusMsg = document.getElementById('statusMsg');
    const previewSection = document.getElementById('previewSection');
    const canvas = document.getElementById('badgeCanvas');
    const downloadBtn = document.getElementById('downloadPngBtn');
    const certificateSection = document.getElementById('certificateSection');
    const openCertBtn = document.getElementById('openCertBtn');
    
    // Share block elements
    const shareBlock = document.getElementById('shareBlock');
    const shareCaption = document.getElementById('shareCaption');
    const copyCaptionBtn = document.getElementById('copyCaptionBtn');
    const shareTags = document.getElementById('shareTags');

    let currentValidation = null;

    // ============================================
    // 1. SHARED UTILITIES
    // ============================================

    // FNV-1a hash function for validation
    function fnv1a(str) {
        let hash = 2166136261; // 32-bit offset basis
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
            hash = hash >>> 0; // Keep 32-bit unsigned
        }
        return Math.abs(hash).toString(36).toUpperCase().slice(0, 6);
    }

    // Format date string YYYYMMDD -> "Jan 10, 2026"
    function formatDate(dateStr) {
        const year = dateStr.slice(0, 4);
        const month = parseInt(dateStr.slice(4, 6), 10);
        const day = parseInt(dateStr.slice(6, 8), 10);
        const date = new Date(year, month - 1, day);
        const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return formatter.format(date);
    }

    // ============================================
    // 2. PARSE CLAIM CODE
    // ============================================
    function parseClaimCode(code) {
        const trimmed = code.trim().toUpperCase();
        const parts = trimmed.split('-');
        
        if (parts.length !== 4) {
            return { error: 'Invalid code format. Expected: FAST-{days}-{date}-{hash}' };
        }

        const [prefix, milestoneStr, dateStr, hash] = parts;

        if (prefix !== 'FAST') {
            return { error: 'Code must start with FAST' };
        }

        const milestone = parseInt(milestoneStr, 10);
        if (isNaN(milestone) || !MILESTONES.includes(milestone)) {
            return { error: `Invalid milestone. Must be one of: ${MILESTONES.join(', ')}` };
        }

        if (!/^\d{8}$/.test(dateStr)) {
            return { error: 'Date must be in format YYYYMMDD' };
        }

        if (!/^[A-Z0-9]{6}$/.test(hash)) {
            return { error: 'Hash must be 6 alphanumeric characters' };
        }

        return { milestone, dateStr, hash };
    }

    // ============================================
    // 3. VERIFY CLAIM CODE
    // ============================================
    function verifyClaimCode(milestone, dateStr, providedHash) {
        const hashInput = `${milestone}|${dateStr}|${CLAIM_SECRET}`;
        const computedHash = fnv1a(hashInput);
        return computedHash === providedHash.toUpperCase();
    }

    // ============================================
    // 4. VALIDATE NAME
    // ============================================
    function validateName(name) {
        const trimmed = name.trim();
        if (!trimmed) {
            return { valid: false, error: 'Name is required' };
        }
        if (trimmed.length > 30) {
            return { valid: false, error: 'Name must be 30 characters or less' };
        }
        return { valid: true, value: trimmed };
    }

    // ============================================
    // 5. DRAW BADGE ON CANVAS
    // ============================================
    function drawBadge(milestone, name, dateStr) {
        const ctx = canvas.getContext('2d');
        const size = 1080;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#f5f3ff');
        gradient.addColorStop(1, '#e8e5ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Border
        ctx.strokeStyle = '#6805F2';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, size - 40, size - 40);

        // Badge circle
        const centerX = size / 2;
        const centerY = size / 2.2;
        const radius = 200;

        // Circle background
        ctx.fillStyle = '#6805F2';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Circle border (lighter)
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Milestone number
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 140px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(milestone, centerX, centerY);

        // "Days" text below circle
        ctx.fillStyle = '#1b1b1b';
        ctx.font = 'bold 44px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Days of', centerX, centerY + radius + 80);
        ctx.fillText('Prayer & Fasting', centerX, centerY + radius + 140);

        // Name
        ctx.fillStyle = '#2f2415';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const nameTrimmed = name.substring(0, 30);
        ctx.fillText(nameTrimmed, centerX, centerY + radius + 280);

        // Date
        const formattedDate = formatDate(dateStr);
        ctx.fillStyle = '#666';
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`Earned ${formattedDate}`, centerX, centerY + radius + 350);

        // Footer
        ctx.fillStyle = '#999';
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('yegorcreative.com/fasting', centerX, size - 40);
    }

    // ============================================
    // 6. DOWNLOAD PNG
    // ============================================
    function downloadBadgePNG(milestone, name) {
        const filename = `FASTING_${milestone}DAYS_${name.replace(/\s+/g, '_')}.png`;
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    }

    // ============================================
    // 7. GENERATE & OPEN 40-DAY CERTIFICATE
    // ============================================
    /**
     * openCertificate - Generate printable 40-day mega certificate
     * Features: Premium design with milestone stamp strip, certificate ID, verify link
     * Maintainability: Print-friendly CSS ensures PDF output works correctly
     * A11y: Semantic HTML for certificate content
     */
    function openCertificate(milestone, name, dateStr) {
        const formattedDate = formatDate(dateStr);
        
        // Generate claim code for this certificate (used as Certificate ID)
        const hashInput = `${milestone}|${dateStr}|${CLAIM_SECRET}`;
        const hash = fnv1a(hashInput);
        const certificateCode = `FAST-${milestone}-${dateStr}-${hash}`;
        
        const certHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>40-Day Fasting Certificate</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Georgia', serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .certificate {
            max-width: 900px;
            margin: 20px auto;
            background: white;
            padding: 60px;
            border: 8px solid #6805F2;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            page-break-after: always;
        }
        .cert-header {
            margin-bottom: 40px;
        }
        .cert-title {
            font-size: 48px;
            font-weight: bold;
            color: #6805F2;
            margin-bottom: 10px;
        }
        .cert-subtitle {
            font-size: 24px;
            color: #333;
            margin-bottom: 40px;
        }
        .cert-content {
            margin: 40px 0;
        }
        .cert-text {
            font-size: 18px;
            color: #555;
            line-height: 1.8;
            margin: 20px 0;
        }
        .name-box {
            font-size: 36px;
            font-weight: bold;
            color: #6805F2;
            margin: 30px 0;
            padding-bottom: 15px;
            border-bottom: 3px solid #FFD700;
        }
        .milestone-badges {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
            margin: 40px 0;
        }
        .badge-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #6805F2;
            color: #FFD700;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 24px;
            border: 4px solid #FFD700;
        }
        .badge-circle-label {
            font-size: 11px;
            margin-top: 4px;
        }
        .verse {
            font-style: italic;
            color: #666;
            margin: 30px 0;
            font-size: 16px;
        }
        .stamp-strip {
            border: 2px dashed #B45309;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            background: rgba(180, 83, 9, 0.05);
        }
        .stamp-strip-title {
            font-size: 12px;
            color: #B45309;
            font-weight: bold;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .stamp-row {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
        }
        .small-stamp {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #B45309;
            color: #FFD700;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            border: 2px solid #FFD700;
        }
        .small-stamp-label {
            font-size: 9px;
            margin-top: 2px;
        }
        .date {
            font-size: 16px;
            color: #999;
            margin-top: 40px;
        }
        .cert-id {
            font-size: 12px;
            color: #999;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            word-break: break-all;
        }
        .verify-link {
            font-size: 13px;
            color: #0066cc;
            margin: 10px 0;
        }
        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            font-size: 14px;
            color: #999;
        }
        .print-btn {
            display: block;
            margin: 20px auto;
            padding: 12px 30px;
            background: #6805F2;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
        }
        .print-btn:hover {
            background: #5503d1;
        }
        @media print {
            body {
                padding: 0;
                background: white;
            }
            .certificate {
                margin: 0;
                box-shadow: none;
                page-break-inside: avoid;
            }
            .print-btn {
                display: none;
            }
        }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
    
    <div class="certificate">
        <div class="cert-header">
            <div class="cert-title">🎉 Certificate of Achievement</div>
            <div class="cert-subtitle">40 Days of Prayer & Fasting</div>
        </div>

        <div class="cert-content">
            <p class="cert-text">This certifies that</p>
            <div class="name-box">${name}</div>
            <p class="cert-text">has successfully completed a 40-day journey of<br><strong>Prayer & Fasting</strong></p>
            
            <p class="cert-text">demonstrating discipline, commitment, and faith in pursuing spiritual growth and deeper connection with God.</p>

            <div class="milestone-badges">
                <div class="badge-circle">5<div class="badge-circle-label">Days</div></div>
                <div class="badge-circle">10<div class="badge-circle-label">Days</div></div>
                <div class="badge-circle">15<div class="badge-circle-label">Days</div></div>
                <div class="badge-circle">20<div class="badge-circle-label">Days</div></div>
                <div class="badge-circle">25<div class="badge-circle-label">Days</div></div>
                <div class="badge-circle">30<div class="badge-circle-label">Days</div></div>
                <div class="badge-circle">35<div class="badge-circle-label">Days</div></div>
                <div class="badge-circle">40<div class="badge-circle-label">Days</div></div>
            </div>

            <div class="verse">"Draw near to God, and He will draw near to you." — James 4:8</div>

            <!-- Premium Stamp Strip -->
            <div class="stamp-strip">
                <div class="stamp-strip-title">Milestone Achievements</div>
                <div class="stamp-row">
                    <div class="small-stamp">5<div class="small-stamp-label">Days</div></div>
                    <div class="small-stamp">10<div class="small-stamp-label">Days</div></div>
                    <div class="small-stamp">15<div class="small-stamp-label">Days</div></div>
                    <div class="small-stamp">20<div class="small-stamp-label">Days</div></div>
                    <div class="small-stamp">25<div class="small-stamp-label">Days</div></div>
                    <div class="small-stamp">30<div class="small-stamp-label">Days</div></div>
                    <div class="small-stamp">35<div class="small-stamp-label">Days</div></div>
                    <div class="small-stamp">40<div class="small-stamp-label">Days</div></div>
                </div>
            </div>

            <p class="cert-text">Earned on: <strong>${formattedDate}</strong></p>

            <!-- Certificate ID & Verification -->
            <div class="cert-id">Certificate ID: ${certificateCode}</div>
            <div class="verify-link">Verify this certificate: yegorcreative.com/verify</div>
        </div>

        <div class="footer">
            <p>YegorCreative.com | A Journey of Transformation</p>
        </div>
    </div>
</body>
</html>
        `;

        const certWindow = window.open('', 'certificate', 'width=950,height=1100');
        certWindow.document.write(certHtml);
        certWindow.document.close();
    }

    // ============================================
    // 8. VALIDATION & STATUS DISPLAY
    // ============================================
    function showStatus(message, type = 'info') {
        statusMsg.textContent = message;
        statusMsg.className = `status-message status-${type}`;
        statusMsg.setAttribute('role', 'status');
    }

    function hideStatus() {
        statusMsg.textContent = '';
        statusMsg.className = 'status-message';
    }

    // ============================================
    // 9. HANDLE VALIDATION & GENERATION
    // ============================================
    if (validateBtn) {
    validateBtn.addEventListener('click', () => {
        hideStatus();

        // Validate name
        const nameValidation = validateName(nameInput.value);
        if (!nameValidation.valid) {
            showStatus(nameValidation.error, 'error');
            return;
        }

        // Parse claim code
        const parsed = parseClaimCode(codeInput.value);
        if (parsed.error) {
            showStatus(parsed.error, 'error');
            return;
        }

        // Verify claim code
        if (!verifyClaimCode(parsed.milestone, parsed.dateStr, parsed.hash)) {
            showStatus('Invalid claim code. Code could not be verified.', 'error');
            return;
        }

        // Success!
        const fullClaimCode = codeInput.value.trim().toUpperCase();
        currentValidation = {
            name: nameValidation.value,
            milestone: parsed.milestone,
            dateStr: parsed.dateStr,
            code: fullClaimCode
        };

        showStatus(`✓ Code verified! Badge ready for ${currentValidation.name}.`, 'success');

        // Draw badge
        drawBadge(currentValidation.milestone, currentValidation.name, currentValidation.dateStr);

        // Show preview section
        previewSection.hidden = false;
        downloadBtn.disabled = false;

        // Show certificate section if 40-day milestone
        if (currentValidation.milestone === 40) {
            certificateSection.hidden = false;
        } else {
            certificateSection.hidden = true;
        }

        // Scroll to preview
        setTimeout(() => {
            previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    });
    }

    // Download PNG button
    if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        if (currentValidation) {
            downloadBadgePNG(currentValidation.milestone, currentValidation.name);
            // Show share block after download
            showShareBlock(currentValidation.milestone, currentValidation.name, currentValidation.dateStr, currentValidation.code);
        }
    });
    }

    // ============================================
    // SHARE FUNCTIONALITY
    // ============================================
    
    /**
     * showShareBlock - Display share section with customized caption and hashtags
     * A11y: Share block is unhidden, enabling screen reader discovery
     * Logic: Generate faith-centered caption with site URL and standard hashtags
     */
    function showShareBlock(milestone, name, dateStr, code) {
        // Generate caption
        const captions = {
            5: `I just completed 5 days of prayer & fasting. God is opening my eyes to deeper faith. yegorcreative.com/fasting`,
            10: `I just completed 10 days of prayer & fasting. God is building something new in me. yegorcreative.com/fasting`,
            15: `I've reached 15 days of prayer & fasting. God's strength sustains me. yegorcreative.com/fasting`,
            20: `20 days of prayer & fasting complete. I can feel God's presence and freedom. yegorcreative.com/fasting`,
            25: `25 days down! Prayer & fasting have transformed my perspective. Grateful for God's grace. yegorcreative.com/fasting`,
            30: `30 days of prayer & fasting! Home stretch ahead. God's faithfulness never fails. yegorcreative.com/fasting`,
            35: `Almost there! 35 days of prayer & fasting. The final stretch brings deeper victory. yegorcreative.com/fasting`,
            40: `I completed 40 days of prayer & fasting! Transformed by faith, emboldened by grace. This journey changed me. yegorcreative.com/fasting`
        };

        const caption = captions[milestone] || `I completed ${milestone} days of prayer & fasting. yegorcreative.com/fasting`;
        shareCaption.textContent = caption;

        // Hashtags (faith-centered, inclusive)
        const hashtags = '#PrayerAndFasting #ChristianDiscipline #SpiritualGrowth #FaithJourney #SeekGod';
        shareTags.textContent = hashtags;

        shareBlock.hidden = false;

        // Note: Removed aria-live announcement here to avoid overwriting validation status
        // Share section has its own visual feedback via the copy button
    }

    // Copy caption button
    if (copyCaptionBtn) {
    copyCaptionBtn.addEventListener('click', () => {
        const fullText = shareCaption.textContent + '\n' + shareTags.textContent;
        
        // Use Clipboard API with fallback
        if (navigator.clipboard) {
            navigator.clipboard.writeText(fullText).then(() => {
                // A11y: Announce success
                const statusEl = document.querySelector('[aria-live="polite"]');
                if (statusEl) {
                    const originalText = statusEl.textContent;
                    statusEl.textContent = '✓ Caption copied to clipboard!';
                    setTimeout(() => {
                        statusEl.textContent = originalText;
                    }, 3000);
                }
                // Visual feedback
                copyCaptionBtn.textContent = '✓ Copied!';
                setTimeout(() => {
                    copyCaptionBtn.textContent = 'Copy Caption';
                }, 2000);
            }).catch(() => {
                fallbackCopy(fullText);
            });
        } else {
            fallbackCopy(fullText);
        }
    });
    }

    /**
     * fallbackCopy - Fallback copy mechanism for older browsers
     * Logic: Create temporary textarea, select, copy, clean up
     */
    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            copyCaptionBtn.textContent = '✓ Copied!';
            setTimeout(() => {
                copyCaptionBtn.textContent = 'Copy Caption';
            }, 2000);
        } catch (err) {
            copyCaptionBtn.textContent = 'Copy failed';
        }
        document.body.removeChild(textarea);
    }

    // Open certificate button
    if (openCertBtn) {
    openCertBtn.addEventListener('click', () => {
        if (currentValidation) {
            openCertificate(currentValidation.milestone, currentValidation.name, currentValidation.dateStr);
        }
    });
    }

    // ============================================
    // 10. POPULATE CODE FROM URL QUERY STRING
    // ============================================
    function initFromURL() {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
            codeInput.value = code;
            codeInput.focus();
        }
    }

    // Initialize on load
    initFromURL();
})();
