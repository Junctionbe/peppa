import * as THREE from 'three';
import { matBlueDk, matBlack, matRedDk, matYellow } from '../setup.js';

export function createBike() {
  const bike = new THREE.Group();
  const frameMat = matBlueDk;
  const tireMat  = matBlack;
  const wheelGeo = new THREE.TorusGeometry(0.4, 0.08, 8, 22);

  function makeWheel(z) {
    const pivot = new THREE.Group();
    pivot.position.set(0, 0.4, z);
    pivot.rotation.y = Math.PI / 2;
    const tire = new THREE.Mesh(wheelGeo, tireMat); tire.castShadow = true;
    pivot.add(tire);
    const disk = new THREE.Mesh(
      new THREE.CircleGeometry(0.34, 12),
      new THREE.MeshLambertMaterial({ color: 0xd0d0d0, side: THREE.DoubleSide }),
    );
    pivot.add(disk);
    pivot.userData.tire = tire;
    pivot.userData.disk = disk;
    return pivot;
  }
  const fw = makeWheel( 0.7); bike.add(fw);
  const bw = makeWheel(-0.7); bike.add(bw);
  bike.userData.frontWheel = fw;
  bike.userData.backWheel  = bw;

  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8), frameMat);
  top.position.set(0, 0.7, 0); top.rotation.x = Math.PI / 2; top.castShadow = true; bike.add(top);
  const diag = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 8), frameMat);
  diag.position.set(0, 0.55, -0.05); diag.rotation.x = Math.PI / 2 + 0.5; bike.add(diag);

  const seatPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 6), frameMat);
  seatPost.position.set(0, 0.85, -0.4); bike.add(seatPost);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.38), matBlack);
  seat.position.set(0, 1.05, -0.4); seat.castShadow = true; bike.add(seat);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), frameMat);
  stem.position.set(0, 0.95, 0.55); bike.add(stem);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6), matBlack);
  bar.position.set(0, 1.2, 0.55); bar.rotation.z = Math.PI / 2; bike.add(bar);

  for (const sx of [-0.34, 0.34]) {
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 6), matRedDk);
    grip.position.set(sx, 1.2, 0.55); grip.rotation.z = Math.PI / 2; bike.add(grip);
  }

  const bellPivot = new THREE.Group();
  bellPivot.position.set(0.25, 1.25, 0.55);
  const bell = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    matYellow,
  );
  bell.castShadow = true; bellPivot.add(bell);
  bike.add(bellPivot); bike.userData.bell = bellPivot;

  const basket = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.3, 0.4),
    new THREE.MeshLambertMaterial({ color: 0xa1887f }),
  );
  basket.position.set(0, 1.0, 0.85); basket.castShadow = true; bike.add(basket);

  const crank = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.18, 8), matBlack);
  crank.position.set(0, 0.4, 0); crank.rotation.z = Math.PI / 2; bike.add(crank);

  return bike;
}
