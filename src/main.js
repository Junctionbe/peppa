// Entry point: wires everything together and runs the main loop.

import * as THREE from 'three';

import { scene, camera, renderer } from './setup.js';
import './world.js'; // side-effect: populates the environment

import { state }              from './state.js';
import { keys }               from './input.js';
import { ui, updateTitle, setHint, setExhibit, setPizzaCount } from './ui.js';
import { physics, applyCollisions, colliders } from './physics.js';
import { puddles, clouds, npcs as outdoorNpcs } from './world.js';
import * as audio             from './audio.js';
import {
  mount, dismount, activeChar, activeRig, activeMode, tryMountNearby, refreshAllSeats,
} from './mount.js';

import { createPeppa }     from './actors/peppa.js';
import { createPapa }      from './actors/papa.js';
import { createBike }      from './actors/bike.js';
import { createCar }       from './actors/car.js';
import { createPizza }     from './actors/pizza.js';
import { createFoodTruck } from './actors/foodtruck.js';
import { createHouse }     from './buildings/house.js';
import { createSchool }    from './buildings/school.js';
import { createMuseum }    from './buildings/museum.js';
import { createHotel }     from './buildings/hotel.js';

// ---- Build characters and vehicles ----
state.peppa = createPeppa();
state.papa  = createPapa();
state.bike  = createBike();
state.car   = createCar();
scene.add(state.peppa, state.papa, state.bike, state.car);

// ---- Build buildings ----
state.house  = createHouse(-15, -90); scene.add(state.house);
state.school = createSchool(15, 95);  scene.add(state.school);
state.museum = createMuseum(-12, 35); scene.add(state.museum);
state.hotel  = createHotel(25, 50);   scene.add(state.hotel);

// All buildings the player can enter (hollow with door + roof + exhibits)
const enterables = [state.house, state.museum, state.school, state.hotel];

// All NPCs (used for look-at-player). Includes outdoor friends + indoor characters.
const allNpcs = [...outdoorNpcs];
for (const b of enterables) {
  allNpcs.push(...(b.userData.npcs || []));
}

// ---- Food truck + vendor ----
{
  const { truck, vendor } = createFoodTruck();
  truck.position.set(12, 0, -20);
  truck.rotation.y = Math.PI;             // service window faces west (toward road)
  scene.add(truck);
  state.foodTruck = truck;
  // Vendor sheep on the road-side of the truck
  vendor.position.set(10.4, 0, -20);
  vendor.rotation.y = -Math.PI / 2;
  scene.add(vendor);
  allNpcs.push(vendor);
  // Collider so vehicles can't drive through the truck
  colliders.push({ minX: 10.75, maxX: 13.25, minZ: -22, maxZ: -18 });
}

// ---- Initial placement ----
state.bike.position.set(0, 0, -78);
state.bike.rotation.y = 0;
state.car.position.set(3.5, 0, -80);
state.car.rotation.y = 0;
mount('peppa', state.bike);
mount('papa',  state.car);

camera.position.set(0, 4, -85);
camera.lookAt(0, 1, -78);

// ---- Start overlay ----
ui.startOverlay.querySelectorAll('.choice').forEach(btn => {
  btn.addEventListener('click', () => {
    audio.resumeAudio();
    state.currentChar = btn.dataset.vehicle;
    state.heading = activeRig().rotation.y;
    state.speed = 0;
    updateTitle(state.currentChar, activeMode());
    ui.startOverlay.style.display = 'none';
  });
});

// ---- Edge-triggered key handling ----
let lastF = false, lastC = false, lastSpace = false, lastE = false;

function tryEatPizza() {
  if (activeMode() !== 'foot' || !state.foodTruck) return;
  const ch = activeChar();
  const dx = state.foodTruck.position.x - ch.position.x;
  const dz = state.foodTruck.position.z - ch.position.z;
  if (dx * dx + dz * dz > 25) return; // > 5m away
  // Drop any current pizza first
  if (state.pizzaMesh && state.pizzaMesh.parent) {
    state.pizzaMesh.parent.remove(state.pizzaMesh);
  }
  state.pizzaMesh = createPizza();
  state.pizzaMesh.position.set(0, 1.4, 0.35);
  ch.add(state.pizzaMesh);
  state.pizzaTimer = 2.5;
  state.pizzasEaten++;
  setPizzaCount(state.pizzasEaten);
  audio.playEat();
}

