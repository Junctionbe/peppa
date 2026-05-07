import * as THREE from 'three';
import { matPink, matBlack, matBlueDk } from '../setup.js';

export function createPapa() {
  const papa = new THREE.Group();

  // shirt (slightly wider blue cylinder torso)
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.7, 12), matBlueDk);
  torso.position.y = 0.85; torso.castShadow = true;
  papa.add(torso);

  // head
  const head = new THREE.Group(); head.position.y = 1.45;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 14), matPink);
  skull.scale.set(1, 0.95, 0.92); skull.castShadow = true; head.add(skull);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), matPink);
  snout.position.set(0, -0.05, 0.46); snout.scale.set(1, 0.85, 1); head.add(snout);

  // beard / stubble
  const beardMat = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
  for (let i = 0; i < 9; i++) {
    const stub = new THREE.Mesh(new THREE.SphereGeometry(0.045 + Math.random() * 0.03, 6, 5), beardMat);
    const t = (i / 8) * Math.PI - Math.PI / 2;
    stub.position.set(Math.sin(t) * 0.32, -0.2 + (Math.random() - 0.5) * 0.06, 0.3 + Math.cos(t) * 0.18);
    head.add(stub);
  }

  // glasses
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  for (const sx of [-0.18, 0.18]) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.17, 18), ringMat);
    ring.position.set(sx, 0.13, 0.42); head.add(ring);
    const fill = new THREE.Mesh(
      new THREE.CircleGeometry(0.13, 16),
      new THREE.MeshBasicMaterial({ color: 0xbbdefb, transparent: true, opacity: 0.55 }),
    );
    fill.position.set(sx, 0.13, 0.41); head.add(fill);
  }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.02), ringMat);
  bridge.position.set(0, 0.13, 0.43); head.add(bridge);

  // eyes (behind glasses)
  for (const sx of [-0.18, 0.18]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), matBlack);
    eye.position.set(sx, 0.13, 0.36); head.add(eye);
  }

  // nostrils
  for (const sx of [-0.07, 0.07]) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), matBlack);
    n.position.set(sx, -0.02, 0.7); head.add(n);
  }

  // smile
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.018, 6, 14, Math.PI), matBlack);
  mouth.position.set(0, -0.2, 0.65); mouth.rotation.x = Math.PI; head.add(mouth);

  // ears
  const earGeo = new THREE.ConeGeometry(0.1, 0.22, 4);
  for (const sx of [-0.3, 0.3]) {
    const ear = new THREE.Mesh(earGeo, matPink);
    ear.position.set(sx, 0.45, -0.05);
    ear.rotation.set(-0.3, 0, sx > 0 ? 0.3 : -0.3);
    head.add(ear);
  }
  papa.add(head);

  // arms (shoulder pivots)
  function makeArm(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.42, 1.05, 0);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6), matBlueDk);
    arm.position.y = -0.3; arm.castShadow = true;
    pivot.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), matPink);
    hand.position.y = -0.62;
    pivot.add(hand);
    return pivot;
  }
  const armL = makeArm(-1);
  const armR = makeArm( 1);
  papa.add(armL); papa.add(armR);
  papa.userData.armL = armL;
  papa.userData.armR = armR;

  // legs (hip pivots)
  function makeLeg(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.2, 0.5, 0);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.45, 6), matBlueDk);
    leg.position.y = -0.225; leg.castShadow = true;
    pivot.add(leg);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.32), matBlack);
    shoe.position.set(0, -0.49, 0.08);
    pivot.add(shoe);
    return pivot;
  }
  const legL = makeLeg(-1);
  const legR = makeLeg( 1);
  papa.add(legL); papa.add(legR);
  papa.userData.legL = legL;
  papa.userData.legR = legR;

  return papa;
}
