// Static environment: ground, road, hills, sun, clouds, trees, flowers,
// puddles, outdoor friends. Adds itself to the scene as a side-effect on import.

import * as THREE from 'three';
import {
  scene, matGrass, matRoad, matBrown, matLeaf, matCloud, matMud, matBlack,
  matWhite, matYellow, makeTextSign,
} from './setup.js';
import { createSheep, createGrannyPig, createGrandpaPig } from './actors/friends.js';
import { colliders } from './physics.js';

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
  if (x > -10 && x < 0   && z > 73 && z < 78)   return false;     // ice cream stand
  // big circle around the lake center (-55, 10) radius ~10
  const ldx = x - (-55), ldz = z - 10;
  if (ldx * ldx + ldz * ldz < 100) return false;                   // lake
  if (x > -32 && x < -22 && z < -72 && z > -82) return false;     // garden
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
outdoorSheep.position.set(-8, 0, -45);
scene.add(outdoorSheep);
npcs.push(outdoorSheep);

// ---- Hot air balloon drifting in the sky ----
function createBalloon(color) {
  const b = new THREE.Group();
  const balloon = new THREE.Mesh(
    new THREE.SphereGeometry(2, 16, 12),
    new THREE.MeshLambertMaterial({ color }),
  );
  balloon.position.y = 4;
  balloon.scale.y = 1.15;
  balloon.castShadow = true;
  b.add(balloon);
  // alternating stripe (a torus around middle)
  const stripe = new THREE.Mesh(
    new THREE.TorusGeometry(2.0, 0.18, 6, 24),
    new THREE.MeshLambertMaterial({ color: 0xffeb3b }),
  );
  stripe.position.y = 4;
  stripe.rotation.x = Math.PI / 2;
  b.add(stripe);
  // basket
  const basket = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.8, 1),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
  );
  basket.position.y = 1.2;
  basket.castShadow = true;
  b.add(basket);
  // 4 ropes
  for (const [sx, sz] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) {
    const rope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.7, 4),
      matBlack,
    );
    rope.position.set(sx, 2.4, sz);
    b.add(rope);
  }
  return b;
}
export const balloon = createBalloon(0xe53935);
balloon.position.set(-80, 28, 40);
scene.add(balloon);

// ---- Direction signposts ----
function makeArrowSign(text, color, direction) {
  const canvas = document.createElement('canvas');
  canvas.width = 320; canvas.height = 70;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff8e1'; ctx.fillRect(0, 0, 320, 70);
  ctx.strokeStyle = color; ctx.lineWidth = 5;
  ctx.strokeRect(5, 5, 310, 60);
  ctx.fillStyle = color;
  ctx.font = 'bold 32px "Comic Sans MS", cursive';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const a = direction === 'left'  ? '◄'
          : direction === 'right' ? '►'
          : direction === 'up'    ? '▲'
          : '▼';
  const display = (direction === 'left' || direction === 'down')
    ? `${a}  ${text}` : `${text}  ${a}`;
  ctx.fillText(display, 160, 40);
  const tex = new THREE.CanvasTexture(canvas);
  return new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.55),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true }),
  );
}

function createSignpost(planks) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 3.6, 8), matBrown,
  );
  pole.position.y = 1.8; pole.castShadow = true;
  g.add(pole);
  planks.forEach((p, i) => {
    const sign = makeArrowSign(p.text, p.color, p.direction);
    sign.position.y = 3 - i * 0.65;
    g.add(sign);
  });
  return g;
}

// Sign 1: early road, pointing back to house and forward to other places
const sp1 = createSignpost([
  { text: 'École & Hôtel', color: '#1976d2', direction: 'up' },
  { text: 'Maison',        color: '#c62828', direction: 'down' },
]);
sp1.position.set(3.5, 0, -55);
sp1.rotation.y = -Math.PI / 2; // face the road
scene.add(sp1);

// Sign 2: at the museum branch (west side)
const sp2 = createSignpost([
  { text: 'Musée', color: '#6d4c41', direction: 'left' },
  { text: 'Pizza', color: '#e53935', direction: 'down' },
]);
sp2.position.set(-3.5, 0, 22);
sp2.rotation.y = Math.PI / 2;
scene.add(sp2);

// Sign 3: at the hotel branch (east side)
const sp3 = createSignpost([
  { text: 'Hôtel', color: '#1a237e', direction: 'right' },
  { text: 'École', color: '#c62828', direction: 'up' },
]);
sp3.position.set(3.5, 0, 45);
sp3.rotation.y = -Math.PI / 2;
scene.add(sp3);

// ---- Lake (south-west) with Grandpa Pig in his boat ----
const LAKE_X = -55, LAKE_Z = 10, LAKE_R = 8;
const lake = new THREE.Mesh(
  new THREE.CircleGeometry(LAKE_R, 32),
  new THREE.MeshLambertMaterial({ color: 0x29b6f6, transparent: true, opacity: 0.9 }),
);
lake.rotation.x = -Math.PI / 2;
lake.position.set(LAKE_X, 0.04, LAKE_Z);
lake.receiveShadow = true;
scene.add(lake);