function checkEdges() {
  if (keys['Space'] && !lastSpace) {
    const m = activeMode();
    if (m === 'bike')      { audio.playBell(); state.bellAnim = 1; }
    else if (m === 'car')  { audio.playHonk(); state.bellAnim = 1; }
    else                   { if (state.jumpY === 0) { state.jumpVel = 4; audio.playJump(); } }
  }
  lastSpace = !!keys['Space'];

  if (keys['KeyF'] && !lastF) {
    if (state.mounts[state.currentChar]) {
      dismount(state.currentChar);
      state.heading = activeChar().rotation.y;
      state.speed = 0;
    } else {
      const v = tryMountNearby();
      if (v) { state.heading = v.rotation.y; state.speed = 0; }
    }
    updateTitle(state.currentChar, activeMode());
  }
  lastF = !!keys['KeyF'];

  if (keys['KeyC'] && !lastC) {
    state.currentChar = state.currentChar === 'peppa' ? 'papa' : 'peppa';
    // If both are in the same car, swap their seats so the new active
    // (driver) sits on the left and the previous one moves to passenger.
    refreshAllSeats();
    state.heading = activeRig().rotation.y;
    state.speed = 0;
    updateTitle(state.currentChar, activeMode());
  }
  lastC = !!keys['KeyC'];

  if (keys['KeyE'] && !lastE) tryEatPizza();
  lastE = !!keys['KeyE'];
}

function animatePedal(ch, phase) {
  ch.userData.legL.rotation.x = Math.sin(phase) * 0.45;
  ch.userData.legR.rotation.x = Math.sin(phase + Math.PI) * 0.45;
}

