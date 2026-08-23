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
  { id: "advisor", label: "🎯 Strategy Advisor" },
  { id: "voice", label: "🎙 Voice Capture" },
  { id: "learning", label: "📈 AI Learning" },
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
        <div className="brand">
          <span className="brand-mark" />
          My Campus Buddy
        </div>
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
              {tab === "advisor" && <AdvisorPanel />}
              {tab === "voice" && <VoicePanel showToast={showToast} />}
              {tab === "learning" && <LearningPanel showToast={showToast} events={events} />}
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
        <textarea
          placeholder="Full detail (optional) — why it happened, who was involved, the outcome"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
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

function LearningPanel({ showToast, events }: { showToast: (t: string) => void; events: MemoryEvent[] }) {
  const [meetings, setMeetings] = useState(248);
  const [lessons, setLessons] = useState(61);
  const [connections, setConnections] = useState(1204);
  const [experts, setExperts] = useState(37);

  function simulate() {
    setMeetings((m) => m + 1);
    if (Math.random() < 0.5) setLessons((l) => l + 1);
    setConnections((c) => c + Math.floor(Math.random() * 14) + 4);
    if (Math.random() < 0.25) setExperts((e) => e + 1);
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
    </div>
  );
}
