// Nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});

// ---------- Data-driven content (events, explore, featured) ----------
function randomPick(arr, n){ return [...arr].sort(() => 0.5 - Math.random()).slice(0, n); }

async function loadJSON(path){
  try{
    const res = await fetch(path);
    if(!res.ok) throw new Error(`Failed to load ${path}`);
    return await res.json();
  }catch(err){
    console.error(err);
    return [];
  }
}

function renderEvents(events){
  const c = document.getElementById('eventsContainer');
  if(!c) return;
  c.innerHTML = '';
  events.forEach(ev => {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `<span class="date">${ev.date}</span><h3>${ev.title}</h3><p>${ev.excerpt}</p>`;
    if(ev.link && ev.link !== '#'){
      const a = document.createElement('a');
      a.href = ev.link; a.className = 'read'; a.textContent = 'read more →';
      el.appendChild(a);
    }
    c.appendChild(el);
  });
}

function renderExplore(posts){
  const c = document.getElementById('exploreContainer');
  if(!c) return;
  c.innerHTML = '';
  randomPick(posts, 3).forEach(p => {
    const el = document.createElement('article');
    el.className = 'blog-card';
    el.innerHTML = `<div class="blog-thumb ${p.thumb || 't1'}">${p.tag || '•'}</div>
      <div class="blog-body">
        <h3>${p.title}</h3>
        <a class="read" href="${p.link}">read more &rarr;</a>
      </div>`;
    c.appendChild(el);
  });
}

function renderFeatured(posts){
  const c = document.getElementById('featuredContainer');
  if(!c) return;
  c.innerHTML = '';
  const latest = [...posts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);
  latest.forEach(p => {
    const el = document.createElement('div');
    el.className = 'foot-post';
    el.innerHTML = `<div class="stub">${p.tag || '•'}</div><span><a href="${p.link}">${p.title}</a></span>`;
    c.appendChild(el);
  });
}

(async function initContent(){
  const [events, explore, featured] = await Promise.all([
    loadJSON('data/recentEvents.json'),
    loadJSON('data/explore.json'),
    loadJSON('data/featured.json')
  ]);
  renderEvents(events);
  renderExplore(explore);
  renderFeatured(featured);
})();

