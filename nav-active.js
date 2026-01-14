(function initNavActive() {
  'use strict';

  const getCurrentFile = () => {
    const path = window.location.pathname || '';
    const lastSegment = path.split('/').filter(Boolean).pop() || '';

    if (!lastSegment) {
      return 'index.html';
    }

    // Handle common hosting patterns like "/" -> index.html
    if (!lastSegment.includes('.')) {
      return 'index.html';
    }

    return lastSegment;
  };

  const getHrefFile = (href) => {
    if (!href) {
      return null;
    }

    // Ignore hash-only links (in-page sections)
    if (href.startsWith('#')) {
      return null;
    }

    // Ignore external links
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)) {
      return null;
    }

    // Only apply to actual html pages
    if (!href.includes('.html')) {
      return null;
    }

    try {
      const url = new URL(href, window.location.href);
      const file = url.pathname.split('/').filter(Boolean).pop() || '';
      return file || null;
    } catch {
      return null;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const primaryNav = document.getElementById('primaryNav');
    if (!primaryNav) {
      return;
    }

    const links = Array.from(primaryNav.querySelectorAll('a'));
    if (links.length === 0) {
      return;
    }

    const currentFile = getCurrentFile();

    links.forEach((link) => {
      link.classList.remove('is-active');
      if (link.getAttribute('aria-current') === 'page') {
        link.removeAttribute('aria-current');
      }
    });

    const match = links.find((link) => {
      const href = link.getAttribute('href') || '';
      const hrefFile = getHrefFile(href);
      return hrefFile === currentFile;
    });

    if (match) {
      match.classList.add('is-active');
      match.setAttribute('aria-current', 'page');
    }
  });
})();
