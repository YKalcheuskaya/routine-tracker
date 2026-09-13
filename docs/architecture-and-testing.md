# Architecture and Testing

## Data and state

`src/data/routines.js` is the single public demo-data source. Each routine has a stable routine ID, category, period, weekday availability, and stable step IDs. Completion IDs are stored as `routine-id:step-id` values.

The persistence record is deliberately small:

```json
{
  "version": 1,
  "localDate": "2026-09-13",
  "completedStepIds": ["am-care:open-window"]
}
```

When the saved date differs from the device's local date, the app starts a fresh in-memory daily record. Date changes are checked on a one-minute interval, window focus, and document visibility changes. Storage errors degrade to session-only progress; malformed versioned data is replaced with a clean state.

## Test pyramid

| Layer | Purpose |
| --- | --- |
| Vitest unit tests | Local-date behavior and persistence validation/recovery. |
| React Testing Library | Today sections, progress UI, empty state, toggling, and Schedule read-only behavior. |
| Playwright | Browser persistence, navigation, responsive projects, keyboard-reachable controls, and axe scan. |
| CI | Clean dependency install, lint, test, production build, and Chromium end-to-end verification. |

## Accessibility and responsive review

Native checkboxes provide an expected keyboard interaction. Every interactive control has a visible focus treatment; navigation and weekday selection have semantic roles; a skip link reaches main content. The layout collapses from a three-card grid to a single column on compact screens. Automated axe checks complement—not replace—a final manual keyboard, mobile, tablet, and desktop review.
