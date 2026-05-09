// Static environment: ground, road, hills, sun, clouds, trees, flowers,
// puddles, outdoor friends. Adds itself to the scene as a side-effect on import.

import * as THREE from 'three';
import {
  scene, matGrass, matRoad, matBrown, matLeaf, matCloud, matMud, matBlack,
  matWhite, matYellow, makeTextSign,
} from './setup.js';
import { createSheep, createGrannyPig, createGrandpaPig } from './actors/friends.js';
import { createDuck } from './actors/duck.js';
import { createSchoolBus } from './actors/schoolbus.js';
import { createMrBull, createConstructionSite } from './actors/mrbull.js';
import { createSnowman } from './actors/snowman.js';
import { setSnowman } from './seasons.js';
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

// ---- Sun visual (animated by day/night cycle in main.js) ----
export const sunVisual = new THREE.Mesh(
  new THREE.SphereGeometry(6, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffeb3b }),
);
sunVisual.position.set(60, 80, -100);
scene.add(sunVisual);

// Moon (visible at night)
export const moonVisual = new THREE.Mesh(
  new THREE.SphereGeometry(4, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xeeeeee }),
);
moonVisual.position.set(-60, 80, 100);
moonVisual.visible = false;
scene.add(moonVisual);

// Stars (a sphere of small white dots, visible only at night)
export const stars = new THREE.Group();
const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
for (let i = 0; i < 80; i++) {
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.4, 4, 4), starMat);
  // place on hemisphere above
  const a = Math.random() * Math.PI * 2;
  const b = Math.random() * Math.PI / 2;
  const r = 200;
  s.position.set(Math.cos(a) * Math.cos(b) * r, Math.sin(b) * r * 0.6 + 30, Math.sin(a) * Math.cos(b) * r);
  stars.add(s);
}
stars.visible = false;
scene.add(stars);

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

// ---- Trees (InstancedMesh: 1 draw call per part instead of 65 groups) ----
const trunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 1.6, 8);
const leafGeo  = new THREE.SphereGeometry(1.4, 12, 10);
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
  const ldx = x - (-55), ldz = z - 10;
  if (ldx * ldx + ldz * ldz < 100) return false;                   // lake
  if (x > -32 && x < -22 && z < -72 && z > -82) return false;     // garden
  const trdx = x - 60, trdz = z;
  const trd = Math.sqrt(trdx * trdx + trdz * trdz);
  if (trd > 19 && trd < 25) return false;                          // train track
  if (x > -34 && x < -25 && z > 86 && z < 95) return false;       // birthday party
  if (x > -45 && x < -32 && z > -62 && z < -48) return false;     // construction site
  if (x > -25 && x < -18 && z > -86 && z < -78) return false;     // snowman area
  return true;
}
const TREE_COUNT = 65;
const trunkInstances = new THREE.InstancedMesh(trunkGeo, matBrown, TREE_COUNT);
const leafInstances  = new THREE.InstancedMesh(leafGeo,  matLeaf,  TREE_COUNT);
trunkInstances.castShadow = true;
leafInstances.castShadow  = true;
scene.add(trunkInstances);
scene.add(leafInstances);

const _treePos  = new THREE.Vector3();
const _treeQuat = new THREE.Quaternion();
const _treeScl  = new THREE.Vector3();
const _treeMat  = new THREE.Matrix4();
const _yAxis    = new THREE.Vector3(0, 1, 0);
let placed = 0, attempts = 0;
while (placed < TREE_COUNT && attempts < TREE_COUNT * 30) {
  attempts++;
  const side = Math.random() < 0.5 ? -1 : 1;
  const x = side * (8 + Math.random() * 80);
  const z = -110 + Math.random() * 220;
  if (!isTreeSpotFree(x, z)) continue;
  const sc = 0.8 + Math.random() * 0.7;
  _treeQuat.setFromAxisAngle(_yAxis, Math.random() * Math.PI * 2);
  _treeScl.set(sc, sc, sc);
  _treePos.set(x, 0.8 * sc, z);
  _treeMat.compose(_treePos, _treeQuat, _treeScl);
  trunkInstances.setMatrixAt(placed, _treeMat);
  _treePos.set(x, 2.5 * sc, z);
  _treeMat.compose(_treePos, _treeQuat, _treeScl);
  leafInstances.setMatrixAt(placed, _treeMat);
  placed++;
}
trunkInstances.instanceMatrix.needsUpdate = true;
leafInstances.instanceMatrix.needsUpdate  = true;

