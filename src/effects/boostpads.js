// Yellow glowing pads laid on the road. Driving over one fills a temporary
// boost (state.boostTimer) that the throttle code multiplies into.

import * as THREE from 'three';
import { scene } from '../setup.js';
import { state } from '../state.js';

const pads = [];

function makePad(x, z, rotY = 0) {
  const g = new THREE.Group();
  // glowing yellow base
  const base = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 1.4),
    new THREE.MeshBasicMaterial({ color: 0xffeb3b, transparent: true, opacity: 0.85 }),
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = 0.06;
  g.add(base);
  // chevron arrows on top (white)
  for (let i = 0; i < 3; i++) {
    const arrow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.3),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }),
    );
    arrow.rotation.x = -Math.PI / 2;
    arrow.position.set(0, 0.07, -0.4 + i * 0.4);
    g.add(arrow);
  }
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  g.userData.basePad = base;
  pads.push(g);
  scene.add(g);
}

// Place a few pads along the road and on the side paths.
export function spawnBoostPads() {
  // Main road, going north
  makePad(0, -55);
  makePad(0,  10);
  makePad(0,  65);
  // Hotel branch (going east)
  makePad(15, 50, Math.PI / 2);
}

export function updateBoostPads(dt, rigPos) {
  // Pulse all pads
  for (const p of pads) {
    const t = Math.sin(performance.now() * 0.005 + p.position.x);
    p.userData.basePad.material.opacity = 0.7 + t * 0.25;
  }
  // Trigger boost on overlap
  for (const p of pads) {
    const dx = rigPos.x - p.position.x;
    const dz = rigPos.z - p.position.z;
    if (dx * dx + dz * dz < 1.6) {
      if (state.boostTimer < 1.5) state.boostTimer = 2.0;
      return true;
    }
  }
  return false;
}
