export function initWaveHero(canvasId = 'wave') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth || 800;
    h = canvas.clientHeight || 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
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

  function draw() {
    ctx.clearRect(0, 0, w, h);

    const centerY = h * 0.65;
    const midX = w / 2;
    const envelopeSpread = Math.max(w * 0.35, 240);

    ctx.strokeStyle = 'rgba(58,143,143,0.45)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let x = 0; x <= w + step; x += step) {
      const env = Math.exp(-Math.pow((x - midX) / envelopeSpread, 2) * 1.5);
      const y = centerY + Math.sin(x * k + t1) * 28 * env;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(230,150,60,0.4)';
    ctx.beginPath();
    for (let x = 0; x <= w + step; x += step) {
      const env = Math.exp(-Math.pow((x - midX) / envelopeSpread, 2) * 1.5);
      const y = centerY + Math.sin(x * k + t2 + 1.15) * 20 * env;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    t1 += speed1;
    t2 += speed2;

    if (!reduce) requestAnimationFrame(draw);
  }

  draw();
}
