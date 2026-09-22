# Cloud Launch Guide

This guide is a launch checklist for Routine Tracker. It deliberately separates locally implemented code from an actual public deployment.

## 1. Create the managed services

1. Create a Supabase project under an account controlled by the product owner.
2. In Supabase SQL Editor, apply `supabase/migrations/20260922130000_create-wellness-snapshots.sql`.
3. In Authentication settings, enable email/password sign-up, require email confirmation, set the production Site URL, and add the exact Vercel redirect URL.
4. Copy the project URL and **publishable** key into local `.env.local` and Vercel environment variables. Never expose a secret or service-role key in Vite.
5. Create a Vercel project for this repository and deploy the Vite application only after the checks below pass.

## 2. Verify the privacy boundary

- Create two test accounts with different email addresses.
- Confirm each can sign in and see only its own journal.
- Attempt, using a browser client with account A, to read or overwrite account B's `wellness_snapshots` row. It must be denied by RLS.
- Confirm a signed-out browser cannot select, insert, update, or delete any row.
- Confirm sign-out removes the active session and a different account does not inherit the previous account's cloud data.
- Confirm export/import behavior is understandable when cloud sync is enabled.

## 3. Complete public-launch work

Before inviting real users, publish a reviewed privacy notice and terms that accurately identify the operator, support contact, data processor(s), categories of data, retention/deletion approach, and user rights for the launch jurisdictions. Add an account-deletion path, a password-reset flow, rate-limit/abuse controls, error monitoring with data minimization, and an incident-response contact.

Do not represent the product as HIPAA compliant, medically validated, diagnostic, or clinical without separate specialist review and evidence. Keep mood, cycle, symptom, sleep, and medication information private by default, and do not sell or expose it for advertising.

## 4. Release gate

Record the deployed URL, database migration revision, Supabase auth configuration, RLS cross-user test evidence, build/test results, dependency audit, accessibility review, and privacy-document review before saying the application is publicly available or secure for real users.
