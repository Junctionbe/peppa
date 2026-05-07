import * as THREE from 'three';

export function createDuck() {
  const d = new THREE.Group();
  // body (white sphere, slightly elongated)
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 12, 8),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
  );
  body.scale.set(1, 0.7, 1.4);
  body.position.y = 0.18;
  body.castShadow = true;
  d.add(body);
  // head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 10, 8),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
  );
  head.position.set(0, 0.4, 0.28);
  head.castShadow = true;
  d.add(head);
  // beak (orange)
  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(0.07, 0.18, 6),
    new THREE.MeshLambertMaterial({ color: 0xff9800 }),
  );
  beak.position.set(0, 0.4, 0.45);
  beak.rotation.x = Math.PI / 2;
  d.add(beak);
  // eyes
  for (const sx of [-0.06, 0.06]) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.024, 6, 4),
      new THREE.MeshBasicMaterial({ color: 0x222222 }),
    );
    eye.position.set(sx, 0.46, 0.36);
    d.add(eye);
  }
  // tail (small upturned triangle)
  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 0.18, 6),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
  );
  tail.position.set(0, 0.28, -0.4);
  tail.rotation.set(-Math.PI / 2 + 0.4, 0, 0);
  d.add(tail);
  return d;
}
