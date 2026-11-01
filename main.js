// Boot, input, camera follow/aim, charge/flick loop, fixed-step physics.
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {
  ARENA_CENTER,
  ARENA_MOAT_IN,
  ARENA_MOAT_OUT,
  ARENA_RING_R,
  BOSS_BUMP_SPEED,
  BOSS_BUMP_TIME,
  BOSS_HP,
  BOSS_MOTE_R_IN,
  BOSS_MOTE_R_OUT,
  BOSS_MOTE_SIZE,
  BOSS_MOTES,
  BOSS_ROAM_RADIUS,
  BOSS_ROAM_RATE,
  BOSS_ROLL_SPEED,
  BOSS_STEER_RATE,
  BOSS_WINDUP_DAMP,
  BUMP_INTERVAL,
  CAMERA_ANCHOR_RATE,
  CAMERA_COLLISION_MARGIN,
  CAMERA_DEADZONE,
  CAMERA_DISTANCE,
  CAMERA_DISTANCE_RATE,
  CAMERA_HEIGHT,
  CAMERA_HEIGHT_RATE,
  CAMERA_LOOKAHEAD_MAX,
  CAMERA_LOOKAHEAD_TIME,
  CAMERA_MIN_DISTANCE,
  CAMERA_NEAR,
  CAMERA_RAY_ORIGIN_HEIGHT,
  CAMERA_VEL_RATE,
  CHARGE_BURST_TIME,
  CHARGE_GLOW_HIGH,
  CHARGE_GLOW_LOW,
  CHARGE_GLOW_MAX,
  CHARGE_MOTE_R_IN,
  CHARGE_MOTE_R_OUT,
  CHARGE_MOTE_SIZE,
  CHARGE_MOTE_TINT,
  CHARGE_MOTES,
  CHARGE_PULSE_AMP,
  CHARGE_PULSE_FREQ,
  BOSS_LINES,
  BOSS_LINE_LEN_MAX,
  BOSS_LINE_LEN_MIN,
  BOSS_LINE_OPACITY,
  BOSS_RADIUS,
  COL_DAMAGE_FLASH,
  COMBAT_COOLDOWN,
  DAMAGE_FLASH_TIME,
  EYE_SQUINT,
  GHOST_COUNT,
  GHOST_FADE,
  GHOST_INTERVAL,
  GHOST_MIN_SPEED,
  GHOST_OPACITY_MAX,
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
  MOMENTUM_TIE_EPS,
  MAP_CENTER,
  MAP_RADIUS,
  ORBIT_SPEED,
  PICKUP_TOUCH_DIST,
  PICKUPS,
  PLAYER_MAX_FLICK_SPEED,
  PLAYER_SIZE,
  PLAYER_SPAWN,
  RESPAWN_FADE_TIME,
  SAFE_VY,
  SEA_LEVEL,
  SEA_REGION,
  FALL_Y_THRESHOLD,
  ROLL_NOISE_MAX,
  ROLL_NOISE_MIN_SPEED,
  SPEED_CLAMP,
  SPEED_STREAK_LIFE,
  SPEED_STREAK_MIN,
  SPEED_STREAK_OPACITY,
  SPEED_STREAK_RATE,
  STREAK_COUNT,
  STREAK_FADE,
  STREAK_LEN_MAX,
  STREAK_LEN_MIN,
  STREAK_OPACITY,
  STREAK_POOL,
  STREAK_THICK,
  SQUASH_XZ,
  SQUASH_Y,
  SUN_OFFSET,
  SWORD_RETURN_DEST,
  SWORD_RETURN_FADE_TIME,
  SWORD_RETURN_FLASH,
  TREMBLE_POS,
  TREMBLE_ROT,
  VIS_LOCK_TAU,
  VIS_STOP_TAU,
  VIS_UNLOCK_TAU,
  WINDUP_DURATION,
  ZONE_ARENA,
  ZONE_BEACH,
  ZONE_FOREST,
  ZONE_PASS,
  ZONE_VILLAGE,
} from './constants.js';
import { createMotes } from './chargefx.js';
import { createBossLines, createGhostTrail, createStreakPool } from './futurism.js';
import {
  applyFlickVelocity,
  bossNext,
  canRecordSafe,
  chargeFraction,
  clampSpeed,
  flickSpeed,
  isInMoat,
  isInWater,
  isMoatExit,
  isOutOfBounds,
  momentum,
  resolveCombat,
  zoneOf,
} from './game.js';
import {
  applyDrag,
  createBossBody,
  createPlayerBody,
  createStaticLevel,
  createStepper,
  createWorld,
  isGrounded,
} from './physics.js';
import {
  attachBossBall,
  attachWeapon,
  buildBossMesh,
  buildLevel,
  buildLights,
  buildPickup,
  buildPlayerMesh,
  detachWeapon,
} from './level.js';
import {
  createInitialVisualState,
  createVisualLayers,
  snapVisualLayers,
  updateVisualLayers,
  visualSnapshot,
} from './visual.js';
import {
  ensureAudio,
  isMuted,
  lockMusicLayer,
  musicSnapshot,
  playBossBump,
  playDamage,
  playFlick,
  playPickup,
  playThud,
  playVictory,
  playWhoosh,
  preloadMusic,
  setMuted,
  startBossWindup,
  startCharge,
  startRunMusic,
  stopBossWindup,
  stopCharge,
  stopRunMusic,
  unlockMusicLayer,
  updateCharge,
  updateRollNoise,
} from './audio.js';

// Layered music stems (issue #11) decode during boot so the run never starts
// with a partial set; playback itself starts on the first-gesture unlock below.
preloadMusic();

function unlockAudioAndMusic() {
  ensureAudio();
  startRunMusic();
}

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
const { lavaMats, crackMats, gulls, clouds, fireflies, fireflyBase, embers, emberBase, smoke, smokeBase } =
  buildLevel(scene);

// Camera collision blockers (issue #12): explicit mesh list, built once per
// level load. Level geometry is static, so world matrices are frozen here and
// the per-frame raycast never pays for a scene-graph update. Excluded by
// construction (never tagged in level.js): the player + weapons (added below,
// after this), the boss ball, pickups, pedestals, lava, ground slabs, thicket
// trunks, fences, and bridge railings.
const cameraBlockers = [];
scene.traverse((o) => {
  if (o.isMesh && o.userData.blocker) cameraBlockers.push(o);
});
scene.updateMatrixWorld(true);
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
  CAMERA_NEAR,
  400
);

