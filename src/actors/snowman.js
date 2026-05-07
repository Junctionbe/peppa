import * as THREE from 'three';

export function createSnowman() {
  const s = new THREE.Group();
  const snowMat = new THREE.MeshLambertMaterial({ color: 0xfafafa });
  // 3 stacked snow balls
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 12), snowMat);
  bottom.position.y = 0.8; bottom.castShadow = true; s.add(bottom);
  const middle = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12), snowMat);
  middle.position.y = 1.9; middle.castShadow = true; s.add(middle);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), snowMat);
  head.position.y = 2.85; head.castShadow = true; s.add(head);
  // carrot nose
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.32, 6),
    new THREE.MeshLambertMaterial({ color: 0xff9800 }),
  );
  nose.position.set(0, 2.85, 0.45);
  nose.rotation.x = Math.PI / 2;
  s.add(nose);
  // coal eyes
  for (const sx of [-0.15, 0.15]) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 6, 5),
      new THREE.MeshBasicMaterial({ color: 0x222222 }),
    );
    eye.position.set(sx, 3, 0.4);
    s.add(eye);
  }
  // 3 buttons on middle ball
  for (let i = 0; i < 3; i++) {
    const btn = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0x222222 }),
    );
    btn.position.set(0, 2.2 - i * 0.22, 0.55);
    s.add(btn);
  }
  // stick arms
  const stickMat = new THREE.MeshLambertMaterial({ color: 0x6d4c41 });
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1, 5), stickMat,
    );
    arm.position.set(sx * 0.7, 1.95, 0);
    arm.rotation.set(0, 0, sx > 0 ? -0.3 : 0.3);
    s.add(arm);
  }
  // top hat
  const hatBrim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.05, 14),
    new THREE.MeshLambertMaterial({ color: 0x222222 }),
  );
  hatBrim.position.y = 3.25;
  s.add(hatBrim);
  const hatTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.45, 14),
    new THREE.MeshLambertMaterial({ color: 0x222222 }),
  );
  hatTop.position.y = 3.5;
  s.add(hatTop);
  // red ribbon on hat
  const ribbon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.33, 0.33, 0.08, 14),
    new THREE.MeshLambertMaterial({ color: 0xc62828 }),
  );
  ribbon.position.y = 3.34;
  s.add(ribbon);
  return s;
}
