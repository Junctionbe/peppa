import * as THREE from 'three';
import {
  makeTextSign, matBeige, matMarble, matBone, matBlack, matWhite, matGold, matYellow,
} from '../setup.js';
import { colliders } from '../physics.js';

// ---- Exhibit factories ----
function createDinoSkeleton() {
  const g = new THREE.Group();
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.3, 1.6),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
  );
  plinth.position.y = 0.15; plinth.receiveShadow = true; g.add(plinth);

  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8), matBone);
  spine.rotation.z = Math.PI / 2; spine.position.y = 1.5; spine.castShadow = true;
  g.add(spine);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 1.5, 8), matBone);
  tail.rotation.z = Math.PI / 2 + 0.2; tail.position.set(-1.9, 1.45, 0);
  g.add(tail);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), matBone);
  skull.position.set(1.55, 1.55, 0); skull.scale.set(1.3, 0.85, 0.85);
  skull.castShadow = true; g.add(skull);

  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.55), matBone);
  jaw.position.set(1.7, 1.35, 0); g.add(jaw);

  for (const sz of [-0.18, 0.18]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), matBlack);
    eye.position.set(1.6, 1.62, sz); g.add(eye);
  }
  for (const [x, z] of [[-0.5, 0.4], [0.5, 0.4], [-0.5, -0.4], [0.5, -0.4]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.3, 6), matBone);
    leg.position.set(x, 0.95, z); leg.castShadow = true; g.add(leg);
  }
  for (let i = -3; i <= 3; i++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 6, 12, Math.PI), matBone);
    rib.position.set(i * 0.32, 1.5, 0); rib.rotation.y = Math.PI / 2;
    g.add(rib);
  }
  return g;
}

function createPainting() {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6, 0.12), matGold);
  g.add(frame);

  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 192;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#a3d8f7'; ctx.fillRect(0, 0, 256, 192);
  ctx.fillStyle = '#7ec850'; ctx.fillRect(0, 130, 256, 62);
  // Peppa
  ctx.fillStyle = '#e53935';
  ctx.beginPath(); ctx.moveTo(80, 130); ctx.lineTo(60, 170); ctx.lineTo(100, 170); ctx.fill();
  ctx.fillStyle = '#ffb3c6';
  ctx.beginPath(); ctx.arc(80, 110, 16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(91, 113, 7, 0, Math.PI * 2); ctx.fill();
  // George
  ctx.fillStyle = '#4caf50';
  ctx.beginPath(); ctx.moveTo(120, 142); ctx.lineTo(108, 170); ctx.lineTo(132, 170); ctx.fill();
  ctx.fillStyle = '#ffb3c6';
  ctx.beginPath(); ctx.arc(120, 128, 11, 0, Math.PI * 2); ctx.fill();
  // Mama
  ctx.fillStyle = '#ff9800';
  ctx.beginPath(); ctx.moveTo(160, 112); ctx.lineTo(140, 170); ctx.lineTo(180, 170); ctx.fill();
  ctx.fillStyle = '#ffb3c6';
  ctx.beginPath(); ctx.arc(160, 92, 19, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(173, 95, 8, 0, Math.PI * 2); ctx.fill();
  // Papa
  ctx.fillStyle = '#1976d2';
  ctx.beginPath(); ctx.moveTo(210, 105); ctx.lineTo(185, 170); ctx.lineTo(235, 170); ctx.fill();
  ctx.fillStyle = '#ffb3c6';
  ctx.beginPath(); ctx.arc(210, 85, 22, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(225, 88, 9, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(204, 84, 5, 0, Math.PI * 2); ctx.arc(216, 84, 5, 0, Math.PI * 2); ctx.stroke();
  // sun
  ctx.fillStyle = '#ffeb3b';
  ctx.beginPath(); ctx.arc(225, 30, 17, 0, Math.PI * 2); ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  const cm = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 1.4),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  cm.position.z = 0.07;
  g.add(cm);
  return g;
}

function createVase() {
  const g = new THREE.Group();
  const ped = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 1.0, 1.0),
    new THREE.MeshLambertMaterial({ color: 0xbcaaa4 }),
  );
  ped.position.y = 0.5; ped.castShadow = true; g.add(ped);

  const vaseMat = new THREE.MeshLambertMaterial({ color: 0x42a5f5 });
  const lower = new THREE.Mesh(new THREE.SphereGeometry(0.4, 14, 12), vaseMat);
  lower.position.y = 1.4; lower.scale.set(1, 1.1, 1); lower.castShadow = true; g.add(lower);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 0.4, 12), vaseMat);
  neck.position.y = 1.95; g.add(neck);
  const lip = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.08, 12), vaseMat);
  lip.position.y = 2.18; g.add(lip);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 6, 16), matGold);
  band.position.y = 1.4; band.rotation.x = Math.PI / 2; g.add(band);
  return g;
}

