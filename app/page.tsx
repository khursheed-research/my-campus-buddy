"use client";

import { useState } from "react";
import Link from "next/link";

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

export default function Home() {
  return (
    <>
      <nav className="site-nav">
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
        <Link href="/demo" className="nav-cta">Explore Demo</Link>
      </nav>

      <Hero />
      <Problem />
      <WhyMatters />
      <WhatIsIt />
      <HowItWorks />
      <HowItLearns />
      <WhoUsesIt />
      <Compare />
      <FomoSection />
      <Closing />

      <footer className="site-footer">
        My Campus Buddy — a concept prototype. All institution names, people, and data shown in the demo are illustrative.
      </footer>
    </>
  );
}

function FomoSection() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="fomo-banner">
          <div className="eyebrow">The Real Cost Of Waiting</div>
          <h3>Every competitor slow to adopt this loses ground quietly, then all at once.</h3>
          <p>
            AI is already rewriting how fast institutions can move. The ones capturing their own
            institutional knowledge now will out-learn, out-onboard, and out-decide everyone still
            relying on tribal memory and exit interviews.
          </p>
          <Link href="/demo" className="btn-primary">See it in action →</Link>
        </div>
      </div>
    </section>
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
