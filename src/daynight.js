// Day/night cycle: sun + moon position, sky/fog colour, ambient + sun
// intensity, plus star visibility.

import * as THREE from 'three';
import { scene, sun, ambient, matWindow } from './setup.js';
import { sunVisual, moonVisual, stars } from './world.js';

const DAY_CYCLE_S = 120; // 2 minutes for a full day
let dayTime = 0.5;       // 0 = midnight, 0.5 = noon

const dayColor      = new THREE.Color(0x87ceeb);
const nightColor    = new THREE.Color(0x1a2540);
const fogDayColor   = new THREE.Color(0xb3e0ff);
const fogNightColor = new THREE.Color(0x223150);
const tmpColor = new THREE.Color();

export function updateDayNight(dt) {
  dayTime = (dayTime + dt / DAY_CYCLE_S) % 1;
  const angle = dayTime * Math.PI * 2 - Math.PI / 2;
  const elev  = Math.sin(angle);
  const dayness = Math.max(0, elev);

  // Keep sun above horizon for shadow camera, modulate intensity
  sun.position.set(40 * Math.cos(angle), Math.max(8, 70 * elev), 30);
  sun.intensity = dayness * 0.9;
  ambient.intensity = 0.25 + dayness * 0.55;

  // Sky and fog
  const t = Math.pow((elev + 1) / 2, 0.7); // bias slightly toward day
  scene.background.copy(tmpColor.copy(nightColor).lerp(dayColor, t));
  scene.fog.color.copy(tmpColor.copy(fogNightColor).lerp(fogDayColor, t));

  // Sun visual
  sunVisual.position.x = 60 * Math.cos(angle);
  sunVisual.position.y = 80 * elev;
  sunVisual.visible = elev > -0.2;
  // Moon (opposite side of sky)
  moonVisual.position.x = -60 * Math.cos(angle);
  moonVisual.position.y = -80 * elev;
  moonVisual.visible = elev < 0.2;
  // Stars
  stars.visible = elev < 0.1;
  // Building windows: warm yellow glow as the sun goes down
  const nightAmount = 1 - dayness;
  matWindow.emissive.setRGB(
    nightAmount * 0.9,
    nightAmount * 0.75,
    nightAmount * 0.3,
  );
}

export function getDayTime() { return dayTime; }