function createFossil() {
  const g = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 0.1), matBeige);
  g.add(board);
  const fossilMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
  for (let i = 0; i < 28; i++) {
    const t = i / 27;
    const ang = t * Math.PI * 4;
    const r = 0.08 + t * 0.45;
    const seg = new THREE.Mesh(new THREE.SphereGeometry(0.06 + t * 0.06, 8, 6), fossilMat);
    seg.position.set(Math.cos(ang) * r, Math.sin(ang) * r, 0.07);
    g.add(seg);
  }
  return g;
}

// ---- Museum building ----
export function createMuseum(x, z) {
  const m = new THREE.Group();
  const W = 14, D = 12, H = 5;     // outer dimensions
  const T = 0.4;                    // wall thickness
  const DW = 3, DH = 3;             // door opening
  m.userData.size = { W, D, H, T, DW, DH };

  // floor
  const floor = new THREE.Mesh(new THREE.BoxGeometry(W, 0.1, D), matMarble);
  floor.position.y = 0.05; floor.receiveShadow = true; m.add(floor);

  // back wall
  const nw = new THREE.Mesh(new THREE.BoxGeometry(W, H, T), matBeige);
  nw.position.set(0, H/2, D/2 - T/2);
  nw.castShadow = true; nw.receiveShadow = true; m.add(nw);

  // front wall (with door opening)
  const sideW = (W - DW) / 2;
  const swl = new THREE.Mesh(new THREE.BoxGeometry(sideW, H, T), matBeige);
  swl.position.set(-(DW/2 + sideW/2), H/2, -D/2 + T/2);
  swl.castShadow = true; swl.receiveShadow = true; m.add(swl);
  const swr = swl.clone();
  swr.position.x = (DW/2 + sideW/2);
  m.add(swr);
  const swt = new THREE.Mesh(new THREE.BoxGeometry(DW, H - DH, T), matBeige);
  swt.position.set(0, DH + (H - DH)/2, -D/2 + T/2);
  swt.castShadow = true; m.add(swt);

  // east + west walls
  const ew = new THREE.Mesh(new THREE.BoxGeometry(T, H, D), matBeige);
  ew.position.set(W/2 - T/2, H/2, 0); ew.castShadow = true; ew.receiveShadow = true;
  m.add(ew);
  const ww = new THREE.Mesh(new THREE.BoxGeometry(T, H, D), matBeige);
  ww.position.set(-W/2 + T/2, H/2, 0); ww.castShadow = true; ww.receiveShadow = true;
  m.add(ww);

  // roof (hidden when player is inside)
  const roof = new THREE.Group();
  const roofBase = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.4, 0.3, D + 0.4),
    new THREE.MeshLambertMaterial({ color: 0xa1887f }),
  );
  roofBase.position.y = H + 0.15; roofBase.castShadow = true; roof.add(roofBase);
  const triRoof = new THREE.Mesh(
    new THREE.ConeGeometry(D * 0.65, 1.5, 4),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
  );
  triRoof.position.y = H + 1.0; triRoof.rotation.y = Math.PI / 4;
  triRoof.scale.set(W/D, 1, 1); triRoof.castShadow = true;
  roof.add(triRoof);
  m.add(roof);
  m.userData.roof = roof;

  // pillars + steps
  for (const sx of [-DW/2 - 0.3, DW/2 + 0.3]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, DH + 0.3, 12), matWhite);
    col.position.set(sx, (DH + 0.3) / 2, -D/2 - 0.05);
    col.castShadow = true; m.add(col);
  }
  const steps = new THREE.Mesh(
    new THREE.BoxGeometry(DW + 1.5, 0.2, 1.2),
    new THREE.MeshLambertMaterial({ color: 0xbdbdbd }),
  );
  steps.position.set(0, 0.1, -D/2 - 0.6);
  m.add(steps);

  // sign
  const sign = makeTextSign('MUSÉE', 4, 1, '#fff', '#6d4c41');
  sign.position.set(0, DH + 0.7, -D/2 + 0.05);
  sign.rotation.y = Math.PI;
  m.add(sign);

  // door (hinges on left edge, swings outward)
  const doorPivot = new THREE.Group();
  doorPivot.position.set(-DW/2, 0, -D/2 + T/2);
  const doorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(DW * 0.94, DH * 0.96, 0.06),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
  );
  doorMesh.position.set(DW * 0.47, DH/2, 0);
  doorMesh.castShadow = true;
  doorPivot.add(doorMesh);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), matGold);
  knob.position.set(DW * 0.85, DH/2, 0.06);
  doorPivot.add(knob);
  m.add(doorPivot);
  m.userData.door = doorPivot;
  m.userData.doorOpenAngle = Math.PI / 2 * 0.95; // outward (south)

  // exhibits
  const exhibits = [];
  function addExhibit(obj, ex, ez, label) {
    obj.position.set(ex, 0.1, ez);
    obj.userData.label = label;
    obj.userData.zoneRadius = 3;
    m.add(obj);
    exhibits.push(obj);
  }
  addExhibit(createDinoSkeleton(), -3.5, 3.0,
    '🦕 Dino-saure : il habitait ici il y a très très longtemps !');
  addExhibit(createVase(),          3.5, 3.0,
    '🏺 Vase ancien : la famille Pig l\'a trouvé dans le jardin.');

  const painting = createPainting();
  painting.position.set(-7 + 0.18, 2.5, 0);
  painting.rotation.y = Math.PI / 2;
  painting.userData.label = '🖼️ "La famille Pig" — un beau portrait de famille !';
  painting.userData.zoneRadius = 3;
  m.add(painting); exhibits.push(painting);

  const fossil = createFossil();
  fossil.position.set(7 - 0.18, 2.5, 0);
  fossil.rotation.y = -Math.PI / 2;
  fossil.userData.label = '🐚 Coquillage fossile : très très vieux (mille ans) !';
  fossil.userData.zoneRadius = 3;
  m.add(fossil); exhibits.push(fossil);

  m.userData.exhibits = exhibits;
  m.userData.npcs = []; // museum has no NPCs (just static exhibits)

  // place + register colliders
  m.position.set(x, 0, z);
  // 5 wall segments in world coords
  colliders.push({ minX: x - W/2,        maxX: x + W/2,        minZ: z + D/2 - T,    maxZ: z + D/2 });
  colliders.push({ minX: x - W/2,        maxX: x - DW/2,       minZ: z - D/2,        maxZ: z - D/2 + T });
  colliders.push({ minX: x + DW/2,       maxX: x + W/2,        minZ: z - D/2,        maxZ: z - D/2 + T });
  colliders.push({ minX: x + W/2 - T,    maxX: x + W/2,        minZ: z - D/2,        maxZ: z + D/2 });
  colliders.push({ minX: x - W/2,        maxX: x - W/2 + T,    minZ: z - D/2,        maxZ: z + D/2 });

  // expose footprint center for the loop (door entrance check, roof toggle, etc.)
  m.userData.center = { x, z, W, D, doorOffsetZ: -D/2 };

  return m;
}
