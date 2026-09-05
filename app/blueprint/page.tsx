"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const LEAD_STAGES = ["Raw", "Called", "Meeting Done", "Proposal Sent", "Closed"];

const ROLES = [
  {
    role: "Admin",
    access: "Full access within their own company: manage users, view/edit all leads and interactions, configure integrations, see all reporting.",
  },
  {
    role: "Manager",
    access: "Manage their team's leads, assign leads to reps, view all interactions and outcomes for their team, cannot manage company-wide users or billing.",
  },
  {
    role: "Sales Executive",
    access: "Full access to their own assigned leads and interactions only. Can log calls/meetings, see their own performance, cannot see other reps' leads.",
  },
];

const TABLES = [
  {
    name: "companies",
    note: "One row per customer organization (tenant).",
    columns: [
      "id (uuid, pk)",
      "name (text)",
      "industry (text)",
      "created_at (timestamptz)",
    ],
  },
  {
    name: "users",
    note: "Everyone who logs in. Every row is scoped to a company.",
    columns: [
      "id (uuid, pk)",
      "company_id (uuid, fk -> companies.id)",
      "name (text)",
      "email (text, unique)",
      "role (enum: admin | manager | sales_executive)",
      "created_at (timestamptz)",
    ],
  },
  {
    name: "leads",
    note: "A prospective deal moving through the pipeline.",
    columns: [
      "id (uuid, pk)",
      "company_id (uuid, fk -> companies.id)",
      "name (text)",
      "lead_company_name (text)",
      "industry (text)",
      "stage (enum: raw | called | meeting_done | proposal_sent | closed)",
      "assigned_to (uuid, fk -> users.id)",
      "tags (text[])",
      "created_at, updated_at (timestamptz)",
    ],
  },
  {
    name: "interactions",
    note: "One row per call or meeting on a lead. This is where voice input lands.",
    columns: [
      "id (uuid, pk)",
      "company_id (uuid, fk -> companies.id)",
      "lead_id (uuid, fk -> leads.id)",
      "type (enum: call | meeting)",
      "occurred_at (timestamptz)",
      "audio_url (text, nullable)",
      "transcript_text (text, nullable)",
      "client_questions (text[])",
      "sales_responses (text[])",
      "objections (text[])",
      "sentiment (enum: positive | neutral | negative)",
      "deal_stage_at_time (text)",
      "notes (text)",
      "created_by (uuid, fk -> users.id)",
    ],
  },
  {
    name: "strategies",
    note: "AI- or rep-authored recommendation tied to a specific interaction.",
    columns: [
      "id (uuid, pk)",
      "company_id (uuid, fk -> companies.id)",
      "lead_id (uuid, fk -> leads.id)",
      "based_on_interaction_id (uuid, fk -> interactions.id)",
      "recommended_approach (text)",
      "created_at (timestamptz)",
    ],
  },
  {
    name: "outcomes",
    note: "Final result once a lead closes, win or lose.",
    columns: [
      "id (uuid, pk)",
      "company_id (uuid, fk -> companies.id)",
      "lead_id (uuid, fk -> leads.id)",
      "result (enum: won | lost)",
      "reason (text)",
      "closed_at (timestamptz)",
    ],
  },
  {
    name: "tags",
    note: "Reusable labels for filtering leads (e.g. 'enterprise', 'inbound').",
    columns: [
      "id (uuid, pk)",
      "company_id (uuid, fk -> companies.id)",
      "name (text)",
    ],
  },
];

export default function Blueprint() {
  return (
    <>
      <nav className="site-nav">
        <Link href="/" className="brand">
          <span className="brand-mark" />
          My Campus Buddy
        </Link>
        <div className="nav-links">
          <Link href="/">← Back to overview</Link>
          <Link href="/demo">View Demo</Link>
        </div>
      </nav>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">For Engineering</div>
          <h2>The Real-World Build Blueprint</h2>
          <p style={{ color: "var(--ink-dim)", maxWidth: 720, fontSize: 15, lineHeight: 1.65 }}>
            Everything on this page is written for whoever builds the production version of this
            product — a CTO, an engineering team, or a technical co-founder. It's not marketing
            copy: it's the schema, the roles, the data flow, and the open architectural decisions
            this prototype implies but doesn't fully build. The interactive demo shows what the
            product feels like. This page shows how it actually has to work underneath.
          </p>
        </div>
      </section>

      <ArchitectureDiagramSection />
      <LeadPipelineSection />
      <MultiTenantSection />
      <RolesSection />
      <SchemaSection />
      <VoiceInputSection />
      <InteractionLogicSection />
      <AIProcessingSection />
      <SearchFilterSection />
      <ListeningSection />
      <BackendSimulationSection />

      <footer className="site-footer">
        My Campus Buddy — a concept prototype. This page is a build blueprint, not a live system.
      </footer>
    </>
  );
}

