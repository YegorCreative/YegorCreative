(function () {
  'use strict';

  const startScreen = document.getElementById('pulseStart');
  const playScreen = document.getElementById('pulsePlay');
  const endScreen = document.getElementById('pulseEnd');
  const startBtn = document.getElementById('pulseStartBtn');
  const againBtn = document.getElementById('pulseAgain');
  const pads = Array.from(document.querySelectorAll('.pulse-pad'));
  const roundEl = document.getElementById('pulseRound');
  const statusEl = document.getElementById('pulseStatus');
  const liveEl = document.getElementById('pulseLive');
  const endStats = document.getElementById('pulseEndStats');

  if (!startScreen || !playScreen || !pads.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const flashMs = reduceMotion ? 220 : 420;
  const gapMs = reduceMotion ? 140 : 220;

  let sequence = [];
  let step = 0;
  let locked = true;

  function show(el) {
    [startScreen, playScreen, endScreen].forEach((screen) => {
      if (!screen) return;
      screen.hidden = screen !== el;
    });
  }

  function say(text) {
    if (liveEl) liveEl.textContent = text;
  }

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function flash(index) {
    const pad = pads[index];
    if (!pad) return Promise.resolve();
    pad.classList.add('is-on');
    return sleep(flashMs).then(() => pad.classList.remove('is-on'));
  }

  async function playSequence() {
    locked = true;
    statusEl.textContent = 'Watch';
    say('Watch the sequence.');
    pads.forEach((pad) => { pad.disabled = true; });
    await sleep(400);
    for (let i = 0; i < sequence.length; i += 1) {
      await flash(sequence[i]);
      await sleep(gapMs);
    }
    locked = false;
    step = 0;
    statusEl.textContent = 'Your turn';
    say('Your turn. Repeat the sequence.');
    pads.forEach((pad) => { pad.disabled = false; });
  }

  function nextRound() {
    sequence.push(Math.floor(Math.random() * 4));
    roundEl.textContent = String(sequence.length);
    playSequence();
  }

  function startGame() {
    sequence = [];
    step = 0;
    show(playScreen);
    nextRound();
  }

  function endGame() {
    locked = true;
    pads.forEach((pad) => { pad.disabled = true; });
    const reached = sequence.length;
    endStats.textContent = reached === 1
      ? 'You reached round 1.'
      : `You reached round ${reached}.`;
    say('Sequence missed.');
    show(endScreen);
  }

  pads.forEach((pad) => {
    pad.addEventListener('click', () => {
      if (locked) return;
      const index = Number(pad.getAttribute('data-pad'));
      flash(index);
      if (index !== sequence[step]) {
        endGame();
        return;
      }
      step += 1;
      if (step >= sequence.length) {
        statusEl.textContent = 'Nice';
        say('Correct. Next round.');
        window.setTimeout(nextRound, 500);
      }
    });
  });

  startBtn.addEventListener('click', startGame);
  if (againBtn) againBtn.addEventListener('click', startGame);
})();
