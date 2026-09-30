# Routine Tracker Product Case Study

## Problem and audience

Routine Tracker is a private, manual-first journal for a person who wants to turn selected wellness goals into a clear daily action view. The product is intentionally active and progress-oriented: it makes goals, current progress, and useful context visible without treating mood, symptoms, medication, or cycle information as a performance score.

It includes a public guest-mode portfolio preview backed only by browser storage. The local account flow lets an interviewer reproduce registration, sign-in, account-scoped persistence, and an RLS-backed data boundary without presenting the project as a public health product.

## Primary journey

1. Create a disposable local account and set personal steps, water, sleep, meal, and bedtime goals.
2. Use **Calendar** to log a day: steps, water, bedtime/wake time, a chosen activity, meal, mood, stress, energy, and optional cycle/symptom context.
3. Create a personally labelled medication reminder and mark it as recorded. This is a personal confirmation only, never medication advice.
4. Return to **Today** for compact progress and a small water quick-add action; open **Insights** for descriptive seven-day patterns.
5. Sign out, sign back in, and confirm that the same account's fictional journal remains available.
6. Create a second disposable local account to demonstrate that it starts with a separate journal.

Use fictional data for every demonstration. Do not enter real health, medication, cycle, mood, or identity data.

## Key decisions

| Decision | Why |
| --- | --- |
| Compact Today, complete Calendar | Today supports an immediate next action; Calendar is the intentionally fuller record. |
| User-defined goals | Steps, water, sleep, meals, and bedtime reflect personal preferences rather than universal prescriptions. |
| Manual-first logging | The demo does not imply wearable integration or passive biometric measurement. |
| Context is separate from scoring | Mood, stress, energy, medication confirmations, cycle context, and symptoms remain private context, not a wellness grade. |
| Descriptive insights | The product summarizes recorded patterns without diagnosing, asserting causation, or offering treatment advice. |
| User-created medication reminders | The application records a user's own label and confirmation without collecting dose data or giving medication direction. |
| Local Supabase account boundary | Auth plus RLS makes account isolation demonstrable while keeping the portfolio project local. |
| Reviewed data import | A version-3 JSON file is validated and summarized before it can replace a journal. |

## Explicit boundaries

- Routine Tracker does not integrate with Oura Ring or any wearable.
- It does not measure sleep stages, diagnose symptoms, make treatment recommendations, or provide medication advice.
- The deployed site is a credential-free guest preview, not a public account service; it has no real users, cloud database project, privacy policy, support operation, or production security claim.
- A real launch would be a separate product and engineering phase, not a small extension of this demo.

## Acceptance evidence

The project has local lint, unit/component, build, browser, accessibility, and local-account isolation checks. The account check creates two disposable accounts, records data in the first, and verifies an empty journal in the second. A separate manual walkthrough covers registration, full-day logging, reminder confirmation, logout, and sign-in persistence.

## Contribution model

Julia owned product direction, audience, requirements, visual direction, scope control, acceptance criteria, review, and validation. Implementation was AI-assisted. The project is presented as an honest product-ownership and quality-engineering case study, not as independent React authorship or a production health-service claim.
