(function () {
  try {
    if (localStorage.getItem('vg_intro') === '1') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    localStorage.setItem('vg_intro', '1');
    document.documentElement.className += ' con-intro';
  } catch (e) {}
})();
