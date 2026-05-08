// Keyboard input. `keys` reflects the live held state. `wasJustPressed`
// returns true exactly once per fresh keydown — call `clearJustPressed()`
// at the end of each frame.
export const keys = {};
const justPressed = new Set();

document.addEventListener('keydown', (e) => {
  if (!keys[e.code]) justPressed.add(e.code);
  keys[e.code] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
});
document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

export function wasJustPressed(code) {
  return justPressed.has(code);
}

export function clearJustPressed() {
  justPressed.clear();
}

// Virtual key press/release used by the touch UI (action buttons).
export function virtualPress(code) {
  if (!keys[code]) justPressed.add(code);
  keys[code] = true;
}
export function virtualRelease(code) {
  keys[code] = false;
}
