# AI Assistant — "Sanjeevani"

A friendly chat assistant on the website that helps patients describe their
concern, understand it in simple terms, and hand their details to the clinic on
WhatsApp. It's powered by **Claude (Anthropic)**.

## How it fits together
```
Website chat widget  →  your Cloudflare Worker  →  Anthropic (Claude)
   (js/chat.js)          (ai/worker.js, holds        answers back
                          the secret API key)
```
The website is static (GitHub Pages), so it **cannot** safely hold an API key.
The Worker is a tiny backend that keeps the key secret and talks to Claude.

Until you complete the 5-minute deploy below, the assistant runs in **guided
mode** (free, no setup): it chats on the site in the patient's chosen language
(**English / Hindi / Marathi / Hinglish**), asks a short set of questions (name,
age/gender, concern, a condition-aware follow-up, other details, preferred
branch), flags possible emergencies, and then sends a tidy, dated summary to the
clinic on WhatsApp. Once the backend is connected it upgrades automatically to
the full, intelligent Claude conversation (free-text understanding, report
reading, AI-written summaries). No front-end change is needed.

---

## Deploy the backend (one-time, ~5 minutes, free)

You need an **Anthropic API key** — get one at https://console.anthropic.com
(Billing → add a little credit; the chat is very cheap per message).

### Option A — Cloudflare dashboard (no tools needed)
1. Create a free account at https://dash.cloudflare.com → **Workers & Pages** →
   **Create** → **Create Worker**. Give it a name like `dr-somani-ai`. Deploy.
2. Click **Edit code**, delete the sample, and paste the entire contents of
   **`ai/worker.js`** from this repo. **Save and deploy**.
3. Go to the Worker's **Settings → Variables and Secrets** → **Add** a secret:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your `sk-ant-...` key → **Encrypt / Save**.
4. Copy the Worker URL (looks like `https://dr-somani-ai.<you>.workers.dev`).

### Option B — Command line (Wrangler)
```bash
npm i -g wrangler
wrangler login
# put ai/worker.js as your Worker entry, then:
wrangler secret put ANTHROPIC_API_KEY   # paste your key
wrangler deploy
```

---

## Connect the website to the backend
1. Open **`js/ai-config.js`** and paste your Worker URL:
   ```js
   window.SOMANI_AI = { endpoint: "https://dr-somani-ai.<you>.workers.dev", ... };
   ```
2. Commit & push. Within a minute the chat goes live — no more "setup mode".

---

## Try it
Open the site, click **"Ask our assistant"** (bottom-left), and chat. When the
patient is ready, **"Send my details to the clinic"** writes a short summary and
opens WhatsApp to **+91 98341 72124**.

---

## "Training" the assistant further
The assistant's knowledge and behaviour live in the `SYSTEM_PROMPT` inside
**`ai/worker.js`** (a readable copy is in **`ai/system-prompt.md`**). To teach it
more — extra conditions, FAQs, clinic timings, fees, do's & don'ts — add that
text to `SYSTEM_PROMPT`, save, and redeploy the Worker. (Ask Claude to help you
edit it any time.)

## Safety note
The assistant is set up as **guidance + triage, reviewed by the doctor** — it
does not diagnose, never suggests specific medicines or doses, and urges urgent
care for emergencies. Please keep that framing.

## Cost & privacy
- Model: `claude-opus-4-8`. Each patient message costs a fraction of a rupee.
- The API key stays inside Cloudflare (never in the browser).
- For production you can restrict the Worker's `Access-Control-Allow-Origin`
  from `*` to your site's domain in `ai/worker.js`.
