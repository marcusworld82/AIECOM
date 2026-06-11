const mobileToggle = document.getElementById('mobileToggle');
const sideRail = document.getElementById('sideRail');

if (mobileToggle && sideRail) {
  mobileToggle.addEventListener('click', () => {
    const open = sideRail.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', String(open));
    const spans = mobileToggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
  document.querySelectorAll('.rail-nav a, .rail-cta').forEach((a) => {
    a.addEventListener('click', () => {
      sideRail.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const railLinks = document.querySelectorAll('.rail-nav a');
const pageSections = [...document.querySelectorAll('main section[id]')];
const navIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute('id');
    railLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  });
}, { threshold: 0.4 });
pageSections.forEach((s) => navIO.observe(s));

const revealEls = document.querySelectorAll('.reveal');
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (!entry.isIntersecting) return;
    const siblings = [...(entry.target.parentElement?.querySelectorAll('.reveal:not(.visible)') || [])];
    const delay = Math.min(siblings.indexOf(entry.target) * 100, 360);
    setTimeout(() => entry.target.classList.add('visible'), delay);
    revealIO.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
revealEls.forEach((el) => revealIO.observe(el));

const counterEls = document.querySelectorAll('.metric-card__num[data-target]');
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.target || 0);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = `${prefix}${Math.round(target * eased).toLocaleString()}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    countIO.unobserve(el);
  });
}, { threshold: 0.4 });
counterEls.forEach((el) => countIO.observe(el));

if (!window.matchMedia('(pointer: coarse)').matches) {
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  const cursorGlow = document.createElement('div');
  cursorGlow.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(208,166,79,0.1),transparent 68%);transform:translate(-50%,-50%);transition:opacity .4s;will-change:left,top;';
  document.body.appendChild(cursorGlow);
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  }, { passive: true });
}

const heroCanvas = document.getElementById('heroCanvas');
if (heroCanvas) {
  const ctx = heroCanvas.getContext('2d');
  const particles = [];
  const count = 55;
  let W = 0, H = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = heroCanvas.offsetWidth;
    H = heroCanvas.offsetHeight;
    heroCanvas.width = W * dpr;
    heroCanvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });

  const makeP = () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    r: Math.random() * 2 + 0.8,
    c: Math.random() > 0.55 ? '208,166,79' : '181,255,203'
  });

  for (let i = 0; i < count; i++) particles.push(makeP());

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 115) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(208,166,79,${((1 - dist / 115) * 0.15).toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},0.72)`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  };
  draw();
}
