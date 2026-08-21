"use client";

import { useEffect, useRef, useState } from "react";

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

const ROLES = [
  { title: "Executive Director", q: "\"Why did the last capital campaign fall short of target?\"" },
  { title: "Program Manager", q: "\"Have we run a project like this before, and how did it go?\"" },
  { title: "New Hire", q: "\"Who actually knows how to handle a vendor dispute here?\"" },
  { title: "Department Head", q: "\"What did we learn from the last accreditation review?\"" },
  { title: "Operations Lead", q: "\"Why did we switch vendors two years ago?\"" },
  { title: "Board Member", q: "\"What's our institution's track record on this kind of decision?\"" },
];

const KNOWLEDGE_SOURCES = [
  { icon: "💬", title: "Communication", body: "Emails, calls, meetings, and messages — with approval — turned into decisions, risks, and lessons instead of just transcripts." },
  { icon: "📄", title: "Documents", body: "Proposals, policies, reports, and minutes — understood for what changed and why, not just stored." },
  { icon: "🗂", title: "Existing Systems", body: "Your CRM, HRMS, and project tools — My Campus Buddy learns from work already happening there, no rip-and-replace." },
  { icon: "🗣", title: "Human Experience", body: "Quick voice notes and asides — \"this always works,\" \"never promise that\" — captured before they disappear with a person." },
];

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

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function showToast(text: string) {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }

  return (
    <>
      <nav className={`site-nav`}>
        <div className="brand">
          <span className="brand-mark" />
          My Campus Buddy
        </div>
        <div className="nav-links">
          <a href="#problem">The Problem</a>
          <a href="#how">How It Works</a>
          <a href="#roles">Who It's For</a>
          <a href="#compare">Why It Matters</a>
        </div>
        <a href="#demo" className="nav-cta">Explore Demo</a>
      </nav>

      <Hero />
      <Problem />
      <WhyMatters />
      <WhatIsIt />
      <HowItWorks />
      <HowItLearns />
      <WhoUsesIt />
      <Compare />
      <DemoSection showToast={showToast} />
      <Closing />

      <footer className="site-footer">
        My Campus Buddy — a concept prototype. All institution names, people, and data shown in the demo are illustrative.
      </footer>

      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="eyebrow">The internal intelligence layer for any institution</div>
        <h1>
          Your Institution Has Data.
          <br />
          Give It <em>a Memory.</em>
        </h1>
        <p className="sub">
          Every meeting, decision, lesson, member interaction, and hard-won experience becomes part of your
          institution's permanent intelligence — searchable, explainable, and never lost. Built for companies,
          government agencies, schools, religious institutions, and family offices alike.
        </p>
        <div className="btn-row">
          <a href="#demo" className="btn-primary">Explore Interactive Demo →</a>
          <a href="#problem" className="btn-secondary">See the problem it solves</a>
        </div>
        <div className="hero-note">No setup. No login. Just explore.</div>
      </div>
    </section>
  );
}

