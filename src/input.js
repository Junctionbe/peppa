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
