// Entry point: wires everything together and runs the main loop.
//
// Heavy lifting lives in dedicated modules:
//   camera.js   - chase camera with mouse/touch/wheel control
//   daynight.js - sun, moon, stars, sky/fog tween over a 2-min day
//   weather.js  - rain particles + rainbow that follows
//   seasons.js  - season cycle (spring/summer/autumn/winter), snowman toggle
//   world.js    - environment + animated decor (balloon, train, ducks, bus,
//                 birthday party) wrapped in updateWorldAnimations(dt)
//   mount.js    - mount/dismount logic, character/vehicle seat layout
//   input.js    - keyboard with edge-triggered helpers
//
// This file only owns: vehicle/character physics, mode-specific animations,
// puddle/jump mechanics, food eating, the enterable-buildings logic, and the
// contextual hint. Everything else is delegated.

import * as THREE from 'three';

import { scene, camera, renderer } from './setup.js';
import './world.js'; // side-effect: populates the environment

import { state }            from './state.js';
import { keys, wasJustPressed, clearJustPressed } from './input.js';
import { ui, updateTitle, setHint, setExhibit, setPizzaCount, setIceCreamCount, setPuddleCount } from './ui.js';
import { physics, applyCollisions, colliders } from './physics.js';
import { puddles, clouds, npcs as outdoorNpcs, updateWorldAnimations } from './world.js';
import * as audio           from './audio.js';
import {
  mount, dismount, activeChar, activeRig, activeMode, tryMountNearby, refreshAllSeats,
} from './mount.js';
import { applyCameraFollow, resetCameraOffset } from './camera.js';
import { updateDayNight }   from './daynight.js';
import { toggleRain, updateWeather } from './weather.js';
import { updateSeason }     from './seasons.js';
import { joystick }         from './touch.js';

import { createPeppa }                         from './actors/peppa.js';
import { createPapa }                          from './actors/papa.js';
import { createBike }                          from './actors/bike.js';
import { createCar }                           from './actors/car.js';
import { createPizza }                         from './actors/pizza.js';
import { createFoodTruck }                     from './actors/foodtruck.js';
import { createIceCreamStand, createIceCream } from './actors/icecreamstand.js';
import { createHouse }                         from './buildings/house.js';
import { createSchool }                        from './buildings/school.js';
import { createMuseum }                        from './buildings/museum.js';
import { createHotel }                         from './buildings/hotel.js';

// ============================================================
// Build characters, vehicles, buildings
// ============================================================
state.peppa = createPeppa();
state.papa  = createPapa();
state.bike  = createBike();
state.car   = createCar();
scene.add(state.peppa, state.papa, state.bike, state.car);

state.house  = createHouse(-15, -90); scene.add(state.house);
state.school = createSchool(15, 95);  scene.add(state.school);
state.museum = createMuseum(-12, 35); scene.add(state.museum);
state.hotel  = createHotel(25, 50);   scene.add(state.hotel);

const enterables = [state.house, state.museum, state.school, state.hotel];
const allNpcs = [...outdoorNpcs];
for (const b of enterables) allNpcs.push(...(b.userData.npcs || []));

// Food truck + chef vendor
{
  const { truck, vendor } = createFoodTruck();
  truck.position.set(12, 0, -20);
  truck.rotation.y = Math.PI;
  scene.add(truck);
  state.foodTruck = truck;
  vendor.position.set(10.4, 0, -20);
  vendor.rotation.y = -Math.PI / 2;
  scene.add(vendor);
  allNpcs.push(vendor);
  colliders.push({ minX: 10.75, maxX: 13.25, minZ: -22, maxZ: -18 });
}

// Ice cream stand
{
  const stand = createIceCreamStand();
  stand.position.set(-5, 0, 75);
  stand.rotation.y = Math.PI / 2;
  scene.add(stand);
  state.iceCreamStand = stand;
  colliders.push({ minX: -5.8, maxX: -4.2, minZ: 73.7, maxZ: 76.3 });
}

// Initial vehicle placement and mounting
state.bike.position.set(0, 0, -78); state.bike.rotation.y = 0;
state.car.position.set(3.5, 0, -80); state.car.rotation.y = 0;
mount('peppa', state.bike);
mount('papa',  state.car);

camera.position.set(0, 4, -85);
camera.lookAt(0, 1, -78);

// ============================================================
// Start overlay (audio context resumes on the first user click)
// ============================================================
ui.startOverlay.querySelectorAll('.choice').forEach(btn => {
  btn.addEventListener('click', () => {
    audio.resumeAudio();
    audio.startMusic();
    state.currentChar = btn.dataset.vehicle;
    state.heading = activeRig().rotation.y;
    state.speed = 0;
    updateTitle(state.currentChar, activeMode());
    ui.startOverlay.style.display = 'none';
  });
});

// ============================================================
// Helpers
// ============================================================
function nearestFoodSource() {
  if (activeMode() !== 'foot') return null;
  const ch = activeChar();
  let best = null, bestD = 25;
  for (const [src, type] of [[state.foodTruck, 'pizza'], [state.iceCreamStand, 'icecream']]) {
    if (!src) continue;
    const dx = src.position.x - ch.position.x;
    const dz = src.position.z - ch.position.z;
    const d = dx * dx + dz * dz;
    if (d < bestD) { bestD = d; best = type; }
  }
  return best;
}

