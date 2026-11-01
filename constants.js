// Single place for every tunable gameplay number (spec section 15).
// Nothing gameplay-critical may be a magic number elsewhere.

export const PLAYER_MAX_FLICK_SPEED = 24; // u/s, Vmax (issue #3 fix 2 x2.0; was 12)
export const FULL_CHARGE_TIME = 1.5; // s, T
export const SPEED_CLAMP = 40; // u/s, Vclamp hard cap (issue #3 fix 2 x2.0; was 20)

export const PLAYER_GROUND_DRAG = 0.15; // linearDamping while grounded (issue #3 fix 1; was 0.5)
export const PLAYER_AIR_DRAG = 0.1; // linearDamping while airborne
export const BOSS_GROUND_DRAG = 0.1; // efficient roller (boss arrives later)
export const PLAYER_ANGULAR_DAMPING = 0.4; // tips wobble instead of vaulting

export const CUBE_MASS = 1.0;
export const DAGGER_MASS = 0.5;
export const SWORD_MASS = 1.0;
export const HAMMER_MASS = 2.0;

export const BOSS_MASS = 2.0;
export const BOSS_BUMP_SPEED = 10; // u/s (issue #3 fix 2 x2.0; was 5)
export const BOSS_ROLL_SPEED = 5; // u/s mid of 2-3 range x2.0 (issue #3 fix 2; was 2.5)
export const BOSS_HP = 3;
export const BUMP_INTERVAL = 4; // s fixed rhythm
export const WINDUP_DURATION = 1; // s, must be < arena-crossing time
export const BOSS_RADIUS = 0.9;
export const BOSS_BUMP_TIME = 1; // s, bump state duration before roaming again
export const BOSS_ROAM_RADIUS = 6; // roam waypoints orbit the arena center at this radius
export const BOSS_ROAM_RATE = 0.6; // rad/s waypoint orbit speed
export const BOSS_STEER_RATE = 3; // 1/s roam velocity easing toward desired
export const BOSS_WINDUP_DAMP = 8; // 1/s horizontal velocity decay while winding up
export const BOSS_ANGULAR_DAMPING = 0.1; // efficient roller
export const BOSS_SPAWN_Y = 2;
export const COMBAT_COOLDOWN = 1; // s between damage resolutions (one touch = 1 HP max)
export const MOMENTUM_TIE_EPS = 0.1; // |Δp| at/below this = tie, bounce, no damage

export const CAMERA_DISTANCE = 8;
export const CAMERA_HEIGHT = 5;
export const CAMERA_ANCHOR_RATE = 4; // 1/s anchor easing toward player XZ (issue #7)
export const CAMERA_DEADZONE = 0.75; // units, anchor deadzone (issue #7)
export const CAMERA_HEIGHT_RATE = 2; // 1/s smoothed-ground easing while grounded (issue #7)
export const CAMERA_LOOKAHEAD_TIME = 0.15; // s of smoothed velocity added to gaze (issue #7)
export const CAMERA_LOOKAHEAD_MAX = 1.5; // units, gaze lookahead clamp (issue #7)
export const CAMERA_VEL_RATE = 6; // 1/s low-pass on lookahead velocity (issue #7)
export const CAMERA_COLLISION_MARGIN = 0.3; // camera stops this far short of a blocker (issue #12)
export const CAMERA_MIN_DISTANCE = 1.5; // camera never closer; stays out of the character (issue #12)
export const CAMERA_DISTANCE_RATE = 4; // 1/s smoothed distance toward the raycast target (issue #12)
export const CAMERA_NEAR = 0.1; // camera.near; avoids slicing into a wall when pulled close (issue #12)
export const CAMERA_RAY_ORIGIN_HEIGHT = 0.5; // ray starts above the character center (issue #12)
export const ORBIT_SPEED = 2.2; // rad/s for A/D

export const DAMAGE_FLASH_TIME = 0.3; // s

// Core scene / physics defaults (also tunable here, not magic numbers).
export const FIXED_DT = 1 / 60;
export const MAX_FRAME_DT = 0.1; // clamp tab-switch jumps
export const GRAVITY_Y = -9.82;
export const PLAYER_SIZE = 1;
export const PLAYER_SPAWN = [0, 2, 6];
export const GROUND_FRICTION = 0.06;
export const GROUND_RESTITUTION = 0.05;

// Boss wind-up squash (fraction of the linear wind-up progress). The player
// charge squash is gone (issue #4): scaling fights the tumbling cube, so the
// four charge layers below replace it. The boss keeps its squash: crouching
// to pounce reads naturally on a ball.
export const SQUASH_Y = 0.35; // max Y compression at full wind-up
export const SQUASH_XZ = 0.18; // max XZ expansion at full wind-up
export const LAUNCH_STRETCH_TIME = 0.16; // s of un-squash pop on release

// Charge feedback (issue #4). Every layer is driven by the same quadratic
// chargeFraction that sets flick speed, so the visuals never lie about power.
// Palette is gold-white only: red belongs to the damage flash and the lava.
export const CHARGE_MOTES = 150; // player swarm pool (fixed, no per-frame alloc)
export const CHARGE_MOTE_SIZE = 0.22; // world units, sizeAttenuation on
export const CHARGE_MOTE_R_OUT = 1.7; // orbit radius at zero charge
export const CHARGE_MOTE_R_IN = 0.95; // orbit radius at full charge (hugs cube)
export const CHARGE_BURST_TIME = 0.4; // s the release burst takes to fade
export const BOSS_MOTES = 120; // boss wind-up swarm pool
export const BOSS_MOTE_SIZE = 0.26;
export const BOSS_MOTE_R_OUT = 2.2; // orbit radius at wind-up start
export const BOSS_MOTE_R_IN = 1.15; // orbit radius at bump (hugs ball)
export const CHARGE_GLOW_LOW = 0xc47a24; // dim amber at low charge
export const CHARGE_GLOW_HIGH = 0xfff3c4; // bright gold-white at full charge
export const CHARGE_GLOW_MAX = 0.12; // emissive intensity at full charge
export const CHARGE_PULSE_AMP = 0.1; // full-charge pulse amplitude
export const CHARGE_PULSE_FREQ = 10; // rad/s full-charge pulse
export const TREMBLE_POS = 0.035; // m, max mesh-only position jitter
export const TREMBLE_ROT = 0.03; // rad, max mesh-only rotation jitter
export const EYE_SQUINT = 0.7; // max eye Y compression at full charge
export const CHARGE_MOTE_TINT = 0xffe9b0; // warm gold-white motes (never red)

