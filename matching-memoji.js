/* Matching Memoji (scoped)
   Vanilla JS, accessible, responsive, no external libraries.
*/

(function () {
  'use strict';

  const root = document.querySelector('body.game-memoji');
  if (!root) return;

  const board = document.getElementById('memojiBoard');
  const mode = document.getElementById('memojiMode');
  const restartBtn = document.getElementById('memojiRestart');
  const movesEl = document.getElementById('memojiMoves');
  const timeEl = document.getElementById('memojiTime');
  const live = document.getElementById('memojiLive');

  const preGame = document.getElementById('memojiPreGame');
  const startBtn = document.getElementById('memojiStartBtn');
  const modeScreen = document.getElementById('memojiModeScreen');
  const playBtn = document.getElementById('memojiPlayBtn');
  const gameScreen = document.getElementById('memojiGameScreen');
  const endScreen = document.getElementById('memojiEndScreen');
  const endStats = document.getElementById('memojiEndStats');
  const playAgainBtn = document.getElementById('memojiPlayAgain');
  const backStoryBtn = document.getElementById('memojiBackStory');
  const winTitle = document.getElementById('memojiWinTitle');
  const winStars = document.getElementById('memojiWinStars');
  const winGrade = document.getElementById('memojiWinGrade');

  if (!board || !mode || !restartBtn || !movesEl || !timeEl || !live) return;
  if (!preGame || !startBtn || !modeScreen || !playBtn || !gameScreen || !endScreen || !endStats || !playAgainBtn) return;

  const MEMOJI_TOTAL = 38;
  const MEMOJI_PATH = 'Assets/memoji/';
  const MEMOJI_PREFIX = 'memoji';
  const MEMOJI_SUFFIX = '.heic.png';

  function buildMemojiPool() {
    const pool = [];
    for (let i = 1; i <= MEMOJI_TOTAL; i++) {
      const id = `m${i}`;
      const src = `${MEMOJI_PATH}${MEMOJI_PREFIX}${i}${MEMOJI_SUFFIX}`;
      pool.push({ id, src, name: `Memoji ${i}` });
    }
    return pool;
  }

  let currentMemoji = [];

  const COLS = 4;

  const MODE_TO_PAIRS = {
    easy: 8,
    normal: 12,
    hard: 16
  };

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let audioCtx = null;

  function getAudioContext() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) {
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function unlockAudio() {
    getAudioContext();
  }

  function playTone(ctx, freq, start, duration, gainValue) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  function playMatchSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      playTone(ctx, 784, t, 0.11, 0.07);
      playTone(ctx, 1175, t + 0.08, 0.16, 0.08);
    } catch {
      // Audio is optional.
    }
  }

  function playWinSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      playTone(ctx, 659, t, 0.11, 0.07);
      playTone(ctx, 784, t + 0.09, 0.11, 0.07);
      playTone(ctx, 988, t + 0.18, 0.12, 0.08);
      playTone(ctx, 1319, t + 0.3, 0.28, 0.09);
    } catch {
      // Audio is optional.
    }
  }

  function clampNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function updateBoardFit() {
    try {
      const vv = window.visualViewport;
      const viewportHeight = vv ? clampNumber(vv.height, window.innerHeight) : window.innerHeight;

      const headerEl = document.querySelector('header.mainHeading');
      const hudEl = gameScreen.querySelector('.game-hud');
      const headerH = headerEl ? clampNumber(headerEl.getBoundingClientRect().height, 0) : 0;
      const hudH = hudEl ? clampNumber(hudEl.getBoundingClientRect().height, 0) : 0;

      const pairsCount = getPairsCount();
      const cards = pairsCount * 2;
      const rows = Math.max(1, Math.ceil(cards / COLS));

      root.style.setProperty('--games-cols', String(COLS));
      root.style.setProperty('--games-rows', String(rows));

      // Height is used only to keep easy boards from feeling tiny in a tall window.
      const availableHeight = Math.max(220, viewportHeight - headerH - hudH - 88);
      if (availableHeight && rows) {
        root.style.setProperty('--games-min-stage', `${Math.min(availableHeight, 560)}px`);
      }
    } catch {
      // Fail safely: never throw from sizing.
    }
  }

  let boardFitTimer = null;
  function scheduleBoardFitUpdate() {
    if (boardFitTimer) {
      window.clearTimeout(boardFitTimer);
    }
    boardFitTimer = window.setTimeout(() => {
      boardFitTimer = null;
      updateBoardFit();
    }, 100);
  }

  let deck = [];
  let locked = false;
  let firstPick = null;
  let secondPick = null;
  let matchedCount = 0;
  let moves = 0;

  let timerId = null;
  let startedAt = 0;
  let elapsedMsAtStop = 0;

  function announce(text) {
    live.textContent = '';
    window.setTimeout(() => {
      live.textContent = text;
    }, 25);
  }

  function clampInt(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.floor(n));
  }

  function getModeDefaultPairs() {
    const key = String(mode.value || 'normal');
    return MODE_TO_PAIRS[key] || MODE_TO_PAIRS.normal;
  }

  function formatTime(ms) {
    const total = clampInt(ms, 0);
    const s = Math.floor(total / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function setMoves(nextMoves) {
    moves = clampInt(nextMoves, 0);
    movesEl.textContent = String(moves);
  }

  function setTimeDisplay(ms) {
    timeEl.textContent = formatTime(ms);
  }

  function stopTimer() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
    if (startedAt) {
      elapsedMsAtStop += (performance.now() - startedAt);
      startedAt = 0;
    }
  }

  function startTimerIfNeeded() {
    if (timerId) return;
    if (startedAt) return;

    startedAt = performance.now();
    timerId = window.setInterval(() => {
      const now = performance.now();
      const total = elapsedMsAtStop + (startedAt ? (now - startedAt) : 0);
      setTimeDisplay(total);
    }, 250);
  }

  function resetTimer() {
    stopTimer();
    elapsedMsAtStop = 0;
    setTimeDisplay(0);
  }

  function shuffleInPlace(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = array[i];
      array[i] = array[j];
      array[j] = tmp;
    }
    return array;
  }

  function getPairsCount() {
    return getModeDefaultPairs();
  }

  function buildDeck(pairsCount) {
    const pool = buildMemojiPool();
    shuffleInPlace(pool);
    const picks = pool.slice(0, Math.min(pairsCount, pool.length));
    currentMemoji = picks;
    const next = [];
    for (const m of picks) {
      next.push({ key: `${m.id}-a`, pairId: m.id, src: m.src, name: m.name });
      next.push({ key: `${m.id}-b`, pairId: m.id, src: m.src, name: m.name });
    }
    return shuffleInPlace(next);
  }

  function getFallbackLabel(card) {
    const name = String(card && card.name ? card.name : '');
    const match = name.match(/\d+/);
    if (match && match[0]) {
      return `M${match[0]}`;
    }

    const pairId = String(card && card.pairId ? card.pairId : '').trim();
    if (pairId) {
      return pairId.replace(/^m/i, 'M').toUpperCase();
    }

    return 'M';
  }

  function createCardEl(card, index, total) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'games-card';
    btn.dataset.pairId = card.pairId;
    btn.dataset.index = String(index);
    btn.setAttribute('role', 'gridcell');
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', `Card ${index + 1} of ${total}. Face down.`);

    const inner = document.createElement('span');
    inner.className = 'games-card__inner';

    const front = document.createElement('span');
    front.className = 'games-face games-face--front';
    front.setAttribute('aria-hidden', 'true');
    front.textContent = '';

    const back = document.createElement('span');
    back.className = 'games-face games-face--back';
    back.setAttribute('aria-hidden', 'true');

    const img = document.createElement('img');
    img.className = 'games-memoji';
    img.alt = card.name;
    img.loading = 'lazy';
    img.decoding = 'async';

    const fallback = document.createElement('span');
    fallback.className = 'games-fallback';
    fallback.setAttribute('aria-hidden', 'true');
    fallback.textContent = getFallbackLabel(card);
    fallback.style.display = 'none';

    img.addEventListener('error', () => {
      img.style.display = 'none';
      fallback.style.display = '';
    });

    img.addEventListener('load', () => {
      fallback.style.display = 'none';
      img.style.display = '';
    });

    img.src = card.src;

    back.appendChild(img);
    back.appendChild(fallback);
    inner.appendChild(front);
    inner.appendChild(back);
    btn.appendChild(inner);

    btn.addEventListener('click', onCardClick);
    btn.addEventListener('keydown', onCardKeyDown);
    return btn;
  }

  function setCardState(btn, state) {
    if (state === 'down') {
      btn.classList.remove('is-matched');
      btn.setAttribute('aria-pressed', 'false');
      btn.removeAttribute('disabled');
      btn.removeAttribute('aria-disabled');
    }
    if (state === 'up') {
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-disabled', 'true');
    }
    if (state === 'matched') {
      btn.classList.add('is-matched');
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('disabled', '');
      btn.setAttribute('aria-disabled', 'true');
    }
  }

  function updateCardLabels() {
    const cards = Array.from(board.querySelectorAll('.games-card'));
    const total = cards.length;
    for (let i = 0; i < total; i++) {
      const btn = cards[i];
      const pressed = btn.getAttribute('aria-pressed') === 'true';
      const disabled = btn.hasAttribute('disabled');
      const index = i + 1;

      if (disabled) {
        btn.setAttribute('aria-label', `Card ${index} of ${total}. Matched.`);
        continue;
      }

      if (pressed) {
        const pairId = btn.dataset.pairId;
        const m = currentMemoji.find(x => x.id === pairId);
        const name = m ? m.name : 'Memoji';
        btn.setAttribute('aria-label', `Card ${index} of ${total}. Face up: ${name}.`);
      } else {
        btn.setAttribute('aria-label', `Card ${index} of ${total}. Face down.`);
      }
    }
  }

  function clearPicks() {
    firstPick = null;
    secondPick = null;
  }

  function flipDown(btn) {
    setCardState(btn, 'down');
  }

  function flipUp(btn) {
    setCardState(btn, 'up');
  }

  function markMatched(btn) {
    setCardState(btn, 'matched');
  }

  function onCardClick(e) {
    unlockAudio();
    const btn = e.currentTarget;
    tryPick(btn);
  }

  function onCardKeyDown(e) {
    const btn = e.currentTarget;
    const key = e.key;
    if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      tryPick(btn);
      return;
    }

    if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'ArrowUp' && key !== 'ArrowDown') return;

    e.preventDefault();
    const cards = Array.from(board.querySelectorAll('.games-card'));
    const idx = cards.indexOf(btn);
    if (idx < 0) return;

    const cols = getComputedColumnsCount();
    let next = idx;
    if (key === 'ArrowLeft') next = Math.max(0, idx - 1);
    if (key === 'ArrowRight') next = Math.min(cards.length - 1, idx + 1);
    if (key === 'ArrowUp') next = Math.max(0, idx - cols);
    if (key === 'ArrowDown') next = Math.min(cards.length - 1, idx + cols);
    cards[next].focus();
  }

  function getComputedColumnsCount() {
    const style = window.getComputedStyle(board);
    const cols = (style.gridTemplateColumns || '').split(' ').filter(Boolean).length;
    return Math.max(1, cols || 1);
  }

  function updateBoardAriaGridMetadata() {
    const cols = getComputedColumnsCount();
    board.setAttribute('aria-colcount', String(cols));
    board.setAttribute('aria-rowcount', String(Math.ceil(deck.length / cols)));
  }

  let ariaMetaTimer = null;
  function scheduleAriaGridMetadataUpdate() {
    if (ariaMetaTimer) {
      window.clearTimeout(ariaMetaTimer);
    }

    ariaMetaTimer = window.setTimeout(() => {
      ariaMetaTimer = null;
      updateBoardAriaGridMetadata();
    }, 150);
  }

  function ratePlay(pairs, moveCount) {
    const minMoves = Math.max(1, pairs);
    const ratio = moveCount / minMoves;

    if (moveCount <= minMoves) {
      return {
        stars: 5,
        title: 'Perfect memory.',
        grade: 'You never missed. The bear is taking notes.'
      };
    }
    if (ratio <= 1.5) {
      return {
        stars: 5,
        title: 'Unreal.',
        grade: 'Almost no wasted flips. Show-off energy.'
      };
    }
    if (ratio <= 2) {
      return {
        stars: 4,
        title: 'The memojis are impressed.',
        grade: 'Clean, quick, and kind of stylish.'
      };
    }
    if (ratio <= 2.75) {
      return {
        stars: 3,
        title: 'Solid run.',
        grade: 'The panda would play you again.'
      };
    }
    if (ratio <= 3.5) {
      return {
        stars: 2,
        title: 'You got them home.',
        grade: 'A few extra flips. They still made the party.'
      };
    }
    return {
      stars: 1,
      title: 'Chaos victory.',
      grade: 'Nobody said it had to be pretty.'
    };
  }

  function renderStars(count) {
    if (!winStars) return;
    winStars.textContent = '';
    winStars.setAttribute('aria-label', `${count} out of 5 stars`);
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.className = i <= count ? 'is-on' : 'is-off';
      star.setAttribute('aria-hidden', 'true');
      star.textContent = '★';
      winStars.appendChild(star);
    }
  }

  function setEndStats(ms) {
    const pairs = getPairsCount();
    const rating = ratePlay(pairs, moves);
    const modeLabel = String(mode.options[mode.selectedIndex] ? mode.options[mode.selectedIndex].text : mode.value).split('—')[0].trim();

    if (winTitle) winTitle.textContent = rating.title;
    if (winGrade) winGrade.textContent = rating.grade;
    renderStars(rating.stars);
    endStats.textContent = `${moves} moves · ${formatTime(ms)} · ${modeLabel}`;
  }

  function tryPick(btn) {
    if (locked) return;
    if (btn.hasAttribute('disabled')) return;

    const alreadyUp = btn.getAttribute('aria-pressed') === 'true';
    if (alreadyUp) return;

    startTimerIfNeeded();

    flipUp(btn);

    if (!firstPick) {
      firstPick = btn;
      updateCardLabels();
      return;
    }

    if (firstPick === btn) return;
    secondPick = btn;
    setMoves(moves + 1);

    const firstId = firstPick.dataset.pairId;
    const secondId = secondPick.dataset.pairId;
    updateCardLabels();

    if (firstId && secondId && firstId === secondId) {
      markMatched(firstPick);
      markMatched(secondPick);
      matchedCount += 2;
      announce('Match found.');
      clearPicks();
      updateCardLabels();

      if (matchedCount >= deck.length) {
        playWinSound();
        stopTimer();
        const totalMs = elapsedMsAtStop;
        announce(`Game complete. Moves: ${moves}. Time: ${formatTime(totalMs)}.`);
        setEndStats(totalMs);
        showEnd();
        playAgainBtn.focus();
      } else {
        playMatchSound();
      }

      return;
    }

    locked = true;
    const flipBackDelay = prefersReducedMotion ? 0 : 650;
    announce('Not a match.');

    window.setTimeout(() => {
      if (firstPick) flipDown(firstPick);
      if (secondPick) flipDown(secondPick);
      clearPicks();
      locked = false;
      updateCardLabels();
    }, flipBackDelay);
  }

  function resetRunState() {
    locked = false;
    clearPicks();
    matchedCount = 0;
    setMoves(0);
    resetTimer();
    deck = [];
    board.innerHTML = '';
  }

  function renderNewGame() {
    updateBoardFit();

    locked = false;
    clearPicks();
    matchedCount = 0;
    setMoves(0);
    resetTimer();

    const pairsCount = getPairsCount();
    deck = buildDeck(pairsCount);

    board.innerHTML = '';

    const total = deck.length;
    for (let i = 0; i < total; i++) {
      const card = deck[i];
      const el = createCardEl(card, i, total);
      board.appendChild(el);
    }

    window.requestAnimationFrame(() => {
      updateBoardFit();
      window.requestAnimationFrame(() => {
        updateBoardFit();
        updateBoardAriaGridMetadata();
      });
    });

    updateCardLabels();
    announce(`New game. ${pairsCount} pairs. Flip two cards to find a match.`);
    const first = board.querySelector('.games-card');
    if (first) first.setAttribute('tabindex', '0');
  }

  function hideWin() {
    endScreen.hidden = true;
  }

  function showOnly(target) {
    preGame.hidden = target !== preGame;
    modeScreen.hidden = target !== modeScreen;
    gameScreen.hidden = target !== gameScreen;
    hideWin();
  }

  function showPreGame() {
    root.classList.remove('game-active');
    showOnly(preGame);
  }

  function showMode() {
    root.classList.remove('game-active');
    showOnly(modeScreen);
  }

  function showGame() {
    root.classList.add('game-active');
    showOnly(gameScreen);
  }

  function showEnd() {
    endScreen.hidden = false;
    if (playAgainBtn) playAgainBtn.focus();
  }

  startBtn.addEventListener('click', () => {
    unlockAudio();
    showMode();
    mode.focus();
  });

  if (backStoryBtn) {
    backStoryBtn.addEventListener('click', () => {
      showPreGame();
      startBtn.focus();
    });
  }

  playBtn.addEventListener('click', () => {
    unlockAudio();
    showGame();
    renderNewGame();
    gameScreen.scrollIntoView({ block: 'start', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  restartBtn.addEventListener('click', () => {
    unlockAudio();
    resetRunState();
    showMode();
    mode.focus();
  });

  playAgainBtn.addEventListener('click', () => {
    unlockAudio();
    resetRunState();
    showMode();
    mode.focus();
  });

  mode.addEventListener('change', () => {
    if (!gameScreen.hidden) {
      renderNewGame();
    }
  });

  window.addEventListener('resize', scheduleAriaGridMetadataUpdate, { passive: true });
  window.addEventListener('orientationchange', scheduleAriaGridMetadataUpdate, { passive: true });

  window.addEventListener('resize', scheduleBoardFitUpdate, { passive: true });
  window.addEventListener('orientationchange', scheduleBoardFitUpdate, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleBoardFitUpdate, { passive: true });
    window.visualViewport.addEventListener('scroll', scheduleBoardFitUpdate, { passive: true });
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const play = params.get('play');
    if (play && MODE_TO_PAIRS[play]) {
      mode.value = play;
      showGame();
      renderNewGame();
    } else {
      showPreGame();
    }
  } catch {
    showPreGame();
  }
})();
