import * as THREE from 'three';
import {
  makeTextSign, matOrange, matRoof, matRedDk, matYellow, matWindow, matBlack,
} from '../setup.js';
import { colliders } from '../physics.js';
import { createMamaPig, createGeorge } from '../actors/friends.js';

// ---- Furniture factories ----
function createSofa() {
  const s = new THREE.Group();
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.4, 0.8),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
  );
  seat.position.y = 0.4; seat.castShadow = true; s.add(seat);
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.7, 0.2),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
  );
  back.position.set(0, 0.95, -0.3); back.castShadow = true; s.add(back);
  for (const sx of [-1.15, 1.15]) {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.5, 0.8),
      new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
    );
    arm.position.set(sx, 0.7, 0); arm.castShadow = true; s.add(arm);
  }
  return s;
}

function createTV() {
  const tv = new THREE.Group();
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.6, 0.5),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
  );
  table.position.y = 0.3; table.castShadow = true; tv.add(table);
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.9, 0.15),
    new THREE.MeshLambertMaterial({ color: 0x222222 }),
  );
  screen.position.set(0, 1.2, 0); screen.castShadow = true; tv.add(screen);
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 160;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 160);
  grad.addColorStop(0, '#87ceeb');
  grad.addColorStop(1, '#7ec850');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 160);
  ctx.fillStyle = '#ffeb3b';
  ctx.beginPath(); ctx.arc(200, 30, 18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('☁ Beau temps !', 128, 90);
  const tex = new THREE.CanvasTexture(canvas);
  const display = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.75),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  display.position.set(0, 1.2, 0.08);
  tv.add(display);
  return tv;
}

function createDiningTable() {
  const t = new THREE.Group();
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.06, 16),
    new THREE.MeshLambertMaterial({ color: 0xa1887f }),
  );
  top.position.y = 0.7; top.castShadow = true; t.add(top);
  const ped = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.15, 0.7, 8),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
  );
  ped.position.y = 0.35; t.add(ped);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.05, 12),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
  );
  base.position.y = 0.025; t.add(base);
  // fruit bowl
  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshLambertMaterial({ color: 0xeceff1 }),
  );
  bowl.position.y = 0.74; bowl.scale.y = 0.5; t.add(bowl);
  // apples
  for (let i = 0; i < 3; i++) {
    const apple = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 6),
      new THREE.MeshLambertMaterial({ color: 0xc62828 }),
    );
    const ang = (i / 3) * Math.PI * 2;
    apple.position.set(Math.cos(ang) * 0.08, 0.82, Math.sin(ang) * 0.08);
    t.add(apple);
  }
  return t;
}

function createChair() {
  const c = new THREE.Group();
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.06, 0.5),
    new THREE.MeshLambertMaterial({ color: 0xa1887f }),
  );
  seat.position.y = 0.5; seat.castShadow = true; c.add(seat);
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.7, 0.06),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
  );
  back.position.set(0, 0.85, -0.22); back.castShadow = true; c.add(back);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.5, 0.06),
      new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
    );
    leg.position.set(sx * 0.2, 0.25, sz * 0.2);
    c.add(leg);
  }
  return c;
}

