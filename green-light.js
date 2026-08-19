/* Green Light — 15 cities, five greens each. */
(function () {
  'use strict';

  const startScreen = document.getElementById('greenStart');
  const playScreen = document.getElementById('greenPlay');
  const citiesScreen = document.getElementById('greenCities');
  const startBtn = document.getElementById('greenStartBtn');
  const retryBtn = document.getElementById('greenRetry');
  const againBtn = document.getElementById('greenAgain');
  const citiesBtn = document.getElementById('greenCitiesBtn');
  const continueBtn = document.getElementById('greenContinueBtn');
  const backStoryBtn = document.getElementById('greenBackStory');
  const cityGrid = document.getElementById('greenCityGrid');
  const livesNote = document.getElementById('greenLivesNote');
  const livesHud = document.getElementById('greenLivesHud');
  const pad = document.getElementById('greenPad');
  const roundEl = document.getElementById('greenRound');
  const lastEl = document.getElementById('greenLast');
  const bestEl = document.getElementById('greenBest');
  const liveEl = document.getElementById('greenLive');
  const overlay = document.getElementById('greenOverlay');
  const overlayEye = document.getElementById('greenOverlayEye');
  const overlayTitle = document.getElementById('greenOverlayTitle');
  const overlayText = document.getElementById('greenOverlayText');
  const overlayStats = document.getElementById('greenOverlayStats');
  const starsEl = document.getElementById('greenStars');
  const runnerEl = document.getElementById('greenRunner');
  const callEl = document.getElementById('greenCall');
  const hintEl = document.getElementById('greenHint');
  const cityArt = document.getElementById('greenCityArt');
  const cityNameEl = document.getElementById('greenCityName');
  const cityHud = document.getElementById('greenCityHud');

  if (!startScreen || !playScreen || !pad || !startBtn) return;

  const BEST_KEY = 'yc-green-best-avg';
  const CITY_KEY = 'yc-green-city';
  const FAIL_KEY = 'yc-green-fails';
  const ROUNDS = 5;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CITIES = [
    { name: 'Dusk Alley', look: 'alley', tint: '#c4b5fd' },
    { name: 'Neon Pier', look: 'neon', tint: '#22d3ee' },
    { name: 'Quiet Heights', look: 'towers', tint: '#93c5fd' },
    { name: 'Brick Row', look: 'row', tint: '#fb7185' },
    { name: 'Canal Street', look: 'ware', tint: '#38bdf8' },
    { name: 'Fog Harbor', look: 'fog', tint: '#94a3b8' },
    { name: 'Midtown Blink', look: 'glass', tint: '#a78bfa' },
    { name: 'Rooftop Park', look: 'park', tint: '#4ade80' },
    { name: 'Bridge View', look: 'bridge', tint: '#64748b' },
    { name: 'Night Market', look: 'market', tint: '#f97316' },
    { name: 'Radio Hill', look: 'radio', tint: '#818cf8' },
    { name: 'Last Train', look: 'train', tint: '#f87171' },
    { name: 'Gold Hour', look: 'gold', tint: '#fbbf24' },
    { name: 'Storm Side', look: 'storm', tint: '#67e8f9' },
    { name: 'Home Block', look: 'homes', tint: '#86efac' }
  ];

  let state = 'idle';
  let goAt = 0;
  let timer = 0;
  let afterTimer = 0;
  let round = 0;
  let times = [];
  let audioCtx = null;
  let cityIndex = 0;
  let overlayMode = 'fail';

  function say(text) {
    if (!liveEl) return;
    liveEl.textContent = '';
    window.setTimeout(() => { liveEl.textContent = text; }, 20);
  }

  function formatMs(ms) {
    return ms + ' ms';
  }

  function average(list) {
    if (!list.length) return 0;
    return Math.round(list.reduce((sum, n) => sum + n, 0) / list.length);
  }

  function loadBest() {
    try {
      const n = Number(window.localStorage.getItem(BEST_KEY));
      if (Number.isFinite(n) && n > 0) {
        if (bestEl) bestEl.textContent = formatMs(n);
        return n;
      }
    } catch {
      // ignore
    }
    if (bestEl) bestEl.textContent = '—';
    return null;
  }

  function saveBest(avg) {
    const current = loadBest();
    if (current === null || avg < current) {
      try {
        window.localStorage.setItem(BEST_KEY, String(avg));
      } catch {
        // ignore
      }
      if (bestEl) bestEl.textContent = formatMs(avg);
      return true;
    }
    if (bestEl) bestEl.textContent = formatMs(current);
    return false;
  }

  function loadCity() {
    try {
      const n = Number(window.localStorage.getItem(CITY_KEY));
      if (Number.isFinite(n)) return Math.min(14, Math.max(0, Math.floor(n)));
    } catch {
      // ignore
    }
    return 0;
  }

  function saveCity(index) {
    try {
      const current = loadCity();
      if (index > current) window.localStorage.setItem(CITY_KEY, String(index));
    } catch {
      // ignore
    }
  }

  function resetTour() {
    try {
      window.localStorage.setItem(CITY_KEY, '0');
      window.localStorage.setItem(FAIL_KEY, '0');
    } catch {
      // ignore
    }
  }

  function loadFails() {
    try {
      const n = Number(window.localStorage.getItem(FAIL_KEY));
      if (Number.isFinite(n)) return Math.min(3, Math.max(0, Math.floor(n)));
    } catch {
      // ignore
    }
    return 0;
  }

  function saveFails(n) {
    try {
      window.localStorage.setItem(FAIL_KEY, String(Math.max(0, n)));
    } catch {
      // ignore
    }
  }

  function chancesLeft() {
    return Math.max(0, 3 - loadFails());
  }

  function updateLives() {
    const left = chancesLeft();
    if (livesHud) livesHud.textContent = String(left);
    if (livesNote) {
      livesNote.textContent = left === 1
        ? '1 chance left — another loss sends you back to city 1.'
        : left + ' chances left';
    }
  }

  const BASE = 200;

  function svgEl(name, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.keys(attrs).forEach((key) => el.setAttribute(key, String(attrs[key])));
    return el;
  }

  function add(name, attrs) {
    cityArt.appendChild(svgEl(name, attrs));
  }

  function bldg(x, w, h, fill, opt) {
    opt = opt || {};
    const y = BASE - h;
    const rx = opt.rx != null ? opt.rx : 5;
    add('rect', { x: x, y: y, width: w, height: h, fill: fill, rx: rx });
    add('rect', {
      x: x + w * 0.78,
      y: y,
      width: w * 0.22,
      height: h,
      fill: '#0f172a',
      opacity: '0.1',
      rx: rx
    });
    add('rect', { x: x, y: y, width: w, height: 6, fill: '#ffffff', opacity: '0.22', rx: rx });
    if (opt.roof === 'peak') {
      const rh = opt.rh || 18;
      add('polygon', {
        points: (x - 4) + ',' + y + ' ' + (x + w / 2) + ',' + (y - rh) + ' ' + (x + w + 4) + ',' + y,
        fill: opt.roofFill || '#fb7185'
      });
    } else if (opt.roof === 'barn') {
      add('polygon', {
        points: x + ',' + y + ' ' + (x + 10) + ',' + (y - 12) + ' ' + (x + w - 10) + ',' + (y - 12) + ' ' + (x + w) + ',' + y,
        fill: opt.roofFill || '#b45309'
      });
    } else if (opt.roof === 'dome') {
      add('ellipse', {
        cx: x + w / 2,
        cy: y + 2,
        rx: w * 0.42,
        ry: opt.rh || 16,
        fill: opt.roofFill || fill
      });
    } else if (opt.roof === 'cap') {
      add('rect', {
        x: x - 3,
        y: y - 9,
        width: w + 6,
        height: 12,
        fill: opt.roofFill || '#64748b',
        rx: 4
      });
    }
    if (opt.chimney) {
      const cy = y - (opt.roof === 'peak' ? 24 : 16);
      add('rect', { x: x + w - 18, y: cy, width: 9, height: 20, fill: '#9f1239', rx: 1 });
      add('rect', { x: x + w - 20, y: cy - 3, width: 13, height: 5, fill: '#7f1d1d', rx: 1 });
    }
    const cols = opt.cols || 2;
    const win = opt.win || '#e0f2fe';
    const padX = 8;
    const gap = 6;
    const ww = Math.max(7, (w - padX * 2 - (cols - 1) * gap) / cols);
    const rows = opt.rows != null ? opt.rows : Math.max(1, Math.floor((h - 36) / 20));
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const wx = x + padX + c * (ww + gap);
        const wy = y + 14 + r * 20;
        if (wy + 14 > BASE - (opt.door ? 30 : 10)) continue;
        add('rect', { x: wx, y: wy, width: ww, height: 13, fill: win, rx: 2.5 });
        add('rect', {
          x: wx + ww / 2 - 0.7,
          y: wy,
          width: 1.4,
          height: 13,
          fill: '#ffffff',
          opacity: '0.75'
        });
      }
    }
    if (opt.door) {
      add('rect', {
        x: x + w / 2 - 8,
        y: BASE - 24,
        width: 16,
        height: 24,
        fill: opt.door,
        rx: 4
      });
      add('circle', { cx: x + w / 2 + 4, cy: BASE - 12, r: 1.4, fill: '#fde68a' });
    }
    if (opt.awning) {
      add('polygon', {
        points: (x - 3) + ',' + (y + 30) + ' ' + (x + w / 2) + ',' + (y + 16) + ' ' + (x + w + 3) + ',' + (y + 30),
        fill: opt.awning
      });
      add('rect', { x: x - 3, y: y + 28, width: w + 6, height: 6, fill: opt.awning });
    }
    if (opt.box) {
      add('rect', { x: x + 8, y: BASE - 40, width: w - 16, height: 6, fill: '#65a30d', rx: 2 });
    }
    if (opt.escape) {
      add('rect', {
        x: x + w - 16,
        y: y + 18,
        width: 12,
        height: h - 28,
        fill: 'none',
        stroke: '#94a3b8',
        'stroke-width': 1.6
      });
      for (let i = 0; i < 4; i += 1) {
        add('rect', { x: x + w - 16, y: y + 28 + i * 22, width: 12, height: 2, fill: '#94a3b8' });
      }
    }
  }

  function tree(cx, leaf) {
    add('rect', { x: cx - 3, y: BASE - 20, width: 6, height: 20, fill: '#92400e', rx: 2 });
    add('circle', { cx: cx - 7, cy: BASE - 28, r: 11, fill: '#16a34a' });
    add('circle', { cx: cx + 7, cy: BASE - 26, r: 10, fill: '#22c55e' });
    add('circle', { cx: cx, cy: BASE - 36, r: 12, fill: leaf || '#4ade80' });
  }

  function bush(cx, fill) {
    add('ellipse', { cx: cx, cy: BASE - 8, rx: 14, ry: 10, fill: fill || '#22c55e' });
    add('ellipse', { cx: cx + 8, cy: BASE - 10, rx: 10, ry: 8, fill: '#4ade80' });
  }

  function paintFar(colors) {
    let x = -16;
    colors.forEach((c, i) => {
      const w = 78 + (i % 4) * 14;
      const h = 48 + ((i * 23) % 40);
      add('rect', { x: x, y: BASE - h, width: w, height: h, fill: c, opacity: '0.45', rx: 3 });
      x += w - 12;
    });
  }

  function drawCity(index) {
    if (!cityArt) return;
    const city = CITIES[index] || CITIES[0];
    const look = city.look;
    cityArt.replaceChildren();
    pad.setAttribute('data-look', look);

    const far = {
      alley: ['#ddd6fe', '#e9d5ff', '#c4b5fd', '#f5d0fe'],
      neon: ['#a5f3fc', '#fbcfe8', '#fde68a', '#c4b5fd'],
      towers: ['#bfdbfe', '#c7d2fe', '#e0e7ff', '#dbeafe'],
      row: ['#fecaca', '#fed7aa', '#fecdd3', '#fde68a'],
      ware: ['#bae6fd', '#99f6e4', '#e2e8f0', '#7dd3fc'],
      fog: ['#cbd5e1', '#e2e8f0', '#94a3b8', '#dbeafe'],
      glass: ['#ddd6fe', '#c4b5fd', '#e9d5ff', '#bfdbfe'],
      park: ['#bbf7d0', '#86efac', '#d9f99d', '#a7f3d0'],
      bridge: ['#cbd5e1', '#94a3b8', '#bfdbfe', '#e2e8f0'],
      market: ['#fdba74', '#fca5a5', '#fde68a', '#f9a8d4'],
      radio: ['#c7d2fe', '#ddd6fe', '#a5b4fc', '#e0e7ff'],
      train: ['#fecaca', '#e2e8f0', '#cbd5e1', '#fda4af'],
      gold: ['#fde68a', '#fdba74', '#fcd34d', '#fed7aa'],
      storm: ['#bae6fd', '#cbd5e1', '#99f6e4', '#e0f2fe'],
      homes: ['#bbf7d0', '#fde68a', '#fecdd3', '#bfdbfe']
    };
    paintFar(far[look] || far.alley);

    if (look === 'alley') {
      bldg(8, 58, 118, '#c4b5fd', { cols: 2, roof: 'peak', roofFill: '#a78bfa', door: '#5b21b6', box: true });
      bldg(72, 64, 148, '#a78bfa', { cols: 2, roof: 'cap', roofFill: '#7c3aed', escape: true, door: '#4c1d95' });
      bldg(142, 52, 102, '#f0abfc', { cols: 2, roof: 'peak', roofFill: '#db2777', door: '#9d174d', box: true });
      bldg(202, 78, 160, '#818cf8', { cols: 3, roof: 'cap', roofFill: '#4f46e5', escape: true });
      bldg(288, 56, 112, '#e9d5ff', { cols: 2, roof: 'peak', roofFill: '#c084fc', door: '#6b21a8', box: true });
      bldg(352, 70, 138, '#c084fc', { cols: 2, roof: 'cap', roofFill: '#7e22ce', escape: true });
      bldg(430, 50, 96, '#f5d0fe', { cols: 2, roof: 'peak', roofFill: '#e879f9', door: '#86198f', box: true });
      bldg(490, 74, 154, '#a78bfa', { cols: 3, roof: 'cap', roofFill: '#6d28d9' });
      bldg(572, 58, 120, '#ddd6fe', { cols: 2, roof: 'peak', roofFill: '#8b5cf6', door: '#5b21b6', box: true });
      bldg(640, 66, 142, '#c4b5fd', { cols: 2, roof: 'cap', roofFill: '#7c3aed', escape: true });
      bldg(716, 54, 108, '#f0abfc', { cols: 2, roof: 'peak', roofFill: '#d946ef', door: '#86198f' });
      add('line', { x1: 90, y1: 70, x2: 160, y2: 78, stroke: '#fde68a', 'stroke-width': 1.4 });
      add('line', { x1: 300, y1: 64, x2: 370, y2: 72, stroke: '#fbcfe8', 'stroke-width': 1.4 });
    } else if (look === 'neon') {
      bldg(6, 36, 150, '#22d3ee', { cols: 1, roof: 'cap', roofFill: '#0891b2', win: '#ecfeff' });
      bldg(48, 42, 168, '#f472b6', { cols: 1, roof: 'cap', roofFill: '#db2777', win: '#fdf2f8' });
      bldg(96, 38, 132, '#a78bfa', { cols: 1, roof: 'cap', roofFill: '#6d28d9' });
      bldg(142, 48, 158, '#facc15', { cols: 2, roof: 'cap', roofFill: '#ca8a04', win: '#fffbeb' });
      bldg(198, 36, 140, '#38bdf8', { cols: 1, roof: 'cap', roofFill: '#0284c7' });
      bldg(242, 44, 172, '#fb7185', { cols: 1, roof: 'cap', roofFill: '#e11d48' });
      bldg(520, 40, 146, '#2dd4bf', { cols: 1, roof: 'cap', roofFill: '#0f766e' });
      bldg(568, 46, 164, '#e879f9', { cols: 1, roof: 'cap', roofFill: '#a21caf' });
      bldg(622, 38, 128, '#60a5fa', { cols: 1, roof: 'cap', roofFill: '#2563eb' });
      bldg(668, 50, 156, '#f472b6', { cols: 2, roof: 'cap', roofFill: '#be185d' });
      bldg(726, 42, 138, '#22d3ee', { cols: 1, roof: 'cap', roofFill: '#0e7490' });
      const cx = 400;
      const cy = 92;
      const r = 58;
      add('line', { x1: cx, y1: BASE, x2: cx, y2: cy + r, stroke: '#64748b', 'stroke-width': 5 });
      add('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: '#f472b6', 'stroke-width': 5 });
      add('circle', { cx: cx, cy: cy, r: r * 0.52, fill: 'none', stroke: '#22d3ee', 'stroke-width': 3 });
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2;
        add('line', {
          x1: cx, y1: cy, x2: cx + Math.cos(a) * r, y2: cy + Math.sin(a) * r,
          stroke: '#a78bfa', 'stroke-width': 2
        });
        add('circle', {
          cx: cx + Math.cos(a) * r, cy: cy + Math.sin(a) * r, r: 7,
          fill: i % 2 ? '#facc15' : '#fb7185'
        });
      }
    } else if (look === 'towers') {
      bldg(20, 52, 168, '#93c5fd', { cols: 2, roof: 'cap', roofFill: '#1d4ed8', win: '#eff6ff' });
      bldg(88, 44, 150, '#bfdbfe', { cols: 2, roof: 'cap', roofFill: '#2563eb' });
      tree(150, '#86efac');
      bldg(168, 70, 184, '#60a5fa', { cols: 3, roof: 'cap', roofFill: '#1e3a8a', win: '#dbeafe' });
      bldg(256, 48, 142, '#93c5fd', { cols: 2, roof: 'cap', roofFill: '#1d4ed8' });
      tree(322, '#4ade80');
      bldg(340, 64, 176, '#7dd3fc', { cols: 3, roof: 'cap', roofFill: '#0369a1' });
      bldg(422, 50, 154, '#bfdbfe', { cols: 2, roof: 'cap', roofFill: '#1d4ed8' });
      tree(488, '#22c55e');
      bldg(508, 72, 188, '#38bdf8', { cols: 3, roof: 'cap', roofFill: '#0c4a6e', win: '#e0f2fe' });
      bldg(598, 46, 138, '#93c5fd', { cols: 2, roof: 'cap', roofFill: '#1e40af' });
      bldg(662, 58, 162, '#60a5fa', { cols: 2, roof: 'cap', roofFill: '#1d4ed8' });
      bldg(738, 42, 146, '#bfdbfe', { cols: 2, roof: 'cap', roofFill: '#2563eb' });
    } else if (look === 'row') {
      const row = [
        ['#fb7185', '#be123c'], ['#fdba74', '#c2410c'], ['#fde68a', '#b45309'],
        ['#fda4af', '#9f1239'], ['#fed7aa', '#9a3412'], ['#fecaca', '#b91c1c'],
        ['#fcd34d', '#a16207'], ['#fecdd3', '#be123c'], ['#fdba74', '#c2410c'],
        ['#fbcfe8', '#9d174d'], ['#fef08a', '#a16207']
      ];
      row.forEach((pair, i) => {
        bldg(6 + i * 72, 66, 92 + (i % 3) * 8, pair[0], {
          cols: 2, roof: 'peak', roofFill: pair[1], door: '#44403c', chimney: true, box: true
        });
      });
    } else if (look === 'ware') {
      add('rect', { x: 0, y: BASE - 16, width: 800, height: 16, fill: '#38bdf8', opacity: '0.55' });
      add('rect', { x: 0, y: BASE - 8, width: 800, height: 8, fill: '#0ea5e9', opacity: '0.28' });
      bldg(8, 110, 78, '#94a3b8', { cols: 4, rows: 2, roof: 'barn', roofFill: '#334155', win: '#e2e8f0' });
      bldg(130, 130, 64, '#cbd5e1', { cols: 5, rows: 1, roof: 'barn', roofFill: '#475569' });
      bldg(274, 96, 86, '#7dd3fc', { cols: 3, rows: 2, roof: 'cap', roofFill: '#0369a1' });
      bldg(384, 120, 70, '#94a3b8', { cols: 4, rows: 2, roof: 'barn', roofFill: '#1e293b' });
      bldg(518, 88, 80, '#67e8f9', { cols: 3, rows: 2, roof: 'cap', roofFill: '#0e7490' });
      add('rect', { x: 640, y: 70, width: 10, height: 130, fill: '#64748b' });
      add('rect', { x: 610, y: 70, width: 120, height: 8, fill: '#475569' });
      add('rect', { x: 700, y: 78, width: 8, height: 40, fill: '#94a3b8' });
      add('polygon', { points: '40,184 70,176 110,184 90,192 50,192', fill: '#1e293b' });
      add('polygon', { points: '210,184 250,174 300,184 270,192 220,192', fill: '#334155' });
    } else if (look === 'fog') {
      add('rect', { x: 0, y: BASE - 18, width: 800, height: 18, fill: '#7dd3fc', opacity: '0.4' });
      bldg(10, 80, 88, '#cbd5e1', { cols: 3, roof: 'cap', roofFill: '#64748b', win: '#f8fafc' });
      bldg(100, 70, 72, '#e2e8f0', { cols: 2, roof: 'peak', roofFill: '#94a3b8' });
      bldg(184, 96, 96, '#94a3b8', { cols: 3, roof: 'cap', roofFill: '#475569' });
      bldg(296, 64, 80, '#cbd5e1', { cols: 2, roof: 'peak', roofFill: '#64748b' });
      bldg(376, 88, 70, '#e2e8f0', { cols: 3, roof: 'cap', roofFill: '#94a3b8' });
      bldg(478, 74, 90, '#cbd5e1', { cols: 2, roof: 'peak', roofFill: '#64748b' });
      add('rect', { x: 620, y: 48, width: 26, height: 152, fill: '#f8fafc', rx: 3 });
      add('rect', { x: 614, y: 36, width: 38, height: 18, fill: '#ef4444', rx: 2 });
      add('polygon', { points: '620,36 633,12 646,36', fill: '#fbbf24' });
      add('rect', { x: 626, y: 54, width: 14, height: 12, fill: '#fde68a' });
      add('ellipse', { cx: 120, cy: 190, rx: 28, ry: 8, fill: '#1e293b', opacity: '0.35' });
      add('polygon', { points: '96,190 120,164 150,190', fill: '#f8fafc' });
      add('rect', { x: 0, y: 40, width: 800, height: 90, fill: '#e2e8f0', opacity: '0.28' });
    } else if (look === 'glass') {
      bldg(12, 46, 176, '#c4b5fd', { cols: 2, roof: 'cap', roofFill: '#5b21b6', win: '#ede9fe' });
      bldg(68, 58, 190, '#a78bfa', { cols: 2, roof: 'cap', roofFill: '#4c1d95', win: '#f5f3ff' });
      bldg(138, 40, 150, '#ddd6fe', { cols: 2, roof: 'cap', roofFill: '#6d28d9' });
      bldg(190, 72, 184, '#8b5cf6', { cols: 3, roof: 'cap', roofFill: '#4c1d95', win: '#ede9fe' });
      bldg(276, 48, 162, '#c4b5fd', { cols: 2, roof: 'cap', roofFill: '#5b21b6' });
      bldg(336, 64, 192, '#7c3aed', { cols: 3, roof: 'cap', roofFill: '#3b0764', win: '#f5f3ff' });
      bldg(414, 44, 146, '#ddd6fe', { cols: 2, roof: 'cap', roofFill: '#6d28d9' });
      bldg(470, 70, 178, '#a78bfa', { cols: 3, roof: 'cap', roofFill: '#4c1d95' });
      bldg(554, 50, 158, '#c4b5fd', { cols: 2, roof: 'cap', roofFill: '#5b21b6' });
      bldg(616, 66, 186, '#8b5cf6', { cols: 3, roof: 'cap', roofFill: '#4c1d95' });
      bldg(696, 46, 154, '#ddd6fe', { cols: 2, roof: 'cap', roofFill: '#6d28d9' });
      bldg(752, 40, 168, '#a78bfa', { cols: 2, roof: 'cap', roofFill: '#5b21b6' });
    } else if (look === 'park') {
      bldg(16, 48, 78, '#86efac', { cols: 2, roof: 'peak', roofFill: '#15803d', door: '#14532d' });
      tree(80, '#4ade80');
      tree(108, '#22c55e');
      bldg(130, 56, 90, '#bbf7d0', { cols: 2, roof: 'peak', roofFill: '#166534', door: '#14532d', box: true });
      tree(204, '#86efac');
      add('rect', { x: 230, y: 70, width: 22, height: 30, fill: '#94a3b8', rx: 2 });
      add('ellipse', { cx: 241, cy: 70, rx: 28, ry: 10, fill: '#64748b' });
      add('rect', { x: 248, y: 40, width: 8, height: 34, fill: '#475569' });
      tree(280, '#16a34a');
      bldg(304, 62, 84, '#4ade80', { cols: 2, roof: 'peak', roofFill: '#15803d', door: '#14532d' });
      tree(384, '#4ade80');
      tree(416, '#22c55e');
      tree(448, '#86efac');
      bldg(470, 54, 76, '#bbf7d0', { cols: 2, roof: 'peak', roofFill: '#166534', box: true });
      tree(542, '#22c55e');
      bldg(566, 70, 98, '#86efac', { cols: 3, roof: 'peak', roofFill: '#15803d', door: '#14532d' });
      tree(656, '#4ade80');
      tree(688, '#16a34a');
      bldg(712, 58, 82, '#bbf7d0', { cols: 2, roof: 'peak', roofFill: '#166534' });
      bush(96);
      bush(400);
      bush(640);
    } else if (look === 'bridge') {
      bldg(8, 50, 70, '#cbd5e1', { cols: 2, roof: 'peak', roofFill: '#475569' });
      bldg(66, 44, 58, '#94a3b8', { cols: 2, roof: 'cap', roofFill: '#334155' });
      bldg(690, 48, 64, '#cbd5e1', { cols: 2, roof: 'peak', roofFill: '#475569' });
      bldg(746, 42, 72, '#94a3b8', { cols: 2, roof: 'cap', roofFill: '#334155' });
      add('rect', { x: 70, y: 36, width: 16, height: 164, fill: '#64748b', rx: 2 });
      add('rect', { x: 714, y: 36, width: 16, height: 164, fill: '#64748b', rx: 2 });
      add('rect', { x: 62, y: 30, width: 32, height: 12, fill: '#334155', rx: 2 });
      add('rect', { x: 706, y: 30, width: 32, height: 12, fill: '#334155', rx: 2 });
      add('path', { d: 'M78 44 Q 400 8 722 44', fill: 'none', stroke: '#334155', 'stroke-width': 6 });
      add('path', { d: 'M86 150 Q 400 70 714 150', fill: 'none', stroke: '#64748b', 'stroke-width': 10 });
      add('rect', { x: 40, y: 146, width: 720, height: 10, fill: '#475569', rx: 2 });
      for (let i = 0; i < 9; i += 1) {
        const x = 110 + i * 66;
        add('line', { x1: x, y1: 48 + Math.abs(i - 4) * 4, x2: x, y2: 150, stroke: '#94a3b8', 'stroke-width': 2 });
      }
    } else if (look === 'market') {
      const stalls = [
        [8, '#fb7185', '#be123c'], [86, '#f97316', '#c2410c'], [164, '#facc15', '#ca8a04'],
        [242, '#34d399', '#047857'], [320, '#38bdf8', '#0369a1'], [398, '#a78bfa', '#6d28d9'],
        [476, '#f472b6', '#be185d'], [554, '#fbbf24', '#b45309'], [632, '#fb7185', '#9f1239'],
        [710, '#22d3ee', '#0e7490']
      ];
      stalls.forEach((s) => {
        bldg(s[0], 70, 68, '#fff7ed', {
          cols: 2, rows: 1, roof: 'peak', roofFill: s[1], awning: s[1], door: s[2]
        });
      });
      add('circle', { cx: 50, cy: 92, r: 5, fill: '#fde68a' });
      add('circle', { cx: 210, cy: 86, r: 5, fill: '#fecdd3' });
      add('circle', { cx: 430, cy: 90, r: 5, fill: '#fde68a' });
      add('circle', { cx: 650, cy: 84, r: 5, fill: '#fbcfe8' });
    } else if (look === 'radio') {
      add('ellipse', { cx: 400, cy: BASE + 8, rx: 260, ry: 36, fill: '#86efac', opacity: '0.55' });
      bldg(40, 54, 70, '#c7d2fe', { cols: 2, roof: 'peak', roofFill: '#4f46e5', door: '#312e81' });
      bldg(108, 48, 62, '#ddd6fe', { cols: 2, roof: 'peak', roofFill: '#6d28d9', door: '#4c1d95' });
      bldg(620, 52, 66, '#a5b4fc', { cols: 2, roof: 'peak', roofFill: '#4338ca', door: '#312e81' });
      bldg(688, 58, 74, '#c7d2fe', { cols: 2, roof: 'peak', roofFill: '#4f46e5', door: '#312e81' });
      add('line', { x1: 360, y1: BASE, x2: 400, y2: 18, stroke: '#64748b', 'stroke-width': 5 });
      add('line', { x1: 440, y1: BASE, x2: 400, y2: 18, stroke: '#64748b', 'stroke-width': 5 });
      add('line', { x1: 372, y1: 150, x2: 428, y2: 150, stroke: '#94a3b8', 'stroke-width': 3 });
      add('line', { x1: 380, y1: 110, x2: 420, y2: 110, stroke: '#94a3b8', 'stroke-width': 3 });
      add('line', { x1: 388, y1: 70, x2: 412, y2: 70, stroke: '#94a3b8', 'stroke-width': 3 });
      add('circle', { cx: 400, cy: 28, r: 10, fill: '#f87171' });
      add('circle', { cx: 400, cy: 28, r: 22, fill: 'none', stroke: '#818cf8', 'stroke-width': 2, opacity: '0.7' });
      add('circle', { cx: 400, cy: 28, r: 34, fill: 'none', stroke: '#a78bfa', 'stroke-width': 2, opacity: '0.45' });
      tree(200, '#4ade80');
      tree(560, '#22c55e');
    } else if (look === 'train') {
      bldg(16, 70, 86, '#fca5a5', { cols: 2, roof: 'cap', roofFill: '#b91c1c' });
      bldg(96, 54, 72, '#fecaca', { cols: 2, roof: 'peak', roofFill: '#9f1239' });
      add('rect', { x: 180, y: 70, width: 440, height: 16, fill: '#334155', rx: 3 });
      add('rect', { x: 190, y: 50, width: 14, height: 36, fill: '#64748b' });
      add('rect', { x: 596, y: 50, width: 14, height: 36, fill: '#64748b' });
      add('rect', { x: 360, y: 18, width: 80, height: 64, fill: '#f87171', rx: 4 });
      add('circle', { cx: 400, cy: 46, r: 16, fill: '#fff7ed' });
      add('line', { x1: 400, y1: 46, x2: 400, y2: 34, stroke: '#1f2937', 'stroke-width': 2 });
      add('line', { x1: 400, y1: 46, x2: 410, y2: 46, stroke: '#1f2937', 'stroke-width': 2 });
      add('rect', { x: 40, y: 168, width: 720, height: 8, fill: '#334155' });
      [[80, '#ef4444'], [210, '#f8fafc'], [340, '#f8fafc'], [470, '#f8fafc'], [600, '#1d4ed8']].forEach((car) => {
        add('rect', { x: car[0], y: 138, width: 118, height: 34, fill: car[1], rx: 6 });
        add('rect', { x: car[0] + 10, y: 146, width: 22, height: 12, fill: '#7dd3fc', rx: 2 });
        add('rect', { x: car[0] + 40, y: 146, width: 22, height: 12, fill: '#7dd3fc', rx: 2 });
        add('rect', { x: car[0] + 70, y: 146, width: 22, height: 12, fill: '#7dd3fc', rx: 2 });
        add('circle', { cx: car[0] + 22, cy: 174, r: 6, fill: '#1f2937' });
        add('circle', { cx: car[0] + 96, cy: 174, r: 6, fill: '#1f2937' });
      });
      bldg(680, 52, 78, '#fecaca', { cols: 2, roof: 'peak', roofFill: '#b91c1c' });
      bldg(740, 48, 66, '#fca5a5', { cols: 2, roof: 'cap', roofFill: '#9f1239' });
    } else if (look === 'gold') {
      bldg(10, 60, 110, '#fbbf24', { cols: 2, roof: 'peak', roofFill: '#b45309', door: '#7c2d12', chimney: true });
      bldg(78, 72, 148, '#f59e0b', { cols: 3, roof: 'cap', roofFill: '#92400e', win: '#fffbeb' });
      bldg(160, 54, 98, '#fdba74', { cols: 2, roof: 'peak', roofFill: '#c2410c', door: '#7c2d12' });
      bldg(224, 80, 166, '#f59e0b', { cols: 3, roof: 'cap', roofFill: '#78350f', win: '#fffbeb' });
      bldg(314, 58, 120, '#fcd34d', { cols: 2, roof: 'peak', roofFill: '#b45309', chimney: true });
      bldg(382, 70, 154, '#fb923c', { cols: 3, roof: 'cap', roofFill: '#9a3412' });
      bldg(462, 52, 104, '#fde68a', { cols: 2, roof: 'peak', roofFill: '#ca8a04', door: '#78350f' });
      bldg(524, 76, 170, '#f59e0b', { cols: 3, roof: 'cap', roofFill: '#92400e', win: '#fffbeb' });
      bldg(610, 56, 118, '#fdba74', { cols: 2, roof: 'peak', roofFill: '#c2410c', chimney: true });
      bldg(676, 68, 142, '#fbbf24', { cols: 2, roof: 'cap', roofFill: '#b45309' });
      bldg(754, 40, 96, '#fcd34d', { cols: 1, roof: 'peak', roofFill: '#a16207' });
    } else if (look === 'storm') {
      bldg(8, 48, 130, '#67e8f9', { cols: 2, roof: 'cap', roofFill: '#155e75', win: '#ecfeff' });
      bldg(64, 62, 158, '#22d3ee', { cols: 2, roof: 'cap', roofFill: '#164e63' });
      bldg(136, 44, 118, '#a5f3fc', { cols: 2, roof: 'peak', roofFill: '#0e7490' });
      bldg(190, 70, 172, '#0891b2', { cols: 3, roof: 'cap', roofFill: '#164e63', win: '#cffafe' });
      bldg(272, 50, 140, '#67e8f9', { cols: 2, roof: 'cap', roofFill: '#155e75' });
      bldg(334, 58, 124, '#22d3ee', { cols: 2, roof: 'peak', roofFill: '#0e7490' });
      bldg(404, 76, 180, '#0e7490', { cols: 3, roof: 'cap', roofFill: '#083344', win: '#ecfeff' });
      bldg(492, 48, 136, '#67e8f9', { cols: 2, roof: 'cap', roofFill: '#155e75' });
      bldg(550, 64, 160, '#22d3ee', { cols: 2, roof: 'cap', roofFill: '#164e63' });
      bldg(626, 52, 122, '#a5f3fc', { cols: 2, roof: 'peak', roofFill: '#0e7490' });
      bldg(688, 68, 150, '#0891b2', { cols: 3, roof: 'cap', roofFill: '#164e63' });
      add('ellipse', { cx: 160, cy: BASE - 4, rx: 28, ry: 6, fill: '#38bdf8', opacity: '0.55' });
      add('ellipse', { cx: 520, cy: BASE - 4, rx: 36, ry: 6, fill: '#22d3ee', opacity: '0.45' });
      tree(250, '#155e75');
      tree(600, '#164e63');
    } else {
      const houses = [
        [8, '#fda4af', '#be123c'], [88, '#fde68a', '#ca8a04'], [168, '#86efac', '#15803d'],
        [248, '#93c5fd', '#1d4ed8'], [328, '#fbcfe8', '#be185d'], [408, '#fdba74', '#c2410c'],
        [488, '#a7f3d0', '#047857'], [568, '#c4b5fd', '#6d28d9'], [648, '#fecaca', '#b91c1c'],
        [728, '#fef08a', '#a16207']
      ];
      houses.forEach((h) => {
        bldg(h[0], 68, 74, '#fff7ed', {
          cols: 2, rows: 1, roof: 'peak', roofFill: h[1], door: h[2], chimney: true, box: true
        });
        bush(h[0] + 14, h[1]);
      });
    }

    if (cityNameEl) cityNameEl.textContent = city.name;
    if (cityHud) cityHud.textContent = (index + 1) + ' / 15';
    pad.style.setProperty('--green-tint', city.tint || '#c4b5fd');
  }

  function getAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function tone(ctx, freq, start, dur, gainVal, type) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainVal, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  function playGo() {
    try {
      const ctx = getAudio();
      if (!ctx) return;
      tone(ctx, 880, ctx.currentTime, 0.08, 0.06, 'square');
    } catch {
      // optional
    }
  }

  function playHit() {
    try {
      const ctx = getAudio();
      if (!ctx) return;
      const t = ctx.currentTime;
      tone(ctx, 784, t, 0.08, 0.05);
      tone(ctx, 1175, t + 0.05, 0.1, 0.05);
    } catch {
      // optional
    }
  }

  function playEarly() {
    try {
      const ctx = getAudio();
      if (!ctx) return;
      tone(ctx, 180, ctx.currentTime, 0.22, 0.07, 'sawtooth');
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
      tone(ctx, 988, t + 0.16, 0.18, 0.07);
    } catch {
      // optional
    }
  }

  function flavor(ms) {
    if (ms <= 180) return 'Whoa.';
    if (ms <= 230) return 'Clean.';
    if (ms <= 300) return 'Nice dash.';
    if (ms <= 400) return 'He made it.';
    return 'Sleepy, but home.';
  }

  function rateRun(avg) {
    if (avg <= 180) return { stars: 5, title: 'Unreal hands.', grade: 'The light is a little scared of you.' };
    if (avg <= 220) return { stars: 5, title: 'Lightning.', grade: 'That was rude to the stopwatch.' };
    if (avg <= 270) return { stars: 4, title: 'Quick.', grade: 'Clean reactions. The green barely existed.' };
    if (avg <= 330) return { stars: 3, title: 'Solid run.', grade: 'You waited, then you hit. That’s the whole sport.' };
    if (avg <= 420) return { stars: 2, title: 'You got there.', grade: 'A little late, still five greens.' };
    return { stars: 1, title: 'They went green.', grade: 'The light waited. You arrived. It counts.' };
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

  function currentCity() {
    return CITIES[cityIndex] || CITIES[0];
  }

  function updateHud() {
    if (roundEl) roundEl.textContent = Math.min(round + 1, ROUNDS) + ' / ' + ROUNDS;
    if (cityHud) cityHud.textContent = (cityIndex + 1) + ' / 15';
    if (runnerEl) runnerEl.style.setProperty('--green-step', String(round));
    const pips = document.querySelectorAll('#greenPips i');
    pips.forEach((el, i) => {
      el.classList.toggle('is-done', i < round);
      el.classList.toggle('is-now', i === round);
    });
    updateLives();
  }

  function hideOverlay() {
    if (overlay) overlay.hidden = true;
  }

  function showOverlay(early) {
    if (!overlay) return;
    const city = currentCity();
    if (early) {
      const fails = loadFails() + 1;
      saveFails(fails);
      updateLives();
      playEarly();
      if (fails >= 3) {
        overlayMode = 'reset';
        resetTour();
        cityIndex = 0;
        if (overlayEye) overlayEye.textContent = 'Three strikes';
        if (overlayTitle) overlayTitle.textContent = 'Back to city 1.';
        if (overlayText) overlayText.textContent = 'Three losses. The tour restarts in Dusk Alley.';
        if (overlayStats) overlayStats.textContent = '';
        if (againBtn) againBtn.textContent = 'Start over';
      } else {
        overlayMode = 'fail';
        if (overlayEye) overlayEye.textContent = 'False start';
        if (overlayTitle) overlayTitle.textContent = 'Too soon.';
        if (overlayText) {
          overlayText.textContent = times.length
            ? 'You made ' + times.length + ' of 5 in ' + city.name + '.'
            : 'The light in ' + city.name + ' saw him sneak.';
        }
        if (overlayStats) {
          const left = 3 - fails;
          overlayStats.textContent = (times.length ? 'Last good tap ' + formatMs(times[times.length - 1]) + ' · ' : '') + left + (left === 1 ? ' chance left' : ' chances left');
        }
        if (againBtn) againBtn.textContent = 'Retry city';
      }
      renderStars(0);
    } else {
      const avg = average(times);
      const bestSingle = Math.min.apply(null, times);
      const isBest = saveBest(avg);
      const rating = rateRun(avg);
      playWin();
      const lastCity = cityIndex >= CITIES.length - 1;
      overlayMode = lastCity ? 'win-all' : 'win';
      saveFails(0);
      saveCity(Math.min(14, cityIndex + 1));
      if (overlayEye) overlayEye.textContent = lastCity ? 'All 15 cities' : (isBest ? 'New best' : city.name);
      if (overlayTitle) overlayTitle.textContent = lastCity ? 'He’s home for good.' : rating.title;
      if (overlayText) {
        overlayText.textContent = lastCity
          ? 'Fifteen cities. Five greens each. The lion can sit down now.'
          : rating.grade + ' Next stop: ' + CITIES[cityIndex + 1].name + '.';
      }
      if (overlayStats) overlayStats.textContent = 'Avg ' + formatMs(avg) + ' · fastest ' + formatMs(bestSingle);
      if (againBtn) againBtn.textContent = lastCity ? 'Play city 1 again' : 'Next city';
      renderStars(rating.stars);
    }
    overlay.hidden = false;
    if (againBtn) againBtn.focus();
  }

  function setStage(kind, label) {
    pad.className = 'green-stage is-' + kind;
    if (callEl) callEl.textContent = label;
    pad.setAttribute('aria-label', kind === 'go' ? 'Green. Tap now.' : kind === 'wait' ? 'Wait. Do not tap.' : label);
  }

  function goGreen() {
    pad.classList.remove('is-tease');
    state = 'go';
    goAt = performance.now();
    setStage('go', 'GO!');
    playGo();
    say('Green. Tap now.');
  }

  function arm() {
    window.clearTimeout(timer);
    window.clearTimeout(afterTimer);
    hideOverlay();
    state = 'wait';
    setStage('wait', 'WAIT');
    if (hintEl) hintEl.textContent = 'Freeze. Get him from the stoop to the house.';
    updateHud();
    say(currentCity().name + '. Light ' + (round + 1) + ' of ' + ROUNDS + '. Wait for green.');

    const delay = 1000 + Math.floor(Math.random() * 2600);
    const tease = Math.random() < 0.35;

    if (tease && !reduceMotion) {
      const teaseAt = Math.max(400, Math.floor(delay * 0.45));
      timer = window.setTimeout(() => {
        pad.classList.add('is-tease');
        afterTimer = window.setTimeout(() => {
          pad.classList.remove('is-tease');
          timer = window.setTimeout(goGreen, delay - teaseAt);
        }, 220);
      }, teaseAt);
    } else {
      timer = window.setTimeout(goGreen, delay);
    }
  }

  function startCity(index) {
    window.clearTimeout(timer);
    window.clearTimeout(afterTimer);
    cityIndex = Math.max(0, Math.min(CITIES.length - 1, index));
    state = 'idle';
    round = 0;
    times = [];
    if (lastEl) lastEl.textContent = '—';
    if (runnerEl) {
      runnerEl.classList.remove('is-caught', 'is-dash');
      runnerEl.style.transform = '';
      runnerEl.style.setProperty('--green-step', '0');
    }
    loadBest();
    hideOverlay();
    drawCity(cityIndex);
    startScreen.hidden = true;
    if (citiesScreen) citiesScreen.hidden = true;
    playScreen.hidden = false;
    playScreen.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    arm();
  }

  function nextOrFinish() {
    if (round >= ROUNDS) {
      state = 'idle';
      setStage('done', 'HOME');
      if (hintEl) hintEl.textContent = 'He made it to the house in ' + currentCity().name + '.';
      showOverlay(false);
      say(currentCity().name + ' clear.');
      return;
    }
    afterTimer = window.setTimeout(arm, reduceMotion ? 200 : 650);
  }

  pad.addEventListener('click', () => {
    getAudio();
    if (state === 'wait') {
      window.clearTimeout(timer);
      window.clearTimeout(afterTimer);
      state = 'idle';
      setStage('early', 'CAUGHT');
      if (runnerEl) runnerEl.classList.add('is-caught');
      if (hintEl) hintEl.textContent = 'He left the stoop on red.';
      showOverlay(true);
      say('Too soon.');
      return;
    }
    if (state !== 'go') return;

    const ms = Math.max(1, Math.round(performance.now() - goAt));
    times.push(ms);
    if (lastEl) lastEl.textContent = formatMs(ms);
    playHit();
    setStage('hit', formatMs(ms));
    if (hintEl) hintEl.textContent = flavor(ms);
    if (runnerEl) {
      runnerEl.classList.remove('is-dash');
      void runnerEl.offsetWidth;
      runnerEl.classList.add('is-dash');
    }
    state = 'idle';
    round += 1;
    updateHud();
    say(formatMs(ms) + '. ' + flavor(ms) + ' Light ' + round + ' of ' + ROUNDS + '.');
    nextOrFinish();
  });

  function renderCitySelect() {
    if (!cityGrid) return;
    const unlocked = loadCity();
    cityGrid.textContent = '';
    updateLives();
    CITIES.forEach((city, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'green-city-pick';
      btn.setAttribute('role', 'listitem');
      btn.style.setProperty('--tint', city.tint);
      const art = document.createElement('span');
      art.className = 'green-city-pick__art';
      art.setAttribute('aria-hidden', 'true');
      const num = document.createElement('span');
      num.className = 'green-city-pick__num';
      num.textContent = String(i + 1);
      const name = document.createElement('span');
      name.className = 'green-city-pick__name';
      name.textContent = city.name;
      btn.appendChild(art);
      btn.appendChild(num);
      btn.appendChild(name);
      if (i > unlocked) {
        btn.disabled = true;
        btn.classList.add('is-locked');
        btn.setAttribute('aria-label', city.name + ', locked');
      } else {
        if (i < unlocked) btn.classList.add('is-cleared');
        else btn.classList.add('is-current');
        btn.setAttribute('aria-label', 'Play ' + city.name);
        btn.addEventListener('click', () => {
          getAudio();
          startCity(i);
        });
      }
      cityGrid.appendChild(btn);
    });
    if (continueBtn) {
      continueBtn.textContent = 'Continue ' + CITIES[Math.min(14, unlocked)].name;
    }
  }

  function openCities() {
    window.clearTimeout(timer);
    window.clearTimeout(afterTimer);
    hideOverlay();
    renderCitySelect();
    startScreen.hidden = true;
    playScreen.hidden = true;
    if (citiesScreen) citiesScreen.hidden = false;
  }

  startBtn.addEventListener('click', () => {
    getAudio();
    openCities();
  });
  if (backStoryBtn) {
    backStoryBtn.addEventListener('click', () => {
      if (citiesScreen) citiesScreen.hidden = true;
      startScreen.hidden = false;
    });
  }
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      getAudio();
      startCity(loadCity());
    });
  }
  if (citiesBtn) {
    citiesBtn.addEventListener('click', () => {
      getAudio();
      openCities();
    });
  }
  if (retryBtn) {
    retryBtn.addEventListener('click', () => startCity(cityIndex));
  }
  if (againBtn) {
    againBtn.addEventListener('click', () => {
      if (overlayMode === 'win') {
        startCity(cityIndex + 1);
        return;
      }
      if (overlayMode === 'win-all') {
        startCity(0);
        return;
      }
      if (overlayMode === 'reset') {
        startCity(0);
        return;
      }
      startCity(cityIndex);
    });
  }

  loadBest();
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('play') === '1') {
      startCity(Number(params.get('city') || 0));
    } else {
      startScreen.hidden = false;
      playScreen.hidden = true;
    }
  } catch {
    startScreen.hidden = false;
    playScreen.hidden = true;
  }
})();
