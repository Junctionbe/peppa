import * as THREE from 'three';

// A small pizza you can hold above a character. Toppings randomised so each
// one looks slightly different.
export function createPizza() {
  const p = new THREE.Group();

  // crust
  const crust = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.04, 18),
    new THREE.MeshLambertMaterial({ color: 0xd4a373 }),
  );
  crust.castShadow = true;
  p.add(crust);

  // tomato sauce on top
  const sauce = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.012, 18),
    new THREE.MeshLambertMaterial({ color: 0xc62828 }),
  );
  sauce.position.y = 0.025;
  p.add(sauce);

  // cheese blobs
  for (let i = 0; i < 5; i++) {
    const ang = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.13;
    const c = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 6, 5),
      new THREE.MeshLambertMaterial({ color: 0xfff59d }),
    );
    c.position.set(Math.cos(ang) * r, 0.035, Math.sin(ang) * r);
    c.scale.y = 0.4;
    p.add(c);
  }

  // pepperoni
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2 + Math.random() * 0.2;
    const r = 0.11;
    const pep = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, 0.012, 8),
      new THREE.MeshLambertMaterial({ color: 0x880e4f }),
    );
    pep.position.set(Math.cos(ang) * r, 0.04, Math.sin(ang) * r);
    p.add(pep);
  }

  // basil dots
  for (let i = 0; i < 3; i++) {
    const ang = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.14;
    const b = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 6, 5),
      new THREE.MeshLambertMaterial({ color: 0x66bb6a }),
    );
    b.position.set(Math.cos(ang) * r, 0.045, Math.sin(ang) * r);
    b.scale.y = 0.4;
    p.add(b);
  }

  return p;
}
