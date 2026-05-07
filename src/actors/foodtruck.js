import * as THREE from 'three';
import { matWhite, matBlack, matRed, matRedDk, matYellow } from '../setup.js';
import { createSheep } from './friends.js';

// Static parked food truck (red & white) with a serving window on the right
// side, an awning, and a "PIZZA" sign on top. Returns { truck, vendor }.
// The vendor (chef sheep) is a separate object placed beside the truck.
export function createFoodTruck() {
  const t = new THREE.Group();

  // Main body (white)
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 1.5, 4),
    matWhite,
  );
  body.position.y = 1.05;
  body.castShadow = true; body.receiveShadow = true;
  t.add(body);

  // Red bottom stripe
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(2.55, 0.35, 4.05),
    matRed,
  );
  stripe.position.y = 0.5;
  t.add(stripe);

  // Cabin (front of truck)
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 1.4, 1.2),
    matRed,
  );
  cabin.position.set(0, 0.95, 1.7);
  cabin.castShadow = true;
  t.add(cabin);

  // Windshield
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.7, 0.06),
    new THREE.MeshLambertMaterial({ color: 0xb3e5fc }),
  );
  windshield.position.set(0, 1.4, 2.3);
  t.add(windshield);

  // Service window (cut-out look on right side)
  const winFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.85, 1.7),
    matBlack,
  );
  winFrame.position.set(1.27, 1.3, -0.3);
  t.add(winFrame);

  // Counter ledge
  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.08, 1.7),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
  );
  counter.position.set(1.4, 0.85, -0.3);
  counter.castShadow = true;
  t.add(counter);

  // Awning above window (green)
  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.06, 1.9),
    new THREE.MeshLambertMaterial({ color: 0x388e3c }),
  );
  awning.position.set(1.55, 1.85, -0.3);
  awning.rotation.z = -0.3;
  t.add(awning);

  // PIZZA sign on top
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 256; signCanvas.height = 96;
  const ctx = signCanvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 256, 96);
  ctx.strokeStyle = '#e53935'; ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 240, 80);
  ctx.fillStyle = '#e53935';
  ctx.font = 'bold 52px "Comic Sans MS", cursive';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('🍕 PIZZA', 128, 50);
  const tex = new THREE.CanvasTexture(signCanvas);
  // double-sided big sign on top
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.95),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }),
  );
  sign.position.set(0, 2.4, 0);
  t.add(sign);
  // small support posts under the sign
  for (const sx of [-1, 1]) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), matBlack,
    );
    post.position.set(sx, 2.1, 0);
    t.add(post);
  }

  // 4 wheels
  for (const [x, z] of [[-1.0, 1.4], [1.0, 1.4], [-1.0, -1.4], [1.0, -1.4]]) {
    const w = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.28, 16),
      new THREE.MeshLambertMaterial({ color: 0x222222 }),
    );
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.4, z);
    w.castShadow = true;
    t.add(w);
    // hubcap
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.30, 12),
      new THREE.MeshLambertMaterial({ color: 0xe0e0e0 }),
    );
    hub.rotation.z = Math.PI / 2;
    hub.position.set(x, 0.4, z);
    t.add(hub);
  }

  // Headlights
  for (const sx of [-0.7, 0.7]) {
    const h = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xfff59d }),
    );
    h.position.set(sx, 0.8, 2.35);
    h.scale.set(1, 1, 0.5);
    t.add(h);
  }

  // Vendor: a chef sheep standing next to the service window
  const vendor = createSheep(0xfff59d); // yellow bow under hat
  // Add chef hat
  const hat = new THREE.Group();
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.16, 0.25, 12),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
  );
  cap.position.y = 0.13;
  hat.add(cap);
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 8),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
  );
  top.position.y = 0.32;
  top.scale.y = 0.7;
  hat.add(top);
  hat.position.set(0, 0.92, 0.45);
  vendor.add(hat);

  return { truck: t, vendor };
}
