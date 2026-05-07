import * as THREE from 'three';
import {
  makeTextSign, matWhite, matBlack, matRedDk, matYellow, matGold,
} from '../setup.js';
import { colliders } from '../physics.js';
import { createSheep } from '../actors/friends.js';

function createArmchair() {
  const c = new THREE.Group();
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.5, 0.9),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
  );
  seat.position.y = 0.45; seat.castShadow = true; c.add(seat);
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.85, 0.2),
    new THREE.MeshLambertMaterial({ color: 0x4e342e }),
  );
  back.position.set(0, 1.05, -0.35); c.add(back);
  for (const sx of [-0.45, 0.45]) {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.5, 0.9),
      new THREE.MeshLambertMaterial({ color: 0x4e342e }),
    );
    arm.position.set(sx, 0.7, 0); c.add(arm);
  }
  return c;
}

function createPlant() {
  const g = new THREE.Group();
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.25, 0.5, 12),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
  );
  pot.position.y = 0.25; g.add(pot);
  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 12, 10),
    new THREE.MeshLambertMaterial({ color: 0x43a047 }),
  );
  leaves.position.y = 0.95; leaves.castShadow = true; g.add(leaves);
  return g;
}

export function createHotel(x, z) {
  const h = new THREE.Group();
  const W = 12, D = 10, H = 6, T = 0.4;
  const DW = 2.6, DH = 3;
  h.userData.size = { W, D, H, T, DW, DH };

  // Floor (red carpet)
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(W, 0.1, D),
    new THREE.MeshLambertMaterial({ color: 0x9a1818 }),
  );
  floor.position.y = 0.05; floor.receiveShadow = true; h.add(floor);

  // Walls (cream)
  const wallMat = new THREE.MeshLambertMaterial({ color: 0xf3e5ab });

  // Back wall (north)
  const nw = new THREE.Mesh(new THREE.BoxGeometry(W, H, T), wallMat);
  nw.position.set(0, H/2, D/2 - T/2);
  nw.castShadow = true; nw.receiveShadow = true; h.add(nw);

  // Front wall (south, with door opening)
  const sideW = (W - DW) / 2;
  const swl = new THREE.Mesh(new THREE.BoxGeometry(sideW, H, T), wallMat);
  swl.position.set(-(DW/2 + sideW/2), H/2, -D/2 + T/2);
  swl.castShadow = true; swl.receiveShadow = true; h.add(swl);
  const swr = swl.clone();
  swr.position.x = (DW/2 + sideW/2);
  h.add(swr);
  const swt = new THREE.Mesh(new THREE.BoxGeometry(DW, H - DH, T), wallMat);
  swt.position.set(0, DH + (H - DH)/2, -D/2 + T/2);
  swt.castShadow = true; h.add(swt);

  // East / West walls
  const ew = new THREE.Mesh(new THREE.BoxGeometry(T, H, D), wallMat);
  ew.position.set(W/2 - T/2, H/2, 0); ew.castShadow = true; ew.receiveShadow = true;
  h.add(ew);
  const ww = new THREE.Mesh(new THREE.BoxGeometry(T, H, D), wallMat);
  ww.position.set(-W/2 + T/2, H/2, 0); ww.castShadow = true; ww.receiveShadow = true;
  h.add(ww);

  // Roof + small tower (decorative second-storey lookout)
  const roof = new THREE.Group();
  const roofBase = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.4, 0.4, D + 0.4),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
  );
  roofBase.position.y = H + 0.2; roofBase.castShadow = true;
  roof.add(roofBase);
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.6, 2.2), wallMat,
  );
  tower.position.y = H + 1.2; tower.castShadow = true;
  roof.add(tower);
  const towerRoof = new THREE.Mesh(
    new THREE.ConeGeometry(1.7, 1.4, 4),
    new THREE.MeshLambertMaterial({ color: 0x8b3a1c }),
  );
  towerRoof.position.y = H + 2.7; towerRoof.rotation.y = Math.PI / 4;
  towerRoof.castShadow = true;
  roof.add(towerRoof);
  // Flagpole on tower
  const tPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 1, 6), matBlack,
  );
  tPole.position.y = H + 3.9; roof.add(tPole);
  const tFlag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.4),
    new THREE.MeshLambertMaterial({ color: 0xffeb3b, side: THREE.DoubleSide }),
  );
  tFlag.position.set(0.3, H + 4.1, 0);
  roof.add(tFlag);
  h.add(roof);
  h.userData.roof = roof;

  // Decorative facade windows (flank the door area, on south wall)
  for (const sx of [-3.6, 3.6]) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 1.2, 0.12),
      new THREE.MeshLambertMaterial({ color: 0xb3e5fc }),
    );
    win.position.set(sx, 1.6, -D/2 - 0.05);
    h.add(win);
  }
  // Upper-floor decorative windows
  for (const sx of [-3.6, 0, 3.6]) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.0, 0.12),
      new THREE.MeshLambertMaterial({ color: 0xb3e5fc }),
    );
    win.position.set(sx, 4.5, -D/2 - 0.05);
    h.add(win);
  }

  // Sign HÔTEL above door
  const sign = makeTextSign('HÔTEL', 5, 1.2, '#fff', '#1a237e');
  sign.position.set(0, DH + 0.6, -D/2 + 0.05);
  sign.rotation.y = Math.PI;
  h.add(sign);

  // Pillars + steps in front
  for (const sx of [-DW/2 - 0.3, DW/2 + 0.3]) {
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, DH + 0.3, 12), matWhite,
    );
    col.position.set(sx, (DH + 0.3) / 2, -D/2 - 0.05);
    col.castShadow = true; h.add(col);
  }
  const steps = new THREE.Mesh(
    new THREE.BoxGeometry(DW + 1.5, 0.2, 1.2),
    new THREE.MeshLambertMaterial({ color: 0xbdbdbd }),
  );
  steps.position.set(0, 0.1, -D/2 - 0.6);
  h.add(steps);

  // Door (dark wood with golden knob)
  const doorPivot = new THREE.Group();
  doorPivot.position.set(-DW/2, 0, -D/2 + T/2);
  const doorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(DW * 0.94, DH * 0.96, 0.06),
    new THREE.MeshLambertMaterial({ color: 0x4e342e }),
  );
  doorMesh.position.set(DW * 0.47, DH/2, 0);
  doorMesh.castShadow = true; doorPivot.add(doorMesh);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), matGold);
  knob.position.set(DW * 0.85, DH/2, 0.06);
  doorPivot.add(knob);
  h.add(doorPivot);
  h.userData.door = doorPivot;
  h.userData.doorOpenAngle = Math.PI / 2 * 0.95;

  // ============ INTERIOR ============

  // Reception desk (back of lobby)
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 1, 0.8),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
  );
  desk.position.set(0, 0.55, 3);
  desk.castShadow = true;
  h.add(desk);
  const deskTop = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.08, 0.95),
    new THREE.MeshLambertMaterial({ color: 0xa1887f }),
  );
  deskTop.position.set(0, 1.09, 3);
  h.add(deskTop);

  // Desk bell
  const bell = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    matGold,
  );
  bell.position.set(1.0, 1.22, 3);
  bell.castShadow = true;
  h.add(bell);

  // Receptionist (sheep with red bow tie)
  const receptionist = createSheep(0xc62828);
  receptionist.position.set(0, 0.1, 4);
  receptionist.rotation.y = Math.PI;
  h.add(receptionist);

  // Plants in front corners
  const plant1 = createPlant();
  plant1.position.set(-W/2 + 0.7, 0.1, -D/2 + 1.0);
  h.add(plant1);
  const plant2 = createPlant();
  plant2.position.set(W/2 - 0.7, 0.1, -D/2 + 1.0);
  h.add(plant2);

  // Waiting armchair on the west side
  const chair = createArmchair();
  chair.position.set(-3.5, 0.1, 0);
  chair.rotation.y = Math.PI / 2;
  h.add(chair);

  // Small side table next to chair (with a magazine on it)
  const sideTable = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.5, 0.6),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
  );
  sideTable.position.set(-3.5, 0.35, -1.2);
  sideTable.castShadow = true;
  h.add(sideTable);

  // Suitcase on the floor (decorative)
  const suitcase = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.5, 0.3),
    new THREE.MeshLambertMaterial({ color: 0x5d4037 }),
  );
  suitcase.position.set(2.5, 0.35, -2);
  suitcase.castShadow = true;
  h.add(suitcase);
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.02, 6, 12, Math.PI),
    matBlack,
  );
  handle.position.set(2.5, 0.65, -2);
  handle.rotation.x = Math.PI / 2;
  h.add(handle);

  // Exhibits + npcs
  const exhibits = [];
  const npcs = [];

  receptionist.userData.label = '🐑 Réceptionniste : « Bienvenue à l\'hôtel ! »';
  receptionist.userData.zoneRadius = 3;
  exhibits.push(receptionist);
  npcs.push(receptionist);

  const bellZone = new THREE.Object3D();
  bellZone.position.set(1.0, 0, 3);
  bellZone.userData.label = '🔔 Sonne la cloche pour appeler quelqu\'un !';
  bellZone.userData.zoneRadius = 1.6;
  exhibits.push(bellZone); h.add(bellZone);

  const chairZone = new THREE.Object3D();
  chairZone.position.set(-3.5, 0, 0);
  chairZone.userData.label = '🛋️ Un fauteuil confortable pour patienter.';
  chairZone.userData.zoneRadius = 2;
  exhibits.push(chairZone); h.add(chairZone);

  const suitcaseZone = new THREE.Object3D();
  suitcaseZone.position.set(2.5, 0, -2);
  suitcaseZone.userData.label = '🧳 Une valise oubliée par un client !';
  suitcaseZone.userData.zoneRadius = 1.8;
  exhibits.push(suitcaseZone); h.add(suitcaseZone);

  h.userData.exhibits = exhibits;
  h.userData.npcs = npcs;

  // Place + colliders
  h.position.set(x, 0, z);
  colliders.push({ minX: x - W/2,    maxX: x + W/2,     minZ: z + D/2 - T,   maxZ: z + D/2 });
  colliders.push({ minX: x - W/2,    maxX: x - DW/2,    minZ: z - D/2,       maxZ: z - D/2 + T });
  colliders.push({ minX: x + DW/2,   maxX: x + W/2,     minZ: z - D/2,       maxZ: z - D/2 + T });
  colliders.push({ minX: x + W/2 - T,maxX: x + W/2,     minZ: z - D/2,       maxZ: z + D/2 });
  colliders.push({ minX: x - W/2,    maxX: x - W/2 + T, minZ: z - D/2,       maxZ: z + D/2 });

  h.userData.center = { x, z, W, D, doorOffsetZ: -D/2 };
  return h;
}
