// cannon-es world, player body, static level bodies, fixed-step accumulator.
import * as CANNON from 'cannon-es';
import {
  ARCH,
  ARENA_GAP_HALF_WIDTH,
  ARENA_GATE,
  ARENA_RING_H,
  ARENA_RING_R,
  ARENA_RING_SEGMENTS,
  ARENA_RING_T,
  ARENA_SEG_OVERLAP,
  ARENA_CENTER,
  BARRELS,
  BEACH_BASE_Y,
  BEACH_PARAPET_H,
  BEACH_PARAPET_T,
  BEACH_PARAPETS,
  BEACH_RAMP_THICK,
  BEACH_RAMPS,
  BEACH_SHELVES,
  BEACH_SLAB,
  BEACH_STONES,
  BENCHES,
  BOAT,
  BOSS_GROUND_DRAG,
  BRIDGE_CREST_H,
  BRIDGE_SPAN,
  BRIDGE_THICK,
  BRIDGES,
  BUSH_BIG,
  CART,
  CHANNEL_Z0,
  CHANNEL_Z1,
  CRATES,
  CUBE_MASS,
  FENCES,
  FIXED_DT,
  FOREST_BRIDGE,
  FOREST_BUSH_BIG,
  FOREST_LOGS,
  FOREST_MOSSY_ROCKS,
  FOREST_STONE_CIRCLE,
  FOREST_STONES,
  FOREST_STUMPS,
  GATES,
  GIANT_TREE,
  GRAVITY_Y,
  GROUND_FRICTION,
  GROUND_RESTITUTION,
  HILLS,
  HUT_BODY,
  HUTS,
  LANTERNS,
  PIER,
  PIER_PLATFORM,
  PLAYER_AIR_DRAG,
  PLAYER_ANGULAR_DAMPING,
  PLAYER_GROUND_DRAG,
  PLAYER_SIZE,
  PLAYER_SPAWN,
  ROCKS,
  SIGNS,
  STALL,
  TREES,
  TRUNK_RADIUS,
  WALLS,
  WELL,
  ZONE_ARENA,
  ZONE_FOREST,
  ZONE_PASS,
  ZONE_VILLAGE,
} from './constants.js';
import { arenaRingLayout } from './game.js';

export function createWorld() {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, GRAVITY_Y, 0) });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = false;
  world.defaultContactMaterial.friction = GROUND_FRICTION;
  world.defaultContactMaterial.restitution = GROUND_RESTITUTION;
  return world;
}

export function createPlayerBody(world) {
  const half = PLAYER_SIZE / 2;
  const body = new CANNON.Body({
    mass: CUBE_MASS,
    shape: new CANNON.Box(new CANNON.Vec3(half, half, half)),
    position: new CANNON.Vec3(PLAYER_SPAWN[0], PLAYER_SPAWN[1], PLAYER_SPAWN[2]),
    linearDamping: PLAYER_AIR_DRAG,
    angularDamping: PLAYER_ANGULAR_DAMPING,
  });
  // Compound-ready: weapons will append shapes/offsets here later.
  world.addBody(body);
  return body;
}

