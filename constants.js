// Single place for every tunable gameplay number (spec section 15).
// Nothing gameplay-critical may be a magic number elsewhere.

export const PLAYER_MAX_FLICK_SPEED = 12; // u/s, Vmax
export const FULL_CHARGE_TIME = 1.5; // s, T
export const SPEED_CLAMP = 20; // u/s, Vclamp hard cap

export const PLAYER_GROUND_DRAG = 0.5; // linearDamping while grounded
export const PLAYER_AIR_DRAG = 0.1; // linearDamping while airborne
export const BOSS_GROUND_DRAG = 0.1; // efficient roller (boss arrives later)
export const PLAYER_ANGULAR_DAMPING = 0.4; // tips wobble instead of vaulting

export const CUBE_MASS = 1.0;
export const DAGGER_MASS = 0.5;
export const SWORD_MASS = 1.0;
export const HAMMER_MASS = 2.0;

export const BOSS_MASS = 2.0;
export const BOSS_BUMP_SPEED = 5; // u/s
export const BOSS_ROLL_SPEED = 2.5; // u/s mid of 2-3 range
export const BOSS_HP = 3;
export const BUMP_INTERVAL = 4; // s fixed rhythm
export const WINDUP_DURATION = 1; // s, must be < arena-crossing time

export const CAMERA_DISTANCE = 8;
export const CAMERA_HEIGHT = 5;
export const CAMERA_LERP = 5; // 1/s follow smoothing
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

// Charge squash (fraction of the quadratic charge01).
export const SQUASH_Y = 0.35; // max Y compression at full charge
export const SQUASH_XZ = 0.18; // max XZ expansion at full charge
export const LAUNCH_STRETCH_TIME = 0.16; // s of un-squash pop on release

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
// Styles: fence (village), dune (beach), treeline (forest), rock (pass/arena), none (invisible).
export const WALLS = [
  // Beach: north, south, shoreline (invisible).
  [-40, 1, -20.5, 42, 2, 1, 'dune'],
  [-40, 1, 20.5, 42, 2, 1, 'dune'],
  [SHORE_X, 2, 0, 1, 5, 42, 'none'],
  // Village: south + east segments (pass opening z in [-6,6]).
  [0, 1, 20.5, 42, 2, 1, 'fence'],
  [20.5, 1, -13.25, 1, 2, 14.5, 'fence'],
  [20.5, 1, 13.25, 1, 2, 14.5, 'fence'],
  // Forest: west, east, north.
  [-20.5, 1, -40, 1, 2, 42, 'treeline'],
  [20.5, 1, -40, 1, 2, 42, 'treeline'],
  [0, 1, -60.5, 42, 2, 1, 'treeline'],
  // Pass corridor sides.
  [32, 1.5, -6.5, 26, 3, 1, 'rock'],
  [32, 1.5, 6.5, 26, 3, 1, 'rock'],
  // Arena: west segments (pass opening), east, north, south.
  [43.5, 2, -10, 1, 4, 8, 'rock'],
  [43.5, 2, 10, 1, 4, 8, 'rock'],
  [72.5, 2, 0, 1, 4, 30, 'rock'],
  [58, 2, -14.5, 30, 4, 1, 'rock'],
  [58, 2, 14.5, 30, 4, 1, 'rock'],
];

// Hills: buried spheres the player rolls over. [cx, cy, cz, radius]
export const HILLS = [
  [-38, -7.5, 6, 9], // beach east (crest y 1.5)
  [-47, -8, -8, 10], // beach west (crest y 2)
  [8, -7.5, -38, 9], // forest east (crest y 1.5)
  [-8, -8, -48, 10], // forest west (crest y 2)
];

// Trees: [x, z, trunkH, canopyR, canopyKind, greenIdx]. Forest zone only.
export const TREES = [
  [-15, -23, 2.6, 1.8, 'cone', 0],
  [-9, -24, 2.2, 1.5, 'blob', 1],
  [9, -24, 2.4, 1.7, 'cone', 2],
  [15, -23, 2.8, 1.9, 'blob', 3],
  [4.5, -26, 2.3, 1.5, 'cone', 1],
  [-4.5, -27, 2.5, 1.6, 'blob', 0],
  [6, -30, 2.6, 1.8, 'cone', 3],
  [-10, -30, 2.2, 1.4, 'blob', 2],
  [12, -33, 2.7, 1.9, 'blob', 0],
  [-13, -34, 2.4, 1.6, 'cone', 1],
  [5, -37, 2.5, 1.7, 'cone', 2],
  [-5, -42, 2.3, 1.5, 'blob', 3],
  [14, -43, 2.8, 2.0, 'cone', 0],
  [-14, -46, 2.6, 1.8, 'blob', 1],
  [10, -47, 2.4, 1.6, 'cone', 3],
  [6, -53, 2.5, 1.7, 'blob', 2],
  [-16, -53, 2.7, 1.9, 'cone', 1],
  [-4, -57, 2.4, 1.6, 'blob', 0],
];
export const TRUNK_RADIUS = 0.35;

// Rocks: [x, z, size]. Beach zone only. Squashed dodecahedrons.
export const ROCKS = [
  [-28, 9, 1.6],
  [-34, -10, 2.0],
  [-44, 11, 1.4],
  [-50, -3, 1.2],
  [-30, -14, 1.8],
  [-40, -6, 1.5],
  [-26, -6, 1.1],
  [-46, -14, 1.7],
];

// Huts: [x, z, rotY, bodyTone, roofTone]. Village corners, clear of plaza/roads.
export const HUTS = [
  [-12, 12, 0.4, 0, 0],
  [12, 12, -0.3, 1, 1],
  [-13, -12, -0.5, 1, 0],
  [13, -12, 0.6, 0, 1],
];
export const HUT_BODY = [4, 2.5, 3.5]; // sx, sy, sz

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
  ['dagger', 0, 0.8, 0],
  ['sword', -49, 0.8, 3],
  ['hammer', -11, 1.0, -53],
];
export const PICKUP_TOUCH_DIST = 1.5;

// Attached-weapon anchors on the cube (visual offsets; colliders match).
export const ANCHOR = {
  dagger: { pos: [0.62, 0, 0], collider: [0.7, 0, 0], half: [0.42, 0.13, 0.07] },
  sword: { pos: [-0.78, 0, 0], collider: [-0.9, 0, 0], half: [0.65, 0.15, 0.08] },
  hammer: { pos: [0, 0.72, 0], collider: [0, 0.72, 0], half: [0.2, 0.5, 0.2] },
};

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
export const SHADOW_EXTENT = 30; // half-width of shadow camera box

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
export const COL_WALL_FENCE = 0x7a6248;
export const COL_WALL_DUNE = 0xbfae82;
export const COL_WALL_TREELINE = 0x3d4a33;
export const COL_WALL_ROCK = 0x3d3844;
export const COL_ARCH = 0x7d7a72;
export const COL_WATER = 0x7fa8b8;
export const COL_BRIDGE = 0x8a7154;
export const COL_LAVA = 0xff2200;
export const COL_PLAYER = 0xe8873a;
export const COL_EYE = 0x1c1a18;