// Futurism lines of force (issue #10). All visual-only: thresholds decide when
// an effect appears, never how the game plays. Gold-white family only; red
// stays reserved for the damage flash and the lava. Past motion only: nothing
// here may appear before a release or indicate a future direction.
export const GHOST_MIN_SPEED = 4; // u/s, echoes only above this speed
export const GHOST_INTERVAL = 0.08; // s, snapshot cadence while fast
export const GHOST_COUNT = 6; // pool size / trail length
export const GHOST_FADE = 0.5; // s, echo lifetime
export const GHOST_OPACITY_MAX = 0.22; // newest echo opacity; oldest fades to 0
export const STREAK_COUNT = 12; // lines per release burst
export const STREAK_LEN_MIN = 0.5; // units, per-streak variation floor
export const STREAK_LEN_MAX = 1.0; // units, per-streak variation ceiling
export const STREAK_FADE = 0.3; // s, release burst lifetime
export const STREAK_POOL = 40; // shared release + high-speed pool (fixed)
export const STREAK_THICK = 0.05; // units, thin boxes stay visible at distance
export const STREAK_OPACITY = 0.55; // release burst base opacity
export const SPEED_STREAK_MIN = 8; // u/s, higher bar than the ghost echoes
export const SPEED_STREAK_LIFE = 0.25; // s, per-streak lifetime while fast
export const SPEED_STREAK_OPACITY = 0.2; // faint shimmer, never obscuring
export const SPEED_STREAK_RATE = 4; // spawns/s per u/s above the threshold
export const BOSS_LINES = 14; // wind-up force-line pool (fixed)
export const BOSS_LINE_LEN_MIN = 0.5; // units
export const BOSS_LINE_LEN_MAX = 0.9; // units
export const BOSS_LINE_OPACITY = 0.5; // full wind-up ceiling; pulses below it
export const ROLL_NOISE_MIN_SPEED = 4; // u/s, bed silent below this
export const ROLL_NOISE_MAX = 0.025; // gain ceiling: garnish, never masks cues

// Layered music (issue #11). Four 180 s stems on one timeline: base + one
// per weapon. Unlock ramps 0->1 in ~1 s (tau 0.3); damage fade-out ~0.5 s;
// game-over ramp to 0 ~1 s. Master bed sits below the SFX cues, never masking.
export const MUSIC_TRACK_LEN = 180; // s, all stems share one timeline
export const MUSIC_MASTER_GAIN = 0.8; // bed below the SFX cues
export const MUSIC_UNLOCK_TAU = 0.3; // s, weapon-collect fade-in
export const MUSIC_LOCK_TAU = 0.15; // s, damage fade-out (default: layers follow HP)
export const MUSIC_STOP_TAU = 0.3; // s, game-over fade to 0

// Audio tuning.
export const CHARGE_TONE_BASE = 150; // Hz at zero charge
export const CHARGE_TONE_TOP = 620; // Hz at full charge
export const CHARGE_TONE_GAIN = 0.06;
export const PICKUP_TONE_BASE = 660; // Hz of first pickup chime
export const PICKUP_TONE_STEP = 0.25; // pitch rises this fraction per pickup

// World layout (issue #2). Rects are {x0,x1,z0,z1} ground footprints.
// Village hub at origin; beach west; forest north (-Z); pass east; arena far east.
export const ZONE_VILLAGE = { x0: -20, x1: 20, z0: -20, z1: 20 };
export const ZONE_BEACH = { x0: -60, x1: -20, z0: -20, z1: 20 };
export const ZONE_FOREST = { x0: -20, x1: 20, z0: -60, z1: -20 };
export const ZONE_PASS = { x0: 20, x1: 44, z0: -6, z1: 6 };
export const ZONE_ARENA = { x0: 44, x1: 72, z0: -14, z1: 14 };
export const ARENA_CENTER = [58, 0];

// Shoreline: invisible wall here, water plane beyond (visual only).
export const SHORE_X = -52;

// Boundary walls. [cx, cy, cz, sx, sy, sz, style]
// Styles: concrete (village, issue #14), dune (beach), treeline (forest), rock (pass/arena).
export const WALLS = [
  // Beach: tall north/south walls spanning all shelf levels (y -6..2), and a
  // low dune ridge along the shore with a pier gap (z 4..6).
  [-40, -2, -20.5, 42, 8, 1, 'dune'],
  [-40, -2, 20.5, 42, 8, 1, 'dune'],
  [SHORE_X, -5.4, -8.5, 1, 1.2, 25, 'dune'],
  [SHORE_X, -5.4, 13.5, 1, 1.2, 15, 'dune'],
  // Village: south + east segments (pass opening z in [-6,6]).
  // Issue #14: concrete + planting instead of wood + hedge. Same line,
  // same backstop rule — only the dressing material changes.
  [0, 1, 20.5, 42, 2, 1, 'concrete'],
  [20.5, 1, -13.25, 1, 2, 14.5, 'concrete'],
  [20.5, 1, 13.25, 1, 2, 14.5, 'concrete'],
  // Forest: west, east, north.
  [-20.5, 1, -40, 1, 2, 42, 'treeline'],
  [20.5, 1, -40, 1, 2, 42, 'treeline'],
  [0, 1, -60.5, 42, 2, 1, 'treeline'],
  // Pass corridor sides. Extended east (x .. 47.5) to meet the arena mouth
  // gate pillars (issue #9): the corridor walls run into the gate, leaving
  // no gap between the corridor and the crater ring ends.
  [33.25, 1.5, -6.5, 28.5, 3, 1, 'rock'],
  [33.25, 1.5, 6.5, 28.5, 3, 1, 'rock'],
  // Arena (issue #9): no rectangular walls. The boundary is the circular
  // collider ring (ARENA_RING_* + arenaRingLayout in game.js), rendered and
  // collided from the same shared layout.
];

// Hills: buried spheres the player rolls over. [cx, cy, cz, radius]
// Beach dunes sit on the lowered beach (base y -6); crests stay ~1.5 above it.
// Forest (issue #8): 4 rolling hills, all clear of the winding paths, pond,
// stream, and grove. The lookout (-8,-47, crest 3) sees the giant tree.
export const HILLS = [
  [-50, -11.5, -13, 7], // beach north dune (crest y -4.5)
  [-51.5, -10.5, 18.5, 6], // beach south dune (crest y -4.5)
  [15, -5.2, -32, 7], // forest east (crest y 1.8)
  [-8, -3, -47, 6], // forest lookout (crest y 3)
  [-15, -6, -30, 8], // forest west (crest y 2)
  [8, -6.5, -55, 8], // forest north (crest y 1.5)
];

