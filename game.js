// Pure rules logic: no Three.js, no DOM, no audio imports.
// Movement core, combat/momentum resolution, and the boss behavior cycle
// all live here, still dependency-free (spec section 14.8).

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

// Crater ring layout (issue #9). Pure: SEGMENTS box segments on a circle,
// each rotated to tangent; segments near the west gap are skipped; the two
// gap-edge angles place the mouth gate pillars. physics.js and level.js both
// call this, so colliders and visuals can never drift apart.
export function arenaRingLayout({ cx, cz, radius, segments, gapHalfWidth, segOverlap }) {
  const step = (Math.PI * 2) / segments;
  const gapCenter = Math.PI; // west, facing the pass
  const gapHalfAngle = Math.asin(Math.min(1, gapHalfWidth / radius));
  const segLen = 2 * radius * Math.sin(step / 2) * segOverlap;
  const norm = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const kept = [];
  for (let i = 0; i < segments; i++) {
    const a = i * step;
    if (Math.abs(norm(a - gapCenter)) < gapHalfAngle) continue;
    kept.push({
      angle: a,
      x: cx + radius * Math.cos(a),
      z: cz + radius * Math.sin(a),
      rotY: -(a + Math.PI / 2), // local X axis onto the tangent
      len: segLen,
    });
  }
  // Gap edges: the segment boundaries flanking the skipped run.
  const k = Math.round(gapCenter / step);
  const m = Math.floor(gapHalfAngle / step);
  const gapEdges = [(k - m - 0.5) * step, (k + m + 0.5) * step];
  return { kept, gapEdges, gapHalfAngle, segLen };
}

// Momentum magnitude p = m * |v| (spec section 10). Speed is the body's own
// full 3D speed, not relative velocity.
export function momentum(mass, vx, vy, vz) {
  return mass * Math.hypot(vx, vy, vz);
}

// Who deals exactly 1 HP on a player-boss touch (spec section 10).
// Returns 'player' | 'boss' | 'tie'. Charging is an explicit override:
// caught mid-charge, the player takes the hit regardless of momenta.
// tieEps turns "exactly equal" into something floats can reach: resting
// contact jitter must tie, while any deliberate tap still wins.
export function resolveCombat(playerP, bossP, charging, tieEps) {
  if (charging) return 'boss';
  if (Math.abs(playerP - bossP) <= tieEps) return 'tie';
  return playerP > bossP ? 'player' : 'boss';
}

// Boss behavior cycle (spec section 9): roam -> windup -> bump -> roam.
// Pure transition: returns the state for time-in-state t. 'dormant' never
// advances here; entering the arena flips it to 'roam' (spec section 3).
export function bossNext(state, t, { interval, windup, bumpTime }) {
  if (state === 'roam' && t >= interval) return 'windup';
  if (state === 'windup' && t >= windup) return 'bump';
  if (state === 'bump' && t >= bumpTime) return 'roam';
  return state;
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
