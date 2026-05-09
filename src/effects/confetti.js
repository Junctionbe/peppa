import * as THREE from 'three';
import { scene } from '../setup.js';

const COLORS = [0xff5252, 0xffeb3b, 0x4fc3f7, 0xab47bc, 0x66bb6a, 0xff9800, 0xff80ab];
const active = [];

// Spawn a burst of small colorful planes that fly upward and tumble down.
export function spawnConfetti(x, y, z, count = 30) {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const c = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, 0.12),
      new THREE.MeshBasicMaterial({
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
      }),
    );
    c.userData.vel = {
      x: (Math.random() - 0.5) * 6,
      y: 4 + Math.random() * 4,
      z: (Math.random() - 0.5) * 6,
    };
    c.userData.rotVel = (Math.random() - 0.5) * 12;
    c.userData.life = 2.5;
    g.add(c);
  }
  g.position.set(x, y, z);
  scene.add(g);
  active.push(g);
}

export function updateConfetti(dt) {
  for (let i = active.length - 1; i >= 0; i--) {
    const grp = active[i];
    let allDead = true;
    for (const p of grp.children) {
      p.userData.vel.y -= 8 * dt;
      p.position.x += p.userData.vel.x * dt;
      p.position.y += p.userData.vel.y * dt;
      p.position.z += p.userData.vel.z * dt;
      p.rotation.x += p.userData.rotVel * dt;
      p.rotation.y += p.userData.rotVel * dt * 0.7;
      p.userData.life -= dt;
      if      (p.userData.life > 1) p.material.opacity = 1;
      else if (p.userData.life > 0) p.material.opacity = p.userData.life;
      else                          p.material.opacity = 0;
      if (p.userData.life > 0) allDead = false;
    }
    if (allDead) {
      scene.remove(grp);
      active.splice(i, 1);
    }
  }
}