// Trees: [x, z, trunkH, canopyR, canopyKind, greenIdx].
// Forest (issue #8): 53 trees in 6 thicket walls + entrance scatter + slalom
// posts. Walls use exact 1.3-1.4 spacing (impassable); gaps are 2.8+ (doors).
// Path-side trees are tall (3.5+) with small canopies so the camera looks
// under them; thicket interiors stay low and dense. Validated: every trunk is
// 2+ from path centerlines (except slalom/door exceptions) and no two trunks
// trap (pairwise gaps either impassable or open, midpoint-checked).
export const TREES = [
  // Thicket SW (7): west wall of the entrance/pond path, nook gap mid-line.
  [-8.5, -27, 2.38, 1.85, 'cone', 0],
  [-8.5, -28.4, 2.69, 1.62, 'blob', 1],
  [-8.5, -31.2, 2.51, 1.54, 'cone', 2],
  [-8.5, -32.6, 2.3, 1.98, 'blob', 3],
  [-8.5, -34, 2.28, 1.52, 'cone', 0],
  [-7.1, -34, 2.65, 1.89, 'blob', 1],
  [-5.7, -34, 2.42, 1.75, 'cone', 2],
  // Thicket SE (7): east wall, nook gap mid-line.
  [11.5, -28, 2.27, 1.93, 'blob', 3],
  [11.5, -29.4, 2.74, 1.76, 'cone', 0],
  [11.5, -30.8, 2.59, 1.65, 'blob', 1],
  [11.5, -33.6, 2.39, 2, 'cone', 2],
  [11.5, -35, 2.23, 1.72, 'blob', 3],
  [12.8, -28, 2.35, 1.93, 'cone', 0],
  [14.2, -28, 2.52, 1.59, 'blob', 1],
  // Thicket CW (6): west wall of the winding corridor, pocket gap mid-line.
  [-6, -39.5, 2.26, 2, 'cone', 2],
  [-6, -40.9, 2.21, 1.98, 'blob', 3],
  [-6, -42.3, 2.44, 1.72, 'cone', 0],
  [-6, -45.1, 2.38, 1.85, 'blob', 1],
  [-6, -46.5, 2.42, 1.63, 'cone', 2],
  [-6, -47.9, 2.7, 1.79, 'blob', 3],
  // Thicket C2 divider (4): between winding and shortcut corridors.
  [2.3, -41.5, 3.66, 1.32, 'cone', 0],
  [2.3, -42.67, 3.67, 1.48, 'blob', 1],
  [2.3, -43.83, 3.64, 1.44, 'cone', 2],
  [2.3, -45, 3.87, 1.4, 'blob', 3],
  // Thicket C2 east (6): east wall of the shortcut corridor.
  [7, -40, 3.68, 1.35, 'cone', 0],
  [7, -41.4, 3.55, 1.44, 'blob', 1],
  [7, -42.8, 3.52, 1.42, 'cone', 2],
  [7, -44.2, 3.56, 1.34, 'blob', 3],
  [7, -45.6, 3.88, 1.32, 'cone', 0],
  [7, -47, 3.81, 1.35, 'blob', 1],
  // Thicket NE (7): north-east wall above the rejoin.
  [5, -53, 2.36, 1.55, 'cone', 2],
  [6.4, -53, 2.51, 1.55, 'blob', 3],
  [7.8, -53, 2.24, 1.74, 'cone', 0],
  [9.2, -53, 2.46, 1.81, 'blob', 1],
  [10.6, -53, 2.62, 1.77, 'cone', 2],
  [5, -54.4, 2.38, 1.92, 'blob', 3],
  [5, -55.8, 2.6, 1.6, 'cone', 0],
  // Grove ring (10): radius 5.5 around the giant tree, door east (slot 0).
  // First and last are the taller door flankers.
  [-7.77, -52.3, 3.6, 1.4, 'blob', 1],
  [-9.77, -49.55, 2.32, 1.82, 'cone', 2],
  [-13, -48.5, 2.51, 1.89, 'blob', 3],
  [-16.23, -49.55, 2.33, 1.65, 'cone', 0],
  [-18.23, -52.3, 2.77, 1.63, 'blob', 1],
  [-18.23, -55.7, 2.74, 1.58, 'cone', 2],
  [-16.23, -58.45, 2.33, 1.53, 'blob', 3],
  [-13, -59.5, 2.48, 1.62, 'cone', 0],
  [-9.77, -58.45, 2.37, 1.93, 'blob', 1],
  [-7.77, -55.7, 3.6, 1.4, 'cone', 2],
  // Entrance scatter (3).
  [-4.2, -23.5, 2.2, 1.51, 'blob', 3],
  [4.3, -24.5, 2.55, 1.77, 'cone', 0],
  [-3.5, -27.5, 2.63, 1.94, 'blob', 1],
  // Slalom posts (3): weave inside the shortcut corridor, alternating sides.
  [3.4, -42.33, 3.7, 1.4, 'cone', 2],
  [5.9, -44.2, 3.7, 1.4, 'blob', 3],
  [3.1, -46, 3.7, 1.4, 'cone', 0],
  // Village shade trees (off roads, plaza, spurs, and sightlines).
  [-17.5, 4, 2.6, 1.6, 'blob', 1],
  [-4, 16, 2.2, 1.4, 'cone', 2],
  [16, -5, 3.0, 1.8, 'blob', 0],
  [5, -16, 2.4, 1.5, 'cone', 3],
  [-18, -15, 2.8, 1.7, 'blob', 2],
  [17.5, 7.5, 2.0, 1.3, 'cone', 1],
];
export const TRUNK_RADIUS = 0.35;

// Rocks: [x, z, size, groundY]. Squashed dodecahedrons.
// Shelf-top bumpers, sword-cove frame (open east), ramp-bottom framers,
// beach obstacles, and sea rocks beyond the ridge (seen, not reached).
export const ROCKS = [
  [-23, -8, 1.3, 0], // S0 bumper
  [-27, 10, 1.1, 0], // S0 bumper
  [-32, 0, 1.4, -2.2], // S1 bumper
  [-40, 7, 1.3, -4.4], // S2 bumper
  [-49, 5.5, 1.4, -6], // cove north
  [-49, 0.5, 1.4, -6], // cove south
  [-51, 3, 1.2, -6], // cove west
  [-50.5, 4.5, 1.0, -6], // cove NW
  [-50.5, 1.5, 1.0, -6], // cove SW
  [-47.5, 12.5, 1.2, -6], // gentle-ramp framer
  [-48, 16.8, 1.3, -6], // gentle-ramp framer
  [-49, -4.5, 1.1, -6], // steep-ramp framer
  [-47, -7, 1.2, -6], // north beach
  [-51, 6.5, 1.0, -6], // pier-base rock
  [-58, 8, 1.3, -6.5], // sea rock
  [-59, -2, 1.0, -6.5], // sea rock
];

