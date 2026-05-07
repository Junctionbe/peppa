import * as THREE from 'three';

export function createSchoolBus() {
  const b = new THREE.Group();

  // Main body (yellow box)
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.8, 5),
    new THREE.MeshLambertMaterial({ color: 0xffeb3b }),
  );
  body.position.y = 1.3;
  body.castShadow = true; body.receiveShadow = true;
  b.add(body);

  // Black trim band
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(2.45, 0.18, 5.05),
    new THREE.MeshLambertMaterial({ color: 0x222222 }),
  );
  trim.position.y = 1.2;
  b.add(trim);

  // Side windows (5 each side)
  for (let i = -2; i <= 2; i++) {
    for (const sx of [-1.23, 1.23]) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.6, 0.7),
        new THREE.MeshLambertMaterial({ color: 0xb3e5fc }),
      );
      win.position.set(sx, 1.7, i * 0.85);
      b.add(win);
    }
  }
  // Windshield
  const ws = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.7, 0.05),
    new THREE.MeshLambertMaterial({ color: 0xb3e5fc }),
  );
  ws.position.set(0, 1.7, 2.52);
  b.add(ws);
  // Back window
  const bw = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.6, 0.05),
    new THREE.MeshLambertMaterial({ color: 0xb3e5fc }),
  );
  bw.position.set(0, 1.7, -2.52);
  b.add(bw);

  // Door (folding, on right side near front)
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 1.4, 0.8),
    new THREE.MeshLambertMaterial({ color: 0xfdd835 }),
  );
  door.position.set(1.23, 1.0, 1.6);
  b.add(door);

  // Wheels (4)
  const wheels = [];
  for (const [x, z] of [[-1.0, 1.5], [1.0, 1.5], [-1.0, -1.5], [1.0, -1.5]]) {
    const w = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.28, 16),
      new THREE.MeshLambertMaterial({ color: 0x222222 }),
    );
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.4, z);
    w.castShadow = true;
    b.add(w);
    wheels.push(w);
  }
  b.userData.wheels = wheels;

  // Headlights
  for (const sx of [-0.7, 0.7]) {
    const h = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xfff59d }),
    );
    h.position.set(sx, 0.9, 2.55);
    h.scale.set(1, 1, 0.5);
    b.add(h);
  }
  // Brake / stop lights
  for (const sx of [-0.7, 0.7]) {
    const r = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xff5252 }),
    );
    r.position.set(sx, 0.9, -2.55);
    r.scale.set(1, 0.7, 0.4);
    b.add(r);
  }

  // STOP sign on side (red octagon, simplified as flat)
  const stopCanvas = document.createElement('canvas');
  stopCanvas.width = 128; stopCanvas.height = 128;
  const stopCtx = stopCanvas.getContext('2d');
  stopCtx.fillStyle = '#c62828';
  stopCtx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
    const x = 64 + Math.cos(a) * 56, y = 64 + Math.sin(a) * 56;
    if (i === 0) stopCtx.moveTo(x, y);
    else         stopCtx.lineTo(x, y);
  }
  stopCtx.closePath(); stopCtx.fill();
  stopCtx.fillStyle = '#fff';
  stopCtx.font = 'bold 30px sans-serif';
  stopCtx.textAlign = 'center'; stopCtx.textBaseline = 'middle';
  stopCtx.fillText('STOP', 64, 68);
  const stopTex = new THREE.CanvasTexture(stopCanvas);
  const stopSign = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.7),
    new THREE.MeshBasicMaterial({ map: stopTex, transparent: true }),
  );
  stopSign.position.set(-1.27, 1.6, 0);
  stopSign.rotation.y = Math.PI / 2;
  b.add(stopSign);

  // SCHOOL BUS sign on top
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 256; signCanvas.height = 64;
  const ctx = signCanvas.getContext('2d');
  ctx.fillStyle = '#222'; ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = '#ffeb3b';
  ctx.font = 'bold 30px "Comic Sans MS", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('ÉCOLE BUS', 128, 34);
  const tex = new THREE.CanvasTexture(signCanvas);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 0.4),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }),
  );
  sign.position.set(0, 2.4, 0);
  b.add(sign);

  return b;
}