// ---- Flowers (InstancedMesh per color: 6 draw calls instead of 240) ----
const flowerColors = [0xff5252, 0xffeb3b, 0xe040fb, 0xff80ab, 0xffffff, 0xffa726];
const flowerGeo = new THREE.SphereGeometry(0.16, 6, 5);
const FLOWERS_PER_COLOR = 40;
const _flowerMat = new THREE.Matrix4();
for (const color of flowerColors) {
  const mat = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.InstancedMesh(flowerGeo, mat, FLOWERS_PER_COLOR);
  for (let i = 0; i < FLOWERS_PER_COLOR; i++) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * (5 + Math.random() * 70);
    const z = -100 + Math.random() * 200;
    _flowerMat.makeTranslation(x, 0.16, z);
    mesh.setMatrixAt(i, _flowerMat);
  }
  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);
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

// ---- Train on a circular track (far east) ----
const TRACK_CX = 60, TRACK_CZ = 0, TRACK_R = 22;
const railMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
const tieMat = new THREE.MeshLambertMaterial({ color: 0x6d4c41 });
function addRail(radius) {
  const r = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.06, 6, 60),
    railMat,
  );
  r.rotation.x = Math.PI / 2;
  r.position.set(TRACK_CX, 0.1, TRACK_CZ);
  scene.add(r);
}
addRail(TRACK_R + 0.4);
addRail(TRACK_R - 0.4);
// wooden ties across rails
for (let i = 0; i < 32; i++) {
  const ang = (i / 32) * Math.PI * 2;
  const tie = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.08, 0.3),
    tieMat,
  );
  tie.position.set(
    TRACK_CX + Math.cos(ang) * TRACK_R,
    0.06,
    TRACK_CZ + Math.sin(ang) * TRACK_R,
  );
  tie.rotation.y = -ang;
  scene.add(tie);
}

function createTrain() {
  const t = new THREE.Group();
  // locomotive body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.0, 2.5),
    new THREE.MeshLambertMaterial({ color: 0xc62828 }),
  );
  body.position.y = 0.75; body.castShadow = true; t.add(body);
  // cabin (back)
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.7, 1),
    new THREE.MeshLambertMaterial({ color: 0xb71c1c }),
  );
  cabin.position.set(0, 1.6, -0.7); cabin.castShadow = true; t.add(cabin);
  // cabin window
  const win = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.4, 0.05),
    new THREE.MeshLambertMaterial({ color: 0xb3e5fc }),
  );
  win.position.set(0, 1.7, -0.2); t.add(win);
  // chimney (front)
  const chimney = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 0.5, 8), matBlack,
  );
  chimney.position.set(0, 1.5, 0.8); t.add(chimney);
  // top of chimney (wider rim)
  const chimneyTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.18, 0.1, 8), matBlack,
  );
  chimneyTop.position.set(0, 1.78, 0.8); t.add(chimneyTop);
  // 4 wheels
  for (const [x, z] of [[-0.55, 0.7], [0.55, 0.7], [-0.55, -0.7], [0.55, -0.7]]) {
    const w = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.16, 12), matBlack,
    );
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.25, z); t.add(w);
  }
  // headlight
  const headlight = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xfff59d }),
  );
  headlight.position.set(0, 0.75, 1.27);
  t.add(headlight);
  // wagon (yellow) attached behind
  const wagon = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.7, 1.8),
    new THREE.MeshLambertMaterial({ color: 0xfbc02d }),
  );
  wagon.position.set(0, 0.6, -2.5); wagon.castShadow = true; t.add(wagon);
  // wagon back
  const wagonBack = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.4, 0.1),
    new THREE.MeshLambertMaterial({ color: 0xb71c1c }),
  );
  wagonBack.position.set(0, 1.0, -3.4); t.add(wagonBack);
  for (const [x, z] of [[-0.45, -1.9], [0.45, -1.9], [-0.45, -3.1], [0.45, -3.1]]) {
    const w = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.14, 10), matBlack,
    );
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.22, z); t.add(w);
  }
  // smoke puffs (will animate)
  const smoke = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 8, 6),
    new THREE.MeshLambertMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.7 }),
  );
  smoke.position.set(0, 2.2, 0.8);
  t.add(smoke);
  t.userData.smoke = smoke;
  return t;
}
export const train = createTrain();
train.userData.angle = 0;
train.userData.radius = TRACK_R;
train.userData.center = { x: TRACK_CX, z: TRACK_CZ };
scene.add(train);