// Village blocks (issue #14 Brutalist rework): [x, z, rotY, bodyTone, roofTone, bodyH, roofKind].
// Same XZ footprints and rotations as the old huts (layout unchanged: plaza,
// roads, spurs, and sightlines keep their clearance), but the bodies are now
// concrete monoliths 8-14x the player cube height. Plaza-facing blocks sit at
// the tall end; secondary blocks at the low end. bodyTone picks the concrete
// shade (0 light / 1 dark); roofTone picks the stepped-crown variant.
export const HUTS = [
  [-13, 12.5, 2.03, 0, 0, 12, 1], // west bridge block
  [13, 12.5, -2.03, 1, 1, 11, 0], // east bridge block
  [-13, -12, 0.83, 1, 2, 17, 1], // plaza block (tallest)
  [13, -12, -0.83, 0, 1, 16, 0], // plaza block (tallest)
  [-6, -14, 1.45, 0, 0, 12, 0], // north road block
  [11.5, 4.5, 3.06, 1, 2, 14, 1], // east road block (clear of the plaza camera orbit)
  [-14, -4.5, 0.15, 0, 1, 11, 0], // west road block
];
// Second-wave massing (deeper rework): slim gate/corner towers and low
// street-canyon bars. All axis-aligned; every rect is clearance-checked
// (roads, spurs, plaza, channel, sightlines, props) — see the commit.
// Towers: [x, z, footprint, height]. Plaza pair frames the north road;
// corners anchor the map edges.
export const VILLAGE_TOWERS = [
  [-7, -18.5, 2.6, 13], // forest-gate west pylon
  [7.5, -18.5, 2.6, 13], // forest-gate east pylon
  [-11, -18, 3, 18], // north-west landmark
  [17, 16.5, 2.8, 16], // south-east landmark (merges with the H2 block)
];
// Bars: [cx, cz, lengthX, thickZ, height]. They wall the east road into a
// canyon; the north bar fuses with the H6 block as stepped massing.
export const VILLAGE_BARS = [
  [11.5, 4.6, 10, 2.4, 9], // north of the east road
  [12, -4.6, 6, 2.4, 10], // south of the east road
];
// Retired by issue #14: the timber/shutter/flowerbox hut dressing is gone.
// Kept (unused) so the shape of the old spec stays visible in one place.
export const HUT_FEATURES = [
  ['timber', 'chimney', 'porch'],
  ['windows', 'flowerbox', 'wallbase'],
  ['timber', 'chimney', 'garden'],
  ['porch', 'wallbase', 'windows'],
  ['windows', 'flowerbox'],
  ['timber', 'chimney'],
  ['porch', 'wallbase'],
];
export const HUT_BODY = [4, 2.5, 3.5]; // sx, sy, sz footprint (sy unused; per-block bodyH wins)

// Spur paths from hut doors to roads/bridges/plaza. [cx, cz, sx, sz, rotY].
export const SPURS = [
  [-9.7, 11.85, 3.4, 1.2, -0.09], // H1 door -> west bridge
  [9.7, 11.85, 3.4, 1.2, 0.09], // H2 door -> east bridge
  [-8.05, -7.43, 9.92, 1.2, -0.744], // H3 door -> plaza
  [8.05, -7.43, 9.92, 1.2, 0.744], // H4 door -> plaza
  [-2.87, -13.79, 2.74, 1.2, 0], // H5 door -> north road
  [11.64, 2.1, 1.2, 1.3, 0], // H6 door -> east road
  [-13.73, -2.12, 1.2, 1.25, 0], // H7 door -> west road
];

// Village props with colliders. All clear of roads, spurs, plaza, sightlines.
// Crates: [x, z, rotY, size, dy, baseY] (dy stacks on another crate).
export const CRATES = [
  [-9.7, 13.8, 0.2, 0.8, 0],
  [-9.7, 13.8, 0.35, 0.7, 0.8],
  [9.7, 13.8, -0.15, 0.8, 0],
  [9.7, 13.8, 0.1, 0.7, 0.8],
  [-18.5, -8, 0.4, 0.9, 0],
  [16.5, -13.5, -0.3, 0.85, 0],
  [-49.5, 7.8, 0.2, 0.8, 0, -6], // beach, by the boat
  [-49.5, 6.9, -0.1, 0.75, 0, -6], // beach, by the boat
  [-57.5, 4.2, 0.1, 0.7, 0, -5.7], // pier-end platform
];
// Barrels: [x, z, baseY]. r 0.35, h 0.9.
export const BARRELS = [
  [-16.5, 12],
  [-16.5, 13],
  [16.5, 12],
  [16.5, 13],
  [-49, 7.6, -6],
  [-48.2, 7.9, -6],
  [-57.5, 5.9, -5.7], // pier-end platform
];
// Fence runs: [x1, z1, x2, z2, baseY] (posts + two rails + net on the shore run).
// The shore run is short on purpose: it must leave passable gaps at both ends.
export const FENCES = [
  [-8.6, -9.5, -8.6, -13.5], // H3 garden
  [2.2, -6, 2.2, -12], // north road edging
  [-50, 11, -48, 11, -6], // shore run with draped net
  [2, 12.3, 6, 12.3], // channel bank
  // H6 garden run retired: the north street-canyon bar now stands on its line.
];
// Benches: [x, z, rotY, baseY]. Plaza bench sits off-axis so it never blocks the spawn view.
export const BENCHES = [
  [-3.5, 6.8, 0.15],
  [-7.5, 2.5, 0.3],
  [-47, -8, 1.57, -6], // north beach rest spot
];
// Lantern posts: [x, z].
export const LANTERNS = [
  [4.5, 4.5],
  [-4.5, 4.5],
  [-10, 2.5],
  [9, 2.2],
  [-2.5, -8],
];
// Market stall [x, z, rotY], well [x, z], cart [x, z, rotY].
export const STALL = [7, -3.5, 0.2];
export const WELL = [-7, -4];
export const CART = [8.5, -15.5, 0.3];
// Signposts: [x, z, rotY, kind]. Pictogram shapes only, never text.
export const SIGNS = [
  [-17, 2.8, 1.57, 'fish'],
  [2.8, -17, -0.1, 'boat'],
  [-22, 4.5, 1.57, 'sword'], // beach gate: the sword is that way
  [2.5, -21.5, 0, 'hammer'], // forest gate: the hammer is that way (north)
  [2.0, -37, -1.2, 'hammer'], // forest fork: hammer along the winding path
];
// Big bushes with colliders: [x, z, r].
export const BUSH_BIG = [
  [-9.5, -14.5, 0.9],
  [12.3, 7.7, 0.9],
  [-4, 7.6, 0.8],
];
// Flower pots (visual): [x, z]. Retired by issue #14 (hut-door dressing).
export const POTS = [
  [-10.6, 12.6],
  [10.6, 12.6],
  [-12.16, -9.86],
  [12.16, -9.86],
  [-3.86, -12.74],
];
// Ground patches (visual): [x, z, r, tone]. dirt/grass/sand/garden.
export const PATCHES = [
  [-11.4, 11.7, 1.3, 'dirt'],
  [11.4, 11.7, 1.3, 'dirt'],
  [-11.7, -10.8, 1.4, 'dirt'],
  [11.7, -10.8, 1.4, 'dirt'],
  [-4.24, -13.79, 1.2, 'dirt'],
  [11.64, 2.74, 1.2, 'dirt'],
  [-13.73, -2.75, 1.2, 'dirt'],
  [-8, -18, 1.8, 'grass'],
  [10, -17, 1.5, 'grass'],
  [-17, 3, 1.6, 'sand'],
  [6.5, 2.5, 1.3, 'dirt'],
  [-2.5, -6.8, 1.3, 'dirt'],
  [-9.5, -11.5, 1.0, 'grass'],
];
// Laundry line: [x1, z1, x2, z2] (posts + line + cloth, visual).
// Retired by issue #14 (hut-door dressing, dollhouse clutter).
export const LAUNDRY = [-9, -16, -11, -16];
// Gates: beach (shore road) and forest (treeline) posts + beam.
// [x, z, rotY, postH, halfGap]. Posts at local x +/- halfGap.
export const GATES = [
  [-20, 0, 1.57, 3.0, 2.2],
  [0, -20, 0, 3.4, 2.0],
];
// Beached boat [x, z, rotY, baseY] and rope coil [x, z, baseY].
// On the lowered beach south of the sword cove; leaves 1.6 gaps each side.
export const BOAT = [-49, 8.5, 0.15, -6];
export const ROPE = [-51.5, 6.3, -6];
// Pier: deck from the dune gap toward the sea. [x0, x1, z, width, topY].
// Deck top sits 0.3 above the beach; the sea surface is 0.8 below the deck.
export const PIER = [-52, -57, 5, 1.6, -5.7];
// Pier-end platform: [cx, cz, size]. Deck top, wider than the walkway.
export const PIER_PLATFORM = [-57.5, 5, 2.5];
// Gulls: [cx, h, cz, r, speed]. Clouds: [x, y, z, s].
export const GULLS = [
  [-55, 3.5, -2, 5, 0.25],
  [-58, 5, 4, 6, 0.2],
  [-52, 4.2, -6, 4, 0.3],
];
export const CLOUDS = [
  [-10, 26, -5, 4],
  [8, 28, 8, 5],
  [0, 25, -25, 3.5],
  [-25, 27, 10, 4.5],
];
export const SCATTER_SEED = 7;
export const SCATTER_COUNT = 40;

