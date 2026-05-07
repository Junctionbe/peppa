import * as THREE from 'three';
import { matWhite, matBlack, matPink, matYellow } from '../setup.js';

// ---- Suzy Sheep (and other sheep). Optional bow color to distinguish them. ----
export function createSheep(bowColor = null) {
  const s = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 10), matWhite);
  body.position.y = 0.5; body.scale.set(1.25, 1, 1); body.castShadow = true; s.add(body);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 10, 8),
    new THREE.MeshLambertMaterial({ color: 0xefebe9 }),
  );
  head.position.set(0, 0.7, 0.45); head.castShadow = true; s.add(head);
  for (const sx of [-0.07, 0.07]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), matBlack);
    eye.position.set(sx, 0.78, 0.62); s.add(eye);
  }
  for (const [x, z] of [[-0.2, 0.2], [0.2, 0.2], [-0.2, -0.2], [0.2, -0.2]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6), matBlack);
    leg.position.set(x, 0.15, z); s.add(leg);
  }
  if (bowColor) {
    const bow = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.12, 0.08),
      new THREE.MeshLambertMaterial({ color: bowColor }),
    );
    bow.position.set(0, 0.92, 0.3);
    bow.rotation.z = 0.3;
    s.add(bow);
  }
  return s;
}

// ---- George Pig (small green-shirted pig brother) ----
export function createGeorge() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.6, 12),
    new THREE.MeshLambertMaterial({ color: 0x66bb6a }),
  );
  body.position.y = 0.3; body.castShadow = true; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), matPink);
  head.position.y = 0.78; head.scale.set(1, 0.95, 0.9); head.castShadow = true; g.add(head);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), matPink);
  snout.position.set(0, 0.72, 0.28); g.add(snout);
  for (const sx of [-0.09, 0.09]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), matBlack);
    eye.position.set(sx, 0.86, 0.22); g.add(eye);
  }
  return g;
}

// ---- Rebecca Rabbit (white, long upright ears) ----
export function createRebecca() {
  const r = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 10), matWhite);
  body.position.y = 0.5; body.scale.set(1.1, 1, 1); body.castShadow = true; r.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), matWhite);
  head.position.set(0, 0.85, 0.35); head.castShadow = true; r.add(head);
  // long ears + pink interiors
  for (const sx of [-0.1, 0.1]) {
    const ear = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.07, 0.5, 8), matWhite,
    );
    ear.position.set(sx, 1.25, 0.3);
    ear.rotation.set(0.1, 0, sx > 0 ? 0.15 : -0.15);
    r.add(ear);
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.04, 0.45, 8),
      new THREE.MeshLambertMaterial({ color: 0xff80ab }),
    );
    inner.position.set(sx, 1.27, 0.32);
    inner.rotation.set(0.1, 0, sx > 0 ? 0.15 : -0.15);
    r.add(inner);
  }
  // pink nose
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 8, 8),
    new THREE.MeshLambertMaterial({ color: 0xff80ab }),
  );
  nose.position.set(0, 0.82, 0.62); r.add(nose);
  // eyes
  for (const sx of [-0.09, 0.09]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), matBlack);
    eye.position.set(sx, 0.92, 0.55); r.add(eye);
  }
  // legs (white)
  for (const [x, z] of [[-0.2, 0.2], [0.2, 0.2], [-0.2, -0.2], [0.2, -0.2]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6), matWhite);
    leg.position.set(x, 0.15, z); r.add(leg);
  }
  return r;
}

// ---- Pedro Pony (brown, with mane) ----
export function createPedro() {
  const p = new THREE.Group();
  const ponyMat = new THREE.MeshLambertMaterial({ color: 0xa1887f });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), ponyMat);
  body.position.y = 0.55; body.scale.set(1.3, 1, 0.9); body.castShadow = true; p.add(body);
  // neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.5, 8), ponyMat);
  neck.position.set(0, 0.85, 0.4); neck.rotation.x = -0.4; p.add(neck);
  // head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), ponyMat);
  head.position.set(0, 1.15, 0.6); head.scale.set(1, 1, 1.4); head.castShadow = true;
  p.add(head);
  // mane
  const mane = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.4, 0.3),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
  );
  mane.position.set(0, 0.95, 0.3); mane.rotation.x = -0.4; p.add(mane);
  // eyes
  for (const sx of [-0.08, 0.08]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), matBlack);
    eye.position.set(sx, 1.18, 0.78); p.add(eye);
  }
  // nostrils
  for (const sx of [-0.05, 0.05]) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), matBlack);
    n.position.set(sx, 1.07, 0.85); p.add(n);
  }
  // legs
  for (const [x, z] of [[-0.25, 0.25], [0.25, 0.25], [-0.25, -0.25], [0.25, -0.25]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), ponyMat);
    leg.position.set(x, 0.25, z); p.add(leg);
  }
  return p;
}

// ---- Mama Pig (taller, yellow dress) ----
export function createMamaPig() {
  const m = new THREE.Group();
  // dress (yellow)
  const body = new THREE.Mesh(
    new THREE.ConeGeometry(0.55, 1.3, 12),
    new THREE.MeshLambertMaterial({ color: 0xffeb3b }),
  );
  body.position.y = 0.65; body.castShadow = true; m.add(body);
  // head
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 12), matPink);
  skull.position.y = 1.55; skull.scale.set(1, 0.95, 0.92); skull.castShadow = true;
  m.add(skull);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), matPink);
  snout.position.set(0, 1.5, 0.5); snout.scale.set(1, 0.85, 1);
  m.add(snout);
  // eyes
  for (const sx of [-0.17, 0.17]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), matWhite);
    eye.position.set(sx, 1.7, 0.4); m.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), matBlack);
    pupil.position.set(sx, 1.7, 0.46); m.add(pupil);
  }
  // long eyelashes (small lines)
  for (const sx of [-0.18, 0.18]) {
    const lash = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.06, 0.02), matBlack,
    );
    lash.position.set(sx + (sx > 0 ? 0.07 : -0.07), 1.78, 0.42);
    lash.rotation.z = sx > 0 ? -0.4 : 0.4;
    m.add(lash);
  }
  // nostrils
  for (const sx of [-0.08, 0.08]) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), matBlack);
    n.position.set(sx, 1.45, 0.74); m.add(n);
  }
  // smile
  const mouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.07, 0.015, 6, 12, Math.PI), matBlack,
  );
  mouth.position.set(0, 1.32, 0.7); mouth.rotation.x = Math.PI; m.add(mouth);
  // ears
  for (const sx of [-0.3, 0.3]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 4), matPink);
    ear.position.set(sx, 1.95, -0.05);
    ear.rotation.set(-0.3, 0, sx > 0 ? 0.3 : -0.3);
    m.add(ear);
  }
  return m;
}