function ArchitectureDiagramSection() {
  return (
    <section className="section section-alt">
      <div className="wrap">
        <SectionHeader
          eyebrow="The Big Picture"
          title="How data moves through the system, end to end."
          sub="Every box below is explained in its own section on this page. This is just the map — read it top to bottom, the same direction data actually flows."
        />
        <div style={{ overflowX: "auto" }}>
          <svg viewBox="0 0 1000 660" style={{ width: "100%", minWidth: 720, height: "auto" }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-faint)" />
              </marker>
            </defs>

            <text x="20" y="30" fontSize="12" fontFamily="var(--mono)" fill="var(--ink-faint)" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Frontend — what a person touches</text>
            <g fontFamily="inherit">
              <rect x="20" y="40" width="150" height="55" rx="10" fill="var(--gold-soft)" stroke="var(--gold)" />
              <text x="95" y="63" textAnchor="middle" fontSize="12" fill="var(--ink)">In-App Calling</text>
              <text x="95" y="79" textAnchor="middle" fontSize="10" fill="var(--ink-faint)">(licensed partner)</text>

              <rect x="195" y="40" width="150" height="55" rx="10" fill="var(--gold-soft)" stroke="var(--gold)" />
              <text x="270" y="63" textAnchor="middle" fontSize="12" fill="var(--ink)">Meeting Mode</text>
              <text x="270" y="79" textAnchor="middle" fontSize="10" fill="var(--ink-faint)">(mic, in-person)</text>

              <rect x="370" y="40" width="150" height="55" rx="10" fill="var(--gold-soft)" stroke="var(--gold)" />
              <text x="445" y="63" textAnchor="middle" fontSize="12" fill="var(--ink)">Speak or Type</text>
              <text x="445" y="79" textAnchor="middle" fontSize="10" fill="var(--ink-faint)">a quick note</text>

              <rect x="545" y="40" width="210" height="55" rx="10" fill="var(--gold-soft)" stroke="var(--gold)" />
              <text x="650" y="63" textAnchor="middle" fontSize="12" fill="var(--ink)">Connected Tools</text>
              <text x="650" y="79" textAnchor="middle" fontSize="10" fill="var(--ink-faint)">Email · Slack · Teams · HR · CRM</text>

              <rect x="780" y="40" width="200" height="55" rx="10" fill="var(--gold-soft)" stroke="var(--gold)" />
              <text x="880" y="63" textAnchor="middle" fontSize="12" fill="var(--ink)">AI Assistant Chat</text>
              <text x="880" y="79" textAnchor="middle" fontSize="10" fill="var(--ink-faint)">questions, in / out</text>
            </g>

            <line x1="95" y1="95" x2="95" y2="135" stroke="var(--ink-faint)" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <line x1="270" y1="95" x2="270" y2="135" stroke="var(--ink-faint)" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <line x1="445" y1="95" x2="445" y2="135" stroke="var(--ink-faint)" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <line x1="650" y1="95" x2="650" y2="135" stroke="var(--ink-faint)" strokeWidth="1.5" markerEnd="url(#arrow)" />

            <text x="20" y="128" fontSize="12" fontFamily="var(--mono)" fill="var(--ink-faint)" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Backend — capture &amp; understand</text>
            <rect x="20" y="138" width="740" height="55" rx="10" fill="var(--bg-elev-2)" stroke="var(--hairline-strong)" />
            <text x="390" y="161" textAnchor="middle" fontSize="12" fill="var(--ink)">Recording / text saved → Speech-to-text (if audio) → AI reads it and understands it</text>
            <text x="390" y="179" textAnchor="middle" fontSize="10" fill="var(--ink-faint)">One call, meeting, or note at a time — the "first AI pass"</text>

            <line x1="390" y1="193" x2="390" y2="233" stroke="var(--ink-faint)" strokeWidth="1.5" markerEnd="url(#arrow)" />

            <rect x="20" y="238" width="740" height="55" rx="10" fill="var(--bg-elev-2)" stroke="var(--hairline-strong)" />
            <text x="390" y="261" textAnchor="middle" fontSize="12" fill="var(--ink)">Saved as a Structured Record</text>
            <text x="390" y="279" textAnchor="middle" fontSize="10" fill="var(--ink-faint)">Tagged with Company ID (invisible) + Department (Sales / HR / Tech / Operations)</text>

            <line x1="390" y1="293" x2="390" y2="333" stroke="var(--ink-faint)" strokeWidth="1.5" markerEnd="url(#arrow)" />

            <rect x="20" y="338" width="740" height="68" rx="10" fill="var(--bg-elev-solid)" stroke="var(--gold)" strokeWidth="2" />
            <text x="390" y="364" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--gold)">THE DATABASE</text>
            <text x="390" y="384" textAnchor="middle" fontSize="10" fill="var(--ink-faint)">Encrypted · Company-isolated (Row Level Security) · Continuously copied across multiple servers</text>
            <text x="390" y="399" textAnchor="middle" fontSize="10" fill="var(--ink-faint)">so one server failing never means data is lost</text>

            <line x1="390" y1="406" x2="390" y2="446" stroke="var(--ink-faint)" strokeWidth="1.5" markerEnd="url(#arrow)" />

            <rect x="20" y="451" width="740" height="55" rx="10" fill="var(--bg-elev-2)" stroke="var(--hairline-strong)" />
            <text x="390" y="474" textAnchor="middle" fontSize="12" fill="var(--ink)">Second AI Pass — Pattern-Finding (runs on a schedule, not per-call)</text>
            <text x="390" y="492" textAnchor="middle" fontSize="10" fill="var(--ink-faint)">Looks across hundreds of records at once to find what one record alone can't show</text>

            <line x1="390" y1="506" x2="390" y2="546" stroke="var(--ink-faint)" strokeWidth="1.5" markerEnd="url(#arrow)" />

            <text x="20" y="538" fontSize="12" fontFamily="var(--mono)" fill="var(--ink-faint)" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Back to the frontend — what a person sees</text>
            <rect x="20" y="548" width="230" height="55" rx="10" fill="var(--gold-soft)" stroke="var(--gold)" />
            <text x="135" y="571" textAnchor="middle" fontSize="12" fill="var(--ink)">Ask a Plain Question,</text>
            <text x="135" y="587" textAnchor="middle" fontSize="12" fill="var(--ink)">Get a Real Answer</text>

            <rect x="270" y="548" width="230" height="55" rx="10" fill="var(--gold-soft)" stroke="var(--gold)" />
            <text x="385" y="571" textAnchor="middle" fontSize="12" fill="var(--ink)">Top Insights</text>
            <text x="385" y="587" textAnchor="middle" fontSize="12" fill="var(--ink)">Every Week &amp; Month</text>

            <rect x="520" y="548" width="240" height="55" rx="10" fill="var(--gold-soft)" stroke="var(--gold)" />
            <text x="640" y="571" textAnchor="middle" fontSize="12" fill="var(--ink)">Six-Month Contribution</text>
            <text x="640" y="587" textAnchor="middle" fontSize="12" fill="var(--ink)">Report to the CEO</text>

            <path d="M880,95 C 880,260 770,260 770,365" fill="none" stroke="var(--ink-faint)" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow)" />
            <text x="800" y="230" fontSize="9" fill="var(--ink-faint)" textAnchor="middle" transform="rotate(90 800,230)">reads from the database directly</text>
          </svg>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="eyebrow">{eyebrow}</div>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: sub ? 8 : 0 }}>{title}</h3>
      {sub && <p style={{ color: "var(--ink-dim)", fontSize: 14, maxWidth: 680, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

function LeadPipelineSection() {
  return (
    <section className="section section-alt">
      <div className="wrap">
        <SectionHeader
          eyebrow="1. Lead Management"
          title="A lead moves through five stages, in order."
          sub="Every lead belongs to exactly one company and one stage at a time. Stage changes should be logged (who changed it, when, from what to what) — that history is itself valuable institutional memory later."
        />
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          {LEAD_STAGES.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "1px solid var(--gold-soft)",
                  background: "var(--gold-soft)",
                  color: "var(--gold)",
                  fontSize: 13.5,
                  whiteSpace: "nowrap",
                }}
              >
                {s}
              </div>
              {i < LEAD_STAGES.length - 1 && <span style={{ color: "var(--ink-faint)" }}>→</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MultiTenantSection() {
  return (
    <section className="section">
      <div className="wrap">
        <SectionHeader
          eyebrow="2. Multi-Tenant System"
          title="Every table is scoped to a company_id. No exceptions."
          sub="This is the single most important rule in the schema. One company must never be able to see another company's leads, users, or interactions — even by accident, even through a bug in application code."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          <div className="step-card">
            <h4 style={{ marginBottom: 8 }}>Every table gets company_id</h4>
            <p style={{ fontSize: 13, color: "var(--ink-dim)", lineHeight: 1.6 }}>
              users, leads, interactions, strategies, outcomes, tags — all carry a company_id
              foreign key. There is no "global" row that isn't owned by a company.
            </p>
          </div>
          <div className="step-card">
            <h4 style={{ marginBottom: 8 }}>Enforce it at the database, not just the app</h4>
            <p style={{ fontSize: 13, color: "var(--ink-dim)", lineHeight: 1.6 }}>
              Postgres Row Level Security (RLS) policies should filter every query by the
              requesting user's company_id automatically. Application-layer filtering alone is a
              single missed WHERE clause away from a data leak.
            </p>
          </div>
          <div className="step-card">
            <h4 style={{ marginBottom: 8 }}>No cross-company joins</h4>
            <p style={{ fontSize: 13, color: "var(--ink-dim)", lineHeight: 1.6 }}>
              Every query that joins leads → interactions → users must carry the same company_id
              through the whole chain. This is worth an automated test, not just code review.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  return (
    <section className="section section-alt">
      <div className="wrap">
        <SectionHeader
          eyebrow="3. User Auth &amp; Roles"
          title="Three roles, each with a clearly smaller slice of access."
          sub="Standard email/password (or SSO later) login and signup, with a company selected or created at signup. Role-based access control gates what each user can see and do — enforced server-side, not just hidden in the UI."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {ROLES.map((r) => (
            <div key={r.role} className="step-card">
              <h4 style={{ marginBottom: 8, color: "var(--violet)" }}>{r.role}</h4>
              <p style={{ fontSize: 13, color: "var(--ink-dim)", lineHeight: 1.6 }}>{r.access}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SchemaSection() {
  return (
    <section className="section">
      <div className="wrap">
        <SectionHeader
          eyebrow="4. Database Design"
          title="Seven core tables."
          sub="This is a starting schema, not a final one — but it's enough to build the full lead → call → strategy → outcome loop end to end."
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TABLES.map((t) => (
            <div
              key={t.name}
              style={{
                padding: "16px 18px",
                borderRadius: 14,
                border: "1px solid var(--hairline)",
                background: "rgba(255,255,255,0.015)",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 14.5, color: "var(--gold)" }}>{t.name}</span>
                <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{t.note}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {t.columns.map((c) => (
                  <span
                    key={c}
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11.5,
                      padding: "4px 9px",
                      borderRadius: 6,
                      background: "var(--bg-elev-2)",
                      color: "var(--ink-dim)",
                      border: "1px solid var(--hairline)",
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VoiceInputSection() {
  return (
    <section className="section section-alt">
      <div className="wrap">
        <SectionHeader
          eyebrow="5. Voice Input System"
          title="Record, store, transcribe — in that order."
          sub="Voice is just another interaction. What matters is that raw audio and transcribed text are both kept — the transcript for search and AI processing, the raw audio as the source of truth if a transcript needs reviewing or is disputed."
        />
        <div className="steps-grid">
          <div className="step-card">
            <div className="icon">🎙</div>
            <h4>Record</h4>
            <p>Browser mic capture (MediaRecorder API) for live calls taken in-app, or a direct file upload for calls recorded elsewhere.</p>
          </div>
          <div className="step-card">
            <div className="icon">☁️</div>
            <h4>Store raw audio</h4>
            <p>Upload to object storage (Supabase Storage or S3). Save the resulting URL on the interaction row — never store audio blobs directly in Postgres.</p>
          </div>
          <div className="step-card">
            <div className="icon">📝</div>
            <h4>Transcribe</h4>
            <p>Send the audio to a speech-to-text API (placeholder: OpenAI Whisper, Deepgram, or AssemblyAI) and store the returned text on the same interaction row.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function InteractionLogicSection() {
  return (
    <section className="section">
      <div className="wrap">
        <SectionHeader
          eyebrow="6. Interaction Logic"
          title="Every call or meeting captures the same shape of data."
          sub="Whether it's typed manually by a rep or extracted by AI from a transcript, every interaction should resolve to this same structure so reporting and search work identically regardless of source."
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {["Client questions", "Sales responses", "Objections raised", "Deal stage at that moment", "Free-text notes"].map((f) => (
            <span
              key={f}
              style={{
                fontSize: 13,
                padding: "8px 14px",
                borderRadius: 999,
                border: "1px solid var(--hairline-strong)",
                color: "var(--ink-dim)",
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function AIProcessingSection() {
  return (
    <section className="section section-alt">
      <div className="wrap">
        <SectionHeader
          eyebrow="7. AI Processing (Simulated Here, Real There)"
          title="One function: transcript in, structured data out."
          sub="In this prototype, this step is simulated with pre-written examples. In production, this is a single LLM call with a strict output schema — cheap, fast, and the same shape every time."
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "stretch" }}>
          <div className="step-card">
            <h4 style={{ marginBottom: 10 }}>Input</h4>
            <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-dim)", lineHeight: 1.6 }}>
              "...honestly the price is a bit steep for where we are right now, but if you could
              phase the rollout we might be able to make it work by Q2..."
            </p>
          </div>
          <div className="step-card">
            <h4 style={{ marginBottom: 10 }}>Output (structured)</h4>
            <pre style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--green)", whiteSpace: "pre-wrap", lineHeight: 1.6, margin: 0 }}>
{`{
  "objections": ["price"],
  "sentiment": "neutral",
  "next_steps": ["send phased rollout proposal by Q2"]
}`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchFilterSection() {
  return (
    <section className="section">
      <div className="wrap">
        <SectionHeader
          eyebrow="8. Search &amp; Filter"
          title="Search leads by name; filter by stage, industry, or tags."
          sub="Postgres full-text search (or a dedicated index like pg_trgm) handles free-text search on lead/company name well at this scale — no need for a separate search service early on."
        />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["Stage", "Industry", "Tags"].map((f) => (
            <span key={f} style={{ fontSize: 12.5, fontFamily: "var(--mono)", padding: "6px 12px", borderRadius: 8, background: "var(--bg-elev-2)", color: "var(--violet)", border: "1px solid var(--hairline)" }}>
              filter: {f.toLowerCase()}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ListeningSection() {
  return (
    <section className="section section-alt">
      <div className="wrap">
        <SectionHeader
          eyebrow="The Open Question"
          title="How does the app actually 'listen' to a call?"
          sub="There isn't one universal answer — it depends on where the call happens. Realistically, there are two paths, and most real products start with the first and add the second later."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          <div className="step-card">
            <h4 style={{ marginBottom: 8, color: "var(--gold)" }}>Path A — After the call (start here)</h4>
            <p style={{ fontSize: 13, color: "var(--ink-dim)", lineHeight: 1.7 }}>
              The call happens on Zoom, Teams, or a phone line. The platform's own cloud recording
              finishes and fires a webhook (Zoom/Teams both support this) with a link to the
              recording. The app downloads it, transcribes it, and processes it — all after the
              fact. Simple, reliable, and works with tools people already use.
            </p>
          </div>
          <div className="step-card">
            <h4 style={{ marginBottom: 8, color: "var(--violet)" }}>Path B — Live, in-app (phase 2)</h4>
            <p style={{ fontSize: 13, color: "var(--ink-dim)", lineHeight: 1.7 }}>
              The call happens inside the product itself (via Twilio Voice or a WebRTC widget),
              streamed in real time to a live transcription API (Deepgram or AssemblyAI both
              support streaming). This enables real-time coaching ("they just raised a price
              objection") but is meaningfully more complex and costly — worth building once Path
              A proves the concept.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type SimStep = {
  id: string;
  label: string;
  table?: string;
  detail: string;
  data?: string;
};

const SIM_STEPS: SimStep[] = [
  {
    id: "call",
    label: "Call happens",
    detail: "Sales rep Priya Nair finishes a 22-minute call with a lead in the 'Meeting Done' stage.",
  },
  {
    id: "webhook",
    label: "Recording delivered",
    detail: "Zoom's cloud recording completes and sends a webhook with a download link to the recording.",
  },
  {
    id: "store-audio",
    label: "Raw audio stored",
    table: "interactions",
    detail: "Audio file is downloaded and uploaded to object storage. The URL is saved on a new interactions row.",
    data: `INSERT INTO interactions (company_id, lead_id, type, audio_url)\nVALUES ('acme-co', 'lead_884', 'call', 'storage://calls/884-priya.mp3')`,
  },
  {
    id: "transcribe",
    label: "Speech-to-text runs",
    table: "interactions",
    detail: "Audio is sent to a transcription API. The returned text is saved on the same row.",
    data: `UPDATE interactions SET transcript_text = '...if you could phase the rollout we might make it work by Q2...'\nWHERE id = 'int_5521'`,
  },
  {
    id: "extract",
    label: "AI extracts structured data",
    detail: "The transcript is sent to an LLM with a fixed output schema.",
    data: `{\n  "objections": ["price"],\n  "sentiment": "neutral",\n  "next_steps": ["send phased rollout proposal by Q2"]\n}`,
  },
  {
    id: "save-strategy",
    label: "Strategy recorded",
    table: "strategies",
    detail: "The extracted next step becomes a recommended strategy, linked back to this exact call.",
    data: `INSERT INTO strategies (lead_id, based_on_interaction_id, recommended_approach)\nVALUES ('lead_884', 'int_5521', 'Send phased rollout proposal by Q2')`,
  },
  {
    id: "advance-lead",
    label: "Lead stage updates",
    table: "leads",
    detail: "The lead moves from 'Meeting Done' to 'Proposal Sent' once the proposal actually goes out.",
    data: `UPDATE leads SET stage = 'proposal_sent', updated_at = now()\nWHERE id = 'lead_884'`,
  },
];

function BackendSimulationSection() {
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function run() {
    if (running) return;
    setRunning(true);
    setCurrentStep(0);
    let i = 0;
    const advance = () => {
      i += 1;
      if (i < SIM_STEPS.length) {
        setCurrentStep(i);
        timerRef.current = setTimeout(advance, 1400);
      } else {
        setRunning(false);
      }
    };
    timerRef.current = setTimeout(advance, 1400);
  }

  return (
    <section className="section">
      <div className="wrap">
        <SectionHeader
          eyebrow="Put It Together"
          title="Watch one call move through the entire backend."
          sub="This traces exactly one interaction from the moment a call ends to the moment the lead's stage updates — the same pipeline described in every section above, end to end."
        />

        <button className="btn-primary" onClick={run} disabled={running} style={{ marginBottom: 24 }}>
          {running ? "Running…" : "Simulate a Sales Call"}
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SIM_STEPS.map((step, i) => {
            const active = i === currentStep;
            const done = i < currentStep || (!running && currentStep === SIM_STEPS.length - 1 && i <= currentStep);
            const reached = i <= currentStep;
            return (
              <div
                key={step.id}
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: `1px solid ${active ? "var(--gold)" : reached ? "var(--green-soft)" : "var(--hairline)"}`,
                  background: active ? "var(--gold-soft)" : reached ? "var(--green-soft)" : "rgba(255,255,255,0.015)",
                  opacity: reached ? 1 : 0.5,
                  transition: "all .3s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: reached ? 6 : 0, flexWrap: "wrap" }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontFamily: "var(--mono)",
                      background: reached ? "var(--gold)" : "var(--bg-elev-3)",
                      color: reached ? "var(--gold-ink)" : "var(--ink-faint)",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--ink)" }}>{step.label}</span>
                  {step.table && (
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--ink-faint)", border: "1px solid var(--hairline)", borderRadius: 6, padding: "2px 7px" }}>
                      {step.table}
                    </span>
                  )}
                </div>
                {reached && (
                  <>
                    <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginBottom: step.data ? 8 : 0 }}>{step.detail}</p>
                    {step.data && (
                      <pre
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 11,
                          color: "var(--ink-dim)",
                          background: "var(--bg-elev-solid)",
                          border: "1px solid var(--hairline)",
                          borderRadius: 8,
                          padding: "10px 12px",
                          overflowX: "auto",
                          whiteSpace: "pre",
                          margin: 0,
                        }}
                      >
                        {step.data}
                      </pre>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