function tryEat() {
  const type = nearestFoodSource();
  if (!type) return;
  const ch = activeChar();
  if (state.foodMesh && state.foodMesh.parent) {
    state.foodMesh.parent.remove(state.foodMesh);
  }
  state.foodMesh = type === 'pizza' ? createPizza() : createIceCream();
  state.foodMesh.position.set(0, 1.4, 0.35);
  ch.add(state.foodMesh);
  state.foodTimer = 2.5;
  if (type === 'pizza') {
    state.pizzasEaten++;
    setPizzaCount(state.pizzasEaten);
  } else {
    state.icecreamsEaten++;
    setIceCreamCount(state.icecreamsEaten);
  }
  audio.playEat();
}

function spawnSplashParticles(x, z) {
  const g = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const ang = (i / 7) * Math.PI * 2 + Math.random() * 0.4;
    const drop = new THREE.Mesh(
      new THREE.SphereGeometry(0.08 + Math.random() * 0.06, 6, 5),
      new THREE.MeshLambertMaterial({ color: 0x6d4c41, transparent: true, opacity: 1 }),
    );
    drop.position.set(0, 0.2, 0);
    drop.userData.vel = {
      x: Math.cos(ang) * (1.5 + Math.random()),
      y: 2 + Math.random() * 1.8,
      z: Math.sin(ang) * (1.5 + Math.random()),
    };
    drop.userData.life = 1.0;
    g.add(drop);
  }
  g.position.set(x, 0, z);
  scene.add(g);
  state.splashes.push(g);
}

function animatePedal(ch, phase) {
  ch.userData.legL.rotation.x = Math.sin(phase) * 0.45;
  ch.userData.legR.rotation.x = Math.sin(phase + Math.PI) * 0.45;
}

