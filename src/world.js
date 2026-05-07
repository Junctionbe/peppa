// Static environment: ground, road, hills, sun, clouds, trees, flowers,
// puddles, outdoor friends. Adds itself to the scene as a side-effect on import.

import * as THREE from 'three';
import {
  scene, matGrass, matRoad, matBrown, matLeaf, matCloud, matMud,
} from './setup.js';
import { createSheep } from './actors/friends.js';

// ---- Ground & road ----
const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), matGrass);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const road = new THREE.Mesh(new THREE.PlaneGeometry(7, 200), matRoad);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.02;
road.receiveShadow = true;
scene.add(road);

const dashMat = new THREE.MeshLambertMaterial({ color: 0xfffacd });
for (let z = -90; z <= 90; z += 5) {
  const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.5), dashMat);
  dash.rotation.x = -Math.PI / 2;
  dash.position.set(0, 0.04, z);
  scene.add(dash);
}

// path branching off toward the museum (west side)
const museumPath = new THREE.Mesh(new THREE.PlaneGeometry(3, 22), matRoad);
museumPath.rotation.x = -Math.PI / 2;
museumPath.rotation.z = Math.PI / 2;
museumPath.position.set(-7, 0.02, 28);
museumPath.receiveShadow = true;
scene.add(museumPath);

// path branching off toward the hotel (east side)
const hotelPath = new THREE.Mesh(new THREE.PlaneGeometry(3, 22), matRoad);
hotelPath.rotation.x = -Math.PI / 2;
hotelPath.rotation.z = Math.PI / 2;
hotelPath.position.set(12, 0.02, 50);
hotelPath.receiveShadow = true;
scene.add(hotelPath);

// ---- Hills ----
function addHill(x, z, scale, color) {
  const hill = new THREE.Mesh(
    new THREE.SphereGeometry(scale, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshLambertMaterial({ color }),
  );
  hill.position.set(x, 0, z);
  hill.receiveShadow = true;
  scene.add(hill);
}
addHill(-80, -150, 30, 0x5cb036);
addHill( 60, -180, 40, 0x4fa030);
addHill(-130, 100, 35, 0x5cb036);
addHill( 120,  60, 28, 0x66bf42);

// ---- Sun visual ----
const sunVisual = new THREE.Mesh(
  new THREE.SphereGeometry(6, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffeb3b }),
);
sunVisual.position.set(60, 80, -100);
scene.add(sunVisual);

// ---- Clouds ----
export const clouds = [];
function addCloud(x, y, z) {
  const c = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(2 + Math.random() * 1.5, 10, 8), matCloud);
    puff.position.set((i - 1.5) * 1.6 + Math.random() * 0.5, Math.random() * 0.4, Math.random() * 0.5);
    c.add(puff);
  }
  c.position.set(x, y, z); scene.add(c); clouds.push(c);
}
for (let i = 0; i < 9; i++) {
  addCloud(-120 + Math.random() * 240, 28 + Math.random() * 14, -120 + Math.random() * 240);
}

// ---- Trees ----
function createTree() {
  const t = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 1.6, 8), matBrown);
  trunk.position.y = 0.8; trunk.castShadow = true; t.add(trunk);
  const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 10), matLeaf);
  leaves.position.y = 2.5; leaves.castShadow = true; t.add(leaves);
  return t;
}
function isTreeSpotFree(x, z) {
  if (Math.abs(x) < 5) return false;                              // road
  if (x > -19 && x < -5  && z > 28 && z < 42) return false;       // museum
  if (x > -19 && x < -10 && Math.abs(z - 28) < 3) return false;   // museum path
  if (x > -23 && x < -7  && z < -83 && z > -97) return false;     // house
  if (x >   4 && x < 26  && z > 86  && z < 105) return false;     // school
  if (x >  19 && x < 31  && z > 45 && z < 55)   return false;     // hotel
  if (x >   3 && x < 23  && Math.abs(z - 50) < 3) return false;   // hotel path
  if (x >   6 && x < 14  && z > -25 && z < -15) return false;     // food truck
  return true;
}
let placed = 0;
while (placed < 65) {
  const side = Math.random() < 0.5 ? -1 : 1;
  const x = side * (8 + Math.random() * 80);
  const z = -110 + Math.random() * 220;
  if (!isTreeSpotFree(x, z)) continue;
  const tree = createTree();
  tree.position.set(x, 0, z);
  tree.scale.setScalar(0.8 + Math.random() * 0.7);
  tree.rotation.y = Math.random() * Math.PI * 2;
  scene.add(tree);
  placed++;
}

// ---- Flowers ----
const flowerColors = [0xff5252, 0xffeb3b, 0xe040fb, 0xff80ab, 0xffffff, 0xffa726];
for (let i = 0; i < 230; i++) {
  const flower = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 6, 5),
    new THREE.MeshLambertMaterial({ color: flowerColors[Math.floor(Math.random() * flowerColors.length)] }),
  );
  const side = Math.random() < 0.5 ? -1 : 1;
  flower.position.set(side * (5 + Math.random() * 70), 0.16, -100 + Math.random() * 200);
  scene.add(flower);
}

// ---- Puddles ----
export const puddles = [];
function addPuddle(x, z, size) {
  const p = new THREE.Mesh(new THREE.CircleGeometry(size, 16), matMud);
  p.rotation.x = -Math.PI / 2;
  p.position.set(x, 0.03, z);
  scene.add(p);
  puddles.push({ x, z, size });
}
addPuddle( 2.0, -40, 1.6);
addPuddle(-2.5, -10, 1.2);
addPuddle( 3.0,  15, 1.8);
addPuddle(-2.5,  55, 1.4);
addPuddle( 0.0,  78, 1.5);

// ---- Outdoor friends. Indoor characters are added by the building factories. ----
export const npcs = [];
const outdoorSheep = createSheep(0x4fc3f7); // sheep with blue bow grazing in field
outdoorSheep.position.set(11, 0, -8);
scene.add(outdoorSheep);
npcs.push(outdoorSheep);
