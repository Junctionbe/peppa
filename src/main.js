// Entry point: wires everything together and runs the main loop.

import * as THREE from 'three';

import { scene, camera, renderer, sun, ambient } from './setup.js';
import './world.js'; // side-effect: populates the environment

import { state }              from './state.js';
import { keys }               from './input.js';
import { ui, updateTitle, setHint, setExhibit, setPizzaCount, setIceCreamCount, setPuddleCount } from './ui.js';
import { physics, applyCollisions, colliders } from './physics.js';
import {
  puddles, clouds, npcs as outdoorNpcs, balloon, sunVisual, moonVisual, stars, train, party,
} from './world.js';
import * as audio             from './audio.js';
import {
  mount, dismount, activeChar, activeRig, activeMode, tryMountNearby, refreshAllSeats,
} from './mount.js';

import { createPeppa }                   from './actors/peppa.js';
import { createPapa }                    from './actors/papa.js';
import { createBike }                    from './actors/bike.js';
import { createCar }                     from './actors/car.js';
import { createPizza }                   from './actors/pizza.js';
import { createFoodTruck }               from './actors/foodtruck.js';
import { createIceCreamStand, createIceCream } from './actors/icecreamstand.js';
import { createHouse }                   from './buildings/house.js';
import { createSchool }                  from './buildings/school.js';
import { createMuseum }                  from './buildings/museum.js';
import { createHotel }                   from './buildings/hotel.js';

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
  vendor.position.set(10.4, 0, -20);
  vendor.rotation.y = -Math.PI / 2;
  scene.add(vendor);
  allNpcs.push(vendor);
  colliders.push({ minX: 10.75, maxX: 13.25, minZ: -22, maxZ: -18 });
}

// ---- Ice cream stand ----
{
  const stand = createIceCreamStand();
  stand.position.set(-5, 0, 75);
  stand.rotation.y = Math.PI / 2; // counter facing east (toward road)
  scene.add(stand);
  state.iceCreamStand = stand;
  // Collider (after rotation: depth becomes width)
  colliders.push({ minX: -5.8, maxX: -4.2, minZ: 73.7, maxZ: 76.3 });
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

// ---- Day/night cycle ----
const DAY_CYCLE_S = 120; // 2 minutes for a full day
let dayTime = 0.5;       // 0 = midnight, 0.5 = noon
const dayColor   = new THREE.Color(0x87ceeb);
const nightColor = new THREE.Color(0x1a2540);
const fogDayColor   = new THREE.Color(0xb3e0ff);
const fogNightColor = new THREE.Color(0x223150);
const tmpColor = new THREE.Color();

function updateDayNight(dt) {
  dayTime = (dayTime + dt / DAY_CYCLE_S) % 1;
  const angle = dayTime * Math.PI * 2 - Math.PI / 2;
  const elev  = Math.sin(angle);
  const dayness = Math.max(0, elev);
  // Sun (kept above horizon for shadow camera so shadows don't break)
  sun.position.set(40 * Math.cos(angle), Math.max(8, 70 * elev), 30);
  sun.intensity = dayness * 0.9;
  ambient.intensity = 0.25 + dayness * 0.55;
  const t = Math.pow((elev + 1) / 2, 0.7); // bias slightly toward day
  scene.background.copy(tmpColor.copy(nightColor).lerp(dayColor, t));
  scene.fog.color.copy(tmpColor.copy(fogNightColor).lerp(fogDayColor, t));
  // Sun visual
  sunVisual.position.x = 60 * Math.cos(angle);
  sunVisual.position.y = 80 * elev;
  sunVisual.visible = elev > -0.2;
  // Moon (opposite)
  moonVisual.position.x = -60 * Math.cos(angle);
  moonVisual.position.y = -80 * elev;
  moonVisual.visible = elev < 0.2;
  // Stars
  stars.visible = elev < 0.1;
}

// ---- Train animation ----
function updateTrain(dt) {
  train.userData.angle -= dt * 0.35; // counterclockwise (when viewed from above)
  const a = train.userData.angle;
  const r = train.userData.radius;
  const c = train.userData.center;
  train.position.x = c.x + Math.cos(a) * r;
  train.position.z = c.z + Math.sin(a) * r;
  train.rotation.y = Math.PI - a;
  // animated steam
  const s = train.userData.smoke;
  if (s) {
    s.scale.setScalar(0.7 + Math.sin(performance.now() * 0.005) * 0.25);
    s.material.opacity = 0.35 + Math.sin(performance.now() * 0.005) * 0.3;
  }
}

// ---- Rain ----
const rainGroup = new THREE.Group();
const rainMat = new THREE.MeshBasicMaterial({ color: 0xa3d8f7, transparent: true, opacity: 0.6 });
const dropGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4);
for (let i = 0; i < 80; i++) {
  const drop = new THREE.Mesh(dropGeo, rainMat);
  drop.position.set(
    (Math.random() - 0.5) * 30,
    Math.random() * 15 + 5,
    (Math.random() - 0.5) * 30,
  );
  rainGroup.add(drop);
}
rainGroup.visible = false;
scene.add(rainGroup);
let rainOn = false;

