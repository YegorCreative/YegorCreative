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
   CODE QUOTE TILT INTERACTION
   =================================== */

(function initCodeQuoteTilt() {
  const codeQuote = document.querySelector('.code-quote');
  
  if (!codeQuote) {
    return;
  }
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check if touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Only enable tilt on non-touch devices with motion enabled
  if (prefersReducedMotion || isTouchDevice) {
    return;
  }
  
  const handleMouseMove = (e) => {
    const rect = codeQuote.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    
    codeQuote.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };
  
  const handleMouseLeave = () => {
    codeQuote.style.transform = '';
  };
  
  codeQuote.addEventListener('mousemove', handleMouseMove);
  codeQuote.addEventListener('mouseleave', handleMouseLeave);
})();

/* ===================================
   YC CODE BANNER
   =================================== */

(function initYcCodeBanner() {
  const banners = document.querySelectorAll('.yc-codebanner');

  if (!banners || banners.length === 0) {
    return;
  }

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return;
  }

  banners.forEach((banner) => {
    const lines = Array.from(banner.querySelectorAll('.yc-codebanner__line'));
    if (lines.length === 0) {
      return;
    }

    banner.setAttribute('data-yc-anim', 'true');

    let cursor = banner.querySelector('.yc-codebanner__cursor');
    if (!cursor) {
      cursor = document.createElement('span');
      cursor.className = 'yc-codebanner__cursor';
      cursor.setAttribute('aria-hidden', 'true');
    }

    lines.forEach((line) => line.classList.remove('is-revealed'));

    let index = 0;

    const revealNext = () => {
      const line = lines[index];
      if (!line) {
        return;
      }

      line.classList.add('is-revealed');

      const code = line.querySelector('.yc-codebanner__code');
      if (code) {
        code.appendChild(cursor);
      }

      index += 1;
      if (index >= lines.length) {
        return;
      }

      const delay = 220 + Math.floor(Math.random() * 101);
      window.setTimeout(revealNext, delay);
    };

    window.setTimeout(revealNext, 220);
  });
})();
