// Collision system + per-mode physics parameters.

// Axis-aligned bounding boxes in the XZ plane. Building modules push their
// bounds into this array at construction time.
export const colliders = [];

export const physics = {
  bike: { maxSpeed: 8,   accel: 9,  friction: 2.2, turn: 1.9, camDist: 6, camHeight: 3,   radius: 0.9, lookAtY: 1 },
  car:  { maxSpeed: 13,  accel: 10, friction: 2.0, turn: 1.5, camDist: 8, camHeight: 4,   radius: 1.5, lookAtY: 1 },
  foot: { maxSpeed: 3.2, accel: 12, friction: 8,   turn: 4.2, camDist: 4, camHeight: 2.4, radius: 0.4, lookAtY: 1 },
};

// Push the rig out of any collider it overlaps (circle vs AABB).
export function applyCollisions(rigPos, radius) {
  for (const b of colliders) {
    const cx = Math.max(b.minX, Math.min(rigPos.x, b.maxX));
    const cz = Math.max(b.minZ, Math.min(rigPos.z, b.maxZ));
    const dx = rigPos.x - cx, dz = rigPos.z - cz;
    const d2 = dx * dx + dz * dz;
    if (d2 < radius * radius) {
      if (d2 > 0.0001) {
        const d = Math.sqrt(d2);
        const push = radius - d;
        rigPos.x += (dx / d) * push;
        rigPos.z += (dz / d) * push;
      } else {
        // dead-center inside the box: push out via the nearest face
        const dxL = rigPos.x - b.minX, dxR = b.maxX - rigPos.x;
        const dzS = rigPos.z - b.minZ, dzN = b.maxZ - rigPos.z;
        const m = Math.min(dxL, dxR, dzS, dzN);
        if (m === dxL)      rigPos.x = b.minX - radius;
        else if (m === dxR) rigPos.x = b.maxX + radius;
        else if (m === dzS) rigPos.z = b.minZ - radius;
        else                rigPos.z = b.maxZ + radius;
      }
    }
  }
}