// Visual layers (issue #16): grade pass + fog + sky dome, mirroring the
// music layers. Keyed to items held; run start is Layer 0.
const visual = createVisualLayers(renderer, scene, camera);
let visualCurrent = createInitialVisualState();
let prevVisualCount = 0;
let visualTau = VIS_UNLOCK_TAU;
// Smoothed zone color: zone crossings glide at FOG_LERP_SPEED, then the
// visual layers mix that toward the layer tint (no hard cuts anywhere).
const smoothZoneColor = new THREE.Color(FOG_VILLAGE);

function updateVisual(dt) {
  // Game over fades to Layer 0; victory keeps the held layers.
  const held = phase === 'lost' ? [] : pieces;
  if (held.length > prevVisualCount) visualTau = VIS_UNLOCK_TAU;
  else if (held.length < prevVisualCount) visualTau = VIS_LOCK_TAU;
  if (phase === 'lost') visualTau = VIS_STOP_TAU;
  prevVisualCount = held.length;
  const kz = 1 - Math.exp(-FOG_LERP_SPEED * dt);
  smoothZoneColor.lerp(FOG_COLORS[zone], kz);
  updateVisualLayers({
    dt,
    pieces: held,
    zoneColor: smoothZoneColor,
    scene,
    camera,
    current: visualCurrent,
    gradeUniforms: visual.gradePass.uniforms,
    skyUniforms: visual.skyUniforms,
    skyMesh: visual.skyMesh,
    tau: visualTau,
  });
}

// Physics.
const world = createWorld();
const playerBody = createPlayerBody(world);
const bossBody = createBossBody(world);
const { groundBodies } = createStaticLevel(world);
const stepper = createStepper(world);
const bossMesh = buildBossMesh();
scene.add(bossMesh);

// Charge feedback swarms (issue #4, layer 1 + §9 boss reuse). Parented to the
// meshes so they follow automatically while the bodies roll and tumble.
// Visual-only by construction: local positions/colors, no physics contact.
const playerMotes = createMotes(THREE, {
  count: CHARGE_MOTES,
  size: CHARGE_MOTE_SIZE,
  tint: CHARGE_MOTE_TINT,
  rOut: CHARGE_MOTE_R_OUT,
  rIn: CHARGE_MOTE_R_IN,
  burstTime: CHARGE_BURST_TIME,
  seed: 41,
});
playerMesh.add(playerMotes.points);
const bossMotes = createMotes(THREE, {
  count: BOSS_MOTES,
  size: BOSS_MOTE_SIZE,
  tint: CHARGE_MOTE_TINT,
  rOut: BOSS_MOTE_R_OUT,
  rIn: BOSS_MOTE_R_IN,
  burstTime: CHARGE_BURST_TIME,
  seed: 97,
});
bossMesh.add(bossMotes.points);

// Futurism lines of force (issue #10): ghost echoes, release streaks +
// high-speed shimmer (shared pool), boss wind-up force lines. World-space
// primitives in the gold-white family, no colliders, visual-only: they read
// body state every frame and never write it.
const ghostTrail = createGhostTrail(THREE, {
  count: GHOST_COUNT,
  size: PLAYER_SIZE,
  tint: CHARGE_MOTE_TINT,
  maxOpacity: GHOST_OPACITY_MAX,
  fade: GHOST_FADE,
  interval: GHOST_INTERVAL,
  minSpeed: GHOST_MIN_SPEED,
});
scene.add(ghostTrail.group);
const streaks = createStreakPool(THREE, {
  count: STREAK_POOL,
  tint: CHARGE_MOTE_TINT,
  thick: STREAK_THICK,
  seed: 13,
});
scene.add(streaks.group);
const bossLines = createBossLines(THREE, {
  count: BOSS_LINES,
  tint: CHARGE_MOTE_TINT,
  thick: STREAK_THICK,
  lenMin: BOSS_LINE_LEN_MIN,
  lenMax: BOSS_LINE_LEN_MAX,
  maxOpacity: BOSS_LINE_OPACITY,
  radius: BOSS_RADIUS + 0.35,
  seed: 29,
});
scene.add(bossLines.group);
let streakAccum = 0; // high-speed spawn debt (rate proportional to speed)

