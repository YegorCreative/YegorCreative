/* Client gallery pickup — codes map to iCloud (or other) shared albums. */
(function () {
  'use strict';

  const form = document.getElementById('photoPickupForm');
  const input = document.getElementById('galleryCode');
  const msg = document.getElementById('galleryMsg');
  const go = document.getElementById('galleryGo');
  if (!form || !input || !msg || !go) return;

  function normalize(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, '-');
  }

  function say(text, ok) {
    msg.textContent = text;
    msg.classList.toggle('is-ok', Boolean(ok));
    msg.classList.toggle('is-err', !ok);
  }

  function showLink(url, label) {
    go.hidden = false;
    go.href = url;
    go.textContent = label || 'Open in iCloud';
  }

  function hideLink() {
    go.hidden = true;
    go.removeAttribute('href');
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const code = normalize(input.value);
    hideLink();
    if (!code) {
      say('Enter the code I sent you.');
      input.focus();
      return;
    }

    fetch('galleries.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('missing');
        return res.json();
      })
      .then((data) => {
        const list = (data && data.galleries) || [];
        const hit = list.find((item) => normalize(item.code) === code);
        if (!hit || !hit.url) {
          say('I don’t have that code. Email me at yegor@yegorcreative.com.');
          return;
        }
        say((hit.title ? hit.title + '. ' : '') + 'Your album is ready.');
        showLink(hit.url, hit.label || 'Open in iCloud');
      })
      .catch(() => {
        say('I don’t have that code. Email me at yegor@yegorcreative.com.');
      });
  });

  const params = new URLSearchParams(window.location.search);
  const preset = params.get('g');
  if (preset) {
    input.value = preset;
    form.requestSubmit();
  }
})();