// ============================================================
// Edge-triggered keys (one-shot actions)
// ============================================================
function checkEdges() {
  if (wasJustPressed('Space')) {
    const m = activeMode();
    if (m === 'bike')      { audio.playBell(); state.bellAnim = 1; }
    else if (m === 'car')  { audio.playHonk(); state.bellAnim = 1; }
    else if (state.jumpY === 0) { state.jumpVel = 4; audio.playJump(); }
  }
  if (wasJustPressed('KeyF')) {
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
  if (wasJustPressed('KeyC')) {
    state.currentChar = state.currentChar === 'peppa' ? 'papa' : 'peppa';
    refreshAllSeats(); // swap seats if both are in the same car
    state.heading = activeRig().rotation.y;
    state.speed = 0;
    updateTitle(state.currentChar, activeMode());
  }
  if (wasJustPressed('KeyE')) tryEat();
  if (wasJustPressed('KeyM')) audio.toggleMusic();
  if (wasJustPressed('KeyR')) resetCameraOffset();
  if (wasJustPressed('KeyP')) toggleRain();
}

// ============================================================
// Main loop
// ============================================================
const clock  = new THREE.Clock();
const tmpVec = new THREE.Vector3();
let wasInAir = false;

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  checkEdges();

  const params = physics[activeMode()];
  const rig    = activeRig();
  const mode   = activeMode();

  // ---- combined keyboard + joystick movement input ----
  const fwd   = keys['ArrowUp']    || keys['KeyW'] || keys['KeyZ'] || joystick.y >  0.3;
  const back  = keys['ArrowDown']  || keys['KeyS']                 || joystick.y < -0.3;
  const left  = keys['ArrowLeft']  || keys['KeyA'] || keys['KeyQ'] || joystick.x < -0.3;
  const right = keys['ArrowRight'] || keys['KeyD']                 || joystick.x >  0.3;

  // ---- throttle ----
  let throttling = false;
  if (fwd)  { state.speed = Math.min(state.speed + params.accel * dt,  params.maxSpeed); throttling = true; }
  if (back) { state.speed = Math.max(state.speed - params.accel * dt, -params.maxSpeed * 0.5); throttling = true; }
  if (!throttling) {
    if (state.speed > 0) state.speed = Math.max(0, state.speed - params.friction * dt);
    else                 state.speed = Math.min(0, state.speed + params.friction * dt);
  }

  // ---- turn ----
  let steerInput = 0;
  if (mode === 'foot') {
    if (left)  { state.heading += params.turn * dt; steerInput = -1; }
    if (right) { state.heading -= params.turn * dt; steerInput =  1; }
  } else if (Math.abs(state.speed) > 0.05) {
    const dir = state.speed >= 0 ? 1 : -1;
    if (left)  { state.heading += params.turn * dt * dir; steerInput = -1; }
    if (right) { state.heading -= params.turn * dt * dir; steerInput =  1; }
  } else {
    if (left)  steerInput = -1;
    if (right) steerInput =  1;
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
    } else state.bike.userData.bell.rotation.z = 0;
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

  // ---- food in hand ----
  if (state.foodTimer > 0) {
    state.foodTimer -= dt;
    if (state.foodMesh) {
      const k = Math.max(0, state.foodTimer / 2.5);
      state.foodMesh.scale.setScalar(0.1 + k * 0.9);
      state.foodMesh.rotation.y += dt * 2;
    }
    if (state.foodTimer <= 0 && state.foodMesh && state.foodMesh.parent) {
      state.foodMesh.parent.remove(state.foodMesh);
      state.foodMesh = null;
    }
  }

  // ---- puddle splash + puddle jump detection ----
  let inPuddle = false, puddlePos = null;
  for (const p of puddles) {
    const dx = rig.position.x - p.x, dz = rig.position.z - p.z;
    if (dx * dx + dz * dz < (p.size + 0.4) * (p.size + 0.4)) {
      inPuddle = true; puddlePos = p; break;
    }
  }
  if (inPuddle && !state.lastInPuddle && Math.abs(state.speed) > 1.5) audio.playSplash();
  const justLanded = wasInAir && state.jumpY === 0;
  if (justLanded && inPuddle && mode === 'foot') {
    state.puddleJumps++;
    setPuddleCount(state.puddleJumps);
    audio.playBigSplash();
    spawnSplashParticles(puddlePos.x, puddlePos.z);
  }
  wasInAir = mode === 'foot' && state.jumpY > 0;
  state.lastInPuddle = inPuddle;

  // ---- splash particle physics ----
  for (let i = state.splashes.length - 1; i >= 0; i--) {
    const grp = state.splashes[i];
    let allDead = true;
    for (const drop of grp.children) {
      drop.userData.vel.y -= 9 * dt;
      drop.position.x += drop.userData.vel.x * dt;
      drop.position.y += drop.userData.vel.y * dt;
      drop.position.z += drop.userData.vel.z * dt;
      drop.userData.life -= dt * 1.4;
      drop.material.opacity = Math.max(0, drop.userData.life);
      if (drop.userData.life > 0) allDead = false;
    }
    if (allDead) { scene.remove(grp); state.splashes.splice(i, 1); }
  }

  // ---- ambient world updates (delegated) ----
  updateWorldAnimations(dt);
  updateDayNight(dt);
  updateWeather(dt, rig.position);
  updateSeason(dt);

  // ---- clouds drift ----
  for (const c of clouds) {
    c.position.x += dt * 0.6;
    if (c.position.x > 160) c.position.x = -160;
  }

  // ---- NPCs face the player ----
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
  if (state.school.userData.carousel) {
    state.school.userData.carousel.rotation.y += dt * 0.5;
  }

  // ---- enterable buildings: roof toggle, door swing, exhibit panel ----
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

    const entranceZ = c.z + c.doorOffsetZ;
    const distToEntrance = Math.hypot(rig.position.x - c.x, rig.position.z - entranceZ);
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
  // Outdoor labelled NPCs (Granny, Grandpa, Mr Bull, snowman in winter…)
  if (!anyInside) {
    for (const f of outdoorNpcs) {
      if (!f.userData.label || !f.visible) continue;
      f.getWorldPosition(tmpVec);
      const dx = rig.position.x - tmpVec.x, dz = rig.position.z - tmpVec.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      if (d < (f.userData.zoneRadius || 3) && d < nearestExDist) {
        nearestExDist = d; nearestExhibit = f;
      }
    }
  }
  setExhibit(nearestExhibit ? nearestExhibit.userData.label : null);

  // ---- contextual hint ----
  let hintText = '';
  if (mode === 'foot') {
    if (state.foodTruck) {
      const dx = state.foodTruck.position.x - rig.position.x;
      const dz = state.foodTruck.position.z - rig.position.z;
      if (dx * dx + dz * dz < 25) hintText = `Appuie sur <span class="key">E</span> pour prendre une pizza 🍕`;
    }
    if (!hintText && state.iceCreamStand) {
      const dx = state.iceCreamStand.position.x - rig.position.x;
      const dz = state.iceCreamStand.position.z - rig.position.z;
      if (dx * dx + dz * dz < 25) hintText = `Appuie sur <span class="key">E</span> pour prendre une glace 🍦`;
    }
    if (!hintText) {
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
        if (nearestVehicle === state.bike) what = 'le vélo 🚲';
        else if (state.mounts[otherChar] === state.car) {
          const otherName = otherChar === 'peppa' ? 'Peppa' : 'Papa';
          what = `la voiture 🚗 avec ${otherName}`;
        } else what = 'la voiture 🚗';
        hintText = `Appuie sur <span class="key">F</span> pour monter dans ${what}`;
      } else if (nearestEntranceDist < 5 && !anyInside) {
        hintText = `Entre par la porte 🚪`;
      }
    }
  } else if (nearestEntranceDist < 7 && !anyInside) {
    hintText = `<span class="key">F</span> pour descendre et entrer 🚪`;
  }
  setHint(hintText);

  // ---- camera ----
  applyCameraFollow(rig, params, state.heading);

  renderer.render(scene, camera);
  clearJustPressed();
  requestAnimationFrame(tick);
}

tick();
