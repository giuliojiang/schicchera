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
export const GROUND_SIZE = 44;
export const WALL_HEIGHT = 2;
export const WALL_THICKNESS = 1;
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
