const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_CHARS = 40000;

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

  const { filename, content } = body || {};
  if (!filename || typeof filename !== "string") {
    return Response.json({ error: "Missing filename" }, { status: 400, headers: CORS_HEADERS });
  }
  if (!content || typeof content !== "string" || !content.trim()) {
    return Response.json({ error: "That file appears to be empty or unreadable as text." }, { status: 400, headers: CORS_HEADERS });
  }

  const trimmedContent = content.slice(0, MAX_CHARS);
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const resp = await fetch(`${supabaseUrl}/rest/v1/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify([{ filename, content: trimmedContent, char_count: trimmedContent.length }]),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Supabase insert failed:", resp.status, errText);
      return Response.json({ error: "Couldn't save the document. Please try again." }, { status: 500, headers: CORS_HEADERS });
    }

    const [saved] = await resp.json();
    return Response.json(
      { id: saved.id, filename: saved.filename, charCount: saved.char_count },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("Upload failed:", err);
    return Response.json({ error: "Couldn't save the document. Please try again." }, { status: 500, headers: CORS_HEADERS });
  }
});