playerBody.addEventListener('collide', (e) => {
  try {
    const v = Math.abs(e.contact.getImpactVelocityAlongNormal());
    playThud(v);
  } catch {
    /* ignore */
  }
  // Boss touch: momentum decides who deals exactly 1 HP (spec section 10).
  try {
    const other = e.contact.bi === playerBody ? e.contact.bj : e.contact.bi;
    if (other === bossBody) resolveBossTouch();
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
let phase = 'playing'; // playing | won | lost
let frames = 0;
let lastDt = 0;
let zone = 'village';
let animT = 0;
let fxT = 0; // game-time clock for charge fx (tremble, full-charge pulse)

// Scratch objects for charge fx: module-scope, never per-frame allocation.
const tmpBurst = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();
const GLOW_LOW = new THREE.Color(CHARGE_GLOW_LOW);
const GLOW_HIGH = new THREE.Color(CHARGE_GLOW_HIGH);

// Boss fight state (spec sections 9-10).
let fightClock = 0; // game-time clock for the combat cooldown
let fightActive = false; // entering the ring starts the fight
let bossState = 'dormant'; // dormant | roam | windup | bump
let bossT = 0; // time in state
let roamAngle = 0; // roam waypoint orbit position
let bossHp = BOSS_HP;
let bossAttached = false; // victory: the ball rides on the player
let lastCombatT = -COMBAT_COOLDOWN;
let playerFlashT = 0;
let bossFlashT = 0;
let bossStretchT = 0;

// Dev-only spawn override for level inspection: ?at=x,z[,y]&orbit=rad.
{
  const q = new URLSearchParams(location.search);
  if (q.has('at')) {
    const [ax, az, ay] = q.get('at').split(',').map(Number);
    if (Number.isFinite(ax) && Number.isFinite(az)) {
      playerBody.position.set(ax, Number.isFinite(ay) ? ay : 2, az);
      playerBody.velocity.set(0, 0, 0);
      playerBody.angularVelocity.set(0, 0, 0);
    }
  }
  const orb = Number(q.get('orbit'));
  if (Number.isFinite(orb)) orbitAngle = orb;
}

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
  if (charging || phase !== 'playing') return;
  charging = true;
  holdTime = 0;
  stretchT = 0;
  ensureAudio();
  startCharge();
}

function releaseFlick() {
  if (!charging || phase !== 'playing') {
    charging = false;
    return;
  }
  charging = false;
  const speed = flickSpeed(holdTime, FULL_CHARGE_TIME, PLAYER_MAX_FLICK_SPEED);
  const frac = chargeFraction(holdTime, FULL_CHARGE_TIME);
  flickDirection(dirTmp);
  // Release burst (issue #4): the swarm fires along the flick direction and
  // fades. World direction into the mesh's local space; the burst is the
  // launch payoff that replaces the old squash's job.
  tmpBurst.set(dirTmp[0], 0, dirTmp[1]);
  playerMesh.getWorldQuaternion(tmpQ);
  tmpQ.invert();
  tmpBurst.applyQuaternion(tmpQ);
  playerMotes.burst(tmpBurst.x, tmpBurst.y, tmpBurst.z, 3 + 5 * frac);
  // Futurism release streaks (issue #10 §4): the flick draws its force line,
  // exactly on release, never during charge. Same gold-white, same moment as
  // the swarm burst above; the swarm says "energy", the streaks say "where".
  streaks.burstRelease(
    playerBody.position.x,
    playerBody.position.y,
    playerBody.position.z,
    dirTmp[0],
    dirTmp[1],
    STREAK_COUNT,
    STREAK_LEN_MIN,
    STREAK_LEN_MAX,
    STREAK_FADE,
    STREAK_OPACITY,
    0.12 // fan spread, radians: a sheaf, not a ruler line
  );
  const v = playerBody.velocity;
  const [nx, ny, nz] = applyFlickVelocity(v.x, v.y, v.z, dirTmp[0], dirTmp[1], speed);
  const [cx, cy, cz] = clampSpeed(nx, ny, nz, SPEED_CLAMP);
  playerBody.velocity.set(cx, cy, cz);
  playerBody.wakeUp();
  stretchT = LAUNCH_STRETCH_TIME;
  stopCharge();
  playFlick(frac);
  playWhoosh(frac); // Russolo nod (issue #10 §7): noise whoosh under the thwip
  holdTime = 0;
}

// One touch resolves once: cooldown keeps a lingering contact from dealing
// damage every physics step. Ties bounce free without consuming cooldown.
// This runs inside a collide callback, i.e. mid-physics-step, so it only
// records the outcome: bodies are added/removed after the step completes,
// since mutating the world mid-step corrupts the solver.
// Respawn safety net (issue #13 §1): the last grounded spot, and the fade.
// Recovery is not damage: no HP/piece change, no combat cooldown touched.
let safeSpot = { x: PLAYER_SPAWN[0], y: PLAYER_SPAWN[1], z: PLAYER_SPAWN[2] };
let respawnFlash = 0; // overlay fade timer, decays over respawnFlashMax
let respawnFlashMax = RESPAWN_FADE_TIME; // gold returns use a longer flash
let lastRespawn = null; // {frame, reason} for the debug bridge
const respawnFadeEl = document.getElementById('respawnFade');

function edgeHazards() {
  const px = playerBody.position.x;
  const py = playerBody.position.y;
  const pz = playerBody.position.z;
  const inWater = isInWater(px, py, pz, SEA_LEVEL, SEA_REGION);
  const inMoat = isInMoat(px, pz, ARENA_CENTER[0], ARENA_CENTER[1], ARENA_MOAT_IN, ARENA_MOAT_OUT);
  const oob = isOutOfBounds(px, pz, MAP_CENTER[0], MAP_CENTER[1], MAP_RADIUS);
  return { px, py, pz, inWater, inMoat, oob };
}

function doRespawn(reason) {
  playerBody.position.set(safeSpot.x, safeSpot.y, safeSpot.z);
  playerBody.velocity.set(0, 0, 0);
  playerBody.angularVelocity.set(0, 0, 0);
  playerBody.wakeUp();
  // Charge reset: no instant flick on recovery.
  if (charging) {
    charging = false;
    holdTime = 0;
    stopCharge();
    playerMotes.dissipate();
  }
  // Snap the camera anchor (#7) so there is no cross-map swoop; the #12
  // pull-in still applies from the new position.
  anchorX = safeSpot.x;
  anchorZ = safeSpot.z;
  smoothGround = safeSpot.y;
  smoothVelX = 0;
  smoothVelZ = 0;
  respawnFlash = RESPAWN_FADE_TIME;
  respawnFlashMax = RESPAWN_FADE_TIME;
  if (respawnFadeEl) {
    respawnFadeEl.style.background = '#000'; // safety net is always the black blink
    respawnFadeEl.style.opacity = '1';
  }
  lastRespawn = { frame: frames, reason };
}

// Sword return: collecting the beach weapon sends the player back to the
// beginning. Same snap mechanics as the safety net, but a longer golden
// flash plus an upward mote fountain, so it reads as a reward, never as a
// death. Beach-only: the other spokes walk back fine.
function doSwordReturn() {
  const [dx, dy, dz] = SWORD_RETURN_DEST;
  playerBody.position.set(dx, dy, dz);
  playerBody.velocity.set(0, 0, 0);
  playerBody.angularVelocity.set(0, 0, 0);
  playerBody.wakeUp();
  if (charging) {
    charging = false;
    holdTime = 0;
    stopCharge();
    playerMotes.dissipate();
  }
  anchorX = dx;
  anchorZ = dz;
  smoothGround = dy;
  smoothVelX = 0;
  smoothVelZ = 0;
  safeSpot = { x: dx, y: dy, z: dz };
  playerMotes.burst(0, 1, 0, 4); // arrival fountain, mesh-local up
  respawnFlash = SWORD_RETURN_FADE_TIME;
  respawnFlashMax = SWORD_RETURN_FADE_TIME;
  if (respawnFadeEl) {
    respawnFadeEl.style.background = SWORD_RETURN_FLASH;
    respawnFadeEl.style.opacity = '1';
  }
  lastRespawn = { frame: frames, reason: 'sword-return' };
}

let pendingCombat = null; // 'player' | 'boss', applied in stepSim after the step

function resolveBossTouch() {
  if (phase !== 'playing' || !fightActive) return;
  if (fightClock - lastCombatT < COMBAT_COOLDOWN) return;
  const pv = playerBody.velocity;
  const bv = bossBody.velocity;
  const out = resolveCombat(
    momentum(playerBody.mass, pv.x, pv.y, pv.z),
    momentum(bossBody.mass, bv.x, bv.y, bv.z),
    charging,
    MOMENTUM_TIE_EPS
  );
  if (out === 'tie') return;
  lastCombatT = fightClock;
  pendingCombat = out;
}

function applyCombat(out) {
  if (out === 'player') {
    bossHp -= 1;
    bossFlashT = DAMAGE_FLASH_TIME;
    playDamage();
    if (bossHp <= 0) winFight();
  } else {
    playerFlashT = DAMAGE_FLASH_TIME;
    playDamage();
    if (pieces.length > 0) {
      const lost = pieces.pop();
      detachWeapon(playerMesh, playerBody, lost); // last attached, first lost
      lockMusicLayer(lost); // default: the music thins as HP drops
    } else {
      loseFight();
    }
  }
}

function dropCharge() {
  charging = false;
  holdTime = 0;
  stopCharge();
  // A cancelled charge never fired: motes simply dissipate, no burst.
  playerMotes.dissipate();
}

function winFight() {
  phase = 'won';
  dropCharge();
  playerMotes.hide();
  bossMotes.hide();
  ghostTrail.hide();
  streaks.hide();
  bossLines.hide();
  // The celebration shows the loaded character, no fx: reset both glows.
  if (playerMesh.userData.bodyMat) playerMesh.userData.bodyMat.emissive.setHex(0x000000);
  bossMesh.userData.bodyMat.emissive.setHex(0x000000);
  stopBossWindup();
  world.removeBody(bossBody);
  attachBossBall(CANNON, playerMesh, playerBody, bossMesh);
  bossAttached = true;
  // Victory keeps the held layers playing under the arpeggio (issue #11 §3):
  // the fully loaded character gets the fullest mix. Sources die with the page.
  playVictory();
  document.getElementById('victory').hidden = false;
}

function loseFight() {
  phase = 'lost';
  dropCharge();
  playerMotes.hide();
  ghostTrail.hide();
  streaks.hide();
  bossLines.hide();
  stopBossWindup();
  stopRunMusic(); // all stems to 0 over ~1 s, then stopped
  document.getElementById('gameover').hidden = false;
}

const BOSS_TIMINGS = { interval: BUMP_INTERVAL, windup: WINDUP_DURATION, bumpTime: BOSS_BUMP_TIME };

function updateBoss(dt) {
  if (phase !== 'playing') return;
  if (!fightActive) {
    // Entering the ring starts the fight (spec section 3).
    const dx = playerBody.position.x - ARENA_CENTER[0];
    const dz = playerBody.position.z - ARENA_CENTER[1];
    if (dx * dx + dz * dz >= ARENA_RING_R * ARENA_RING_R) return;
    fightActive = true;
    bossState = 'roam';
    bossT = 0;
  }
  bossT += dt;
  const next = bossNext(bossState, bossT, BOSS_TIMINGS);
  if (next !== bossState) {
    if (next === 'windup') {
      // Stop dead: the still window is the telegraph.
      bossBody.velocity.x = 0;
      bossBody.velocity.z = 0;
      startBossWindup(WINDUP_DURATION);
    } else if (next === 'bump') {
      // Aim locks at fire time. A hit during wind-up never cancels this:
      // the still window is risk/reward, not a free cancel.
      const dx = playerBody.position.x - bossBody.position.x;
      const dz = playerBody.position.z - bossBody.position.z;
      const len = Math.hypot(dx, dz);
      bossBody.velocity.x = (len > 1e-4 ? dx / len : 1) * BOSS_BUMP_SPEED;
      bossBody.velocity.z = (len > 1e-4 ? dz / len : 0) * BOSS_BUMP_SPEED;
      bossBody.wakeUp();
      stopBossWindup();
      playBossBump();
      // The wind-up swarm fires radially as the bump launches (§9 reuse).
      bossMotes.burst(0, 0, 0, 3);
      bossStretchT = LAUNCH_STRETCH_TIME;
    }
    bossState = next;
    bossT = 0;
  }
  if (bossState === 'roam') {
    // Chase a waypoint orbiting the center: roams the floor, never camps.
    roamAngle += BOSS_ROAM_RATE * dt;
    const tx = ARENA_CENTER[0] + Math.cos(roamAngle) * BOSS_ROAM_RADIUS;
    const tz = ARENA_CENTER[1] + Math.sin(roamAngle) * BOSS_ROAM_RADIUS;
    const dx = tx - bossBody.position.x;
    const dz = tz - bossBody.position.z;
    const len = Math.hypot(dx, dz);
    let desX = 0;
    let desZ = 0;
    if (len > 1e-4) {
      desX = (dx / len) * BOSS_ROLL_SPEED;
      desZ = (dz / len) * BOSS_ROLL_SPEED;
    }
    const k = 1 - Math.exp(-BOSS_STEER_RATE * dt);
    bossBody.velocity.x += (desX - bossBody.velocity.x) * k;
    bossBody.velocity.z += (desZ - bossBody.velocity.z) * k;
  } else if (bossState === 'windup') {
    // Pin the still window (spec section 9).
    const f = Math.exp(-BOSS_WINDUP_DAMP * dt);
    bossBody.velocity.x *= f;
    bossBody.velocity.z *= f;
  }
  // Bump is ballistic: low drag carries it at near full speed.
}

window.addEventListener('keydown', (e) => {
  if (phase !== 'playing') {
    // End screens: flick key retries (the icon button does the same).
    if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) location.reload();
    e.preventDefault();
    return;
  }
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
    input.left = true;
    e.preventDefault();
  } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
    input.right = true;
    e.preventDefault();
  } else if (e.code === 'Space' || e.code === 'Enter') {
    unlockAudioAndMusic();
    if (!e.repeat) beginCharge();
    e.preventDefault();
  } else if (e.code === 'KeyM' && !e.repeat) {
    setMuted(!isMuted());
    syncMuteBtn();
    e.preventDefault();
  }
});

