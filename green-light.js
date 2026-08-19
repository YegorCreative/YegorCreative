(function () {
  'use strict';

  const startScreen = document.getElementById('greenStart');
  const playScreen = document.getElementById('greenPlay');
  const endScreen = document.getElementById('greenEnd');
  const startBtn = document.getElementById('greenStartBtn');
  const againBtn = document.getElementById('greenAgain');
  const pad = document.getElementById('greenPad');
  const bestEl = document.getElementById('greenBest');
  const liveEl = document.getElementById('greenLive');
  const endTitle = document.getElementById('greenEndTitle');
  const endStats = document.getElementById('greenEndStats');

  if (!startScreen || !playScreen || !pad) return;

  const BEST_KEY = 'yc-green-best';
  let state = 'idle';
  let goAt = 0;
  let timer = 0;

  function show(el) {
    [startScreen, playScreen, endScreen].forEach((screen) => {
      if (!screen) return;
      screen.hidden = screen !== el;
    });
  }

  function say(text) {
    if (liveEl) liveEl.textContent = text;
  }

  function formatMs(ms) {
    return `${ms} ms`;
  }

  function loadBest() {
    const raw = window.localStorage.getItem(BEST_KEY);
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) {
      bestEl.textContent = formatMs(n);
      return n;
    }
    bestEl.textContent = '—';
    return null;
  }

  function saveBest(ms) {
    const current = loadBest();
    if (current === null || ms < current) {
      window.localStorage.setItem(BEST_KEY, String(ms));
      bestEl.textContent = formatMs(ms);
    } else {
      bestEl.textContent = formatMs(current);
    }
  }

  function arm() {
    window.clearTimeout(timer);
    state = 'wait';
    pad.className = 'green-pad is-wait';
    pad.textContent = 'Wait';
    say('Wait for green. Do not tap yet.');
    const delay = 1100 + Math.floor(Math.random() * 2600);
    timer = window.setTimeout(() => {
      state = 'go';
      goAt = performance.now();
      pad.className = 'green-pad is-go';
      pad.textContent = 'Tap!';
      say('Green. Tap now.');
    }, delay);
  }

  function startGame() {
    loadBest();
    show(playScreen);
    arm();
  }

  function finish(kind, ms) {
    window.clearTimeout(timer);
    state = 'idle';
    if (kind === 'early') {
      endTitle.textContent = 'Too soon.';
      endStats.textContent = 'Wait for green next time.';
    } else {
      saveBest(ms);
      endTitle.textContent = formatMs(ms);
      endStats.textContent = 'That’s your reaction time.';
    }
    show(endScreen);
  }

  pad.addEventListener('click', () => {
    if (state === 'wait') {
      finish('early', 0);
      return;
    }
    if (state === 'go') {
      finish('ok', Math.max(1, Math.round(performance.now() - goAt)));
    }
  });

  startBtn.addEventListener('click', startGame);
  if (againBtn) againBtn.addEventListener('click', startGame);

  loadBest();
})();