// Village water channel: strip across the village at this z range.
export const CHANNEL_Z0 = 9;
export const CHANNEL_Z1 = 11;
// Bridges over the channel: [x, width]. Crest height and slope from constants.
export const BRIDGES = [
  [-8, 3],
  [8, 3],
];
export const BRIDGE_CREST_H = 0.7;
export const BRIDGE_SPAN = 4; // z length covered (channel + margins)
export const BRIDGE_THICK = 0.3;

// Stone arch at the pass entrance.
export const ARCH = { x: 22, pillarGap: 3, pillarSize: 1.2, pillarH: 3, lintelH: 0.8 };

// Weapon pickups: [id, x, baseY, z].
export const PICKUPS = [
  ['dagger', 0, 1.8, 0], // floats over the concrete monolith pedestal (cap top ~1.6)
  ['sword', -49, -5.2, 3], // floats over its cove pedestal (beach base -6)
  ['hammer', -11, 1.0, -53],
];
export const PICKUP_TOUCH_DIST = 1.5;

// Beach terraces (issue #6): layered shelves stepping down east -> west.
// S0 top is flush with the village (y 0); the beach proper sits at -6;
// west of x -52 there is no ground, only the sea (visual).
export const BEACH_BASE_Y = -6;
export const BEACH_SLAB = { x0: -52, x1: -20, z0: -20, z1: 20 };
export const SEA_TOP_Y = -6.5;
// Shelves: [x0, x1, topY]. Full beach width in z (z -20..20).
export const BEACH_SHELVES = [
  [-30, -20, 0], // S0 entry terrace
  [-38, -30, -2.2], // S1
  [-46, -38, -4.4], // S2 fork shelf
];
// Ramps: [xEast, xWest, zCenter, width, topEast, topWest].
// R01 north, R12 south (switchbacks); the S2->beach fork splits gentle/steep.
export const BEACH_RAMPS = [
  [-28.5, -33.5, -14, 3.5, 0, -2.2], // R01 north switchback
  [-36.5, -41.5, 14, 3.5, -2.2, -4.4], // R12 south switchback
  [-44.5, -50.5, 14, 4.0, -4.4, -6], // gentle fork -> pier end
  [-45.0, -48.0, -2, 2.5, -4.4, -6], // steep fork -> sword cove
];
export const BEACH_RAMP_THICK = 0.3;
// Cliff-edge parapets: [edgeX, z0, z1, baseY]. Gaps at ramps and at the two
// shortcut drops (S0->S1 z 6.5..9.5, S1->S2 z -9.5..-6.5).
export const BEACH_PARAPETS = [
  [-30, -20, -16.5, 0],
  [-30, -11.5, 6.5, 0],
  [-30, 9.5, 20, 0],
  [-38, -20, -9.5, -2.2],
  [-38, -6.5, 11.5, -2.2],
  [-38, 16.5, 20, -2.2],
  [-46, -20, -3.75, -4.4],
  [-46, -0.25, 11.5, -4.4],
  [-46, 16.5, 20, -4.4],
];
export const BEACH_PARAPET_H = 1.0;
export const BEACH_PARAPET_T = 0.6;
// Cairns (way down markers): [x, z, baseY]. The steep fork gets two.
export const BEACH_CAIRNS = [
  [-28.5, -16.8, 0],
  [-36.5, 16.8, -2.2],
  [-44.5, 16.8, -4.4],
  [-44.5, -4.5, -4.4],
  [-44.5, 0.5, -4.4],
];
// Standing stones: [x, z, baseY, h]. Distant landmarks, clear of the route.
export const BEACH_STONES = [
  [-24, 16, 0, 3.0],
  [-31, 16, -2.2, 2.6],
  [-39, -17, -4.4, 2.8],
];
// Sword cove [x, z] on the beach base; hammer pedestal [x, z] on y 0.
// Both pedestals are permanent world geometry (only weapons despawn).
export const SWORD_COVE = [-49, 3];
export const HAMMER_PEDESTAL = [-11, -53];
// Tide pools: [x, z, r]. Beach level, visual-only.
export const TIDE_POOLS = [
  [-50, -6, 0.9],
  [-50.8, 9.5, 0.8],
];
// Driftwood: [x, z, rotY, len, twoSeg]. Visual-only.
export const DRIFTWOOD = [
  [-46.5, 10, 0.4, 2.0, false],
  [-49.5, 12.5, -0.3, 1.6, true],
  [-47.5, -5, 0.9, 1.8, false],
  [-51, -2, 0.2, 2.2, true],
  [-49, -9, -0.7, 1.5, false],
];
// Seaweed strips: [x, z, rotY]. Visual-only.
export const SEAWEED = [
  [-51.3, -8, 0.3],
  [-51.3, -3, -0.2],
  [-51.5, 7.5, 0.5],
  [-51.3, 11, 0.1],
];
// Sand patches: [x, z, r, tone]. tone 0 pale, 1 dark. Visual-only.
export const SAND_PATCHES = [
  [-48, -9, 1.5, 0],
  [-48.5, 5, 1.2, 1],
  [-49.5, 11, 1.2, 0],
];
// Shelf bushes (visual): [x, z, baseY, r].
export const SHELF_BUSHES = [
  [-21.5, -18, 0, 0.45],
  [-21.5, 18, 0, 0.4],
  [-31, -18, -2.2, 0.45],
  [-37, 17.5, -2.2, 0.4],
  [-39, -18, -4.4, 0.45],
  [-39, 18, -4.4, 0.4],
];
// Dune-crest grass: [x, z, baseY].
export const DUNE_GRASS = [
  [-50.5, -13.5, -4.5],
  [-49.5, -12.5, -4.5],
  [-50, -12, -4.5],
  [-51, 18, -4.5],
  [-50.8, 19, -4.5],
  [-50.5, 18.2, -4.5],
];
export const BEACH_SHELL_COUNT = 40;
export const BEACH_SHELL_SEED = 21;
export const BEACH_TUFT_SEED = 22;
export const BEACH_TUFTS_PER_SHELF = [10, 8, 6];

