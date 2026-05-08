// Touch UI: virtual joystick (left) + action buttons (right).
// Elements live in index.html and are CSS-hidden on non-touch devices.
// Attaches handlers unconditionally — they're harmless when the elements
// are display:none.

import { virtualPress, virtualRelease } from './input.js';

export const joystick = { x: 0, y: 0 };

// ---- Virtual joystick ----
const joyEl  = document.getElementById('joystick');
const knobEl = document.getElementById('joystick-knob');

if (joyEl && knobEl) {
  let joyTouchId = null;
  let joyCx = 0, joyCy = 0;
  const MAX_R = 50;

  joyEl.addEventListener('touchstart', (e) => {
    if (joyTouchId !== null) return;
    const t = e.changedTouches[0];
    joyTouchId = t.identifier;
    const rect = joyEl.getBoundingClientRect();
    joyCx = rect.left + rect.width  / 2;
    joyCy = rect.top  + rect.height / 2;
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (joyTouchId === null) return;
    for (const t of e.changedTouches) {
      if (t.identifier !== joyTouchId) continue;
      const dx = t.clientX - joyCx;
      const dy = t.clientY - joyCy;
      const len = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(len, MAX_R);
      const kx = (dx / len) * clamped;
      const ky = (dy / len) * clamped;
      knobEl.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
      joystick.x = kx / MAX_R;
      joystick.y = -ky / MAX_R;          // invert: pushing up = positive y
      e.preventDefault();
      return;
    }
  }, { passive: false });

  function endJoy(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === joyTouchId) {
        joyTouchId = null;
        joystick.x = 0; joystick.y = 0;
        knobEl.style.transform = 'translate(-50%, -50%)';
        return;
      }
    }
  }
  document.addEventListener('touchend', endJoy);
  document.addEventListener('touchcancel', endJoy);
}

// ---- Action buttons (data-key on each .touch-btn maps to a virtual key) ----
document.querySelectorAll('.touch-btn').forEach(btn => {
  const code = btn.dataset.key;
  if (!code) return;
  const press   = (e) => { virtualPress(code);   e.preventDefault(); };
  const release = (e) => { virtualRelease(code); e.preventDefault(); };
  btn.addEventListener('touchstart',  press,   { passive: false });
  btn.addEventListener('touchend',    release);
  btn.addEventListener('touchcancel', release);
  // Also support mouse (so you can test on desktop)
  btn.addEventListener('mousedown',   press);
  btn.addEventListener('mouseup',     release);
  btn.addEventListener('mouseleave',  release);
});
