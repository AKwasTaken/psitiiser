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

  function hide() {
    if (stopped) return;
    stopped = true;
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
  const ctx = canvas.getContext('2d');
  if (!ctx) { finish(); return; }

  const dotRgb = '221, 197, 164';

  let w, h, dpr, scale;
  const R1 = 0.4;
  const R2 = 1.5;
  const maxExtent = R1 + R2;

  function applySize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    scale = (Math.min(w, h) / (2 * maxExtent)) * 0.38;
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

  applySize();
  window.addEventListener('resize', applySize);

  let angle = 0;
  let floatTick = 0;
  const speed = reduce ? 0 : 0.022;

  function frame() {
    const cx = w / 2;
    const floatY = reduce ? 0 : Math.sin(floatTick * 0.05) * 3;
    const cy = h / 2 + floatY;

    ctx.clearRect(0, 0, w, h);

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const rendered = points.map(p => {
      const x1 = p.x * cosA + p.z * sinA;
      const z1 = -p.x * sinA + p.z * cosA;
      return { x1, y1: p.y, z1 };
    }).sort((a, b) => a.z1 - b.z1);

    for (let i = 0; i < rendered.length; i++) {
      const p = rendered[i];
      const depth = Math.max(0, Math.min(1, (p.z1 + maxExtent) / (2 * maxExtent)));

      const sx = cx + p.x1 * scale;
      const sy = cy + p.y1 * scale;

      const radius = baseDotRadius + depth * (maxDotRadius - baseDotRadius);
      const alpha = 0.2 + depth * 0.8;

      ctx.save();
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);

      if (depth > 0.6) {
        ctx.shadowColor = `rgba(${dotRgb}, ${0.5 * depth})`;
        ctx.shadowBlur = 6 * depth;
      }

      ctx.fillStyle = `rgba(${dotRgb}, ${alpha})`;
      ctx.fill();
      ctx.restore();
    }

    angle += speed;
    floatTick += 1;

    if (!stopped && !reduce) requestAnimationFrame(frame);
  }
  frame();

  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });
}
