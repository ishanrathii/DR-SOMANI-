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
