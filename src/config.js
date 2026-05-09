// Centralised positions and tunable constants. Replaces magic numbers
// scattered across world.js and main.js. Keep this file focused on values
// that have to be consistent between several modules — internal-only
// constants stay in their owning file.

export const POSITIONS = {
  startPos:      { x:   0, z: -78 },
  carPark:       { x: 3.5, z: -80 },

  house:         { x: -15, z: -90 },
  school:        { x:  15, z:  95 },
  museum:        { x: -12, z:  35 },
  hotel:         { x:  25, z:  50 },

  foodTruck:     { x:  12, z: -20 },
  iceCreamStand: { x:  -5, z:  75 },

  lake:          { x: -55, z:  10, radius: 8 },
  garden:        { x: -27, z: -77 },
  party:         { x: -29, z:  88 },
  trainTrack:    { x:  60, z:   0, radius: 22 },
  construction:  { x: -38, z: -55 },
  snowman:       { x: -21, z: -82 },
};

export const TIMINGS = {
  dayCycleSeconds:  120,  // full day = 2 minutes
  seasonSeconds:    90,   // each season = 1m30
  rainbowSeconds:   35,   // rainbow visible after rain
  foodHoldSeconds:  2.5,  // pizza/ice cream held in hand before disappearing
};

export const COUNTS = {
  treesTarget: 65,
  flowers:     240,
  cloudsCount: 9,
  rainDrops:   80,
  starsCount:  80,
};
