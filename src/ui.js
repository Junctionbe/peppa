// DOM lookups + small helpers to keep the loop free of HTML noise.

export const ui = {
  panel:        document.getElementById('ui'),
  messageEl:    document.getElementById('message'),
  exhibitEl:    document.getElementById('exhibit-panel'),
  hintEl:       document.getElementById('hint'),
  titleEl:      document.getElementById('ui-title'),
  pizzaEl:      document.getElementById('pizza-counter'),
  icecreamEl:   document.getElementById('icecream-counter'),
  puddleEl:     document.getElementById('puddle-counter'),
  questsEl:     document.getElementById('quests-list'),
  startOverlay: document.getElementById('start-overlay'),
};

// ---- Help panel collapse / expand ----
// Tapping the title toggles. Mobile defaults to collapsed.
if (ui.panel && ui.titleEl) {
  ui.titleEl.addEventListener('click', () => {
    ui.panel.classList.toggle('collapsed');
  });
  if (matchMedia('(pointer: coarse)').matches) {
    ui.panel.classList.add('collapsed');
  }
}

export function showMessage(text, sub) {
  ui.messageEl.innerHTML = text + (sub ? `<small>${sub}</small>` : '');
  ui.messageEl.style.display = 'block';
}

export function hideMessage() {
  ui.messageEl.style.display = 'none';
}

export function updateTitle(currentChar, mode) {
  const who  = currentChar === 'peppa' ? '🐷 Peppa' : '🐽 Papa Pig';
  const what = mode === 'bike' ? 'à vélo' : mode === 'car' ? 'en voiture' : 'à pied';
  ui.titleEl.textContent = `${who} ${what}`;
}

export function setHint(html) {
  if (html) { ui.hintEl.innerHTML = html; ui.hintEl.style.display = 'block'; }
  else      { ui.hintEl.style.display = 'none'; }
}

export function setExhibit(text) {
  if (text) { ui.exhibitEl.textContent = text; ui.exhibitEl.style.display = 'block'; }
  else      { ui.exhibitEl.style.display = 'none'; }
}

export function setPizzaCount(n) {
  ui.pizzaEl.innerHTML = `🍕 <b>${n}</b>`;
  ui.pizzaEl.style.display = n > 0 ? 'block' : 'none';
}

export function setIceCreamCount(n) {
  ui.icecreamEl.innerHTML = `🍦 <b>${n}</b>`;
  ui.icecreamEl.style.display = n > 0 ? 'block' : 'none';
}

export function setPuddleCount(n) {
  ui.puddleEl.innerHTML = `💦 <b>${n}</b>`;
  ui.puddleEl.style.display = n > 0 ? 'block' : 'none';
}

export function setQuests(quests) {
  if (!ui.questsEl) return;
  ui.questsEl.innerHTML = quests.map(q => {
    const status = q.done ? '✅' : `${q.progress}/${q.target}`;
    const cls = q.done ? 'quest done' : 'quest';
    return `<div class="${cls}">${q.icon} ${q.text}<span class="progress">${status}</span></div>`;
  }).join('');
}
