# Private Account Demonstration Guide

This guide makes the account flow demonstrable for an interview without publishing Routine Tracker or inviting real users.

## Local test setup

1. Start Docker Desktop.
2. Run `npm run supabase:start`. Supabase Auth, Postgres, Studio, and local email capture run only on the machine.
3. Run `npm run dev:local`, then open `http://127.0.0.1:5173`.
4. Use the generated local `.env.local`. It contains the local API URL and local publishable key only. Never use a secret or service-role key in the browser.

To recreate the database from the version-controlled migration, run `npx supabase db reset --local`. This deletes only the local demo accounts and entries before rebuilding them.

## Interview demonstration

Create two disposable test accounts, then show that each can sign in and can only see its own journal. Explain that Row Level Security enforces this at the database level, while the client merely holds a publishable key. Local Studio is available at `http://127.0.0.1:54323`; it remains a development tool, not a public dashboard.

The demonstration should use fictional entries only. Do not put real health, medication, cycle, mood, or identity information into the test project.

## Boundary

This is an engineering and product demonstration, not a production wellness service. The launch work required for a real public product—legal review, privacy terms, support, deletion flows, abuse controls, incident handling, and deployment review—is intentionally out of scope.
