/* ===================================
   BACK TO TOP BUTTON FUNCTIONALITY
   =================================== */

(function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTopBtn');
  
  if (!backToTopBtn) {
    return;
  }

  // Show button after scrolling 500px
  const handleScroll = () => {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add('is-visible');
    } else {
      backToTopBtn.classList.remove('is-visible');
    }
  };

  // Smooth scroll to top with prefers-reduced-motion support
  const handleClick = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  };

  window.addEventListener('scroll', handleScroll);
  backToTopBtn.addEventListener('click', handleClick);
})();

/* ===================================
   BURGER MENU FUNCTIONALITY
   =================================== */

(function initBurgerMenu() {
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');

  if (!navToggle || !primaryNav) {
    return;
  }

  // Helper function to get all focusable elements
  const getFocusableElements = (container) => {
    return Array.from(container.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ));
  };

  // Toggle menu open/close
  const toggleMenu = () => {
    const isOpen = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    
    if (isOpen) {
      navToggle.setAttribute('aria-label', 'Close menu');
      // Prevent background scroll
      document.body.style.overflow = 'hidden';
      // Move focus to first link in nav
      const firstLink = primaryNav.querySelector('a');
      if (firstLink) {
        firstLink.focus();
      }
    } else {
      navToggle.setAttribute('aria-label', 'Open menu');
      // Restore background scroll
      document.body.style.overflow = '';
      // Return focus to burger button
      navToggle.focus();
    }
  };

  // Close menu when clicking a link
  const closeOnLinkClick = (e) => {
    if (e.target.tagName === 'A') {
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    }
  };

  // Close menu on ESC key
  const handleKeyPress = (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
      navToggle.focus();
    }
  };

  // Close menu when clicking outside
  const handleClickOutside = (e) => {
    const isOpen = document.body.classList.contains('nav-open');
    if (isOpen && !navToggle.contains(e.target) && !primaryNav.contains(e.target)) {
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    }
  };

  // Handle Tab key for focus trapping when menu is open
  const handleTabKey = (e) => {
    const isOpen = document.body.classList.contains('nav-open');
    if (!isOpen) {
      return;
    }

    const focusableElements = getFocusableElements(primaryNav);
    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (e.shiftKey) {
      // Shift + Tab
      if (activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  // Event listeners
  navToggle.addEventListener('click', toggleMenu);
  primaryNav.addEventListener('click', closeOnLinkClick);
  document.addEventListener('keydown', (e) => {
    handleKeyPress(e);
    if (e.key === 'Tab') {
      handleTabKey(e);
    }
  });
  document.addEventListener('click', handleClickOutside);
})();

/* ===================================
   FASTING TRACKER EXPORT/IMPORT
   =================================== */

/**
 * Export/Import System for Cross-Device Progress Sync
 * Trust: Data remains 100% local; user controls export/import
 * A11y: Status messages announced via aria-live regions
 * Logic: Export to JSON, import with validation
 */
(function initTrackerSync() {
  const exportBtn = document.getElementById('exportProgressBtn');
  const importInput = document.getElementById('importProgressFile');
  const syncStatus = document.getElementById('syncStatus');

  // Exit if not on fasting page
  if (!exportBtn) {
    return;
  }

  // Export handler
  exportBtn.addEventListener('click', () => {
    try {
      // Gather all tracker data from localStorage
      const progress = JSON.parse(localStorage.getItem('fasting40_progress') || '[]');
      const milestoneDates = JSON.parse(localStorage.getItem('fasting40_milestoneDates') || '{}');
      const shownMilestones = JSON.parse(localStorage.getItem('fasting40_shownMilestones') || '[]');

      // Build export object with version for future compatibility
      const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        progress: progress,
        milestoneDates: milestoneDates,
        shownMilestones: shownMilestones
      };

      // Convert to JSON and download
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fasting-progress-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // A11y: Announce success
      showSyncStatus('✓ Progress exported successfully.', 'success');
    } catch (error) {
      showSyncStatus('Export failed: ' + error.message, 'error');
    }
  });

  // Import handler
  importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importData = JSON.parse(event.target.result);

        // Validate structure
        if (!importData.version || !Array.isArray(importData.progress)) {
          throw new Error('Invalid file format');
        }

        // Validate array lengths
        if (importData.progress.length !== 40) {
          throw new Error('Progress array must contain exactly 40 days');
        }

        // Import data to localStorage
        localStorage.setItem('fasting40_progress', JSON.stringify(importData.progress));
        localStorage.setItem('fasting40_milestoneDates', JSON.stringify(importData.milestoneDates || {}));
        localStorage.setItem('fasting40_shownMilestones', JSON.stringify(importData.shownMilestones || []));

        // A11y: Announce success and reload
        showSyncStatus('✓ Progress imported successfully. Refreshing...', 'success');

        // Reload page to display imported data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        showSyncStatus('Import failed: ' + error.message, 'error');
        // Reset file input
        importInput.value = '';
      }
    };

    reader.onerror = () => {
      showSyncStatus('Failed to read file.', 'error');
      importInput.value = '';
    };

    reader.readAsText(file);
  });

  /**
   * showSyncStatus - Display sync operation result
   * A11y: aria-live region announces the message to screen readers
   */
  function showSyncStatus(message, type) {
    syncStatus.textContent = message;
    syncStatus.className = `sync-status status-${type}`;
  }
})();
