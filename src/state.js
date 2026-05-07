// Central mutable state shared across modules.
// Object references (peppa, papa, bike, car, school, museum) are wired up by main.js
// after the factories build them.
export const state = {
  // motion
  speed: 0,
  heading: 0,
  pedalPhase: 0,
  walkPhase: 0,
  jumpY: 0,
  jumpVel: 0,
  bellAnim: 0,
  lastInPuddle: false,

  // game flags
  won: false,

  // who is active and where each character is mounted
  currentChar: 'peppa',           // 'peppa' | 'papa'
  mounts: { peppa: null, papa: null },  // each: null (on foot) | bike | car

  // pizza
  pizzasEaten: 0,
  pizzaTimer: 0,    // seconds remaining for the held pizza
  pizzaMesh: null,  // THREE mesh while a pizza is being held/eaten

  // wired by main.js
  peppa: null,
  papa: null,
  bike: null,
  car: null,
  school: null,
  museum: null,
  house: null,
  hotel: null,
  foodTruck: null,
};
