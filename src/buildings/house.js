import * as THREE from 'three';
import {
  makeTextSign, matOrange, matRoof, matRedDk, matYellow, matWindow,
} from '../setup.js';
import { colliders } from '../physics.js';

export function createHouse(x, z) {
  const h = new THREE.Group();

  const walls = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 6), matOrange);
  walls.position.y = 2.5; walls.castShadow = true; walls.receiveShadow = true;
  h.add(walls);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(5.5, 2.5, 4), matRoof);
  roof.position.y = 6.25; roof.rotation.y = Math.PI / 4; roof.castShadow = true;
  h.add(roof);

  const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 0.2), matRedDk);
  door.position.set(0, 1.2, 3.05); h.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), matYellow);
  knob.position.set(0.5, 1.2, 3.18); h.add(knob);

  const win1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 0.1), matWindow);
  win1.position.set(-2.2, 3, 3.05); h.add(win1);
  const win2 = win1.clone(); win2.position.set(2.2, 3, 3.05); h.add(win2);

  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.3, 0.7), matRedDk);
  chimney.position.set(1.8, 6.6, 0); h.add(chimney);

  const sign = makeTextSign('MAISON', 2.2, 0.6);
  sign.position.set(0, 4.2, 3.06);
  h.add(sign);

  h.position.set(x, 0, z);
  colliders.push({ minX: x - 3.5, maxX: x + 3.5, minZ: z - 3, maxZ: z + 3 });
  return h;
}