// ---- Birthday party (cake on table + floating balloons) ----
const PARTY_X = -29, PARTY_Z = 88;
function createParty() {
  const p = new THREE.Group();
  // table
  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 0.85, 1, 16),
    new THREE.MeshLambertMaterial({ color: 0xa1887f }),
  );
  table.position.y = 0.5; table.castShadow = true; p.add(table);
  // tablecloth (slightly larger flat disc on top)
  const cloth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.05, 0.04, 16),
    new THREE.MeshLambertMaterial({ color: 0xff80ab }),
  );
  cloth.position.y = 1.02; p.add(cloth);
  // cake — three layers
  const layer1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.35, 16),
    new THREE.MeshLambertMaterial({ color: 0xfff5d0 }),
  );
  layer1.position.y = 1.22; p.add(layer1);
  const layer2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.25, 16),
    new THREE.MeshLambertMaterial({ color: 0xff80ab }),
  );
  layer2.position.y = 1.52; p.add(layer2);
  const layer3 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.18, 16),
    new THREE.MeshLambertMaterial({ color: 0xfff5d0 }),
  );
  layer3.position.y = 1.74; p.add(layer3);
  // candles (5)
  const flames = [];
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.18, 6),
      new THREE.MeshLambertMaterial({ color: 0xfff59d }),
    );
    candle.position.set(Math.cos(ang) * 0.13, 1.92, Math.sin(ang) * 0.13);
    p.add(candle);
    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 5),
      new THREE.MeshBasicMaterial({ color: 0xff5722 }),
    );
    flame.position.set(Math.cos(ang) * 0.13, 2.05, Math.sin(ang) * 0.13);
    p.add(flame);
    flames.push(flame);
  }
  p.userData.flames = flames;
  // balloons floating around
  const balloonColors = [0xff5252, 0xffeb3b, 0x4fc3f7, 0xab47bc, 0x66bb6a, 0xff9800];
  const balloons = [];
  for (let i = 0; i < 6; i++) {
    const balloon = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 12, 10),
      new THREE.MeshLambertMaterial({ color: balloonColors[i] }),
    );
    const ang = (i / 6) * Math.PI * 2;
    const r = 1.6 + Math.random() * 0.5;
    const baseY = 2.4 + Math.random() * 1.2;
    balloon.position.set(Math.cos(ang) * r, baseY, Math.sin(ang) * r);
    balloon.userData.baseY = baseY;
    balloon.userData.phase = Math.random() * Math.PI * 2;
    p.add(balloon);
    balloons.push(balloon);
    // string
    const string = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 1.4, 4), matBlack,
    );
    string.position.set(balloon.position.x, baseY - 0.85, balloon.position.z);
    p.add(string);
    balloon.userData.string = string;
  }
  p.userData.balloons = balloons;
  return p;
}
export const party = createParty();
party.position.set(PARTY_X, 0, PARTY_Z);
scene.add(party);

// Party label zone
const partyZone = new THREE.Object3D();
partyZone.position.set(PARTY_X, 0, PARTY_Z);
partyZone.userData.label = '🎂 Joyeux anniversaire ! 🎉';
partyZone.userData.zoneRadius = 4;
scene.add(partyZone);
npcs.push(partyZone);  // reuse npcs array for outdoor labels (no lookAt issue, it's an Object3D)

// ---- Ducks circling on the lake ----
export const ducks = [];
for (let i = 0; i < 3; i++) {
  const duck = createDuck();
  duck.userData.angle = (i / 3) * Math.PI * 2;
  duck.userData.radius = 3.5 + i * 0.7;
  duck.userData.speed = 0.35 + Math.random() * 0.2;
  duck.position.set(
    LAKE_X + Math.cos(duck.userData.angle) * duck.userData.radius,
    0.4,
    LAKE_Z + Math.sin(duck.userData.angle) * duck.userData.radius,
  );
  scene.add(duck);
  ducks.push(duck);
}

