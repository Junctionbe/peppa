import * as THREE from 'three';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0xb3e0ff, 100, 280);

export const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

export const ambient = new THREE.AmbientLight(0xfff0d8, 0.7);
scene.add(ambient);
export const sun = new THREE.DirectionalLight(0xfff5d0, 1.0);
sun.position.set(40, 70, 30);
sun.castShadow = true;
sun.shadow.camera.left = -110; sun.shadow.camera.right = 110;
sun.shadow.camera.top = 110;   sun.shadow.camera.bottom = -110;
sun.shadow.camera.near = 1;    sun.shadow.camera.far = 230;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

// shared materials
export const matGrass    = new THREE.MeshLambertMaterial({ color: 0x6fc845 });
export const matRoad     = new THREE.MeshLambertMaterial({ color: 0xc4a576 });
export const matPink     = new THREE.MeshLambertMaterial({ color: 0xffb3c6 });
export const matRed      = new THREE.MeshLambertMaterial({ color: 0xe53935 });
export const matRedDk    = new THREE.MeshLambertMaterial({ color: 0xc62828 });
export const matBlack    = new THREE.MeshLambertMaterial({ color: 0x222222 });
export const matWhite    = new THREE.MeshLambertMaterial({ color: 0xffffff });
export const matBrown    = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
export const matLeaf     = new THREE.MeshLambertMaterial({ color: 0x43a047 });
export const matCloud    = new THREE.MeshLambertMaterial({ color: 0xffffff });
export const matMud      = new THREE.MeshLambertMaterial({ color: 0x6d4c41 });
export const matYellow   = new THREE.MeshLambertMaterial({ color: 0xffc107 });
export const matBlue     = new THREE.MeshLambertMaterial({ color: 0x42a5f5 });
export const matBlueDk   = new THREE.MeshLambertMaterial({ color: 0x1976d2 });
export const matOrange   = new THREE.MeshLambertMaterial({ color: 0xff9800 });
export const matRoof     = new THREE.MeshLambertMaterial({ color: 0x8b3a1c });
export const matWindow   = new THREE.MeshLambertMaterial({ color: 0xb3e5fc });
export const matCheek    = new THREE.MeshBasicMaterial   ({ color: 0xff6b8a });
export const matBeige    = new THREE.MeshLambertMaterial({ color: 0xe8dec0 });
export const matMarble   = new THREE.MeshLambertMaterial({ color: 0xb0b0b0 });
export const matBone     = new THREE.MeshLambertMaterial({ color: 0xeae0c8 });
export const matGold     = new THREE.MeshLambertMaterial({ color: 0xffd54f });

export function makeTextSign(text, w, h, bg = '#ffffff', fg = '#c62828') {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = fg; ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.fillStyle = fg;
  ctx.font = 'bold 80px "Comic Sans MS", cursive, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 6);
  const tex = new THREE.CanvasTexture(canvas);
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
}
