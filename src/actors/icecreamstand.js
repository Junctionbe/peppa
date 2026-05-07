import * as THREE from 'three';
import { makeTextSign, matWhite } from '../setup.js';

// Decorative ice cream kiosk. No vendor (just the counter).
export function createIceCreamStand() {
  const s = new THREE.Group();

  // Base / counter (cream)
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.4, 1.6),
    new THREE.MeshLambertMaterial({ color: 0xfff5d0 }),
  );
  base.position.y = 0.7; base.castShadow = true; base.receiveShadow = true;
  s.add(base);

  // Pink trim band
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(2.7, 0.22, 1.7),
    new THREE.MeshLambertMaterial({ color: 0xff80ab }),
  );
  trim.position.y = 1.32;
  s.add(trim);

  // Counter window (front)
  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.06, 0.5),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
  );
  counter.position.set(0, 1.0, 0.95);
  s.add(counter);

  // Striped awning (red/white) on top
  for (let i = 0; i < 5; i++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.04, 0.6),
      new THREE.MeshLambertMaterial({ color: i % 2 === 0 ? 0xc62828 : 0xffffff }),
    );
    stripe.position.set(-1 + i * 0.5, 1.7, 0.95);
    stripe.rotation.x = -0.25;
    s.add(stripe);
  }

  // Giant ice cream cone on roof
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 1.0, 14),
    new THREE.MeshLambertMaterial({ color: 0xd4a373 }),
  );
  cone.position.set(0, 2.2, -0.2);
  cone.rotation.z = Math.PI;
  cone.castShadow = true;
  s.add(cone);
  const scoop = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 14, 12),
    new THREE.MeshLambertMaterial({ color: 0xfff5d0 }),
  );
  scoop.position.set(0, 2.95, -0.2);
  scoop.castShadow = true;
  s.add(scoop);
  const scoop2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 14, 12),
    new THREE.MeshLambertMaterial({ color: 0xff80ab }),
  );
  scoop2.position.set(0, 3.45, -0.2);
  scoop2.castShadow = true;
  s.add(scoop2);
  const cherry = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 8, 6),
    new THREE.MeshLambertMaterial({ color: 0xc62828 }),
  );
  cherry.position.set(0, 3.85, -0.2);
  s.add(cherry);

  // GLACES sign
  const sign = makeTextSign('GLACES', 2.2, 0.5, '#fff5d0', '#c2185b');
  sign.position.set(0, 1.2, 0.83);
  s.add(sign);

  return s;
}

// Small ice cream that the character holds
export function createIceCream() {
  const ic = new THREE.Group();
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.32, 12),
    new THREE.MeshLambertMaterial({ color: 0xd4a373 }),
  );
  cone.position.y = -0.16;
  cone.rotation.z = Math.PI;
  ic.add(cone);
  const scoop = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 12, 10),
    new THREE.MeshLambertMaterial({ color: 0xff80ab }),
  );
  scoop.position.y = 0.06;
  ic.add(scoop);
  const cherry = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 6, 6),
    new THREE.MeshLambertMaterial({ color: 0xc62828 }),
  );
  cherry.position.y = 0.18;
  ic.add(cherry);
  return ic;
}
