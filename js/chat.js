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

  // When the AI backend isn't connected yet, the assistant runs a friendly
  // multilingual guided intake on the site and still sends a tidy summary to
  // WhatsApp. Works with zero setup / zero cost.
  const GUIDED = !configured;
  const intake = {};
  let lang = "en";
  let phase = "lang"; // "lang" -> pick language, then "intake"
  let queue = [];
  let qi = -1;

  const LANG_LABEL = { en: "English", hi: "Hindi", he: "Hinglish" };

  // Localised strings for the guided intake
  const T = {
    en: {
      greet: () => `Namaste 🙏 I'm ${NAME}, the assistant for Dr Somani's Homoeopathy. I'll ask a few quick questions and pass your details to the doctor.`,
      note: "For educational guidance only — not a diagnosis or prescription. Dr Somani will review and decide your treatment. In an emergency, call your local emergency number. You can optionally attach a report photo using 📎.",
      steps: {
        name: () => "May I know your name to begin? 🙏",
        agesex: (d) => `Thank you${d.name ? ", " + d.name : ""}. May I know your age and gender? (e.g. 34, female)`,
        concern: () => "What is the main health concern you'd like help with — and how long have you had it?",
        history: () => "Anything else that would help the doctor? For example: current medicines, what makes it better or worse, or any family history.",
        branch: () => "Lastly, which suits you best — Pune (Wakad), Jalgaon, or an online consultation?",
      },
      followups: {
        skin: "For how long have you noticed the skin changes, and are they spreading or itchy?",
        kidney: "Have you had pain, or a scan/ultrasound report for the stones? Roughly what size, if you know?",
        pcod: "Are your cycles regular, and how long has this been a concern?",
        migraine: "How often do the headaches come, and does light or sound make them worse?",
        acidity: "Is the acidity worse after certain foods or at a particular time of day?",
        allergy: "What seems to trigger it — dust, weather, food, or something else?",
        child: "How old is the child, and how often does this happen?",
        mental: "How long have you felt this way, and is it affecting your sleep or daily life?",
      },
      thanks: "Thank you — I've noted everything. Tap the button below and I'll send a short summary to the clinic on WhatsApp. The doctor will review it and get back to you personally. 🌸",
      emergency: "⚠️ What you've described may need urgent medical attention. Please don't wait — call your local emergency number or go to the nearest hospital right away. Homoeopathy must not replace emergency care.",
      handoffBtn: "📤 Send my details to the clinic",
    },
    hi: {
      greet: () => `नमस्ते 🙏 मैं ${NAME} हूँ, डॉ. सोमानी होम्योपैथी की सहायक। मैं कुछ छोटे सवाल पूछूँगी और आपकी जानकारी डॉक्टर तक पहुँचा दूँगी।`,
      note: "यह केवल शैक्षिक मार्गदर्शन है — कोई निदान या दवा नहीं। डॉ. सोमानी आपका मामला देखकर उपचार तय करेंगे। किसी आपात स्थिति में तुरंत नज़दीकी अस्पताल या आपातकालीन नंबर पर संपर्क करें। आप चाहें तो 📎 से रिपोर्ट की फ़ोटो भेज सकते हैं।",
      steps: {
        name: () => "शुरू करने के लिए क्या मैं आपका नाम जान सकती हूँ? 🙏",
        agesex: (d) => `धन्यवाद${d.name ? ", " + d.name : ""}। कृपया अपनी उम्र और लिंग बताइए (जैसे 34, महिला)।`,
        concern: () => "आपकी मुख्य स्वास्थ्य समस्या क्या है — और यह कब से है?",
        history: () => "डॉक्टर के लिए और कुछ जो मददगार हो? जैसे — अभी चल रही दवाइयाँ, किससे आराम या तकलीफ़ बढ़ती है, या पारिवारिक इतिहास।",
        branch: () => "अंत में, आपके लिए क्या सुविधाजनक रहेगा — पुणे (वाकड), जलगांव, या ऑनलाइन परामर्श?",
      },
      followups: {
        skin: "त्वचा में बदलाव कब से हैं, और क्या ये फैल रहे हैं या खुजली होती है?",
        kidney: "क्या दर्द हुआ है या पथरी की कोई सोनोग्राफी/रिपोर्ट है? अगर पता हो तो आकार कितना है?",
        pcod: "क्या आपके मासिक चक्र नियमित हैं, और यह समस्या कब से है?",
        migraine: "सिरदर्द कितनी बार होता है, और क्या रोशनी या आवाज़ से बढ़ता है?",
        acidity: "क्या एसिडिटी कुछ खाने के बाद या किसी खास समय पर ज़्यादा होती है?",
        allergy: "किससे तकलीफ़ बढ़ती है — धूल, मौसम, खाना, या कुछ और?",
        child: "बच्चे की उम्र कितनी है, और यह कितनी बार होता है?",
        mental: "आप कब से ऐसा महसूस कर रहे हैं, और क्या इससे नींद या रोज़मर्रा पर असर पड़ता है?",
      },
      thanks: "धन्यवाद — मैंने सब नोट कर लिया है। नीचे बटन दबाइए, मैं आपकी जानकारी क्लिनिक को WhatsApp पर भेज दूँगी। डॉक्टर उसे देखकर आपसे संपर्क करेंगे। 🌸",
      emergency: "⚠️ आपने जो बताया है उसमें तुरंत चिकित्सा की ज़रूरत हो सकती है। कृपया देर न करें — तुरंत नज़दीकी अस्पताल जाएँ या आपातकालीन नंबर पर कॉल करें। आपात स्थिति में होम्योपैथी का इंतज़ार न करें।",
      handoffBtn: "📤 मेरी जानकारी क्लिनिक को भेजें",
    },
    he: {
      greet: () => `Namaste 🙏 Main ${NAME} hoon, Dr Somani's Homoeopathy ki assistant. Main kuch chhote sawaal poochhungi aur aapki details doctor tak pahuncha dungi.`,
      note: "Yeh sirf educational guidance hai — koi diagnosis ya prescription nahi. Dr Somani aapka case dekhkar treatment decide karenge. Emergency me turant nazdeeki hospital ya emergency number par call karein. Aap chahein to 📎 se report ki photo bhej sakte hain.",
      steps: {
        name: () => "Shuru karne ke liye kya main aapka naam jaan sakti hoon? 🙏",
        agesex: (d) => `Dhanyavaad${d.name ? ", " + d.name : ""}. Apni age aur gender bata dijiye (jaise 34, female).`,
        concern: () => "Aapki main health problem kya hai — aur yeh kab se hai?",
        history: () => "Doctor ke liye aur kuch jo helpful ho? Jaise — abhi chal rahi dawaiyan, kisse aaram ya takleef badhti hai, ya family history.",
        branch: () => "Last me, aapke liye kya theek rahega — Pune (Wakad), Jalgaon, ya online consultation?",
      },
      followups: {
        skin: "Skin me changes kab se hain, aur kya yeh fail rahe hain ya khujli hoti hai?",
        kidney: "Kya dard hua hai ya stone ki koi sonography/report hai? Size pata ho to kitna?",
        pcod: "Kya aapke periods regular hain, aur yeh problem kab se hai?",
        migraine: "Headache kitni baar hota hai, aur kya light ya sound se badhta hai?",
        acidity: "Kya acidity kuch khaane ke baad ya kisi khaas time par zyada hoti hai?",
        allergy: "Kisse takleef badhti hai — dust, mausam, khaana, ya kuch aur?",
        child: "Bacche ki age kitni hai, aur yeh kitni baar hota hai?",
        mental: "Aap kab se aisa feel kar rahe hain, aur kya isse neend ya daily life par asar padta hai?",
      },
      thanks: "Dhanyavaad — maine sab note kar liya hai. Neeche button dabaiye, main aapki details clinic ko WhatsApp par bhej dungi. Doctor review karke aapse contact karenge. 🌸",
      emergency: "⚠️ Aapne jo bataya usme turant medical help ki zaroorat ho sakti hai. Kripya der na karein — turant nazdeeki hospital jayein ya emergency number par call karein. Emergency me homoeopathy ka wait na karein.",
      handoffBtn: "📤 Meri details clinic ko bhejein",
    },
  };

  function detectCondition(t) {
    const s = (t || "").toLowerCase();
    if (/vitiligo|psorias|eczema|skin|rash|itch|daag|charm/.test(s)) return "skin";
    if (/kidney|stone|renal|pathri|pathari/.test(s)) return "kidney";
    if (/pcod|pcos|period|menstru|cycle|ovary|mahwari/.test(s)) return "pcod";
    if (/migrain|headache|head ache|sar dard|sir dard/.test(s)) return "migraine";
    if (/acid|gas|bloat|digest|stomach|gastric|pet/.test(s)) return "acidity";
    if (/allerg|sneez|dust|asthma|khaansi|chheenk/.test(s)) return "allergy";
    if (/child|kid|baby|paediatric|pediatric|son|daughter|bacch|beta|beti/.test(s)) return "child";
    if (/anxiet|stress|depress|mental|sad|tension|neend|sleep|ghabra/.test(s)) return "mental";
    return "";
  }
  function isEmergency(t) {
    return /(chest pain|can'?t breathe|cannot breathe|breathing (problem|trouble|difficulty)|breathless|unconscious|faint|severe bleeding|bleeding a lot|suicid|stroke|seizure|convuls|blue lips|heart attack|saans nahi|behosh|khoon beh|seene? me.?n? dard)/i.test(t || "");
  }
  function detectLang(t) {
    if (/[ऀ-ॿ]/.test(t || "")) return "hi";
    if (/\b(mera|naam|hai|kya|nahi|haan|dard|mujhe|aap)\b/i.test(t || "")) return "he";
    return "en";
  }

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
    if (GUIDED) {
      // Neutral bilingual greeting, then let the patient pick a language
      bubble("bot", `Namaste 🙏 I'm ${NAME}, the assistant for Dr Somani's Homoeopathy.`);
      bubble("bot", "Please choose your language · कृपया अपनी भाषा चुनें:");
      quickReplies(
        [["English", "en"], ["हिंदी", "hi"], ["Hinglish", "he"]],
        (val) => chooseLang(val)
      );
      return;
    }
    bubble(
      "bot",
      `Namaste 🙏 I'm ${NAME}, the assistant for Dr Somani's Homoeopathy. I can help you understand your concern and prepare it for the doctor. May I know your name to begin?`
    );
    bubble(
      "note",
      "For educational guidance only — not a diagnosis or prescription. Dr Somani will review and decide your treatment. In an emergency, call your local emergency number. You can optionally attach a report photo using 📎."
    );
  }

  // ----- guided intake (multilingual, works with no AI backend) -----
  function quickReplies(opts, cb) {
    const wrap = document.createElement("div");
    wrap.className = "ai-quick";
    opts.forEach(([label, val]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", () => {
        wrap.remove();
        bubble("user", label);
        cb(val);
      });
      wrap.appendChild(b);
    });
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function chooseLang(l) {
    lang = T[l] ? l : "en";
    phase = "intake";
    bubble("bot", T[lang].greet());
    bubble("note", T[lang].note);
    queue = ["name", "agesex", "concern", "history", "branch"];
    qi = -1;
    askNext();
  }
  function askNext() {
    qi++;
    if (qi >= queue.length) {
      bubble("bot", T[lang].thanks);
      handoff.textContent = T[lang].handoffBtn;
      handoff.classList.remove("hidden");
      return;
    }
    const key = queue[qi];
    if (key === "followup") {
      bubble("bot", T[lang].followups[intake._cond]);
    } else {
      bubble("bot", T[lang].steps[key](intake));
    }
  }
  function guidedSummary() {
    const date = new Date().toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
    const L = ["*New patient enquiry — Dr Somani's website assistant*", "Date: " + date, ""];
    if (intake.name) L.push("• Name: " + intake.name);
    if (intake.agesex) L.push("• Age / gender: " + intake.agesex);
    if (intake.concern) L.push("• Main concern: " + intake.concern);
    if (intake.followup) L.push("• Details: " + intake.followup);
    if (intake.history) L.push("• History / notes: " + intake.history);
    if (intake.branch) L.push("• Preferred: " + intake.branch);
    if (intake._report) L.push("• Report to share: " + intake._report);
    L.push("• Chat language: " + (LANG_LABEL[lang] || "English"));
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

        // Patient typed instead of tapping a language chip
        if (phase === "lang") {
          chooseLang(detectLang(text));
          input.focus();
          return;
        }

        // Emergency safety check on anything they tell us
        if (text && isEmergency(text)) bubble("note", T[lang].emergency);

        const key = queue[qi];
        if (key) {
          if (key === "followup") intake.followup = text;
          else intake[key] = text || (attachment ? "(report attached)" : "");
          // After the main concern, add one condition-aware follow-up
          if (key === "concern") {
            const cond = detectCondition(text);
            if (cond && T[lang].followups[cond]) {
              intake._cond = cond;
              queue.splice(qi + 1, 0, "followup");
            }
          }
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
