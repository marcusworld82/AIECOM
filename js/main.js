/* ============================================================
   AI ECOM AGENCY — main.js
   ============================================================ */

// NAV SCROLL STATE
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// MOBILE NAV TOGGLE
const burger = document.getElementById('navBurger');
const menu   = document.getElementById('navMenu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  const spans = burger.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  }
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  burger.setAttribute('aria-expanded', false);
  const spans = burger.querySelectorAll('span');
  spans[0].style.transform = spans[1].style.opacity = spans[2].style.transform = '';
  spans[1].style.opacity = '';
}));

// HERO CANVAS — particle field
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const PARTICLE_COUNT = 90;
  const particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function rand(min, max) { return Math.random() * (max - min) + min; }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: rand(0, 1), y: rand(0, 1),
      vx: rand(-.00035, .00035), vy: rand(-.00035, .00035),
      r: rand(1.2, 3.4),
      alpha: rand(.18, .7),
      color: Math.random() < .55 ? '124,58,237' : (Math.random() < .5 ? '155,93,245' : '34,211,165')
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
      const px = p.x * W, py = p.y * H;
      // connections
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = (p.x - q.x) * W, dy = (p.y - q.y) * H;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(q.x * W, q.y * H);
          ctx.strokeStyle = `rgba(124,58,237,${(.22 * (1 - dist / 130)).toFixed(3)})`;
          ctx.lineWidth = .7;
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// SCROLL REVEAL
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const io  = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        // stagger siblings
        const siblings = Array.from(e.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
        const idx = siblings.indexOf(e.target);
        setTimeout(() => {
          e.target.classList.add('visible');
        }, Math.min(idx * 110, 400));
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

// ANIMATED COUNTERS
(function initCounters() {
  const nums = document.querySelectorAll('.proof__num[data-target]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el      = e.target;
      const target  = parseInt(el.dataset.target, 10);
      const prefix  = el.dataset.prefix  || '';
      const suffix  = el.dataset.suffix  || '';
      const duration = 2200;
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        const val  = Math.round(ease * target);
        // format with commas
        el.textContent = prefix + val.toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
})();

// ROI CALCULATOR (if present)
(function initROI() {
  const lR = document.getElementById('listingsRange');
  const pR = document.getElementById('priceRange');
  if (!lR || !pR) return;
  function calc() {
    const listings = parseInt(lR.value);
    const price    = parseInt(pR.value);
    document.getElementById('listingsVal').textContent = listings;
    document.getElementById('priceVal').textContent    = '$' + price.toLocaleString();
    const carrying    = listings * 4200;
    const commission  = (listings / 10) * price * 0.025;
    const monthly     = carrying + commission;
    document.getElementById('roiCarrying').textContent   = '$' + Math.round(carrying).toLocaleString();
    document.getElementById('roiCommission').textContent = '$' + Math.round(commission).toLocaleString();
    document.getElementById('roiAnnual').textContent     = '$' + Math.round(monthly * 12).toLocaleString();
  }
  lR.addEventListener('input', calc);
  pR.addEventListener('input', calc);
  calc();
})();

// MAGNETIC BUTTONS
if (!window.matchMedia('(pointer: coarse)').matches) {
  document.querySelectorAll('.btn--accent, .btn--lg').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width  / 2;
      const y = e.clientY - r.top  - r.height / 2;
      btn.style.transform = `translate(${x * .22}px, ${y * .22}px) scale(1.04)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

// CURSOR GLOW
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const glow = document.createElement('div');
  glow.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,.13),transparent 65%);transform:translate(-50%,-50%);transition:opacity .4s;';
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
})();