// First-gesture unlock for pointer input too (same path as the keys).
window.addEventListener('pointerdown', unlockAudioAndMusic);

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
  visual.composer.setSize(window.innerWidth, window.innerHeight);
});

// Camera channels (issue #7): yaw is direct (aiming), everything else eased.
// Anchor = smoothed XZ orbit center with a deadzone; height follows the
// smoothed ground level, never air height; gaze looks at the anchor plus a
// small clamped lookahead. Never the raw player position.
const lookTarget = new THREE.Vector3();
let anchorX = playerBody.position.x;
let anchorZ = playerBody.position.z;
let smoothGround = playerBody.position.y;
let smoothVelX = 0;
let smoothVelZ = 0;
// Collision pull-in (issue #12): smoothed distance toward the raycast target.
let camDist = CAMERA_DISTANCE;
const camRay = new THREE.Raycaster();
camRay.far = CAMERA_DISTANCE;
const rayOrigin = new THREE.Vector3();
const rayDir = new THREE.Vector3();

function updateCamera(dt) {
  // Yaw: direct, always. Any lag here would mis-aim flicks.
  if (input.left) orbitAngle += ORBIT_SPEED * dt;
  if (input.right) orbitAngle -= ORBIT_SPEED * dt;
  const px = playerBody.position.x;
  const py = playerBody.position.y;
  const pz = playerBody.position.z;

  // Anchor: ease toward player XZ only outside the deadzone.
  const dx = px - anchorX;
  const dz = pz - anchorZ;
  if (Math.hypot(dx, dz) > CAMERA_DEADZONE) {
    const k = 1 - Math.exp(-CAMERA_ANCHOR_RATE * dt);
    anchorX += dx * k;
    anchorZ += dz * k;
  }

  // Height: ease toward player Y while grounded, hold in the air.
  if (grounded) {
    const k = 1 - Math.exp(-CAMERA_HEIGHT_RATE * dt);
    smoothGround += (py - smoothGround) * k;
  }

  // Lookahead velocity: low-passed so bounce spikes never reach the gaze.
  const kv = 1 - Math.exp(-CAMERA_VEL_RATE * dt);
  smoothVelX += (playerBody.velocity.x - smoothVelX) * kv;
  smoothVelZ += (playerBody.velocity.z - smoothVelZ) * kv;
  let lhX = smoothVelX * CAMERA_LOOKAHEAD_TIME;
  let lhZ = smoothVelZ * CAMERA_LOOKAHEAD_TIME;
  const lhLen = Math.hypot(lhX, lhZ);
  if (lhLen > CAMERA_LOOKAHEAD_MAX) {
    const s = CAMERA_LOOKAHEAD_MAX / lhLen;
    lhX *= s;
    lhZ *= s;
  }

  // Collision (issue #12): raycast from the character toward the desired
  // camera position; a blocker shortens the target distance, smoothed at
  // CAMERA_DISTANCE_RATE so the camera glides instead of popping. Gaze and
  // yaw are untouched: this changes framing distance only, never aim.
  let targetDist = CAMERA_DISTANCE;
  rayOrigin.set(px, py + CAMERA_RAY_ORIGIN_HEIGHT, pz);
  rayDir.set(
    anchorX + Math.sin(orbitAngle) * CAMERA_DISTANCE - rayOrigin.x,
    smoothGround + CAMERA_HEIGHT - rayOrigin.y,
    anchorZ + Math.cos(orbitAngle) * CAMERA_DISTANCE - rayOrigin.z
  );
  const rayLen = rayDir.length();
  if (rayLen > 1e-4 && cameraBlockers.length > 0) {
    rayDir.divideScalar(rayLen);
    camRay.set(rayOrigin, rayDir);
    const hits = camRay.intersectObjects(cameraBlockers, false);
    if (hits.length > 0) {
      targetDist = Math.max(hits[0].distance - CAMERA_COLLISION_MARGIN, CAMERA_MIN_DISTANCE);
    }
  }
  camDist += (targetDist - camDist) * (1 - Math.exp(-CAMERA_DISTANCE_RATE * dt));

  camera.position.set(
    anchorX + Math.sin(orbitAngle) * camDist,
    smoothGround + CAMERA_HEIGHT,
    anchorZ + Math.cos(orbitAngle) * camDist
  );
  lookTarget.set(anchorX + lhX, smoothGround, anchorZ + lhZ);
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
    // No squash during charge (issue #4): scaling fights the tumbling cube.
    // The tone still follows the same quadratic fraction as the speed.
    updateCharge(chargeFraction(holdTime, FULL_CHARGE_TIME));
    return;
  }
  // Ease back to 1.
  const s = playerMesh.scale;
  s.x += (1 - s.x) * Math.min(1, dt * 10);
  s.y += (1 - s.y) * Math.min(1, dt * 10);
  s.z += (1 - s.z) * Math.min(1, dt * 10);
}

