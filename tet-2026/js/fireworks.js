const TAU = Math.PI * 2;

export function createFireworks(canvas, onBurst = () => {}, reducedMotion = false) {
  const ctx = canvas.getContext('2d');
  let width;
  let height;
  let raf;
  let lastBurst = 0;

  const quality = reducedMotion ? 0.35 : (window.innerWidth < 768 ? 0.65 : 1);
  const rockets = [];
  const sparks = [];

  function resize() {
    canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
    canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    width = window.innerWidth;
    height = window.innerHeight;
  }

  function spawnRocket() {
    rockets.push({
      x: width * (0.18 + Math.random() * 0.64),
      y: height + 20,
      vy: -(6.8 + Math.random() * 1.8),
      vx: (Math.random() - 0.5) * 1.4,
      target: height * (0.22 + Math.random() * 0.36),
      hue: 35 + Math.random() * 20
    });
  }

  function burst(rocket) {
    const count = Math.floor((60 + Math.random() * 70) * quality);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * TAU;
      const speed = Math.random() * 2.9 + 0.5;
      sparks.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 62 + Math.random() * 35,
        alpha: 1,
        hue: rocket.hue + Math.random() * 24
      });
    }
    onBurst();
  }

  function draw() {
    ctx.fillStyle = 'rgba(15, 4, 6, 0.16)';
    ctx.fillRect(0, 0, width, height);

    if (performance.now() - lastBurst > 780 / quality) {
      spawnRocket();
      lastBurst = performance.now();
    }

    rockets.forEach((rocket, idx) => {
      rocket.x += rocket.vx;
      rocket.y += rocket.vy;
      rocket.vy += 0.03;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${rocket.hue}, 96%, 72%, 0.9)`;
      ctx.arc(rocket.x, rocket.y, 2.2, 0, TAU);
      ctx.fill();
      if (rocket.y <= rocket.target) {
        burst(rocket);
        rockets.splice(idx, 1);
      }
    });

    sparks.forEach((spark, idx) => {
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += 0.03;
      spark.vx *= 0.992;
      spark.life -= 1;
      spark.alpha = spark.life / 100;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${spark.hue}, 100%, 72%, ${Math.max(0, spark.alpha)})`;
      ctx.arc(spark.x, spark.y, 1.4, 0, TAU);
      ctx.fill();
      if (spark.life <= 0) sparks.splice(idx, 1);
    });

    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    ctx.clearRect(0, 0, width, height);
  };
}
