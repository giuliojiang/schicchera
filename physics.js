// cannon-es world, player body, static level bodies, fixed-step accumulator.
import * as CANNON from 'cannon-es';
import {
  ARCH,
  BOSS_GROUND_DRAG,
  BRIDGE_CREST_H,
  BRIDGE_SPAN,
  BRIDGE_THICK,
  BRIDGES,
  CHANNEL_Z0,
  CHANNEL_Z1,
  CUBE_MASS,
  FIXED_DT,
  GRAVITY_Y,
  GROUND_FRICTION,
  GROUND_RESTITUTION,
  HILLS,
  HUT_BODY,
  HUTS,
  PLAYER_AIR_DRAG,
  PLAYER_ANGULAR_DAMPING,
  PLAYER_GROUND_DRAG,
  PLAYER_SIZE,
  PLAYER_SPAWN,
  ROCKS,
  TREES,
  TRUNK_RADIUS,
  WALLS,
  ZONE_ARENA,
  ZONE_BEACH,
  ZONE_FOREST,
  ZONE_PASS,
  ZONE_VILLAGE,
} from './constants.js';

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

  function addSlab(zone) {
    const sx = zone.x1 - zone.x0;
    const sz = zone.z1 - zone.z0;
    // Top surface at y=0.
    return addBox((zone.x0 + zone.x1) / 2, -0.5, (zone.z0 + zone.z1) / 2, sx, 1, sz, 0, 0, 0, true);
  }

  // Zone ground slabs (butt joints, all tops at y=0).
  addSlab(ZONE_VILLAGE);
  addSlab(ZONE_BEACH);
  addSlab(ZONE_FOREST);
  addSlab(ZONE_PASS);
  addSlab(ZONE_ARENA);

  // Boundary walls (visible except the 'none' shoreline wall).
  for (const [x, y, z, sx, sy, sz] of WALLS) {
    addBox(x, y, z, sx, sy, sz);
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
  for (const [hx, hz, rotY] of HUTS) {
    addBox(hx, HUT_BODY[1] / 2, hz, HUT_BODY[0], HUT_BODY[1], HUT_BODY[2], 0, rotY, 0);
  }

  // Tree trunks (canopies are above reach).
  for (const [tx, tz, trunkH] of TREES) {
    const w = TRUNK_RADIUS * 2;
    addBox(tx, trunkH / 2, tz, w, trunkH, w);
  }

  // Rocks (box cores inside the squashed-dodecahedron visuals).
  for (const [rx, rz, size] of ROCKS) {
    const w = size * 0.9;
    addBox(rx, (size * 0.62) / 2, rz, w, size * 0.62, w);
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