function updateBossSquash(dt) {
  if (bossAttached) return; // victory: the ball rides as-is
  if (bossStretchT > 0) {
    bossStretchT = Math.max(0, bossStretchT - dt);
    const t = bossStretchT / LAUNCH_STRETCH_TIME; // 1 -> 0
    const pop = Math.sin(t * Math.PI); // 0 up then down
    bossMesh.scale.set(1 - 0.12 * pop, 1 + 0.22 * pop, 1 - 0.12 * pop);
    return;
  }
  if (fightActive && bossState === 'windup') {
    // Telegraph squash grows across the wind-up (spec section 9).
    const f = Math.min(1, bossT / WINDUP_DURATION);
    bossMesh.scale.set(1 + SQUASH_XZ * f, 1 - SQUASH_Y * f, 1 + SQUASH_XZ * f);
    return;
  }
  const s = bossMesh.scale;
  s.x += (1 - s.x) * Math.min(1, dt * 10);
  s.y += (1 - s.y) * Math.min(1, dt * 10);
  s.z += (1 - s.z) * Math.min(1, dt * 10);
}

// Charge glow ramp (issue #4, layer 2): gold-white emissive on the body only,
// driven by the same quadratic fraction as speed. Weapons keep their own
// glint. Red is reserved for the damage flash and never appears here.
function updateChargeGlow(mesh, f, pulse) {
  const mat = mesh.userData.bodyMat;
  if (!mat) return; // cubebot model still loading: nothing to glow yet
  mat.emissive.copy(GLOW_LOW).lerp(GLOW_HIGH, Math.min(1, f));
  let inten = CHARGE_GLOW_MAX * Math.min(1, f);
  // Full charge is unmistakable: the glow pulses while held at max.
  if (pulse && f >= 1) inten += CHARGE_PULSE_AMP * (0.5 + 0.5 * Math.sin(fxT * CHARGE_PULSE_FREQ));
  mat.emissiveIntensity = inten;
}

