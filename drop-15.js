/* Drop 15 — 15-level tetromino stacker. */
(function () {
  'use strict';

  const pre = document.getElementById('dropPre');
  const levelsScreen = document.getElementById('dropLevels');
  const playScreen = document.getElementById('dropPlay');
  const startBtn = document.getElementById('dropStartBtn');
  const continueBtn = document.getElementById('dropContinueBtn');
  const backStoryBtn = document.getElementById('dropBackStory');
  const levelGrid = document.getElementById('dropLevelGrid');
  const wellEl = document.getElementById('dropWell');
  const nextEl = document.getElementById('dropNext');
  const levelHud = document.getElementById('dropLevelHud');
  const linesHud = document.getElementById('dropLinesHud');
  const scoreHud = document.getElementById('dropScoreHud');
  const hintEl = document.getElementById('dropHint');
  const liveEl = document.getElementById('dropLive');
  const retryBtn = document.getElementById('dropRetry');
  const levelsBtn = document.getElementById('dropLevelsBtn');
  const overlay = document.getElementById('dropOverlay');
  const overlayEye = document.getElementById('dropOverlayEye');
  const overlayTitle = document.getElementById('dropOverlayTitle');
  const overlayText = document.getElementById('dropOverlayText');
  const overlayStats = document.getElementById('dropOverlayStats');
  const starsEl = document.getElementById('dropStars');
  const againBtn = document.getElementById('dropAgain');
  const modeNote = document.getElementById('dropModeNote');
  const pad = document.querySelector('.drop-pad');

  if (!pre || !playScreen || !wellEl || !startBtn) return;

  const COLS = 10;
  const ROWS = 20;
  const UNLOCK_KEY = 'yc-drop15-unlocked';
  const MODE_KEY = 'yc-drop15-mode';
  const BEST_KEY = 'yc-drop15-best';
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const COLORS = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
  const TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const COLOR_OF = { I: 0, O: 1, T: 2, S: 3, Z: 4, J: 5, L: 6 };

  const SHAPES = {
    I: [
      [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
      [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]
    ],
    O: [
      [[1, 1], [1, 1]],
      [[1, 1], [1, 1]],
      [[1, 1], [1, 1]],
      [[1, 1], [1, 1]]
    ],
    T: [
      [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
      [[0, 1, 0], [1, 1, 0], [0, 1, 0]]
    ],
    S: [
      [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
      [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
      [[1, 0, 0], [1, 1, 0], [0, 1, 0]]
    ],
    Z: [
      [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
      [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
      [[0, 1, 0], [1, 1, 0], [1, 0, 0]]
    ],
    J: [
      [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
      [[0, 1, 0], [0, 1, 0], [1, 1, 0]]
    ],
    L: [
      [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
      [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
      [[1, 1, 0], [0, 1, 0], [0, 1, 0]]
    ]
  };

  const LEVELS = [
    { need: 4, ms: 820 },
    { need: 5, ms: 760 },
    { need: 5, ms: 700 },
    { need: 6, ms: 640 },
    { need: 6, ms: 590 },
    { need: 7, ms: 540 },
    { need: 7, ms: 500 },
    { need: 8, ms: 460 },
    { need: 8, ms: 420 },
    { need: 9, ms: 380 },
    { need: 10, ms: 340 },
    { need: 10, ms: 300 },
    { need: 12, ms: 270 },
    { need: 12, ms: 240 },
    { need: 15, ms: 210 }
  ];

  const MODES = {
    easy: { label: 'Easy', msMul: 1.4, lineMul: 0.75, note: 'Easy — slower drops, fewer lines per floor.' },
    normal: { label: 'Normal', msMul: 1, lineMul: 1, note: 'Normal — regular speed and line counts.' },
    hard: { label: 'Hard', msMul: 0.68, lineMul: 1.2, note: 'Hard — faster drops, more lines per floor.' }
  };

  let board = [];
  let bag = [];
  let current = null;
  let nextType = null;
  let levelIndex = 0;
  let linesGot = 0;
  let linesNeed = 4;
  let score = 0;
  let tetrises = 0;
  let gravityMs = 820;
  let tickTimer = 0;
  let lockTimer = 0;
  let running = false;
  let overlayMode = 'fail';
  let difficulty = loadMode();
  let audioCtx = null;
  let cells = [];

  function say(text) {
    if (!liveEl) return;
    liveEl.textContent = '';
    window.setTimeout(() => { liveEl.textContent = text; }, 20);
  }

  function loadUnlocked() {
    try {
      const n = Number(window.localStorage.getItem(UNLOCK_KEY));
      if (Number.isFinite(n)) return Math.min(14, Math.max(0, Math.floor(n)));
    } catch { /* ignore */ }
    return 0;
  }

  function saveUnlocked(index) {
    try {
      if (index > loadUnlocked()) window.localStorage.setItem(UNLOCK_KEY, String(index));
    } catch { /* ignore */ }
  }

  function loadMode() {
    try {
      const m = window.localStorage.getItem(MODE_KEY);
      if (m && MODES[m]) return m;
    } catch { /* ignore */ }
    return 'normal';
  }

  function saveMode(mode) {
    try { window.localStorage.setItem(MODE_KEY, mode); } catch { /* ignore */ }
  }

  function saveBest(n) {
    try {
      const cur = Number(window.localStorage.getItem(BEST_KEY));
      if (!Number.isFinite(cur) || n > cur) window.localStorage.setItem(BEST_KEY, String(n));
    } catch { /* ignore */ }
  }

  function emptyBoard() {
    board = [];
    for (let r = 0; r < ROWS; r += 1) {
      board.push(new Array(COLS).fill(0));
    }
  }

  function refillBag() {
    const next = TYPES.slice();
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = next[i];
      next[i] = next[j];
      next[j] = t;
    }
    bag = bag.concat(next);
  }

  function takeFromBag() {
    if (!bag.length) refillBag();
    return bag.shift();
  }

  function matrix(type, rot) {
    return SHAPES[type][rot];
  }

  function eachCell(type, rot, x, y, fn) {
    const m = matrix(type, rot);
    for (let r = 0; r < m.length; r += 1) {
      for (let c = 0; c < m[r].length; c += 1) {
        if (m[r][c]) fn(x + c, y + r);
      }
    }
  }

  function fits(type, rot, x, y) {
    let ok = true;
    eachCell(type, rot, x, y, (cx, cy) => {
      if (cx < 0 || cx >= COLS || cy >= ROWS) ok = false;
      else if (cy >= 0 && board[cy][cx]) ok = false;
    });
    return ok;
  }

  function spawn() {
    const type = nextType || takeFromBag();
    nextType = takeFromBag();
    const piece = { type: type, rot: 0, x: 3, y: type === 'I' ? -1 : 0 };
    if (type === 'O') piece.x = 4;
    if (!fits(piece.type, piece.rot, piece.x, piece.y)) {
      current = piece;
      topOut();
      return;
    }
    current = piece;
    drawNext();
  }

  function ghostY() {
    if (!current) return 0;
    let y = current.y;
    while (fits(current.type, current.rot, current.x, y + 1)) y += 1;
    return y;
  }

  function tryMove(dx, dy) {
    if (!current || !running) return false;
    const nx = current.x + dx;
    const ny = current.y + dy;
    if (!fits(current.type, current.rot, nx, ny)) return false;
    current.x = nx;
    current.y = ny;
    paint();
    return true;
  }

  function tryRotate() {
    if (!current || !running) return;
    const next = (current.rot + 1) % 4;
    const kicks = [0, -1, 1, -2, 2];
    for (let i = 0; i < kicks.length; i += 1) {
      if (fits(current.type, next, current.x + kicks[i], current.y)) {
        current.rot = next;
        current.x += kicks[i];
        paint();
        playTone(620, 0.05, 0.04);
        return;
      }
    }
  }

  function softDrop() {
    if (!tryMove(0, 1)) lockPiece();
    else {
      score += 1;
      updateHud();
    }
  }

  function hardDrop() {
    if (!current || !running) return;
    const y = ghostY();
    const dist = y - current.y;
    current.y = y;
    score += dist * 2;
    lockPiece();
  }

  function lockPiece() {
    if (!current) return;
    eachCell(current.type, current.rot, current.x, current.y, (cx, cy) => {
      if (cy >= 0 && cy < ROWS && cx >= 0 && cx < COLS) {
        board[cy][cx] = COLOR_OF[current.type] + 1;
      }
    });
    current = null;
    const cleared = sweep();
    if (cleared) {
      const table = [0, 100, 300, 500, 800];
      score += table[cleared] * (levelIndex + 1);
      linesGot += cleared;
      if (cleared === 4) tetrises += 1;
      playClear(cleared);
      say(cleared === 4 ? 'Four lines.' : cleared + (cleared === 1 ? ' line.' : ' lines.'));
    } else {
      playTone(180, 0.06, 0.03, 'square');
    }
    updateHud();
    if (linesGot >= linesNeed) {
      levelClear();
      return;
    }
    spawn();
    paint();
  }

  function sweep() {
    let n = 0;
    for (let r = ROWS - 1; r >= 0; r -= 1) {
      if (board[r].every((v) => v)) {
        board.splice(r, 1);
        board.unshift(new Array(COLS).fill(0));
        n += 1;
        r += 1;
      }
    }
    return n;
  }

  function specFor(index) {
    const base = LEVELS[index] || LEVELS[0];
    const mode = MODES[difficulty];
    return {
      need: Math.max(3, Math.round(base.need * mode.lineMul)),
      ms: Math.max(140, Math.round(base.ms * mode.msMul))
    };
  }

  function startLevel(index) {
    window.clearInterval(tickTimer);
    window.clearTimeout(lockTimer);
    levelIndex = Math.max(0, Math.min(14, index));
    const spec = specFor(levelIndex);
    linesNeed = spec.need;
    gravityMs = spec.ms;
    linesGot = 0;
    tetrises = 0;
    score = 0;
    bag = [];
    nextType = null;
    emptyBoard();
    hideOverlay();
    running = true;
    spawn();
    paint();
    updateHud();
    if (hintEl) {
      hintEl.textContent = 'Clear ' + linesNeed + ' lines on this floor.';
    }
    pre.hidden = true;
    if (levelsScreen) levelsScreen.hidden = true;
    playScreen.hidden = false;
    playScreen.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    armTick();
    say('Floor ' + (levelIndex + 1) + '. Clear ' + linesNeed + ' lines.');
  }

  function armTick() {
    window.clearInterval(tickTimer);
    tickTimer = window.setInterval(() => {
      if (!running) return;
      if (!tryMove(0, 1)) lockPiece();
    }, gravityMs);
  }

  function levelClear() {
    running = false;
    window.clearInterval(tickTimer);
    const last = levelIndex >= 14;
    overlayMode = last ? 'win-all' : 'win';
    saveUnlocked(Math.min(14, levelIndex + 1));
    saveBest(score);
    const rating = last
      ? { stars: 5, title: 'All 15 floors.', grade: 'The well is empty. You can sit down now.' }
      : rateFloor();
    if (overlayEye) overlayEye.textContent = last ? 'All 15 floors' : 'Floor ' + (levelIndex + 1);
    if (overlayTitle) overlayTitle.textContent = last ? 'Stacked for good.' : rating.title;
    if (overlayText) {
      overlayText.textContent = last
        ? rating.grade
        : rating.grade + ' Next: floor ' + (levelIndex + 2) + '.';
    }
    if (overlayStats) overlayStats.textContent = 'Score ' + score + (tetrises ? ' · ' + tetrises + ' fours' : '');
    if (againBtn) againBtn.textContent = last ? 'Play floor 1 again' : 'Next floor';
    renderStars(rating.stars);
    playWin();
    showOverlay();
    say(last ? 'All fifteen floors clear.' : 'Floor clear.');
  }

  function rateFloor() {
    if (tetrises >= 2) return { stars: 5, title: 'Rude.', grade: 'Two fours on one floor. The well is scared.' };
    if (tetrises === 1) return { stars: 4, title: 'Clean four.', grade: 'That’s the whole sport, right there.' };
    if (score >= 1200) return { stars: 4, title: 'Quick hands.', grade: 'You stacked it like you meant it.' };
    if (score >= 700) return { stars: 3, title: 'Solid floor.', grade: 'Lines gone. Tower still standing.' };
    return { stars: 2, title: 'You got there.', grade: 'A little messy. Still a clear.' };
  }

  function topOut() {
    running = false;
    window.clearInterval(tickTimer);
    overlayMode = 'fail';
    if (overlayEye) overlayEye.textContent = 'Topped out';
    if (overlayTitle) overlayTitle.textContent = 'The well is full.';
    if (overlayText) overlayText.textContent = 'Floor ' + (levelIndex + 1) + ' starts over. ' + linesGot + ' of ' + linesNeed + ' lines.';
    if (overlayStats) overlayStats.textContent = 'Score ' + score;
    if (againBtn) againBtn.textContent = 'Retry floor';
    renderStars(0);
    playTone(140, 0.28, 0.07, 'sawtooth');
    showOverlay();
    say('Topped out.');
    paint();
  }

  function renderStars(count) {
    if (!starsEl) return;
    starsEl.textContent = '';
    if (!count) {
      starsEl.hidden = true;
      return;
    }
    starsEl.hidden = false;
    starsEl.setAttribute('aria-label', count + ' out of 5 stars');
    for (let i = 1; i <= 5; i += 1) {
      const star = document.createElement('span');
      star.className = i <= count ? 'is-on' : 'is-off';
      star.setAttribute('aria-hidden', 'true');
      star.textContent = '★';
      starsEl.appendChild(star);
    }
  }

  function showOverlay() {
    if (overlay) overlay.hidden = false;
    if (againBtn) againBtn.focus();
  }

  function hideOverlay() {
    if (overlay) overlay.hidden = true;
  }

  function ensureWell() {
    if (cells.length === ROWS * COLS) return;
    wellEl.textContent = '';
    cells = [];
    for (let i = 0; i < ROWS * COLS; i += 1) {
      const el = document.createElement('span');
      el.className = 'drop-cell';
      wellEl.appendChild(el);
      cells.push(el);
    }
  }

  function cellAt(x, y) {
    if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return null;
    return cells[y * COLS + x];
  }

  function paint() {
    ensureWell();
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const el = cells[r * COLS + c];
        const v = board[r][c];
        el.className = v ? 'drop-cell is-' + COLORS[v - 1] : 'drop-cell';
      }
    }
    if (!current) return;
    const gy = ghostY();
    eachCell(current.type, current.rot, current.x, gy, (cx, cy) => {
      const el = cellAt(cx, cy);
      if (el && !el.className.includes('is-c')) el.classList.add('is-ghost', 'is-' + COLORS[COLOR_OF[current.type]]);
    });
    eachCell(current.type, current.rot, current.x, current.y, (cx, cy) => {
      const el = cellAt(cx, cy);
      if (el) el.className = 'drop-cell is-' + COLORS[COLOR_OF[current.type]] + ' is-live';
    });
  }

  function drawNext() {
    if (!nextEl || !nextType) return;
    nextEl.textContent = '';
    const m = matrix(nextType, 0);
    nextEl.style.gridTemplateColumns = 'repeat(' + m[0].length + ', 1fr)';
    m.forEach((row) => {
      row.forEach((v) => {
        const el = document.createElement('span');
        el.className = v ? 'drop-cell is-' + COLORS[COLOR_OF[nextType]] : 'drop-cell is-empty';
        nextEl.appendChild(el);
      });
    });
  }

  function updateHud() {
    if (levelHud) levelHud.textContent = (levelIndex + 1) + ' / 15';
    if (linesHud) linesHud.textContent = Math.min(linesGot, linesNeed) + ' / ' + linesNeed;
    if (scoreHud) scoreHud.textContent = String(score);
  }

  function getAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function playTone(freq, dur, gainVal, type) {
    try {
      const ctx = getAudio();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainVal, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur + 0.02);
    } catch { /* optional */ }
  }

  function playClear(n) {
    playTone(520 + n * 80, 0.08, 0.05);
    if (n >= 4) playTone(880, 0.14, 0.06);
  }

  function playWin() {
    playTone(659, 0.1, 0.05);
    window.setTimeout(() => playTone(784, 0.1, 0.05), 80);
    window.setTimeout(() => playTone(988, 0.16, 0.06), 160);
  }

  function renderLevelSelect() {
    if (!levelGrid) return;
    const unlocked = loadUnlocked();
    levelGrid.textContent = '';
    LEVELS.forEach((lvl, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'drop-level';
      btn.setAttribute('role', 'listitem');
      const spec = specFor(i);
      btn.innerHTML = '<span class="drop-level__num">' + (i + 1) + '</span><span class="drop-level__mark">' + spec.need + ' lines</span>';
      if (i > unlocked) {
        btn.disabled = true;
        btn.classList.add('is-locked');
      } else {
        if (i < unlocked) btn.classList.add('is-cleared');
        else btn.classList.add('is-current');
        btn.addEventListener('click', () => {
          getAudio();
          startLevel(i);
        });
      }
      levelGrid.appendChild(btn);
    });
    if (continueBtn) continueBtn.textContent = 'Continue floor ' + (Math.min(14, unlocked) + 1);
  }

  function setMode(mode) {
    if (!MODES[mode]) return;
    difficulty = mode;
    saveMode(mode);
    document.querySelectorAll('.drop-mode').forEach((btn) => {
      btn.classList.toggle('is-on', btn.getAttribute('data-mode') === mode);
    });
    if (modeNote) modeNote.textContent = MODES[mode].note;
    renderLevelSelect();
  }

  function openLevels() {
    window.clearInterval(tickTimer);
    running = false;
    hideOverlay();
    renderLevelSelect();
    pre.hidden = true;
    playScreen.hidden = true;
    if (levelsScreen) levelsScreen.hidden = false;
  }

  startBtn.addEventListener('click', () => {
    getAudio();
    openLevels();
  });
  if (backStoryBtn) {
    backStoryBtn.addEventListener('click', () => {
      if (levelsScreen) levelsScreen.hidden = true;
      pre.hidden = false;
    });
  }
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      getAudio();
      startLevel(loadUnlocked());
    });
  }
  if (levelsBtn) levelsBtn.addEventListener('click', openLevels);
  if (retryBtn) retryBtn.addEventListener('click', () => startLevel(levelIndex));
  if (againBtn) {
    againBtn.addEventListener('click', () => {
      if (overlayMode === 'win') {
        startLevel(levelIndex + 1);
        return;
      }
      if (overlayMode === 'win-all') {
        startLevel(0);
        return;
      }
      startLevel(levelIndex);
    });
  }

  document.querySelectorAll('.drop-mode').forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.getAttribute('data-mode')));
  });

  function act(name) {
    getAudio();
    if (name === 'left') tryMove(-1, 0);
    else if (name === 'right') tryMove(1, 0);
    else if (name === 'down') softDrop();
    else if (name === 'rot') tryRotate();
    else if (name === 'hard') hardDrop();
  }

  if (pad) {
    pad.addEventListener('pointerdown', (ev) => {
      const btn = ev.target.closest('[data-act]');
      if (!btn) return;
      ev.preventDefault();
      act(btn.getAttribute('data-act'));
    });
  }

  document.addEventListener('keydown', (ev) => {
    if (playScreen.hidden) return;
    const map = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowDown: 'down',
      ArrowUp: 'rot',
      KeyX: 'rot',
      KeyZ: 'rot',
      Space: 'hard'
    };
    const name = map[ev.code];
    if (!name) return;
    ev.preventDefault();
    act(name);
  });

  let swipeX = 0;
  let swipeY = 0;
  wellEl.addEventListener('pointerdown', (ev) => {
    swipeX = ev.clientX;
    swipeY = ev.clientY;
  });
  wellEl.addEventListener('pointerup', (ev) => {
    const dx = ev.clientX - swipeX;
    const dy = ev.clientY - swipeY;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) {
      act('rot');
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) act(dx > 0 ? 'right' : 'left');
    else if (dy > 40) act(dy > 90 ? 'hard' : 'down');
  });

  setMode(difficulty);
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('play') === '1') startLevel(Number(params.get('level') || 0));
  } catch { /* ignore */ }
})();
