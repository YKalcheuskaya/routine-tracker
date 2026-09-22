# Routine Tracker

Routine Tracker is a multi-user wellness journal for personally chosen goals and manual check-ins. It helps each account holder record activity, sleep, hydration, meals, mood, stress, energy, reminders, cycle context, and symptoms without presenting a diagnosis or medical advice.

**Status:** cloud-ready local implementation. The public Supabase and Vercel projects have not been created or deployed yet.

## Product experience

- A focused Today view with selected-goal progress, compact check-ins, time-aware mountain imagery, and quick additions.
- A date-specific Calendar journal for corrections and manual records.
- Weekly Insights that describe recorded trends only; they do not infer medical causes or diagnoses.
- User-owned targets for steps, water, sleep, bedtime, and meals.
- A small activity catalogue: walking, running, strength training, cycling, elliptical, swimming, hiking, yoga, Pilates, badminton, and other.
- Optional medication reminders whose labels and schedules are created by the account holder; “recorded” is a personal confirmation, not dose or treatment advice.
- Separate self-reports for mood, stress, energy, cycle/menopause context, and symptoms.

## Accounts and privacy model

The deployed application will use Supabase Auth for email/password sign-up and sign-in. Each account receives one private journal snapshot stored under its authenticated user ID. The included SQL migration enables Row Level Security (RLS), so users can select, insert, update, or delete only their own journal row.

The browser uses a Supabase publishable key only. A Supabase service-role or secret key must never be added to Vite variables, committed, or exposed to the client. Signed-out visitors stay in local-only mode; signed-in users sync their private journal and retain a local browser cache for continuity.

This repository does not yet make a legal privacy, HIPAA, clinical, security-certification, or production-availability claim. A public launch requires a reviewed privacy notice, terms, support contact, deletion/export procedure, configured authentication email redirects, and a completed deployment/security review.

## Run locally

Requires Node.js 22 or later.

```bash
npm ci
npm run dev
```

Without environment variables, the app intentionally runs as a local private preview. To enable account flows for an authorized Supabase project, copy `.env.example` to `.env.local` and provide only:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Apply `supabase/migrations/20260922130000_create-wellness-snapshots.sql` to that project before enabling sign-up. See [the cloud launch guide](docs/cloud-launch-guide.md).

## Verify

```bash
npm run lint
npm test
npm run build
npm run test:e2e
npm audit
```

## Architecture

`src/features/tracker/` owns the versioned wellness data contract, mutation helpers, local cache, and import/export validation. `src/features/cloud/` owns the optional Supabase client, account session, and account-scoped snapshot sync. `supabase/migrations/` contains the database-side authorization rules. A cloud setup never changes the client’s safety boundaries around medical claims.

The visual language uses dark navy/charcoal surfaces, cyan light, restrained warm accents, and original time-of-day alpine imagery in `src/assets/`.

## Contribution disclosure

Julia defined the audience, product direction, data boundaries, wellness modules, visual decisions, acceptance criteria, and review decisions. The implementation is AI-assisted and verified with documented automated checks. This project is evidence of product ownership, UI/UX judgment, validation, and AI-assisted delivery—not proof that every line of React code was independently authored.
