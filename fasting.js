/* ===================================
   FASTING PAGE - 40-DAY TRACKER
   =================================== */

(function() {
    const trackerEl = document.querySelector('#fasting-tracker');
    if (!trackerEl) return;

    const PROGRESS_KEY = 'fasting40_progress';
    const WHY_KEY = 'fasting40_mywhy';
    const START_DATE = new Date(2026, 0, 1);
    const MILESTONE_DATES_KEY = 'fasting40_milestoneDates';
    const SHOWN_MILESTONES_KEY = 'fasting40_shownMilestones';
    const CLAIM_SECRET = 'YEGORCREATIVE_FASTING_2026';
    const MILESTONES = [5, 10, 15, 20, 25, 30, 35, 40];
    const grid = document.getElementById('trackerGrid');
    const completedText = document.getElementById('trackerCompletedText');
    const unlockedText = document.getElementById('trackerUnlockedText');
    const resetBtn = document.getElementById('trackerResetBtn');
    const whyField = document.getElementById('fasting-my-why');
    const encourageKicker = document.getElementById('encourageKicker');
    const encourageText = document.getElementById('encourageText');
    const encourageRef = document.getElementById('encourageRef');

    const dateFmt = new Intl.DateTimeFormat(undefined, { month:'short', day:'numeric', year:'numeric' });

    const themes = [
        { name: 'Surrender', ref: 'Romans 12:1', snippet: 'Offer your life as a living sacrifice.', encouragement: 'Today, surrender what you keep controlling-offer it to God again.' },
        { name: 'Repentance & Cleansing', ref: '1 John 1:9', snippet: 'He is faithful to forgive and cleanse.', encouragement: 'Bring what\'s hidden into the light; receive mercy and keep walking.' },
        { name: 'Renewal of Mind', ref: 'Romans 12:2', snippet: 'Be transformed by renewing your mind.', encouragement: 'Replace the craving with truth; let God reshape your thinking.' },
        { name: 'Warfare & Temptation', ref: 'Ephesians 6:10-11', snippet: 'Be strong... put on the armor of God.', encouragement: 'Don\'t negotiate with temptation-stand, pray, and move forward.' },
        { name: 'Mission & Purpose', ref: 'Matthew 28:19-20', snippet: 'Go and make disciples.', encouragement: 'Your fast is forming you for impact-carry what God is building into your life.' }
    ];

    // FNV-1a hash function for deterministic claim codes
    function fnv1a(str) {
        let hash = 2166136261; // 32-bit offset basis
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
            hash = hash >>> 0; // Keep 32-bit unsigned
        }
        return Math.abs(hash).toString(36).toUpperCase().slice(0, 6);
    }

    // Generate claim code for a milestone
    function generateClaimCode(milestone, dateStr) {
        const hashInput = `${milestone}|${dateStr}|${CLAIM_SECRET}`;
        const hash = fnv1a(hashInput);
        return `FAST-${milestone}-${dateStr}-${hash}`;
    }

    // Get today's date in YYYYMMDD format (local time)
    function getTodayString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }

    // Load milestone dates from localStorage
    function loadMilestoneDates() {
        try {
            return JSON.parse(localStorage.getItem(MILESTONE_DATES_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    // Save milestone dates to localStorage
    function saveMilestoneDates(dates) {
        localStorage.setItem(MILESTONE_DATES_KEY, JSON.stringify(dates));
    }

    // Load shown milestones from localStorage
    function loadShownMilestones() {
        try {
            const shown = JSON.parse(localStorage.getItem(SHOWN_MILESTONES_KEY)) || [];
            return Array.isArray(shown) ? shown : [];
        } catch (e) {
            return [];
        }
    }

    // Save shown milestones to localStorage
    function saveShownMilestones(shown) {
        localStorage.setItem(SHOWN_MILESTONES_KEY, JSON.stringify(shown));
    }

    // Show milestone banner
    function showMilestoneBanner(milestone, claimCode) {
        const banner = document.getElementById('milestoneBanner');
        if (!banner) return;

        const html = `
            <h3>🎉 Milestone Unlocked: ${milestone} Days</h3>
            <p>You've completed <strong>${milestone} days</strong> of prayer and fasting. Great work!</p>
            <p style="font-weight: 600; margin: 10px 0;">Your Claim Code:</p>
            <div class="code-row">
                <input type="text" class="claim-code-input" value="${claimCode}" readonly aria-label="Your claim code"/>
                <button type="button" class="copy-code-btn" aria-label="Copy claim code">Copy</button>
            </div>
            <a href="badges.html?code=${encodeURIComponent(claimCode)}" class="btn fasting-button" style="margin-top: 10px; display: inline-block;">Claim Your Badge</a>
        `;
        banner.innerHTML = html;
        banner.hidden = false;

        // Copy button functionality
        const copyBtn = banner.querySelector('.copy-code-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const input = banner.querySelector('.claim-code-input');
                if (input) {
                    input.select();
                    document.execCommand('copy');
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                    }, 2000);
                }
            });
        }
    }

    // Check for new milestones and show banner if earned
    function checkAndShowMilestone(completedCount, milestoneDates, shownMilestones) {
        const earnedMilestones = MILESTONES.filter(m => completedCount >= m);
        for (const milestone of earnedMilestones) {
            if (!shownMilestones.includes(milestone)) {
                // First time showing this milestone
                let dateStr = milestoneDates[milestone];
                if (!dateStr) {
                    // Milestone newly earned today
                    dateStr = getTodayString();
                    milestoneDates[milestone] = dateStr;
                    saveMilestoneDates(milestoneDates);
                }
                const claimCode = generateClaimCode(milestone, dateStr);
                showMilestoneBanner(milestone, claimCode);
                shownMilestones.push(milestone);
                saveShownMilestones(shownMilestones);
                return; // Show only the latest milestone at a time
            }
        }
    }

    function toLocalMidnight(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function loadProgress() {
        try {
            const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY));
            if (Array.isArray(stored) && stored.length === 40) {
                return stored.map(Boolean);
            }
        } catch (e) {}
        return new Array(40).fill(false);
    }

    let progress = loadProgress();

    function saveProgress() {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
        // Check for milestones after saving
        const completedCount = progress.filter(Boolean).length;
        const milestoneDates = loadMilestoneDates();
        const shownMilestones = loadShownMilestones();
        checkAndShowMilestone(completedCount, milestoneDates, shownMilestones);
    }

    function getActiveCount() {
        const today = toLocalMidnight(new Date());
        const start = toLocalMidnight(START_DATE);
        const diffDays = Math.floor((today - start) / 86400000);
        return Math.max(0, Math.min(40, diffDays + 1));
    }

    function updateProgressText(activeCount) {
        const completed = progress.filter(Boolean).length;
        if (completedText) completedText.textContent = `Completed ${completed} / 40`;
        if (unlockedText) unlockedText.textContent = `Unlocked ${activeCount} / 40`;
    }

    function updateEncouragement(activeCount) {
        if (!encourageKicker || !encourageText || !encourageRef) return;
        const currentDay = activeCount;
        if (currentDay === 0) {
            encourageKicker.textContent = 'Preparing for Day 1 (Starts Jan 1, 2026)';
            encourageText.textContent = 'Use this time to clarify your "why," prepare your heart, and set your commitment.';
            encourageRef.textContent = '';
            return;
        }
        const weekIndex = Math.min(4, Math.max(0, Math.ceil(currentDay / 8) - 1));
        const theme = themes[weekIndex];
        const weekNum = weekIndex + 1;
        encourageKicker.textContent = `Day ${currentDay} Encouragement — Week ${weekNum}: ${theme.name}`;
        encourageText.textContent = `"${theme.snippet}" ${theme.encouragement}`;
        encourageRef.textContent = theme.ref;
    }

    function renderAll() {
        if (!grid) return;
        const activeCount = getActiveCount();
        const todayMidnight = toLocalMidnight(new Date());
        grid.innerHTML = '';
        
        /* Accessibility: Build tracker with keyboard navigation and screen reader support */
        for (let i = 0; i < 40; i++) {
            const dayNumber = i + 1;
            const unlockDate = new Date(START_DATE);
            unlockDate.setDate(unlockDate.getDate() + i);
            const isActive = dayNumber <= activeCount;
            const isToday = isActive && unlockDate.getTime() === todayMidnight.getTime();
            const isDone = !!progress[i];
            const status = isDone ? 'completed' : isActive ? 'available' : 'locked';

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.dataset.day = dayNumber;
            let classes = 'tracker-day';
            if (!isActive) classes += ' day-locked';
            else classes += ' day-active';
            if (isToday) classes += ' day-today';
            if (isDone) classes += ' day-done';
            btn.className = classes;
            btn.setAttribute('role', 'gridcell');
            
            /* Accessibility: Enhanced ARIA labels for screen readers */
            let ariaLabel = `Day ${dayNumber}`;
            if (isToday) ariaLabel += ', today';
            if (isDone) ariaLabel += ', completed';
            else if (isActive) ariaLabel += ', available';
            else ariaLabel += `, locked until ${dateFmt.format(unlockDate)}`;
            btn.setAttribute('aria-label', ariaLabel);
            btn.setAttribute('aria-pressed', isDone ? 'true' : 'false');
            btn.disabled = !isActive;

            const dayLabel = document.createElement('div');
            dayLabel.textContent = `Day ${dayNumber}`;
            btn.appendChild(dayLabel);

            const statusTag = document.createElement('span');
            statusTag.className = 'tracker-status';
            statusTag.setAttribute('aria-hidden', 'true');
            if (isToday) {
                statusTag.textContent = 'Today';
            } else if (isDone) {
                statusTag.textContent = 'Done';
            } else if (isActive) {
                statusTag.textContent = 'Available';
            } else {
                statusTag.textContent = 'Locked';
            }
            btn.appendChild(statusTag);

            if (!isActive) {
                const dateTag = document.createElement('span');
                dateTag.className = 'day-date';
                dateTag.setAttribute('aria-hidden', 'true');
                dateTag.textContent = `Unlocks on ${dateFmt.format(unlockDate)}`;
                btn.appendChild(dateTag);
            }

            if (isActive) {
                btn.addEventListener('click', () => {
                    progress[i] = !progress[i];
                    saveProgress();
                    renderAll();
                });
            }

            grid.appendChild(btn);
        }
        updateProgressText(activeCount);
        updateEncouragement(activeCount);
    }

    function scheduleMidnightRefresh() {
        const now = new Date();
        const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const delay = nextMidnight - now + 250;
        setTimeout(() => {
            renderAll();
            scheduleMidnightRefresh();
        }, delay);
    }

    renderAll();
    scheduleMidnightRefresh();

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Reset your 40-day tracker? This will clear completion marks on this device.')) {
                progress = new Array(40).fill(false);
                saveProgress();
                renderAll();
            }
        });
    }

    if (whyField) {
        const savedWhy = localStorage.getItem(WHY_KEY);
        if (savedWhy) whyField.value = savedWhy;
        whyField.addEventListener('input', () => {
            localStorage.setItem(WHY_KEY, whyField.value);
        });
    }
})();
