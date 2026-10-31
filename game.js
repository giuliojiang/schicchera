// Pure rules logic: no Three.js, no DOM, no audio imports.
// Movement core lives here. Combat/momentum resolution will join later
// with the boss, in this same file, still dependency-free.

// Quadratic charge fraction in [0,1]. Same function drives speed,
// squash, and charge tone (spec section 6).
export function chargeFraction(holdTime, fullChargeTime) {
  if (!(fullChargeTime > 0)) return 0;
  const t = Math.max(0, holdTime) / fullChargeTime;
  const q = t * t;
  return q > 1 ? 1 : q;
}

export function flickSpeed(holdTime, fullChargeTime, vmax) {
  return vmax * chargeFraction(holdTime, fullChargeTime);
}

// ADD velocity vectorially, preserve Y (spec section 6).
// dirX/dirZ must already be normalized horizontal forward.
export function applyFlickVelocity(vx, vy, vz, dirX, dirZ, speed) {
  return [vx + dirX * speed, vy, vz + dirZ * speed];
}

// Hard cap after any flick (spec section 7). Returns scaled [x,y,z].
export function clampSpeed(vx, vy, vz, vclamp) {
  const s2 = vx * vx + vy * vy + vz * vz;
  if (!(vclamp > 0) || s2 <= vclamp * vclamp) return [vx, vy, vz];
  const s = Math.sqrt(s2);
  const k = vclamp / s;
  return [vx * k, vy * k, vz * k];
}

// Zone lookup for fog color and debug info. Pure: rects passed in as data.
// Order matters: pass and arena are looked up before the village they border.
export function zoneOf(x, z, zones) {
  if (x >= zones.arena.x0 && x <= zones.arena.x1 && z >= zones.arena.z0 && z <= zones.arena.z1) {
    return 'arena';
  }
  if (x >= zones.pass.x0 && x <= zones.pass.x1 && z >= zones.pass.z0 && z <= zones.pass.z1) {
    return 'pass';
  }
  if (x >= zones.forest.x0 && x <= zones.forest.x1 && z >= zones.forest.z0 && z <= zones.forest.z1) {
    return 'forest';
  }
  if (x >= zones.beach.x0 && x <= zones.beach.x1 && z >= zones.beach.z0 && z <= zones.beach.z1) {
    return 'beach';
  }
  return 'village';
}

// Seeded RNG (mulberry32) for any future gameplay randomness.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
