# Dr Somani's Homoeopathy — Website

A modern, mobile-first single-page website for **Dr Kushal Somani** (Dr Somani's Homoeopathy),
offering 27 years of safe, side-effect-free homoeopathic care across Pune, Jalgaon and online.

## ✨ Features
- Slim top utility bar (phone, email, locations, Instagram, online-consult badge)
- Sticky translucent navbar with gold "Book Appointment" CTA + mobile hamburger menu
- Hero with doctor card, "27 Years of Trusted Homoeopathic Care", Book + WhatsApp CTAs
- Trust-stats strip (years, treatments, clinics, side-effect-free)
- 8-card treatments grid (Skin & Vitiligo, Allergies, Migraine, PCOD, Kidney Stones, Acidity, Paediatric, Mental Health)
- "Why Homoeopathy" benefits, About, Testimonials
- Contact section: both clinics + online note + enquiry form that opens a pre-filled WhatsApp message
- Floating sticky WhatsApp + Call buttons
- Fully responsive

## 🎨 Design
- **Palette:** Healing Green `#2E7D5B` · Warm Cream `#FAF7F0` · Soft Gold `#C9A24B`
- **Fonts:** Poppins (headings) · Inter (body)
- **Mood:** calm, holistic, trustworthy — rounded cards, soft shadows, leaf motifs

## 🗂 Structure
```
index.html        # markup
css/styles.css    # styles + design tokens
js/script.js      # nav toggle, scroll state, WhatsApp enquiry
```

## 🚀 Run locally
Just open `index.html` in a browser, or serve it:
```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## ✏️ Customising
- **Phone/WhatsApp:** replace `919834172124` in `index.html` and `js/script.js`
- **Email / Instagram:** update links in the top bar and contact section
- **Doctor photo:** swap the 👨‍⚕️ emoji placeholders (`.hero__avatar`, `.about__photo`) for an `<img>`
- **Colors:** edit the CSS variables in `:root` (top of `css/styles.css`)
