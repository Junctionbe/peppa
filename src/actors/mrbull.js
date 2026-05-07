import * as THREE from 'three';
import { matBlack, matWhite, matYellow } from '../setup.js';

// Mr Bull (construction worker — yellow vest, hard hat, big horns)
export function createMrBull() {
  const b = new THREE.Group();

  // body (yellow vest)
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.6, 0.85, 12),
    matYellow,
  );
  torso.position.y = 0.85;
  torso.castShadow = true;
  b.add(torso);

  // brown belly under vest
  const belly = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.4, 12),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
  );
  belly.position.y = 0.4;
  b.add(belly);

  // head (brown)
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 14, 12),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
  );
  head.position.y = 1.55;
  head.castShadow = true;
  b.add(head);

  // muzzle (lighter)
  const muzzle = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 10),
    new THREE.MeshLambertMaterial({ color: 0xa1887f }),
  );
  muzzle.position.set(0, 1.4, 0.5);
  muzzle.scale.set(1, 0.85, 1);
  b.add(muzzle);

  // nostrils
  for (const sx of [-0.1, 0.1]) {
    const n = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 6), matBlack,
    );
    n.position.set(sx, 1.36, 0.78);
    b.add(n);
  }

  // big white horns
  for (const sx of [-0.5, 0.5]) {
    const horn = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.6, 6),
      new THREE.MeshLambertMaterial({ color: 0xfafafa }),
    );
    horn.position.set(sx, 1.85, 0);
    horn.rotation.set(0, 0, sx > 0 ? -0.7 : 0.7);
    b.add(horn);
  }

  // eyes
  for (const sx of [-0.18, 0.18]) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 10, 8), matWhite,
    );
    eye.position.set(sx, 1.7, 0.42);
    b.add(eye);
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8), matBlack,
    );
    pupil.position.set(sx, 1.7, 0.48);
    b.add(pupil);
  }

  // hard hat (yellow cap)
  const hat = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshLambertMaterial({ color: 0xffc107 }),
  );
  hat.position.y = 2.05;
  hat.castShadow = true;
  b.add(hat);
  // hat brim
  const brim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 0.06, 14),
    new THREE.MeshLambertMaterial({ color: 0xffa000 }),
  );
  brim.position.y = 1.99;
  b.add(brim);

  return b;
}

// Construction site decorations (cones, barriers, bricks). Returns a group
// with a few props laid out around 0,0,0.
export function createConstructionSite() {
  const g = new THREE.Group();
  const coneMat = new THREE.MeshLambertMaterial({ color: 0xff5722 });
  const stripeMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  function makeCone(x, z) {
    const c = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, 0.7, 12),
      coneMat,
    );
    c.position.set(x, 0.35, z);
    c.castShadow = true;
    g.add(c);
    // white stripe around
    const stripe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.18, 0.1, 12),
      stripeMat,
    );
    stripe.position.set(x, 0.4, z);
    g.add(stripe);
  }
  makeCone(-1.5, -1.5);
  makeCone( 1.5, -1.5);
  makeCone(-1.5,  1.5);
  makeCone( 1.5,  1.5);

  // pile of bricks
  const brickMat = new THREE.MeshLambertMaterial({ color: 0xc62828 });
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const offsetX = row % 2 === 0 ? 0 : 0.15;
      const brick = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.13, 0.18),
        brickMat,
      );
      brick.position.set(-2.5 + col * 0.32 + offsetX, 0.07 + row * 0.13, 0);
      brick.castShadow = true;
      g.add(brick);
    }
  }

  // wheelbarrow (simplified)
  const wheelbarrow = new THREE.Group();
  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.25, 1),
    new THREE.MeshLambertMaterial({ color: 0x9e9e9e }),
  );
  tray.position.y = 0.4;
  wheelbarrow.add(tray);
  const wheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.1, 10),
    matBlack,
  );
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(0, 0.15, 0.6);
  wheelbarrow.add(wheel);
  // handles
  for (const sx of [-0.2, 0.2]) {
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1, 6),
      new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
    );
    handle.position.set(sx, 0.4, -0.7);
    handle.rotation.x = -0.2;
    wheelbarrow.add(handle);
  }
  wheelbarrow.position.set(2.2, 0, 0);
  g.add(wheelbarrow);

  // Caution tape posts (4 corners) with rope/tape between
  for (const [x, z] of [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]]) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6),
      new THREE.MeshLambertMaterial({ color: 0xffeb3b }),
    );
    post.position.set(x, 0.6, z);
    g.add(post);
  }
  return g;
}