// ---- School bus driving back-and-forth on the road ----
export const schoolBus = createSchoolBus();
schoolBus.position.set(3, 0, -55);
schoolBus.rotation.y = 0;
schoolBus.userData.dir = 1; // 1 = north, -1 = south
scene.add(schoolBus);

// ---- Mr Bull at his construction site (west of road, mid-south) ----
const SITE_X = -38, SITE_Z = -55;
const site = createConstructionSite();
site.position.set(SITE_X, 0, SITE_Z);
scene.add(site);
const mrBull = createMrBull();
mrBull.position.set(SITE_X + 1, 0, SITE_Z - 1);
mrBull.rotation.y = -0.5;
mrBull.userData.label = '🐂 Mr Bull : « Y\'a du boulot par ici, hein ! »';
mrBull.userData.zoneRadius = 4;
scene.add(mrBull);
npcs.push(mrBull);
colliders.push({ minX: SITE_X - 3, maxX: SITE_X + 3, minZ: SITE_Z - 3, maxZ: SITE_Z + 3 });

// ---- Snowman near the house (visibility toggled by seasons.js) ----
const snowman = createSnowman();
snowman.position.set(-21, 0, -82);
snowman.rotation.y = -0.4;
scene.add(snowman);
setSnowman(snowman);
snowman.userData.label = '⛄ Bonhomme de neige : « Brrr… ! »';
snowman.userData.zoneRadius = 3;
npcs.push(snowman);

// ============================================================
// Centralised world animation tick (called from main.js each frame)
// ============================================================
const TRACK_CENTER = train.userData.center;
const TRACK_RADIUS = train.userData.radius;

export function updateWorldAnimations(dt) {
  // Sky balloon drift
  balloon.position.x += dt * 1.4;
  balloon.position.y = 28 + Math.sin(performance.now() * 0.0006) * 1.5;
  if (balloon.position.x > 110) balloon.position.x = -110;

  // Train around its loop
  train.userData.angle -= dt * 0.35;
  const a = train.userData.angle;
  train.position.x = TRACK_CENTER.x + Math.cos(a) * TRACK_RADIUS;
  train.position.z = TRACK_CENTER.z + Math.sin(a) * TRACK_RADIUS;
  train.rotation.y = Math.PI - a;
  if (train.userData.smoke) {
    const s = train.userData.smoke;
    s.scale.setScalar(0.7 + Math.sin(performance.now() * 0.005) * 0.25);
    s.material.opacity = 0.35 + Math.sin(performance.now() * 0.005) * 0.3;
  }

  // Ducks
  for (const d of ducks) {
    d.userData.angle += d.userData.speed * dt;
    d.position.x = LAKE_X + Math.cos(d.userData.angle) * d.userData.radius;
    d.position.z = LAKE_Z + Math.sin(d.userData.angle) * d.userData.radius;
    d.position.y = 0.45 + Math.sin(performance.now() * 0.003 + d.userData.angle) * 0.03;
    d.rotation.y = -d.userData.angle - Math.PI / 2;
  }

  // School bus back-and-forth on the road
  schoolBus.position.z += schoolBus.userData.dir * 5 * dt;
  if (schoolBus.position.z > 80) {
    schoolBus.userData.dir = -1; schoolBus.rotation.y = Math.PI;
  } else if (schoolBus.position.z < -65) {
    schoolBus.userData.dir = 1; schoolBus.rotation.y = 0;
  }

  // Birthday balloons + flickering candles
  for (const b of party.userData.balloons) {
    const wave = Math.sin(performance.now() * 0.001 + b.userData.phase) * 0.25;
    b.position.y = b.userData.baseY + wave;
    b.userData.string.position.y = b.position.y - 0.85;
  }
  for (const f of party.userData.flames) {
    f.scale.setScalar(0.85 + Math.sin(performance.now() * 0.012 + f.position.x * 100) * 0.25);
  }
}
