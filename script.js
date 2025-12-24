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
