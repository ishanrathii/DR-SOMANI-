// Dr Somani's Homoeopathy — AI chat widget
(function () {
  const cfg = window.SOMANI_AI || {};
  const NAME = cfg.assistantName || "Sanjeevani";
  const WA = cfg.whatsapp || "919834172124";
  const endpoint = (cfg.endpoint || "").trim();
  const configured = !!endpoint;

  const panel = document.getElementById("aiPanel");
  const launcher = document.getElementById("aiLauncher");
  const closeBtn = document.getElementById("aiClose");
  const msgs = document.getElementById("aiMessages");
  const form = document.getElementById("aiForm");
  const input = document.getElementById("aiInput");
  const sendBtn = document.getElementById("aiSend");
  const handoff = document.getElementById("aiHandoff");
  if (!panel || !launcher) return;

  // conversation history sent to the backend
  const history = [];
  let busy = false;

  function open() {
    panel.classList.add("open");
    launcher.classList.add("hidden");
    if (!msgs.dataset.greeted) {
      greet();
      msgs.dataset.greeted = "1";
    }
    setTimeout(() => input && input.focus(), 200);
  }
  function close() {
    panel.classList.remove("open");
    launcher.classList.remove("hidden");
  }
  launcher.addEventListener("click", open);
  closeBtn && closeBtn.addEventListener("click", close);

  function bubble(role, text) {
    const el = document.createElement("div");
    el.className = "ai-msg ai-msg--" + role;
    el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }
  function typing() {
    const el = document.createElement("div");
    el.className = "ai-msg ai-msg--bot ai-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  function greet() {
    bubble(
      "bot",
      `Namaste 🙏 I'm ${NAME}, the assistant for Dr Somani's Homoeopathy. I can help you understand your concern and guide you to the right care. May I know your name to begin?`
    );
    bubble(
      "note",
      "This is general guidance, not a diagnosis — Dr Somani will review and decide your treatment. In an emergency, please call your local emergency number."
    );
    if (!configured) {
      bubble(
        "bot",
        "Our AI assistant is being set up right now. In the meantime, you can chat with the clinic directly on WhatsApp and we'll help you personally."
      );
      const b = document.createElement("a");
      b.className = "ai-cta";
      b.href = "https://wa.me/" + WA;
      b.target = "_blank";
      b.rel = "noopener";
      b.textContent = "💬 Chat on WhatsApp";
      msgs.appendChild(b);
      input.placeholder = "Assistant is being set up…";
      input.disabled = true;
      sendBtn.disabled = true;
    }
  }

  async function callBackend(mode) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: history, mode: mode || "chat" }),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return (data.reply || "").trim();
  }

  form &&
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (busy || !configured) return;
      const text = (input.value || "").trim();
      if (!text) return;
      input.value = "";
      bubble("user", text);
      history.push({ role: "user", content: text });
      busy = true;
      sendBtn.disabled = true;
      const t = typing();
      try {
        const reply = await callBackend("chat");
        t.remove();
        bubble("bot", reply);
        history.push({ role: "assistant", content: reply });
        handoff.classList.remove("hidden"); // offer handoff once talking
      } catch (err) {
        t.remove();
        bubble(
          "note",
          "Sorry, I'm having trouble connecting right now. You can reach the clinic on WhatsApp at +91 98341 72124."
        );
      } finally {
        busy = false;
        sendBtn.disabled = false;
        input.focus();
      }
    });

  // "Send my details to the clinic" -> ask AI for a summary, open WhatsApp
  handoff &&
    handoff.addEventListener("click", async () => {
      let summary = "";
      if (configured && history.length) {
        handoff.disabled = true;
        handoff.textContent = "Preparing…";
        try {
          summary = await callBackend("summary");
        } catch (_) {
          /* fall back to transcript below */
        }
        handoff.disabled = false;
        handoff.textContent = "📤 Send my details to the clinic";
      }
      if (!summary) {
        // fallback: build a short transcript
        const lines = history
          .map((m) => (m.role === "user" ? "Me: " : "Assistant: ") + m.content)
          .slice(-8);
        summary =
          "Patient enquiry via website assistant:\n\n" +
          (lines.join("\n") || "(no messages yet)");
      }
      const text =
        summary +
        "\n\n(Sent from Dr Somani's Homoeopathy website assistant.)";
      window.open(
        "https://wa.me/" + WA + "?text=" + encodeURIComponent(text),
        "_blank"
      );
    });
})();
