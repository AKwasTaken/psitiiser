export function initAmbientField(canvasId = 'bgfield') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, dpr, particles;
  const colors = ['230,150,60', '58,143,143', '122,91,143', '239,231,214'];

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round((w * h) / 26000);
    particles = Array.from({ length: Math.min(count, 70) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
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
  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      const o = 0.15 + 0.35 * Math.abs(Math.sin(t * p.speed + p.phase));
      ctx.fillStyle = `rgba(${p.c},${o})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      p.y -= p.drift;
      if (p.y < -5) p.y = h + 5;
    });

    t += 0.02;
    if (!reduce) requestAnimationFrame(draw);
  }

  draw();
}