// Attached-weapon anchors on cubebot (visual offsets; colliders match).
// Measured from blend/cubebot.glb (body normalized x0.5): the blades plug the
// dark side socket plates (right = dagger, left = sword, mirrored as before),
// the hammer lies head-forward out of the mouth socket plate. rot is the
// visual euler applied to the weapon group.
export const ANCHOR = {
  dagger: { pos: [0.59, 0.13, -0.04], collider: [0.7, 0.13, -0.04], half: [0.42, 0.13, 0.07], rot: [0, 0, 0] },
  sword: { pos: [-0.59, -0.06, -0.03], collider: [-0.9, -0.06, -0.03], half: [0.65, 0.15, 0.08], rot: [0, Math.PI, 0] },
  hammer: { pos: [0.12, -0.19, 0.35], collider: [0.12, -0.19, 0.35], half: [0.2, 0.2, 0.5], rot: [Math.PI / 2, 0, 0] },
};
// Victory anchor: the boss ball rides on the back (-Z, opposite the face).
// Raised so its bottom sits ~flush with the cube's bottom.
export const BOSS_ANCHOR = { pos: [0, 0.35, -1.0], collider: [0, 0.35, -1.0] };

// Fog per zone (color-as-map). Density shared; colors lerp on crossing.
export const FOG_DENSITY = 0.012;
export const FOG_VILLAGE = 0xc8bfa5; // straw haze
export const FOG_BEACH = 0xc3d3d6; // pale sea haze
export const FOG_FOREST = 0x93a584; // green gloom
export const FOG_PASS = 0x6b6560; // darkening rock
export const FOG_ARENA = 0x171114; // near-black with red glow
export const FOG_LERP_SPEED = 1.2; // 1/s

// Light rig: hemisphere + one shadowed directional that follows the player.
export const HEMI_SKY = 0xe8e0cc;
export const HEMI_GROUND = 0x5a5348;
export const HEMI_INTENSITY = 0.9;
export const SUN_COLOR = 0xfff2dd;
export const SUN_INTENSITY = 1.4;
export const SUN_OFFSET = [12, 18, 8]; // relative to player
export const SHADOW_MAP_SIZE = 1024;
export const SHADOW_EXTENT = 40; // half-width of shadow camera box (widened for the tall village slabs, issue #14)
export const SHADOW_FAR = 120; // shadow camera depth (covers the slab tops, issue #14)

// Palette (zone ground tones; lava red is the only saturated color).
export const COL_VILLAGE_GROUND = 0xada07c;
export const COL_PLAZA = 0xc4b48f;
export const COL_ROAD = 0xc9b98f;
export const COL_BEACH_GROUND = 0xd6c294;
export const COL_FOREST_GROUND = 0x71835c;
export const COL_HILL_BEACH = 0xc9b586;
export const COL_HILL_FOREST = 0x66794f;
export const COL_PASS_GROUND = 0x4a4548;
export const COL_ARENA_GROUND = 0x302b36;
export const COL_ROCK = 0x8a8d90;
export const COL_TRUNK = 0x6b5138;
export const COL_CANOPY = [0x4f6b3f, 0x5d7a45, 0x42592f, 0x6b8a4e];
export const COL_HUT_BODY = [0xcbbfa5, 0x7a6248];
export const COL_HUT_ROOF = [0xb99c5e, 0x6e5a42];
export const COL_THATCH = 0x9a7f4e; // third roof tone (hut roofTone 2)
export const COL_PLAZA_RING = 0xb0a284;
export const COL_ROAD_WEAR = 0xbfae83; // center wear + spur paths
export const COL_SHORE = 0xc0aa7e; // wet sand near the water
export const COL_DIRT = 0x99885f;
export const COL_PATCH_GRASS = 0x7d8f60;
export const COL_PATCH_SAND = 0xc4b183;
export const COL_WOOD_DARK = 0x4f3d2a; // timber framing, gates, cart bed
export const COL_DOOR = 0x6b4f33;
export const COL_GLASS = 0x2b3038;
export const COL_STONE = 0x8d8a80;
export const COL_CLOTH = [0xcfc39e, 0x8fa3b8, 0xc4a4a4]; // muted cream/blue/pink
export const COL_FLOWER = [0xe8e2d2, 0xd9c26a, 0xc49a9a]; // muted white/yellow/pink
export const COL_BUSH = [0x5a703f, 0x4a6136, 0x6b7f47];
export const COL_GULL = 0xe5e0d2;
export const COL_CLOUD = 0xf5f2e8;
export const COL_NET = 0x9aa08e;
export const COL_WALL_FENCE = 0x7a6248;
export const COL_WALL_CONCRETE = 0x8f8e8a; // village boundary dressing (issue #14)
// Brutalist village palette (issue #14): raw board-marked concrete in two
// shared shades, near-black inset windows. Matte throughout. Lava red stays
// the only saturated color; the warm sand ground and muted green planting
// are untouched.
export const COL_CONCRETE = 0x9b9b97;
export const COL_CONCRETE_DARK = 0x84837f;
export const COL_WINDOW = 0x17191c;
export const COL_WALL_DUNE = 0xbfae82;
export const COL_WALL_TREELINE = 0x3d4a33;
export const COL_WALL_ROCK = 0x3d3844;
export const COL_ARCH = 0x7d7a72;
export const COL_WATER = 0x7fa8b8;
export const COL_BRIDGE = 0x8a7154;
export const COL_LAVA = 0xff2200;
export const COL_PLAYER = 0xe8873a;
export const COL_EYE = 0x1c1a18;
// Beach terrace palette: grassy tops stepping down to sand, rock strata faces.
export const COL_SHELF_TOP = [0x8f9a68, 0x9aa06e, 0xb0a179];
export const COL_STRATA = 0x7a6a55;
export const COL_RAMP = 0xa08b66;
export const COL_DRIFTWOOD = 0x7a6a58;
export const COL_SEAWEED = 0x3d5a3a;
export const COL_TIDE_POOL = 0x5a8a9a;
export const COL_FOAM = 0xf5f2e8;
export const COL_SAND_PALE = 0xe0cfa5;
export const COL_SAND_DARK = 0xc4b183;
export const COL_SHELL = [0xe8e2d2, 0xd9b8b8, 0xb9b9b9];
// Forest palette (issue #8): moss, leaf litter, mushrooms (muted cream/tan,
// never saturated red), ferns, stump tops, shafts, fireflies.
export const COL_MOSS = 0x4a5a35;
export const COL_LEAF_LITTER = 0x7a6a45;
export const COL_MUSHROOM_STEM = 0xd8cfb8;
export const COL_MUSHROOM_CAP = 0xb8a080;
export const COL_FERN = 0x4f7a3f;
export const COL_STUMP_TOP = 0xa89060;
export const COL_SHAFT_FOREST = 0xd8e8c0;
export const COL_SHAFT_ARENA = 0xff2200; // lava red: salmon read as brown columns (issue #9)
export const COL_FIREFLY = 0xb8c86a;

