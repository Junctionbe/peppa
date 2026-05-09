// Lightweight quest system. Each quest has a target value pulled from
// `state` via a getter, plus an icon and description. When a quest hits
// its target it is marked completed, persisted by save.js, and triggers
// confetti at the player's position.

import { state } from './state.js';
import { spawnConfetti } from './effects/confetti.js';
import { setQuests } from './ui.js';

if (!state.questsCompleted)   state.questsCompleted   = new Set();
if (!state.visitedBuildings)  state.visitedBuildings  = new Set();

const QUESTS = [
  { id: 'visit',    text: 'Visite tous les bâtiments', icon: '🏛️', target: 4, get: () => state.visitedBuildings.size },
  { id: 'pizzas',   text: 'Mange 3 pizzas',            icon: '🍕', target: 3, get: () => state.pizzasEaten },
  { id: 'icecream', text: 'Mange 2 glaces',            icon: '🍦', target: 2, get: () => state.icecreamsEaten },
  { id: 'puddles',  text: 'Saute dans 5 flaques',      icon: '💦', target: 5, get: () => state.puddleJumps },
];

export function getQuests() {
  return QUESTS.map(q => ({
    id: q.id,
    text: q.text,
    icon: q.icon,
    target: q.target,
    progress: Math.min(q.target, q.get()),
    done: state.questsCompleted.has(q.id),
  }));
}

export function refreshQuestUI() {
  setQuests(getQuests());
}

// Returns true if any quest just completed (so callers can play extra fx).
export function checkQuests(rigPosition) {
  let any = false;
  for (const q of QUESTS) {
    if (state.questsCompleted.has(q.id)) continue;
    if (q.get() >= q.target) {
      state.questsCompleted.add(q.id);
      any = true;
      if (rigPosition) spawnConfetti(rigPosition.x, rigPosition.y + 2, rigPosition.z, 40);
    }
  }
  if (any) refreshQuestUI();
  return any;
}

export function markBuildingVisited(name) {
  if (!name || state.visitedBuildings.has(name)) return false;
  state.visitedBuildings.add(name);
  refreshQuestUI();
  return true;
}
