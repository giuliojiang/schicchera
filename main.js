// Boot, input, camera follow/aim, charge/flick loop, fixed-step physics.
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {
  CAMERA_DISTANCE,
  CAMERA_HEIGHT,
  CAMERA_LERP,
  FOG_ARENA,
  FOG_BEACH,
  FOG_DENSITY,
  FOG_FOREST,
  FOG_LERP_SPEED,
  FOG_PASS,
  FOG_VILLAGE,
  FULL_CHARGE_TIME,
  LAUNCH_STRETCH_TIME,
  MAX_FRAME_DT,
  ORBIT_SPEED,
  PICKUP_TOUCH_DIST,
  PICKUPS,
  PLAYER_MAX_FLICK_SPEED,
  SPEED_CLAMP,
  SQUASH_XZ,
  SQUASH_Y,
  SUN_OFFSET,
  ZONE_ARENA,
  ZONE_BEACH,
  ZONE_FOREST,
  ZONE_PASS,
  ZONE_VILLAGE,
} from './constants.js';
import { applyFlickVelocity, chargeFraction, clampSpeed, flickSpeed, zoneOf } from './game.js';
import {
  applyDrag,
  createPlayerBody,
  createStaticLevel,
  createStepper,
  createWorld,
  isGrounded,
} from './physics.js';
import { attachWeapon, buildLevel, buildLights, buildPickup, buildPlayerMesh } from './level.js';
import {
  ensureAudio,
  playFlick,
  playPickup,
  playThud,
  startCharge,
  stopCharge,
  updateCharge,
} from './audio.js';

const app = document.getElementById('app');

// Renderer / scene / camera.
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(FOG_VILLAGE);
scene.fog = new THREE.FogExp2(FOG_VILLAGE, FOG_DENSITY);
const { sun } = buildLights(scene);
const { lavaMats, gulls, clouds } = buildLevel(scene);
const playerMesh = buildPlayerMesh();
scene.add(playerMesh);

// Weapon pickups: dagger at the plaza, sword on the beach, hammer in the forest.
const pickups = PICKUPS.map(([id, x, baseY, z], i) => {
  const { group, glintMats } = buildPickup(id);
  group.position.set(x, baseY, z);
  scene.add(group);
  return { id, group, glintMats, baseY, taken: false, phase: i * 2.1 };
});
const pieces = [];

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  400
);

// Physics.
const world = createWorld();
const playerBody = createPlayerBody(world);
const { groundBodies } = createStaticLevel(world);
const stepper = createStepper(world);

playerBody.addEventListener('collide', (e) => {
  try {
    const v = Math.abs(e.contact.getImpactVelocityAlongNormal());
    playThud(v);
  } catch {
    /* ignore */
  }
});

// Input state. A/D orbit, Space/Enter charge + release.
const input = { left: false, right: false };
let orbitAngle = 0; // radians around Y
let charging = false;
let holdTime = 0;
let stretchT = 0; // launch pop timer
let grounded = false;
let phase = 'playing'; // playing | won | lost (boss later)
let frames = 0;
let lastDt = 0;
let zone = 'village';
let animT = 0;

const ZONES = {
  village: ZONE_VILLAGE,
  beach: ZONE_BEACH,
  forest: ZONE_FOREST,
  pass: ZONE_PASS,
  arena: ZONE_ARENA,
};
const FOG_COLORS = {
  village: new THREE.Color(FOG_VILLAGE),
  beach: new THREE.Color(FOG_BEACH),
  forest: new THREE.Color(FOG_FOREST),
  pass: new THREE.Color(FOG_PASS),
  arena: new THREE.Color(FOG_ARENA),
};

function flickDirection(out) {
  // Camera horizontal forward: player minus camera, projected to ground.
  const px = playerBody.position.x - camera.position.x;
  const pz = playerBody.position.z - camera.position.z;
  const len = Math.hypot(px, pz);
  if (len < 1e-4) {
    out[0] = 0;
    out[1] = -1;
    return out;
  }
  out[0] = px / len;
  out[1] = pz / len;
  return out;
}

const dirTmp = [0, -1];

function beginCharge() {
  if (charging) return;
  charging = true;
  holdTime = 0;
  stretchT = 0;
  ensureAudio();
  startCharge();
}

