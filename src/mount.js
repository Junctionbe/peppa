// Mount/dismount mechanics + helpers to query the active rig.
// The car can hold both characters (driver + passenger). The bike is single-seater.

import * as THREE from 'three';
import { scene } from './setup.js';
import { state } from './state.js';

// Local seat positions per (vehicle, character, role).
// 'alone' is used when the character is the only occupant.
const seats = {
  bike: {
    peppa: { y: 0.7,  x: 0, z: 0 },
    papa:  { y: 0.65, x: 0, z: 0 },
  },
  car: {
    peppa: {
      alone:     { x:  0,    y: 0.55, z: 0.05 },
      driver:    { x: -0.5,  y: 0.55, z: 0.05 },
      passenger: { x:  0.5,  y: 0.55, z: 0.05 },
    },
    papa: {
      alone:     { x:  0,    y: 0.50, z: 0.05 },
      driver:    { x: -0.5,  y: 0.50, z: 0.05 },
      passenger: { x:  0.5,  y: 0.50, z: 0.05 },
    },
  },
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

// Re-position a single character within their current vehicle, picking the
// right seat (alone / driver / passenger) based on who else is in there.
function placeInSeat(charName) {
  const v = state.mounts[charName];
  if (!v) return;
  const ch = charName === 'peppa' ? state.peppa : state.papa;
  if (v === state.bike) {
    const cfg = seats.bike[charName];
    ch.position.set(cfg.x, cfg.y, cfg.z);
    ch.rotation.set(0, 0, 0);
    return;
  }
  // Car: depends on whether the other char is in here too
  const other = charName === 'peppa' ? 'papa' : 'peppa';
  const otherSame = state.mounts[other] === v;
  let role;
  if (!otherSame)                          role = 'alone';
  else if (charName === state.currentChar) role = 'driver';
  else                                     role = 'passenger';
  const cfg = seats.car[charName][role];
  ch.position.set(cfg.x, cfg.y, cfg.z);
  ch.rotation.set(0, 0, 0);
}

// Re-position both characters across their vehicles (used after a swap).
export function refreshAllSeats() {
  if (state.mounts.peppa) placeInSeat('peppa');
  if (state.mounts.papa)  placeInSeat('papa');
}

export function mount(charName, vehicle) {
  const ch = charName === 'peppa' ? state.peppa : state.papa;
  if (ch.parent) ch.parent.remove(ch);
  vehicle.add(ch);
  state.mounts[charName] = vehicle;
  // Re-seat both occupants (a join may bump the existing one to passenger)
  placeInSeat(charName);
  const other = charName === 'peppa' ? 'papa' : 'peppa';
  if (state.mounts[other] === vehicle) placeInSeat(other);
}

export function dismount(charName) {
  const ch = charName === 'peppa' ? state.peppa : state.papa;
  const v  = state.mounts[charName];
  if (!v) return;
  const wp = new THREE.Vector3();
  ch.getWorldPosition(wp);
  v.remove(ch);
  scene.add(ch);
  const sideX =  Math.cos(v.rotation.y) * 1.6;
  const sideZ = -Math.sin(v.rotation.y) * 1.6;
  ch.position.set(wp.x + sideX, 0, wp.z + sideZ);
  ch.rotation.set(0, v.rotation.y, 0);
  state.mounts[charName] = null;
  // The remaining occupant (if any) becomes alone — recenter them
  const other = charName === 'peppa' ? 'papa' : 'peppa';
  if (state.mounts[other] === v) placeInSeat(other);
}

// Try to mount the closest mountable vehicle within range. Returns the
// vehicle mounted (or null). Bike is skipped if occupied by the other char;
// car can always be joined as passenger.
export function tryMountNearby() {
  const ch = activeChar();
  const other = state.currentChar === 'peppa' ? 'papa' : 'peppa';
  let nearest = null, nearestD = 4;
  for (const v of [state.bike, state.car]) {
    if (state.mounts[state.currentChar] === v) continue;        // already here
    if (v === state.bike && state.mounts[other] === v) continue; // bike taken
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
