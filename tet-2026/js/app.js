import { createStateMachine, ExperienceState } from './stateMachine.js';
import { createAmbientAudio, createGoldenDust, setupParallax, spawnBlossoms } from './scene.js';

const midnight2026 = new Date('2026-01-01T00:00:00');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion) document.body.classList.add('reduced-motion');

const panels = {
  intro: document.getElementById('introPanel'),
  countdown: document.getElementById('countdownPanel'),
  scene: document.getElementById('scenePanel'),
  couplet: document.getElementById('coupletPanel'),
  wish: document.getElementById('wishPanel')
};

const root = document.getElementById('experience');
const clock = document.getElementById('clock');
const nameInput = document.getElementById('nameInput');
const applyName = document.getElementById('applyName');
const wishText = document.getElementById('wishText');
const audioToggle = document.getElementById('audioToggle');
const blossomField = document.getElementById('blossomField');

const cleanupFns = [];
const ambient = createAmbientAudio();
cleanupFns.push(createGoldenDust(document.getElementById('backgroundCanvas'), reducedMotion));
cleanupFns.push(spawnBlossoms(blossomField, reducedMotion ? 14 : 28));
cleanupFns.push(setupParallax(document.getElementById('parallaxScene'), reducedMotion));

const machine = createStateMachine(ExperienceState.INTRO, {
  [ExperienceState.INTRO]: [ExperienceState.COUNTDOWN, ExperienceState.SCENE],
  [ExperienceState.COUNTDOWN]: [ExperienceState.SCENE],
  [ExperienceState.SCENE]: [ExperienceState.COUPLET],
  [ExperienceState.COUPLET]: [ExperienceState.WISH],
  [ExperienceState.WISH]: [ExperienceState.CELEBRATION],
  [ExperienceState.CELEBRATION]: []
});

let countdownTimer;
let fireworkDestroy = null;

function formatTime(msRemaining) {
  const total = Math.max(0, Math.floor(msRemaining / 1000));
  const hrs = String(Math.floor(total / 3600)).padStart(2, '0');
  const mins = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const secs = String(total % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function show(panelKey) {
  Object.values(panels).forEach((panel) => panel.classList.remove('active'));
  if (panels[panelKey]) panels[panelKey].classList.add('active');
}

machine.subscribe(async ({ current }) => {
  root.dataset.mode = current === ExperienceState.CELEBRATION ? 'celebration' : 'experience';

  if (current === ExperienceState.COUNTDOWN) show('countdown');
  if (current === ExperienceState.SCENE) {
    show('scene');
    setTimeout(() => machine.transition(ExperienceState.COUPLET), 4200);
  }
  if (current === ExperienceState.COUPLET) {
    show('couplet');
    setTimeout(() => machine.transition(ExperienceState.WISH), 4200);
  }
  if (current === ExperienceState.WISH) {
    show('wish');
    setTimeout(() => machine.transition(ExperienceState.CELEBRATION), 5200);
  }
  if (current === ExperienceState.CELEBRATION && !fireworkDestroy) {
    const { createFireworks } = await import('./fireworks.js');
    fireworkDestroy = createFireworks(document.getElementById('fireworksCanvas'), () => ambient.pulseFirework(), reducedMotion);
  }
});

function startCountdown() {
  show('countdown');
  countdownTimer = setInterval(() => {
    const remaining = midnight2026.getTime() - Date.now();
    if (remaining <= 0) {
      clock.textContent = '00:00:00';
      clearInterval(countdownTimer);
      machine.transition(ExperienceState.SCENE);
      return;
    }
    clock.textContent = formatTime(remaining);
  }, 200);
}

function bootFlow() {
  show('intro');
  setTimeout(() => {
    if (Date.now() >= midnight2026.getTime()) {
      machine.transition(ExperienceState.SCENE);
    } else {
      machine.transition(ExperienceState.COUNTDOWN);
      startCountdown();
    }
  }, reducedMotion ? 100 : 2400);
}

applyName.addEventListener('click', () => {
  const name = nameInput.value.trim();
  wishText.textContent = name
    ? `${name}, chúc năm mới 2026 viên mãn, tài lộc hanh thông và yêu thương luôn đầy.`
    : 'Chúc bạn một năm 2026 rực rỡ, bình an và thịnh vượng.';
  wishText.classList.remove('updated');
  requestAnimationFrame(() => wishText.classList.add('updated'));
});

nameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') applyName.click();
});

audioToggle.addEventListener('click', async () => {
  const enabled = await ambient.toggle();
  audioToggle.setAttribute('aria-pressed', String(enabled));
  audioToggle.textContent = enabled ? 'Tắt âm thanh' : 'Bật âm thanh';
});

window.addEventListener('beforeunload', () => {
  clearInterval(countdownTimer);
  cleanupFns.forEach((fn) => fn?.());
  fireworkDestroy?.();
});

bootFlow();
