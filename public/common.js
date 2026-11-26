(function () {
  // low-end devices: turn off decorative animation
  if ((navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4) document.documentElement.classList.add('lite');
  // year
  document.querySelectorAll('.yr').forEach(e => e.textContent = new Date().getFullYear());
  // canonical + og:url from the live domain
  try {
    const url = location.origin + location.pathname.replace(/index\.html$/, '');
    const c = document.createElement('link'); c.rel = 'canonical'; c.href = url; document.head.appendChild(c);
    const o = document.createElement('meta'); o.setAttribute('property', 'og:url'); o.content = url; document.head.appendChild(o);
  } catch (e) {}
  // mobile menu
  const b = document.getElementById('burger'), l = document.getElementById('links');
  if (b && l) {
    const set = (open) => {
      l.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
      b.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-' + (open ? 'close' : 'menu') + '"/></svg>';
    };
    b.addEventListener('click', () => set(!l.classList.contains('open')));
    l.addEventListener('click', e => e.target.closest('a') && set(false));
    document.addEventListener('keydown', e => e.key === 'Escape' && set(false));
    window.addEventListener('resize', () => innerWidth > 860 && set(false));
  }
  // scroll reveal
  const els = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver((en) => en.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(e => io.observe(e));
})();
