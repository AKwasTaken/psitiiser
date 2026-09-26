export function initDiffraction(canvasId = 'doubleslit') {
  const canvas = document.getElementById(canvasId);
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

  const uMax = 5.8 * Math.PI;

  function getBandProperties(u) {
    const absU = Math.abs(u);
    const m = absU / Math.PI;
    const nearestNode = Math.round(m);
    const distToNode = Math.abs(m - nearestNode);

    const gapThreshold = 0.12 + nearestNode * 0.025;
    if (nearestNode >= 1 && distToNode < gapThreshold) {
      return { prob: 0, heightFraction: 0, alphaScale: 0 };
    }

    const s = sinc(u);
    const rawI = s * s;

    let heightFraction = 0.50;
    let prob = 0;
    let alphaScale = 1.0;

    if (absU < Math.PI) {
      heightFraction = 0.90;
      prob = rawI * 1.0;
      alphaScale = 0.85;
    } else if (absU < 2 * Math.PI) {
      heightFraction = 0.78;
      prob = rawI * 10.0;
      alphaScale = 0.75;
    } else if (absU < 3 * Math.PI) {
      heightFraction = 0.70;
      prob = rawI * 22.0;
      alphaScale = 0.60;
    } else if (absU < 4 * Math.PI) {
      heightFraction = 0.62;
      prob = rawI * 34.0;
      alphaScale = 0.45;
    } else if (absU < 5 * Math.PI) {
      heightFraction = 0.55;
      prob = rawI * 45.0;
      alphaScale = 0.32;
    } else {
      heightFraction = 0.50;
      prob = rawI * 55.0;
      alphaScale = 0.22;
    }

    return { prob: Math.min(1, prob), heightFraction, alphaScale };
  }

  function sampleHit() {
    for (let i = 0; i < 140; i++) {
      const normX = (Math.random() - 0.5) * 2;
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
}