// Charge layers 3-4 (issue #4): mesh-only tremble + eye squint, both driven
// by the same quadratic fraction as speed. The physics body is untouched:
// position/quaternion were just synced from the body, so these offsets are
// purely visual and vanish on the next sync.
function updateTrembleEyes(f) {
  const c = Math.min(1, Math.max(0, f));
  const eyes = playerMesh.userData.eyes;
  if (eyes) {
    for (const e of eyes) e.scale.set(1 + 0.2 * c, 1 - EYE_SQUINT * c, 1);
  }
  if (!(f > 0)) return;
  const a = TREMBLE_POS * c;
  playerMesh.position.x += (Math.sin(fxT * 127.1) + 0.5 * Math.sin(fxT * 311.7)) * 0.5 * a;
  playerMesh.position.y += (Math.sin(fxT * 149.3 + 1.7) + 0.5 * Math.sin(fxT * 271.9)) * 0.5 * a;
  playerMesh.position.z += (Math.sin(fxT * 173.7 + 3.1) + 0.5 * Math.sin(fxT * 251.3)) * 0.5 * a;
  playerMesh.rotateX(Math.sin(fxT * 141.3) * TREMBLE_ROT * c);
  playerMesh.rotateZ(Math.cos(fxT * 113.7) * TREMBLE_ROT * c);
}

function updateFlashes(dt, chargeF, windupF) {
  // The damaged party flashes red (spec section 11): flash wins over glow.
  if (playerFlashT > 0) playerFlashT = Math.max(0, playerFlashT - dt);
  if (bossFlashT > 0) bossFlashT = Math.max(0, bossFlashT - dt);
  const pm = playerMesh.userData.bodyMat;
  if (pm) { // missing until the cubebot model loads; boss block below still runs
    if (playerFlashT > 0) {
      pm.emissive.setHex(COL_DAMAGE_FLASH);
      pm.emissiveIntensity = 1;
    } else if (chargeF > 0) {
      updateChargeGlow(playerMesh, chargeF, true);
    } else {
      pm.emissive.setHex(0x000000);
      pm.emissiveIntensity = 1;
    }
  }
  if (!bossAttached) {
    const bm = bossMesh.userData.bodyMat;
    if (bossFlashT > 0) {
      bm.emissive.setHex(COL_DAMAGE_FLASH);
      bm.emissiveIntensity = 1;
    } else if (windupF > 0) {
      updateChargeGlow(bossMesh, windupF, false);
    } else {
      bm.emissive.setHex(0x000000);
      bm.emissiveIntensity = 1;
    }
  }
}

function updateWorld(dt) {
  animT += dt;
  const px = playerBody.position.x;
  const py = playerBody.position.y;
  const pz = playerBody.position.z;

  // Zone tracking only: fog + sky are owned by the visual layers
  // (issue #16), which mix the zone color toward the layer tint.
  zone = zoneOf(px, pz, ZONES);

  // Shadow-casting sun follows the player so shadows stay crisp anywhere.
  sun.position.set(px + SUN_OFFSET[0], py + SUN_OFFSET[1], pz + SUN_OFFSET[2]);
  sun.target.position.set(px, 0, pz);
  sun.target.updateMatrixWorld();

  // Lava breathes (emissive pulse; the only saturated color in the game).
  const lavaGlow = 1.8 + 0.5 * Math.sin(animT * 2.2);
  for (const m of lavaMats) m.emissiveIntensity = lavaGlow;
  // Rim cracks glow dimmer than the pools, on the same breath.
  const crackGlow = 1.2 + 0.25 * Math.sin(animT * 2.2 + 0.8);
  for (const m of crackMats) m.emissiveIntensity = crackGlow;

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

  // Fireflies drift slowly over the pond and grove clearings.
  if (fireflies && fireflyBase) {
    const p = fireflies.geometry.attributes.position;
    for (let i = 0; i < fireflyBase.length; i++) {
      const [bx, by, bz, ph] = fireflyBase[i];
      p.array[i * 3] = bx + Math.sin(animT * 0.4 + ph) * 0.5;
      p.array[i * 3 + 1] = by + Math.sin(animT * 0.6 + ph * 1.7) * 0.3;
      p.array[i * 3 + 2] = bz + Math.cos(animT * 0.35 + ph) * 0.5;
    }
    p.needsUpdate = true;
  }

  // Embers rise off the lava and recycle; smoke drifts slower and taller.
  if (embers && emberBase) {
    const p = embers.geometry.attributes.position;
    for (let i = 0; i < emberBase.length; i++) {
      const [bx, by, bz, ph, sp, wob] = emberBase[i];
      p.array[i * 3] = bx + Math.sin(animT * 1.1 + wob) * 0.25;
      p.array[i * 3 + 1] = by + ((animT * sp + ph) % 2.2);
      p.array[i * 3 + 2] = bz + Math.cos(animT * 0.9 + wob) * 0.25;
    }
    p.needsUpdate = true;
  }
  if (smoke && smokeBase) {
    const p = smoke.geometry.attributes.position;
    for (let i = 0; i < smokeBase.length; i++) {
      const [bx, by, bz, ph, sp, wob] = smokeBase[i];
      p.array[i * 3] = bx + Math.sin(animT * 0.5 + wob) * 0.5;
      p.array[i * 3 + 1] = by + ((animT * sp * 0.5 + ph) % 3.5);
      p.array[i * 3 + 2] = bz + Math.cos(animT * 0.4 + wob) * 0.5;
    }
    p.needsUpdate = true;
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
    if (phase === 'playing' && dx * dx + dy * dy + dz * dz < PICKUP_TOUCH_DIST * PICKUP_TOUCH_DIST) {
      p.taken = true;
      scene.remove(p.group);
      attachWeapon(THREE, CANNON, playerMesh, playerBody, p.id);
      playPickup(pieces.length);
      pieces.push(p.id);
      unlockMusicLayer(p.id); // its stem fades in over ~1 s, under the chime
      if (p.id === 'sword') doSwordReturn(); // beach spoke: back to the beginning
    }
  }
}

