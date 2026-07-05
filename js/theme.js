// Theme switcher: System / Light / Dark (shared across all pages)
(function () {
  const root = document.documentElement;
  const sw = document.getElementById('themeSwitch');
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  function storedMode() {
    try { return localStorage.getItem('theme') || 'light'; } catch (e) { return 'light'; }
  }
  function resolve(mode) {
    if (mode === 'dark') return 'dark';     // red + black
    if (mode === 'system') return 'blue';   // dark blue + red
    return 'light';
  }
  function apply(mode) {
    root.setAttribute('data-theme', resolve(mode));
    if (sw) sw.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
    });
  }

  apply(storedMode());

  if (sw) {
    sw.querySelectorAll('button').forEach((b) => {
      b.addEventListener('click', () => {
        const mode = b.dataset.mode;
        try { localStorage.setItem('theme', mode); } catch (e) {}
        apply(mode);
      });
    });
  }
  // keep in sync with the OS when in "system" mode
  mq.addEventListener('change', () => { if (storedMode() === 'system') apply('system'); });
})();
