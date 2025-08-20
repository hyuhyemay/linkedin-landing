// Tahun di footer
document.getElementById('year').textContent = new Date().getFullYear();

// ==== THEME TOGGLE ====
const html = document.documentElement;
const toggleBtn = document.getElementById('themeToggle');
function setTheme(mode){
  const dark = mode === 'dark';
  html.classList.toggle('dark', dark);
  localStorage.setItem('prefers-dark', dark ? '1' : '0');
  if (toggleBtn){
    toggleBtn.setAttribute('aria-pressed', String(dark));
    toggleBtn.textContent = dark ? '☀️' : '🌙';
  }
}
// init
(function(){
  const saved = localStorage.getItem('prefers-dark');
  if (saved === '1') return setTheme('dark');
  if (saved === '0') return setTheme('light');
  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(systemDark ? 'dark' : 'light');
})();
toggleBtn?.addEventListener('click', () => {
  setTheme(html.classList.contains('dark') ? 'light' : 'dark');
});

// ==== Smooth scroll ====
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id = a.getAttribute('href');
    if (id && id.length>1 && document.querySelector(id)){
      e.preventDefault();
      document.querySelector(id).scrollIntoView({behavior:'smooth'});
    }
  });
});

// ==== Accordion ====
const triggers = document.querySelectorAll('.accordion-trigger');
triggers.forEach(btn=>{
  btn.addEventListener('click',()=>{
    const open = btn.getAttribute('aria-expanded') === 'true';
    triggers.forEach(b=>{
      b.setAttribute('aria-expanded','false');
      const p = b.nextElementSibling; p.style.maxHeight=null; p.classList.remove('open');
    });
    if (!open){
      btn.setAttribute('aria-expanded','true');
      const p = btn.nextElementSibling; p.classList.add('open'); p.style.maxHeight = p.scrollHeight + 'px';
    }
  });
});

// ==== Scroll progress ====
const bar = document.getElementById('scrollProgress');
function updateProgress(){
  const st = window.scrollY || document.documentElement.scrollTop;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const pct = h > 0 ? (st / h) * 100 : 0;
  bar && (bar.style.width = pct + '%');
}
updateProgress(); window.addEventListener('scroll',updateProgress); window.addEventListener('resize',updateProgress);

// ==== Scroll reveal ====
const toReveal = document.querySelectorAll('[data-animate]');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if (entry.isIntersecting){ entry.target.classList.add('reveal'); io.unobserve(entry.target); }
  });
},{threshold:0.15});
toReveal.forEach(el=>io.observe(el));

// ==== Active nav highlight ====
const sections = [...document.querySelectorAll('main section[id]')];
const links = [...document.querySelectorAll('.nav a[href^="#"]')];
const byId = id => links.find(a => a.getAttribute('href') === `#${id}`);
const navObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    const a = byId(e.target.id); if (!a) return;
    if (e.isIntersecting){ links.forEach(x=>x.classList.remove('active')); a.classList.add('active'); }
  });
},{rootMargin:'-40% 0px -55% 0px'});
sections.forEach(s=>navObs.observe(s));

// ==== Avatar fallback (pakai author kalau data-name kosong) ====
document.querySelectorAll('img.avatar, .avatar-stack img').forEach(img=>{
  img.addEventListener('error', ()=>{
    let name = (img.dataset.name || '').trim();
    if (!name){
      const author = img.closest('.testimonial')?.querySelector('.author')?.textContent || '';
      const m = author.match(/—\s*([^,–—]+)(?:,|$)/);
      name = (m?.[1] || 'A').trim();
    }
    const initials = name.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
    const fall = document.createElement('span');
    fall.className = 'avatar-fallback fallback';
    fall.textContent = initials;
    img.replaceWith(fall);
  }, { once:true });
});

// ==== COUNTDOWN (Batch 31 Aug 2025) + Kursi ====
(function(){
  const out = document.getElementById('countdown');
  if (!out) return;
  const target = new Date('2025-08-31T09:00:00+07:00').getTime();
  function tick(){
    const now = Date.now();
    const d = Math.max(0, target - now);
    const days = Math.floor(d/86400000);
    const hours = Math.floor((d%86400000)/3600000);
    const mins = Math.floor((d%3600000)/60000);
    const secs = Math.floor((d%60000)/1000);
    out.textContent = `Mulai dalam ${days}h ${hours}j ${mins}m ${secs}d`;
  }
  tick(); setInterval(tick, 1000);
})();

