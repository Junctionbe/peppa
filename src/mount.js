// Mount/dismount mechanics + helpers to query the active rig.

import * as THREE from 'three';
import { scene } from './setup.js';
import { state } from './state.js';

// Local seat positions for each (vehicle, character) pair.
const seats = {
  bike: { peppa: { y: 0.7,  z: 0    }, papa: { y: 0.65, z: 0    } },
  car:  { peppa: { y: 0.55, z: 0.05 }, papa: { y: 0.50, z: 0.05 } },
};

export function activeChar() {
  return state.currentChar === 'peppa' ? state.peppa : state.papa;
}

export function activeRig() {
  return state.mounts[state.currentChar] || activeChar();
}

export function activeMode() {
  const v = state.mounts[state.currentChar];
  if (v === state.bike) return 'bike';
  if (v === state.car)  return 'car';
  return 'foot';
}

export function mount(charName, vehicle) {
  const ch = charName === 'peppa' ? state.peppa : state.papa;
  if (ch.parent) ch.parent.remove(ch);
  vehicle.add(ch);
  const vt  = vehicle === state.bike ? 'bike' : 'car';
  const cfg = seats[vt][charName];
  ch.position.set(0, cfg.y, cfg.z);
  ch.rotation.set(0, 0, 0);
  state.mounts[charName] = vehicle;
}

export function dismount(charName) {
  const ch = charName === 'peppa' ? state.peppa : state.papa;
  const v  = state.mounts[charName];
  if (!v) return;
  const wp = new THREE.Vector3();
  ch.getWorldPosition(wp);
  v.remove(ch);
  scene.add(ch);
  // step out to the side of the vehicle
  const sideX =  Math.cos(v.rotation.y) * 1.6;
  const sideZ = -Math.sin(v.rotation.y) * 1.6;
  ch.position.set(wp.x + sideX, 0, wp.z + sideZ);
  ch.rotation.set(0, v.rotation.y, 0);
  state.mounts[charName] = null;
}

// Try to mount the closest free vehicle within range. Returns the vehicle
// mounted (or null).
export function tryMountNearby() {
  const ch = activeChar();
  let nearest = null, nearestD = 4;
  for (const v of [state.bike, state.car]) {
    if (state.mounts.peppa === v || state.mounts.papa === v) continue;
    const dx = v.position.x - ch.position.x;
    const dz = v.position.z - ch.position.z;
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d < nearestD) { nearestD = d; nearest = v; }
  }
  if (nearest) {
    mount(state.currentChar, nearest);
    return nearest;
  }
  return null;
}
