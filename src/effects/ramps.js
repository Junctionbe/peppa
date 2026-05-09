// Orange tilted ramps. Driving (or walking) over one launches the rig in
// the air via state.jumpVel — combined with a boost pad nearby this gives
// a satisfying "flying" sensation.

import * as THREE from 'three';
import { scene } from '../setup.js';
import { state } from '../state.js';
import * as audio from '../audio.js';

const ramps = [];

function makeRamp(x, z, rotY = 0) {
  const g = new THREE.Group();
  // Tilted slab (the visible "ramp")
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.1, 2.6),
    new THREE.MeshLambertMaterial({ color: 0xff5722 }),
  );
  slab.position.y = 0.45;
  slab.rotation.x = -0.45;
  slab.castShadow = true;
  g.add(slab);
  // Side support (triangle-ish via rotated box)
  const sup = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.85, 2.6),
    new THREE.MeshLambertMaterial({ color: 0xc62828 }),
  );
  for (const sx of [-1.05, 1.05]) {
    const c = sup.clone();
    c.position.set(sx, 0.3, -0.55);
    c.scale.z = 0.8;
    g.add(c);
  }
  // White stripes on top
  for (let i = 0; i < 3; i++) {
    const stripe = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.18),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    stripe.rotation.x = -Math.PI / 2 - 0.45;
    stripe.position.set(0, 0.51 - i * 0.08, -0.7 + i * 0.7);
    g.add(stripe);
  }
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  ramps.push(g);
  scene.add(g);
}

export function spawnRamps() {
  makeRamp(0, -25);
  makeRamp(0,  35);
  makeRamp(0,  80);
}

let lastTriggered = -1;
export function updateRamps(dt, rigPos) {
  for (let i = 0; i < ramps.length; i++) {
    const r = ramps[i];
    const dx = rigPos.x - r.position.x;
    const dz = rigPos.z - r.position.z;
    if (dx * dx + dz * dz < 2.5) {
      // Avoid retriggering the same ramp every frame while we sit on it
      if (i === lastTriggered) return;
      lastTriggered = i;
      if (state.jumpY < 0.05 && Math.abs(state.speed) > 1) {
        state.jumpVel = 5 + Math.abs(state.speed) * 0.5;
        audio.playJump();
      }
      return;
    }
  }
  // moved off all ramps
  if (state.jumpY < 0.05) lastTriggered = -1;
}