// ==== Video Modal ====
(function(){
  const open = document.getElementById('videoOpen');
  const modal = document.getElementById('videoModal');
  const closeA = document.getElementById('videoClose');
  const closeB = document.getElementById('videoCloseBtn');
  const frame = document.getElementById('videoFrame');
  const YT = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1";
  function show(){ modal.classList.add('open'); frame.src = YT; }
  function hide(){ modal.classList.remove('open'); frame.src = ""; }
  open?.addEventListener('click', show);
  closeA?.addEventListener('click', hide);
  closeB?.addEventListener('click', hide);
  document.addEventListener('keydown', e=>{ if(e.key==='Escape' && modal.classList.contains('open')) hide(); });
})();

// ==== Animated counters (stats) ====
(function(){
  const nums = document.querySelectorAll('.stat .num');
  if (!nums.length) return;
  const fmt = new Intl.NumberFormat('id-ID');
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{
      if (!e.isIntersecting) return;
      const el = e.target; io.unobserve(el);
      const target = +el.dataset.target || 0;
      const start = performance.now(); const dur = 1400;
      (function step(t){
        const p = Math.min((t - start)/dur, 1);
        const val = Math.round(target * (1 - Math.pow(1-p,3))); // easeOutCubic
        el.textContent = fmt.format(val);
        if (p < 1) requestAnimationFrame(step);
      })(start);
    });
  }, {threshold:.5});
  nums.forEach(n=>io.observe(n));
})();

// ==== Testimonial auto-scroll (mobile) ====
(function(){
  const wrap = document.querySelector('.testimonial-grid');
  if (!wrap) return;
  function isMobile(){ return window.matchMedia('(max-width: 900px)').matches; }
  let timer = null;

  function start(){
    if (!isMobile()) return;
    stop();
    let i = 0;
    timer = setInterval(()=>{
      const cards = wrap.children;
      if (!cards.length) return;
      const card = cards[i % cards.length];
      const x = card.offsetLeft - 16; // sedikit padding
      wrap.scrollTo({ left: x, behavior: 'smooth' });
      i++;
    }, 3500);
  }
  function stop(){ if (timer){ clearInterval(timer); timer = null; } }
  start();
  window.addEventListener('resize', ()=>{ stop(); start(); });
  wrap.addEventListener('pointerdown', stop); // kalau user swipe, matiin autoplay
})();

/* ========================= */
/* ========= ADD-ONS ======= */
/* ========================= */

// Feedback Fab (prefix x-)
(function(){
  const fab = document.getElementById('xFeedbackFab');
  const panel = document.getElementById('xFeedbackPanel');
  const close = document.getElementById('xFbClose');
  const form = document.getElementById('xFbForm');
  const thanks = document.getElementById('xFbThanks');

  if(!fab || !panel) return;

  function open(){ panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); }
  function hide(){ panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); }

  fab.addEventListener('click', open);
  close?.addEventListener('click', hide);
  document.addEventListener('keydown', e=>{ if(e.key==='Escape' && panel.classList.contains('open')) hide(); });

  form?.addEventListener('submit', e=>{
    e.preventDefault();
    const msg  = document.getElementById('xFbMsg').value.trim();
    if(!msg) return alert('Tulis feedback dulu ya 😊');
    const store = JSON.parse(localStorage.getItem('bl-feedback')||'[]');
    store.push({msg, at: new Date().toISOString()});
    localStorage.setItem('bl-feedback', JSON.stringify(store));
    form.reset(); thanks.hidden = false; setTimeout(()=>{ thanks.hidden = true; hide(); }, 1200);
  });
})();

// Resources: pakai modal video yang sudah ada
(function(){
  const modal = document.getElementById('videoModal');
  const frame = document.getElementById('videoFrame');
  if(!modal || !frame) return;
  document.querySelectorAll('#resources [data-video]')?.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      frame.src = btn.getAttribute('data-video');
      modal.classList.add('open');
    });
  });
})();