function releaseFlick() {
  if (!charging) return;
  charging = false;
  const speed = flickSpeed(holdTime, FULL_CHARGE_TIME, PLAYER_MAX_FLICK_SPEED);
  const frac = chargeFraction(holdTime, FULL_CHARGE_TIME);
  flickDirection(dirTmp);
  const v = playerBody.velocity;
  const [nx, ny, nz] = applyFlickVelocity(v.x, v.y, v.z, dirTmp[0], dirTmp[1], speed);
  const [cx, cy, cz] = clampSpeed(nx, ny, nz, SPEED_CLAMP);
  playerBody.velocity.set(cx, cy, cz);
  playerBody.wakeUp();
  stretchT = LAUNCH_STRETCH_TIME;
  stopCharge();
  playFlick(frac);
  holdTime = 0;
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
    input.left = true;
    e.preventDefault();
  } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
    input.right = true;
    e.preventDefault();
  } else if (e.code === 'Space' || e.code === 'Enter') {
    ensureAudio();
    if (!e.repeat) beginCharge();
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') input.left = false;
  else if (e.code === 'KeyD' || e.code === 'ArrowRight') input.right = false;
  else if (e.code === 'Space' || e.code === 'Enter') releaseFlick();
});

window.addEventListener('blur', () => {
  input.left = false;
  input.right = false;
  if (charging) releaseFlick();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Camera desired position from orbit angle.
const desired = new THREE.Vector3();
const lookTarget = new THREE.Vector3();

function updateCamera(dt) {
  if (input.left) orbitAngle += ORBIT_SPEED * dt;
  if (input.right) orbitAngle -= ORBIT_SPEED * dt;
  const px = playerBody.position.x;
  const py = playerBody.position.y;
  const pz = playerBody.position.z;
  desired.set(
    px + Math.sin(orbitAngle) * CAMERA_DISTANCE,
    py + CAMERA_HEIGHT,
    pz + Math.cos(orbitAngle) * CAMERA_DISTANCE
  );
  const k = 1 - Math.exp(-CAMERA_LERP * dt);
  camera.position.lerp(desired, frames === 0 ? 1 : k);
  lookTarget.set(px, py, pz);
  camera.lookAt(lookTarget);
}

function updateSquash(dt) {
  if (stretchT > 0) {
    stretchT = Math.max(0, stretchT - dt);
    const t = stretchT / LAUNCH_STRETCH_TIME; // 1 -> 0
    const pop = Math.sin(t * Math.PI); // 0 up then down
    playerMesh.scale.set(1 - 0.12 * pop, 1 + 0.22 * pop, 1 - 0.12 * pop);
    return;
  }
  if (charging) {
    const f = chargeFraction(holdTime, FULL_CHARGE_TIME);
    playerMesh.scale.set(1 + SQUASH_XZ * f, 1 - SQUASH_Y * f, 1 + SQUASH_XZ * f);
    updateCharge(f);
    return;
  }
  // Ease back to 1.
  const s = playerMesh.scale;
  s.x += (1 - s.x) * Math.min(1, dt * 10);
  s.y += (1 - s.y) * Math.min(1, dt * 10);
  s.z += (1 - s.z) * Math.min(1, dt * 10);
}

function updateWorld(dt) {
  animT += dt;
  const px = playerBody.position.x;
  const py = playerBody.position.y;
  const pz = playerBody.position.z;

  // Fog follows the zone: the atmosphere itself changes palette.
  zone = zoneOf(px, pz, ZONES);
  const k = 1 - Math.exp(-FOG_LERP_SPEED * dt);
  scene.fog.color.lerp(FOG_COLORS[zone], k);
  scene.background.lerp(FOG_COLORS[zone], k);

  // Shadow-casting sun follows the player so shadows stay crisp anywhere.
  sun.position.set(px + SUN_OFFSET[0], py + SUN_OFFSET[1], pz + SUN_OFFSET[2]);
  sun.target.position.set(px, 0, pz);
  sun.target.updateMatrixWorld();

  // Lava breathes (emissive pulse; the only saturated color in the game).
  const lavaGlow = 1.8 + 0.5 * Math.sin(animT * 2.2);
  for (const m of lavaMats) m.emissiveIntensity = lavaGlow;

  // Gulls circle the shore, wings flapping; clouds drift slowly.
  for (const gu of gulls) {
    const a = animT * gu.speed + gu.phase;
    gu.g.position.set(
      gu.cx + Math.cos(a) * gu.r,
      gu.h + Math.sin(animT * 0.5 + gu.phase) * 0.4,
      gu.cz + Math.sin(a) * gu.r * 0.7
    );
    gu.g.rotation.y = Math.atan2(-Math.sin(a) * gu.r, Math.cos(a) * gu.r * 0.7);
    const flap = Math.sin(animT * 6 + gu.phase) * 0.5;
    gu.wingL.rotation.z = 0.2 + flap;
    gu.wingR.rotation.z = -0.2 - flap;
  }
  for (const c of clouds) {
    c.m.position.x += dt * 0.3;
    if (c.m.position.x > 35) c.m.position.x = -35;
  }

  // Pickups bob, spin, and glint until collected.
  for (const p of pickups) {
    if (p.taken) continue;
    p.group.position.y = p.baseY + Math.sin(animT * 2 + p.phase) * 0.15;
    p.group.rotation.y += dt * 1.2;
    const glint = 0.7 + 0.5 * Math.sin(animT * 3 + p.phase);
    for (const m of p.glintMats) m.emissiveIntensity = glint;
    // Touch to collect: attach mesh + collider + mass, chime rising per piece.
    const dx = px - p.group.position.x;
    const dy = py - p.group.position.y;
    const dz = pz - p.group.position.z;
    if (dx * dx + dy * dy + dz * dz < PICKUP_TOUCH_DIST * PICKUP_TOUCH_DIST) {
      p.taken = true;
      scene.remove(p.group);
      attachWeapon(THREE, CANNON, playerMesh, playerBody, p.id);
      playPickup(pieces.length);
      pieces.push(p.id);
    }
  }
}

let lastTime = performance.now();

function frame(now) {
  try {
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (!(dt >= 0) || dt > MAX_FRAME_DT) dt = Math.min(Math.max(dt, 0), MAX_FRAME_DT);
    lastDt = dt;

    if (charging) holdTime += dt;

    stepper.step(dt);
    grounded = isGrounded(world, playerBody, groundBodies);
    applyDrag(playerBody, grounded, false);
    updateWorld(dt);

    // Sync visual.
    playerMesh.position.set(playerBody.position.x, playerBody.position.y, playerBody.position.z);
    playerMesh.quaternion.set(
      playerBody.quaternion.x,
      playerBody.quaternion.y,
      playerBody.quaternion.z,
      playerBody.quaternion.w
    );

    updateCamera(frames === 0 ? 1 : dt);
    updateSquash(dt);

    renderer.render(scene, camera);
    frames++;
  } catch (err) {
    // Visual-only failure signal (No Text): darken, keep console for details.
    renderer.domElement.style.filter = 'brightness(0.4) sepia(1) hue-rotate(-50deg)';
    throw err;
  } finally {
    requestAnimationFrame(frame);
  }
}

// Place camera instantly on boot so first frame is framed.
playerMesh.position.set(playerBody.position.x, playerBody.position.y, playerBody.position.z);
updateCamera(1);
renderer.render(scene, camera);
requestAnimationFrame((t) => {
  lastTime = t;
  requestAnimationFrame(frame);
});

// Dev-only hooks: ?debug=1 and ?autoplay&seed=N. Never loaded otherwise.
const params = new URLSearchParams(location.search);
if (params.has('debug') || params.has('autoplay')) {
  import('./debug.js')
    .then((m) =>
      m.initDebug({
        THREE,
        renderer,
        scene,
        camera,
        world,
        playerBody,
        input,
        getState: () => ({
          charging,
          holdTime,
          charge01: chargeFraction(holdTime, FULL_CHARGE_TIME),
          grounded,
          phase,
          frames,
          lastDt,
          orbitAngle,
          zone,
          pieces: [...pieces],
          pickups: pickups.map((p) => ({ id: p.id, taken: p.taken })),
        }),
        actions: { beginCharge, releaseFlick },
        params,
      })
    )
    .catch(() => {});
}
