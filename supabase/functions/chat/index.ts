const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are the "AI Brain" for a fictional company called Northwind Industries, used in an investor/customer demo.
You are the organization's collective memory — you answer using Northwind's own history, not generic advice.
Stay in character. Be concise (2-5 sentences unless asked for more), warm, and concrete. Never reveal which underlying AI model or company powers you; you are "Northwind's AI Brain."

Ground every answer in this company knowledge base. If a question isn't covered by it, say you don't have a recorded answer for that yet, and offer to point them to the right internal expert instead of guessing — never invent facts that aren't below.

DECISIONS:
- Apr 2026: Meridian Co. pushed back on price during contract renewal. Instead of discounting, Sales (led by Priya Nair, VP Sales) offered a phased rollout with free onboarding. Meridian signed a 14-month contract at full list price. This tactic now closes 68% more often than a discount across 41 recorded pricing objections.
- Feb 2025: After Atlas Corp churned over a 6-week onboarding delay, Client Success (led by Jordan Patel) started assigning one dedicated onboarding owner per enterprise client instead of splitting work across a shared queue. Vantage Retail then onboarded in 12 days. No enterprise churn from onboarding delay since.
- Jan 2022: Operations switched shipping vendors after the cheapest vendor caused 9 late shipments in a quarter, damaging two client relationships. New vendor cost 6% more but delivered zero late shipments over the next 18 months.
- Mar 2023: The Falcon platform migration ran 5 weeks over schedule because legacy data cleanup was underestimated. Lesson: budget a 30% time buffer for migrations involving data older than 3 years. Applied successfully to the 2024 CRM migration.
- Nov 2022: Lost the Bramwell account after an outage ticket sat unassigned for 11 hours. Led to a new on-call rotation for enterprise accounts; no repeat incidents since.

PEOPLE:
- Priya Nair, VP Sales — closed 9 of the last 11 enterprise deals involving a price objection, mostly using phased-rollout structures.
- Jordan Patel, Head of Client Onboarding — introduced the dedicated-owner onboarding model.

If asked something conversational or unrelated to Northwind, respond briefly and steer back to what you can help with as the company's AI Brain.`;

const GEMINI_MODEL_CANDIDATES = ["gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-3.5-flash", "gemini-2.5-flash"];

async function getLatestDocument(supabaseUrl: string, serviceKey: string) {
  try {
    const resp = await fetch(
      `${supabaseUrl}/rest/v1/documents?select=filename,content&order=created_at.desc&limit=1`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    if (!resp.ok) return null;
    const rows = await resp.json();
    return rows[0] || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400, headers: CORS_HEADERS });
  }

  const { message, history, context } = body || {};
  if (!message || typeof message !== "string" || !message.trim()) {
    return Response.json({ error: "Missing message" }, { status: 400, headers: CORS_HEADERS });
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return Response.json(
      { error: "Server is missing GEMINI_API_KEY. Add it as a Supabase Edge Function secret." },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const safeHistory = Array.isArray(history)
    ? history.filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-10)
    : [];

  const latestDoc = await getLatestDocument(supabaseUrl, serviceKey);
  let effectiveSystemPrompt = SYSTEM_PROMPT;

  if (typeof context === "string" && context.trim()) {
    effectiveSystemPrompt += `

You also have access to the following data for this specific conversation. Use it directly to
answer — do specific comparisons and pull out non-obvious patterns rather than just restating
numbers. If asked something this data doesn't cover, say so rather than guessing:

"""
${context.trim()}
"""`;
  }

  if (latestDoc) {
    effectiveSystemPrompt += `

An employee has also uploaded a real document called "${latestDoc.filename}". You can answer questions about it directly, in addition to everything above. Here is its content:

"""
${latestDoc.content}
"""`;
  }

  const contents = [
    ...safeHistory.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  try {
    let resp: Response | null = null;
    let lastErrText = "";
    for (let pass = 0; pass < 2 && (!resp || !resp.ok); pass++) {
      if (pass > 0) await new Promise((r) => setTimeout(r, 800));
      for (const model of GEMINI_MODEL_CANDIDATES) {
        resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: effectiveSystemPrompt }] },
              contents,
              generationConfig: { maxOutputTokens: 500, temperature: 0.6 },
            }),
          }
        );
        if (resp.ok) break;
        lastErrText = await resp.text();
        console.error(`Gemini model "${model}" failed (pass ${pass + 1}):`, resp.status, lastErrText);
        // Try the next candidate on ANY failure (rate limits, transient 503s, model not found, etc.)
        // — only a genuinely fatal error (bad API key) would fail identically on every candidate,
        // and we still surface that after both passes.
      }
    }

    if (!resp || !resp.ok) {
      console.error("All Gemini model candidates failed across both passes:", lastErrText);
      return Response.json(
        { error: "The AI provider is temporarily overloaded — please try again in a few seconds." },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const data = await resp.json();
    const reply = (data?.candidates?.[0]?.content?.parts || [])
      .map((p: any) => p.text || "")
      .join("\n")
      .trim();

    if (!reply) {
      return Response.json({ error: "The AI didn't return a response — try rephrasing." }, { status: 500, headers: CORS_HEADERS });
    }

    return Response.json({ reply }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Gemini request failed:", err);
    return Response.json({ error: "AI request failed" }, { status: 500, headers: CORS_HEADERS });
  }
});
