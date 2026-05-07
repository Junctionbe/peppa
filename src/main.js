// Entry point: wires everything together and runs the main loop.

import * as THREE from 'three';

import { scene, camera, renderer } from './setup.js';
import './world.js'; // side-effect: populates the environment

import { state }              from './state.js';
import { keys }               from './input.js';
import { ui, showMessage, hideMessage, updateTitle, setHint, setExhibit, setDistance } from './ui.js';
import { physics, applyCollisions } from './physics.js';
import { puddles, clouds, friends } from './world.js';
import * as audio             from './audio.js';
import {
  mount, dismount, activeChar, activeRig, activeMode, tryMountNearby,
} from './mount.js';

import { createPeppa }   from './actors/peppa.js';
import { createPapa }    from './actors/papa.js';
import { createBike }    from './actors/bike.js';
import { createCar }     from './actors/car.js';
import { createHouse }   from './buildings/house.js';
import { createSchool }  from './buildings/school.js';
import { createMuseum }  from './buildings/museum.js';

// ---- Build characters and vehicles ----
state.peppa = createPeppa();
state.papa  = createPapa();
state.bike  = createBike();
state.car   = createCar();
scene.add(state.peppa, state.papa, state.bike, state.car);

// ---- Build buildings ----
const peppaHouse = createHouse(-15, -90); scene.add(peppaHouse);
state.school     = createSchool(15, 95);  scene.add(state.school);
state.museum     = createMuseum(-12, 35); scene.add(state.museum);

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
let lastF = false, lastC = false, lastR = false, lastSpace = false;

function checkEdges() {
  // SPACE
  if (keys['Space'] && !lastSpace) {
    const m = activeMode();
    if (m === 'bike')      { audio.playBell(); state.bellAnim = 1; }
    else if (m === 'car')  { audio.playHonk(); state.bellAnim = 1; }
    else                   { if (state.jumpY === 0) { state.jumpVel = 4; audio.playJump(); } }
  }
  lastSpace = !!keys['Space'];

  // F : mount / dismount
  if (keys['KeyF'] && !lastF) {
    if (!state.won) {
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
  }
  lastF = !!keys['KeyF'];

  // C : switch character
  if (keys['KeyC'] && !lastC) {
    if (!state.won) {
      state.currentChar = state.currentChar === 'peppa' ? 'papa' : 'peppa';
      state.heading = activeRig().rotation.y;
      state.speed = 0;
      updateTitle(state.currentChar, activeMode());
    }
  }
  lastC = !!keys['KeyC'];

  // R : restart (only after winning)
  if (keys['KeyR'] && !lastR) {
    if (state.won) {
      state.won = false;
      state.bike.position.set(0, 0, -78); state.bike.rotation.y = 0;
      state.car.position.set(3.5, 0, -80); state.car.rotation.y = 0;
      if (!state.mounts.peppa) mount('peppa', state.bike);
      if (!state.mounts.papa)  mount('papa',  state.car);
      state.speed = 0; state.heading = 0;
      hideMessage();
      updateTitle(state.currentChar, activeMode());
    }
  }
  lastR = !!keys['KeyR'];
}

// ---- Helpers ----
function animatePedal(ch, phase) {
  ch.userData.legL.rotation.x = Math.sin(phase) * 0.45;
  ch.userData.legR.rotation.x = Math.sin(phase + Math.PI) * 0.45;
}

// ---- Main loop ----
const clock = new THREE.Clock();
const SCHOOL_GOAL = { x: 15, z: 95 };

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
  rig.position.z = Math.max(-95, Math.min(115, rig.position.z));

  // collisions
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
    // foot: walk animation
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

  // ---- friends face the player ----
  for (const f of friends) {
    const dx = rig.position.x - f.position.x;
    const dz = rig.position.z - f.position.z;
    if (dx * dx + dz * dz < 600) {
      f.lookAt(rig.position.x, f.position.y, rig.position.z);
    }
  }
  if (state.school.userData.flag) {
    state.school.userData.flag.rotation.y = Math.sin(performance.now() * 0.003) * 0.25;
  }

  // ---- museum: roof + door + exhibits ----
  const M = state.museum.userData.center;
  const inMuseum = (
    rig.position.x > M.x - M.W / 2 + 0.5 && rig.position.x < M.x + M.W / 2 - 0.5 &&
    rig.position.z > M.z - M.D / 2 + 0.5 && rig.position.z < M.z + M.D / 2 - 0.5
  );
  state.museum.userData.roof.visible = !inMuseum;

  const distToEntrance = Math.hypot(rig.position.x - M.x, rig.position.z - (M.z - M.D / 2));
  const wantOpen = (mode === 'foot' && distToEntrance < 4) || inMuseum;
  const targetAng = wantOpen ? Math.PI / 2 * 0.95 : 0;
  state.museum.userData.door.rotation.y +=
    (targetAng - state.museum.userData.door.rotation.y) * 0.12;

  // exhibit panel
  let nearestExhibit = null, nearestExDist = 999;
  if (inMuseum) {
    const ep = new THREE.Vector3();
    for (const ex of state.museum.userData.exhibits) {
      ex.getWorldPosition(ep);
      const dx = rig.position.x - ep.x, dz = rig.position.z - ep.z;
      const d  = Math.sqrt(dx * dx + dz * dz);
      if (d < (ex.userData.zoneRadius || 3) && d < nearestExDist) {
        nearestExDist = d; nearestExhibit = ex;
      }
    }
  }
  setExhibit(nearestExhibit ? nearestExhibit.userData.label : null);

  // ---- contextual hint ----
  let hintText = '';
  if (mode === 'foot') {
    let nearestFreeV = null, nearestVD = 4;
    for (const v of [state.bike, state.car]) {
      if (state.mounts.peppa === v || state.mounts.papa === v) continue;
      const d = Math.hypot(v.position.x - rig.position.x, v.position.z - rig.position.z);
      if (d < nearestVD) { nearestVD = d; nearestFreeV = v; }
    }
    if (nearestFreeV) {
      const what = nearestFreeV === state.bike ? 'le vélo 🚲' : 'la voiture 🚗';
      hintText = `Appuie sur <span class="key">F</span> pour monter sur ${what}`;
    } else if (distToEntrance < 6 && !inMuseum) {
      hintText = `Entre dans le musée 🏛️`;
    }
  } else {
    if (distToEntrance < 8 && !inMuseum) {
      hintText = `<span class="key">F</span> pour descendre et entrer dans le musée 🏛️`;
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

  // ---- distance to school + win ----
  const dist = Math.round(Math.hypot(rig.position.x - SCHOOL_GOAL.x, rig.position.z - SCHOOL_GOAL.z));
  setDistance(dist);

  if (!state.won && dist < 9) {
    state.won = true;
    const who = state.currentChar === 'peppa' ? 'Peppa' : 'Papa Pig';
    showMessage(`🎉 Bravo ${who} ! 🎉`,
      "Tu es arrivé(e) à l'école !<br>Appuie sur <b>R</b> pour recommencer");
    audio.playWin();
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

tick();
