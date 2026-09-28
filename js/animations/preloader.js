export function initPreloader({
  overlayId = 'preloader',
  canvasId = 'preloaderCanvas',
  minDuration = 2000,   // Minimum time the preloader should be visible
  fadeDuration = 800,   // Duration of the fade-out animation
  hardTimeout = 15000,  // Maximum time before the preloader is forcibly hidden
  baseDotRadius = 1,
  maxDotRadius = 3
} = {}) {
  const overlay = document.getElementById(overlayId);
  const canvas = document.getElementById(canvasId);
  if (!overlay) return;

  document.body.classList.add('preloading');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = performance.now();
  let stopped = false;
  let rafId = null;

  function hide() {
    if (stopped) return;
    stopped = true;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('resize', applySize);

    overlay.classList.add('is-hidden');
    document.body.classList.remove('preloading');
    setTimeout(() => overlay.remove(), fadeDuration);
  }

  const safety = setTimeout(hide, hardTimeout);

  function finish() {
    clearTimeout(safety);
    const elapsed = performance.now() - start;
    setTimeout(hide, Math.max(0, minDuration - elapsed));
  }

  if (!canvas) { finish(); return; }
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) { finish(); return; }

  const dotRgb = '221, 197, 164';

  let w = 0, h = 0, dpr = 1, scale = 1;
  const R1 = 0.4;
  const R2 = 1.5;
  const maxExtent = R1 + R2;
  const invDiameter = 1 / (2 * maxExtent);

  function applySize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    scale = (Math.min(w, h) * invDiameter) * 0.38;
  }

  const ringCount = 18;
  const tubeSteps = 4;
  const points = [];

  for (let i = 0; i < ringCount; i++) {
    const phi = (i / ringCount) * Math.PI * 2;
    for (let j = 0; j < tubeSteps; j++) {
      const theta = ((j + (i % 2) * 0.5) / tubeSteps) * Math.PI * 2;
      const rr = R2 + R1 * Math.cos(theta);

      points.push({
        x: rr * Math.cos(phi),
        y: rr * Math.sin(phi),
        z: R1 * Math.sin(theta)
      });
    }
  }

  const rendered = points.map(() => ({ x1: 0, y1: 0, z1: 0 }));

  applySize();
  window.addEventListener('resize', applySize);

  let angle = 0;
  let floatTick = 0;
  const rotSpeedPerSec = 3;
  let lastTime = performance.now();

  function frame(now) {
    if (stopped) return;

    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (!reduce) {
      angle += rotSpeedPerSec * delta;
      floatTick += delta * 60;
    }

    const cx = w / 2;
    const floatY = reduce ? 0 : Math.sin(floatTick * 0.1) * 3;
    const cy = h / 2 + floatY;

    ctx.clearRect(0, 0, w, h);

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const target = rendered[i];
      target.x1 = p.x * cosA + p.z * sinA;
      target.y1 = p.y;
      target.z1 = -p.x * sinA + p.z * cosA;
    }

    rendered.sort((a, b) => a.z1 - b.z1);

    for (let i = 0; i < rendered.length; i++) {
      const p = rendered[i];
      const depth = Math.max(0, Math.min(1, (p.z1 + maxExtent) * invDiameter));
      const sx = cx + p.x1 * scale;
      const sy = cy + p.y1 * scale;
      const radius = baseDotRadius + depth * (maxDotRadius - baseDotRadius);
      const alpha = 0.2 + depth * 0.8;

      if (depth > 0.6) {
        ctx.beginPath();
        ctx.arc(sx, sy, radius + 2.5 * depth, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotRgb}, ${0.12 * depth})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${dotRgb}, ${alpha})`;
      ctx.fill();
    }

    if (!reduce) {
      rafId = requestAnimationFrame(frame);
    }
  }

  rafId = requestAnimationFrame(frame);

  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });
}
