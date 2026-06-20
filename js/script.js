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

// ===== Enquiry form -> WhatsApp =====
const form = document.getElementById('enquiryForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = (data.get('name') || '').trim();
  const phone = (data.get('phone') || '').trim();
  const condition = data.get('condition') || '';
  const message = (data.get('message') || '').trim();

  if (!name || !phone) {
    alert('Please enter your name and phone number.');
    return;
  }

  let text = `Hi Dr Somani, I'd like to book a consultation.\n\nName: ${name}\nPhone: ${phone}`;
  if (condition) text += `\nConcern: ${condition}`;
  if (message) text += `\nMessage: ${message}`;

  window.open(`https://wa.me/919834172124?text=${encodeURIComponent(text)}`, '_blank');
});
