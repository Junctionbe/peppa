import * as THREE from 'three';
import { makeTextSign } from '../setup.js';

export function createCar() {
  const car = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xe53935 });
  const bodyDk  = new THREE.MeshLambertMaterial({ color: 0xb71c1c });

  const lower = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 4.0), bodyMat);
  lower.position.y = 0.55; lower.castShadow = true; lower.receiveShadow = true; car.add(lower);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.18, 1.4), bodyMat);
  hood.position.set(0, 0.92, 1.2); hood.castShadow = true; car.add(hood);
  const trunk = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.18, 1.0), bodyMat);
  trunk.position.set(0, 0.92, -1.4); trunk.castShadow = true; car.add(trunk);
  const seatBack = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.65, 0.18), bodyMat);
  seatBack.position.set(0, 1.18, -0.85); car.add(seatBack);
  const dash = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.45, 0.18), bodyDk);
  dash.position.set(0, 1.07, 0.52); car.add(dash);
  for (const sx of [-1.04, 1.04]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.55, 1.6), bodyMat);
    side.position.set(sx, 1.13, -0.15); car.add(side);
  }

  const bumperMat = new THREE.MeshLambertMaterial({ color: 0x424242 });
  const fBumper = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.28, 0.2), bumperMat);
  fBumper.position.set(0, 0.42, 2.05); car.add(fBumper);
  const bBumper = fBumper.clone();
  bBumper.position.z = -2.05; car.add(bBumper);

  // headlights
  for (const sx of [-0.7, 0.7]) {
    const h = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xfff59d }),
    );
    h.position.set(sx, 0.7, 2.0); h.scale.set(1, 1, 0.5); car.add(h);
  }
  // brake lights
  for (const sx of [-0.7, 0.7]) {
    const b = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xff5252 }),
    );
    b.position.set(sx, 0.7, -2.0); b.scale.set(1, 0.7, 0.4); car.add(b);
  }

  // wheels
  function makeCarWheel(x, z) {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.38, z);
    const spinner = new THREE.Group(); pivot.add(spinner);
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.28, 18),
      new THREE.MeshLambertMaterial({ color: 0x222222 }),
    );
    tire.rotation.z = Math.PI / 2; tire.castShadow = true; spinner.add(tire);
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.30, 12),
      new THREE.MeshLambertMaterial({ color: 0xe0e0e0 }),
    );
    hub.rotation.z = Math.PI / 2; spinner.add(hub);
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.32, 0.05),
      new THREE.MeshLambertMaterial({ color: 0x666666 }),
    );
    marker.position.set(0, 0.05, 0); spinner.add(marker);
    pivot.userData.spinner = spinner;
    return pivot;
  }
  const wheels = [
    makeCarWheel(-1.05,  1.3), makeCarWheel( 1.05,  1.3),
    makeCarWheel(-1.05, -1.3), makeCarWheel( 1.05, -1.3),
  ];
  wheels.forEach(w => car.add(w));
  car.userData.wheels = wheels;

  // steering wheel
  const steerGroup = new THREE.Group();
  steerGroup.position.set(0, 1.18, 0.35);
  const sw = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.025, 6, 16),
    new THREE.MeshLambertMaterial({ color: 0x222222 }),
  );
  sw.rotation.x = -0.4; steerGroup.add(sw);
  car.add(steerGroup);
  car.userData.steeringWheel = steerGroup;

  // license plate
  const plate = makeTextSign('PEPA-1', 1.0, 0.3, '#ffffff', '#222222');
  plate.position.set(0, 0.55, -2.06); plate.rotation.y = Math.PI;
  car.add(plate);

  // horn
  const horn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.05, 12),
    new THREE.MeshLambertMaterial({ color: 0xe0e0e0 }),
  );
  horn.position.set(0, 1.01, 1.3);
  car.add(horn);

  return car;
}
