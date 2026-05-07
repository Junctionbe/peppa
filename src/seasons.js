// Seasonal cycle. Tweens grass + leaf material colors over the year and
// exposes the current season name for other systems (e.g. show snowman in
// winter, tweak NPC behaviour, etc.).

import * as THREE from 'three';
import { matGrass, matLeaf } from './setup.js';

const NAMES = ['printemps', 'été', 'automne', 'hiver'];
const SEASON_DURATION = 90;        // seconds per season
const palette = {
  printemps: { grass: new THREE.Color(0x8fdc6c), leaf: new THREE.Color(0x66bb6a) },
  été:       { grass: new THREE.Color(0x6fc845), leaf: new THREE.Color(0x43a047) },
  automne:   { grass: new THREE.Color(0xa1c054), leaf: new THREE.Color(0xff7043) },
  hiver:     { grass: new THREE.Color(0xddedf0), leaf: new THREE.Color(0xfafafa) },
};

let seasonTime = 0;
let snowman = null;

export function setSnowman(s) { snowman = s; }
export function getCurrentSeason() {
  const idx = Math.floor(seasonTime / SEASON_DURATION) % 4;
  return NAMES[idx];
}

export function updateSeason(dt) {
  seasonTime += dt;
  const idx = Math.floor(seasonTime / SEASON_DURATION) % 4;
  const t = (seasonTime % SEASON_DURATION) / SEASON_DURATION;
  const cur = palette[NAMES[idx]];
  const next = palette[NAMES[(idx + 1) % 4]];
  matGrass.color.copy(cur.grass).lerp(next.grass, t);
  matLeaf.color.copy(cur.leaf).lerp(next.leaf, t);
  if (snowman) snowman.visible = (NAMES[idx] === 'hiver');
}