// ---- House ----
export function createHouse(x, z) {
  const h = new THREE.Group();
  const W = 10, D = 8, H = 5, T = 0.4;
  const DW = 2.4, DH = 2.6;
  h.userData.size = { W, D, H, T, DW, DH };

  // Floor (wood)
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(W, 0.1, D),
    new THREE.MeshLambertMaterial({ color: 0xc8a47b }),
  );
  floor.position.y = 0.05; floor.receiveShadow = true; h.add(floor);

  const wallMat = matOrange;

  // South wall (back, full)
  const sw = new THREE.Mesh(new THREE.BoxGeometry(W, H, T), wallMat);
  sw.position.set(0, H/2, -D/2 + T/2);
  sw.castShadow = true; sw.receiveShadow = true; h.add(sw);

  // North wall (front, with door opening)
  const sideW = (W - DW) / 2;
  const nwl = new THREE.Mesh(new THREE.BoxGeometry(sideW, H, T), wallMat);
  nwl.position.set(-(DW/2 + sideW/2), H/2, D/2 - T/2);
  nwl.castShadow = true; nwl.receiveShadow = true; h.add(nwl);
  const nwr = nwl.clone();
  nwr.position.x = (DW/2 + sideW/2);
  h.add(nwr);
  const nwt = new THREE.Mesh(new THREE.BoxGeometry(DW, H - DH, T), wallMat);
  nwt.position.set(0, DH + (H - DH)/2, D/2 - T/2);
  nwt.castShadow = true; h.add(nwt);

  // East/West walls
  const ew = new THREE.Mesh(new THREE.BoxGeometry(T, H, D), wallMat);
  ew.position.set(W/2 - T/2, H/2, 0); ew.castShadow = true; ew.receiveShadow = true;
  h.add(ew);
  const ww = new THREE.Mesh(new THREE.BoxGeometry(T, H, D), wallMat);
  ww.position.set(-W/2 + T/2, H/2, 0); ww.castShadow = true; ww.receiveShadow = true;
  h.add(ww);

  // Roof (red, hides when inside)
  const roof = new THREE.Group();
  const roofBase = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.4, 0.3, D + 0.4),
    new THREE.MeshLambertMaterial({ color: 0x8b3a1c }),
  );
  roofBase.position.y = H + 0.15; roofBase.castShadow = true; roof.add(roofBase);
  const triRoof = new THREE.Mesh(
    new THREE.ConeGeometry(W * 0.65, 1.5, 4), matRoof,
  );
  triRoof.position.y = H + 1.0; triRoof.rotation.y = Math.PI / 4;
  triRoof.scale.set(1, 1, D/W); triRoof.castShadow = true;
  roof.add(triRoof);
  h.add(roof);
  h.userData.roof = roof;

  // Chimney
  const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 1.3, 0.7), matRedDk,
  );
  chimney.position.set(W/2 - 1.5, H + 1.4, 0); h.add(chimney);

  // Windows on east + west walls
  for (const [sx, sz] of [[W/2 + 0.05, 1], [W/2 + 0.05, -1], [-W/2 - 0.05, 1], [-W/2 - 0.05, -1]]) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.2, 1.2), matWindow,
    );
    win.position.set(sx, 3, sz);
    h.add(win);
  }

  // Sign + steps in front (north)
  const sign = makeTextSign('MAISON', 2.2, 0.6);
  sign.position.set(0, DH + 0.6, D/2 + 0.05);
  h.add(sign);

  const steps = new THREE.Mesh(
    new THREE.BoxGeometry(DW + 1.5, 0.2, 1.0),
    new THREE.MeshLambertMaterial({ color: 0xbdbdbd }),
  );
  steps.position.set(0, 0.1, D/2 + 0.5);
  h.add(steps);

  // Door (hinges left edge from outside; opens outward to north)
  const doorPivot = new THREE.Group();
  doorPivot.position.set(-DW/2, 0, D/2 - T/2);
  const doorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(DW * 0.94, DH * 0.96, 0.06), matRedDk,
  );
  doorMesh.position.set(DW * 0.47, DH/2, 0);
  doorMesh.castShadow = true; doorPivot.add(doorMesh);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), matYellow);
  knob.position.set(DW * 0.85, DH/2, 0.06);
  doorPivot.add(knob);
  h.add(doorPivot);
  h.userData.door = doorPivot;
  h.userData.doorOpenAngle = -Math.PI / 2 * 0.95; // outward (north)

  // ============ INTERIOR ============

  // TV against south wall
  const tv = createTV();
  tv.position.set(0, 0.1, -D/2 + T + 0.4);
  h.add(tv);

  // Sofa in middle, facing south (toward TV)
  const sofa = createSofa();
  sofa.position.set(0, 0.1, -1.2);
  sofa.rotation.y = Math.PI;
  h.add(sofa);

  // Dining table + chairs (north-east, near door)
  const dt = createDiningTable();
  dt.position.set(2.5, 0.1, 1.5);
  h.add(dt);
  const ch1 = createChair();
  ch1.position.set(1.4, 0.1, 1.5); ch1.rotation.y = -Math.PI/2; h.add(ch1);
  const ch2 = createChair();
  ch2.position.set(3.6, 0.1, 1.5); ch2.rotation.y = Math.PI/2; h.add(ch2);

  // Mama Pig
  const mama = createMamaPig();
  mama.position.set(-2.8, 0.1, 1.5);
  mama.rotation.y = -0.5;
  h.add(mama);

  // George Pig (small) sitting on floor near sofa
  const george = createGeorge();
  george.position.set(-1.5, 0.1, 0.3);
  george.rotation.y = Math.PI;
  h.add(george);

  // Exhibits + npcs
  const exhibits = [];
  const npcs = [];
  function addExhibit(obj, label, radius = 2.5) {
    obj.userData.label = label;
    obj.userData.zoneRadius = radius;
    exhibits.push(obj);
  }
  addExhibit(mama,   '🐷 Maman Pig : « Coucou Peppa, viens manger une pomme ! »');
  addExhibit(george, '🐷 George : « Dine-saure ! Roar ! »');
  npcs.push(mama, george);

  const tvZone = new THREE.Object3D();
  tvZone.position.set(0, 0, -2.5);
  addExhibit(tvZone, '📺 La télé montre la météo : il fait beau aujourd\'hui !', 2);
  h.add(tvZone);

  const tableZone = new THREE.Object3D();
  tableZone.position.set(2.5, 0, 1.5);
  addExhibit(tableZone, '🍎 Une coupe de pommes sur la table !', 1.5);
  h.add(tableZone);

  h.userData.exhibits = exhibits;
  h.userData.npcs = npcs;

  // Place + colliders (5 wall segments)
  h.position.set(x, 0, z);
  // South (back)
  colliders.push({ minX: x - W/2,    maxX: x + W/2,     minZ: z - D/2,       maxZ: z - D/2 + T });
  // North (door wall, two segments)
  colliders.push({ minX: x - W/2,    maxX: x - DW/2,    minZ: z + D/2 - T,   maxZ: z + D/2 });
  colliders.push({ minX: x + DW/2,   maxX: x + W/2,     minZ: z + D/2 - T,   maxZ: z + D/2 });
  // East
  colliders.push({ minX: x + W/2 - T,maxX: x + W/2,     minZ: z - D/2,       maxZ: z + D/2 });
  // West
  colliders.push({ minX: x - W/2,    maxX: x - W/2 + T, minZ: z - D/2,       maxZ: z + D/2 });

  h.userData.center = { x, z, W, D, doorOffsetZ: +D/2 };
  return h;
}
