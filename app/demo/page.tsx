"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const FUNCTIONS_URL =
  process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL || "";

type ChatMsg = { role: "user" | "assistant"; content: string };
type MemoryEvent = {
  id?: string;
  occurred_on: string;
  type: "decision" | "lesson" | "loss" | "project";
  title: string;
  summary: string;
  detail?: string;
};

const GRAPH_NODES: { id: string; label: string; type: "person" | "project" | "decision" | "customer"; info: string }[] = [
  { id: "priya", label: "Priya Nair", type: "person", info: "VP Sales. Closed 9 of the last 11 deals involving a price objection, mostly using phased-rollout structures." },
  { id: "jordan", label: "Jordan Patel", type: "person", info: "Head of Client Onboarding. Introduced the dedicated-owner onboarding model after the Atlas Corp loss." },
  { id: "meridian", label: "Meridian Co.", type: "customer", info: "Enterprise account. Pricing objection resolved with a phased rollout instead of a discount — now the default playbook." },
  { id: "atlas", label: "Atlas Corp", type: "customer", info: "Churned in 2024 after a 6-week onboarding delay. Directly led to the dedicated-owner onboarding model." },
  { id: "onboarding", label: "Onboarding Model", type: "decision", info: "Dedicated owner per enterprise client, replacing a shared queue. Zero onboarding-related churn since." },
  { id: "falcon", label: "Falcon Migration", type: "project", info: "Ran 5 weeks over schedule. Lesson: budget 30% extra time for migrations touching data older than 3 years." },
];

const NODE_COLOR: Record<string, string> = {
  person: "var(--violet)",
  project: "var(--green)",
  decision: "var(--gold)",
  customer: "var(--rose)",
};

const TABS = [
  { id: "workspace", label: "💬 AI Workspace" },
  { id: "timeline", label: "🕘 Timeline" },
  { id: "graph", label: "🕸 Knowledge Graph" },
  { id: "memory", label: "📋 Decision Memory" },
  { id: "insights", label: "📊 Insights & Analytics" },
  { id: "advisor", label: "🎯 Strategy Advisor" },
  { id: "voice", label: "🎙 Voice Capture" },
  { id: "learning", label: "📈 AI Learning" },
  { id: "admin", label: "⚙️ Admin & Access" },
  { id: "capture", label: "📞 Data Capture" },
  { id: "rewards", label: "🏆 Contribution & Rewards" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Demo() {
  const [tab, setTab] = useState<TabId>("workspace");
  const [events, setEvents] = useState<MemoryEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/memory")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data.events) ? data.events : []))
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false));
  }, []);

  function showToast(text: string) {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }

  async function addEvent(ev: MemoryEvent) {
    const res = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ev),
    });
    const data = await res.json();
    if (data?.event) {
      setEvents((prev) => [data.event, ...prev]);
      showToast("Institutional memory updated with 1 new entry.");
      return true;
    }
    return false;
  }

  return (
    <>
      <nav className="site-nav">
        <Link href="/" className="brand">
          <span className="brand-mark" />
          My Campus Buddy
        </Link>
        <div className="nav-links">
          <Link href="/">← Back to overview</Link>
        </div>
      </nav>

      <section className="section" id="demo">
        <div className="wrap">
          <div className="section-head center">
            <div className="eyebrow" style={{ justifyContent: "center" }}>See It For Yourself</div>
            <h2>Step inside the workspace.</h2>
            <p>This is a real, working prototype — ask questions, add a real decision, and watch it start using it.</p>
          </div>

          <div className="demo-shell">
            <div className="demo-topbar">
              <div className="demo-title">Northwind Industries — Workspace</div>
              <div className="demo-badge">Live demo · real AI · mock company history</div>
            </div>
            <div className="demo-tabs">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`demo-tab ${tab === t.id ? "active" : ""}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="demo-panel">
              {tab === "workspace" && <WorkspacePanel />}
              {tab === "timeline" && (
                <TimelinePanel events={events} loading={loadingEvents} onAdd={addEvent} />
              )}
              {tab === "graph" && <GraphPanel />}
              {tab === "memory" && <MemoryPanel events={events} loading={loadingEvents} />}
              {tab === "insights" && <InsightsPanel />}
              {tab === "advisor" && <AdvisorPanel />}
              {tab === "voice" && <VoicePanel showToast={showToast} />}
              {tab === "learning" && <LearningPanel showToast={showToast} events={events} />}
              {tab === "admin" && <AdminPanel showToast={showToast} />}
              {tab === "capture" && <DataCapturePanel showToast={showToast} />}
              {tab === "rewards" && <ContributionPanel showToast={showToast} />}
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        My Campus Buddy — a concept prototype. All institution names, people, and data shown in the demo are illustrative.
      </footer>

      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}

function MicButton({ samples, onResult }: { samples: string[]; onResult: (text: string) => void }) {
  const [active, setActive] = useState(false);
  function startListening() {
    if (active) return;
    setActive(true);
    setTimeout(() => {
      const phrase = samples[Math.floor(Math.random() * samples.length)];
      onResult(phrase);
      setActive(false);
    }, 1300);
  }
  return (
    <button
      type="button"
      onClick={startListening}
      aria-label="Speak instead of typing (simulated)"
      title="Tap to speak — faster than typing (simulated)"
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        flexShrink: 0,
        border: `1.5px solid ${active ? "var(--rose)" : "var(--gold)"}`,
        background: active ? "var(--rose)" : "var(--gold)",
        cursor: active ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: active ? "0 0 0 4px var(--rose-soft)" : "0 0 0 3px var(--gold-soft)",
        transition: "all .2s ease",
      }}
    >
      {active ? (
        <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--gold-ink)" }} />
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="2" width="6" height="12" rx="3" fill="var(--gold-ink)" />
          <path d="M5 11a7 7 0 0 0 14 0" stroke="var(--gold-ink)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <line x1="12" y1="18" x2="12" y2="22" stroke="var(--gold-ink)" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="22" x2="16" y2="22" stroke="var(--gold-ink)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

function WorkspacePanel() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ text: string; ok: boolean } | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hi, I'm Northwind's AI Brain. Ask me about a past decision, a customer, or upload a document and ask about that too.",
      },
    ]);
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, sending]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await fetch(`${FUNCTIONS_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: next.slice(-10) }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.error || "I ran into an issue just now — mind trying again?" },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I couldn't reach the AI backend just now — mind trying again?" },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function handleFile(file: File) {
    setUploadStatus({ text: `Reading ${file.name}…`, ok: true });
    const text = await file.text();
    try {
      const res = await fetch(`${FUNCTIONS_URL}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, content: text }),
      });
      const data = await res.json();
      if (data.id) {
        setUploadStatus({
          text: `✓ "${data.filename}" uploaded (${data.charCount.toLocaleString()} characters) — ask about it below.`,
          ok: true,
        });
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `I've read "${data.filename}". Ask me anything about it.` },
        ]);
      } else {
        setUploadStatus({ text: data.error || "Upload failed — please try again.", ok: false });
      }
    } catch {
      setUploadStatus({ text: "Upload failed — please try again.", ok: false });
    }
  }

  const chips = [
    "Why was the Meridian pricing decision made?",
    "Why did we lose Atlas Corp?",
    "Who is the expert on enterprise pricing negotiations?",
  ];

  return (
    <div>
      <div className="panel-eyebrow">AI Workspace</div>
      <div className="panel-title">Good morning. How can I help you today?</div>
      <p className="panel-sub">
        Ask anything about the institution's history — or start with a suggestion below. This is a real API
        call to a live AI model, grounded in Northwind's mock institutional history.
      </p>

      <div className="upload-shell">
        <div style={{ fontSize: 20 }}>📄</div>
        <div className="txt">
          <strong>Upload a real document</strong>
          <span>.txt or .md for now — ask about it below, for real</span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md"
          style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <button className="upload-btn" onClick={() => fileRef.current?.click()}>
          Choose file
        </button>
        {uploadStatus && (
          <div className={`upload-status ${uploadStatus.ok ? "ok" : "err"}`}>{uploadStatus.text}</div>
        )}
      </div>

      <div className="chat-shell">
        <div className="chat-log" ref={logRef}>
          {messages.map((m, i) => (
            <div className={`msg ${m.role === "assistant" ? "ai" : "user"}`} key={i}>
              <div className="msg-avatar">{m.role === "assistant" ? "🧠" : "You"}</div>
              <div className="msg-bubble">{m.content}</div>
            </div>
          ))}
          {sending && (
            <div className="msg ai">
              <div className="msg-avatar">🧠</div>
              <div className="msg-bubble">
                <div className="typing-dot-row"><span /><span /><span /></div>
              </div>
            </div>
          )}
        </div>
        <div className="chip-row">
          {chips.map((c) => (
            <button className="chip" key={c} onClick={() => send(c)}>
              "{c}"
            </button>
          ))}
        </div>
        <div className="chat-input-row">
          <MicButton samples={chips} onResult={(t) => setInput(t)} />
          <input
            placeholder="Ask about Northwind's history…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
          />
          <button className="send-btn" onClick={() => send(input)} aria-label="Send">→</button>
        </div>
      </div>
    </div>
  );
}