let lastTime = performance.now();

// One deterministic sim step: physics, boss AI, pickups, combat (via collide
// events), mesh sync. The rAF loop calls this every frame; ?sim=N calls it N
// times synchronously for headless end-to-end runs.
function stepSim(dt) {
  if (phase !== 'playing') return;
  if (charging) holdTime += dt;
  fightClock += dt;
  fxT += dt;

  stepper.step(dt);
  if (pendingCombat !== null) {
    const out = pendingCombat;
    pendingCombat = null;
    applyCombat(out);
    if (phase !== 'playing') return; // won/lost mid-step: freeze immediately
  }
  grounded = isGrounded(world, playerBody, groundBodies);
  applyDrag(playerBody, grounded, false);
  applyDrag(bossBody, true, true);
  // Respawn safety net (issue #13 §1): water, below-threshold, and
  // out-of-bounds trigger anywhere; the lava moat only catches exits (a safe
  // spot on the disc means the player is leaving, not entering). Recovery is
  // never damage: HP and pieces are untouched.
  {
    const hz = edgeHazards();
    const fellBelow = hz.py < FALL_Y_THRESHOLD;
    const moatExit = isMoatExit(
      hz.inMoat, safeSpot.x, safeSpot.z, ARENA_CENTER[0], ARENA_CENTER[1], ARENA_MOAT_IN
    );
    let trigger = null;
    if (hz.inWater) trigger = 'water';
    else if (fellBelow) trigger = 'fall';
    else if (hz.oob) trigger = 'oob';
    else if (moatExit) trigger = 'moat';
    if (trigger) {
      doRespawn(trigger);
    } else if (
      canRecordSafe({
        grounded,
        vy: playerBody.velocity.y,
        y: hz.py,
        fallThreshold: FALL_Y_THRESHOLD,
        safeVy: SAFE_VY,
        inWater: hz.inWater,
        inMoat: hz.inMoat,
        outOfBounds: hz.oob,
      })
    ) {
      safeSpot.x = hz.px;
      safeSpot.y = hz.py + 0.1; // settle cleanly instead of in contact
      safeSpot.z = hz.pz;
    }
  }
  updateBoss(dt);
  updateWorld(dt);

  // Sync visuals.
  playerMesh.position.set(playerBody.position.x, playerBody.position.y, playerBody.position.z);
  playerMesh.quaternion.set(
    playerBody.quaternion.x,
    playerBody.quaternion.y,
    playerBody.quaternion.z,
    playerBody.quaternion.w
  );
  if (!bossAttached) {
    bossMesh.position.set(bossBody.position.x, bossBody.position.y, bossBody.position.z);
    bossMesh.quaternion.set(
      bossBody.quaternion.x,
      bossBody.quaternion.y,
      bossBody.quaternion.z,
      bossBody.quaternion.w
    );
  }

  updateSquash(dt);
  updateBossSquash(dt);
  // Charge feedback (issue #4): every layer reads the same quadratic
  // fraction that sets flick speed, so the visuals never lie about power.
  const chargeF = charging ? chargeFraction(holdTime, FULL_CHARGE_TIME) : 0;
  const windupF =
    !bossAttached && fightActive && bossState === 'windup'
      ? Math.min(1, bossT / WINDUP_DURATION)
      : 0;
  playerMotes.frame(dt, charging ? chargeF : null);
  bossMotes.frame(dt, windupF > 0 ? windupF : null);
  // Futurism lines of force (issue #10): read-only on body state, visual-only.
  // Ghost echoes (§3) trail past motion above GHOST_MIN_SPEED; high-speed
  // shimmer (§5) spawns behind the cube above SPEED_STREAK_MIN at a rate
  // proportional to speed; boss force lines (§6) add to the wind-up telegraph.
  {
    const pv = playerBody.velocity;
    const ps = Math.hypot(pv.x, pv.y, pv.z);
    const pq = playerBody.quaternion;
    ghostTrail.frame(
      dt,
      playerBody.position.x, playerBody.position.y, playerBody.position.z,
      pq.x, pq.y, pq.z, pq.w,
      ps
    );
    if (ps > SPEED_STREAK_MIN) {
      streakAccum += (ps - SPEED_STREAK_MIN) * SPEED_STREAK_RATE * dt;
      const ix = pv.x / ps;
      const iy = pv.y / ps;
      const iz = pv.z / ps;
      while (streakAccum >= 1) {
        streakAccum -= 1;
        const r1 = streaks.random() * 2 - 1;
        const r2 = streaks.random() * 2 - 1;
        const r3 = streaks.random();
        // Spawn behind the cube, line along the motion, faint and short.
        // Issue #15: offsets halved with the half-size character.
        streaks.spawn(
          playerBody.position.x - ix * (0.4 + r3 * 0.4) - iz * r1 * 0.15,
          playerBody.position.y - iy * 0.25 + r2 * 0.15,
          playerBody.position.z - iz * (0.4 + r3 * 0.4) + ix * r1 * 0.15,
          ix, iy, iz,
          STREAK_LEN_MIN + streaks.random() * (STREAK_LEN_MAX - STREAK_LEN_MIN),
          SPEED_STREAK_LIFE,
          SPEED_STREAK_OPACITY
        );
      }
    } else if (streakAccum !== 0) {
      streakAccum = 0;
    }
    streaks.frame(dt);
    bossLines.frame(
      dt,
      windupF > 0,
      bossBody.position.x, bossBody.position.y, bossBody.position.z,
      windupF,
      fxT
    );
    updateRollNoise(ps, ROLL_NOISE_MIN_SPEED, ROLL_NOISE_MAX);
  }
  updateTrembleEyes(chargeF);
  updateFlashes(dt, chargeF, windupF);
}

