// Theme toggle: single button cycling Light → Dark → System(blue)
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const order = ['light', 'dark', 'system'];
  const icon = { light: '🌙', dark: '☀️', system: '🔵' }; // 🌙/☀️ as the original toggle, 🔵 for the blue theme
  const label = { light: 'Light', dark: 'Dark (red & black)', system: 'System (dark blue)' };

  function resolve(mode) {
    if (mode === 'dark') return 'dark';     // red + black
    if (mode === 'system') return 'blue';   // dark blue + red
    return 'light';
  }
  function stored() {
    try { return localStorage.getItem('theme') || 'light'; } catch (e) { return 'light'; }
  }
  function apply(mode) {
    root.setAttribute('data-theme', resolve(mode));
    if (btn) {
      btn.textContent = icon[mode] || '🌙';
      btn.title = 'Theme: ' + (label[mode] || 'Light') + ' — click to change';
      btn.setAttribute('aria-label', 'Theme: ' + (label[mode] || 'Light'));
    }
  }

  apply(stored());

  if (btn) {
    btn.addEventListener('click', () => {
      const i = order.indexOf(stored());
      const next = order[(i + 1) % order.length];
      try { localStorage.setItem('theme', next); } catch (e) {}
      apply(next);
    });
  }
})();