function typeBadgeClass(t: string) {
  return { decision: "tb-decision", lesson: "tb-lesson", loss: "tb-loss", project: "tb-project" }[t] || "tb-decision";
}

function TimelinePanel({
  events,
  loading,
  onAdd,
}: {
  events: MemoryEvent[];
  loading: boolean;
  onAdd: (e: MemoryEvent) => Promise<boolean>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [type, setType] = useState<MemoryEvent["type"]>("decision");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!title.trim() || !summary.trim() || submitting) return;
    setSubmitting(true);
    const ok = await onAdd({
      occurred_on: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      type,
      title: title.trim(),
      summary: summary.trim(),
      detail: detail.trim(),
    });
    setSubmitting(false);
    if (ok) {
      setTitle("");
      setSummary("");
      setDetail("");
    }
  }

  return (
    <div>
      <div className="panel-eyebrow">Institutional Memory</div>
      <div className="panel-title">Institution Timeline</div>
      <p className="panel-sub">
        Every important event, decision, project, and lesson — in one continuous, real record. Click any
        card to expand it.
      </p>

      <div className="timeline-list">
        {loading && <p style={{ color: "var(--ink-faint)", fontSize: 13.5 }}>Loading timeline…</p>}
        {!loading && events.length === 0 && (
          <p style={{ color: "var(--ink-faint)", fontSize: 13.5 }}>No entries yet — add the first one below.</p>
        )}
        {events.map((e) => (
          <div className="timeline-item" key={e.id} onClick={() => setOpenId(openId === e.id ? null : e.id!)}>
            <div className="row1">
              <span className="date">{e.occurred_on}</span>
              <span className={`type-badge ${typeBadgeClass(e.type)}`}>{e.type}</span>
            </div>
            <h5>{e.title}</h5>
            <p>{e.summary}</p>
            {openId === e.id && e.detail && <div className="detail">{e.detail}</div>}
          </div>
        ))}
      </div>

      <div className="add-memory-form">
        <div className="panel-eyebrow" style={{ marginBottom: 10 }}>Add something new to institutional memory</div>
        <div className="type-row">
          {(["decision", "lesson", "loss", "project"] as const).map((t) => (
            <button
              key={t}
              className={`type-pill ${type === t ? "active" : ""}`}
              onClick={() => setType(t)}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="One-line summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <textarea
            placeholder="Full detail (optional) — why it happened, who was involved, the outcome"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            style={{ flex: 1 }}
          />
          <MicButton
            samples={[
              "We chose the phased rollout after the client pushed back on price, and it's closed 68% more often since.",
              "The onboarding delay came from underestimating the legacy data cleanup — we now budget 30% extra time for that.",
              "We lost this account after a support ticket sat unassigned for 11 hours. Led to the new on-call rotation.",
            ]}
            onResult={(t) => setDetail(t)}
          />
        </div>
        <button className="btn-primary" onClick={submit} disabled={submitting}>
          {submitting ? "Adding…" : "Add to memory"}
        </button>
      </div>
    </div>
  );
}

function MemoryPanel({ events, loading }: { events: MemoryEvent[]; loading: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div>
      <div className="panel-eyebrow">Institutional Memory</div>
      <div className="panel-title">Decision Memory</div>
      <p className="panel-sub">
        Open any recorded decision, lesson, or event to see the full detail behind it. This list is real
        and grows as you add to it from the Timeline panel.
      </p>
      <div className="timeline-list">
        {loading && <p style={{ color: "var(--ink-faint)", fontSize: 13.5 }}>Loading…</p>}
        {events.map((e) => (
          <div className="timeline-item" key={e.id} onClick={() => setOpenId(openId === e.id ? null : e.id!)}>
            <div className="row1">
              <span className="date">{e.occurred_on}</span>
              <span className={`type-badge ${typeBadgeClass(e.type)}`}>{e.type}</span>
            </div>
            <h5>{e.title}</h5>
            <p>{e.summary}</p>
            {openId === e.id && (
              <div className="detail">{e.detail || "No additional detail was recorded for this entry."}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GraphPanel() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div>
      <div className="panel-eyebrow">Institutional Memory</div>
      <div className="panel-title">Knowledge Graph</div>
      <span className="illustrative-badge">Illustrative — not wired to live data</span>
      <p className="panel-sub">
        How people, projects, customers, and decisions connect to each other. Click a node to see why it
        matters.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        {GRAPH_NODES.map((n) => (
          <button
            key={n.id}
            onClick={() => setActive(n.id)}
            style={{
              padding: "14px 18px",
              borderRadius: 14,
              border: `1px solid ${active === n.id ? NODE_COLOR[n.type] : "var(--hairline)"}`,
              background: active === n.id ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
              color: "var(--ink)",
              fontSize: 13.5,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: NODE_COLOR[n.type], display: "inline-block" }} />
            {n.label}
          </button>
        ))}
      </div>
      <div className="advisor-block">
        <h4>What My Campus Buddy knows</h4>
        <p style={{ fontSize: 13.5, color: "var(--ink-dim)" }}>
          {active ? GRAPH_NODES.find((n) => n.id === active)?.info : "Click any node above to see what it knows about it."}
        </p>
      </div>
    </div>
  );
}

function AdvisorPanel() {
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scenarios = [
    "Our pricing is too expensive, the customer says",
    "We're 6 weeks into onboarding and the client is getting frustrated",
    "A data migration project is running behind schedule",
  ];

  async function ask(text: string) {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${FUNCTIONS_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Act as the institution's Strategy Advisor. An employee describes this live situation: "${text}". Using the institution's real recorded history, give: 1) similar past cases, 2) a recommended approach, 3) the evidence behind it. Keep it concrete and under 150 words.`,
          history: [],
        }),
      });
      const data = await res.json();
      if (data.reply) setResult(data.reply);
      else setError(data.error || "The advisor couldn't respond just now — try again.");
    } catch {
      setError("Couldn't reach the AI backend just now — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="panel-eyebrow">Live Intelligence</div>
      <div className="panel-title">Strategy Advisor</div>
      <p className="panel-sub">
        Describe a live situation in your own words — this makes a real AI call grounded in the
        institution's actual recorded history.
      </p>
      <div className="scenario-select">
        {scenarios.map((s) => (
          <button key={s} className="chip" style={{ width: "fit-content" }} onClick={() => { setSituation(s); ask(s); }}>
            "{s}"
          </button>
        ))}
      </div>
      <div className="advisor-input-row">
        <MicButton samples={scenarios} onResult={(t) => setSituation(t)} />
        <input
          placeholder="Describe a live situation…"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(situation)}
        />
        <button className="btn-primary" onClick={() => ask(situation)} disabled={loading}>
          {loading ? "Thinking…" : "Get recommendation"}
        </button>
      </div>
      {error && <p style={{ color: "var(--rose)", fontSize: 13.5 }}>{error}</p>}
      {result && (
        <div className="advisor-block">
          <h4>💡 Recommendation</h4>
          <p style={{ fontSize: 14, color: "var(--ink-dim)", whiteSpace: "pre-wrap" }}>{result}</p>
        </div>
      )}
    </div>
  );
}

function VoicePanel({ showToast }: { showToast: (t: string) => void }) {
  const stages = ["Recording", "Transcription", "Knowledge Extraction", "Memory Update", "AI Learning"];
  const captions = [
    "Listening to the live client call…",
    "Converting speech into an accurate transcript…",
    "Identifying decisions, objections, and tactics discussed…",
    "Writing the new knowledge into permanent institutional memory…",
    "Updating recommendations for every future pricing conversation…",
  ];
  const [running, setRunning] = useState(false);
  const [stageIdx, setStageIdx] = useState(-1);
  const [done, setDone] = useState(false);

  function start() {
    if (running) return;
    setRunning(true);
    setDone(false);
    setStageIdx(0);
    stages.forEach((_, i) => {
      setTimeout(() => {
        setStageIdx(i);
        if (i === stages.length - 1) {
          setTimeout(() => {
            setRunning(false);
            setDone(true);
            showToast("Institutional memory updated with 1 new tactic.");
          }, 1000);
        }
      }, i * 1200);
    });
  }
  function reset() {
    setRunning(false);
    setDone(false);
    setStageIdx(-1);
  }

  return (
    <div>
      <div className="panel-eyebrow">Live Intelligence</div>
      <div className="panel-title">Voice Capture Demo</div>
      <span className="illustrative-badge">Illustrative — simulated capture, not a live recording</span>
      <p className="panel-sub">
        Simulate what happens when My Campus Buddy sits in on a meeting — from recording to a permanent
        update to institutional memory.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {stages.map((s, i) => (
          <div
            key={s}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              fontSize: 12.5,
              border: `1px solid ${i <= stageIdx ? "var(--gold-soft)" : "var(--hairline)"}`,
              color: i <= stageIdx ? "var(--gold)" : "var(--ink-faint)",
              background: i <= stageIdx ? "var(--gold-soft)" : "transparent",
            }}
          >
            {s}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13.5, color: "var(--ink-dim)", marginBottom: 20 }}>
        {stageIdx >= 0 ? captions[stageIdx] : "Press start to simulate My Campus Buddy capturing a live client call."}
      </p>
      {done && (
        <div className="advisor-block">
          <h4>Knowledge Extracted</h4>
          <p style={{ fontSize: 13.5, color: "var(--ink-dim)" }}>
            Objection: Price · Tactic: Phased rollout · Tactic: Free onboarding · Customer: Meridian Co.
          </p>
        </div>
      )}
      {!running && !done && <button className="btn-primary" onClick={start}>Start Simulated Recording</button>}
      {done && <button className="btn-secondary" onClick={reset}>Run Again</button>}
    </div>
  );
}

const MEETING_SCENARIOS = [
  { title: "Weekly Pipeline Review — Enterprise Sales", extracted: "Meridian Co.'s renewal risk is the integration timeline, not price — flagged to Priya Nair." },
  { title: "Onboarding Retro — Vantage Retail", extracted: "Dedicated-owner model cut onboarding to 9 days, the fastest yet. Logged as a repeatable pattern." },
  { title: "Exit Interview — Senior Platform Engineer", extracted: "Cited unclear promotion path, not compensation. Added to the attrition-factor pattern." },
  { title: "Marketing Retro — Q3 Vertical ABM", extracted: "Healthcare vertical campaign outperformed plan 2:1 on spend. Flagged for a budget increase." },
  { title: "Vendor Renewal Call — Logistics Partner", extracted: "Renegotiated SLA after 2 late shipments this quarter. Logged as precedent for future vendor terms." },
  { title: "All-Hands Q&A — CEO", extracted: "New remote-hire equity policy — cross-referenced against last year's similar policy outcome." },
  { title: "Customer Escalation — Bramwell Account", extracted: "Response-time gap in on-call coverage. Connected to the 2022 incident that created the rotation." },
];

function LearningPanel({ showToast, events }: { showToast: (t: string) => void; events: MemoryEvent[] }) {
  const [meetings, setMeetings] = useState(248);
  const [lessons, setLessons] = useState(61);
  const [connections, setConnections] = useState(1204);
  const [experts, setExperts] = useState(37);
  const [feed, setFeed] = useState<{ id: number; title: string; extracted: string; gained: number }[]>([]);

  function simulate() {
    const scenario = MEETING_SCENARIOS[Math.floor(Math.random() * MEETING_SCENARIOS.length)];
    const gained = Math.floor(Math.random() * 14) + 4;

    setMeetings((m) => m + 1);
    if (Math.random() < 0.5) setLessons((l) => l + 1);
    setConnections((c) => c + gained);
    if (Math.random() < 0.25) setExperts((e) => e + 1);
    setFeed((f) => [{ id: Date.now(), title: scenario.title, extracted: scenario.extracted, gained }, ...f].slice(0, 4));
    showToast("New meeting understood — institutional memory grew.");
  }

  return (
    <div>
      <div className="panel-eyebrow">Live Intelligence</div>
      <div className="panel-title">AI Learning</div>
      <span className="illustrative-badge">Illustrative growth simulation</span>
      <p className="panel-sub">
        Every meeting adds new connections to the institution's intelligence. Add a meeting below and watch
        the network grow. Real recorded entries so far: {events.length}.
      </p>
      <div className="stat-grid">
        <div className="stat-box"><div className="num">{meetings}</div><div className="lbl">Meetings understood</div></div>
        <div className="stat-box"><div className="num">{lessons}</div><div className="lbl">Lessons captured</div></div>
        <div className="stat-box"><div className="num">{connections.toLocaleString()}</div><div className="lbl">Connections mapped</div></div>
        <div className="stat-box"><div className="num">{experts}</div><div className="lbl">Experts identified</div></div>
      </div>
      <button className="btn-primary" onClick={simulate}>Simulate a New Meeting</button>

      {feed.length > 0 && (
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
          {feed.map((f) => (
            <div
              key={f.id}
              className="feed-item"
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid var(--hairline)",
                background: "rgba(255,255,255,0.015)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 13.5, color: "var(--ink)" }}>{f.title}</span>
                <span style={{ fontSize: 11.5, fontFamily: "var(--mono)", color: "var(--green)", whiteSpace: "nowrap" }}>
                  +{f.gained} connections
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--ink-dim)" }}>{f.extracted}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type Integration = {
  name: string;
  icon: string;
  desc: string;
  connected: boolean;
};

const INITIAL_INTEGRATIONS: Integration[] = [
  { name: "Gmail / Google Workspace", icon: "📧", desc: "Learns from email threads — decisions, commitments, and context — with employee approval before anything is stored.", connected: true },
  { name: "Slack", icon: "💬", desc: "Captures decisions and lessons surfaced in channel discussions and threads.", connected: true },
  { name: "Microsoft Teams", icon: "🧩", desc: "Same idea as Slack, for organizations standardized on Microsoft 365.", connected: false },
  { name: "Zoom / Meeting Recordings", icon: "🎥", desc: "Transcribes recorded meetings and extracts decisions, lessons, and who was in the room.", connected: true },
  { name: "Google / Outlook Calendar", icon: "🗓", desc: "Understands who was present for a given decision, without needing anyone to write it down.", connected: true },
  { name: "HR System (Workday / BambooHR)", icon: "🧑‍💼", desc: "Syncs org chart, titles, and seniority — this is what powers the clearance system below automatically.", connected: true },
  { name: "CRM (Salesforce / HubSpot)", icon: "📈", desc: "Learns from deal notes, win/loss reasons, and account history.", connected: true },
  { name: "Project Management (Jira / Asana / Linear)", icon: "🗂", desc: "Tracks project decisions, scope changes, and retrospectives.", connected: false },
  { name: "Voice Notes (mobile app)", icon: "🎙", desc: "Quick spoken asides — \"this always works,\" \"never promise that\" — captured before they're lost.", connected: true },
];

type Seniority = "Executive" | "Leadership" | "Manager" | "Individual Contributor";

type OrgUser = {
  id: number;
  name: string;
  title: string;
  seniority: Seniority;
  clearance: string;
};

const CLEARANCE_BY_SENIORITY: Record<Seniority, string> = {
  Executive: "Full access — every decision, financials, HR, and strategy record",
  Leadership: "Department + cross-functional history, no raw compensation/HR data",
  Manager: "Own team's decisions, lessons, and customer history",
  "Individual Contributor": "Own work plus team-level patterns — no financials or HR data",
};

const SAMPLE_NAMES = ["Riya Sharma", "Marcus Webb", "Lena Ortiz", "Sam Whitfield", "Dara Osei", "Nikhil Rao"];
const SAMPLE_TITLES: { title: string; seniority: Seniority }[] = [
  { title: "Regional Sales Manager", seniority: "Manager" },
  { title: "Marketing Coordinator", seniority: "Individual Contributor" },
  { title: "VP Operations", seniority: "Leadership" },
  { title: "Support Engineer", seniority: "Individual Contributor" },
  { title: "Finance Manager", seniority: "Manager" },
];

const INITIAL_USERS: OrgUser[] = [
  { id: 1, name: "Amara Chen", title: "CEO", seniority: "Executive", clearance: CLEARANCE_BY_SENIORITY.Executive },
  { id: 2, name: "Priya Nair", title: "VP Sales", seniority: "Leadership", clearance: CLEARANCE_BY_SENIORITY.Leadership },
  { id: 3, name: "Jordan Patel", title: "Head of Client Onboarding", seniority: "Leadership", clearance: CLEARANCE_BY_SENIORITY.Leadership },
  { id: 4, name: "Tom Okafor", title: "Sales Rep", seniority: "Individual Contributor", clearance: CLEARANCE_BY_SENIORITY["Individual Contributor"] },
];

function AdminPanel({ showToast }: { showToast: (t: string) => void }) {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [users, setUsers] = useState<OrgUser[]>(INITIAL_USERS);

  function toggleIntegration(name: string) {
    setIntegrations((list) =>
      list.map((i) => (i.name === name ? { ...i, connected: !i.connected } : i))
    );
    const target = integrations.find((i) => i.name === name);
    showToast(target?.connected ? `Disconnected ${name}.` : `Connected ${name} — backfilling history now.`);
  }

  function addUser() {
    const name = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
    const role = SAMPLE_TITLES[Math.floor(Math.random() * SAMPLE_TITLES.length)];
    const newUser: OrgUser = {
      id: Date.now(),
      name,
      title: role.title,
      seniority: role.seniority,
      clearance: CLEARANCE_BY_SENIORITY[role.seniority],
    };
    setUsers((u) => [...u, newUser]);
    showToast(`Added ${name} — clearance set automatically from title.`);
  }

  function removeUser(id: number) {
    const target = users.find((u) => u.id === id);
    setUsers((u) => u.filter((x) => x.id !== id));
    if (target) showToast(`Removed ${target.name}. Their contributions stay in institutional memory.`);
  }

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div>
      <div className="panel-eyebrow">Behind The Scenes</div>
      <div className="panel-title">Admin &amp; Access</div>
      <span className="illustrative-badge">Illustrative — the gist of how setup works</span>
      <p className="panel-sub">
        This is what an admin sees, not an end user. Everything above this tab is what the platform
        learns and surfaces — this is how that gets configured: what it's allowed to read from, and who's
        allowed to see what.
      </p>

      {/* Integrations */}
      <div className="advisor-block">
        <h4>Connected Sources ({connectedCount}/{integrations.length})</h4>
        <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginBottom: 14 }}>
          Every source is opt-in and can be scoped to specific teams or channels. Nothing is stored
          without the underlying content passing through approval — this list only controls what the
          AI is even allowed to look at.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {integrations.map((i) => (
            <div
              key={i.name}
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                border: `1px solid ${i.connected ? "var(--green-soft)" : "var(--hairline)"}`,
                background: i.connected ? "var(--green-soft)" : "rgba(255,255,255,0.015)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 17 }}>{i.icon}</span>
                  <span style={{ fontSize: 13.5, color: "var(--ink)" }}>{i.name}</span>
                </div>
                <button
                  onClick={() => toggleIntegration(i.name)}
                  style={{
                    fontSize: 11,
                    padding: "5px 11px",
                    borderRadius: 999,
                    border: `1px solid ${i.connected ? "var(--green)" : "var(--hairline-strong)"}`,
                    background: "transparent",
                    color: i.connected ? "var(--green)" : "var(--ink-faint)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {i.connected ? "Connected" : "Connect"}
                </button>
              </div>
              <p style={{ fontSize: 12, color: "var(--ink-dim)", lineHeight: 1.5 }}>{i.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Access & clearance */}
      <div className="advisor-block">
        <h4>Users &amp; Clearance</h4>
        <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginBottom: 14 }}>
          Clearance isn't set by hand per person — it's inherited automatically from title and
          seniority, synced from the HR system above. An admin can still override any individual case.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid var(--hairline)",
                background: "rgba(255,255,255,0.015)",
              }}
            >
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 13.5, color: "var(--ink)" }}>{u.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{u.title}</div>
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  fontFamily: "var(--mono)",
                  color: "var(--violet)",
                  border: "1px solid var(--violet-soft)",
                  background: "var(--violet-soft)",
                  borderRadius: 999,
                  padding: "3px 9px",
                  whiteSpace: "nowrap",
                }}
              >
                {u.seniority}
              </div>
              <div style={{ flex: 1.4, fontSize: 12, color: "var(--ink-dim)", minWidth: 180 }}>{u.clearance}</div>
              <button
                onClick={() => removeUser(u.id)}
                style={{
                  fontSize: 11.5,
                  padding: "5px 10px",
                  borderRadius: 999,
                  border: "1px solid var(--rose-soft)",
                  background: "transparent",
                  color: "var(--rose)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  flexShrink: 0,
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={addUser}>Add a User</button>
      </div>

      {/* How clearance works */}
      <div className="advisor-block">
        <h4>How Clearance Levels Work</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {(Object.keys(CLEARANCE_BY_SENIORITY) as Seniority[]).map((s) => (
            <div key={s} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
              <div style={{ width: 150, fontSize: 13, color: "var(--ink)", flexShrink: 0 }}>{s}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-dim)" }}>{CLEARANCE_BY_SENIORITY[s]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type CallStage = "idle" | "dialing" | "connected" | "ended" | "transcribing" | "extracting" | "done";

const CALL_LEADS = [
  { name: "Meridian Co.", contact: "David Osei, VP Procurement" },
  { name: "Vantage Retail", contact: "Sarah Kim, Director of Ops" },
  { name: "Atlas Corp", contact: "Marcus Webb, IT Lead" },
];

const CALL_OUTCOMES = [
  {
    transcriptLine: "\u201c...the price works if we can phase the rollout across two quarters instead of one...\u201d",
    objections: ["Rollout timeline"],
    sentiment: "Neutral, leaning positive",
    nextStep: "Send phased rollout proposal by Friday",
  },
  {
    transcriptLine: "\u201c...we already had a bad onboarding experience with our last vendor, so I need to see a dedicated point of contact...\u201d",
    objections: ["Onboarding trust"],
    sentiment: "Cautious",
    nextStep: "Introduce dedicated onboarding owner in next call",
  },
  {
    transcriptLine: "\u201c...honestly this looks good, just need sign-off from finance before we move forward...\u201d",
    objections: ["Internal approval pending"],
    sentiment: "Positive",
    nextStep: "Follow up in 5 business days",
  },
];

function DataCapturePanel({ showToast }: { showToast: (t: string) => void }) {
  const [selectedLead, setSelectedLead] = useState(CALL_LEADS[0].name);
  const [callStage, setCallStage] = useState<CallStage>("idle");
  const [callSeconds, setCallSeconds] = useState(0);
  const [callResult, setCallResult] = useState<(typeof CALL_OUTCOMES)[number] | null>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [meetingClient, setMeetingClient] = useState("");
  const [meetingCompany, setMeetingCompany] = useState("");
  const [meetingActive, setMeetingActive] = useState(false);
  const [meetingSeconds, setMeetingSeconds] = useState(0);
  const [meetingMinutes, setMeetingMinutes] = useState<string[] | null>(null);
  const meetingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [noteAbout, setNoteAbout] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteStage, setNoteStage] = useState<"idle" | "understanding" | "done">("idle");
  const [noteResult, setNoteResult] = useState<{ department: string; sentiment: string; nextStep: string } | null>(null);

  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (meetingTimerRef.current) clearInterval(meetingTimerRef.current);
    };
  }, []);

  function startCall() {
    if (callStage !== "idle" && callStage !== "done") return;
    setCallResult(null);
    setCallSeconds(0);
    setCallStage("dialing");
    setTimeout(() => {
      setCallStage("connected");
      callTimerRef.current = setInterval(() => setCallSeconds((s) => s + 1), 1000);
      const ringDuration = 4000 + Math.floor(Math.random() * 2000);
      setTimeout(() => {
        if (callTimerRef.current) clearInterval(callTimerRef.current);
        setCallStage("ended");
        setTimeout(() => setCallStage("transcribing"), 700);
        setTimeout(() => setCallStage("extracting"), 1800);
        setTimeout(() => {
          const outcome = CALL_OUTCOMES[Math.floor(Math.random() * CALL_OUTCOMES.length)];
          setCallResult(outcome);
          setCallStage("done");
          showToast(`Call with ${selectedLead} saved to Interactions automatically.`);
        }, 2900);
      }, ringDuration);
    }, 1300);
  }

  function startMeeting() {
    if (!meetingClient.trim() || !meetingCompany.trim()) {
      showToast("Select a client name and company first.");
      return;
    }
    setMeetingActive(true);
    setMeetingSeconds(0);
    setMeetingMinutes(null);
    meetingTimerRef.current = setInterval(() => setMeetingSeconds((s) => s + 1), 1000);
  }

  function endMeeting() {
    if (meetingTimerRef.current) clearInterval(meetingTimerRef.current);
    setMeetingActive(false);
    setMeetingMinutes([
      `Discussed current process gaps at ${meetingCompany} and where delays typically happen`,
      `${meetingClient} confirmed budget is approved for this quarter`,
      `Agreed on a follow-up demo focused on the reporting workflow specifically`,
      `Pattern detected: this is the third meeting this month citing "reporting delays" as the core pain point`,
    ]);
    showToast(`Meeting with ${meetingClient} transcribed — minutes and pattern saved automatically.`);
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  function saveNote() {
    if (!noteText.trim()) {
      showToast("Type something first — a quick note is enough.");
      return;
    }
    setNoteStage("understanding");
    setNoteResult(null);
    setTimeout(() => {
      const departments = ["Sales", "Operations", "HR", "Technology"];
      const sentiments = ["Positive", "Neutral", "Cautious"];
      const nextSteps = [
        "Linked to related past interactions automatically",
        "Flagged for follow-up next week",
        "No action needed — filed for future reference",
      ];
      setNoteResult({
        department: departments[Math.floor(Math.random() * departments.length)],
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
        nextStep: nextSteps[Math.floor(Math.random() * nextSteps.length)],
      });
      setNoteStage("done");
      showToast("Note saved to memory — no recording needed.");
    }, 1100);
  }

  return (
    <div>
      <div className="panel-eyebrow">Where The Data Actually Comes From</div>
      <div className="panel-title">Data Capture</div>
      <span className="illustrative-badge">Illustrative — simulates the real capture flow</span>
      <p className="panel-sub">
        Everything in this product starts here. Calls are placed through the application itself
        — not a separate phone app — so recording is automatic. In-person meetings work the same
        way, just triggered by hand instead of by dialing.
      </p>

      {/* In-app calling */}
      <div className="advisor-block">
        <h4>Call a Client — Placed Through the App</h4>
        <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginBottom: 14 }}>
          Not the phone's native dialer. The call happens inside the product, so the recording starts the moment the call connects — nobody has to remember to hit record.
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={selectedLead}
            onChange={(e) => setSelectedLead(e.target.value)}
            disabled={callStage !== "idle" && callStage !== "done"}
            style={{
              background: "var(--bg-elev-2)",
              border: "1px solid var(--hairline)",
              borderRadius: 10,
              padding: "10px 14px",
              color: "var(--ink)",
              fontSize: 13.5,
              fontFamily: "inherit",
            }}
          >
            {CALL_LEADS.map((l) => (
              <option key={l.name} value={l.name}>{l.name} — {l.contact}</option>
            ))}
          </select>
          <button
            className="btn-primary"
            onClick={startCall}
            disabled={callStage !== "idle" && callStage !== "done"}
          >
            {callStage === "idle" || callStage === "done" ? `Call ${selectedLead}` : "Call in progress…"}
          </button>
        </div>

        {callStage !== "idle" && (
          <div style={{ padding: "16px 18px", borderRadius: 14, border: "1px solid var(--hairline)", background: "rgba(255,255,255,0.015)" }}>
            {callStage === "dialing" && (
              <div style={{ fontSize: 13.5, color: "var(--ink-dim)" }}>📞 Dialing {selectedLead}…</div>
            )}
            {callStage === "connected" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
                <span style={{ fontSize: 13.5, color: "var(--ink)" }}>Connected — recording automatically</span>
                <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-faint)" }}>{fmt(callSeconds)}</span>
              </div>
            )}
            {callStage === "ended" && <div style={{ fontSize: 13.5, color: "var(--ink-dim)" }}>Call ended. Uploading recording…</div>}
            {callStage === "transcribing" && <div style={{ fontSize: 13.5, color: "var(--ink-dim)" }}>Transcribing audio…</div>}
            {callStage === "extracting" && <div style={{ fontSize: 13.5, color: "var(--ink-dim)" }}>Extracting objections, sentiment, and next steps…</div>}
            {callStage === "done" && callResult && (
              <div>
                <div style={{ fontSize: 12.5, color: "var(--ink-dim)", fontStyle: "italic", marginBottom: 10 }}>{callResult.transcriptLine}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 999, background: "var(--rose-soft)", color: "var(--rose)" }}>
                    Objection: {callResult.objections[0]}
                  </span>
                  <span style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 999, background: "var(--violet-soft)", color: "var(--violet)" }}>
                    Sentiment: {callResult.sentiment}
                  </span>
                  <span style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 999, background: "var(--green-soft)", color: "var(--green)" }}>
                    Next step: {callResult.nextStep}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* In-person meeting mode */}
      <div className="advisor-block">
        <h4>In-Person Meeting Mode</h4>
        <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginBottom: 14 }}>
          For meetings that don't happen over a call. Select who the meeting is with, and the app listens for the duration — no note-taking required.
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Client name"
            value={meetingClient}
            onChange={(e) => setMeetingClient(e.target.value)}
            disabled={meetingActive}
            style={{ background: "var(--bg-elev-2)", border: "1px solid var(--hairline)", borderRadius: 10, padding: "10px 14px", color: "var(--ink)", fontSize: 13.5, fontFamily: "inherit", flex: 1, minWidth: 160 }}
          />
          <input
            type="text"
            placeholder="Company name"
            value={meetingCompany}
            onChange={(e) => setMeetingCompany(e.target.value)}
            disabled={meetingActive}
            style={{ background: "var(--bg-elev-2)", border: "1px solid var(--hairline)", borderRadius: 10, padding: "10px 14px", color: "var(--ink)", fontSize: 13.5, fontFamily: "inherit", flex: 1, minWidth: 160 }}
          />
          {!meetingActive ? (
            <button className="btn-primary" onClick={startMeeting}>Start Meeting</button>
          ) : (
            <button className="btn-primary" onClick={endMeeting}>End Meeting</button>
          )}
        </div>

        {meetingActive && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 14, border: "1px solid var(--gold-soft)", background: "var(--gold-soft)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gold)" }} />
            <span style={{ fontSize: 13.5, color: "var(--ink)" }}>Listening — meeting with {meetingClient} at {meetingCompany}</span>
            <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-faint)" }}>{fmt(meetingSeconds)}</span>
          </div>
        )}

        {meetingMinutes && !meetingActive && (
          <div style={{ padding: "16px 18px", borderRadius: 14, border: "1px solid var(--hairline)", background: "rgba(255,255,255,0.015)" }}>
            <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--ink-faint)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Minutes of Meeting — Auto-Generated
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {meetingMinutes.map((m, i) => (
                <div key={i} style={{ fontSize: 13, color: i === meetingMinutes.length - 1 ? "var(--gold)" : "var(--ink-dim)" }}>
                  {i === meetingMinutes.length - 1 ? "🔎 " : "• "}{m}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual text entry */}
      <div className="advisor-block">
        <h4>Add a Quick Note — Speak It or Type It</h4>
        <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginBottom: 14 }}>
          Not everything needs a call or a meeting. Just hit the mic and say what happened — a hallway
          conversation, a decision made over email — it's understood and saved into memory exactly the
          same way a call is. Typing works too, for whenever that's easier.
        </p>
        <input
          type="text"
          placeholder="Who or what is this about? (optional)"
          value={noteAbout}
          onChange={(e) => setNoteAbout(e.target.value)}
          disabled={noteStage === "understanding"}
          style={{ background: "var(--bg-elev-2)", border: "1px solid var(--hairline)", borderRadius: 10, padding: "10px 14px", color: "var(--ink)", fontSize: 13.5, fontFamily: "inherit", width: "100%", marginBottom: 10, boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 12 }}>
          <textarea
            placeholder="Type your note here…"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            disabled={noteStage === "understanding"}
            rows={3}
            style={{ background: "var(--bg-elev-2)", border: "1px solid var(--hairline)", borderRadius: 10, padding: "10px 14px", color: "var(--ink)", fontSize: 13.5, fontFamily: "inherit", flex: 1, boxSizing: "border-box", resize: "vertical" }}
          />
          <MicButton
            samples={[
              "Client mentioned they're evaluating two other vendors, decision expected by end of month.",
              "Quick sync with the onboarding team — everything on track for the Friday go-live.",
              "Heads up: the finance contact changed, need to loop in the new person before the renewal call.",
            ]}
            onResult={(t) => setNoteText(t)}
          />
        </div>
        <button className="btn-primary" onClick={saveNote} disabled={noteStage === "understanding"}>
          {noteStage === "understanding" ? "Understanding…" : "Save Note"}
        </button>

        {noteStage === "done" && noteResult && (
          <div style={{ marginTop: 14, padding: "16px 18px", borderRadius: 14, border: "1px solid var(--hairline)", background: "rgba(255,255,255,0.015)" }}>
            <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--ink-faint)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Saved to Memory{noteAbout ? ` — ${noteAbout}` : ""}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 999, background: "var(--violet-soft)", color: "var(--violet)" }}>
                Filed as: {noteResult.department}
              </span>
              <span style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 999, background: "var(--gold-soft)", color: "var(--gold)" }}>
                Sentiment: {noteResult.sentiment}
              </span>
              <span style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 999, background: "var(--green-soft)", color: "var(--green)" }}>
                {noteResult.nextStep}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type Contributor = {
  id: number;
  name: string;
  title: string;
  callsLogged: number;
  meetingsCaptured: number;
  dataQuality: number;
  score: number;
};

const INITIAL_CONTRIBUTORS: Contributor[] = [
  { id: 1, name: "Priya Nair", title: "VP Sales", callsLogged: 84, meetingsCaptured: 22, dataQuality: 96, score: 942 },
  { id: 2, name: "Jordan Patel", title: "Head of Client Onboarding", callsLogged: 61, meetingsCaptured: 34, dataQuality: 93, score: 887 },
  { id: 3, name: "Tom Okafor", title: "Sales Rep", callsLogged: 58, meetingsCaptured: 11, dataQuality: 88, score: 640 },
  { id: 4, name: "Aisha Rahman", title: "Sales Rep", callsLogged: 49, meetingsCaptured: 9, dataQuality: 91, score: 588 },
  { id: 5, name: "Lena Vogt", title: "Sales Rep", callsLogged: 31, meetingsCaptured: 6, dataQuality: 82, score: 402 },
];

function ContributionPanel({ showToast }: { showToast: (t: string) => void }) {
  const [contributors] = useState<Contributor[]>(
    [...INITIAL_CONTRIBUTORS].sort((a, b) => b.score - a.score)
  );
  const [reportGenerated, setReportGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  function generateReport() {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setReportGenerated(true);
      showToast("Six-month contribution report sent to Founder & CEO.");
    }, 1400);
  }

  const maxScore = Math.max(...contributors.map((c) => c.score));

  return (
    <div>
      <div className="panel-eyebrow">Why People Actually Participate</div>
      <div className="panel-title">Contribution &amp; Rewards</div>
      <span className="illustrative-badge">Illustrative — simulates the scoring &amp; reporting cycle</span>
      <p className="panel-sub">
        Helping build the company's institutional memory isn't extra work people do out of
        goodwill — it's tracked, scored, and it's a real, visible factor in salary hikes and
        promotion decisions.
      </p>

      <div className="advisor-block">
        <h4>Contribution Scores — This Period</h4>
        <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginBottom: 14 }}>
          Every logged call, captured meeting, and the quality of what was captured feeds into an
          ongoing score — not a once-a-year guess from memory.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {contributors.map((c, i) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11.5,
                  fontFamily: "var(--mono)",
                  background: i === 0 ? "var(--gold)" : "var(--bg-elev-3)",
                  color: i === 0 ? "var(--gold-ink)" : "var(--ink-faint)",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ width: 150, flexShrink: 0 }}>
                <div style={{ fontSize: 13.5, color: "var(--ink)" }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{c.title}</div>
              </div>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--bg-elev-3)", overflow: "hidden" }}>
                <div style={{ width: `${(c.score / maxScore) * 100}%`, height: "100%", background: i === 0 ? "var(--gold)" : "var(--violet)" }} />
              </div>
              <div style={{ width: 190, fontSize: 11.5, color: "var(--ink-faint)", fontFamily: "var(--mono)", textAlign: "right", flexShrink: 0 }}>
                {c.callsLogged} calls · {c.meetingsCaptured} meetings · {c.dataQuality}% quality
              </div>
              <div style={{ width: 50, fontSize: 14, color: "var(--ink)", fontFamily: "var(--mono)", textAlign: "right", flexShrink: 0 }}>
                {c.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="advisor-block">
        <h4>Six-Month Report to the Founder &amp; CEO</h4>
        <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginBottom: 14 }}>
          Every six months, this ranking is compiled into a report and sent directly to
          leadership — a real, evidence-backed input into salary hikes and promotion decisions,
          not just activity tracked for its own sake.
        </p>
        {!reportGenerated ? (
          <button className="btn-primary" onClick={generateReport} disabled={generating}>
            {generating ? "Generating…" : "Generate Six-Month Report"}
          </button>
        ) : (
          <div style={{ padding: "18px 20px", borderRadius: 14, border: "1px solid var(--gold-soft)", background: "var(--gold-soft)" }}>
            <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--gold)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              To: Founder &amp; CEO — Contribution Report, H1
            </div>
            <p style={{ fontSize: 13, color: "var(--ink)", marginBottom: 10 }}>
              Top contributor this period: <strong>{contributors[0].name}</strong> ({contributors[0].title}) — score {contributors[0].score}, driven by {contributors[0].callsLogged} logged calls and {contributors[0].meetingsCaptured} captured meetings at {contributors[0].dataQuality}% data quality.
            </p>
            <p style={{ fontSize: 13, color: "var(--ink-dim)" }}>
              Recommended for consideration in this cycle's salary and promotion review, alongside standard performance criteria: <strong>{contributors[0].name}</strong> and <strong>{contributors[1].name}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function buildInsightsContext(d: {
  totalByQuarter: number[];
  revenueByIndustry: { label: string; pct: number }[];
  salesLeaderboard: { name: string; deals: number; winRate: number; quota: number }[];
  headcountTrend: { q: string; hires: number; departures: number }[];
  currentHeadcount: number;
  attritionRate: number;
  industryAttritionBenchmark: number;
  deptSpend: { dept: string; thisYear: number; lastYear: number; outcome: string }[];
  hiringSourceRetention: { source: string; avgTenureYears: number; hiresLastYear: number }[];
  hiringGeoRetention: { region: string; avgTenureYears: number }[];
  exitDestinations: { where: string; pct: number }[];
  exitFactor: string;
  campaignHistory10yr: { year: number; name: string; spend: number; pipeline: number; roi: number }[];
  decisionImpacts: { title: string; when: string; impact: string }[];
}): string {
  const lines: string[] = [];
  lines.push(`REVENUE BY QUARTER (last 4Q, $M): ${d.totalByQuarter.join(", ")}`);
  lines.push(`REVENUE BY INDUSTRY: ${d.revenueByIndustry.map((r) => `${r.label} ${r.pct}%`).join("; ")}`);
  lines.push(`SALES LEADERBOARD (this quarter): ${d.salesLeaderboard.map((r) => `${r.name} — ${r.deals} deals, ${r.winRate}% win rate, ${r.quota}% of quota`).join("; ")}`);
  lines.push(`HEADCOUNT: ${d.currentHeadcount} total. Attrition rate ${d.attritionRate}% vs ${d.industryAttritionBenchmark}% industry benchmark.`);
  lines.push(`HIRING/DEPARTURES BY QUARTER: ${d.headcountTrend.map((h) => `${h.q}: ${h.hires} hired, ${h.departures} departed`).join("; ")}`);
  lines.push(`DEPARTMENT SPEND vs LAST YEAR: ${d.deptSpend.map((s) => `${s.dept} $${s.thisYear}M (was $${s.lastYear}M) — ${s.outcome}`).join("; ")}`);
  lines.push(`RETENTION BY HIRING SOURCE (avg tenure): ${d.hiringSourceRetention.map((h) => `${h.source} ${h.avgTenureYears}y (${h.hiresLastYear} hires last year)`).join("; ")}`);
  lines.push(`RETENTION BY GEOGRAPHY (avg tenure): ${d.hiringGeoRetention.map((h) => `${h.region} ${h.avgTenureYears}y`).join("; ")}`);
  lines.push(`EXIT DESTINATIONS: ${d.exitDestinations.map((e) => `${e.where} ${e.pct}%`).join("; ")}`);
  lines.push(`EXIT FACTOR INSIGHT: ${d.exitFactor}`);
  lines.push(
    `MARKETING CAMPAIGN PERFORMANCE, LAST 10 YEARS (spend $M, pipeline generated $M, ROI multiple): ${d.campaignHistory10yr
      .map((c) => `${c.year} "${c.name}" — spend $${c.spend}M, pipeline $${c.pipeline}M, ${c.roi}x ROI`)
      .join("; ")}`
  );
  lines.push(`PAST DECISION IMPACTS: ${d.decisionImpacts.map((i) => `"${i.title}" (${i.when}) — ${i.impact}`).join("; ")}`);
  return lines.join("\n");
}

function InsightsChat({ insightsContext }: { insightsContext: string }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, sending]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await fetch(`${FUNCTIONS_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: next.slice(-10), context: insightsContext }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.error || "I ran into an issue just now — mind trying again?" },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I couldn't reach the AI backend just now — mind trying again?" },
      ]);
    } finally {
      setSending(false);
    }
  }

  const chips = [
    "Which marketing campaign has performed very well in the past 10 years?",
    "Which geography or industry should we double down on?",
    "Why do people actually leave, beyond the obvious answer?",
  ];

  return (
    <div className="advisor-block" style={{ marginBottom: 28 }}>
      <h4>Ask About These Numbers</h4>
      <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginBottom: 12 }}>
        The charts below are the headline view — ask a direct question and the AI will cross-reference
        the full underlying dataset, not just what's charted.
      </p>

      {messages.length > 0 && (
        <div
          ref={logRef}
          style={{
            maxHeight: 260,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 12,
            padding: "2px 2px 2px 2px",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "86%",
                padding: "9px 13px",
                borderRadius: 12,
                fontSize: 13,
                lineHeight: 1.55,
                background: m.role === "user" ? "var(--violet-soft)" : "var(--bg-elev-2)",
                border: `1px solid ${m.role === "user" ? "rgba(140,160,255,0.25)" : "var(--hairline)"}`,
                color: "var(--ink)",
              }}
            >
              {m.content}
            </div>
          ))}
          {sending && (
            <div style={{ alignSelf: "flex-start", fontSize: 12.5, color: "var(--ink-faint)", padding: "4px 2px" }}>
              Cross-referencing the data…
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => send(c)}
            disabled={sending}
            style={{
              fontSize: 12,
              padding: "7px 12px",
              borderRadius: 999,
              border: "1px solid var(--hairline-strong)",
              color: "var(--ink-dim)",
              background: "transparent",
              cursor: sending ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <MicButton samples={chips} onResult={(t) => setInput(t)} />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask a question about revenue, hiring, marketing, or past decisions…"
          style={{
            flex: 1,
            background: "var(--bg-elev-2)",
            border: "1px solid var(--hairline)",
            borderRadius: 999,
            padding: "11px 16px",
            color: "var(--ink)",
            fontSize: 13.5,
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={sending}
          aria-label="Send"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "var(--gold)",
            color: "var(--gold-ink)",
            border: "none",
            flexShrink: 0,
            cursor: sending ? "default" : "pointer",
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}

function InsightsPanel() {
  const [region, setRegion] = useState<"all" | "na" | "emea" | "apac">("all");

  const quarters = ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25"];
  const revenueByQuarter = [
    { na: 2.1, emea: 1.2, apac: 0.6 },
    { na: 2.3, emea: 1.3, apac: 0.7 },
    { na: 2.4, emea: 1.5, apac: 0.9 },
    { na: 2.8, emea: 1.6, apac: 1.1 },
  ];
  const totalByQuarter = revenueByQuarter.map((q) => q.na + q.emea + q.apac);
  const maxRevenue = Math.max(...totalByQuarter);
  const yoyGrowth = Math.round(((totalByQuarter[3] - totalByQuarter[0]) / totalByQuarter[0]) * 100);

  const salesLeaderboard = [
    { name: "Priya Nair", deals: 34, winRate: 61, quota: 118 },
    { name: "Devon Marsh", deals: 29, winRate: 54, quota: 104 },
    { name: "Aisha Rahman", deals: 26, winRate: 49, quota: 96 },
    { name: "Tom Okafor", deals: 21, winRate: 42, quota: 81 },
    { name: "Lena Vogt", deals: 18, winRate: 38, quota: 74 },
  ];

  const headcountTrend = [
    { q: "Q1 '25", hires: 12, departures: 7 },
    { q: "Q2 '25", hires: 15, departures: 9 },
    { q: "Q3 '25", hires: 9, departures: 11 },
    { q: "Q4 '25", hires: 14, departures: 6 },
  ];
  const currentHeadcount = 342;
  const attritionRate = 14.2;
  const industryAttritionBenchmark = 17.8;

  const deptSpend = [
    { dept: "Engineering", thisYear: 4.8, lastYear: 4.1, outcome: "3 major releases shipped, up from 2" },
    { dept: "Sales & Marketing", thisYear: 3.2, lastYear: 2.6, outcome: "Revenue grew 24% vs 24% spend growth" },
    { dept: "Customer Success", thisYear: 1.4, lastYear: 1.5, outcome: "Churn fell despite lower spend" },
    { dept: "Operations", thisYear: 1.1, lastYear: 1.2, outcome: "Consolidated two vendor contracts" },
  ];

  const revenueByIndustry = [
    { label: "Financial Services", pct: 32 },
    { label: "Healthcare", pct: 24 },
    { label: "Manufacturing", pct: 19 },
    { label: "Education", pct: 14 },
    { label: "Retail", pct: 11 },
  ];

  const hiringSourceRetention = [
    { source: "State University Network", avgTenureYears: 4.6, hiresLastYear: 22 },
    { source: "Referral (internal)", avgTenureYears: 4.1, hiresLastYear: 31 },
    { source: "Coding Bootcamp Partners", avgTenureYears: 2.3, hiresLastYear: 18 },
    { source: "General Job Boards", avgTenureYears: 1.8, hiresLastYear: 27 },
  ];
  const hiringGeoRetention = [
    { region: "Midwest, US", avgTenureYears: 4.4 },
    { region: "Northeast, US", avgTenureYears: 3.6 },
    { region: "West Coast, US", avgTenureYears: 2.4 },
    { region: "Remote (int'l)", avgTenureYears: 3.1 },
  ];

  const exitDestinations = [
    { where: "Direct competitor", pct: 34 },
    { where: "Larger enterprise co.", pct: 27 },
    { where: "Startup / early-stage", pct: 19 },
    { where: "Left workforce / other", pct: 20 },
  ];
  const exitFactor = "Compensation cited in 41% of exits, but of those, 68% also flagged \"unclear growth path\" — the growth path, not pay, is the recurring lead indicator.";

  const campaignPerformance = [
    { year: "2022", spend: 1.1, pipelineGenerated: 4.2 },
    { year: "2023", spend: 1.4, pipelineGenerated: 5.6 },
    { year: "2024", spend: 1.6, pipelineGenerated: 6.1 },
    { year: "2025", spend: 1.9, pipelineGenerated: 9.4 },
  ];
  const maxPipeline = Math.max(...campaignPerformance.map((c) => c.pipelineGenerated));

  const campaignHistory10yr = [
    { year: 2016, name: "Campus Outreach Tour", spend: 0.3, pipeline: 0.9 },
    { year: 2017, name: "Vertical ABM Pilot (Finance)", spend: 0.25, pipeline: 1.7 },
    { year: 2018, name: "Content & SEO Overhaul", spend: 0.4, pipeline: 1.5 },
    { year: 2019, name: "Vertical ABM Expansion (Healthcare)", spend: 0.6, pipeline: 2.8 },
    { year: 2020, name: "Virtual Events Pivot", spend: 0.5, pipeline: 1.6 },
    { year: 2021, name: "Partner Co-Marketing Program", spend: 0.8, pipeline: 3.1 },
    { year: 2022, name: "Rebrand Launch Campaign", spend: 1.1, pipeline: 4.2 },
    { year: 2023, name: "Vertical ABM (Manufacturing)", spend: 1.4, pipeline: 5.6 },
    { year: 2024, name: "AI Brain Product Launch Push", spend: 1.6, pipeline: 6.1 },
    { year: 2025, name: "Insights Platform Relaunch Campaign", spend: 1.9, pipeline: 9.4 },
  ].map((c) => ({ ...c, roi: Math.round((c.pipeline / c.spend) * 10) / 10 }));

  const decisionImpacts = [
    {
      title: "Dedicated-owner onboarding model",
      when: "Rolled out after the Atlas Corp loss",
      impact: "Onboarding-related churn: 0% since rollout, down from 3 accounts/year",
      tone: "green" as const,
    },
    {
      title: "Phased-rollout pricing (vs. discounting)",
      when: "Standardized after the Meridian Co. negotiation",
      impact: "Average deal margin held at 61%, vs. 48% when discounting was the default",
      tone: "gold" as const,
    },
    {
      title: "Falcon migration timeline",
      when: "Ran 5 weeks over schedule in Q2",
      impact: "New policy: +30% time buffer on migrations touching data older than 3 years",
      tone: "rose" as const,
    },
  ];

  const regionLabel: Record<typeof region, string> = {
    all: "All Regions",
    na: "North America",
    emea: "EMEA",
    apac: "APAC",
  };

  return (
    <div>
      <div className="panel-eyebrow">Institutional Intelligence</div>
      <div className="panel-title">Insights &amp; Analytics</div>
      <span className="illustrative-badge">Illustrative — grounded in realistic industry benchmarks</span>
      <p className="panel-sub">
        The kind of cross-functional view a consultant would spend weeks assembling — revenue, sales
        performance, people, spend, and the measurable outcome of past decisions, all in one place and
        always current.
      </p>

      <InsightsChat
        insightsContext={buildInsightsContext({
          totalByQuarter,
          revenueByIndustry,
          salesLeaderboard,
          headcountTrend,
          currentHeadcount,
          attritionRate,
          industryAttritionBenchmark,
          deptSpend,
          hiringSourceRetention,
          hiringGeoRetention,
          exitDestinations,
          exitFactor,
          campaignHistory10yr,
          decisionImpacts,
        })}
      />

      {/* Top stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard label="Trailing 4Q Revenue" value={`$${totalByQuarter.reduce((a, b) => a + b, 0).toFixed(1)}M`} sub={`+${yoyGrowth}% vs Q1`} tone="gold" />
        <StatCard label="Headcount" value={String(currentHeadcount)} sub={`${headcountTrend[3].hires} hired this Q`} tone="violet" />
        <StatCard label="Attrition Rate" value={`${attritionRate}%`} sub={`vs ${industryAttritionBenchmark}% industry avg`} tone="green" />
        <StatCard label="Avg. Deal Margin" value="61%" sub="up from 48% pre-2024" tone="rose" />
      </div>

      {/* Revenue section */}
      <div className="advisor-block">
        <h4>Revenue by Region</h4>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["all", "na", "emea", "apac"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: `1px solid ${region === r ? "var(--gold)" : "var(--hairline)"}`,
                background: region === r ? "var(--gold-soft)" : "transparent",
                color: region === r ? "var(--gold)" : "var(--ink-dim)",
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              {regionLabel[r]}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20, height: 160, padding: "0 4px" }}>
          {quarters.map((q, i) => {
            const d = revenueByQuarter[i];
            const value = region === "all" ? d.na + d.emea + d.apac : d[region as "na" | "emea" | "apac"];
            const heightPct = (value / maxRevenue) * 100;
            return (
              <div key={q} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ fontSize: 12, color: "var(--ink-dim)", marginBottom: 6, fontFamily: "var(--mono)" }}>
                  ${value.toFixed(1)}M
                </div>
                <div
                  style={{
                    width: "60%",
                    height: `${heightPct}%`,
                    minHeight: 4,
                    borderRadius: "6px 6px 0 0",
                    background: "linear-gradient(180deg, var(--gold), var(--gold-soft))",
                  }}
                />
                <div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 8 }}>{q}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue by industry */}
      <div className="advisor-block">
        <h4>Revenue by Industry</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {revenueByIndustry.map((r) => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 150, fontSize: 13, color: "var(--ink)" }}>{r.label}</div>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--bg-elev-3)", overflow: "hidden" }}>
                <div style={{ width: `${r.pct * 2.5}%`, maxWidth: "100%", height: "100%", background: "var(--violet)" }} />
              </div>
              <div style={{ width: 40, fontSize: 12, color: "var(--ink-faint)", fontFamily: "var(--mono)", textAlign: "right" }}>{r.pct}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sales leaderboard */}
      <div className="advisor-block">
        <h4>Sales Performance — This Quarter</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {salesLeaderboard.map((rep) => (
            <div key={rep.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 110, fontSize: 13, color: "var(--ink)" }}>{rep.name}</div>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--bg-elev-3)", overflow: "hidden" }}>
                <div style={{ width: `${rep.quota}%`, maxWidth: "100%", height: "100%", background: rep.quota >= 100 ? "var(--green)" : "var(--violet)" }} />
              </div>
              <div style={{ width: 130, fontSize: 12, color: "var(--ink-faint)", fontFamily: "var(--mono)", textAlign: "right" }}>
                {rep.deals} deals · {rep.winRate}% win · {rep.quota}% quota
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Headcount / attrition */}
      <div className="advisor-block">
        <h4>Hiring vs. Attrition</h4>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, height: 130, padding: "0 4px", marginBottom: 8 }}>
          {headcountTrend.map((h) => {
            const max = 16;
            return (
              <div key={h.q} style={{ display: "flex", gap: 6, alignItems: "flex-end", flex: 1, height: "100%", justifyContent: "center" }}>
                <div style={{ width: 18, height: `${(h.hires / max) * 100}%`, borderRadius: "4px 4px 0 0", background: "var(--green)" }} title={`${h.hires} hires`} />
                <div style={{ width: 18, height: `${(h.departures / max) * 100}%`, borderRadius: "4px 4px 0 0", background: "var(--rose)" }} title={`${h.departures} departures`} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 24, padding: "0 4px", marginBottom: 6 }}>
          {headcountTrend.map((h) => (
            <div key={h.q} style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: "var(--ink-faint)" }}>{h.q}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 12.5, color: "var(--ink-dim)" }}>
          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--green)", marginRight: 6 }} />Hires</span>
          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--rose)", marginRight: 6 }} />Departures</span>
        </div>
      </div>

      {/* Spend vs outcomes */}
      <div className="advisor-block">
        <h4>Spend vs. Outcomes by Department</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {deptSpend.map((d) => {
            const change = Math.round(((d.thisYear - d.lastYear) / d.lastYear) * 100);
            return (
              <div key={d.dept} style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid var(--hairline)", background: "rgba(255,255,255,0.015)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, color: "var(--ink)" }}>{d.dept}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: change >= 0 ? "var(--gold)" : "var(--green)" }}>
                    ${d.thisYear}M {change >= 0 ? "+" : ""}{change}% vs last year
                  </span>
                </div>
                <p style={{ fontSize: 12.5, color: "var(--ink-dim)" }}>{d.outcome}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision impact */}
      <div className="advisor-block">
        <h4>Impact of Past Decisions</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {decisionImpacts.map((d) => (
            <div
              key={d.title}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: `1px solid var(--${d.tone}-soft)`,
                background: `var(--${d.tone}-soft)`,
              }}
            >
              <div style={{ fontSize: 13.5, color: "var(--ink)", marginBottom: 2 }}>{d.title}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginBottom: 6 }}>{d.when}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-dim)" }}>{d.impact}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hiring source & retention */}
      <div className="advisor-block">
        <h4>Who Stays — By Hiring Source &amp; Geography</h4>
        <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginBottom: 14 }}>
          Average tenure, broken down by where a hire came from and where they're based.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontFamily: "var(--mono)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>By Source</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {hiringSourceRetention.map((h) => (
                <div key={h.source} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, fontSize: 12.5, color: "var(--ink)" }}>{h.source}</div>
                  <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--green)" }}>{h.avgTenureYears}y avg</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontFamily: "var(--mono)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>By Geography</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {hiringGeoRetention.map((h) => (
                <div key={h.region} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, fontSize: 12.5, color: "var(--ink)" }}>{h.region}</div>
                  <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--green)" }}>{h.avgTenureYears}y avg</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exit destinations & factors */}
      <div className="advisor-block">
        <h4>Where People Go — And Why</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 14 }}>
          {exitDestinations.map((e) => (
            <div key={e.where} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 170, fontSize: 12.5, color: "var(--ink)" }}>{e.where}</div>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--bg-elev-3)", overflow: "hidden" }}>
                <div style={{ width: `${e.pct * 2.5}%`, maxWidth: "100%", height: "100%", background: "var(--rose)" }} />
              </div>
              <div style={{ width: 34, fontSize: 12, color: "var(--ink-faint)", fontFamily: "var(--mono)", textAlign: "right" }}>{e.pct}%</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid var(--gold-soft)", background: "var(--gold-soft)" }}>
          <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--gold)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            The insight a survey alone wouldn't catch
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-dim)" }}>{exitFactor}</div>
        </div>
      </div>

      {/* Marketing performance */}
      <div className="advisor-block">
        <h4>Marketing Campaign Performance — 4 Years</h4>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, height: 140, padding: "0 4px", marginBottom: 8 }}>
          {campaignPerformance.map((c) => (
            <div key={c.year} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, height: "100%", justifyContent: "flex-end" }}>
              <div style={{ fontSize: 11.5, color: "var(--ink-dim)", marginBottom: 6, fontFamily: "var(--mono)" }}>${c.pipelineGenerated}M</div>
              <div
                style={{
                  width: "55%",
                  height: `${(c.pipelineGenerated / maxPipeline) * 100}%`,
                  minHeight: 4,
                  borderRadius: "6px 6px 0 0",
                  background: "linear-gradient(180deg, var(--violet), var(--violet-soft))",
                }}
              />
              <div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 8 }}>{c.year}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12.5, color: "var(--ink-dim)" }}>
          Pipeline generated per dollar spent has grown every year — from $3.8 return per $1 in 2022 to
          $4.9 per $1 in 2025 — a trend no single campaign report would reveal on its own.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "gold" | "violet" | "green" | "rose" }) {
  return (
    <div style={{ padding: "16px 18px", borderRadius: 14, border: "1px solid var(--hairline)", background: "rgba(255,255,255,0.015)" }}>
      <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontFamily: "var(--serif)", color: `var(--${tone})`, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--ink-dim)" }}>{sub}</div>
    </div>
  );
}