// Lake collider — block the player from entering the water (for vehicles).
// Approximate the circle with an inscribed square + 4 outer chunks. Simple
// AABB inside the circle.
colliders.push({
  minX: LAKE_X - LAKE_R * 0.7, maxX: LAKE_X + LAKE_R * 0.7,
  minZ: LAKE_Z - LAKE_R * 0.7, maxZ: LAKE_Z + LAKE_R * 0.7,
});

// Decorative cattails at lake edge
for (let i = 0; i < 8; i++) {
  const ang = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
  const r = LAKE_R + 0.3 + Math.random() * 0.4;
  const stalk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6),
    new THREE.MeshLambertMaterial({ color: 0x66bb6a }),
  );
  stalk.position.set(LAKE_X + Math.cos(ang) * r, 0.6, LAKE_Z + Math.sin(ang) * r);
  scene.add(stalk);
  const tip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
  );
  tip.position.copy(stalk.position);
  tip.position.y = 1.2;
  scene.add(tip);
}

// Lake sign
const lakeSign = makeTextSign('LAC', 1.8, 0.6, '#fff', '#1976d2');
lakeSign.position.set(LAKE_X + LAKE_R + 1.2, 1.6, LAKE_Z + 4);
lakeSign.rotation.y = Math.PI / 4;
scene.add(lakeSign);
const lakePost = new THREE.Mesh(
  new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), matBrown,
);
lakePost.position.set(LAKE_X + LAKE_R + 1.2, 0.8, LAKE_Z + 4);
scene.add(lakePost);

// Boat factory
function createBoat() {
  const b = new THREE.Group();
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.7, 1.4),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
  );
  hull.position.y = 0.35; hull.castShadow = true; b.add(hull);
  // tapered bow + stern (front and back wedges)
  const bow = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 0.7, 4),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
  );
  bow.position.set(1.7, 0.35, 0);
  bow.rotation.set(0, Math.PI / 4, Math.PI / 2);
  bow.scale.set(1, 1, 0.5);
  b.add(bow);
  // dark interior strip on top
  const inside = new THREE.Mesh(
    new THREE.BoxGeometry(2.7, 0.3, 1.1),
    new THREE.MeshLambertMaterial({ color: 0x4e342e }),
  );
  inside.position.y = 0.55; b.add(inside);
  // mast
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
  );
  mast.position.set(0, 1.7, 0); mast.castShadow = true;
  b.add(mast);
  // triangular sail
  const sailGeo = new THREE.BufferGeometry();
  const verts = new Float32Array([
    0.05, 0.7, 0,
    0.05, 2.7, 0,
    1.6, 0.8, 0,
  ]);
  sailGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  sailGeo.setIndex([0, 1, 2]);
  sailGeo.computeVertexNormals();
  const sail = new THREE.Mesh(
    sailGeo,
    new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
  );
  b.add(sail);
  return b;
}
const boat = createBoat();
boat.position.set(LAKE_X, 0.5, LAKE_Z);
boat.rotation.y = 0.3;
scene.add(boat);

// Grandpa Pig in his boat
const grandpaInBoat = createGrandpaPig();
grandpaInBoat.position.set(LAKE_X - 0.8, 1.2, LAKE_Z);
grandpaInBoat.rotation.y = -Math.PI / 2;
scene.add(grandpaInBoat);
npcs.push(grandpaInBoat);
grandpaInBoat.userData.label = '👴 Grandpa Pig : « Belle journée pour naviguer ! »';
grandpaInBoat.userData.zoneRadius = 8;

// ---- Garden with bench, Granny Pig (west of the house) ----
function createBench() {
  const g = new THREE.Group();
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.1, 0.5),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
  );
  seat.position.y = 0.5; seat.castShadow = true; g.add(seat);
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.7, 0.1),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
  );
  back.position.set(0, 0.85, -0.2); back.castShadow = true; g.add(back);
  for (const sx of [-1.05, 1.05]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.5, 0.5),
      new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
    );
    leg.position.set(sx, 0.25, 0); leg.castShadow = true; g.add(leg);
  }
  return g;
}

const GARDEN_X = -27, GARDEN_Z = -77;
const bench = createBench();
bench.position.set(GARDEN_X, 0, GARDEN_Z);
bench.rotation.y = Math.PI;
scene.add(bench);

// Extra dense flowers around the bench
for (let i = 0; i < 18; i++) {
  const ang = Math.random() * Math.PI * 2;
  const r = 1.8 + Math.random() * 2.5;
  const flower = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 6, 5),
    new THREE.MeshLambertMaterial({ color: flowerColors[Math.floor(Math.random() * flowerColors.length)] }),
  );
  flower.position.set(GARDEN_X + Math.cos(ang) * r, 0.2, GARDEN_Z + Math.sin(ang) * r);
  scene.add(flower);
}

// Granny Pig standing in front of bench
const granny = createGrannyPig();
granny.position.set(GARDEN_X + 0.8, 0, GARDEN_Z + 0.6);
granny.rotation.y = -0.3;
scene.add(granny);
npcs.push(granny);
granny.userData.label = '👵 Granny Pig : « Tu veux un petit gâteau ma chérie ? »';
granny.userData.zoneRadius = 3;