function frame(now) {
  try {
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (!(dt >= 0) || dt > MAX_FRAME_DT) dt = Math.min(Math.max(dt, 0), MAX_FRAME_DT);
    lastDt = dt;

    // End screens freeze the sim behind the overlay (spec section 11).
    if (phase !== 'playing') {
      // Game-over fade to Layer 0 still animates behind the overlay.
      updateVisual(dt);
      visual.composer.render();
      frames++;
      return;
    }

    stepSim(dt);

    // Respawn fade (issue #13 §1): a visual blink only, no text. Control is
    // already restored; this just covers the snap.
    if (respawnFlash > 0) {
      respawnFlash = Math.max(0, respawnFlash - dt);
      if (respawnFadeEl) respawnFadeEl.style.opacity = String(respawnFlash / respawnFlashMax);
    }

    updateCamera(frames === 0 ? 1 : dt);
    updateVisual(dt);

    visual.composer.render();
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
bossMesh.position.set(bossBody.position.x, bossBody.position.y, bossBody.position.z);
document.getElementById('retryBtn').addEventListener('click', () => location.reload());
document.getElementById('replayBtn').addEventListener('click', () => location.reload());

// Sound toggle (issue #11 §3): one icon button mutes music and SFX together.
function syncMuteBtn() {
  // style.display, not the hidden property: these are SVG elements and the
  // hidden IDL (HTMLElement-only) is a no-op expando on them.
  const off = isMuted();
  document.getElementById('soundOnIcon').style.display = off ? 'none' : 'inline';
  document.getElementById('soundOffIcon').style.display = off ? 'inline' : 'none';
}
document.getElementById('muteBtn').addEventListener('click', () => {
  unlockAudioAndMusic();
  setMuted(!isMuted());
  syncMuteBtn();
});
syncMuteBtn();
updateCamera(1);
updateVisual(1);
visual.composer.render();
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
        bossBody,
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
          cam: [+camera.position.x.toFixed(4), +camera.position.y.toFixed(4), +camera.position.z.toFixed(4)],
          anchor: [+anchorX.toFixed(4), +smoothGround.toFixed(4), +anchorZ.toFixed(4)],
          camDist: +camDist.toFixed(4),
          camBlockers: cameraBlockers.length,
          zone,
          pieces: [...pieces],
          safeSpot: { ...safeSpot },
          lastRespawn: lastRespawn ? { ...lastRespawn } : null,
          pickups: pickups.map((p) => ({ id: p.id, taken: p.taken })),
          music: musicSnapshot(),
          visual: visualSnapshot(visualCurrent, phase === 'lost' ? [] : pieces),
          boss: {
            pos: [
              +bossBody.position.x.toFixed(4),
              +bossBody.position.y.toFixed(4),
              +bossBody.position.z.toFixed(4),
            ],
            vel: [
              +bossBody.velocity.x.toFixed(4),
              +bossBody.velocity.y.toFixed(4),
              +bossBody.velocity.z.toFixed(4),
            ],
            hp: bossHp,
            state: bossState,
            fight: fightActive,
          },
        }),
        actions: { beginCharge, releaseFlick },
        params,
      })
    )
    .catch(() => {});
}

// Headless end-to-end: ?sim=N runs N fixed 1/60 steps synchronously, then
// reports the outcome in <title> for --dump-dom runs. No rAF needed.
// Dev-only scripts: &script=win keeps hurling the cube into the boss at max
// flick speed (naked max always wins); &script=trade arms the cube and parks
// it still so the boss collects pieces off it; &script=moatout records a disc
// safe spot and then drops the cube in the moat (exit must respawn on the
// disc); &script=cliff hurls the cube at the pass cliff face (it must stay on
// the level side).
{
  const simN = parseInt(params.get('sim') || '0', 10);
  if (Number.isFinite(simN) && simN > 0) {
    const script = params.get('script') || '';
    if (script === 'trade') {
      for (const id of ['dagger', 'sword', 'hammer']) {
        attachWeapon(THREE, CANNON, playerMesh, playerBody, id);
        pieces.push(id);
      }
      playerBody.velocity.set(0, 0, 0);
    }
    for (let i = 0; i < simN; i++) {
      if (script === 'win' && i > 0 && i % 10 === 0 && phase === 'playing') {
        playerBody.position.set(bossBody.position.x - 2, 1, bossBody.position.z);
        playerBody.velocity.set(PLAYER_MAX_FLICK_SPEED, 0, 0);
        playerBody.angularVelocity.set(0, 0, 0);
      }
      if (script === 'moatout' && i === 60 && phase === 'playing') {
        playerBody.position.set(ARENA_CENTER[0] + ARENA_MOAT_IN + 0.4, 1, ARENA_CENTER[1]);
        playerBody.velocity.set(0, 0, 0);
        playerBody.angularVelocity.set(0, 0, 0);
      }
      if (script === 'cliff' && i > 0 && i % 10 === 0 && phase === 'playing') {
        playerBody.velocity.set(0, 0, -PLAYER_MAX_FLICK_SPEED);
        playerBody.angularVelocity.set(0, 0, 0);
      }
      stepSim(1 / 60);
    }
    updateCamera(1);
    smoothZoneColor.copy(FOG_COLORS[zone]);
    snapVisualLayers({
      pieces: phase === 'lost' ? [] : pieces,
      zoneColor: smoothZoneColor,
      scene,
      camera,
      current: visualCurrent,
      gradeUniforms: visual.gradePass.uniforms,
      skyUniforms: visual.skyUniforms,
      skyMesh: visual.skyMesh,
    });
    visual.composer.render();
    document.title =
      `sim${simN} ${phase} boss:${bossState}/hp${bossHp}/fight${fightActive ? 1 : 0}` +
      ` pieces:${pieces.join(',') || '-'} mass:${playerBody.mass.toFixed(2)}` +
      ` ppos:${playerBody.position.x.toFixed(1)},${playerBody.position.y.toFixed(1)},${playerBody.position.z.toFixed(1)}` +
      ` bpos:${bossBody.position.x.toFixed(1)},${bossBody.position.z.toFixed(1)}` +
      ` resp:${lastRespawn ? lastRespawn.reason : '-'}` +
      ` anchor:${anchorX.toFixed(1)},${anchorZ.toFixed(1)}`;
  }
}
