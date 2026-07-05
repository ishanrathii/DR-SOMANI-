// Dark / light theme toggle (shared across all pages)
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const current = () => root.getAttribute('data-theme') || 'light';
  const paint = () => { if (btn) btn.textContent = current() === 'dark' ? '☀️' : '🌙'; };
  paint();
  if (btn) {
    btn.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      paint();
    });
  }
})();
