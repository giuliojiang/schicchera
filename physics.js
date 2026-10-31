// cannon-es world, player body, static level bodies, fixed-step accumulator.
import * as CANNON from 'cannon-es';
import {
  BOSS_GROUND_DRAG,
  CUBE_MASS,
  FIXED_DT,
  GRAVITY_Y,
  GROUND_FRICTION,
  GROUND_RESTITUTION,
  GROUND_SIZE,
  PLAYER_AIR_DRAG,
  PLAYER_ANGULAR_DAMPING,
  PLAYER_GROUND_DRAG,
  PLAYER_SIZE,
  PLAYER_SPAWN,
  WALL_HEIGHT,
  WALL_THICKNESS,
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

// Static ground, 4 walls, 2 ramps. Returns handles for contact classification.
export function createStaticLevel(world) {
  const groundMat = new CANNON.Material('ground');
  const staticBodies = [];
  const groundBodies = new Set();

  function addBox(px, py, pz, sx, sy, sz, rotX = 0, rotZ = 0, isGround = false) {
    const body = new CANNON.Body({
      mass: 0,
      material: groundMat,
      shape: new CANNON.Box(new CANNON.Vec3(sx / 2, sy / 2, sz / 2)),
      position: new CANNON.Vec3(px, py, pz),
    });
    if (rotX) body.quaternion.setFromEuler(rotX, 0, 0);
    if (rotZ) body.quaternion.setFromEuler(0, 0, rotZ);
    world.addBody(body);
    staticBodies.push(body);
    if (isGround) groundBodies.add(body.id);
    return body;
  }

  const half = GROUND_SIZE / 2;
  // Ground slab (top surface at y=0).
  addBox(0, -0.5, 0, GROUND_SIZE, 1, GROUND_SIZE, 0, 0, true);

  // Enclosing walls (visible low walls).
  const wt = WALL_THICKNESS;
  const wh = WALL_HEIGHT;
  addBox(0, wh / 2, -half, GROUND_SIZE + wt * 2, wh, wt);
  addBox(0, wh / 2, half, GROUND_SIZE + wt * 2, wh, wt);
  addBox(-half, wh / 2, 0, wt, wh, GROUND_SIZE);
  addBox(half, wh / 2, 0, wt, wh, GROUND_SIZE);

  // Two ramps for airborne play. Rotated boxes, tops stay walkable.
  const rampA = addBox(-7, 0.9, -6, 8, 0.6, 4, 0, 0.32, true);
  const rampB = addBox(7, 0.9, -2, 8, 0.6, 4, 0, -0.32, true);

  return { staticBodies, groundBodies, rampA, rampB };
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
