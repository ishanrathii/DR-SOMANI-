// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('open');
});

// Close menu when a link is tapped
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  });
});

// ===== Navbar shadow on scroll =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
});

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Reviews marquee: duplicate for a seamless loop =====
const reviewTrack = document.getElementById('reviewTrack');
if (reviewTrack) {
  reviewTrack.innerHTML += reviewTrack.innerHTML; // second copy lets -50% translate loop seamlessly
}

// ===== Treatment cards -> fill the enquiry form =====
const conditionSelect = document.querySelector('#enquiryForm select[name="condition"]');
const decode = (s) => { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; };

document.querySelectorAll('.card[data-condition]').forEach((card) => {
  card.addEventListener('click', () => {
    const wanted = decode(card.getAttribute('data-condition'));
    if (conditionSelect) {
      // match the matching <option> (handles &amp; etc.)
      const opt = [...conditionSelect.options].find((o) => o.text.trim() === wanted.trim());
      conditionSelect.value = opt ? opt.value : wanted;
    }
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    if (conditionSelect) {
      conditionSelect.classList.remove('field-flash');
      void conditionSelect.offsetWidth; // restart animation
      conditionSelect.classList.add('field-flash');
      setTimeout(() => conditionSelect.focus({ preventScroll: true }), 600);
    }
  });
});

// ===== Scroll reveal (motion polish) =====
(function () {
  const items = document.querySelectorAll('.reveal, .reveal-stagger');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    items.forEach((el) => io.observe(el));
  }
})();

// ===== Count-up for the trust stat band =====
(function () {
  const nums = document.querySelectorAll('.stat strong');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!nums.length || reduce || !('IntersectionObserver' in window)) return;

  function animate(el) {
    const raw = el.textContent.trim();
    const m = raw.match(/^(\d+)(.*)$/); // leading number + suffix (+, %, etc.)
    if (!m) return;
    const target = parseInt(m[1], 10);
    const suffix = m[2] || '';
    const dur = 1100;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  nums.forEach((el) => io.observe(el));
})();

// ===== Skin & Vitiligo gallery: only show once a real photo loads =====
(function () {
  const sec = document.getElementById("skinGallery");
  if (!sec) return;
  let shown = false;
  const reveal = () => {
    if (shown) return;
    shown = true;
    sec.classList.remove("hidden");
  };
  sec.querySelectorAll("img").forEach((img) => {
    if (img.complete && img.naturalWidth > 0) reveal();
    img.addEventListener("load", reveal);
  });
})();

// ===== Online consultation =====
(function () {
  const cfg = window.SOMANI_ONLINE || {};
  const WA = cfg.whatsapp || "919834172124";

  // single-select chip groups
  function chipGroup(id) {
    const box = document.getElementById(id);
    if (!box) return () => "";
    box.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      box.querySelectorAll("button").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
    });
    return () => {
      const s = box.querySelector("button.on");
      return s ? s.getAttribute("data-v") : "";
    };
  }
  const getDay = chipGroup("obDay");
  const getTime = chipGroup("obTime");

  const send = document.getElementById("obSend");
  if (send) {
    send.addEventListener("click", () => {
      const val = (id) => (document.getElementById(id).value || "").trim();
      const name = val("obName");
      if (!name) {
        alert("Please enter your name so the clinic can reach you.");
        document.getElementById("obName").focus();
        return;
      }
      const city = val("obCity");
      const concern = document.getElementById("obConcern").value || "";
      const day = getDay();
      const time = getTime();
      let t = `Hi Dr Somani, I'd like to book an ONLINE consultation.\n\nName: ${name}`;
      if (city) t += `\nCity: ${city}`;
      if (concern) t += `\nConcern: ${concern}`;
      if (day) t += `\nPreferred day: ${day}`;
      if (time) t += `\nPreferred time: ${time}`;
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(t)}`, "_blank");
    });
  }

  // "Start video call" — join a configured room, else request on WhatsApp
  const video = document.getElementById("oVideo");
  if (video) {
    video.target = "_blank";
    video.rel = "noopener";
    video.href = cfg.videoLink
      ? cfg.videoLink
      : `https://wa.me/${WA}?text=${encodeURIComponent(
          "Hi Dr Somani, I'm ready for my online video consultation."
        )}`;
  }

  // "Pay fee via UPI" — enabled only when a UPI ID is configured
  const pay = document.getElementById("oPay");
  if (pay) {
    if (cfg.upiId) {
      let params = `pa=${encodeURIComponent(cfg.upiId)}&pn=${encodeURIComponent(
        cfg.upiName || "Dr Somani's Homoeopathy"
      )}&cu=INR`;
      if (cfg.fee) params += `&am=${encodeURIComponent(cfg.fee)}`;
      pay.href = `upi://pay?${params}`;
      if (cfg.fee) pay.textContent = `💳 Pay ₹${cfg.fee} via UPI`;
    } else {
      pay.remove();
    }
  }

  // Timings
  const tim = document.getElementById("oTimings");
  if (tim && cfg.timings) tim.textContent = cfg.timings;
})();

// ===== Enquiry form -> WhatsApp =====
const form = document.getElementById('enquiryForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = (data.get('name') || '').trim();
  const phone = (data.get('phone') || '').trim();
  const condition = data.get('condition') || '';
  const branch = data.get('branch') || '';
  const message = (data.get('message') || '').trim();

  if (!name || !phone) {
    alert('Please enter your name and phone number.');
    return;
  }
  if (!branch) {
    alert('Please select your preferred branch (Pune, Jalgaon or Online).');
    return;
  }

  // For now, all enquiries route to the main clinic number (9834172124).
  // (Separate per-branch numbers can be added here later.)
  const toNumber = '919834172124';

  let text = `Hi Dr Somani, I'd like to book a consultation.\n\nName: ${name}\nPhone: ${phone}\nBranch: ${branch}`;
  if (condition) text += `\nConcern: ${condition}`;
  if (message) text += `\nMessage: ${message}`;

  window.open(`https://wa.me/${toNumber}?text=${encodeURIComponent(text)}`, '_blank');
});
