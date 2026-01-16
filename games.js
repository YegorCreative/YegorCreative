/* Games: Memoji Memory Match (scoped)
   Vanilla JS, accessible, responsive, no external libraries.
*/

(function () {
  'use strict';

      const root = document.querySelector('body.games-page');
      if (!root) return;

      const board = document.getElementById('gamesBoard');
      const mode = document.getElementById('gamesMode');
      const restartBtn = document.getElementById('gamesRestart');
      const movesEl = document.getElementById('gamesMoves');
      const timeEl = document.getElementById('gamesTime');
      const live = document.getElementById('gamesLive');

      if (!board || !mode || !restartBtn || !movesEl || !timeEl || !live) return;

      const MEMOJI_TOTAL = 52;
      const MEMOJI_PATH = 'assets/memoji/';
      const MEMOJI_PREFIX = 'memoji';
      const MEMOJI_SUFFIX = '.heic.png';

      function buildMemojiPool() {
        const pool = [];
        for (let i = 1; i <= MEMOJI_TOTAL; i++) {
          const num = String(i).padStart(4, '0');
          const id = `m${num}`;
          const src = `${MEMOJI_PATH}${MEMOJI_PREFIX}${num}${MEMOJI_SUFFIX}`;
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

      function clampNumber(value, fallback) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
      }

      function updateBoardFit() {
        try {
          const vv = window.visualViewport;
          const viewportHeight = vv ? clampNumber(vv.height, window.innerHeight) : window.innerHeight;
          const viewportWidth = vv ? clampNumber(vv.width, window.innerWidth) : window.innerWidth;

          const headerEl = document.querySelector('header.mainHeading');
          const layoutContainer = root.querySelector('.games-shell > .container');
          const heroEl = root.querySelector('.games-hero');
          const gameInfoEl = root.querySelector('.games-gameinfo');
          const controlsEl = root.querySelector('.games-controls');
          const boardWrapEl = root.querySelector('.games-boardwrap');
          const boardTitleEl = root.querySelector('.games-boardtitle');

          const headerH = headerEl ? clampNumber(headerEl.getBoundingClientRect().height, 0) : 0;
          const heroH = heroEl ? clampNumber(heroEl.getBoundingClientRect().height, 0) : 0;
          const gameInfoH = gameInfoEl ? clampNumber(gameInfoEl.getBoundingClientRect().height, 0) : 0;
          const controlsH = controlsEl ? clampNumber(controlsEl.getBoundingClientRect().height, 0) : 0;

          const paddingBuffer = 16;
          let availableHeight = viewportHeight - headerH - heroH - gameInfoH - controlsH - paddingBuffer;
          availableHeight = Math.max(0, availableHeight);

          if (layoutContainer) {
            const lcStyle = window.getComputedStyle(layoutContainer);
            const gapPx = clampNumber(parseFloat(lcStyle.rowGap || lcStyle.gap || ''), 0);
            const countAbove = [heroEl, gameInfoEl, controlsEl].filter(Boolean).length;
            availableHeight = Math.max(0, availableHeight - gapPx * countAbove);
          }

          if (boardWrapEl) {
            const wrapStyle = window.getComputedStyle(boardWrapEl);
            const padTop = clampNumber(parseFloat(wrapStyle.paddingTop || ''), 0);
            const padBottom = clampNumber(parseFloat(wrapStyle.paddingBottom || ''), 0);
            const borderTop = clampNumber(parseFloat(wrapStyle.borderTopWidth || ''), 0);
            const borderBottom = clampNumber(parseFloat(wrapStyle.borderBottomWidth || ''), 0);
            availableHeight = Math.max(0, availableHeight - padTop - padBottom - borderTop - borderBottom);
          }

          if (boardTitleEl) {
            availableHeight = Math.max(0, availableHeight - clampNumber(boardTitleEl.getBoundingClientRect().height, 0));
          }

          const gameContainer =
            root.querySelector('.games-shell .container') ||
            root.querySelector('main .container') ||
            root.querySelector('.container');

          const availableWidth = gameContainer
            ? clampNumber(gameContainer.getBoundingClientRect().width, viewportWidth)
            : viewportWidth;

          let fitWidth = availableWidth;
          if (boardWrapEl) {
            const wrapRect = boardWrapEl.getBoundingClientRect();
            const wrapStyle = window.getComputedStyle(boardWrapEl);
            const padLeft = clampNumber(parseFloat(wrapStyle.paddingLeft || ''), 0);
            const padRight = clampNumber(parseFloat(wrapStyle.paddingRight || ''), 0);
            const borderLeft = clampNumber(parseFloat(wrapStyle.borderLeftWidth || ''), 0);
            const borderRight = clampNumber(parseFloat(wrapStyle.borderRightWidth || ''), 0);
            const innerWidth = clampNumber(wrapRect.width, fitWidth) - padLeft - padRight - borderLeft - borderRight;
            fitWidth = Math.max(0, Math.min(fitWidth, innerWidth));
          }

          const pairsCount = getPairsCount();
          const rows = Math.max(1, Math.round((pairsCount * 2) / COLS));

          // Fixed sizing: only keep grid geometry (cols/rows). Do not overwrite --games-card.
          root.style.setProperty('--games-cols', String(COLS));
          root.style.setProperty('--games-rows', String(rows));

          const style = window.getComputedStyle(board);
          const gapPx = clampNumber(parseFloat(style.gap || ''), 10);
          const gap = Math.max(0, Math.floor(gapPx) || 10);

          root.style.setProperty('--games-gap', `${gap}px`);
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
        // Force a short delay to help some ATs re-announce.
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
        front.textContent = 'Match';

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
        // state: 'down' | 'up' | 'matched'
        if (state === 'down') {
          btn.setAttribute('aria-pressed', 'false');
          btn.removeAttribute('disabled');
          btn.removeAttribute('aria-disabled');
        }
        if (state === 'up') {
          btn.setAttribute('aria-pressed', 'true');
          btn.setAttribute('aria-disabled', 'true');
        }
        if (state === 'matched') {
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

        // Simple roving navigation in grid by DOM order.
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
            stopTimer();
            const totalMs = elapsedMsAtStop;
            announce(`Game complete. Moves: ${moves}. Time: ${formatTime(totalMs)}.`);
            // Move focus to Restart for an easy next action.
            restartBtn.focus();
          }

          return;
        }

        // Mismatch: briefly lock and flip back.
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
          updateBoardAriaGridMetadata();
        });

        updateCardLabels();
        announce(`New game. ${pairsCount} pairs. Use Tab to focus a card and Enter to flip.`);
        const first = board.querySelector('.games-card');
        if (first) first.focus();
      }

      mode.addEventListener('change', () => {
        updateBoardFit();
        renderNewGame();
      });

      restartBtn.addEventListener('click', () => {
        updateBoardFit();
        renderNewGame();
      });

      window.addEventListener('resize', scheduleAriaGridMetadataUpdate, { passive: true });
      window.addEventListener('orientationchange', scheduleAriaGridMetadataUpdate, { passive: true });

      window.addEventListener('resize', scheduleBoardFitUpdate, { passive: true });
      window.addEventListener('orientationchange', scheduleBoardFitUpdate, { passive: true });
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', scheduleBoardFitUpdate, { passive: true });
        window.visualViewport.addEventListener('scroll', scheduleBoardFitUpdate, { passive: true });
      }

  // Initial boot.
  updateBoardFit();
  renderNewGame();
})();
