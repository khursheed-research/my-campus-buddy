// NOTE: This is a legacy standalone HTML preview page (an early investor-preview version
// of the chat UI, served directly as HTML by this Edge Function). It predates the current
// Next.js app (app/demo/page.tsx) and is not linked from the live site anymore. Kept here
// for completeness / history — safe to delete if unused.

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Brain — Live Workspace Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0A0D18; --bg-elev:#121729; --bg-elev-2:#1A2138; --bg-elev-3:#232B47;
  --ink:#EDEAE1; --ink-dim:#A7ACC7; --ink-faint:#666C8C;
  --hairline:rgba(237,234,225,0.09); --hairline-strong:rgba(237,234,225,0.16);
  --gold:#E8A33D; --gold-soft:rgba(232,163,61,0.14); --gold-ink:#2B1B04;
  --violet:#7C93FF; --violet-soft:rgba(124,147,255,0.14);
  --serif:'Fraunces',serif; --sans:'Inter',sans-serif; --mono:'JetBrains Mono',monospace;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--ink);font-family:var(--sans);line-height:1.5;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:48px 20px;}
.badge{font-family:var(--mono);font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);border:1px solid var(--gold-soft);background:var(--gold-soft);padding:6px 14px;border-radius:999px;margin-bottom:18px;}
h1{font-family:var(--serif);font-size:clamp(26px,4vw,38px);text-align:center;margin-bottom:10px;}
p.sub{color:var(--ink-dim);text-align:center;max-width:520px;margin-bottom:34px;font-size:14.5px;}
.chat-shell{width:100%;max-width:640px;border:1px solid var(--hairline);border-radius:20px;background:var(--bg-elev);display:flex;flex-direction:column;height:520px;overflow:hidden;box-shadow:0 30px 80px -30px rgba(0,0,0,0.6);}
.chat-log{flex:1;overflow-y:auto;padding:22px;display:flex;flex-direction:column;gap:16px;}
.msg{display:flex;gap:12px;max-width:88%;}
.msg.user{align-self:flex-end;flex-direction:row-reverse;}
.msg-avatar{width:28px;height:28px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;}
.msg.ai .msg-avatar{background:var(--gold-soft);color:var(--gold);}
.msg.user .msg-avatar{background:var(--violet-soft);color:var(--violet);}
.msg-bubble{padding:12px 15px;border-radius:14px;font-size:14px;line-height:1.55;}
.msg.ai .msg-bubble{background:var(--bg-elev-2);border:1px solid var(--hairline);border-top-left-radius:4px;}
.msg.user .msg-bubble{background:var(--violet-soft);border:1px solid rgba(124,147,255,0.25);border-top-right-radius:4px;}
.typing{display:flex;gap:4px;padding:4px 0;}
.typing span{width:6px;height:6px;border-radius:50%;background:var(--ink-faint);animation:t 1.2s infinite ease-in-out;}
.typing span:nth-child(2){animation-delay:.15s;} .typing span:nth-child(3){animation-delay:.3s;}
@keyframes t{0%,60%,100%{transform:translateY(0);opacity:.4;}30%{transform:translateY(-4px);opacity:1;}}
.chip-row{display:flex;gap:8px;flex-wrap:wrap;padding:0 22px 16px;}
.chip{font-size:12px;padding:7px 12px;border-radius:999px;border:1px solid var(--hairline-strong);color:var(--ink-dim);background:transparent;cursor:pointer;font-family:inherit;transition:all .15s;}
.chip:hover{border-color:var(--gold-soft);color:var(--gold);}
.chat-input-row{border-top:1px solid var(--hairline);padding:14px 16px;display:flex;gap:10px;align-items:center;}
.chat-input-row input{flex:1;background:var(--bg-elev-2);border:1px solid var(--hairline);border-radius:999px;padding:12px 18px;color:var(--ink);font-size:14px;font-family:inherit;}
.chat-input-row input:focus{outline:none;border-color:var(--gold-soft);}
.send{width:38px;height:38px;border-radius:50%;background:var(--gold);color:var(--gold-ink);border:none;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;}
.upload-shell{width:100%;max-width:640px;border:1px dashed var(--hairline-strong);border-radius:16px;padding:16px 18px;margin-bottom:18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:var(--bg-elev);}
.upload-shell .ico{font-size:20px;}
.upload-shell .txt{flex:1;min-width:180px;}
.upload-shell .txt strong{font-size:13.5px;display:block;}
.upload-shell .txt span{font-size:12px;color:var(--ink-faint);}
.upload-btn{font-size:12.5px;padding:9px 16px;border-radius:999px;border:1px solid var(--gold-soft);background:var(--gold-soft);color:var(--gold);cursor:pointer;font-family:inherit;font-weight:600;}
.upload-btn:hover{background:var(--gold);color:var(--gold-ink);}
.upload-status{font-size:12px;color:var(--ink-dim);width:100%;}
.upload-status.ok{color:#6FCF97;}
.upload-status.err{color:#E8798F;}
</style>
</head>
<body>
  <div class="badge">Live preview · real AI backend</div>
  <h1>Ask Northwind's AI Brain something.</h1>
  <p class="sub">This is a genuine API call to a live AI model, grounded in Northwind's mock company history — not a scripted response.</p>

  <div class="upload-shell">
    <div class="ico">📄</div>
    <div class="txt">
      <strong>Upload a document</strong>
      <span>.txt or .md for now — ask the AI Brain about it below</span>
    </div>
    <input type="file" id="fileInput" accept=".txt,.md" style="display:none;">
    <button class="upload-btn" id="uploadBtn">Choose file</button>
    <div class="upload-status" id="uploadStatus"></div>
  </div>

  <div class="chat-shell">
    <div class="chat-log" id="chatLog"></div>
    <div class="chip-row">
      <button class="chip" data-q="Why was the Meridian pricing decision made?">Meridian pricing decision</button>
      <button class="chip" data-q="Why did we lose Atlas Corp?">Why we lost Atlas Corp</button>
      <button class="chip" data-q="Who is the expert on enterprise pricing negotiations?">Who's the pricing expert?</button>
    </div>
    <div class="chat-input-row">
      <input type="text" id="chatInput" placeholder="Ask about Northwind's history…" autocomplete="off">
      <button class="send" id="sendBtn" aria-label="Send">→</button>
    </div>
  </div>
  <div class="foot">AI Brain for Organizations — investor preview</div>

<script>
const chatLog = document.getElementById('chatLog');
const chatInput = document.getElementById('chatInput');
let chatHistory = [];

function appendMessage(role, text){
  const msg = document.createElement('div');
  msg.className = 'msg ' + role;
  msg.innerHTML = \`<div class="msg-avatar">\${role==='ai'?'🧠':'You'}</div><div class="msg-bubble">\${text}</div>\`;
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
  return msg;
}
function escapeHtml(s){ const d=document.createElement('div'); d.innerText=s; return d.innerHTML; }

appendMessage('ai', "Hi, I'm Northwind's AI Brain. Ask me about a past decision, a customer, or upload a document and ask about that too.");

const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');

uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  uploadStatus.className = 'upload-status';
  uploadStatus.textContent = \`Reading \${file.name}…\`;

  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result;
    fetch('/functions/v1/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, content: text })
    })
    .then(r => r.json())
    .then(data => {
      if (data.id) {
        uploadStatus.className = 'upload-status ok';
        uploadStatus.textContent = \`✓ "\${data.filename}" uploaded (\${data.charCount.toLocaleString()} characters) — ask about it below.\`;
        appendMessage('ai', \`I've read "\${escapeHtml(data.filename)}". Ask me anything about it.\`);
      } else {
        uploadStatus.className = 'upload-status err';
        uploadStatus.textContent = data.error || 'Upload failed — please try again.';
      }
    })
    .catch(() => {
      uploadStatus.className = 'upload-status err';
      uploadStatus.textContent = 'Upload failed — please try again.';
    });
  };
  reader.onerror = () => {
    uploadStatus.className = 'upload-status err';
    uploadStatus.textContent = "Couldn't read that file.";
  };
  reader.readAsText(file);
});

function sendMessage(text){
  if(!text || !text.trim()) return;
  appendMessage('user', escapeHtml(text));
  chatInput.value = '';
  const typingMsg = document.createElement('div');
  typingMsg.className = 'msg ai';
  typingMsg.innerHTML = \`<div class="msg-avatar">🧠</div><div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div>\`;
  chatLog.appendChild(typingMsg);
  chatLog.scrollTop = chatLog.scrollHeight;

  fetch('/functions/v1/chat', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ message: text, history: chatHistory })
  })
  .then(r=>r.json())
  .then(data=>{
    typingMsg.remove();
    if(data.reply){
      chatHistory.push({role:'user', content:text});
      chatHistory.push({role:'assistant', content:data.reply});
      if(chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
      appendMessage('ai', escapeHtml(data.reply).replace(/\\n/g,'<br>'));
    } else {
      appendMessage('ai', (data.error ? escapeHtml(data.error) : "I ran into an issue just now — mind trying again?"));
    }
  })
  .catch(()=>{
    typingMsg.remove();
    appendMessage('ai', "I ran into an issue reaching the AI just now — mind trying that again?");
  });
}
document.getElementById('sendBtn').addEventListener('click', ()=>sendMessage(chatInput.value));
chatInput.addEventListener('keydown', e=>{ if(e.key==='Enter') sendMessage(chatInput.value); });
document.querySelectorAll('.chip').forEach(c=>c.addEventListener('click', ()=>sendMessage(c.dataset.q)));
</script>
</body>
</html>`;

Deno.serve(() => {
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
});
