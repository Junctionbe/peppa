// Collectible 5-pointed stars scattered on the map. The player drives or
// walks over them to pick them up — counter, sound, optional sparkle.

import * as THREE from 'three';
import { scene } from '../setup.js';

const stars = [];
let onCollectCb = null;

// Build a flat 5-pointed star mesh (extruded shape). Shared across all
// star instances via a single geometry / material.
function buildStarGeometry() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.32 : 0.13;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else         shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false });
}
const STAR_GEO = buildStarGeometry();
const STAR_MAT = new THREE.MeshLambertMaterial({
  color: 0xffeb3b, emissive: 0xffc107, emissiveIntensity: 0.5,
});

// Don't drop stars right on top of buildings, the lake, etc.
function isFreeSpot(x, z) {
  if (x > -19 && x < -5  && z > 28 && z < 42)   return false;  // museum
  if (x > -23 && x < -7  && z < -83 && z > -97) return false;  // house
  if (x >   4 && x < 26  && z > 86  && z < 105) return false;  // school
  if (x >  19 && x < 31  && z > 45  && z < 55)  return false;  // hotel
  const ldx = x - (-55), ldz = z - 10;
  if (ldx * ldx + ldz * ldz < 100) return false;               // lake
  return true;
}

export function spawnStars(count = 30) {
  for (let i = 0; i < count; i++) {
    let x, z, attempts = 0;
    do {
      x = (Math.random() - 0.5) * 160;
      z = -100 + Math.random() * 200;
      attempts++;
    } while (!isFreeSpot(x, z) && attempts < 30);
    const star = new THREE.Mesh(STAR_GEO, STAR_MAT);
    star.position.set(x, 0.9, z);
    star.userData.baseY = 0.9;
    star.userData.spinSpeed = 1.2 + Math.random() * 0.8;
    star.userData.bobPhase = Math.random() * Math.PI * 2;
    star.castShadow = true;
    scene.add(star);
    stars.push(star);
  }
}

export function setOnCollect(cb) { onCollectCb = cb; }

export function updateStars(dt, rigPos) {
  for (let i = stars.length - 1; i >= 0; i--) {
    const s = stars[i];
    s.rotation.z += s.userData.spinSpeed * dt;
    s.position.y = s.userData.baseY + Math.sin(performance.now() * 0.003 + s.userData.bobPhase) * 0.18;
    const dx = rigPos.x - s.position.x;
    const dz = rigPos.z - s.position.z;
    if (dx * dx + dz * dz < 1.8) {
      scene.remove(s);
      stars.splice(i, 1);
      if (onCollectCb) onCollectCb(s.position);
    }
  }
}

export function getRemainingStars() { return stars.length; }
