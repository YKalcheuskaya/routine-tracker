# Architecture and Testing

## Product structure

Routine Tracker is a client-side React application with five views:

- **Today:** the current local date's AM/PM routines and completion controls.
- **Schedule:** a read-only weekday preview using a keyboard-operated ARIA tabs pattern.
- **Routines:** accessible CRUD, weekday/period/category selection, ordered steps, validation, and destructive confirmations.
- **Insights:** derived seven-day and category summaries without streak scoring.
- **Data:** local JSON backup plus validated, previewed import.

`src/data/routines.js` supplies fictional demo routines. Feature modules own routine validation, completion, Schedule behavior, insights, and versioned persistence. `App.jsx` coordinates navigation and passes the single local tracker state into each view.

## Versioned local data

Stable routine and step IDs make completion references independent of display text. The version-2 record stores the editable routine library and dated history:

```json
{
  "version": 2,
  "routines": [
    {
      "id": "am-care",
      "category": "care",
      "period": "am",
      "weekdays": ["monday"],
      "title": "Gentle start",
      "description": "A small reset before the day begins.",
      "steps": [{ "id": "open-window", "title": "Open a window" }]
    }
  ],
  "days": {
    "2026-09-21": {
      "completedStepIds": ["am-care:open-window"],
      "stepSnapshot": [{ "id": "am-care:open-window", "category": "care" }]
    }
  }
}
```

The daily snapshot is intentionally smaller than a complete routine copy. It preserves the independent inputs needed for historical total and category calculations while allowing the editable library to change.

## Migration, validation, and recovery

- A valid version-1 daily record is migrated into version 2 and saved back automatically.
- Duplicate completion IDs are removed during migration and only IDs available in that day's demo snapshot survive.
- Stored routines require unique IDs, valid categories and periods, at least one valid weekday, and at least one uniquely identified step.
- Malformed JSON or an invalid contract falls back to clean demo data with a visible recovery notice.
- Storage access or write failure degrades to session-only behavior instead of crashing.
- Import accepts only a valid version-2 contract, shows routine/day/version counts, and does not replace current data until confirmed.

## Derived insights

Seven-day insights are pure calculations over saved step snapshots. The current day uses the active routine library when no completion has yet been stored; prior dates are never inferred from today's editable schedule. Category totals and daily percentages therefore have explicit, testable inputs.

## Test pyramid

| Layer | Purpose |
| --- | --- |
| Vitest unit tests | Local dates, versioned validation and migration, routine normalization, storage recovery, history dates, daily/category calculations. |
| React Testing Library | Today states, Schedule semantics and arrow-key behavior, routine-form validation, destructive confirmations, and test isolation. |
| Playwright | Same-day persistence, responsive containment, Schedule read-only behavior, full routine CRUD, JSON download/import review, insights, date reset, and axe checks in desktop and mobile projects. |
| CI | Node 22 clean install, Chromium install, lint, unit/component tests, production build, both browser projects, and high-severity dependency audit. |

## Accessibility and responsive review

Native checkboxes, labels, selects, buttons, status/alert roles, confirmation dialogs, visible focus treatment, and a skip link provide the interaction foundation. Weekday Schedule controls implement `tablist`, `tab`, `tabpanel`, roving focus, and Left/Right/Home/End keys. The mobile primary navigation wraps so every view remains visible without horizontal page scrolling.

Automated axe checks complement—not replace—manual keyboard, content, desktop, compact-desktop, and mobile review. The screenshot command reproduces the documented 1280 × 720 and 390 × 844 review surfaces.

## Delivery boundary

The application has no network data layer. JSON export writes a local download; import reads a user-selected local file in the browser. A future account or sync feature would require a separate threat model, authentication/authorization design, privacy policy, backend, deployment, and operations evidence.
