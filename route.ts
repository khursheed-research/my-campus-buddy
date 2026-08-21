import { NextRequest, NextResponse } from "next/server";
import { supabaseRest } from "@/lib/supabase";

export async function GET() {
  const res = await supabaseRest(
    "memory_events?select=id,occurred_on,type,title,summary,detail,created_at&order=created_at.desc"
  );
  if (!res.ok) {
    return NextResponse.json({ events: [], error: "Could not load timeline." }, { status: 200 });
  }
  const events = await res.json();
  return NextResponse.json({ events });
}

const ALLOWED_TYPES = new Set(["decision", "lesson", "loss", "project"]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.title || !body.summary || !ALLOWED_TYPES.has(body.type)) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }
  const row = {
    occurred_on: String(body.occurred_on || "").slice(0, 60) || "Just now",
    type: body.type,
    title: String(body.title).slice(0, 200),
    summary: String(body.summary).slice(0, 400),
    detail: String(body.detail || "").slice(0, 2000),
    is_seed: false,
  };
  const res = await supabaseRest("memory_events", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: "Could not save entry.", detail: text }, { status: 500 });
  }
  const [event] = await res.json();
  return NextResponse.json({ event });
}