// Static level: 5 zone slabs, boundary walls, hills, bridges, hut bodies,
// tree trunks, rocks, stone arch. Visuals in level.js mirror every transform.
// Returns handles for contact classification (grounded = touching a ground body).
export function createStaticLevel(world) {
  const groundMat = new CANNON.Material('ground');
  const staticBodies = [];
  const groundBodies = new Set();

  function addBox(px, py, pz, sx, sy, sz, rotX = 0, rotY = 0, rotZ = 0, isGround = false) {
    const body = new CANNON.Body({
      mass: 0,
      material: groundMat,
      shape: new CANNON.Box(new CANNON.Vec3(sx / 2, sy / 2, sz / 2)),
      position: new CANNON.Vec3(px, py, pz),
    });
    if (rotX || rotY || rotZ) body.quaternion.setFromEuler(rotX, rotY, rotZ);
    world.addBody(body);
    staticBodies.push(body);
    if (isGround) groundBodies.add(body.id);
    return body;
  }

  function addSlab(zone, topY = 0) {
    const sx = zone.x1 - zone.x0;
    const sz = zone.z1 - zone.z0;
    return addBox((zone.x0 + zone.x1) / 2, topY - 0.5, (zone.z0 + zone.z1) / 2, sx, 1, sz, 0, 0, 0, true);
  }

  // Zone ground slabs (butt joints). The beach base sits low at BEACH_BASE_Y
  // and stops at the shore ridge; shelves rise from it toward the village.
  addSlab(ZONE_VILLAGE);
  addSlab(BEACH_SLAB, BEACH_BASE_Y);
  addSlab(ZONE_FOREST);
  addSlab(ZONE_PASS);
  addSlab(ZONE_ARENA);

  // Beach shelves: tall boxes rising from the base, tops are walkable ground,
  // sides are cliff faces. Full beach width in z.
  for (const [x0, x1, top] of BEACH_SHELVES) {
    const sx = x1 - x0;
    const sy = top - BEACH_BASE_Y;
    addBox((x0 + x1) / 2, (top + BEACH_BASE_Y) / 2, 0, sx, sy, 40, 0, 0, 0, true);
  }

  // Beach ramps: inclined boxes spanning each cliff. East end high (+X up).
  for (const [xE, xW, zC, w, tE, tW] of BEACH_RAMPS) {
    const run = xE - xW;
    const drop = tE - tW;
    const len = Math.hypot(run, drop);
    const ang = Math.atan2(drop, run);
    const topC = (tE + tW) / 2;
    addBox(
      (xE + xW) / 2,
      topC - (BEACH_RAMP_THICK / 2) * Math.cos(ang),
      zC,
      len,
      BEACH_RAMP_THICK,
      w,
      0,
      0,
      ang,
      true
    );
  }

  // Cliff-edge parapets: low rock walls with gaps at ramps and drops.
  for (const [edgeX, z0, z1, baseY] of BEACH_PARAPETS) {
    addBox(
      edgeX + BEACH_PARAPET_T / 2,
      baseY + BEACH_PARAPET_H / 2,
      (z0 + z1) / 2,
      BEACH_PARAPET_T,
      BEACH_PARAPET_H,
      z1 - z0
    );
  }

  // Standing stones.
  for (const [x, z, baseY, h] of BEACH_STONES) {
    addBox(x, baseY + h / 2, z, 0.7, h, 0.5);
  }

  // Boundary walls (visible except the 'none' shoreline wall).
  for (const [x, y, z, sx, sy, sz] of WALLS) {
    addBox(x, y, z, sx, sy, sz);
  }

  // Crater ring (issue #9): the arena's true circular boundary. Same shared
  // layout as the visuals in level.js. The west gap is the only way in/out.
  {
    const { kept, gapEdges } = arenaRingLayout({
      cx: ARENA_CENTER[0],
      cz: ARENA_CENTER[1],
      radius: ARENA_RING_R,
      segments: ARENA_RING_SEGMENTS,
      gapHalfWidth: ARENA_GAP_HALF_WIDTH,
      segOverlap: ARENA_SEG_OVERLAP,
    });
    for (const s of kept) {
      addBox(s.x, ARENA_RING_H / 2, s.z, s.len, ARENA_RING_H, ARENA_RING_T, 0, s.rotY, 0);
    }
    // Mouth gate: pillars capping the ring ends + cracked two-piece lintel.
    // Pillars sit outside the 12-wide walkable gap; colliders match visuals.
    const pw = ARENA_GATE.pillarW;
    const ph = ARENA_GATE.pillarH;
    const pillars = gapEdges.map((e) => [
      ARENA_CENTER[0] + ARENA_RING_R * Math.cos(e),
      ARENA_RING_R * Math.sin(e),
    ]);
    for (const [px, pz] of pillars) {
      addBox(px, ph / 2, pz, pw, ph, pw);
    }
    // Lintel halves: each spans pillar-to-middle (len 8 covers the 7.22
    // pillar offset), split at z=0 with a y/x step between them so the crack
    // reads. High above reach, but collided anyway.
    const gx = pillars[0][0];
    const lh = ARENA_GATE.lintelH;
    const lw = ARENA_GATE.lintelW;
    const llen = ARENA_GATE.lintelLen;
    addBox(gx, ph + lh / 2, -llen / 2 + 0.1, lw, lh, llen, 0, 0, 0);
    addBox(gx + 0.3, ph + lh / 2 - 0.25, llen / 2 - 0.1, lw, lh, llen, 0, 0, 0);
  }

  // Hills: buried static spheres, crests stay walkable.
  for (const [x, y, z, r] of HILLS) {
    const body = new CANNON.Body({
      mass: 0,
      material: groundMat,
      shape: new CANNON.Sphere(r),
      position: new CANNON.Vec3(x, y, z),
    });
    world.addBody(body);
    staticBodies.push(body);
    groundBodies.add(body.id);
  }

  // Bridges: pairs of inclined boxes cresting over the water channel.
  // Same math as level.js: slope runs half the span, rises to the crest.
  const slopeLen = Math.hypot(BRIDGE_SPAN / 2, BRIDGE_CREST_H);
  const slopeAng = Math.atan2(BRIDGE_CREST_H, BRIDGE_SPAN / 2);
  const chanMid = (CHANNEL_Z0 + CHANNEL_Z1) / 2;
  for (const [bx, bw] of BRIDGES) {
    const y = BRIDGE_CREST_H / 2;
    // South slope (+Z end up) and north slope (-Z end up).
    addBox(bx, y, chanMid - BRIDGE_SPAN / 4, bw, BRIDGE_THICK, slopeLen, -slopeAng, 0, 0, true);
    addBox(bx, y, chanMid + BRIDGE_SPAN / 4, bw, BRIDGE_THICK, slopeLen, slopeAng, 0, 0, true);
  }

  // Hut bodies (roofs are above reach; body collider blocks entry).
  for (const [hx, hz, rotY, , , bodyH] of HUTS) {
    const h = bodyH || HUT_BODY[1];
    addBox(hx, h / 2, hz, HUT_BODY[0], h, HUT_BODY[2], 0, rotY, 0);
  }

  // Village props. Every blocking prop has a collider matching its visual.
  // Beach props carry their shelf/beach height in the trailing baseY element.
  for (const [x, z, rotY, s, dy, by = 0] of CRATES) {
    addBox(x, by + s / 2 + dy, z, s, s, s, 0, rotY, 0);
  }
  for (const [x, z, by = 0] of BARRELS) {
    addBox(x, by + 0.45, z, 0.7, 0.9, 0.7);
  }
  for (const [x1, z1, x2, z2, by = 0] of FENCES) {
    const len = Math.hypot(x2 - x1, z2 - z1);
    addBox((x1 + x2) / 2, by + 0.5, (z1 + z2) / 2, 0.3, 1.0, len + 0.3, 0, Math.atan2(x2 - x1, z2 - z1), 0);
  }
  for (const [x, z, rotY, by = 0] of BENCHES) {
    addBox(x, by + 0.3, z, 1.6, 0.6, 0.6, 0, rotY, 0);
  }
  for (const [x, z] of LANTERNS) {
    addBox(x, 1.3, z, 0.25, 2.6, 0.25);
  }
  addBox(STALL[0], 1.0, STALL[1], 2.2, 2.0, 1.6, 0, STALL[2], 0);
  addBox(WELL[0], 0.6, WELL[1], 1.4, 1.2, 1.4);
  addBox(CART[0], 0.5, CART[1], 2.2, 1.0, 1.4, 0, CART[2], 0);
  for (const [x, z, rotY] of SIGNS) {
    addBox(x, 1.0, z, 0.3, 2.0, 0.3, 0, rotY, 0);
  }
  for (const [x, z, rotY, postH, halfGap] of GATES) {
    // Posts at local x +/- halfGap.
    const c = Math.cos(rotY);
    const s = Math.sin(rotY);
    addBox(x + c * halfGap, postH / 2, z - s * halfGap, 0.35, postH, 0.35);
    addBox(x - c * halfGap, postH / 2, z + s * halfGap, 0.35, postH, 0.35);
  }
  for (const [x, z, r] of BUSH_BIG) {
    addBox(x, r / 2, z, r * 1.5, r, r * 1.5);
  }
  // Pier deck + end platform (walkable) with rails all around: there is no
  // ground under the pier, so the rails are what keep the player out of the sea.
  {
    const [x0, x1, z, w, topY] = PIER;
    const [platX, platZ, platS] = PIER_PLATFORM;
    const len = Math.abs(x1 - x0);
    const cx = (x0 + x1) / 2;
    const deckT = 0.15;
    addBox(cx, topY - deckT / 2, z, len, deckT, w, 0, 0, 0, true);
    addBox(platX, topY - deckT / 2, platZ, platS, deckT, platS, 0, 0, 0, true);
    const railY = topY + 0.5;
    addBox(cx, railY, z - w / 2 + 0.08, len, 1.0, 0.15);
    addBox(cx, railY, z + w / 2 - 0.08, len, 1.0, 0.15);
    addBox(platX, railY, platZ - platS / 2 + 0.08, platS, 1.0, 0.15);
    addBox(platX, railY, platZ + platS / 2 - 0.08, platS, 1.0, 0.15);
    addBox(platX - platS / 2, railY, platZ, 0.15, 1.0, platS + 0.15);
  }
  // Beached boat hull.
  addBox(BOAT[0], (BOAT[3] || 0) + 0.4, BOAT[1], 2.8, 0.8, 1.3, 0, BOAT[2], 0);

  // Tree trunks (canopies are above reach).
  for (const [tx, tz, trunkH] of TREES) {
    const w = TRUNK_RADIUS * 2;
    addBox(tx, trunkH / 2, tz, w, trunkH, w);
  }

  // Giant old tree: wide trunk, same pattern.
  {
    const [gx, gz, trunkH, trunkR] = GIANT_TREE;
    addBox(gx, trunkH / 2, gz, trunkR * 2, trunkH, trunkR * 2);
  }

  // Rocks (box cores inside the squashed-dodecahedron visuals).
  for (const [rx, rz, size, gy = 0] of ROCKS) {
    const w = size * 0.9;
    addBox(rx, gy + (size * 0.62) / 2, rz, w, size * 0.62, w);
  }

  // Forest dressing with colliders (issue #8). Visuals in level.js mirror
  // every transform. Mossy rocks and large circle stones block like rocks;
  // big bushes use the village box approx; logs/stumps/bridge/stones are low
  // roll-over bumps or walkable decks (ground=true).
  for (const [x, z, r] of FOREST_BUSH_BIG) {
    addBox(x, r / 2, z, r * 1.5, r, r * 1.5);
  }
  for (const [x, z, size] of FOREST_MOSSY_ROCKS) {
    const w = size * 0.9;
    addBox(x, (size * 0.62) / 2, z, w, size * 0.62, w);
  }
  for (const [x, z, size] of FOREST_STONE_CIRCLE) {
    if (size < 0.7) continue; // small circle stones are visual-only
    const w = size * 0.9;
    addBox(x, (size * 0.62) / 2, z, w, size * 0.62, w);
  }
  // Fallen logs: low boxes the cube rolls over. Same segment math as
  // level.js: single logs span len; two-segment logs angle at the middle.
  for (const [x, z, rotY, len, twoSeg, r] of FOREST_LOGS) {
    const h = r * 2;
    if (!twoSeg) {
      addBox(x, r, z, len, h, h, 0, rotY, 0);
    } else {
      const segLen = len * 0.6;
      const c = Math.cos(rotY);
      const s = Math.sin(rotY);
      // Local (-len*0.2, 0) and (len*0.2, len*0.15), rotated to world.
      const lx1 = -len * 0.2;
      const lz1 = 0;
      const lx2 = len * 0.2;
      const lz2 = len * 0.15;
      addBox(x + lx1 * c + lz1 * s, r, z - lx1 * s + lz1 * c, segLen, h, h, 0, rotY, 0);
      addBox(
        x + lx2 * c + lz2 * s,
        r,
        z - lx2 * s + lz2 * c,
        segLen,
        h,
        h,
        0,
        rotY + 0.5,
        0
      );
    }
  }
  for (const [x, z] of FOREST_STUMPS) {
    addBox(x, 0.2, z, 0.5, 0.4, 0.5);
  }
  // Log-bridge deck (walkable) and stepping stones (walkable bumps).
  {
    const [bx, bz, ry] = FOREST_BRIDGE;
    addBox(bx, 0.125, bz, 2.5, 0.25, 3.5, 0, ry, 0, true);
  }
  for (const [x, z] of FOREST_STONES) {
    addBox(x, 0.1, z, 0.9, 0.2, 0.9, 0, 0, 0, true);
  }

  // Stone arch: pillars + lintel.
  const ps = ARCH.pillarSize;
  addBox(ARCH.x, ARCH.pillarH / 2, -ARCH.pillarGap, ps, ARCH.pillarH, ps);
  addBox(ARCH.x, ARCH.pillarH / 2, ARCH.pillarGap, ps, ARCH.pillarH, ps);
  addBox(ARCH.x, ARCH.pillarH + ARCH.lintelH / 2, 0, ps, ARCH.lintelH, ARCH.pillarGap * 2 + ps);

  return { staticBodies, groundBodies };
}

