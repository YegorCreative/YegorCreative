# Copilot instructions for YegorCreative

## Project overview
- Static multi-page portfolio site (no build step). Core pages are [index.html](index.html), [portfolio.html](portfolio.html), [fastmode.html](fastmode.html), [games.html](games.html), and [contact.html](contact.html).
- Shared global styles live in [CSS/styles.css](CSS/styles.css) (design tokens in `:root`) with responsive overrides in [CSS/responsive.css](CSS/responsive.css).
- Page-specific styles live in [CSS/fastmode.css](CSS/fastmode.css), [CSS/portfolio.css](CSS/portfolio.css), [CSS/games.css](CSS/games.css), and [CSS/contact.css](CSS/contact.css).

## JavaScript architecture & patterns
- Vanilla JS only; each file is an IIFE that guards missing DOM nodes and wires events on `DOMContentLoaded`.
- Global UI behaviors (back-to-top, burger menu, code banner animation, portfolio filters) are in [script.js](script.js). Keep existing `id`/class hooks intact when editing markup (e.g., `#navToggle`, `#primaryNav`, `.yc-codebanner`).
- Active nav highlighting is handled by [nav-active.js](nav-active.js) using the current URL + `#primaryNav` anchors. Update it if you add new HTML pages or change nav link structure.
- Portfolio filters expect `.pf-filterbar` with `.pf-filter` buttons and cards with `data-category` in [portfolio.html](portfolio.html); the filter logic is in [script.js](script.js).

## FastMode feature (key product logic)
- FastMode is a self-contained mini-app: [fastmode.html](fastmode.html) + [fastmode.js](fastmode.js) + [CSS/fastmode.css](CSS/fastmode.css).
- State is stored in `localStorage` keys `fm_planStartDate`, `fm_omadStart`, `fm_omadEnd`, `fm_lastMealISO`, `fm_showSafety` in [fastmode.js](fastmode.js). Keep these stable to avoid breaking existing users.
- `renderAll()` is the main renderer; it drives hero status, week shelf, body cards, month grid, and day detail. When adding new FastMode UI, wire it into `renderAll()` and reuse existing helpers like `getStatusForDate()`.
- FastMode relies heavily on specific element IDs (e.g., `#fmStatusPill`, `#fmWeekShelf`, `#fmBodyCards`, `#fmMonthGrid`, `#fmSettingsModal`). Update both HTML + JS together.

## Accessibility & UX conventions
- Skip link and reduced-motion handling are first-class: `.skip-link` and `prefers-reduced-motion` are defined in [CSS/styles.css](CSS/styles.css), and JS respects reduced motion for animations in [script.js](script.js).
- Burger menu uses `body.nav-open` and focus trapping in [script.js](script.js); the FastMode settings modal manages focus in [fastmode.js](fastmode.js). Preserve these behaviors when editing navigation or modal markup.

## Developer workflow
- No build or test tooling; run locally by opening [index.html](index.html) or using a simple static server (see [README.md](README.md)).
- Deployment is static (GitHub Pages via `CNAME`), so avoid introducing server-side assumptions.
