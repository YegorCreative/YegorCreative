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

      // Placeholder "memoji" assets: expected paths. If these files do not exist,
      // the game still works; the cards will show broken images (user can add assets later).
      const memoji = [
        { id: 'm1', src: 'Assets/Elements/PNG/memoji-01.png', name: 'Memoji 1' },
        { id: 'm2', src: 'Assets/Elements/PNG/memoji-02.png', name: 'Memoji 2' },
        { id: 'm3', src: 'Assets/Elements/PNG/memoji-03.png', name: 'Memoji 3' },
        { id: 'm4', src: 'Assets/Elements/PNG/memoji-04.png', name: 'Memoji 4' },
        { id: 'm5', src: 'Assets/Elements/PNG/memoji-05.png', name: 'Memoji 5' },
        { id: 'm6', src: 'Assets/Elements/PNG/memoji-06.png', name: 'Memoji 6' },
        { id: 'm7', src: 'Assets/Elements/PNG/memoji-07.png', name: 'Memoji 7' },
        { id: 'm8', src: 'Assets/Elements/PNG/memoji-08.png', name: 'Memoji 8' },
        { id: 'm9', src: 'Assets/Elements/PNG/memoji-09.png', name: 'Memoji 9' },
        { id: 'm10', src: 'Assets/Elements/PNG/memoji-10.png', name: 'Memoji 10' },
        { id: 'm11', src: 'Assets/Elements/PNG/memoji-11.png', name: 'Memoji 11' },
        { id: 'm12', src: 'Assets/Elements/PNG/memoji-12.png', name: 'Memoji 12' },
        { id: 'm13', src: 'Assets/Elements/PNG/memoji-13.png', name: 'Memoji 13' },
        { id: 'm14', src: 'Assets/Elements/PNG/memoji-14.png', name: 'Memoji 14' },
        { id: 'm15', src: 'Assets/Elements/PNG/memoji-15.png', name: 'Memoji 15' },
        { id: 'm16', src: 'Assets/Elements/PNG/memoji-16.png', name: 'Memoji 16' }
      ];

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

      function computeAndApplyBoardSize() {
        try {
          const vv = window.visualViewport;
          const viewportHeight = vv ? clampNumber(vv.height, window.innerHeight) : window.innerHeight;
          const viewportWidth = vv ? clampNumber(vv.width, window.innerWidth) : window.innerWidth;
          const viewportTop = vv ? clampNumber(vv.offsetTop, 0) : 0;

          const gameContainer = root.querySelector('.games-shell .container') || root.querySelector('main .container') || root.querySelector('.container');
          const containerWidth = gameContainer ? clampNumber(gameContainer.getBoundingClientRect().width, viewportWidth) : viewportWidth;

          const boardHost = board.parentElement;
          let hostWidth = containerWidth;
          if (boardHost) {
            const hostRect = boardHost.getBoundingClientRect();
            hostWidth = clampNumber(hostRect.width, containerWidth);

            const hostStyle = window.getComputedStyle(boardHost);
            const padLeft = clampNumber(parseFloat(hostStyle.paddingLeft || ''), 0);
            const padRight = clampNumber(parseFloat(hostStyle.paddingRight || ''), 0);
            hostWidth = Math.max(0, hostWidth - padLeft - padRight);
          }

          const boardRect = board.getBoundingClientRect();
          const boardTopInVisual = clampNumber(boardRect.top, 0) - viewportTop;

          const buffer = 16;
          const availableHeight = viewportHeight - boardTopInVisual - buffer;
          const availableWidth = Math.min(viewportWidth, containerWidth, hostWidth);

          const pairsCount = getPairsCount();
          const totalCards = pairsCount * 2;
          const rows = Math.max(1, Math.ceil(totalCards / COLS));

          const style = window.getComputedStyle(board);
          const gapPx = clampNumber(parseFloat(style.gap || ''), 10);
          const gap = Math.max(6, Math.min(12, Math.floor(gapPx)));

          const cardFromWidth = Math.floor((availableWidth - gap * (COLS - 1)) / COLS);
          const cardFromHeight = Math.floor((availableHeight - gap * (rows - 1)) / rows);
          const card = Math.max(38, Math.min(cardFromWidth, cardFromHeight));

          if (Number.isFinite(card) && card > 0) {
            root.style.setProperty('--games-cols', String(COLS));
            root.style.setProperty('--games-rows', String(rows));
            root.style.setProperty('--games-gap', `${gap}px`);
            root.style.setProperty('--games-card', `${card}px`);
          }
        } catch {
          // Fail safely: never throw from sizing.
        }
      }

      let boardSizeTimer = null;
      function scheduleBoardSizeUpdate() {
        if (boardSizeTimer) {
          window.clearTimeout(boardSizeTimer);
        }
        boardSizeTimer = window.setTimeout(() => {
          boardSizeTimer = null;
          computeAndApplyBoardSize();
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
        const picks = memoji.slice(0, Math.min(pairsCount, memoji.length));
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
            const m = memoji.find(x => x.id === pairId);
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
        computeAndApplyBoardSize();

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
          computeAndApplyBoardSize();
          updateBoardAriaGridMetadata();
        });

        updateCardLabels();
        announce(`New game. ${pairsCount} pairs. Use Tab to focus a card and Enter to flip.`);
        const first = board.querySelector('.games-card');
        if (first) first.focus();
      }

      mode.addEventListener('change', () => {
        renderNewGame();
      });

      restartBtn.addEventListener('click', () => {
        renderNewGame();
      });

      window.addEventListener('resize', scheduleAriaGridMetadataUpdate, { passive: true });
      window.addEventListener('orientationchange', scheduleAriaGridMetadataUpdate, { passive: true });

      window.addEventListener('resize', scheduleBoardSizeUpdate, { passive: true });
      window.addEventListener('orientationchange', scheduleBoardSizeUpdate, { passive: true });
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', scheduleBoardSizeUpdate, { passive: true });
        window.visualViewport.addEventListener('scroll', scheduleBoardSizeUpdate, { passive: true });
      }

  // Initial boot.
  computeAndApplyBoardSize();
  renderNewGame();
})();