// Forest zone layout (issue #8): a grove you navigate. Thickets are walls,
// clearings are rooms, paths wind and fork. All validated for path clearance
// (2+ from centerlines) and no-trap gaps (see the layout generator notes).
//
// Giant old tree: [x, z, trunkH, trunkR, canopyR]. The beacon; canopy darkest
// green (COL_CANOPY[2]), pokes above every other canopy.
export const GIANT_TREE = [-13, -54, 6, 0.8, 4];
// Pond clearing: [x, z, r]. Visual-only disc, no water physics.
export const FOREST_POND = [7, -35, 2];
// Winding dirt paths: [cx, cz, sx, sz, rotY] overlapping strips, ~3 wide.
// Main gate->pond->fork->lookout->grove, slalom shortcut, and spur patches.
export const FOREST_PATHS = [
  // Main: gate through the entrance clearing toward the pond.
  [0, -22, 3, 5, 0],
  [0.5, -26, 3, 4.5, 0.12],
  [2, -29.5, 3, 4.5, 0.35], // dip logs sit across this strip
  [4, -32.5, 3, 4, 0.25],
  [4, -35.5, 3, 4, 0], // pond west edge
  [3.5, -38, 4, 3, 0], // fork pad: winding west, shortcut east
  // Winding branch: fork -> log bridge -> lookout -> grove door.
  [2, -38.8, 3, 2.5, 0.3],
  [-1, -42.2, 3, 3.5, 0.15],
  [-2, -44.5, 3.5, 4, 0],
  [-2, -48, 3, 3.5, 0.1],
  [-4.5, -51, 3, 4, 0.6],
  [-9.25, -53.5, 3, 4, -1.29], // grove door -> pedestal
  // Slalom shortcut: fork -> stepping stones -> weave -> rejoin.
  [5, -39.5, 3, 2.5, 0],
  [4.8, -42.5, 3, 3.5, -0.15],
  [4.5, -45.5, 3, 4, 0],
  [2.5, -48, 3, 4, 0.8], // rejoin curve
  // Spurs: pond edge and lookout base.
  [4.75, -35, 2, 1.5, 1.57],
  [-3.5, -46.25, 2, 3.5, -1.74],
];
// Stream: [x0, x1, z0, z1] water strip west-east, visual-only.
export const FOREST_STREAM = [-20, 20, -41.25, -39.75];
// Log bridge: [x, z, rotY] deck over the stream on the winding path.
export const FOREST_BRIDGE = [0, -40.5, -2.63];
// Stepping stones: [x, z] across the stream on the shortcut.
export const FOREST_STONES = [
  [5, -39.8],
  [5.3, -40.5],
  [4.7, -41.2],
];
// Stone circle: [x, z, size] ring around the giant tree (gap faces the
// pedestal). Size >= 0.7 blocks like a rock; smaller is visual-only.
export const FOREST_STONE_CIRCLE = [
  [-11.75, -51.84, 0.5],
  [-13.59, -51.57, 0.8],
  [-15.1, -52.64, 0.5],
  [-15.46, -54.47, 0.8],
  [-14.45, -56.04, 0.5],
  [-12.66, -56.48, 0.8],
  [-11.06, -55.57, 0.5],
];
// Big bushes: [x, z, r] squashed icosahedrons that block (box approx).
// First 9 form the grove ring wall with the ring trees (door east).
export const FOREST_BUSH_BIG = [
  [-8.55, -50.77, 0.9],
  [-11.3, -48.77, 0.9],
  [-14.7, -48.77, 0.9],
  [-17.45, -50.77, 0.9],
  [-18.5, -54, 0.9],
  [-17.45, -57.23, 0.9],
  [-14.7, -59.23, 0.9],
  [-11.3, -59.23, 0.9],
  [-8.55, -57.23, 0.9],
  [0.72, -44.99, 0.9],
  [-13.88, -23.9, 0.9],
  [-14.36, -22.68, 0.9],
  [12.5, -57.98, 0.9],
  [17.94, -34.06, 0.9],
];
// Small bushes: [x, z, r] visual-only.
export const FOREST_BUSH_SMALL = [
  [14.53, -30.49, 0.5],
  [0.62, -52.06, 0.5],
  [4.87, -30.16, 0.41],
  [-6.63, -44.54, 0.51],
  [10.73, -39.68, 0.4],
  [-4.61, -36.23, 0.47],
  [16.16, -24.6, 0.52],
  [2.08, -23.75, 0.43],
  [-14.43, -35.36, 0.5],
  [-16.35, -37.2, 0.46],
  [-9.19, -42.48, 0.44],
  [2.03, -42.63, 0.43],
];
// Ferns: [x, z] visual-only tufts near trunks and the pond.
export const FOREST_FERNS = [
  [1.59, -37.79],
  [7.58, -52.11],
  [2.77, -22.86],
  [13.08, -31.98],
  [8.03, -43.43],
  [4.08, -40.88],
  [11.41, -26.46],
  [10.97, -38.7],
  [2.42, -35.62],
  [13.38, -37.12],
  [7.09, -45.48],
  [8.16, -37.88],
  [10.85, -37.8],
  [6.42, -28.98],
  [6.53, -31.49],
  [7.15, -29.67],
  [7.18, -41.96],
  [6.05, -40.7],
  [16.44, -28.3],
  [13.53, -26.12],
];
// Mushroom clusters: [x, z] visual-only, muted caps.
export const FOREST_MUSHROOMS = [
  [12.71, -37.56],
  [10.78, -36.37],
  [8.95, -40.9],
  [8.77, -39.45],
  [10.76, -38.03],
  [10.32, -29.71],
  [-8.37, -35.62],
  [-4.86, -33.39],
  [-7.72, -41.27],
  [-6.6, -32.67],
  [7.56, -45.18],
  [-4.18, -34.15],
];
// Fallen logs: [x, z, rotY, len, twoSeg, r]. First two lie across the main
// path as LOW roll-over bumps (the dip); the rest are seats beside paths.
export const FOREST_LOGS = [
  [2.0, -28.5, -0.59, 3.0, false, 0.25],
  [3.8, -31.0, -0.59, 3.0, false, 0.25],
  [9.5, -34.0, -1.95, 2.0, false, 0.3],
  [-5.0, -47.0, 0, 2.0, true, 0.3],
];
// Stumps: [x, z] near clearings, low roll-over colliders.
export const FOREST_STUMPS = [
  [2.5, -22.5],
  [-2, -33],
  [9.5, -37.5],
  [-4.5, -45.5],
];
// Mossy rocks: [x, z, size] grey rocks with moss caps, block like beach rocks.
// First four mark the grove approach and the fork.
export const FOREST_MOSSY_ROCKS = [
  [-3.5, -53.5, 0.9],
  [-6.5, -56, 0.9],
  [1, -36.5, 0.8],
  [7, -37, 0.8],
  [-9.91, -29.26, 0.99],
  [-6.66, -25.73, 0.89],
  [10.85, -27.34, 0.86],
  [13.5, -30, 0.87],
  [16.68, -43.77, 0.94],
  [12.33, -53.37, 0.9],
];
// Ground patches: [x, z, r, tone] moss/leaf-litter/dirt, visual-only.
// Last is the dip hollow between the two path logs.
export const FOREST_PATCHES = [
  [-7.78, -43.22, 1.01, 'moss'],
  [10.92, -48.86, 1.69, 'moss'],
  [9.7, -44.35, 1.74, 'moss'],
  [3.9, -52.8, 1.51, 'moss'],
  [2.47, -42.34, 1.24, 'leaf'],
  [0.98, -36.33, 1.1, 'leaf'],
  [-14.75, -34.04, 1.22, 'leaf'],
  [-12.65, -28.42, 1.58, 'dirt'],
  [9.42, -50.46, 1.34, 'dirt'],
  [6.71, -51.18, 1.05, 'dirt'],
  [2.9, -29.75, 1.5, 'dirt'],
];
// Trunk moss: indices into TREES (forest entries) with mossy sides.
export const FOREST_TRUNK_MOSS = [4, 43, 18, 16, 13, 44, 1, 2];
// Light shafts: [x, z] over clearings and path gaps (forest only; the arena
// keeps its two red shafts in level.js).
export const FOREST_SHAFTS = [
  [0, -24],
  [7, -35],
  [4, -38],
  [-1, -42],
  [5, -43],
  [-8, -47],
  [-11, -53],
];
export const FOREST_SHAFT_OPACITY = 0.1;
export const FIREFLY_COUNT = 60;

