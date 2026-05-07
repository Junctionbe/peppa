import * as THREE from 'three';
import { matRed, matPink, matBlack, matWhite, matCheek } from '../setup.js';

export function createPeppa() {
  const peppa = new THREE.Group();

  // dress
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.95, 12), matRed);
  body.position.y = 0.47; body.castShadow = true;
  peppa.add(body);

  // head
  const head = new THREE.Group(); head.position.y = 1.05;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 14), matPink);
  skull.scale.set(1, 0.95, 0.92); skull.castShadow = true; head.add(skull);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), matPink);
  snout.position.set(0, -0.05, 0.4); snout.scale.set(1, 0.85, 1); head.add(snout);
  for (const sx of [-0.06, 0.06]) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), matBlack);
    n.position.set(sx, -0.02, 0.6); head.add(n);
  }
  for (const sx of [-0.13, 0.13]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), matWhite);
    eye.position.set(sx, 0.15, 0.3); head.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), matBlack);
    pupil.position.set(sx, 0.15, 0.38); head.add(pupil);
  }
  for (const sx of [-0.32, 0.32]) {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), matCheek);
    cheek.position.set(sx, -0.05, 0.18); cheek.scale.set(0.7, 0.7, 0.5); head.add(cheek);
  }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 12, Math.PI), matBlack);
  mouth.position.set(0, -0.18, 0.55); mouth.rotation.x = Math.PI; head.add(mouth);
  const earGeo = new THREE.ConeGeometry(0.08, 0.18, 4);
  for (const sx of [-0.22, 0.22]) {
    const ear = new THREE.Mesh(earGeo, matPink);
    ear.position.set(sx, 0.4, -0.05);
    ear.rotation.set(-0.3, 0, sx > 0 ? 0.3 : -0.3);
    head.add(ear);
  }
  peppa.add(head);

  // arms (shoulder pivots, for walking swing)
  function makeArm(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.32, 0.85, 0);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 6), matPink);
    arm.position.y = -0.27; arm.castShadow = true;
    pivot.add(arm);
    return pivot;
  }
  const armL = makeArm(-1);
  const armR = makeArm( 1);
  peppa.add(armL); peppa.add(armR);
  peppa.userData.armL = armL;
  peppa.userData.armR = armR;

  // legs (hip pivots)
  function makeLeg(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.18, 0.45, 0.05);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.4, 6), matPink);
    leg.position.y = -0.2; leg.castShadow = true;
    pivot.add(leg);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.28), matBlack);
    shoe.position.set(0, -0.42, 0.08);
    pivot.add(shoe);
    return pivot;
  }
  const legL = makeLeg(-1);
  const legR = makeLeg( 1);
  peppa.add(legL); peppa.add(legR);
  peppa.userData.legL = legL;
  peppa.userData.legR = legR;

  return peppa;
}
