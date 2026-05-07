import * as THREE from 'three';
import {
  makeTextSign, matWhite, matBlack, matBlue, matRed, matRedDk,
  matYellow,
} from '../setup.js';
import { colliders } from '../physics.js';
import { createSheep, createRebecca, createPedro } from '../actors/friends.js';

// ---- Interior props ----
function createDesk() {
  const d = new THREE.Group();
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.08, 0.7),
    new THREE.MeshLambertMaterial({ color: 0xa1887f }),
  );
  top.position.y = 0.7; top.castShadow = true; d.add(top);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.7, 0.08),
      new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
    );
    leg.position.set(sx * 0.55, 0.35, sz * 0.3);
    d.add(leg);
  }
  return d;
}

function createChalkboard() {
  const cb = new THREE.Group();
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.2, 0.15),
    new THREE.MeshLambertMaterial({ color: 0x5d4037 }),
  );
  cb.add(frame);
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#2e7d32'; ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 80px "Comic Sans MS", cursive';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('A B C', 256, 80);
  ctx.fillText('1 2 3', 256, 180);
  const tex = new THREE.CanvasTexture(canvas);
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(3.7, 1.9),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  board.position.z = 0.08;
  cb.add(board);
  return cb;
}

// ---- School building ----
export function createSchool(x, z) {
  const s = new THREE.Group();
  const W = 18, D = 12, H = 5, T = 0.4;
  const DW = 3, DH = 3;
  s.userData.size = { W, D, H, T, DW, DH };

  // Floor (warm wood)
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(W, 0.1, D),
    new THREE.MeshLambertMaterial({ color: 0xfff3c4 }),
  );
  floor.position.y = 0.05; floor.receiveShadow = true; s.add(floor);

  // Walls (yellow exterior)
  const wallMat = matYellow;
  const nw = new THREE.Mesh(new THREE.BoxGeometry(W, H, T), wallMat);
  nw.position.set(0, H/2, D/2 - T/2);
  nw.castShadow = true; nw.receiveShadow = true; s.add(nw);

  // South wall (with door opening)
  const sideW = (W - DW) / 2;
  const swl = new THREE.Mesh(new THREE.BoxGeometry(sideW, H, T), wallMat);
  swl.position.set(-(DW/2 + sideW/2), H/2, -D/2 + T/2);
  swl.castShadow = true; swl.receiveShadow = true; s.add(swl);
  const swr = swl.clone();
  swr.position.x = (DW/2 + sideW/2);
  s.add(swr);
  const swt = new THREE.Mesh(new THREE.BoxGeometry(DW, H - DH, T), wallMat);
  swt.position.set(0, DH + (H - DH)/2, -D/2 + T/2);
  swt.castShadow = true; s.add(swt);

  const ew = new THREE.Mesh(new THREE.BoxGeometry(T, H, D), wallMat);
  ew.position.set(W/2 - T/2, H/2, 0); ew.castShadow = true; ew.receiveShadow = true;
  s.add(ew);
  const ww = new THREE.Mesh(new THREE.BoxGeometry(T, H, D), wallMat);
  ww.position.set(-W/2 + T/2, H/2, 0); ww.castShadow = true; ww.receiveShadow = true;
  s.add(ww);

  // Roof (red, hidden when inside)
  const roof = new THREE.Group();
  const roofBase = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.4, 0.3, D + 0.4), matRedDk,
  );
  roofBase.position.y = H + 0.15; roofBase.castShadow = true; roof.add(roofBase);
  const triRoof = new THREE.Mesh(
    new THREE.ConeGeometry(D * 0.65, 1.8, 4), matRedDk,
  );
  triRoof.position.y = H + 1.0; triRoof.rotation.y = Math.PI / 4;
  triRoof.scale.set(W/D, 1, 1); triRoof.castShadow = true;
  roof.add(triRoof);
  s.add(roof);
  s.userData.roof = roof;

  // Windows on the back (north) wall
  for (const i of [-2, -1, 0, 1, 2]) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.0, 0.12),
      new THREE.MeshLambertMaterial({ color: 0xb3e5fc }),
    );
    win.position.set(i * 2.5, 3.2, D/2 + 0.05);
    s.add(win);
  }

  // Sign
  const sign = makeTextSign('ÉCOLE', 5, 1.2);
  sign.position.set(0, DH + 0.6, -D/2 + 0.05);
  sign.rotation.y = Math.PI;
  s.add(sign);

  // Flag pole + flag (south-west corner)
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4, 6), matBlack);
  pole.position.set(-W/2 + 0.5, 2, -D/2 - 1); s.add(pole);
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 0.9),
    new THREE.MeshLambertMaterial({ color: 0xe53935, side: THREE.DoubleSide }),
  );
  flag.position.set(-W/2 + 1.3, 3.55, -D/2 - 1);
  s.add(flag);
  s.userData.flag = flag;

  // Pillars + steps in front
  for (const sx of [-DW/2 - 0.3, DW/2 + 0.3]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, DH + 0.3, 12), matWhite);
    col.position.set(sx, (DH + 0.3) / 2, -D/2 - 0.05);
    col.castShadow = true; s.add(col);
  }
  const steps = new THREE.Mesh(
    new THREE.BoxGeometry(DW + 1.5, 0.2, 1.2),
    new THREE.MeshLambertMaterial({ color: 0xbdbdbd }),
  );
  steps.position.set(0, 0.1, -D/2 - 0.6);
  s.add(steps);

  // Door (hinges left edge from outside, opens outward / south)
  const doorPivot = new THREE.Group();
  doorPivot.position.set(-DW/2, 0, -D/2 + T/2);
  const doorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(DW * 0.94, DH * 0.96, 0.06), matRedDk,
  );
  doorMesh.position.set(DW * 0.47, DH/2, 0);
  doorMesh.castShadow = true; doorPivot.add(doorMesh);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), matYellow);
  knob.position.set(DW * 0.85, DH/2, 0.06);
  doorPivot.add(knob);
  s.add(doorPivot);
  s.userData.door = doorPivot;
  s.userData.doorOpenAngle = Math.PI / 2 * 0.95; // outward (south)

  // ============ INTERIOR ============

  // Chalkboard on north wall
  const chalkboard = createChalkboard();
  chalkboard.position.set(0, 2.5, D/2 - T - 0.1);
  chalkboard.rotation.y = Math.PI;
  s.add(chalkboard);

  // Teacher's desk
  const teacherDesk = createDesk();
  teacherDesk.scale.set(1.4, 1, 1.2);
  teacherDesk.position.set(0, 0.1, 3.2);
  s.add(teacherDesk);

  // Student desks in a row
  for (const sx of [-4, 0, 4]) {
    const d = createDesk();
    d.position.set(sx, 0.1, 0);
    s.add(d);
  }

  // Classmates (also exhibits with labels) and add to npcs for look-at
  const exhibits = [];
  const npcs = [];
  function addCharacter(obj, ex, ez, label) {
    obj.position.set(ex, 0.1, ez);
    obj.userData.label = label;
    obj.userData.zoneRadius = 3;
    s.add(obj);
    exhibits.push(obj);
    npcs.push(obj);
  }
  addCharacter(createSheep(0xff5252), -4, -1, '🐑 Suzy Sheep : « Coucou Peppa, c\'est moi ! »');
  addCharacter(createRebecca(),         0, -1, '🐰 Rebecca Rabbit : « Saute saute saute ! »');
  addCharacter(createPedro(),           4, -1, '🐴 Pedro Pony : « Hi-hi-hi-hin ! »');

  // Chalkboard zone (invisible Object3D for proximity label)
  const cbZone = new THREE.Object3D();
  cbZone.position.set(0, 0, D/2 - 2);
  cbZone.userData.label = '📚 Mme Gazelle a écrit : « Aujourd\'hui on apprend l\'alphabet ! »';
  cbZone.userData.zoneRadius = 2.5;
  s.add(cbZone);
  exhibits.push(cbZone);

  s.userData.exhibits = exhibits;
  s.userData.npcs = npcs;

  // Playground OUTSIDE (south of building, on either side of entrance)
  const swing = new THREE.Group();
  const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 6), matRed);
  post1.position.set(-1.2, 1.5, 0); post1.rotation.z =  0.2; swing.add(post1);
  const post2 = post1.clone();
  post2.position.set( 1.2, 1.5, 0); post2.rotation.z = -0.2; swing.add(post2);
  const swingTop = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 6), matRed);
  swingTop.rotation.z = Math.PI / 2; swingTop.position.y = 3; swing.add(swingTop);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.3), matBlue);
  seat.position.set(0, 1.5, 0); swing.add(seat);
  swing.position.set(W/2 + 3, 0, -D/2 - 2); s.add(swing);

  const slide = new THREE.Group();
  const ladder = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6), matRed);
  ladder.position.set(0, 1.2, 0); slide.add(ladder);
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 3), matBlue);
  ramp.position.set(0.6, 1.2, 1.4); ramp.rotation.x = -0.45; slide.add(ramp);
  slide.position.set(-W/2 - 3, 0, -D/2 - 2); s.add(slide);

  // Seesaw (centered between swing & slide, in front of school)
  const seesaw = new THREE.Group();
  const seesawPivot = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.5, 0.3),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
  );
  seesawPivot.position.y = 0.25;
  seesawPivot.castShadow = true;
  seesaw.add(seesawPivot);
  const plank = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.1, 0.4),
    new THREE.MeshLambertMaterial({ color: 0xff80ab }),
  );
  plank.position.y = 0.55;
  plank.rotation.z = 0.12;
  plank.castShadow = true;
  seesaw.add(plank);
  for (const sx of [-1.4, 1.4]) {
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.05, 0.35),
      matBlack,
    );
    seat.position.set(sx, 0.62 + sx * 0.12, 0);
    seesaw.add(seat);
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6),
      new THREE.MeshLambertMaterial({ color: 0xffeb3b }),
    );
    handle.position.set(sx * 0.95, 0.85 + sx * 0.12, 0);
    seesaw.add(handle);
  }
  seesaw.position.set(0, 0, -D/2 - 4);
  s.add(seesaw);

  // Sandbox (east of door)
  const sandbox = new THREE.Group();
  const sandFloor = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.06, 2),
    new THREE.MeshLambertMaterial({ color: 0xffe082 }),
  );
  sandFloor.position.y = 0.05;
  sandbox.add(sandFloor);
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x6d4c41 });
  for (const [bx, bz, bw, bd] of [[-1, 0, 0.15, 2], [1, 0, 0.15, 2], [0, -1, 2, 0.15], [0, 1, 2, 0.15]]) {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(bw, 0.2, bd),
      woodMat,
    );
    frame.position.set(bx, 0.13, bz);
    frame.castShadow = true;
    sandbox.add(frame);
  }
  // shovel
  const shovelHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.5, 6),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
  );
  shovelHandle.position.set(0.3, 0.18, 0.3);
  shovelHandle.rotation.x = 0.6;
  sandbox.add(shovelHandle);
  const shovelBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.04, 0.1),
    new THREE.MeshLambertMaterial({ color: 0xc62828 }),
  );
  shovelBlade.position.set(0.3, 0.06, 0.55);
  sandbox.add(shovelBlade);
  // small bucket
  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.14, 0.3, 12),
    new THREE.MeshLambertMaterial({ color: 0x42a5f5 }),
  );
  bucket.position.set(-0.4, 0.2, -0.3);
  bucket.castShadow = true;
  sandbox.add(bucket);
  sandbox.position.set(W/2 + 6, 0, -D/2 - 4);
  s.add(sandbox);

  // Merry-go-round (small carousel) - west of slide
  const carousel = new THREE.Group();
  const carBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 0.15, 16),
    new THREE.MeshLambertMaterial({ color: 0xab47bc }),
  );
  carBase.position.y = 0.4;
  carBase.castShadow = true;
  carousel.add(carBase);
  const carPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8),
    matBlack,
  );
  carPole.position.y = 1;
  carousel.add(carPole);
  // 4 colored handles around the edge
  const handleColors = [0xff5252, 0xffeb3b, 0x4fc3f7, 0x66bb6a];
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2;
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6),
      new THREE.MeshLambertMaterial({ color: handleColors[i] }),
    );
    handle.position.set(Math.cos(ang) * 1.05, 0.85, Math.sin(ang) * 1.05);
    carousel.add(handle);
  }
  carousel.position.set(-W/2 - 7, 0, -D/2 - 4);
  s.add(carousel);
  s.userData.carousel = carousel;

  // Place + colliders (5 wall segments: north, south-west, south-east, east, west)
  s.position.set(x, 0, z);
  colliders.push({ minX: x - W/2,    maxX: x + W/2,     minZ: z + D/2 - T,   maxZ: z + D/2 });
  colliders.push({ minX: x - W/2,    maxX: x - DW/2,    minZ: z - D/2,       maxZ: z - D/2 + T });
  colliders.push({ minX: x + DW/2,   maxX: x + W/2,     minZ: z - D/2,       maxZ: z - D/2 + T });
  colliders.push({ minX: x + W/2 - T,maxX: x + W/2,     minZ: z - D/2,       maxZ: z + D/2 });
  colliders.push({ minX: x - W/2,    maxX: x - W/2 + T, minZ: z - D/2,       maxZ: z + D/2 });

  s.userData.center = { x, z, W, D, doorOffsetZ: -D/2 };
  return s;
}
