// Third-person chase camera with mouse / touch / wheel control.

import { camera, renderer } from './setup.js';

export const camOffset = { yaw: 0, pitch: 0, distMult: 1 };

let mouseDown = false, lastMx = 0, lastMy = 0;
renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
renderer.domElement.addEventListener('mousedown', (e) => {
  if (e.button === 0 || e.button === 2) {
    mouseDown = true; lastMx = e.clientX; lastMy = e.clientY;
  }
});
window.addEventListener('mouseup', () => { mouseDown = false; });
window.addEventListener('mousemove', (e) => {
  if (!mouseDown) return;
  const dx = e.clientX - lastMx;
  const dy = e.clientY - lastMy;
  lastMx = e.clientX; lastMy = e.clientY;
  camOffset.yaw += dx * 0.006;
  camOffset.pitch = Math.max(-0.4, Math.min(0.8, camOffset.pitch + dy * 0.005));
});
renderer.domElement.addEventListener('wheel', (e) => {
  camOffset.distMult *= e.deltaY > 0 ? 1.1 : 0.9;
  camOffset.distMult = Math.max(0.4, Math.min(2.5, camOffset.distMult));
  e.preventDefault();
}, { passive: false });

// Touch fallback (1-finger drag)
let touchDown = false, lastTx = 0, lastTy = 0;
renderer.domElement.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    touchDown = true; lastTx = e.touches[0].clientX; lastTy = e.touches[0].clientY;
  }
});
renderer.domElement.addEventListener('touchmove', (e) => {
  if (!touchDown || e.touches.length !== 1) return;
  const dx = e.touches[0].clientX - lastTx;
  const dy = e.touches[0].clientY - lastTy;
  lastTx = e.touches[0].clientX; lastTy = e.touches[0].clientY;
  camOffset.yaw += dx * 0.006;
  camOffset.pitch = Math.max(-0.4, Math.min(0.8, camOffset.pitch + dy * 0.005));
});
renderer.domElement.addEventListener('touchend', () => { touchDown = false; });

export function resetCameraOffset() {
  camOffset.yaw = 0;
  camOffset.pitch = 0;
  camOffset.distMult = 1;
}

// Apply chase camera follow with current offsets.
export function applyCameraFollow(rig, params, heading) {
  const yaw = heading + camOffset.yaw;
  const pitch = camOffset.pitch;
  const baseDist = params.camDist * camOffset.distMult;
  const horizontalDist = baseDist * Math.cos(pitch);
  const camX = rig.position.x - Math.sin(yaw) * horizontalDist;
  const camZ = rig.position.z - Math.cos(yaw) * horizontalDist;
  const camY = Math.max(0.5, rig.position.y + params.camHeight + baseDist * Math.sin(pitch));
  camera.position.x += (camX - camera.position.x) * 0.12;
  camera.position.y += (camY - camera.position.y) * 0.12;
  camera.position.z += (camZ - camera.position.z) * 0.12;
  camera.lookAt(rig.position.x, rig.position.y + params.lookAtY, rig.position.z);
}
