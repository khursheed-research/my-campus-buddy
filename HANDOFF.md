# Handoff Guide

Read this first. It's meant to be the one document that gets a new engineer (or a CTO evaluating
the project) from zero to fully working, without anyone re-explaining the project out loud.

## 1. What this actually is

Every organization is run by people who accumulate knowledge, judgment, and hard-won lessons —
and when they leave, that goes with them. **My Campus Buddy** is the layer that keeps it: it
learns from everyday work (emails, calls, documents, decisions, deals, hires, policies,
marketing moves — with approval) and lets anyone in the org query it later, both as a plain
reference ("how did we handle this before?") and as **insight no single executive could hold in
their head or compute themselves** — e.g. the multi-year impact of a specific policy decision,
which geography/industry actually drives revenue, which hiring source produces people who stay
longest, where people go when they leave and why, how marketing has performed over years.

The public site is two things:
- A **marketing/positioning page** (`/`) making the case for why this matters, with a FOMO angle
  for leadership.
- A **live interactive demo** (`/demo`) of a fictional company, "Northwind Industries," showing
  the product in action — some of it wired to a real AI backend, some illustrative (see the table
  in `README.md`).

## 2. Where everything lives — this is the point of this document

Everything is now in **one GitHub repo**: `khursheed-research/my-campus-buddy` (public).

```
app/                    Next.js frontend (marketing page, demo dashboard, /api/memory route)
lib/                    Shared frontend helpers (Supabase REST wrapper)
supabase/functions/     Source for all 3 Supabase Edge Functions (chat, upload, app)
supabase/migrations/    Consolidated DB schema — reproduces the Postgres schema from scratch
README.md               Architecture overview, what's real vs. illustrative
HANDOFF.md              This file
```

Previously the Edge Function source and database schema existed **only** inside the Supabase
dashboard — nowhere in git. That's fixed now: `supabase/functions/` and `supabase/migrations/`
in this repo are accurate copies of what's live, pulled directly from Supabase.

### The three services involved

| Service | What it holds | Project / Org |
|---|---|---|
| **GitHub** | All frontend + Edge Function source, DB schema | `khursheed-research/my-campus-buddy` |
| **Vercel** | Hosts the Next.js frontend, auto-deploys on every push to `main` | Team "Corporate Intelligence" → project `my-campus-buddy` |
| **Supabase** | Postgres database, Edge Functions (live, already deployed), secrets | Project ref `obxrisavtddfydqurxfl` ("AI Brain Project") |

**Deploys are automatic:** push to `main` on GitHub → Vercel builds and deploys. The Edge
Functions in `supabase/functions/` are copies for reference/version-control — redeploying them
requires pushing via the Supabase CLI or dashboard (they are NOT auto-deployed from this repo
today; that would be a good next improvement — see §5).

## 3. What a new person needs (access checklist)

To fully work on this, someone needs to be added to:

1. **GitHub repo** — `khursheed-research/my-campus-buddy` (currently public, so read is free;
   write access needs a collaborator invite or their own PAT if pushing directly).
2. **Vercel team** — "Corporate Intelligence" (ask Anwar for an invite).
3. **Supabase project** — `obxrisavtddfydqurxfl` (ask Anwar for an invite via Supabase's project
   member settings).

### Secrets (never in git — get these directly, not from this repo)

- `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` — Supabase dashboard → Project Settings → API.
  Also need to be set as env vars in the Vercel project (Production + Preview).
- `GEMINI_API_KEY` — already set as a Supabase Edge Function secret (Edge Functions → chat →
  Secrets). The frontend never touches this key directly; only the `chat` Edge Function does.

`.env.example` in this repo lists exactly which variables are needed, without values.

## 4. Current status (as of this handoff)

- ✅ Marketing page + demo dashboard, properly split into separate routes.
- ✅ Softer dark theme (confirmed final).
- ✅ Insights & Analytics tab — revenue by region/industry, sales leaderboard, hiring/attrition,
  hiring-source retention, exit destinations & factors, department spend vs. outcomes, marketing
  performance over time, decision-impact cards.
- ✅ Repo now holds all frontend code, Edge Function source, and DB schema (this handoff).
- 🔲 Not yet done: deeper/more benchmark-grounded mock data (discussed, not prioritized yet).
- 🔲 Not yet done: auto-deploy pipeline for Edge Functions from this repo (currently manual via
  Supabase dashboard/CLI).
- 🔲 Vercel deployment protection (SSO) is intentionally **off** so the live link is shareable —
  worth revisiting before this goes to a wider audience or has real customer data in it, since
  right now the demo-mode DB policies allow open read/insert with no auth layer.

## 5. Suggested next steps for a CTO picking this up

- Decide on an auth/multi-tenancy model before this handles anything beyond illustrative demo
  data — right now RLS policies are wide open by design (`supabase/migrations/`, see the comment
  there).
- Consider wiring Edge Function deploys into CI (GitHub Action → `supabase functions deploy`)
  instead of manual dashboard edits, so the repo stays the actual source of truth going forward.
- The `app` Edge Function (`supabase/functions/app/`) is a legacy standalone HTML preview,
  superseded by the Next.js `/demo` page — safe to remove once confirmed unused.