function updateRain(dt, rig) {
  if (!rainOn) return;
  rainGroup.position.x = rig.position.x;
  rainGroup.position.z = rig.position.z;
  for (const drop of rainGroup.children) {
    drop.position.y -= 18 * dt;
    if (drop.position.y < 0) {
      drop.position.y = 15 + Math.random() * 5;
      drop.position.x = (Math.random() - 0.5) * 30;
      drop.position.z = (Math.random() - 0.5) * 30;
    }
  }
}

// ---- Camera control (mouse drag + wheel + R to recenter) ----
const camOffset = { yaw: 0, pitch: 0, distMult: 1 };
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
// Touch fallback for tablets
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

// ---- Start overlay ----
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

// ---- Edge-triggered key handling ----
let lastF = false, lastC = false, lastSpace = false, lastE = false, lastM = false, lastR = false, lastP = false;

// Returns 'pizza' | 'icecream' | null based on the closest food source
// within 5m of the active character on foot.
function nearestFoodSource() {
  if (activeMode() !== 'foot') return null;
  const ch = activeChar();
  let best = null, bestD = 25;
  if (state.foodTruck) {
    const dx = state.foodTruck.position.x - ch.position.x;
    const dz = state.foodTruck.position.z - ch.position.z;
    const d = dx * dx + dz * dz;
    if (d < bestD) { bestD = d; best = 'pizza'; }
  }
  if (state.iceCreamStand) {
    const dx = state.iceCreamStand.position.x - ch.position.x;
    const dz = state.iceCreamStand.position.z - ch.position.z;
    const d = dx * dx + dz * dz;
    if (d < bestD) { bestD = d; best = 'icecream'; }
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

  if (keys['KeyE'] && !lastE) tryEat();
  lastE = !!keys['KeyE'];

  if (keys['KeyM'] && !lastM) audio.toggleMusic();
  lastM = !!keys['KeyM'];

  if (keys['KeyR'] && !lastR) {
    camOffset.yaw = 0;
    camOffset.pitch = 0;
    camOffset.distMult = 1;
  }
  lastR = !!keys['KeyR'];

  if (keys['KeyP'] && !lastP) {
    rainOn = !rainOn;
    rainGroup.visible = rainOn;
  }
  lastP = !!keys['KeyP'];
}

function animatePedal(ch, phase) {
  ch.userData.legL.rotation.x = Math.sin(phase) * 0.45;
  ch.userData.legR.rotation.x = Math.sin(phase + Math.PI) * 0.45;
}

// ---- Main loop ----
const clock = new THREE.Clock();
const tmpVec = new THREE.Vector3();
let wasInAir = false; // tracks previous-frame jump state for puddle-jump detection

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

  // ---- food eating animation (pizza or ice cream) ----
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

  // ---- puddle splash ----
  let inPuddle = false;
  let puddlePos = null;
  for (const p of puddles) {
    const dx = rig.position.x - p.x, dz = rig.position.z - p.z;
    if (dx * dx + dz * dz < (p.size + 0.4) * (p.size + 0.4)) {
      inPuddle = true; puddlePos = p; break;
    }
  }
  if (inPuddle && !state.lastInPuddle && Math.abs(state.speed) > 1.5) audio.playSplash();
  // Puddle JUMP: just landed in/on a puddle while on foot ⇒ big splash + counter
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

  // ---- balloon drift ----
  balloon.position.x += dt * 1.4;
  balloon.position.y = 28 + Math.sin(performance.now() * 0.0006) * 1.5;
  if (balloon.position.x > 110) balloon.position.x = -110;

  // ---- day/night cycle ----
  updateDayNight(dt);

  // ---- train ----
  updateTrain(dt);

  // ---- rain ----
  updateRain(dt, rig);

  // ---- party balloons + flames ----
  for (const b of party.userData.balloons) {
    const wave = Math.sin(performance.now() * 0.001 + b.userData.phase) * 0.25;
    b.position.y = b.userData.baseY + wave;
    b.userData.string.position.y = b.position.y - 0.85;
  }
  for (const f of party.userData.flames) {
    f.scale.setScalar(0.85 + Math.sin(performance.now() * 0.012 + f.position.x * 100) * 0.25);
  }

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
  if (state.school.userData.carousel) {
    state.school.userData.carousel.rotation.y += dt * 0.5;
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
  // Outdoor labelled NPCs (Granny in garden, Grandpa in boat, etc.)
  if (!anyInside) {
    for (const f of outdoorNpcs) {
      if (!f.userData.label) continue;
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

  // ---- camera follow (with mouse-controlled yaw/pitch/zoom offsets) ----
  const yaw = state.heading + camOffset.yaw;
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

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

tick();
