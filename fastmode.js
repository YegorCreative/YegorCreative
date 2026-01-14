(function initFastMode() {
  'use strict';

  const STORAGE = {
    planStartDate: 'fm_planStartDate',
    omadStart: 'fm_omadStart',
    omadEnd: 'fm_omadEnd',
    lastMealISO: 'fm_lastMealISO',
    showSafety: 'fm_showSafetyNote'
  };

  const DEFAULTS = {
    planStartDate: '2026-01-14',
    omadStart: '17:30',
    omadEnd: '18:30',
    lastMealISO: '',
    showSafety: 'true'
  };

  const $ = (id) => document.getElementById(id);

  let selectedISO = '';

  const readSetting = (key, fallback) => {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined || raw === '') {
      window.localStorage.setItem(key, fallback);
      return fallback;
    }
    return raw;
  };

  const writeSetting = (key, value) => {
    window.localStorage.setItem(key, value);
  };

  const pad2 = (n) => String(n).padStart(2, '0');

  const parseLocalDate = (yyyyMmDd) => {
    // Interpret as local date at midnight.
    const [y, m, d] = (yyyyMmDd || '').split('-').map((v) => Number(v));
    if (!y || !m || !d) {
      return null;
    }
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  };

  const formatMonthDay = (date) => {
    const month = date.toLocaleString(undefined, { month: 'short' });
    return `${month} ${date.getDate()}`;
  };

  const formatISODate = (date) => {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  };

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

  const startOfWeekSunday = (date) => {
    const d = startOfDay(date);
    return addDays(d, -d.getDay());
  };

  const nextMondayAfter = (date) => {
    const d = startOfDay(date);
    let delta = (8 - d.getDay()) % 7;
    if (delta === 0) {
      delta = 7;
    }
    return addDays(d, delta);
  };

  const compareDateOnly = (a, b) => {
    const da = startOfDay(a).getTime();
    const db = startOfDay(b).getTime();
    return da - db;
  };

  const parseTimeToHM = (hhMm) => {
    const [hh, mm] = (hhMm || '').split(':').map((v) => Number(v));
    if (Number.isNaN(hh) || Number.isNaN(mm)) {
      return null;
    }
    return { hh, mm };
  };

  const setTimeOnDate = (date, hhMm) => {
    const hm = parseTimeToHM(hhMm);
    if (!hm) {
      return null;
    }
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hm.hh, hm.mm, 0, 0);
  };

  const msToHHMM = (ms) => {
    const totalMinutes = Math.max(0, Math.floor(ms / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${pad2(hours)}h ${pad2(minutes)}m`;
  };

  const getPlan = () => {
    const planStartDate = readSetting(STORAGE.planStartDate, DEFAULTS.planStartDate);
    const omadStart = readSetting(STORAGE.omadStart, DEFAULTS.omadStart);
    const omadEnd = readSetting(STORAGE.omadEnd, DEFAULTS.omadEnd);
    const lastMealISO = readSetting(STORAGE.lastMealISO, DEFAULTS.lastMealISO);
    const showSafety = readSetting(STORAGE.showSafety, DEFAULTS.showSafety);

    return {
      planStartDate,
      omadStart,
      omadEnd,
      lastMealISO,
      showSafety: showSafety === 'true'
    };
  };

  const getStatusForDate = (date, planStart) => {
    // Default plan: 2 "autophagy weeks" starting the first Monday AFTER planStart's week.
    // Weeks: Mon FAST, Tue FAST, Wed EAT, Thu–Sun OMAD. After 2 weeks -> full OMAD.
    const autophagyStart = nextMondayAfter(planStart);
    const autophagyEndExclusive = addDays(autophagyStart, 14);

    if (compareDateOnly(date, autophagyStart) < 0) {
      return 'OMAD';
    }

    if (compareDateOnly(date, autophagyEndExclusive) >= 0) {
      return 'OMAD';
    }

    const dow = date.getDay();
    if (dow === 1 || dow === 2) {
      return 'FAST';
    }
    if (dow === 3) {
      return 'EAT';
    }
    return 'OMAD';
  };

  const getNextMealTarget = (now, status, planStart, omadStart, omadEnd) => {
    const today = startOfDay(now);
    const start = setTimeOnDate(today, omadStart);
    const end = setTimeOnDate(today, omadEnd);

    if (!start || !end) {
      return { label: 'Time until next meal:', target: null, mode: 'none' };
    }

    if (status === 'FAST') {
      // Count down to the next non-FAST day at omadStart.
      let probe = today;
      for (let i = 0; i < 10; i += 1) {
        const s = getStatusForDate(probe, planStart);
        if (i === 0) {
          // If today is FAST, start searching from tomorrow.
          probe = addDays(probe, 1);
          continue;
        }
        if (s !== 'FAST') {
          const target = setTimeOnDate(probe, omadStart);
          return { label: 'Time until next meal:', target, mode: 'countdown' };
        }
        probe = addDays(probe, 1);
      }
      return { label: 'Time until next meal:', target: null, mode: 'none' };
    }

    if (status === 'EAT') {
      // Show "Eat today" and optionally count to end of window.
      if (now < end) {
        return { label: now < start ? 'Eat today. Meal window starts in:' : 'Eat today. Meal window ends in:', target: now < start ? start : end, mode: 'countdown' };
      }
      return { label: 'Eat today.', target: null, mode: 'static' };
    }

    // OMAD
    if (now < start) {
      return { label: 'Time until next meal:', target: start, mode: 'countdown' };
    }
    if (now <= end) {
      return { label: 'Meal window ends in:', target: end, mode: 'countdown' };
    }

    const tomorrowStart = setTimeOnDate(addDays(today, 1), omadStart);
    return { label: 'Time until next meal:', target: tomorrowStart, mode: 'countdown' };
  };

  const getFastingHours = (lastMealISO, now) => {
    if (!lastMealISO) {
      return null;
    }

    const t = Date.parse(lastMealISO);
    if (Number.isNaN(t)) {
      return null;
    }

    const diffMs = now.getTime() - t;
    if (diffMs < 0) {
      return 0;
    }

    return diffMs / 3600000;
  };

  const getBodyStages = () => ([
    {
      min: 0,
      max: 12,
      title: 'Using stored glucose',
      sentence: 'Early on, your body may rely more on circulating and stored glucose.',
      feels: ['Hunger waves can come and go.', 'Energy may feel normal or slightly low.']
    },
    {
      min: 12,
      max: 24,
      title: 'Fat-burning ramping up',
      sentence: 'Your body may start leaning more on fat as a fuel source.',
      feels: ['You might feel clearer… or a bit foggy.', 'Hydration and electrolytes can matter more.']
    },
    {
      min: 24,
      max: 36,
      title: 'Autophagy increasing',
      sentence: 'Some cellular “cleanup” processes may increase, but responses vary by person.',
      feels: ['Hunger may reduce for some people.', 'Sleep can feel different (better or worse).']
    },
    {
      min: 36,
      max: 48,
      title: 'Deep fasting window',
      sentence: 'This can be a more demanding stretch. Pay attention to how you feel.',
      feels: ['You may feel calm… or drained.', 'Consider taking it easier physically.']
    },
    {
      min: 48,
      max: Infinity,
      title: 'Extended fast zone (be wise)',
      sentence: 'Long fasts can carry more risk. Consider medical guidance if pushing longer.',
      feels: ['If you feel unwell, stop and eat.', 'Don’t ignore dizziness or palpitations.']
    }
  ]);

  const renderHero = (plan, now) => {
    const planStart = parseLocalDate(plan.planStartDate) || parseLocalDate(DEFAULTS.planStartDate);
    const status = getStatusForDate(startOfDay(now), planStart);

    const statusPill = $('fmStatusPill');
    const dayCount = $('fmDayCount');
    const countdown = $('fmCountdown');
    const lastMeal = $('fmLastMeal');

    if (statusPill) {
      statusPill.textContent = status;
    }

    if (dayCount) {
      const diffDays = Math.floor((startOfDay(now).getTime() - planStart.getTime()) / 86400000) + 1;
      const dayNum = Math.max(1, diffDays);
      const clamped = Math.min(dayNum, 28);
      dayCount.textContent = `Day ${clamped} of 28`;
    }

    if (lastMeal) {
      if (plan.lastMealISO) {
        const dt = new Date(plan.lastMealISO);
        if (!Number.isNaN(dt.getTime())) {
          lastMeal.textContent = `Last meal logged: ${dt.toLocaleString()}`;
        } else {
          lastMeal.textContent = '';
        }
      } else {
        lastMeal.textContent = 'Tip: log a meal to personalize fasting phases.';
      }
    }

    const nextTarget = getNextMealTarget(now, status, planStart, plan.omadStart, plan.omadEnd);

    if (countdown) {
      if (!nextTarget.target) {
        countdown.textContent = nextTarget.label;
      } else {
        const ms = nextTarget.target.getTime() - now.getTime();
        countdown.textContent = `${nextTarget.label} ${msToHHMM(ms)}`;
      }
    }

    return { status, planStart };
  };

  const formatLocalDateTimeSafe = (iso) => {
    const t = Date.parse(iso || '');
    if (Number.isNaN(t)) {
      return '—';
    }
    return new Date(t).toLocaleString();
  };

  const getDataBasisLine = (plan) => {
    const t = Date.parse(plan.lastMealISO || '');
    if (!Number.isNaN(t)) {
      return `Based on last meal logged: ${formatLocalDateTimeSafe(plan.lastMealISO)}.`;
    }
    return 'Estimates are based on your schedule. Log a meal for accuracy.';
  };

  const getNextMealDateTime = (fromDay, planStart, plan) => {
    let probe = startOfDay(fromDay);
    for (let i = 0; i < 14; i += 1) {
      const status = getStatusForDate(probe, planStart);
      if (status !== 'FAST') {
        return setTimeOnDate(probe, plan.omadStart);
      }
      probe = addDays(probe, 1);
    }
    return null;
  };

  const simulateLastMealAtOrBefore = (snapshotTime, planStart, plan) => {
    const baseT = Date.parse(plan.lastMealISO || '');
    if (Number.isNaN(baseT)) {
      return null;
    }

    let lastMeal = new Date(baseT);
    if (snapshotTime.getTime() <= lastMeal.getTime()) {
      return lastMeal;
    }

    const baseDay = startOfDay(lastMeal);
    const snapDay = startOfDay(snapshotTime);
    const days = Math.max(0, Math.floor((snapDay.getTime() - baseDay.getTime()) / 86400000));

    for (let i = 0; i <= days; i += 1) {
      const d = addDays(baseDay, i);
      const meal = setTimeOnDate(d, plan.omadStart);
      if (!meal) continue;

      const status = getStatusForDate(d, planStart);
      if (status === 'OMAD' || status === 'EAT') {
        if (meal.getTime() > lastMeal.getTime() && meal.getTime() <= snapshotTime.getTime()) {
          lastMeal = meal;
        }
      }
    }

    return lastMeal;
  };

  const getBodyStateRows = (context) => {
    // context: { mode: 'unknown' | 'fasting' | 'postmeal' | 'refeed', hours: number|null, labelPrefix: string }
    const placeholder = { insulin: '—', fuel: '—', autophagy: '—', caution: '' };
    const prefix = context.labelPrefix ? `${context.labelPrefix} ` : '';

    if (context.mode === 'refeed') {
      return {
        insulin: `${prefix}Insulin rising`,
        fuel: `${prefix}Fuel mixed`,
        autophagy: `${prefix}Reduced temporarily`,
        caution: ''
      };
    }

    if (context.mode === 'postmeal') {
      return {
        insulin: `${prefix}Insulin rising`,
        fuel: `${prefix}Fuel mixed`,
        autophagy: `${prefix}Reduced temporarily`,
        caution: ''
      };
    }

    if (context.mode !== 'fasting' || context.hours === null) {
      return placeholder;
    }

    const h = Math.max(0, context.hours);

    if (h < 12) {
      return {
        insulin: `${prefix}Insulin lowering`,
        fuel: `${prefix}Mostly glucose/glycogen`,
        autophagy: `${prefix}Baseline`,
        caution: ''
      };
    }
    if (h < 24) {
      return {
        insulin: `${prefix}Insulin low`,
        fuel: `${prefix}Shifting to fat`,
        autophagy: `${prefix}Increasing (varies)`,
        caution: ''
      };
    }
    if (h < 48) {
      return {
        insulin: `${prefix}Insulin low`,
        fuel: `${prefix}Mostly fat`,
        autophagy: `${prefix}Higher (varies)`,
        caution: ''
      };
    }

    return {
      insulin: `${prefix}Insulin low`,
      fuel: `${prefix}Fat/ketones`,
      autophagy: `${prefix}Elevated (varies)`,
      caution: 'Extended fasts require extra care.'
    };
  };

  const renderDayDetail = (date, planStart, plan) => {
    const holder = document.querySelector('.fm-daydetail');
    if (!holder) {
      return;
    }

    if (!date) {
      holder.innerHTML = '';
      return;
    }

    const now = new Date();
    const today = startOfDay(now);
    const selectedDay = startOfDay(date);
    const isToday = compareDateOnly(selectedDay, today) === 0;
    const isFuture = compareDateOnly(selectedDay, today) > 0;
    const isPast = compareDateOnly(selectedDay, today) < 0;

    const status = getStatusForDate(selectedDay, planStart);
    const titleDate = selectedDay.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const headingTitle = isToday ? 'Today' : titleDate;
    const headingSub = isToday ? titleDate : (isFuture ? `${titleDate} (Projected)` : '');

    let whatToDo = `Eat once within your window: ${plan.omadStart}–${plan.omadEnd}.`;
    if (status === 'FAST') {
      const next = getNextMealDateTime(addDays(selectedDay, 1), planStart, plan);
      const nextStr = next
        ? next.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
        : '—';
      whatToDo = `Keep fasting. Allowed: water, black coffee, unsweet tea. Next meal: ${nextStr}.`;
    }
    if (status === 'EAT') {
      whatToDo = 'Break your fast today. Keep it gentle: protein + fiber + hydration.';
    }

    const basisLine = getDataBasisLine(plan);

    const hasMealLog = !Number.isNaN(Date.parse(plan.lastMealISO || ''));
    const snapshotTime = (hasMealLog && (isToday || isFuture))
      ? (isToday ? now : (setTimeOnDate(selectedDay, plan.omadStart) || setTimeOnDate(selectedDay, '12:00') || now))
      : null;

    const lastMealAt = snapshotTime ? simulateLastMealAtOrBefore(snapshotTime, planStart, plan) : null;
    const hours = (snapshotTime && lastMealAt)
      ? Math.max(0, (snapshotTime.getTime() - lastMealAt.getTime()) / 3600000)
      : null;

    const labelPrefix = isFuture ? 'Projected:' : '';
    const mode = (status === 'EAT')
      ? 'refeed'
      : ((hours !== null && hours <= 4) ? 'postmeal' : (hours !== null && !isPast ? 'fasting' : 'unknown'));

    const rows = getBodyStateRows({ mode, hours, labelPrefix });

    const cautionHtml = rows.caution
      ? `<p class="fm-block__text fm-muted">${rows.caution}</p>`
      : '';

    const trustHtml = '<p class="fm-block__text fm-muted">These are physiological trends, not guarantees. Listen to your body.</p>';

    const metricsHtml = `
      <div class="fm-metrics" role="list" aria-label="Body state snapshot">
        <div class="fm-metric" role="listitem">
          <div class="fm-metric__k">Insulin</div>
          <div class="fm-metric__v">${rows.insulin}</div>
        </div>
        <div class="fm-metric" role="listitem">
          <div class="fm-metric__k">Fuel</div>
          <div class="fm-metric__v">${rows.fuel}</div>
        </div>
        <div class="fm-metric" role="listitem">
          <div class="fm-metric__k">Autophagy</div>
          <div class="fm-metric__v">${rows.autophagy}</div>
        </div>
      </div>
      ${cautionHtml}
    `;

    holder.innerHTML = `
      <article class="fm-feature" aria-label="Day detail">
        <div class="fm-feature__inner">
          <header class="fm-feature__header">
            <div class="fm-feature__meta">
              <span class="fm-pill" aria-label="Status">${status}</span>
              ${isToday ? '<span class="fm-pill fm-pill--soft" aria-label="You are here">You are here</span>' : ''}
              ${isToday ? '<span class="fm-badge-today" aria-label="Today">Today</span>' : ''}
            </div>
            <h3 class="fm-feature__title">${headingTitle}</h3>
            ${headingSub ? `<div class="fm-muted">${headingSub}</div>` : ''}
          </header>

          <p class="fm-muted">${basisLine}</p>

          <div class="fm-feature__grid">
            <section class="fm-block" aria-label="Body state snapshot">
              <h4 class="fm-block__title">Body state snapshot</h4>
              ${metricsHtml}
            </section>

            <section class="fm-block" aria-label="What to do next">
              <h4 class="fm-block__title">What to do next</h4>
              <p class="fm-block__text">${whatToDo}</p>
            </section>
          </div>

          <div class="fm-feature__actions" role="group" aria-label="Quick actions">
            <button type="button" class="fm-btn fm-btn--primary" data-fm-action="log-meal">Log meal now</button>
            ${!isToday ? '<button type="button" class="fm-btn fm-btn--secondary" data-fm-action="set-today">Set as today</button>' : ''}
          </div>

          ${trustHtml}
        </div>
      </article>
    `;

    const live = $('fmLive');
    if (live) {
      const prefix = isFuture ? 'Selected (future)' : (isToday ? 'Selected (today)' : 'Selected');
      live.textContent = `${prefix} ${selectedDay.toLocaleDateString()}: ${status}.`;
    }

    const log = holder.querySelector('[data-fm-action="log-meal"]');
    if (log) {
      log.addEventListener('click', () => {
        writeSetting(STORAGE.lastMealISO, new Date().toISOString());
        renderAll();
      });
    }

    const setTodayBtn = holder.querySelector('[data-fm-action="set-today"]');
    if (setTodayBtn) {
      setTodayBtn.addEventListener('click', () => {
        const iso = formatISODate(today);
        selectDayByISO(iso);
      });
    }
  };

  const selectDayByISO = (iso) => {
    if (!iso) return;
    selectedISO = iso;

    const plan = getPlan();
    const planStart = parseLocalDate(plan.planStartDate) || parseLocalDate(DEFAULTS.planStartDate);
    const d = parseLocalDate(iso);
    if (!d) return;

    renderWeekShelf(planStart, plan);
    renderMonth(planStart, plan);
    renderDayDetail(d, planStart, plan);
  };

  const renderWeekShelf = (planStart, plan) => {
    const shelf = $('fmWeekShelf');
    if (!shelf) {
      return;
    }

    const now = new Date();
    const today = startOfDay(now);
    const start = startOfWeekSunday(today);

    const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const cards = [];
    for (let i = 0; i < 7; i += 1) {
      const date = addDays(start, i);
      const status = getStatusForDate(date, planStart);

      let badgeClass = 'fm-badge--omad';
      if (status === 'FAST') badgeClass = 'fm-badge--fast';
      if (status === 'EAT') badgeClass = 'fm-badge--eat';

      const isToday = compareDateOnly(date, today) === 0;
      const isPast = compareDateOnly(date, today) < 0;
      const phaseLabel = isToday ? 'Active' : (isPast ? 'Completed' : 'Planned');
      const iso = formatISODate(date);
      const isSelected = Boolean(selectedISO) && selectedISO === iso;

      cards.push(
        `<button class="fm-daycard${isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}" type="button" role="listitem" data-fm-date="${iso}" aria-selected="${isSelected ? 'true' : 'false'}" aria-label="${dows[date.getDay()]} ${formatMonthDay(date)} ${status}. ${phaseLabel}.">
          <div class="fm-daycard__top">
            <div class="fm-daycard__dow">${dows[date.getDay()]}</div>
            <div class="fm-badge ${badgeClass}">${status}</div>
          </div>
          <div class="fm-daycard__date">${formatMonthDay(date)}</div>
          <div class="fm-daycard__phase fm-muted">${phaseLabel}</div>
        </button>`
      );
    }

    shelf.innerHTML = cards.join('');

    const dayButtons = Array.from(shelf.querySelectorAll('button[data-fm-date]'));
    dayButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const iso = btn.getAttribute('data-fm-date');
        if (iso) selectDayByISO(iso);
      });
    });
  };

  const renderBodyCards = (plan) => {
    const holder = $('fmBodyCards');
    if (!holder) {
      return;
    }

    const now = new Date();
    const fastingHours = getFastingHours(plan.lastMealISO, now);

    if (fastingHours === null) {
      holder.innerHTML = `
        <article class="fm-card" role="listitem">
          <h3>Log a meal to personalize</h3>
          <p>FastMode can estimate phases more accurately if you log when you eat.</p>
          <ul>
            <li>Tap “I’m eating now” after a meal.</li>
            <li>Use the week shelf + month view to plan ahead.</li>
          </ul>
        </article>
      `;
      return;
    }

    const stages = getBodyStages();
    const idx = stages.findIndex((s) => fastingHours >= s.min && fastingHours < s.max);
    const currentIndex = idx === -1 ? 0 : idx;

    const start = Math.max(0, currentIndex - 1);
    const end = Math.min(stages.length, start + 4);
    const visible = stages.slice(start, end);

    holder.innerHTML = visible
      .map((s, i) => {
        const realIndex = start + i;
        return `
          <article class="fm-card${realIndex === currentIndex ? ' is-current' : ''}" role="listitem">
            <h3>${s.title}</h3>
            <p>${s.sentence}</p>
            <ul>
              <li>${s.feels[0]}</li>
              <li>${s.feels[1]}</li>
            </ul>
          </article>
        `;
      })
      .join('');
  };

  const renderSafety = (plan) => {
    const note = $('fmSafetyNote');
    if (!note) {
      return;
    }
    note.hidden = !plan.showSafety;
  };

  const renderMonth = (planStart, plan) => {
    const grid = $('fmMonthGrid');
    if (!grid) {
      return;
    }

    const now = new Date();
    const today = startOfDay(now);
    const year = now.getFullYear();
    const month = now.getMonth();

    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const headers = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
      .map((d) => `<div class="fm-calhead" aria-hidden="true">${d}</div>`)
      .join('');

    const blanks = first.getDay();
    const cells = [];

    for (let i = 0; i < blanks; i += 1) {
      cells.push('<button class="fm-daybtn" type="button" disabled aria-hidden="true"></button>');
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const status = getStatusForDate(date, planStart);

      let dotClass = 'fm-daydot--omad';
      if (status === 'FAST') dotClass = 'fm-daydot--fast';
      if (status === 'EAT') dotClass = 'fm-daydot--eat';

      const dateISO = formatISODate(date);
      const isSelected = Boolean(selectedISO) && selectedISO === dateISO;

      const d0 = startOfDay(date);
      const isToday = compareDateOnly(d0, today) === 0;
      const isPast = compareDateOnly(d0, today) < 0;
      const phaseLabel = isToday ? 'Active' : (isPast ? 'Completed' : 'Planned');

      cells.push(
        `<button class="fm-daybtn${isSelected ? ' is-selected' : ''}" type="button" data-fm-date="${dateISO}" aria-selected="${isSelected ? 'true' : 'false'}" aria-label="${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}. ${status}. ${phaseLabel}.">
          ${day}
          <span class="fm-daydot ${dotClass}" aria-hidden="true"></span>
        </button>`
      );
    }

    grid.innerHTML = `${headers}${cells.join('')}`;

    // Wire clicks
    const buttons = Array.from(grid.querySelectorAll('button[data-fm-date]'));
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const iso = btn.getAttribute('data-fm-date');
        if (iso) selectDayByISO(iso);
      });
    });
  };

  const modal = {
    isOpen: false,
    lastFocus: null,
    keyHandler: null,

    open() {
      const wrap = $('fmSettingsModal');
      if (!wrap) return;

      this.lastFocus = document.activeElement;
      wrap.hidden = false;
      this.isOpen = true;

      const firstInput = $('fmPlanStart');
      if (firstInput) {
        firstInput.focus();
      }

      this.keyHandler = (e) => {
        if (!this.isOpen) return;

        if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
          return;
        }

        if (e.key === 'Tab') {
          const panel = wrap.querySelector('.fm-modal__panel');
          if (!panel) return;

          const focusables = Array.from(panel.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )).filter((el) => !el.hasAttribute('disabled'));

          if (focusables.length === 0) return;

          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener('keydown', this.keyHandler);
    },

    close() {
      const wrap = $('fmSettingsModal');
      if (!wrap) return;

      wrap.hidden = true;
      this.isOpen = false;

      if (this.keyHandler) {
        document.removeEventListener('keydown', this.keyHandler);
        this.keyHandler = null;
      }

      if (this.lastFocus && typeof this.lastFocus.focus === 'function') {
        this.lastFocus.focus();
      }

      this.lastFocus = null;
    }
  };

  const syncSettingsUI = (plan) => {
    const planStart = $('fmPlanStart');
    const omadStart = $('fmOmadStart');
    const omadEnd = $('fmOmadEnd');
    const showSafety = $('fmShowSafety');

    if (planStart) planStart.value = plan.planStartDate;
    if (omadStart) omadStart.value = plan.omadStart;
    if (omadEnd) omadEnd.value = plan.omadEnd;
    if (showSafety) showSafety.checked = Boolean(plan.showSafety);
  };

  const wireEvents = () => {
    const logBtn = $('fmLogMealBtn');
    const editBtn = $('fmEditPlanBtn');
    const closeBtn = $('fmCloseSettingsBtn');
    const cancelBtn = $('fmCancelSettingsBtn');
    const overlay = document.querySelector('#fmSettingsModal [data-fm-close="true"]');
    const form = $('fmSettingsForm');

    if (logBtn) {
      logBtn.addEventListener('click', () => {
        writeSetting(STORAGE.lastMealISO, new Date().toISOString());
        renderAll();
      });
    }

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        const plan = getPlan();
        syncSettingsUI(plan);
        modal.open();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.close());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => modal.close());
    }

    if (overlay) {
      overlay.addEventListener('click', () => modal.close());
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const planStartEl = $('fmPlanStart');
        const omadStartEl = $('fmOmadStart');
        const omadEndEl = $('fmOmadEnd');

        const planStart = planStartEl?.value || DEFAULTS.planStartDate;
        const omadStart = omadStartEl?.value || DEFAULTS.omadStart;
        const omadEnd = omadEndEl?.value || DEFAULTS.omadEnd;
        const showSafety = $('fmShowSafety')?.checked ? 'true' : 'false';

        // Basic validation
        if (!parseLocalDate(planStart)) {
          if (planStartEl) {
            planStartEl.setCustomValidity('Please enter a valid start date');
            planStartEl.reportValidity();
            planStartEl.setCustomValidity('');
          }
          return;
        }
        if (!parseTimeToHM(omadStart) || !parseTimeToHM(omadEnd)) {
          if (omadStartEl) {
            omadStartEl.setCustomValidity('Please enter a valid time');
            omadStartEl.reportValidity();
            omadStartEl.setCustomValidity('');
          }
          if (omadEndEl) {
            omadEndEl.setCustomValidity('Please enter a valid time');
            omadEndEl.reportValidity();
            omadEndEl.setCustomValidity('');
          }
          return;
        }

        writeSetting(STORAGE.planStartDate, planStart);
        writeSetting(STORAGE.omadStart, omadStart);
        writeSetting(STORAGE.omadEnd, omadEnd);
        writeSetting(STORAGE.showSafety, showSafety);

        modal.close();
        renderAll();
      });
    }

    const monthToggle = $('fmMonthToggle');
    const monthPanel = $('fmMonthPanel');
    if (monthToggle && monthPanel) {
      monthToggle.addEventListener('click', () => {
        const willShow = monthPanel.hidden;
        monthPanel.hidden = !willShow;
        monthToggle.setAttribute('aria-expanded', String(willShow));
        monthToggle.textContent = willShow ? 'Hide month' : 'Show month';
      });
    }
  };

  let timer = null;

  const renderAll = () => {
    const plan = getPlan();
    const now = new Date();

    const planStart = parseLocalDate(plan.planStartDate) || parseLocalDate(DEFAULTS.planStartDate);

    const todayISO = formatISODate(startOfDay(now));
    if (!selectedISO) {
      selectedISO = todayISO;
    }

    const hero = renderHero(plan, now);
    renderWeekShelf(hero.planStart, plan);
    renderBodyCards(plan);
    renderSafety(plan);
    renderMonth(hero.planStart, plan);

    const selectedDate = parseLocalDate(selectedISO) || startOfDay(now);
    renderDayDetail(selectedDate, hero.planStart, plan);

    // Refresh countdown every 30s
    if (timer) {
      window.clearInterval(timer);
    }

    timer = window.setInterval(() => {
      renderHero(getPlan(), new Date());
    }, 30000);
  };

  document.addEventListener('DOMContentLoaded', () => {
    wireEvents();
    renderAll();
  });
})();
