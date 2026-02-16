const TWO_PI = Math.PI * 2;

export function setupParallax(sceneEl, reducedMotion) {
  if (reducedMotion) return () => {};
  const layers = [...sceneEl.querySelectorAll('.layer')];

  const onMove = (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;
    layers.forEach((layer, index) => {
      const depth = (index + 1) * 7;
      layer.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
    });
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  return () => window.removeEventListener('pointermove', onMove);
}

export function spawnBlossoms(container, amount = 24) {
  const blossoms = Array.from({ length: amount }, () => {
    const node = document.createElement('i');
    node.className = 'blossom';
    container.appendChild(node);
    return {
      node,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.08 + Math.random() * 0.14,
      drift: (Math.random() - 0.5) * 0.12,
      size: 8 + Math.random() * 8
    };
  });

  let raf;
  const loop = () => {
    blossoms.forEach((flower) => {
      flower.y += flower.speed;
      flower.x += flower.drift;
      if (flower.y > 102) {
        flower.y = -6;
        flower.x = Math.random() * 100;
      }
      if (flower.x < -5) flower.x = 105;
      if (flower.x > 105) flower.x = -5;
      flower.node.style.transform = `translate(${flower.x}%, ${flower.y}%) rotate(${flower.y * 3}deg)`;
      flower.node.style.width = `${flower.size}px`;
      flower.node.style.height = `${flower.size}px`;
    });
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    blossoms.forEach(({ node }) => node.remove());
  };
}

export function createGoldenDust(canvas, reducedMotion) {
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let raf;

  const qualityFactor = reducedMotion ? 0.3 : (window.innerWidth < 720 ? 0.55 : 1);
  const particleCount = Math.max(18, Math.floor(80 * qualityFactor));

  const particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.8 + 0.3,
    vy: Math.random() * 0.32 + 0.08,
    vx: (Math.random() - 0.5) * 0.1,
    alpha: Math.random() * 0.7 + 0.1
  }));

  function resize() {
    width = canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
    height = canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function frame() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.y * 0.01) * 0.06;
      if (p.y > window.innerHeight + 8) {
        p.y = -8;
        p.x = Math.random() * window.innerWidth;
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(247, 202, 118, ${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, TWO_PI);
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }

  resize();
  frame();
  window.addEventListener('resize', resize);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  };
}

export function createAmbientAudio() {
  let audioContext;
  let gain;
  let isOn = false;

  const ensureContext = () => {
    if (audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gain = audioContext.createGain();
    gain.gain.value = 0;
    gain.connect(audioContext.destination);

    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.13;

    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 180;
    filter.Q.value = 0.35;

    noise.connect(filter).connect(gain);
    noise.start();
  };

  return {
    async toggle() {
      ensureContext();
      if (audioContext.state === 'suspended') await audioContext.resume();
      isOn = !isOn;
      gain.gain.linearRampToValueAtTime(isOn ? 0.12 : 0, audioContext.currentTime + 0.3);
      return isOn;
    },
    pulseFirework() {
      if (!audioContext || !isOn) return;
      const osc = audioContext.createOscillator();
      const oscGain = audioContext.createGain();
      osc.frequency.value = 60 + Math.random() * 55;
      osc.type = 'triangle';
      oscGain.gain.value = 0;
      osc.connect(oscGain).connect(gain);
      osc.start();
      oscGain.gain.linearRampToValueAtTime(0.45, audioContext.currentTime + 0.02);
      oscGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
      osc.stop(audioContext.currentTime + 0.65);
    }
  };
}
