import * as THREE from 'three';
import {
  makeTextSign, matYellow, matRedDk, matWindow, matRed, matBlack, matBlue,
} from '../setup.js';
import { colliders } from '../physics.js';

export function createSchool(x, z) {
  const s = new THREE.Group();

  const main = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 7), matYellow);
  main.position.y = 2.5; main.castShadow = true; main.receiveShadow = true;
  s.add(main);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(8.5, 2, 4), matRedDk);
  roof.position.y = 6; roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.6);
  roof.castShadow = true;
  s.add(roof);

  const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 0.2), matRedDk);
  door.position.set(0, 1.4, 3.55); s.add(door);

  for (const i of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 0.1), matWindow);
    w.position.set(i * 3.5, 3.2, 3.55); s.add(w);
  }
  for (const i of [-2, -1, 0, 1, 2]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.1), matWindow);
    w.position.set(i * 2.2, 3.2, -3.55); s.add(w);
  }

  const sign = makeTextSign('ÉCOLE', 5, 1.2);
  sign.position.set(0, 5.5, 3.62); s.add(sign);

  // flag
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4, 6), matBlack);
  pole.position.set(-5.5, 2, 3.5); s.add(pole);
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 0.9),
    new THREE.MeshLambertMaterial({ color: 0xe53935, side: THREE.DoubleSide }),
  );
  flag.position.set(-4.7, 3.55, 3.5);
  s.add(flag);
  s.userData.flag = flag;

  // playground - swing
  const swing = new THREE.Group();
  const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 6), matRed);
  post1.position.set(-1.2, 1.5, 0); post1.rotation.z =  0.2; swing.add(post1);
  const post2 = post1.clone();
  post2.position.set( 1.2, 1.5, 0); post2.rotation.z = -0.2; swing.add(post2);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 6), matRed);
  top.rotation.z = Math.PI / 2; top.position.y = 3; swing.add(top);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.3), matBlue);
  seat.position.set(0, 1.5, 0); swing.add(seat);
  swing.position.set(8, 0, 5); s.add(swing);

  // playground - slide
  const slide = new THREE.Group();
  const ladder = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6), matRed);
  ladder.position.set(0, 1.2, 0); slide.add(ladder);
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 3), matBlue);
  ramp.position.set(0.6, 1.2, 1.4); ramp.rotation.x = -0.45; slide.add(ramp);
  slide.position.set(-8, 0, 5); s.add(slide);

  s.position.set(x, 0, z);
  colliders.push({ minX: x - 6, maxX: x + 6, minZ: z - 3.5, maxZ: z + 3.5 });
  return s;
}