// Volcanic crater arena (issue #9): a circle, not a rectangle. The fighting
// floor is a flat ash disc; a lava moat rings it; a piled-rock rim encloses
// it. All spectacle lives outside the playable radius; the floor stays flat,
// circular, and clear. Lava is decorative only: no collider, no damage, ever.
export const ARENA_DISC_R = 11.5; // fighting floor disc radius, flat ash
export const ARENA_BORDER_IN = 11.1; // sumo-ring border annulus (visual-only)
export const ARENA_BORDER_OUT = 11.6;
export const ARENA_MOAT_IN = 11.8; // lava moat annulus (visual-only)
export const ARENA_MOAT_OUT = 12.7;
// Collider ring: SEGMENTS box segments on a circle of RING_R, rotated to
// tangent. Segments whose center falls within the west gap are skipped.
// Gap half-width 6 (chord ~12) matches the pass corridor (z -6..6).
export const ARENA_RING_R = 13;
export const ARENA_RING_SEGMENTS = 16;
export const ARENA_GAP_HALF_WIDTH = 6;
export const ARENA_RING_H = 4;
export const ARENA_RING_T = 1;
export const ARENA_SEG_OVERLAP = 1.1; // segment length vs exact chord
// Backdrop ring: a second, taller, purely visual ring row behind the piles,
// so no sky shows through rim gaps. Same angles/skips as the collider ring.
export const ARENA_BACKDROP_R = 14;
export const ARENA_BACKDROP_H = 7;
export const ARENA_BACKDROP_T = 1.2;
// Mouth gate: obsidian pillars capping the ring ends + a cracked two-piece
// lintel. Pillar centers come from the shared ring layout (gap edge angles).
export const ARENA_GATE = { pillarW: 1.4, pillarH: 5, lintelH: 0.8, lintelW: 1.2, lintelLen: 8.0 }; // lintelLen is per half
// Rim piles: 18 candidate angles (10 + i*20 deg), skipping those near the
// gap -> 14 piles. Centers on ARENA_PILE_R, seeded rocks, heights 2.5-6
// (piles 2, 8, 11 are the dramatic 5-6 ones).
export const ARENA_PILE_R = 13.5;
export const ARENA_RIM_SEED = 31;
export const ARENA_CRACK_COUNT = 8; // glowing splits in rim rocks
// Lava pools at the rim base [x, z, r]: tucked between piles, clear of the
// disc, merged with the moat visually. Plus the moat, the only arena lava.
export const ARENA_LAVA_POOLS = [
  [68.0, 8.4, 1.4],
  [55.8, 12.7, 1.2],
  [60.2, -12.6, 1.2],
];
// Volcanic spires [x, z, h, baseW]: the skyline, behind the backdrop wall.
export const ARENA_SPIRES = [
  [73.5, 0, 11, 1.6],
  [50.3, 13.4, 8.5, 1.4],
  [50.3, -13.4, 9.5, 1.5],
];
// Red shafts [x, z]: over the three pools + two over the moat.
export const ARENA_SHAFTS = [
  [68.0, 8.4],
  [55.8, 12.7],
  [60.2, -12.6],
  [70, 0],
  [67.2, -7.7],
];
// Approach piles [x, z]: rock shoulders outside the corridor walls (embedded
// in the wall line) for the pass's last stretch. Taller than the 3-high walls
// so their tops read from inside the corridor.
export const ARENA_APPROACH = [
  [36, -7.2],
  [39.5, -7.2],
  [43, -7.2],
  [36, 7.2],
  [39.5, 7.2],
  [43, 7.2],
];
export const ARENA_APPROACH_SEED = 32;
export const EMBER_COUNT = 80;
export const SMOKE_COUNT = 30;
// Crater palette: obsidian + ash + dark stone only. Lava red stays the only
// saturated color; embers are lava-family garnish.
export const COL_OBSIDIAN = 0x1e1a20; // near-black pile rock / backdrop
export const COL_OBSIDIAN_2 = 0x2b2630; // dark grey pile rock
export const COL_OBSIDIAN_3 = 0x3d3438; // warm brown-grey pile rock
export const COL_ARENA_DISC = 0x38323e; // lightened fighting floor
export const COL_ARENA_STRATA = 0x5d5866; // geological band on tall piles
export const COL_EMBER = 0xff7a2a;
export const COL_SMOKE = 0x4a4a4a;
// Boss ball: pale bone so it tracks against the dark rock (issue #2 §4.4).
export const COL_BOSS = 0xd8cfc0;
export const COL_BOSS_BAND = 0x2b2630;
export const COL_BOSS_EYE = 0x1c1a18;
export const COL_DAMAGE_FLASH = 0xff2222;
