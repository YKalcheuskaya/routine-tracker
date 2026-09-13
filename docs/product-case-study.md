# Routine Tracker Product Case Study

## Problem and audience

Routine Tracker is for a single person who wants a calm view of a daily rhythm without turning a personal checklist into a quantified productivity system. The starting problem was a static routine reference: it could show instructions, but not help a user notice progress or return to the right step.

## Primary journey

1. Open **Today** and see the local date, AM/PM groups, and total progress.
2. Complete a small action in a Care, Move, or Focus card.
3. See card and daily progress update immediately.
4. Reload during the same day and retain progress.
5. Start a fresh list after the local calendar date changes.
6. Use **Schedule** only to preview weekday templates; it never records completion.

![Desktop Today dashboard](screenshots/desktop-today.png)

## Key decisions

| Decision | Why |
| --- | --- |
| Today-first dashboard | The immediate job is following today’s rhythm, not configuring a schedule. |
| Separate read-only schedule | It supports planning without accidentally creating a history feature. |
| Care, Move, Focus demo content | It is broad, fictional, and avoids private or medical content. |
| Date-scoped local persistence | It works offline, requires no account, and makes daily reset understandable. |
| Playful wellness visual system | It creates warmth and clarity without presenting the app as a health product. |

## Rejected alternatives

- A three-selector, one-routine flow: it hid the day’s whole rhythm behind navigation.
- Editing, accounts, or cloud sync: they would expand the release beyond its product goal.
- Historical completion and streaks: they introduce retention, analytics, and privacy decisions that do not improve the first release.
- Supplement, dosage, and product-specific content: unsuitable for a public portfolio demo.

## Acceptance evidence

The repository includes unit tests for date and persistence contracts, component tests for dashboard states and read-only scheduling, and Playwright coverage for completion persistence, navigation, responsive browser projects, and axe accessibility checks. The GitHub Actions workflow repeats the core local verification sequence once a remote is approved.

## Contribution model

Julia owned product discovery, requirements, acceptance criteria, visual direction, scope control, review, and validation. Code was AI-assisted. This is an intentionally transparent product case study rather than a claim of independent React implementation.
