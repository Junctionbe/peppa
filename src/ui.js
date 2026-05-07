// DOM lookups + small helpers to keep the loop free of HTML noise.

export const ui = {
  messageEl:    document.getElementById('message'),
  exhibitEl:    document.getElementById('exhibit-panel'),
  hintEl:       document.getElementById('hint'),
  titleEl:      document.getElementById('ui-title'),
  startOverlay: document.getElementById('start-overlay'),
};

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
