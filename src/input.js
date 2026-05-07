// Raw key state. Edge-detection (just-pressed) is handled in main.js
// because the action varies with the current game mode.
export const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
});

document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});
