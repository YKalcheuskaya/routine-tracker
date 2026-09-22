# Private Account Demonstration Guide

This guide makes the account flow demonstrable for an interview without publishing Routine Tracker or inviting real users.

## Private test setup

1. Create a Supabase project under Julia's own account and keep it for testing only.
2. Apply `supabase/migrations/20260922130000_create-wellness-snapshots.sql` in Supabase SQL Editor.
3. Enable email/password sign-up and set the Site URL and redirect URLs to `http://localhost:5173` only.
4. Put the project URL and **publishable** key in an untracked `.env.local` file. Never use a service-role key in the browser.
5. Run `npm run dev` locally. Do not deploy to Vercel, create a public URL, or invite users.

## Interview demonstration

Create two disposable test accounts, then show that each can sign in and can only see its own journal. Explain that Row Level Security enforces this at the database level, while the client merely holds a publishable key.

The demonstration should use fictional entries only. Do not put real health, medication, cycle, mood, or identity information into the test project.

## Boundary

This is an engineering and product demonstration, not a production wellness service. The launch work required for a real public product—legal review, privacy terms, support, deletion flows, abuse controls, incident handling, and deployment review—is intentionally out of scope.