// ---- Main loop ----
const clock = new THREE.Clock();
const tmpVec = new THREE.Vector3();

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);

  checkEdges();

  const params = physics[activeMode()];
  const rig    = activeRig();
  const mode   = activeMode();

  // ---- throttle ----
  let throttling = false;
  if (keys['ArrowUp']   || keys['KeyW'] || keys['KeyZ']) {
    state.speed = Math.min(state.speed + params.accel * dt,  params.maxSpeed); throttling = true;
  }
  if (keys['ArrowDown'] || keys['KeyS']) {
    state.speed = Math.max(state.speed - params.accel * dt, -params.maxSpeed * 0.5); throttling = true;
  }
  if (!throttling) {
    if (state.speed > 0) state.speed = Math.max(0, state.speed - params.friction * dt);
    else                 state.speed = Math.min(0, state.speed + params.friction * dt);
  }

  // ---- turn ----
  let steerInput = 0;
  if (mode === 'foot') {
    if (keys['ArrowLeft']  || keys['KeyA'] || keys['KeyQ']) { state.heading += params.turn * dt; steerInput = -1; }
    if (keys['ArrowRight'] || keys['KeyD'])                 { state.heading -= params.turn * dt; steerInput =  1; }
  } else {
    if (Math.abs(state.speed) > 0.05) {
      const dir = state.speed >= 0 ? 1 : -1;
      if (keys['ArrowLeft']  || keys['KeyA'] || keys['KeyQ']) { state.heading += params.turn * dt * dir; steerInput = -1; }
      if (keys['ArrowRight'] || keys['KeyD'])                 { state.heading -= params.turn * dt * dir; steerInput =  1; }
    } else {
      if (keys['ArrowLeft']  || keys['KeyA'] || keys['KeyQ']) steerInput = -1;
      if (keys['ArrowRight'] || keys['KeyD'])                 steerInput =  1;
    }
  }

  // ---- move ----
  rig.rotation.y = state.heading;
  const fwdX = Math.sin(state.heading);
  const fwdZ = Math.cos(state.heading);
  rig.position.x += fwdX * state.speed * dt;
  rig.position.z += fwdZ * state.speed * dt;
  rig.position.x = Math.max(-95, Math.min(95, rig.position.x));
  rig.position.z = Math.max(-100, Math.min(115, rig.position.z));

  applyCollisions(rig.position, params.radius);

  // ---- jump (foot only) ----
  if (mode === 'foot') {
    state.jumpY  += state.jumpVel * dt;
    state.jumpVel -= 12 * dt;
    if (state.jumpY <= 0) { state.jumpY = 0; state.jumpVel = 0; }
    rig.position.y = state.jumpY;
  } else {
    rig.position.y = 0;
  }

  // ---- mode-specific animations ----
  if (mode === 'bike') {
    const wd = state.speed * dt / 0.4;
    state.bike.userData.frontWheel.userData.tire.rotation.z -= wd;
    state.bike.userData.frontWheel.userData.disk.rotation.z -= wd;
    state.bike.userData.backWheel.userData.tire.rotation.z  -= wd;
    state.bike.userData.backWheel.userData.disk.rotation.z  -= wd;

    state.pedalPhase += state.speed * dt * 2.2;
    if (state.mounts.peppa === state.bike) animatePedal(state.peppa, state.pedalPhase);
    if (state.mounts.papa  === state.bike) animatePedal(state.papa,  state.pedalPhase);

    if (state.bellAnim > 0) {
      state.bike.userData.bell.rotation.z = Math.sin(performance.now() * 0.05) * 0.5 * state.bellAnim;
      state.bellAnim = Math.max(0, state.bellAnim - dt * 2);
    } else {
      state.bike.userData.bell.rotation.z = 0;
    }
  } else if (mode === 'car') {
    const wd = state.speed * dt / 0.4;
    for (const w of state.car.userData.wheels) w.userData.spinner.rotation.x -= wd;
    const target = steerInput * 0.7;
    state.car.userData.steeringWheel.rotation.z += (target - state.car.userData.steeringWheel.rotation.z) * 0.2;
    if (state.bellAnim > 0) state.bellAnim = Math.max(0, state.bellAnim - dt * 2);
  } else {
    const ch = activeChar();
    state.walkPhase += Math.abs(state.speed) * dt * 3;
    const moving = Math.abs(state.speed) > 0.1 ? 1 : 0;
    const amp = 0.6 * Math.min(1, Math.abs(state.speed) / 1.5);
    ch.userData.legL.rotation.x = Math.sin(state.walkPhase) * amp;
    ch.userData.legR.rotation.x = Math.sin(state.walkPhase + Math.PI) * amp;
    ch.userData.armL.rotation.x = Math.sin(state.walkPhase + Math.PI) * amp * 0.7;
    ch.userData.armR.rotation.x = Math.sin(state.walkPhase) * amp * 0.7;
    if (state.jumpY === 0) {
      ch.position.y = Math.abs(Math.sin(state.walkPhase * 2)) * 0.04 * moving;
    }
  }

  // ---- pizza eating animation ----
  if (state.pizzaTimer > 0) {
    state.pizzaTimer -= dt;
    if (state.pizzaMesh) {
      const k = Math.max(0, state.pizzaTimer / 2.5);
      state.pizzaMesh.scale.setScalar(0.1 + k * 0.9);
      state.pizzaMesh.rotation.y += dt * 2;
    }
    if (state.pizzaTimer <= 0 && state.pizzaMesh && state.pizzaMesh.parent) {
      state.pizzaMesh.parent.remove(state.pizzaMesh);
      state.pizzaMesh = null;
    }
  }

  // ---- puddle splash ----
  let inPuddle = false;
  for (const p of puddles) {
    const dx = rig.position.x - p.x, dz = rig.position.z - p.z;
    if (dx * dx + dz * dz < (p.size + 0.4) * (p.size + 0.4)) { inPuddle = true; break; }
  }
  if (inPuddle && !state.lastInPuddle && Math.abs(state.speed) > 1.5) audio.playSplash();
  state.lastInPuddle = inPuddle;

  // ---- clouds drift ----
  for (const c of clouds) {
    c.position.x += dt * 0.6;
    if (c.position.x > 160) c.position.x = -160;
  }

  // ---- NPCs face the player when close (uses world coords) ----
  for (const f of allNpcs) {
    f.getWorldPosition(tmpVec);
    const dx = rig.position.x - tmpVec.x;
    const dz = rig.position.z - tmpVec.z;
    if (dx * dx + dz * dz < 600) {
      f.lookAt(rig.position.x, tmpVec.y, rig.position.z);
    }
  }
  if (state.school.userData.flag) {
    state.school.userData.flag.rotation.y = Math.sin(performance.now() * 0.003) * 0.25;
  }

  // ---- enterable buildings: roof toggle, door open, exhibit panel ----
  let nearestExhibit = null, nearestExDist = 999;
  let anyInside = false, nearestEntranceDist = 999;
  for (const b of enterables) {
    const c = b.userData.center;
    const inside = (
      rig.position.x > c.x - c.W / 2 + 0.5 && rig.position.x < c.x + c.W / 2 - 0.5 &&
      rig.position.z > c.z - c.D / 2 + 0.5 && rig.position.z < c.z + c.D / 2 - 0.5
    );
    b.userData.roof.visible = !inside;
    if (inside) anyInside = true;

    const entranceX = c.x;
    const entranceZ = c.z + c.doorOffsetZ;
    const distToEntrance = Math.hypot(rig.position.x - entranceX, rig.position.z - entranceZ);
    if (distToEntrance < nearestEntranceDist) nearestEntranceDist = distToEntrance;

    const wantOpen = (mode === 'foot' && distToEntrance < 4) || inside;
    const targetAng = wantOpen ? b.userData.doorOpenAngle : 0;
    b.userData.door.rotation.y += (targetAng - b.userData.door.rotation.y) * 0.12;

    if (inside) {
      for (const ex of (b.userData.exhibits || [])) {
        ex.getWorldPosition(tmpVec);
        const dx = rig.position.x - tmpVec.x, dz = rig.position.z - tmpVec.z;
        const d  = Math.sqrt(dx * dx + dz * dz);
        if (d < (ex.userData.zoneRadius || 3) && d < nearestExDist) {
          nearestExDist = d; nearestExhibit = ex;
        }
      }
    }
  }
  setExhibit(nearestExhibit ? nearestExhibit.userData.label : null);

  // ---- contextual hint ----
  let hintText = '';
  // Food-truck prompt has top priority on foot
  if (mode === 'foot' && state.foodTruck) {
    const ftDx = state.foodTruck.position.x - rig.position.x;
    const ftDz = state.foodTruck.position.z - rig.position.z;
    if (ftDx * ftDx + ftDz * ftDz < 25) {
      hintText = `Appuie sur <span class="key">E</span> pour prendre une pizza 🍕`;
    }
  }
  if (!hintText) {
    if (mode === 'foot') {
      const otherChar = state.currentChar === 'peppa' ? 'papa' : 'peppa';
      let nearestVehicle = null, nearestVD = 4;
      for (const v of [state.bike, state.car]) {
        if (state.mounts[state.currentChar] === v) continue;
        if (v === state.bike && state.mounts[otherChar] === v) continue;
        const d = Math.hypot(v.position.x - rig.position.x, v.position.z - rig.position.z);
        if (d < nearestVD) { nearestVD = d; nearestVehicle = v; }
      }
      if (nearestVehicle) {
        let what;
        if (nearestVehicle === state.bike) {
          what = 'le vélo 🚲';
        } else if (state.mounts[otherChar] === state.car) {
          const otherName = otherChar === 'peppa' ? 'Peppa' : 'Papa';
          what = `la voiture 🚗 avec ${otherName}`;
        } else {
          what = 'la voiture 🚗';
        }
        hintText = `Appuie sur <span class="key">F</span> pour monter dans ${what}`;
      } else if (nearestEntranceDist < 5 && !anyInside) {
        hintText = `Entre par la porte 🚪`;
      }
    } else {
      if (nearestEntranceDist < 7 && !anyInside) {
        hintText = `<span class="key">F</span> pour descendre et entrer 🚪`;
      }
    }
  }
  setHint(hintText);

  // ---- camera follow ----
  const camDist   = params.camDist;
  const camHeight = params.camHeight;
  const camX = rig.position.x - fwdX * camDist;
  const camZ = rig.position.z - fwdZ * camDist;
  camera.position.x += (camX - camera.position.x) * 0.1;
  camera.position.y += (rig.position.y + camHeight - camera.position.y) * 0.1;
  camera.position.z += (camZ - camera.position.z) * 0.1;
  camera.lookAt(rig.position.x, rig.position.y + params.lookAtY, rig.position.z);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

tick();
