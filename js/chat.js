// Dr Somani's Homoeopathy — AI chat widget
(function () {
  const cfg = window.SOMANI_AI || {};
  const NAME = cfg.assistantName || "Sanjeevani";
  const WA = cfg.whatsapp || "919834172124";
  const endpoint = (cfg.endpoint || "").trim();
  const configured = !!endpoint;
  const MAX_FILE = 4 * 1024 * 1024; // 4 MB

  const panel = document.getElementById("aiPanel");
  const launcher = document.getElementById("aiLauncher");
  const closeBtn = document.getElementById("aiClose");
  const msgs = document.getElementById("aiMessages");
  const form = document.getElementById("aiForm");
  const input = document.getElementById("aiInput");
  const sendBtn = document.getElementById("aiSend");
  const handoff = document.getElementById("aiHandoff");
  const attachBtn = document.getElementById("aiAttach");
  const fileInput = document.getElementById("aiFile");
  const chip = document.getElementById("aiChip");
  if (!panel || !launcher) return;

  const history = []; // { role, content, attachment? }
  let busy = false;
  let pending = null; // { kind:"image"|"pdf", media_type, data, name }

  // When the AI backend isn't connected yet, the assistant runs a simple
  // guided intake on the site and still sends a tidy summary to WhatsApp.
  const GUIDED = !configured;
  const intake = {};
  let step = -1;
  const STEPS = [
    { key: "name", q: () => "May I know your name to begin? 🙏" },
    { key: "agesex", q: (d) => `Thank you${d.name ? ", " + d.name : ""}. May I know your age and gender? (e.g. 34, female)` },
    { key: "concern", q: () => "What is the main health concern you'd like help with — and how long have you had it?" },
    { key: "history", q: () => "Is there anything else that would help the doctor? For example: current medicines, what makes it better or worse, or any family history." },
    { key: "branch", q: () => "Lastly, which would suit you best — Pune (Wakad), Jalgaon, or an online consultation?" },
  ];

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

  function bubble(role, text, fileName) {
    const el = document.createElement("div");
    el.className = "ai-msg ai-msg--" + role;
    el.textContent = text || "";
    if (fileName) {
      const f = document.createElement("span");
      f.className = "ai-msg__file";
      f.textContent = "📎 " + fileName;
      if (el.textContent) el.appendChild(document.createElement("br"));
      el.appendChild(f);
    }
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
      `Namaste 🙏 I'm ${NAME}, the assistant for Dr Somani's Homoeopathy. I can help you understand your concern and prepare it for the doctor. May I know your name to begin?`
    );
    bubble(
      "note",
      "For educational guidance only — not a diagnosis or prescription. Dr Somani will review and decide your treatment. In an emergency, call your local emergency number. You can optionally attach a report photo using 📎."
    );
    if (GUIDED) {
      // guided intake — ask the first question
      askNext();
    }
  }

  // ----- guided intake (works with no AI backend) -----
  function askNext() {
    step++;
    if (step < STEPS.length) {
      bubble("bot", STEPS[step].q(intake));
    } else {
      bubble(
        "bot",
        "Thank you — I've noted everything. Tap the button below and I'll send a short summary to the clinic on WhatsApp. The doctor will review it and get back to you personally. 🌸"
      );
      handoff.classList.remove("hidden");
    }
  }
  function guidedSummary() {
    const L = ["New patient enquiry via the website assistant:", ""];
    if (intake.name) L.push("• Name: " + intake.name);
    if (intake.agesex) L.push("• Age / gender: " + intake.agesex);
    if (intake.concern) L.push("• Main concern: " + intake.concern);
    if (intake.history) L.push("• More details: " + intake.history);
    if (intake.branch) L.push("• Preferred: " + intake.branch);
    if (intake._report) L.push("• Has a medical report to share: " + intake._report);
    L.push("");
    L.push("Please review and suggest the next steps.");
    return L.join("\n");
  }

  // ----- attachments -----
  function readFile(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1] || ""); // strip data: prefix
      r.onerror = () => reject(new Error("read error"));
      r.readAsDataURL(file);
    });
  }
  attachBtn &&
    attachBtn.addEventListener("click", () => fileInput && fileInput.click());
  fileInput &&
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files && fileInput.files[0];
      fileInput.value = "";
      if (!file) return;
      const isImg = /^image\//.test(file.type);
      const isPdf = file.type === "application/pdf";
      if (!isImg && !isPdf) {
        bubble("note", "Please attach an image (JPG/PNG) or a PDF report.");
        return;
      }
      if (file.size > MAX_FILE) {
        bubble("note", "That file is a bit large — please attach one under 4 MB.");
        return;
      }
      try {
        const data = await readFile(file);
        pending = {
          kind: isPdf ? "pdf" : "image",
          media_type: file.type,
          data,
          name: file.name || (isPdf ? "report.pdf" : "report.jpg"),
        };
        showChip();
      } catch (_) {
        bubble("note", "Couldn't read that file. Please try another.");
      }
    });
  function showChip() {
    if (!chip) return;
    chip.classList.toggle("hidden", !pending);
    if (pending) {
      chip.innerHTML = "";
      const label = document.createElement("span");
      label.textContent = "📎 " + pending.name;
      const x = document.createElement("button");
      x.type = "button";
      x.setAttribute("aria-label", "Remove attachment");
      x.textContent = "✕";
      x.addEventListener("click", () => {
        pending = null;
        showChip();
      });
      chip.appendChild(label);
      chip.appendChild(x);
    }
  }

  // ----- backend -----
  function toPayload(list) {
    return list.map((m) => {
      if (m.role === "user" && m.attachment) {
        const blocks = [
          { type: "text", text: m.content || "Here is my medical report." },
        ];
        if (m.attachment.kind === "pdf") {
          blocks.push({
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: m.attachment.data },
          });
        } else {
          blocks.push({
            type: "image",
            source: { type: "base64", media_type: m.attachment.media_type, data: m.attachment.data },
          });
        }
        return { role: "user", content: blocks };
      }
      return { role: m.role, content: m.content };
    });
  }
  async function callBackend(mode) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: toPayload(history), mode: mode || "chat" }),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return (data.reply || "").trim();
  }

  form &&
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (busy) return;
      const text = (input.value || "").trim();
      if (!text && !pending) return;
      input.value = "";
      const attachment = pending;
      pending = null;
      showChip();

      // Guided intake mode (no AI backend connected yet)
      if (GUIDED) {
        bubble("user", text, attachment && attachment.name);
        if (attachment) intake._report = attachment.name;
        if (step >= 0 && step < STEPS.length) {
          intake[STEPS[step].key] = text || (attachment ? "(report attached)" : "");
        }
        askNext();
        input.focus();
        return;
      }

      bubble("user", text, attachment && attachment.name);
      history.push({ role: "user", content: text, attachment: attachment || undefined });
      busy = true;
      sendBtn.disabled = true;
      const t = typing();
      try {
        const reply = await callBackend("chat");
        t.remove();
        bubble("bot", reply);
        history.push({ role: "assistant", content: reply });
        handoff.classList.remove("hidden");
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

  handoff &&
    handoff.addEventListener("click", async () => {
      let summary = "";
      if (GUIDED) {
        summary = guidedSummary();
      } else if (configured && history.length) {
        handoff.disabled = true;
        handoff.textContent = "Preparing…";
        try {
          summary = await callBackend("summary");
        } catch (_) {
          /* fall back below */
        }
        handoff.disabled = false;
        handoff.textContent = "📤 Send my details to the clinic";
      }
      if (!summary) {
        const lines = history
          .map((m) => (m.role === "user" ? "Me: " : "Assistant: ") + (m.content || (m.attachment ? "[report attached]" : "")))
          .slice(-8);
        summary =
          "Patient enquiry via website assistant:\n\n" +
          (lines.join("\n") || "(no messages yet)");
      }
      const text = summary + "\n\n(Sent from Dr Somani's Homoeopathy website assistant.)";
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(text), "_blank");
    });
})();
