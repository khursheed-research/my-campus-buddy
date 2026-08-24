# My Campus Buddy

> **New here?** Read [`HANDOFF.md`](./HANDOFF.md) first — it covers what this is, where
> everything lives (GitHub / Vercel / Supabase), and exactly what access you need.

The institutional intelligence layer for any organization — companies, government agencies, schools,
religious institutions, and family offices. It watches approved conversations and decisions, remembers
them permanently, and advises the next person who faces a similar situation using the institution's own
real history.

This repo is the **rebuilt, source-controlled version** of the working demo previously deployed at
`ai-brain-demo.vercel.app`. That deployment's frontend source was never committed anywhere — only its
Supabase Edge Functions and database survived. This project reconstructs the frontend from scratch, wired
to the same real backend, under the new name.

## What's real vs. illustrative

| Feature | Status |
|---|---|
| AI chat (Northwind Workspace) | ✅ Real — calls a Supabase Edge Function backed by Gemini |
| Document upload & Q&A | ✅ Real |
| Institution Timeline / Decision Memory | ✅ Real — reads and writes to Postgres via Supabase |
| Strategy Advisor | ✅ Real — same AI backend, framed as an advisor |
| Knowledge Graph | 🎭 Illustrative — shows the vision, not wired to live data |
| Voice Capture | 🎭 Illustrative — simulated pipeline, not a live recording |
| AI Learning stats | 🎭 Illustrative growth simulation |

## Architecture

```
Browser (Next.js app, Vercel)
   │
   ├── AI Workspace / Strategy Advisor  ──▶  Supabase Edge Function: chat   ──▶ Gemini API
   ├── Document upload                  ──▶  Supabase Edge Function: upload ──▶ Postgres (documents table)
   └── Timeline / Decision Memory       ──▶  Next.js API route (/api/memory) ──▶ Postgres (memory_events table)
                                              (uses the Supabase service role key, kept server-side)
```

The chat/upload Edge Functions already exist in the "AI Brain Project" Supabase project and hold the
`GEMINI_API_KEY` as a server-side secret — this app never touches that key directly.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase project URL + service role key
   (Supabase dashboard → Project Settings → API).
3. `npm run dev`

## Deploying

Deploy to Vercel as a standard Next.js project. Set the same environment variables from `.env.local` in
the Vercel project settings (Production + Preview).

## Renaming history

Originally built and pitched as **AI Brain for Organizations**, briefly shown live as
**Institution Internal Intelligence**, and renamed to **My Campus Buddy** to reflect a target audience
broader than corporations.
