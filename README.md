# Routine Tracker

A calm, local-first routine companion for planning small Care, Move, and Focus actions, completing today's steps, and reviewing recent patterns without streak pressure.

**Live demo:** Pending publication approval.
**Status:** Local V1.1 release candidate; no remote is configured.

| Desktop Today | Mobile Today |
| --- | --- |
| ![Routine Tracker desktop Today dashboard](docs/screenshots/desktop-today.png) | ![Routine Tracker mobile Today dashboard](docs/screenshots/mobile-today.png) |

| Routine library | Seven-day insights |
| --- | --- |
| ![Routine Tracker routine-management view](docs/screenshots/desktop-routines.png) | ![Routine Tracker seven-day insights](docs/screenshots/desktop-insights.png) |

## What it does

- Shows AM and PM routines for the device's local calendar day.
- Persists completed steps by date and keeps historical snapshots stable across later routine edits.
- Provides a read-only weekly Schedule with complete keyboard-operated tabs.
- Creates, edits, deletes, and orders custom routine steps across selected weekdays, categories, and AM/PM periods.
- Summarizes seven days of completion by day and category without streaks or behavioral scores.
- Exports a readable versioned JSON backup and validates an import before replacing local data.
- Migrates the original version-1 daily record and recovers safely from malformed or unavailable browser storage.
- Supports desktop, compact desktop, and mobile layouts with automated accessibility checks.

## Product boundary

This is a fictional portfolio demo. Its Care, Move, and Focus content does not provide medical advice, dosage guidance, health claims, or behavioral recommendations. All routine and history data remains in the browser unless the user explicitly downloads a backup.

The release intentionally has no accounts, backend, cloud sync, external analytics, push notifications, social features, payments, or AI-generated recommendations. Those capabilities would require separate privacy, security, deployment, and operations decisions rather than being small additions to this local-first product.

## Run locally

Requires Node.js 22 or later.

```bash
npm ci
npm run dev
```

## Verify

```bash
npm run lint
npm test
npm run build
npm run test:e2e
npm audit
```

With the development server running at `http://127.0.0.1:4173`, regenerate the checked-in screenshots with:

```bash
npm run screenshots
```

## Architecture and quality

The default fictional routines live in `src/data/routines.js`. Runtime state uses a validated version-2 `localStorage` contract containing the current routine library and dated completion records. Each saved day includes a compact step/category snapshot so later edits cannot silently rewrite historical totals. Import uses the same validator and requires a preview plus explicit confirmation before replacement.

See [the product case study](docs/product-case-study.md) and [architecture and test strategy](docs/architecture-and-testing.md).

## Contribution disclosure

Julia defined the product direction, audience, requirements, acceptance criteria, visual decisions, scope boundaries, review criteria, and validation plan. The implementation was AI-assisted and reviewed through documented tests and product checks. This project is presented as evidence of product ownership, UI/UX judgment, validation, and AI-assisted delivery—not as proof that every line of React code was independently authored.

## Roadmap

Only after user research and a separate privacy/security decision: optional private cross-device sync or opt-in reminders. Neither is implemented or implied by the current release.