function Problem() {
  const leaks = [
    "Experience — the instinct built from doing something 100 times",
    "Decision-making — the reasoning behind hard calls",
    "Institutional knowledge — quiet expertise about how things actually work here",
    "Member/customer understanding — what someone really cares about, unspoken",
    "Problem-solving skill — how a tricky situation was actually untangled",
    "Lessons learned — the mistake nobody wants to repeat",
  ];
  return (
    <section className="section" id="problem">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">The Problem</div>
          <h2>Institutions don't just lose people. They lose everything those people knew.</h2>
        </div>
        <div className="problem-grid">
          <div className="leak-list">
            {leaks.map((l) => (
              <div className="leak-item" key={l}>
                <span className="dot" />
                {l}
              </div>
            ))}
          </div>
          <div className="problem-statement">
            <span className="fade">When an experienced person walks out the door, </span>
            they take years of judgment with them.{" "}
            <span className="strong">Documents remain. Experience disappears.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyMatters() {
  return (
    <section className="section why-matters" style={{ textAlign: "center" }}>
      <div className="wrap">
        <p className="why-quote">
          Human civilization advances because every generation{" "}
          <span>builds on the one before it</span> — instead of starting from zero.
        </p>
        <p className="why-sub">
          Institutions should work the same way. Instead of resetting their knowledge every time someone
          leaves, they should keep accumulating it — getting a little wiser with every meeting, every
          decision, every mistake. My Campus Buddy is what makes that possible.
        </p>
      </div>
    </section>
  );
}

function WhatIsIt() {
  const nots = [
    { label: "IT IS NOT", title: "A CRM", body: "A CRM logs what happened. It doesn't explain why a decision was made, or advise on the next one." },
    { label: "IT IS NOT", title: "A Knowledge Base", body: "A knowledge base holds documents someone chose to write down. Most institutional knowledge is never written down at all." },
    { label: "IT IS NOT", title: "A Chatbot", body: "A generic chatbot answers from what it was trained on, once. It doesn't watch your institution happen in real time." },
  ];
  return (
    <section className="section section-alt">
      <div className="wrap">
        <div className="section-head center">
          <div className="eyebrow" style={{ justifyContent: "center" }}>What Is My Campus Buddy?</div>
          <h2>It's not another tool for storing information.</h2>
        </div>
        <div className="not-grid">
          {nots.map((n) => (
            <div className="not-card" key={n.title}>
              <div className="label">{n.label}</div>
              <h4>{n.title}</h4>
              <p>{n.body}</p>
            </div>
          ))}
        </div>
        <div className="is-card">
          <div className="label">IT IS</div>
          <h3>An Institutional Intelligence Platform</h3>
          <p>
            It becomes the collective memory and advisor for your entire institution — quietly present in
            every meeting and conversation, connecting the dots no single person could see, and getting
            smarter every day.
          </p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: "👁", title: "Observe", body: "Connects to the places work already happens — email, calendar, chat, documents — and watches what naturally happens inside them." },
    { icon: "🧩", title: "Understand", body: "Reads meetings, messages, and documents the way a sharp colleague would — figuring out what was decided, and why." },
    { icon: "🗂", title: "Organize", body: "Sorts everything into a living structure — connecting the same person, project, or decision wherever it shows up." },
    { icon: "💾", title: "Remember", body: "Nothing gets buried in an inbox. Every decision and lesson becomes part of a permanent, searchable memory." },
    { icon: "💡", title: "Advise", body: "When someone asks a question, it answers using the institution's own history — or points them to the right expert." },
    { icon: "🌱", title: "Continuously Learn", body: "Every new conversation becomes new material. The institution's intelligence compounds instead of resetting." },
  ];
  return (
    <section className="section" id="how">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">How It Works</div>
          <h2>Six things happen, continuously, in the background.</h2>
          <p>You don't do anything differently. My Campus Buddy works quietly underneath the tools you already use.</p>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div className="step-card" key={s.title}>
              <div className="num">0{i + 1}</div>
              <div className="icon">{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItLearns() {
  return (
    <section className="section section-alt">
      <div className="wrap">
        <div className="section-head center">
          <div className="eyebrow" style={{ justifyContent: "center" }}>How My Campus Buddy Learns</div>
          <h2>It doesn't become intelligent overnight.</h2>
          <p>
            It continuously builds the institution's intelligence from everyday work — with approval,
            role-based permissions, and respect for privacy.
          </p>
        </div>
        <div className="steps-grid">
          {KNOWLEDGE_SOURCES.map((k) => (
            <div className="step-card" key={k.title}>
              <div className="icon">{k.icon}</div>
              <h4>{k.title}</h4>
              <p>{k.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhoUsesIt() {
  const [active, setActive] = useState(0);
  return (
    <section className="section" id="roles">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Who Uses It</div>
          <h2>Every role asks it something different.</h2>
        </div>
        <div className="role-grid">
          {ROLES.map((r, i) => (
            <div
              key={r.title}
              className={`role-card ${active === i ? "active" : ""}`}
              onClick={() => setActive(i)}
            >
              <div className="role-title">{r.title}</div>
              <div className="role-q">{r.q}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Compare() {
  const bad = [
    "Knowledge lives in individual heads, not the institution",
    "Every departure is a small memory loss",
    "The same mistake gets repeated by a different team",
    "New hires take months to learn what already exists",
    "Decisions get re-litigated because no one remembers why",
  ];
  const good = [
    "Knowledge lives in the institution itself, permanently",
    "Every departure leaves the intelligence intact",
    "Past mistakes surface before they're repeated",
    "New hires ask questions and get real, historical answers",
    "Every decision comes with its own reasoning attached",
  ];
  return (
    <section className="section section-alt" id="compare">
      <div className="wrap">
        <div className="section-head center">
          <div className="eyebrow" style={{ justifyContent: "center" }}>Why It Matters</div>
          <h2>Two ways an institution can age.</h2>
        </div>
        <div className="compare-grid">
          <div className="compare-card bad">
            <h4>✕ Traditional Institution</h4>
            <ul>{bad.map((b) => <li key={b}>🔻 {b}</li>)}</ul>
          </div>
          <div className="compare-card good">
            <h4>✓ My Campus Buddy Institution</h4>
            <ul>{good.map((g) => <li key={g}>✓ {g}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="closing">
      <div className="wrap">
        <h2>
          My Campus Buddy doesn't replace people.
          <br />
          It ensures the institution <em>never loses its intelligence.</em>
        </h2>
        <p className="chain">Every conversation · Every decision · Every lesson · Every success · Every failure</p>
      </div>
    </section>
  );
}

/* ============================================================
   DEMO SECTION
============================================================ */

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

function DemoSection({ showToast }: { showToast: (t: string) => void }) {
  const [tab, setTab] = useState<TabId>("workspace");
  const [events, setEvents] = useState<MemoryEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    fetch("/api/memory")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data.events) ? data.events : []))
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false));
  }, []);

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
