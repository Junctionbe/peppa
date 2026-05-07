// Weather system: rain particles + rainbow that appears when rain stops.

import * as THREE from 'three';
import { scene } from './setup.js';

export const weather = { rain: false };

// ---- Rain ----
const RAIN_DROPS = 80;
const rainGroup = new THREE.Group();
const rainMat = new THREE.MeshBasicMaterial({ color: 0xa3d8f7, transparent: true, opacity: 0.6 });
const dropGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4);
for (let i = 0; i < RAIN_DROPS; i++) {
  const drop = new THREE.Mesh(dropGeo, rainMat);
  drop.position.set(
    (Math.random() - 0.5) * 30,
    Math.random() * 15 + 5,
    (Math.random() - 0.5) * 30,
  );
  rainGroup.add(drop);
}
rainGroup.visible = false;
scene.add(rainGroup);

// ---- Rainbow ----
const rainbow = new THREE.Group();
const rainbowColors = [0xff5252, 0xff9800, 0xffeb3b, 0x66bb6a, 0x4fc3f7, 0x3f51b5, 0x9c27b0];
for (let i = 0; i < rainbowColors.length; i++) {
  const r = 22 + i * 0.45;
  const arc = new THREE.Mesh(
    new THREE.TorusGeometry(r, 0.22, 6, 36, Math.PI),
    new THREE.MeshBasicMaterial({ color: rainbowColors[i], transparent: true, opacity: 0 }),
  );
  rainbow.add(arc);
}
rainbow.position.set(0, 0, 32);
rainbow.visible = false;
scene.add(rainbow);

const RAINBOW_DURATION = 35; // seconds visible after rain stops
let rainbowTimer = 0;

// Public API ------------------------------------------------------------
export function toggleRain() {
  weather.rain = !weather.rain;
  rainGroup.visible = weather.rain;
  if (!weather.rain) {
    // Spawn rainbow when rain stops
    rainbowTimer = RAINBOW_DURATION;
    rainbow.visible = true;
  }
  return weather.rain;
}

export function updateWeather(dt, rigPos) {
  // Rain physics
  if (weather.rain) {
    rainGroup.position.x = rigPos.x;
    rainGroup.position.z = rigPos.z;
    for (const drop of rainGroup.children) {
      drop.position.y -= 18 * dt;
      if (drop.position.y < 0) {
        drop.position.y = 15 + Math.random() * 5;
        drop.position.x = (Math.random() - 0.5) * 30;
        drop.position.z = (Math.random() - 0.5) * 30;
      }
    }
  }
  // Rainbow fade
  if (rainbowTimer > 0) {
    rainbowTimer -= dt;
    const elapsed = RAINBOW_DURATION - rainbowTimer;
    // fade in over 3s, hold, fade out over last 5s
    const opacity = elapsed < 3
      ? (elapsed / 3) * 0.85
      : Math.min(0.85, (rainbowTimer / 5) * 0.85);
    for (const arc of rainbow.children) arc.material.opacity = opacity;
    if (rainbowTimer <= 0) rainbow.visible = false;
  }
}
