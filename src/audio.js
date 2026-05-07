// Synthesised SFX so no audio assets need to ship with the game.

let audioCtx = null;

function getAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { return null; }
  }
  return audioCtx;
}

export function resumeAudio() {
  const c = getAudio();
  if (c && c.state === 'suspended') c.resume();
}

export function playBell() {
  const ctx = getAudio(); if (!ctx) return;
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.frequency.setValueAtTime(1300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.5);
}

export function playHonk() {
  const ctx = getAudio(); if (!ctx) return;
  const osc = ctx.createOscillator(), osc2 = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = 'square';  osc.frequency.value = 280;
  osc2.type = 'square'; osc2.frequency.value = 350;
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(0.001, t);
  gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
  gain.gain.setValueAtTime(0.18, t + 0.28);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  osc.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
  osc.start(t); osc2.start(t);
  osc.stop(t + 0.42); osc2.stop(t + 0.42);
}

export function playJump() {
  const ctx = getAudio(); if (!ctx) return;
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(330, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.18);
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
  osc.connect(gain).connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.25);
}

export function playSplash() {
  const ctx = getAudio(); if (!ctx) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.45, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1500;
  const gain = ctx.createGain(); gain.gain.value = 0.45;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
}

export function playBigSplash() {
  const ctx = getAudio(); if (!ctx) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.7, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.5);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 2200;
  const gain = ctx.createGain(); gain.gain.value = 0.6;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
  // Add a giggle (high-pitched chirp) on top
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const og = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(900, t + 0.1);
  osc.frequency.exponentialRampToValueAtTime(1500, t + 0.3);
  og.gain.setValueAtTime(0.001, t + 0.1);
  og.gain.exponentialRampToValueAtTime(0.15, t + 0.13);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  osc.connect(og).connect(ctx.destination);
  osc.start(t + 0.1); osc.stop(t + 0.42);
}

// ---- Background music (toggleable cheerful loop) ----
let musicTimer = null;
let musicGain = null;
let musicMuted = false;

const MELODY = [
  // [frequency Hz, duration in beats]
  [523.25, 1], [659.25, 1], [783.99, 1], [659.25, 1],
  [783.99, 2], [698.46, 1], [659.25, 1],
  [523.25, 1], [659.25, 1], [783.99, 1], [1046.50, 1],
  [987.77, 2], [880.00, 1], [783.99, 1],
  [698.46, 1], [659.25, 1], [587.33, 1], [523.25, 1],
  [0, 2],
];
const BEAT_MS = 380;

function noteAt(freq, durSec) {
  const ctx = getAudio(); if (!ctx || !musicGain) return;
  if (freq <= 0) return;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  const t = ctx.currentTime;
  env.gain.setValueAtTime(0.001, t);
  env.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
  env.gain.exponentialRampToValueAtTime(0.001, t + Math.max(0.1, durSec * 0.9));
  osc.connect(env).connect(musicGain);
  osc.start(t); osc.stop(t + durSec + 0.05);
}

function tickMusic() {
  if (!musicTimer) return;
  const [freq, beats] = MELODY[tickMusic.i % MELODY.length];
  noteAt(freq, beats * BEAT_MS / 1000);
  tickMusic.i++;
  // schedule next based on this note's beats
  musicTimer = setTimeout(tickMusic, beats * BEAT_MS);
}
tickMusic.i = 0;

export function startMusic() {
  const ctx = getAudio(); if (!ctx) return;
  if (musicTimer) return;
  if (!musicGain) {
    musicGain = ctx.createGain();
    musicGain.gain.value = musicMuted ? 0 : 0.06;
    musicGain.connect(ctx.destination);
  } else {
    musicGain.gain.value = musicMuted ? 0 : 0.06;
  }
  musicTimer = setTimeout(tickMusic, 50);
}

export function toggleMusic() {
  musicMuted = !musicMuted;
  if (musicGain) {
    const ctx = getAudio();
    musicGain.gain.linearRampToValueAtTime(musicMuted ? 0 : 0.06, ctx.currentTime + 0.2);
  }
  return !musicMuted; // returns true if now playing
}

export function playEat() {
  const ctx = getAudio(); if (!ctx) return;
  const t = ctx.currentTime;
  // two short bites
  for (let i = 0; i < 2; i++) {
    const t0 = t + i * 0.15;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(160 + i * 40, t0);
    osc.frequency.exponentialRampToValueAtTime(90, t0 + 0.1);
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.13);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + 0.15);
  }
}

export function playWin() {
  const ctx = getAudio(); if (!ctx) return;
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'triangle'; osc.frequency.value = freq;
    const t0 = ctx.currentTime + i * 0.16;
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + 0.4);
  });
}
