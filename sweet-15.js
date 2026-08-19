/* Sweet 15 — short match-3, 15 levels, no libraries. */
(function () {
  'use strict';

  const root = document.querySelector('body.game-sweet');
  if (!root) return;

  const pre = document.getElementById('sweetPre');
  const levelsScreen = document.getElementById('sweetLevels');
  const playScreen = document.getElementById('sweetPlay');
  const startBtn = document.getElementById('sweetStartBtn');
  const continueBtn = document.getElementById('sweetContinueBtn');
  const backStoryBtn = document.getElementById('sweetBackStory');
  const levelGrid = document.getElementById('sweetLevelGrid');
  const boardEl = document.getElementById('sweetBoard');
  const levelEl = document.getElementById('sweetLevel');
  const movesEl = document.getElementById('sweetMoves');
  const scoreEl = document.getElementById('sweetScore');
  const targetEl = document.getElementById('sweetTarget');
  const fillEl = document.getElementById('sweetFill');
  const liveEl = document.getElementById('sweetLive');
  const hintEl = document.getElementById('sweetHint');
  const modeHud = document.getElementById('sweetModeHud');
  const modeNote = document.getElementById('sweetModeNote');
  const restartBtn = document.getElementById('sweetRestart');
  const levelsBtn = document.getElementById('sweetLevelsBtn');
  const overlay = document.getElementById('sweetOverlay');
  const overlayEye = document.getElementById('sweetOverlayEyebrow');
  const overlayTitle = document.getElementById('sweetOverlayTitle');
  const overlayText = document.getElementById('sweetOverlayText');
  const overlayPrimary = document.getElementById('sweetOverlayPrimary');
  const overlaySecondary = document.getElementById('sweetOverlaySecondary');

  if (!pre || !playScreen || !boardEl || !startBtn) return;

  const ROWS = 6;
  const COLS = 6;
  const STORE_KEY = 'yc-sweet15-unlocked';
  const MODE_KEY = 'yc-sweet15-mode';
  const NAMES = ['Cherry', 'Lemon', 'Mint', 'Grape', 'Blue', 'Peach'];
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LEVELS = [
    { target: 500, moves: 20, colors: 4 },
    { target: 750, moves: 20, colors: 4 },
    { target: 1000, moves: 19, colors: 4 },
    { target: 1400, moves: 18, colors: 4 },
    { target: 1800, moves: 18, colors: 5 },
    { target: 2200, moves: 17, colors: 5 },
    { target: 2600, moves: 17, colors: 5 },
    { target: 3100, moves: 16, colors: 5 },
    { target: 3600, moves: 16, colors: 5 },
    { target: 4200, moves: 15, colors: 5 },
    { target: 4800, moves: 15, colors: 6 },
    { target: 5400, moves: 14, colors: 6 },
    { target: 6200, moves: 14, colors: 6 },
    { target: 7000, moves: 13, colors: 6 },
    { target: 8000, moves: 12, colors: 6 }
  ];

  const MODES = {
    easy: {
      label: 'Easy',
      moveBonus: 6,
      targetMul: 0.7,
      colorShift: -1,
      note: 'Easy — extra moves, lower scores. Specials still unlock at level 4.'
    },
    normal: {
      label: 'Normal',
      moveBonus: 0,
      targetMul: 1,
      colorShift: 0,
      note: 'Normal — regular targets and moves. Specials from level 4.'
    },
    hard: {
      label: 'Hard',
      moveBonus: -4,
      targetMul: 1.35,
      colorShift: 1,
      note: 'Hard — fewer moves, bigger scores, more colors sooner.'
    }
  };

  let grid = [];
  let levelIndex = 0;
  let moves = 0;
  let score = 0;
  let selected = null;
  let locked = false;
  let overlayMode = null;
  let audioCtx = null;
  let lastSwap = null;
  let difficulty = loadMode();

  function say(text) {
    if (!liveEl) return;
    liveEl.textContent = '';
    window.setTimeout(() => { liveEl.textContent = text; }, 20);
  }

  function loadUnlocked() {
    try {
      const n = Number(window.localStorage.getItem(STORE_KEY));
      if (Number.isFinite(n)) return Math.min(16, Math.max(1, Math.floor(n)));
    } catch {
      // private mode
    }
    return 1;
  }

  function saveUnlocked(levelNum) {
    try {
      const current = loadUnlocked();
      if (levelNum > current) {
        window.localStorage.setItem(STORE_KEY, String(levelNum));
      }
    } catch {
      // ignore
    }
  }

  function loadMode() {
    try {
      const value = String(window.localStorage.getItem(MODE_KEY) || 'normal');
      if (MODES[value]) return value;
    } catch {
      // ignore
    }
    return 'normal';
  }

  function saveMode(value) {
    difficulty = MODES[value] ? value : 'normal';
    try {
      window.localStorage.setItem(MODE_KEY, difficulty);
    } catch {
      // ignore
    }
  }

  function getAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function tone(ctx, freq, start, dur, gainVal) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainVal, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  function playPop(big) {
    try {
      const ctx = getAudio();
      if (!ctx) return;
      const t = ctx.currentTime;
      if (big) {
        tone(ctx, 988, t, 0.1, 0.07);
        tone(ctx, 1480, t + 0.06, 0.14, 0.07);
      } else {
        tone(ctx, 880, t, 0.08, 0.05);
        tone(ctx, 1320, t + 0.05, 0.1, 0.05);
      }
    } catch {
      // optional
    }
  }

  function playWin() {
    try {
      const ctx = getAudio();
      if (!ctx) return;
      const t = ctx.currentTime;
      tone(ctx, 659, t, 0.1, 0.06);
      tone(ctx, 784, t + 0.08, 0.1, 0.06);
      tone(ctx, 988, t + 0.16, 0.12, 0.07);
      tone(ctx, 1319, t + 0.28, 0.22, 0.08);
    } catch {
      // optional
    }
  }

  function makeCell(color, special) {
    return { c: color, s: special || null };
  }

  function readCell(source, r, c) {
    const value = source[r][c];
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return makeCell(value, null);
    return value;
  }

  function cellColor(cell) {
    if (cell === null || cell === undefined) return null;
    return typeof cell === 'number' ? cell : cell.c;
  }

  function cellSpecial(cell) {
    if (!cell || typeof cell === 'number') return null;
    return cell.s || null;
  }

  function sameColor(a, b) {
    const ca = cellColor(a);
    const cb = cellColor(b);
    return ca !== null && cb !== null && ca === cb;
  }

  function inBounds(r, c) {
    return r >= 0 && r < ROWS && c >= 0 && c < COLS;
  }

  function isAdjacent(a, b) {
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
  }

  function keyOf(r, c) {
    return r + ',' + c;
  }

  function parseKey(key) {
    const parts = key.split(',');
    return { r: Number(parts[0]), c: Number(parts[1]) };
  }

  function findRuns(source) {
    const runs = [];

    for (let r = 0; r < ROWS; r += 1) {
      let run = 1;
      for (let c = 1; c <= COLS; c += 1) {
        const same = c < COLS && sameColor(source[r][c], source[r][c - 1]);
        if (same) {
          run += 1;
        } else {
          if (run >= 3) runs.push({ orient: 'row', r: r, c: c - run, len: run, color: cellColor(source[r][c - 1]) });
          run = 1;
        }
      }
    }

    for (let c = 0; c < COLS; c += 1) {
      let run = 1;
      for (let r = 1; r <= ROWS; r += 1) {
        const same = r < ROWS && sameColor(source[r][c], source[r - 1][c]);
        if (same) {
          run += 1;
        } else {
          if (run >= 3) runs.push({ orient: 'col', r: r - run, c: c, len: run, color: cellColor(source[r - 1][c]) });
          run = 1;
        }
      }
    }

    return runs;
  }

  function runContains(run, r, c) {
    if (run.orient === 'row') return r === run.r && c >= run.c && c < run.c + run.len;
    return c === run.c && r >= run.r && r < run.r + run.len;
  }

  function addSpecialBlast(source, marked, r, c) {
    const cell = readCell(source, r, c);
    if (!cell || !cell.s) return;
    if (cell.s === 'row') {
      for (let x = 0; x < COLS; x += 1) marked.add(keyOf(r, x));
    } else if (cell.s === 'col') {
      for (let y = 0; y < ROWS; y += 1) marked.add(keyOf(y, c));
    } else if (cell.s === 'bomb') {
      const color = cell.c;
      for (let y = 0; y < ROWS; y += 1) {
        for (let x = 0; x < COLS; x += 1) {
          if (cellColor(source[y][x]) === color) marked.add(keyOf(y, x));
        }
      }
    }
  }

  function collectClear(source, specialsOn) {
    const runs = findRuns(source);
    const marked = new Set();
    runs.forEach((run) => {
      for (let i = 0; i < run.len; i += 1) {
        if (run.orient === 'row') marked.add(keyOf(run.r, run.c + i));
        else marked.add(keyOf(run.r + i, run.c));
      }
    });

    if (specialsOn && marked.size) {
      let grew = true;
      while (grew) {
        const before = marked.size;
        Array.from(marked).forEach((key) => {
          const pos = parseKey(key);
          addSpecialBlast(source, marked, pos.r, pos.c);
        });
        grew = marked.size > before;
      }
    }

    let spawn = null;
    if (specialsOn && runs.length) {
      const ranked = runs.slice().sort((a, b) => b.len - a.len);
      let chosen = ranked[0];
      if (lastSwap) {
        const hit = ranked.find((run) => run.len >= 4 && runContains(run, lastSwap.r, lastSwap.c));
        if (hit) chosen = hit;
      }
      if (chosen && chosen.len >= 4) {
        let sr = chosen.r;
        let sc = chosen.c;
        if (lastSwap && runContains(chosen, lastSwap.r, lastSwap.c)) {
          sr = lastSwap.r;
          sc = lastSwap.c;
        } else if (chosen.orient === 'row') {
          sc = chosen.c + Math.floor((chosen.len - 1) / 2);
        } else {
          sr = chosen.r + Math.floor((chosen.len - 1) / 2);
        }
        spawn = {
          r: sr,
          c: sc,
          color: chosen.color,
          s: chosen.len >= 5 ? 'bomb' : (chosen.orient === 'row' ? 'row' : 'col')
        };
      }
    }

    return { marked: marked, spawn: spawn, runs: runs };
  }

  function pickColor(source, r, c, colorCount) {
    const banned = [];
    if (c >= 2 && sameColor(source[r][c - 1], source[r][c - 2])) banned.push(cellColor(source[r][c - 1]));
    if (r >= 2 && sameColor(source[r - 1][c], source[r - 2][c])) banned.push(cellColor(source[r - 1][c]));
    let color = Math.floor(Math.random() * colorCount);
    let guard = 0;
    while (banned.indexOf(color) !== -1 && guard < 12) {
      color = Math.floor(Math.random() * colorCount);
      guard += 1;
    }
    return color;
  }

  function swapCells(source, a, b) {
    const tmp = source[a.r][a.c];
    source[a.r][a.c] = source[b.r][b.c];
    source[b.r][b.c] = tmp;
  }

  function hasMove(source) {
    const dirs = [{ r: 0, c: 1 }, { r: 1, c: 0 }];
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if (cellSpecial(source[r][c]) === 'bomb') return true;
        for (let d = 0; d < dirs.length; d += 1) {
          const nr = r + dirs[d].r;
          const nc = c + dirs[d].c;
          if (!inBounds(nr, nc)) continue;
          const next = { r: nr, c: nc };
          const here = { r: r, c: c };
          swapCells(source, here, next);
          const hit = findRuns(source).length > 0;
          swapCells(source, here, next);
          if (hit) return true;
        }
      }
    }
    return false;
  }

  function makeGrid(colorCount) {
    let next = [];
    for (let attempt = 0; attempt < 24; attempt += 1) {
      next = [];
      for (let r = 0; r < ROWS; r += 1) {
        next[r] = [];
        for (let c = 0; c < COLS; c += 1) {
          next[r][c] = makeCell(pickColor(next, r, c, colorCount), null);
        }
      }
      if (findRuns(next).length === 0 && hasMove(next)) return next;
    }
    return next;
  }

  function collapse(source, colorCount) {
    for (let c = 0; c < COLS; c += 1) {
      const stack = [];
      for (let r = 0; r < ROWS; r += 1) {
        if (source[r][c] !== null) stack.push(source[r][c]);
      }
      const missing = ROWS - stack.length;
      const filled = [];
      for (let i = 0; i < missing; i += 1) {
        filled.push(makeCell(Math.floor(Math.random() * colorCount), null));
      }
      const col = filled.concat(stack);
      for (let r = 0; r < ROWS; r += 1) source[r][c] = col[r];
    }
  }

  function currentLevel() {
    const base = LEVELS[levelIndex] || LEVELS[0];
    const mode = MODES[difficulty] || MODES.normal;
    let colors = base.colors + mode.colorShift;
    colors = Math.max(4, Math.min(6, colors));
    return {
      target: Math.max(250, Math.round((base.target * mode.targetMul) / 50) * 50),
      moves: Math.max(8, base.moves + mode.moveBonus),
      colors: colors,
      specials: levelIndex >= 3
    };
  }

  function updateHud() {
    const spec = currentLevel();
    if (levelEl) levelEl.textContent = (levelIndex + 1) + ' / 15';
    if (movesEl) movesEl.textContent = String(moves);
    if (scoreEl) scoreEl.textContent = String(score);
    if (targetEl) targetEl.textContent = String(spec.target);
    if (modeHud) modeHud.textContent = (MODES[difficulty] || MODES.normal).label;
    if (fillEl) {
      const pct = Math.max(0, Math.min(100, Math.round((score / spec.target) * 100)));
      fillEl.style.width = pct + '%';
    }
    if (hintEl) {
      hintEl.textContent = spec.specials
        ? 'Match 4 to blow a row or column. Match 5 — or swap a star — to wipe a color.'
        : 'Swap two neighbors. Make three in a line. Specials unlock at level 4.';
    }
  }

  function hideOverlay() {
    if (overlay) overlay.hidden = true;
    overlayMode = null;
  }

  function showOverlay(mode, title, text, primary, secondary) {
    overlayMode = mode;
    if (overlayEye) overlayEye.textContent = mode === 'win-all' ? 'All 15' : mode === 'win' ? 'Level clear' : 'Out of moves';
    if (overlayTitle) overlayTitle.textContent = title;
    if (overlayText) overlayText.textContent = text;
    if (overlayPrimary) overlayPrimary.textContent = primary;
    if (overlaySecondary) {
      overlaySecondary.textContent = secondary;
      overlaySecondary.hidden = !secondary;
    }
    if (overlay) overlay.hidden = false;
    if (overlayPrimary) overlayPrimary.focus();
  }

  function specialLabel(special) {
    if (special === 'row') return 'row blast';
    if (special === 'col') return 'column blast';
    if (special === 'bomb') return 'color blast';
    return '';
  }

  function renderBoard() {
    boardEl.textContent = '';
    boardEl.style.setProperty('--sweet-cols', String(COLS));
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const cell = readCell(grid, r, c);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'candy candy--' + (cell ? cell.c : 0);
        if (cell && cell.s) btn.classList.add('is-' + cell.s);
        btn.dataset.r = String(r);
        btn.dataset.c = String(c);
        btn.setAttribute('role', 'gridcell');
        const extra = cell && cell.s ? ', ' + specialLabel(cell.s) : '';
        btn.setAttribute('aria-label', (cell ? NAMES[cell.c] : 'Empty') + extra + ', row ' + (r + 1) + ', column ' + (c + 1));
        if (selected && selected.r === r && selected.c === c) {
          btn.classList.add('is-selected');
        }
        btn.addEventListener('click', onTileClick);
        boardEl.appendChild(btn);
      }
    }
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, reduceMotion ? 0 : ms));
  }

  function scoreClear(result) {
    let points = result.marked.size * 80;
    result.runs.forEach((run) => {
      if (run.len === 4) points += 250;
      if (run.len >= 5) points += 600;
    });
    if (result.spawn) points += result.spawn.s === 'bomb' ? 400 : 200;
    return points;
  }

  async function resolveBoard() {
    let combo = 0;
    const spec = currentLevel();
    while (true) {
      const result = collectClear(grid, spec.specials);
      if (!result.marked.size) break;
      combo += 1;
      score += scoreClear(result) * combo;
      playPop(Boolean(result.spawn) || result.marked.size >= 6);
      result.marked.forEach((key) => {
        const pos = parseKey(key);
        const tile = boardEl.querySelector('[data-r="' + pos.r + '"][data-c="' + pos.c + '"]');
        if (tile) tile.classList.add('is-pop');
        grid[pos.r][pos.c] = null;
      });
      if (result.spawn) {
        grid[result.spawn.r][result.spawn.c] = makeCell(result.spawn.color, result.spawn.s);
      }
      updateHud();
      await wait(180);
      collapse(grid, spec.colors);
      renderBoard();
      await wait(90);
    }

    if (!hasMove(grid)) {
      grid = makeGrid(spec.colors);
      renderBoard();
      say('No moves left. Board shuffled.');
    }
  }

  function checkEnd() {
    const spec = currentLevel();
    if (score >= spec.target) {
      locked = true;
      const nextNum = levelIndex + 2;
      saveUnlocked(Math.min(16, nextNum));
      playWin();
      const leftover = 15 - (levelIndex + 1);
      if (levelIndex >= LEVELS.length - 1) {
        say('You finished all 15 levels.');
        showOverlay(
          'win-all',
          'That’s all 15.',
          score + ' points on ' + spec.moves + ' max moves. The sweets can rest now.',
          'Play level 1 again',
          'Level select'
        );
      } else {
        say('Level ' + (levelIndex + 1) + ' clear.');
        const unlockNote = leftover === 12 ? ' Row blows and color wipes unlock next.' : '';
        showOverlay(
          'win',
          'Level ' + (levelIndex + 1) + ' done.',
          score + ' points.' + unlockNote + ' ' + leftover + ' left after this.',
          'Next level',
          'Replay'
        );
      }
      return true;
    }

    if (moves <= 0) {
      locked = true;
      say('Out of moves.');
      showOverlay(
        'fail',
        'So close.',
        'Score ' + score + ' / ' + spec.target + '. Same level, fresh board.',
        'Try again',
        'Level select'
      );
      return true;
    }

    return false;
  }

  function bombSwapClear(a, b) {
    const marked = new Set();
    const sa = cellSpecial(grid[a.r][a.c]);
    const sb = cellSpecial(grid[b.r][b.c]);
    if (sa === 'bomb' && sb === 'bomb') {
      for (let r = 0; r < ROWS; r += 1) {
        for (let c = 0; c < COLS; c += 1) marked.add(keyOf(r, c));
      }
      return marked;
    }
    const bomb = sa === 'bomb' ? a : b;
    const other = bomb === a ? b : a;
    const color = cellColor(grid[other.r][other.c]);
    marked.add(keyOf(bomb.r, bomb.c));
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if (cellColor(grid[r][c]) === color) marked.add(keyOf(r, c));
      }
    }
    return marked;
  }

  async function trySwap(a, b) {
    locked = true;
    lastSwap = b;
    const spec = currentLevel();
    const bombPlay = spec.specials && (cellSpecial(grid[a.r][a.c]) === 'bomb' || cellSpecial(grid[b.r][b.c]) === 'bomb');

    swapCells(grid, a, b);
    renderBoard();

    if (bombPlay) {
      const marked = bombSwapClear(a, b);
      moves = Math.max(0, moves - 1);
      score += marked.size * 90;
      playPop(true);
      marked.forEach((key) => {
        const pos = parseKey(key);
        const tile = boardEl.querySelector('[data-r="' + pos.r + '"][data-c="' + pos.c + '"]');
        if (tile) tile.classList.add('is-pop');
        grid[pos.r][pos.c] = null;
      });
      updateHud();
      await wait(180);
      collapse(grid, spec.colors);
      renderBoard();
      await resolveBoard();
      if (!checkEnd()) {
        locked = false;
        say('Color wipe. ' + moves + ' moves left.');
      }
      return;
    }

    const matches = collectClear(grid, spec.specials);
    if (!matches.marked.size) {
      await wait(160);
      swapCells(grid, a, b);
      renderBoard();
      locked = false;
      say('That swap doesn’t make three.');
      return;
    }

    moves = Math.max(0, moves - 1);
    updateHud();
    await resolveBoard();
    if (!checkEnd()) {
      locked = false;
      say('Nice. ' + moves + ' moves left.');
    }
  }

  function onTileClick(event) {
    if (locked || !overlay.hidden) return;
    getAudio();
    const btn = event.currentTarget;
    const cell = { r: Number(btn.dataset.r), c: Number(btn.dataset.c) };

    if (!selected) {
      selected = cell;
      renderBoard();
      return;
    }

    if (selected.r === cell.r && selected.c === cell.c) {
      selected = null;
      renderBoard();
      return;
    }

    if (!isAdjacent(selected, cell)) {
      selected = cell;
      renderBoard();
      return;
    }

    const from = selected;
    selected = null;
    trySwap(from, cell);
  }

  function startLevel(index) {
    levelIndex = Math.max(0, Math.min(LEVELS.length - 1, index));
    const spec = currentLevel();
    moves = spec.moves;
    score = 0;
    selected = null;
    locked = false;
    lastSwap = null;
    hideOverlay();
    grid = makeGrid(spec.colors);
    renderBoard();
    updateHud();
    say('Level ' + (levelIndex + 1) + ' of 15. Reach ' + spec.target + ' points on ' + spec.moves + ' moves.');
  }

  function showOnly(target) {
    pre.hidden = target !== pre;
    if (levelsScreen) levelsScreen.hidden = target !== levelsScreen;
    playScreen.hidden = target !== playScreen;
    hideOverlay();
  }

  function syncModeButtons() {
    document.querySelectorAll('.sweet-mode').forEach((btn) => {
      btn.classList.toggle('is-on', btn.getAttribute('data-mode') === difficulty);
    });
    if (modeNote) modeNote.textContent = (MODES[difficulty] || MODES.normal).note;
  }

  function renderLevelSelect() {
    if (!levelGrid) return;
    const unlocked = loadUnlocked();
    levelGrid.textContent = '';
    for (let i = 0; i < 15; i += 1) {
      const num = i + 1;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sweet-level';
      btn.setAttribute('role', 'listitem');

      const label = document.createElement('span');
      label.className = 'sweet-level__num';
      label.textContent = String(num);

      const mark = document.createElement('span');
      mark.className = 'sweet-level__mark';
      mark.setAttribute('aria-hidden', 'true');

      if (num > unlocked) {
        btn.disabled = true;
        btn.classList.add('is-locked');
        mark.textContent = '🔒';
        btn.setAttribute('aria-label', 'Level ' + num + ', locked');
      } else if (num < unlocked) {
        btn.classList.add('is-cleared');
        mark.textContent = '✓';
        btn.setAttribute('aria-label', 'Level ' + num + ', cleared. Play again');
      } else {
        btn.classList.add('is-current');
        mark.textContent = '▶';
        btn.setAttribute('aria-label', 'Level ' + num + ', play next');
      }

      if (!btn.disabled) {
        btn.addEventListener('click', () => {
          getAudio();
          showOnly(playScreen);
          startLevel(i);
          playScreen.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
        });
      }

      btn.appendChild(label);
      btn.appendChild(mark);
      levelGrid.appendChild(btn);
    }
    if (continueBtn) {
      continueBtn.textContent = unlocked >= 16 ? 'Play any level' : 'Continue level ' + Math.min(15, unlocked);
    }
    syncModeButtons();
  }

  function openLevels() {
    renderLevelSelect();
    showOnly(levelsScreen);
  }

  document.querySelectorAll('.sweet-mode').forEach((btn) => {
    btn.addEventListener('click', () => {
      getAudio();
      saveMode(btn.getAttribute('data-mode'));
      syncModeButtons();
    });
  });

  startBtn.addEventListener('click', () => {
    getAudio();
    openLevels();
  });

  if (backStoryBtn) {
    backStoryBtn.addEventListener('click', () => showOnly(pre));
  }

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      getAudio();
      const unlocked = loadUnlocked();
      showOnly(playScreen);
      startLevel(Math.min(14, unlocked - 1));
      playScreen.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      getAudio();
      startLevel(levelIndex);
    });
  }

  if (levelsBtn) {
    levelsBtn.addEventListener('click', () => {
      getAudio();
      openLevels();
    });
  }

  if (overlayPrimary) {
    overlayPrimary.addEventListener('click', () => {
      getAudio();
      if (overlayMode === 'win' && levelIndex < 14) {
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

  if (overlaySecondary) {
    overlaySecondary.addEventListener('click', () => {
      getAudio();
      if (overlayMode === 'win') {
        startLevel(levelIndex);
        return;
      }
      openLevels();
    });
  }

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('play') === '1') {
      showOnly(playScreen);
      startLevel(Number(params.get('level') || 0));
    } else if (params.get('play') === 'levels') {
      openLevels();
    } else {
      showOnly(pre);
    }
  } catch {
    showOnly(pre);
  }
})();
