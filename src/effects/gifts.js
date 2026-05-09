// Surprise gift boxes that appear randomly on the map every ~25-40s.
// Driving over one grants 5 stars + confetti — a juicy little bonus.

import * as THREE from 'three';
import { scene } from '../setup.js';

const gifts = [];
let spawnTimer = 8; // first gift after 8s

function isFreeSpot(x, z) {
  if (Math.abs(x) < 4) return false;                            // road
  if (x > -19 && x < -5  && z > 28 && z < 42)   return false;   // museum
  if (x > -23 && x < -7  && z < -83 && z > -97) return false;   // house
  if (x >   4 && x < 26  && z > 86  && z < 105) return false;   // school
  if (x >  19 && x < 31  && z > 45  && z < 55)  return false;   // hotel
  const ldx = x - (-55), ldz = z - 10;
  if (ldx * ldx + ldz * ldz < 100) return false;                 // lake
  return true;
}

function makeGiftBox() {
  const g = new THREE.Group();
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.6, 0.6),
    new THREE.MeshLambertMaterial({ color: 0xe91e63 }),
  );
  box.castShadow = true;
  g.add(box);
  // Yellow ribbon (two crossing strips)
  for (const rotY of [0, Math.PI / 2]) {
    const ribbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.1, 0.62),
      new THREE.MeshLambertMaterial({ color: 0xffeb3b }),
    );
    ribbon.rotation.y = rotY;
    g.add(ribbon);
  }
  // Vertical ribbon strip
  const v = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.62, 0.62),
    new THREE.MeshLambertMaterial({ color: 0xffeb3b }),
  );
  g.add(v);
  // Bow on top (two small spheres)
  const bow1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 6),
    new THREE.MeshLambertMaterial({ color: 0xffeb3b }),
  );
  bow1.position.set(-0.1, 0.42, 0);
  g.add(bow1);
  const bow2 = bow1.clone();
  bow2.position.x = 0.1;
  g.add(bow2);
  return g;
}

let onCollectCb = null;
export function setOnCollect(cb) { onCollectCb = cb; }

function spawn() {
  let x, z, attempts = 0;
  do {
    x = (Math.random() - 0.5) * 140;
    z = -90 + Math.random() * 180;
    attempts++;
  } while (!isFreeSpot(x, z) && attempts < 20);
  const gift = makeGiftBox();
  gift.position.set(x, 0.6, z);
  gift.userData.baseY = 0.6;
  gift.userData.phase = Math.random() * Math.PI * 2;
  scene.add(gift);
  gifts.push(gift);
  return gift;
}

export function updateGifts(dt, rigPos) {
  spawnTimer -= dt;
  if (spawnTimer < 0 && gifts.length < 3) {
    spawn();
    spawnTimer = 25 + Math.random() * 15;
  }
  // animate (bob + spin) and check pickup
  for (let i = gifts.length - 1; i >= 0; i--) {
    const g = gifts[i];
    g.rotation.y += dt * 1.5;
    g.position.y = g.userData.baseY + Math.sin(performance.now() * 0.002 + g.userData.phase) * 0.18;
    const dx = rigPos.x - g.position.x;
    const dz = rigPos.z - g.position.z;
    if (dx * dx + dz * dz < 2) {
      scene.remove(g);
      gifts.splice(i, 1);
      if (onCollectCb) onCollectCb(g.position);
    }
  }
}
