// Persist counters + quest progress to localStorage so the kid finds his
// scores again next time he opens the page.

import { state } from './state.js';
import { setPizzaCount, setIceCreamCount, setPuddleCount, setStarCount } from './ui.js';

const KEY = 'peppa-save-v1';

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (typeof data.pizzasEaten    === 'number') state.pizzasEaten    = data.pizzasEaten;
    if (typeof data.icecreamsEaten === 'number') state.icecreamsEaten = data.icecreamsEaten;
    if (typeof data.puddleJumps    === 'number') state.puddleJumps    = data.puddleJumps;
    if (typeof data.starsCollected === 'number') state.starsCollected = data.starsCollected;
    if (Array.isArray(data.questsCompleted))     state.questsCompleted    = new Set(data.questsCompleted);
    if (Array.isArray(data.visitedBuildings))    state.visitedBuildings   = new Set(data.visitedBuildings);
  } catch (_) { /* corrupt save → ignore */ }
}

export function refreshUIFromState() {
  if (state.pizzasEaten    > 0) setPizzaCount(state.pizzasEaten);
  if (state.icecreamsEaten > 0) setIceCreamCount(state.icecreamsEaten);
  if (state.puddleJumps    > 0) setPuddleCount(state.puddleJumps);
  if (state.starsCollected > 0) setStarCount(state.starsCollected);
}

export function saveSave() {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      pizzasEaten:      state.pizzasEaten,
      icecreamsEaten:   state.icecreamsEaten,
      puddleJumps:      state.puddleJumps,
      starsCollected:   state.starsCollected,
      questsCompleted:  state.questsCompleted ? [...state.questsCompleted] : [],
      visitedBuildings: state.visitedBuildings ? [...state.visitedBuildings] : [],
    }));
  } catch (_) { /* quota / private mode → ignore */ }
}

// Auto-save every 5s — small enough that we never lose much progress.
let timer = null;
export function startAutoSave() {
  if (timer) return;
  timer = setInterval(saveSave, 5000);
  // also save when the tab is hidden / closed
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveSave();
  });
  window.addEventListener('beforeunload', saveSave);
}