// ---------- Ambient background field ----------
(function(){
  const canvas = document.getElementById('bgfield');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, dpr, particles;
  const colors = ['230,150,60', '58,143,143', '122,91,143', '239,231,214'];
  function build(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round((w * h) / 26000);
    particles = Array.from({ length: Math.min(count, 70) }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.4 + 0.5,
      c: colors[Math.floor(Math.random() * colors.length)],
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.5,
      drift: 0.01 + Math.random() * 0.015
    }));
  }
  window.addEventListener('resize', build);
  build();
  let t = 0;
  function draw(){
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      const o = 0.15 + 0.35 * Math.abs(Math.sin(t * p.speed + p.phase));
      ctx.fillStyle = `rgba(${p.c},${o})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      p.y -= p.drift;
      if(p.y < -5) p.y = h + 5;
    });
    t += 0.02;
    if(!reduce) requestAnimationFrame(draw);
  }
  draw();
})();

// ---------- Hero wavefunction canvas ----------
(function(){
  const canvas = document.getElementById('wave');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  let t1 = 0;
  let t2 = 0;
  
  const speed1 = 0.020; 
  const speed2 = 0.028; 

  const wavelength = 180;
  const k = (2 * Math.PI) / wavelength;
  const step = 8;
  
  function draw(){
    ctx.clearRect(0, 0, w, h);

    const centerY = h * 0.65; 
    const midX = w / 2;
    const envelopeSpread = Math.max(w * 0.35, 240);

    ctx.strokeStyle = 'rgba(58,143,143,0.45)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for(let x = 0; x <= w + step; x += step){
      const env = Math.exp(-Math.pow((x - midX) / envelopeSpread, 2) * 1.5);
      const y = centerY + Math.sin(x * k + t1) * 28 * env;
      if(x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(230,150,60,0.4)';
    ctx.beginPath();
    for(let x = 0; x <= w + step; x += step){
      const env = Math.exp(-Math.pow((x - midX) / envelopeSpread, 2) * 1.5);
      const y = centerY + Math.sin(x * k + t2 + 1.15) * 20 * env;
      if(x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    t1 += speed1;
    t2 += speed2;

    if(!reduce) requestAnimationFrame(draw);
  }
  draw();
})();




// ---------- Single-Slit Diffraction Hit Simulation ----------
(function () {
  const canvas = document.getElementById('doubleslit');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0;
  let h = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width || 380;
    h = rect.height || 190;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const dotPalette = [
    '250, 204, 21',   // Amber (#facc15)
    '230, 150, 60',   // Warm Gold
    '45, 212, 191',   // Teal (#2dd4bf)
    '239, 231, 214'   // Chalk / White
  ];

  function sinc(u) {
    if (Math.abs(u) < 1e-4) return 1;
    return Math.sin(u) / u;
  }

  // Covers central peak + 5 side lobes on each side
  const uMax = 5.8 * Math.PI;

  function getBandProperties(u) {
    const absU = Math.abs(u);
    const m = absU / Math.PI;
    const nearestNode = Math.round(m);
    const distToNode = Math.abs(m - nearestNode);

    // Dynamic gap width keeping channels clean and outer lobes thin
    const gapThreshold = 0.12 + nearestNode * 0.025;
    if (nearestNode >= 1 && distToNode < gapThreshold) {
      return { prob: 0, heightFraction: 0, alphaScale: 0 };
    }

    const s = sinc(u);
    const rawI = s * s;

    let heightFraction = 0.50;
    let prob = 0;
    let alphaScale = 1.0;

    // Much gentler, subtle height reduction across orders
    if (absU < Math.PI) {
      heightFraction = 0.90; // Central lobe
      prob = rawI * 1.0;
      alphaScale = 0.85;
    } else if (absU < 2 * Math.PI) {
      heightFraction = 0.78; // 1st order
      prob = rawI * 10.0;
      alphaScale = 0.75;
    } else if (absU < 3 * Math.PI) {
      heightFraction = 0.70; // 2nd order
      prob = rawI * 22.0;
      alphaScale = 0.60;
    } else if (absU < 4 * Math.PI) {
      heightFraction = 0.62; // 3rd order
      prob = rawI * 34.0;
      alphaScale = 0.45;
    } else if (absU < 5 * Math.PI) {
      heightFraction = 0.55; // 4th order
      prob = rawI * 45.0;
      alphaScale = 0.32;
    } else {
      heightFraction = 0.50; // 5th order ghost fringe
      prob = rawI * 55.0;
      alphaScale = 0.22;
    }

    return { prob: Math.min(1, prob), heightFraction, alphaScale };
  }

  function sampleHit() {
    for (let i = 0; i < 140; i++) {
      const normX = (Math.random() - 0.5) * 2; // [-1, 1]
      const u = normX * uMax;
      const { prob, heightFraction, alphaScale } = getBandProperties(u);

      if (prob > 0 && Math.random() < prob) {
        const yNorm = (Math.random() - 0.5) * 2;
        const y = h / 2 + yNorm * (h * 0.48 * heightFraction);
        const x = (normX * 0.48 + 0.5) * w;
        return { x, y, alphaScale };
      }
    }

    return {
      x: w / 2 + (Math.random() - 0.5) * 16,
      y: h / 2 + (Math.random() - 0.5) * (h * 0.8),
      alphaScale: 0.85
    };
  }

  const dots = [];
  const MAX_DOTS = 650;
  let lastSpawn = 0;

  function spawnDot() {
    const pt = sampleHit();
    dots.push({
      x: pt.x,
      y: pt.y,
      r: Math.random() * 0.6 + 1.1,
      rgb: dotPalette[Math.floor(Math.random() * dotPalette.length)],
      alphaScale: pt.alphaScale,
      life: 0,
      maxLife: 240 + Math.random() * 180
    });
  }

  for (let i = 0; i < 440; i++) {
    spawnDot();
    dots[dots.length - 1].life = Math.random() * dots[dots.length - 1].maxLife;
  }

  function render(time) {
    ctx.clearRect(0, 0, w, h);

    if (time - lastSpawn > 16 && dots.length < MAX_DOTS) {
      spawnDot();
      spawnDot();
      if (Math.random() > 0.3) spawnDot();
      lastSpawn = time;
    }

    for (let i = dots.length - 1; i >= 0; i--) {
      const p = dots[i];
      p.life++;

      if (p.life >= p.maxLife) {
        dots.splice(i, 1);
        continue;
      }

      const progress = p.life / p.maxLife;
      let alpha;
      if (progress < 0.1) {
        alpha = progress / 0.1;
      } else {
        alpha = Math.max(0, 1 - Math.pow((progress - 0.1) / 0.9, 1.25));
      }

      const finalAlpha = alpha * p.alphaScale;
      ctx.fillStyle = `rgba(${p.rgb}, ${finalAlpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reduce) {
      requestAnimationFrame(render);
    }
  }

  requestAnimationFrame(render);
})();