// Grounded when any current contact pairs the player with a ground body
// (ground slab or ramp) with an upward normal. Contact-based, no raycast.
export function isGrounded(world, playerBody, groundBodies) {
  const contacts = world.contacts;
  for (let i = 0; i < contacts.length; i++) {
    const c = contacts[i];
    let other = null;
    let normalY = 0;
    if (c.bi === playerBody) {
      other = c.bj;
      // Contact normal points from bi to bj in cannon-es convention
      // for most pairs; use world normal direction with sign check.
      normalY = -c.ni.y;
    } else if (c.bj === playerBody) {
      other = c.bi;
      normalY = c.ni.y;
    } else {
      continue;
    }
    if (other && groundBodies.has(other.id) && normalY > 0.35) return true;
  }
  return false;
}

export function applyDrag(playerBody, grounded, isBoss = false) {
  if (isBoss) {
    playerBody.linearDamping = BOSS_GROUND_DRAG;
    return;
  }
  playerBody.linearDamping = grounded ? PLAYER_GROUND_DRAG : PLAYER_AIR_DRAG;
}

// Fixed-timestep accumulator driven by the game clock.
export function createStepper(world, fixedDt = FIXED_DT) {
  let acc = 0;
  return {
    step(dt) {
      acc += dt;
      let n = 0;
      while (acc >= fixedDt && n < 5) {
        world.step(fixedDt);
        acc -= fixedDt;
        n++;
      }
      if (n === 5) acc = 0; // drop backlog after tab-switch clamp
      return n;
    },
    reset() {
      acc = 0;
    },
  };
}
