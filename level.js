// Three.js environment: 5 zones, props, water/lava, player mesh, weapons.
// Primitives only, flat-shaded matte. Visuals match physics.js shapes.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  ANCHOR,
  ARCH,
  ARENA_APPROACH,
  ARENA_APPROACH_SEED,
  ARENA_BACKDROP_H,
  ARENA_BACKDROP_R,
  ARENA_BACKDROP_T,
  ARENA_BORDER_IN,
  ARENA_BORDER_OUT,
  ARENA_CENTER,
  ARENA_CRACK_COUNT,
  ARENA_DISC_R,
  ARENA_GAP_HALF_WIDTH,
  ARENA_GATE,
  ARENA_LAVA_POOLS,
  ARENA_MOAT_IN,
  ARENA_MOAT_OUT,
  ARENA_PILE_R,
  ARENA_RIM_SEED,
  ARENA_RING_H,
  ARENA_RING_R,
  ARENA_RING_SEGMENTS,
  ARENA_RING_T,
  ARENA_SEG_OVERLAP,
  ARENA_SHAFTS,
  ARENA_SPIRES,
  BARRELS,
  BEACH_BASE_Y,
  BEACH_CAIRNS,
  BEACH_PARAPET_H,
  BEACH_PARAPET_T,
  BEACH_PARAPETS,
  BEACH_RAMP_THICK,
  BEACH_RAMPS,
  BEACH_SHELL_COUNT,
  BEACH_SHELL_SEED,
  BEACH_SHELVES,
  BEACH_SLAB,
  BEACH_STONES,
  BEACH_TUFT_SEED,
  BEACH_TUFTS_PER_SHELF,
  BENCHES,
  BOAT,
  BOSS_ANCHOR,
  BOSS_MASS,
  BOSS_RADIUS,
  BRIDGE_CREST_H,
  BRIDGE_SPAN,
  BRIDGE_THICK,
  BRIDGES,
  BUSH_BIG,
  CART,
  CHANNEL_Z0,
  CHANNEL_Z1,
  CLOUDS,
  COL_ARCH,
  COL_ARENA_DISC,
  COL_BOSS,
  COL_BOSS_BAND,
  COL_BOSS_EYE,
  COL_ARENA_GROUND,
  COL_ARENA_STRATA,
  COL_BEACH_GROUND,
  COL_BRIDGE,
  COL_BUSH,
  COL_CANOPY,
  COL_CLOTH,
  COL_CLOUD,
  COL_CONCRETE,
  COL_CONCRETE_DARK,
  COL_DIRT,
  COL_DOOR,
  COL_DRIFTWOOD,
  COL_EMBER,
  COL_EYE,
  COL_FERN,
  COL_FIREFLY,
  COL_FLOWER,
  COL_FOAM,
  COL_FOREST_GROUND,
  COL_GLASS,
  COL_GULL,
  COL_HILL_BEACH,
  COL_HILL_FOREST,
  COL_HUT_BODY,
  COL_HUT_ROOF,
  COL_LAVA,
  COL_LEAF_LITTER,
  COL_MOSS,
  COL_MUSHROOM_CAP,
  COL_MUSHROOM_STEM,
  COL_NET,
  COL_OBSIDIAN,
  COL_OBSIDIAN_2,
  COL_OBSIDIAN_3,
  COL_PASS_GROUND,
  COL_PATCH_GRASS,
  COL_PATCH_SAND,
  COL_PLAZA,
  COL_PLAZA_RING,
  COL_PLAYER,
  COL_RAMP,
  COL_ROAD,
  COL_ROAD_WEAR,
  COL_ROCK,
  COL_SHAFT_ARENA,
  COL_SHAFT_FOREST,
  COL_SAND_DARK,
  COL_SAND_PALE,
  COL_SEAWEED,
  COL_SHELF_TOP,
  COL_SHELL,
  COL_SHORE,
  COL_SMOKE,
  COL_STONE,
  COL_STRATA,
  COL_STUMP_TOP,
  COL_THATCH,
  COL_TIDE_POOL,
  COL_TRUNK,
  COL_VILLAGE_GROUND,
  COL_WALL_CONCRETE,
  COL_WALL_DUNE,
  COL_WALL_FENCE,
  COL_WALL_ROCK,
  COL_WALL_TREELINE,
  COL_WATER,
  COL_WINDOW,
  COL_WOOD_DARK,
  CRATES,
  DAGGER_MASS,
  DRIFTWOOD,
  DUNE_GRASS,
  EMBER_COUNT,
  FENCES,
  FIREFLY_COUNT,
  FOREST_BRIDGE,
  FOREST_BUSH_BIG,
  FOREST_BUSH_SMALL,
  FOREST_FERNS,
  FOREST_LOGS,
  FOREST_MOSSY_ROCKS,
  FOREST_MUSHROOMS,
  FOREST_PATCHES,
  FOREST_PATHS,
  FOREST_POND,
  FOREST_SHAFT_OPACITY,
  FOREST_SHAFTS,
  FOREST_STONE_CIRCLE,
  FOREST_STONES,
  FOREST_STREAM,
  FOREST_STUMPS,
  FOREST_TRUNK_MOSS,
  GATES,
  GIANT_TREE,
  GULLS,
  HAMMER_MASS,
  HAMMER_PEDESTAL,
  HEMI_GROUND,
  HEMI_INTENSITY,
  HEMI_SKY,
  HILLS,
  HUT_BODY,
  HUT_FEATURES,
  HUTS,
  LANTERNS,
  LAUNDRY,
  PATCHES,
  PIER,
  PIER_PLATFORM,
  PLAYER_SIZE,
  PLAYER_SPAWN,
  POTS,
  ROCKS,
  ROPE,
  SAND_PATCHES,
  SCATTER_COUNT,
  SCATTER_SEED,
  SEAWEED,
  SEA_TOP_Y,
  SHADOW_EXTENT,
  SHADOW_FAR,
  SHADOW_MAP_SIZE,
  SHELF_BUSHES,
  SHORE_X,
  SIGNS,
  SMOKE_COUNT,
  SPURS,
  STALL,
  SUN_COLOR,
  SUN_INTENSITY,
  SUN_OFFSET,
  SWORD_COVE,
  SWORD_MASS,
  TIDE_POOLS,
  TREES,
  TRUNK_RADIUS,
  VILLAGE_BARS,
  VILLAGE_TOWERS,
  WALLS,
  WELL,
  ZONE_ARENA,
  ZONE_FOREST,
  ZONE_PASS,
  ZONE_VILLAGE,
} from './constants.js';
import { arenaRingLayout, mulberry32 } from './game.js';

function matte(color, extra = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.95,
    metalness: 0,
    flatShading: true,
    ...extra,
  });
}

function box(sx, sy, sz, mat, x, y, z, cast = true, receive = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  m.position.set(x, y, z);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}

// Shared unit geometries + cached materials for village dressing: hundreds of
// small parts, a handful of GPU resources. Unit-sized, scaled per use.
const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl8: new THREE.CylinderGeometry(1, 1, 1, 8),
  cyl10: new THREE.CylinderGeometry(1, 1, 1, 10),
  cone4: new THREE.ConeGeometry(1, 1, 4),
  cone6: new THREE.ConeGeometry(1, 1, 6),
  cone8: new THREE.ConeGeometry(1, 1, 8),
  ico: new THREE.IcosahedronGeometry(1, 0),
  dodec: new THREE.DodecahedronGeometry(1, 0),
  sphere: new THREE.SphereGeometry(1, 10, 8),
  torus: new THREE.TorusGeometry(0.32, 0.1, 6, 12),
  plane: new THREE.PlaneGeometry(1, 1),
};
// Pitched gable prism: triangular cross-section, apex up, ridge along X.
const GABLE_GEO = (() => {
  const g = new THREE.CylinderGeometry(2.6, 2.6, 5, 3, 1, false, Math.PI / 2);
  g.rotateZ(Math.PI / 2);
  return g;
})();

const matCache = new Map();
function M(color, rough = 0.95) {
  const key = color * 1000 + Math.round(rough * 100);
  let m = matCache.get(key);
  if (!m) {
    m = matte(color, { roughness: rough });
    matCache.set(key, m);
  }
  return m;
}

// Place a shared-geometry part: scale (full sizes, unit geo), pos, euler rot.
// NOTE: cylinders/cones are unit RADIUS 1, so sx/sz are diameters (2r).
function part(geo, mat, sx, sy, sz, x, y, z, rx = 0, ry = 0, rz = 0, parent = null) {
  const m = new THREE.Mesh(geo, mat);
  m.scale.set(sx, sy, sz);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}

function flatPart(geo, mat, sx, sy, sz, x, y, z, ry = 0, parent = null) {
  const m = part(geo, mat, sx, sy, sz, x, y, z, 0, ry, 0, parent);
  m.castShadow = false;
  return m;
}

export function buildLights(scene) {
  const hemi = new THREE.HemisphereLight(HEMI_SKY, HEMI_GROUND, HEMI_INTENSITY);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(SUN_COLOR, SUN_INTENSITY);
  sun.position.set(
    PLAYER_SPAWN[0] + SUN_OFFSET[0],
    PLAYER_SPAWN[1] + SUN_OFFSET[1],
    PLAYER_SPAWN[2] + SUN_OFFSET[2]
  );
  sun.castShadow = true;
  sun.shadow.mapSize.set(SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);
  sun.shadow.camera.left = -SHADOW_EXTENT;
  sun.shadow.camera.right = SHADOW_EXTENT;
  sun.shadow.camera.top = SHADOW_EXTENT;
  sun.shadow.camera.bottom = -SHADOW_EXTENT;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = SHADOW_FAR;
  sun.shadow.bias = -0.0015;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  scene.add(sun.target);
  return { sun };
}

// Brutalist concrete (issue #14): ONE shared board-marked texture for the
// whole village. Subtle horizontal formwork boards + tie holes + speckle,
// drawn once on a canvas. Two shared materials (light/dark) tint the same
// texture — no per-building texture copies. Matte: roughness 0.9, metal 0.
let concreteTex = null;
function boardConcreteTexture() {
  if (concreteTex) return concreteTex;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#9b9b97';
  g.fillRect(0, 0, 256, 256);
  // Formwork boards: faint horizontal bands.
  for (let y = 0; y < 256; y += 36) {
    g.fillStyle = 'rgba(0,0,0,0.07)';
    g.fillRect(0, y, 256, 2);
    g.fillStyle = 'rgba(255,255,255,0.05)';
    g.fillRect(0, y + 2, 256, 1);
  }
  // Board joints: short vertical seams, staggered per band.
  for (let row = 0; row < 8; row++) {
    const y = row * 36;
    for (let k = 0; k < 2; k++) {
      const x = ((row * 97 + k * 131) % 256 + 256) % 256;
      g.fillStyle = 'rgba(0,0,0,0.06)';
      g.fillRect(x, y, 1, 36);
    }
  }
  // Tie holes: small dark dots on a loose grid.
  for (let ty = 18; ty < 256; ty += 72) {
    for (let tx = 18; tx < 256; tx += 72) {
      g.fillStyle = 'rgba(0,0,0,0.16)';
      g.beginPath();
      g.arc(tx + (ty % 144 === 18 ? 0 : 36), ty, 2.2, 0, Math.PI * 2);
      g.fill();
    }
  }
  // Speckle: light grain so flat faces never read as a solid fill.
  for (let i = 0; i < 1400; i++) {
    const v = 130 + Math.floor(Math.random() * 50);
    g.fillStyle = `rgba(${v},${v},${v - 4},0.10)`;
    g.fillRect(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), 1, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  concreteTex = tex;
  return tex;
}
let concreteMats = null;
function brutalistMats() {
  if (concreteMats) return concreteMats;
  const tex = boardConcreteTexture();
  // NOTE: the canvas already carries the concrete gray, so the light material
  // is tinted white (map x white = map). Tinting gray again would double-
  // darken every face. The dark variant is a light-gray tint of the same map.
  const light = new THREE.MeshStandardMaterial({
    map: tex, color: 0xffffff, roughness: 0.9, metalness: 0, flatShading: true,
  });
  const dark = new THREE.MeshStandardMaterial({
    map: tex, color: 0xd9d9d9, roughness: 0.92, metalness: 0, flatShading: true,
  });
  const window = new THREE.MeshStandardMaterial({
    color: COL_WINDOW, roughness: 0.9, metalness: 0, flatShading: true,
  });
  concreteMats = { light, dark, window };
  // Blender-baked upgrade (blend/village_brutalist.py): board-formed color +
  // bump replace the canvas fallback once loaded. Missing files (fresh clone
  // without the local blend/ exports) silently keep the canvas look.
  const loader = new THREE.TextureLoader();
  loader.load('./blend/village_concrete.png', (baked) => {
    baked.wrapS = THREE.RepeatWrapping;
    baked.wrapT = THREE.RepeatWrapping;
    baked.colorSpace = THREE.SRGBColorSpace;
    light.map = baked;
    dark.map = baked;
    light.needsUpdate = true;
    dark.needsUpdate = true;
  }, undefined, () => {});
  loader.load('./blend/village_concrete_bump.png', (bump) => {
    bump.wrapS = THREE.RepeatWrapping;
    bump.wrapT = THREE.RepeatWrapping;
    light.bumpMap = bump;
    dark.bumpMap = bump;
    light.bumpScale = 0.6;
    dark.bumpScale = 0.6;
    light.needsUpdate = true;
    dark.needsUpdate = true;
  }, undefined, () => {});
  return concreteMats;
}

function slab(scene, zone, color, topY = 0) {
  const sx = zone.x1 - zone.x0;
  const sz = zone.z1 - zone.z0;
  const m = box(
    sx,
    1,
    sz,
    matte(color),
    (zone.x0 + zone.x1) / 2,
    topY - 0.5,
    (zone.z0 + zone.z1) / 2,
    false,
    true
  );
  scene.add(m);
}

function flatStrip(scene, cx, cz, sx, sz, y, color, rotY = 0) {
  const m = box(sx, 0.05, sz, matte(color), cx, y, cz, false, true);
  m.rotation.y = rotY;
  scene.add(m);
}

function buildPlaza(scene) {
  // Paved center: outer ring + raised inner disc + border stones.
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 0.06, 28), M(COL_PLAZA_RING));
  ring.position.set(0, 0.03, 0);
  ring.receiveShadow = true;
  scene.add(ring);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.06, 24), M(COL_PLAZA));
  inner.position.set(0, 0.05, 0);
  inner.receiveShadow = true;
  scene.add(inner);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    flatPart(GEO.box, M(COL_STONE), 0.5, 0.12, 0.35,
      Math.cos(a) * 6.4, 0.06, Math.sin(a) * 6.4, -a, scene);
  }
  // PERMANENT pedestal (issue #14): a tall plain raw-concrete monolith. The
  // dagger floats above its cap; the monolith stays after pickup (the issue
  // #5 permanent-pedestal rule, only the form changes). Deliberately left
  // collider-free like the old stub, so plaza movement is exactly unchanged.
  // Never tagged as a camera blocker (pedestals are excluded, issue #12).
  {
    const { light, dark } = brutalistMats();
    // Stepped plinth + massive shaft: reads heavy without rising past the
    // dagger's pickup reach (cap top ~1.6, dagger floats at 1.8).
    const plinth = box(2.0, 0.3, 2.0, dark, 0, 0.15, 0);
    scene.add(plinth);
    const shaft = box(1.3, 1.2, 1.3, light, 0, 0.9, 0);
    scene.add(shaft);
    const capSlab = box(1.5, 0.12, 1.5, light, 0, 1.56, 0);
    scene.add(capSlab);
  }
  // Planting ring just outside the paving (skips the road crossings).
  // Bushes only: no flowers, so the plaza keeps the concrete/sand/green
  // palette (issue #14 palette rule).
  for (const deg of [30, 60, 120, 150, 210, 240, 300, 330]) {
    const a = (deg / 180) * Math.PI;
    const bx = Math.cos(a) * 7.2;
    const bz = Math.sin(a) * 7.2;
    part(GEO.ico, M(COL_BUSH[(deg / 30) % 3]), 0.35, 0.28, 0.35, bx, 0.22, bz, 0, 0, 0, scene);
  }
}

function buildRoads(scene) {
  // Varied widths per road; the longest gets a darker center wear strip.
  // The shore road ends at the beach gate: past it the terraces take over.
  // The north road ends at the forest gate: past it the forest paths wind.
  flatStrip(scene, -10, 0, 20, 3.2, 0.02, COL_ROAD); // plaza -> beach gate
  flatStrip(scene, 0, -10, 2.8, 20, 0.02, COL_ROAD); // plaza -> forest gate
  flatStrip(scene, 10, 0, 20, 3.0, 0.02, COL_ROAD); // plaza -> pass
  flatStrip(scene, 32, 0, 24, 2.6, 0.02, COL_ARCH); // through the pass
  flatStrip(scene, 0, -10, 1.2, 20, 0.05, COL_ROAD_WEAR); // worn middle
  for (const [cx, cz, sx, sz, rotY] of SPURS) {
    flatStrip(scene, cx, cz, sx, sz, 0.025, COL_ROAD_WEAR, rotY);
  }
}

// Forest paths (issue #8): winding dirt strips through the clearings, the
// fork pad, the slalom shortcut, and spur patches. Visual-only.
function buildForestPaths(scene) {
  for (const [cx, cz, sx, sz, rotY] of FOREST_PATHS) {
    flatStrip(scene, cx, cz, sx, sz, 0.02, COL_DIRT, rotY);
  }
}

function buildPatches(scene) {
  const tones = { dirt: M(COL_DIRT), grass: M(COL_PATCH_GRASS), sand: M(COL_PATCH_SAND) };
  for (const [x, z, r, tone] of PATCHES) {
    flatPart(GEO.cyl10, tones[tone], r * 2, 0.04, r * 2, x, 0.02, z, x * 1.3, scene);
  }
}

function buildEdgeStones(scene) {
  const rng = mulberry32(SCATTER_SEED + 1);
  const mat = M(COL_STONE);
  function edging(x0, z0, x1, z1, off) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const dx = (x1 - x0) / len;
    const dz = (z1 - z0) / len;
    for (let d = 1; d < len - 1; d += 4.5) {
      for (const s of [-1, 1]) {
        if (rng() < 0.35) continue; // irregular gaps, not a perfect row
        const j = (rng() - 0.5) * 0.6;
        const px = x0 + dx * d - dz * s * (off + j);
        const pz = z0 + dz * d + dx * s * (off + j);
        const r = 0.14 + rng() * 0.12;
        flatPart(GEO.dodec, mat, r, r * 0.55, r, px, r * 0.4, pz, rng() * 3, scene);
      }
    }
  }
  edging(-18, 0, -2, 0, 2.0); // shore road (half-width 1.6)
  edging(0, -18, 0, -2, 1.8); // north road to the forest gate (half-width 1.4)
  edging(2, 0, 18, 0, 1.9); // east road (half-width 1.5)
}

// Point-to-segment distance for keeping scatter off spur paths.
function segDist(px, pz, ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}

function spurEndpoints([cx, cz, sx, sz, rotY]) {
  const len = Math.max(sx, sz);
  const alongX = sx >= sz;
  const dx = alongX ? Math.cos(rotY) : Math.sin(rotY);
  const dz = alongX ? -Math.sin(rotY) : Math.cos(rotY);
  return [cx - dx * len / 2, cz - dz * len / 2, cx + dx * len / 2, cz + dz * len / 2];
}

function buildScatter(scene) {
  const rng = mulberry32(SCATTER_SEED);
  const hutRects = HUTS.map(([x, z, rotY]) => ({ x, z, rotY }));
  const spurs = SPURS.map(spurEndpoints);
  function blocked(x, z) {
    if (Math.hypot(x, z) < 7.5) return true; // plaza + planting
    if (x < 1 && Math.abs(z) < 2.2) return true; // shore road
    if (z < 1 && Math.abs(x) < 2.0) return true; // forest road
    if (x > 0 && Math.abs(z) < 2.1) return true; // east road
    if (Math.abs(z - 10) < 2.0) return true; // channel
    for (const [ax, az, bx, bz] of spurs) {
      if (segDist(x, z, ax, az, bx, bz) < 1.2) return true;
    }
    for (const h of hutRects) {
      const dx = x - h.x;
      const dz = z - h.z;
      const lx = dx * Math.cos(h.rotY) - dz * Math.sin(h.rotY);
      const lz = dx * Math.sin(h.rotY) + dz * Math.cos(h.rotY);
      if (Math.abs(lx) < 2.4 && Math.abs(lz) < 2.15) return true;
    }
    if (Math.hypot(x - WELL[0], z - WELL[1]) < 1.5) return true;
    if (Math.hypot(x - STALL[0], z - STALL[1]) < 1.8) return true;
    if (Math.hypot(x - CART[0], z - CART[1]) < 1.8) return true;
    return false;
  }
  let placed = 0;
  for (let tries = 0; tries < 400 && placed < SCATTER_COUNT; tries++) {
    const x = -19 + rng() * 38;
    const z = -19 + rng() * 38;
    if (blocked(x, z)) continue;
    placed++;
    const kind = rng();
    if (kind < 0.4) {
      // Grass tuft: 3 thin crossed cones.
      const gm = M(COL_BUSH[Math.floor(rng() * 3)]);
      for (const tilt of [-0.25, 0, 0.25]) {
        flatPart(GEO.cone6, gm, 0.18, 0.5, 0.18, x + tilt * 0.4, 0.22, z, 0, scene)
          .rotation.z = tilt;
      }
    } else if (kind < 0.7) {
      // Pebble.
      const r = 0.09 + rng() * 0.07;
      flatPart(GEO.dodec, M(COL_STONE), r, r * 0.7, r, x, r * 0.5, z, rng() * 3, scene);
    } else {
      // Sand clod: a second pebble variant. No flowers in the Brutalist
      // village (issue #14 palette rule: concrete gray, warm sand, muted
      // green only).
      const r = 0.11 + rng() * 0.08;
      flatPart(GEO.dodec, M(COL_PATCH_SAND), r, r * 0.6, r,
        x + (rng() - 0.5) * 0.4, r * 0.45, z + (rng() - 0.5) * 0.4, rng() * 3, scene);
    }
  }
}

function buildReeds(scene) {
  const rng = mulberry32(SCATTER_SEED + 2);
  const gm = M(COL_BUSH[1]);
  for (let i = 0; i < 8; i++) {
    let x = -17 + i * 4.8 + (rng() - 0.5) * 2;
    // Keep bridge mouths clear.
    if (Math.abs(x + 8) < 2.5) x -= 3;
    if (Math.abs(x - 8) < 2.5) x += 3;
    const z = (i % 2 === 0 ? CHANNEL_Z0 - 0.3 : CHANNEL_Z1 + 0.3) + (rng() - 0.5) * 0.3;
    for (let s = 0; s < 4; s++) {
      const h = 0.7 + rng() * 0.4;
      flatPart(GEO.cyl8, gm, 0.06, h, 0.06,
        x + (rng() - 0.5) * 0.8, h / 2, z + (rng() - 0.5) * 0.4, 0, scene);
    }
  }
}

function buildBanks(scene) {
  // Channeled stream (issue #14): straight concrete walls containing the
  // watercourse, replacing the natural banks. Same water line, same course.
  // Visual-only, like the old banks; both walls join the camera blockers.
  const { light, dark } = brutalistMats();
  // Gaps at both bridge crossings (x -8 and +8, deck width 3 + margin).
  const segs = [
    [-20, -9.9],
    [-6.1, 6.1],
    [9.9, 20],
  ];
  const wall = (z, mat) => {
    for (const [x0, x1] of segs) {
      const cx = (x0 + x1) / 2;
      const len = x1 - x0;
      const m = box(len, 0.9, 0.4, mat, cx, 0.45, z);
      m.userData.blocker = true;
      scene.add(m);
      // Coping cap: a thin lip overhanging the water.
      const cap = box(len, 0.1, 0.55, mat, cx, 0.95, z);
      cap.userData.blocker = true;
      scene.add(cap);
    }
  };
  wall(CHANNEL_Z0 - 0.2, light);
  wall(CHANNEL_Z1 + 0.2, dark);
}

function buildWalls(scene) {
  const { light: concrete } = brutalistMats();
  const mats = {
    fence: matte(COL_WALL_FENCE),
    concrete,
    dune: matte(COL_WALL_DUNE),
    treeline: matte(COL_WALL_TREELINE),
    rock: matte(COL_WALL_ROCK),
  };
  for (const [x, y, z, sx, sy, sz, style] of WALLS) {
    if (style === 'none') continue; // invisible shoreline wall
    const m = box(sx, sy, sz, mats[style], x, y, z);
    m.userData.blocker = true; // camera raycast blocker (issue #12)
    scene.add(m);
  }
  // Village boundary planting (issue #14): muted green bushes softening the
  // concrete walls. Visual-only, clear of roads and the pass opening.
  const bushSpots = [];
  for (let x = -16; x <= 16; x += 4) bushSpots.push([x, 19.2]);
  for (let z = -11; z <= 11; z += 3.5) {
    if (Math.abs(z) < 2.6) continue; // east road
    if (Math.abs(z - 10) < 1.6) continue; // channel mouth
    bushSpots.push([19.2, z]);
  }
  bushSpots.forEach(([x, z], i) => {
    part(GEO.ico, M(COL_BUSH[i % 3]), 0.55, 0.42, 0.55, x, 0.3, z, 0, i * 0.7, 0, scene);
  });
}

function buildHills(scene) {
  const beachMat = matte(COL_HILL_BEACH);
  const forestMat = matte(COL_HILL_FOREST);
  HILLS.forEach(([x, y, z, r], i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), i < 2 ? beachMat : forestMat);
    m.position.set(x, y, z);
    m.receiveShadow = true;
    scene.add(m);
  });
}

function buildTrees(scene) {
  const trunkMat = matte(COL_TRUNK);
  const canopyMats = COL_CANOPY.map((c) => matte(c));
  for (const [x, z, trunkH, canopyR, kind, greenIdx] of TREES) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(TRUNK_RADIUS, TRUNK_RADIUS * 1.25, trunkH, 7),
      trunkMat
    );
    trunk.position.set(x, trunkH / 2, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    scene.add(trunk);
    let canopy;
    if (kind === 'cone') {
      canopy = new THREE.Mesh(
        new THREE.ConeGeometry(canopyR, canopyR * 1.8, 8),
        canopyMats[greenIdx]
      );
      canopy.position.set(x, trunkH + canopyR * 0.75, z);
    } else {
      canopy = new THREE.Mesh(
        new THREE.IcosahedronGeometry(canopyR, 0),
        canopyMats[greenIdx]
      );
      canopy.position.set(x, trunkH + canopyR * 0.6, z);
    }
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    scene.add(canopy);
  }
}

// The giant old tree (issue #8): the forest beacon. Double-height trunk,
// wide base, big dark blob canopy poking above every other canopy. The trunk
// collider in physics.js matches this transform.
function buildGiantTree(scene) {
  const [gx, gz, trunkH, trunkR, canopyR] = GIANT_TREE;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkR, trunkR * 1.25, trunkH, 9),
    M(COL_TRUNK)
  );
  trunk.position.set(gx, trunkH / 2, gz);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  scene.add(trunk);
  const canopy = new THREE.Mesh(
    new THREE.IcosahedronGeometry(canopyR, 0),
    M(COL_CANOPY[2])
  );
  canopy.position.set(gx, trunkH + canopyR * 0.6, gz);
  canopy.castShadow = true;
  canopy.receiveShadow = true;
  scene.add(canopy);
  // Mossy skirt where the trunk meets the ground.
  flatPart(GEO.cyl10, M(COL_MOSS), 2.2, 0.1, 2.2, gx, 0.05, gz, 0.4, scene);
}

function buildRocks(scene) {
  const mat = matte(COL_ROCK);
  for (const [x, z, size, gy = 0] of ROCKS) {
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(size * 0.5, 0), mat);
    m.scale.y = 0.62; // squash matches the physics box core
    m.position.set(x, gy + size * 0.31, z);
    m.rotation.y = (x * 1.7 + z * 2.3) % Math.PI;
    m.castShadow = true;
    m.receiveShadow = true;
    m.userData.blocker = true; // camera raycast blocker (issue #12)
    scene.add(m);
  }
}

function buildHuts(scene) {
  // Brutalist village blocks (issue #14). Same XZ footprints, rotations, and
  // ground footprints as the old huts — the layout and its clearance are
  // unchanged — but every body is now a raw-concrete monolith 8-14x the
  // player cube, with a stepped Habitat-style crown, dark inset window grids,
  // engaged pilotis piers, and roof-terrace bushes on some blocks. All
  // primitives, two shared concrete materials + one window material.
  const { light, dark, window } = brutalistMats();
  HUTS.forEach(([x, z, rotY, bodyTone, roofTone, bodyH, roofKind], hi) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    const bsx = HUT_BODY[0];
    const bsz = HUT_BODY[2];
    const totalH = bodyH || 8;
    const crownH = totalH >= 11 ? 2 : 1.5;
    const baseH = totalH - crownH;
    const baseMat = bodyTone === 0 ? light : dark;
    const fz = bsz / 2;
    // Monolith slab: full footprint at ground level (the collider matches).
    part(GEO.box, baseMat, bsx, baseH, bsz, 0, baseH / 2, 0, 0, 0, 0, g)
      .userData.blocker = true; // camera raycast blocker (issue #12)
    // Stepped crown: smaller offset box (Habitat-style stacking accent).
    const cxOff = roofKind === 1 ? 0.4 : -0.4;
    part(GEO.box, baseMat, 2.8, crownH, 2.2, cxOff, baseH + crownH / 2, -0.3, 0, 0, 0, g)
      .userData.blocker = true; // camera raycast blocker (issue #12)
    // Window grid on the front face: dark near-black inset boxes in modular
    // rows, each row shaded by a thin concrete fin (deep-shadow read).
    // No emissive, no glass shine.
    for (let wy = 2.6; wy < baseH - 1.0; wy += 1.9) {
      for (const wx of [-1.2, 0, 1.2]) {
        part(GEO.box, window, 0.9, 1.1, 0.14, wx, wy, fz - 0.02, 0, 0, 0, g);
      }
      part(GEO.box, baseMat, bsx + 0.2, 0.25, 0.3, 0, wy + 0.78, fz + 0.02, 0, 0, 0, g);
    }
    // Crown slits: two narrow dark slots on the stepped crown.
    part(GEO.box, window, 0.5, 0.8, 0.14, cxOff - 0.6, baseH + crownH / 2, 0.8, 0, 0, 0, g);
    part(GEO.box, window, 0.5, 0.8, 0.14, cxOff + 0.6, baseH + crownH / 2, 0.8, 0, 0, 0, g);
    // Engaged pilotis: three concrete piers in front of the solid ground
    // floor. Visual rhythm only — the collider stays the full footprint, so
    // there is never a gap to wedge into (issue #14 pilotis rule).
    for (const px of [-1.4, 0, 1.4]) {
      part(GEO.box, baseMat, 0.4, 2.2, 0.4, px, 1.1, fz + 0.35, 0, 0, 0, g);
    }
    // Roof-terrace bushes on alternating blocks (softening green).
    if (hi % 2 === 0) {
      part(GEO.ico, M(COL_BUSH[hi % 3]), 0.5, 0.38, 0.5,
        cxOff - 0.8, baseH + crownH + 0.28, -0.5, 0, hi, 0, g);
      part(GEO.ico, M(COL_BUSH[(hi + 1) % 3]), 0.4, 0.3, 0.4,
        -1.2, baseH + 0.22, 0.8, 0, hi * 0.7, 0, g);
    }
    scene.add(g);
  });
}

// Second-wave massing (deeper rework): gate pylons, landmark towers, and the
// east-road canyon bars. All axis-aligned slabs from the shared concrete
// materials. Towers read their window grids cheaply: one tall dark strip per
// face, divided by horizontal fins. Bars get ribbon strips split by vertical
// piers. Colliders in physics.js match the slab footprints exactly.
function buildVillageMassing(scene) {
  const { light, dark, window } = brutalistMats();
  VILLAGE_TOWERS.forEach(([x, z, s, h], ti) => {
    const mat = ti % 2 === 0 ? light : dark;
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    part(GEO.box, mat, s, h, s, 0, h / 2, 0, 0, 0, 0, g)
      .userData.blocker = true; // camera raycast blocker (issue #12)
    // Cap slab + core: stepped silhouette against the sky.
    part(GEO.box, mat, s + 0.3, 0.4, s + 0.3, 0, h + 0.2, 0, 0, 0, 0, g)
      .userData.blocker = true;
    part(GEO.box, mat, 1.2, 1.5, 1.2, 0, h + 1.15, 0, 0, 0, 0, g)
      .userData.blocker = true;
    // Window strips on all four faces + dividing fins.
    for (let side = 0; side < 4; side++) {
      const ry = (side * Math.PI) / 2;
      const fx = Math.sin(ry);
      const fz = Math.cos(ry);
      part(GEO.box, window, 1.1, h - 4.4, 0.14,
        fx * (s / 2 - 0.02), 2.4 + (h - 4.4) / 2, fz * (s / 2 - 0.02), 0, ry, 0, g);
      for (let wy = 3.4; wy < h - 1.6; wy += 2.2) {
        part(GEO.box, mat, 1.5, 0.28, 0.3, fx * (s / 2 + 0.05), wy, fz * (s / 2 + 0.05), 0, ry, 0, g);
      }
    }
    // Landmark towers (not the gate pylons) carry a roof bush.
    if (ti >= 2) {
      part(GEO.ico, M(COL_BUSH[ti % 3]), 0.5, 0.38, 0.5, 0.6, h + 0.68, -0.4, 0, ti, 0, g);
    }
    // The NW landmark (index 2) has a Blender-modelled hero version: tag its
    // primitive group so the async GLB can take over once loaded.
    if (ti === 2) g.userData.heroTower = true;
    scene.add(g);
  });
  VILLAGE_BARS.forEach(([cx, cz, w, t, h], bi) => {
    const mat = bi % 2 === 0 ? light : dark;
    const g = new THREE.Group();
    g.position.set(cx, 0, cz);
    part(GEO.box, mat, w, h, t, 0, h / 2, 0, 0, 0, 0, g)
      .userData.blocker = true; // camera raycast blocker (issue #12)
    // Roof cap band: long shadow line along the top.
    part(GEO.box, mat, w + 0.2, 0.3, t + 0.2, 0, h + 0.15, 0, 0, 0, 0, g)
      .userData.blocker = true;
    // Ribbon window strips on both long faces + vertical dividing piers.
    for (const fz of [-t / 2, t / 2]) {
      for (const wy of [2.8, 5.2, 7.4]) {
        if (wy > h - 1.2) continue;
        part(GEO.box, window, w - 0.8, 0.9, 0.14, 0, wy, fz - Math.sign(fz) * 0.02, 0, 0, 0, g);
      }
      for (let px = -w / 2 + 1.1; px < w / 2 - 0.5; px += 2.2) {
        part(GEO.box, mat, 0.3, h - 1.6, 0.25, px, (h - 1.6) / 2 + 0.6, fz + Math.sign(fz) * 0.05, 0, 0, 0, g);
      }
    }
    scene.add(g);
  });
}

function buildBridges(scene) {
  // Heavy concrete slab bridge (issue #14) with concrete parapets. Same
  // position, same crossing, same slope math as the physics deck colliders:
  // the visual deck is thickened downward only, so its top face matches the
  // walkable collider exactly. Parapets are visual-only (like the old rails:
  // the deck collider is what matters) but join the camera blockers.
  const { light, dark } = brutalistMats();
  const slopeLen = Math.hypot(BRIDGE_SPAN / 2, BRIDGE_CREST_H);
  const slopeAng = Math.atan2(BRIDGE_CREST_H, BRIDGE_SPAN / 2);
  const chanMid = (CHANNEL_Z0 + CHANNEL_Z1) / 2;
  const DECK_T = 0.5; // visual thickness (collider stays BRIDGE_THICK)
  const deckY = (z) => 0.15 + BRIDGE_CREST_H * (1 - Math.abs(z - chanMid) / (BRIDGE_SPAN / 2));
  for (const [bx, bw] of BRIDGES) {
    const mat = bx < 0 ? light : dark;
    // Lower the center so the thicker slab's TOP matches the collider top.
    const y = BRIDGE_CREST_H / 2 - (DECK_T - BRIDGE_THICK) / 2;
    const south = box(bw, DECK_T, slopeLen + 0.6, mat, bx, y, chanMid - BRIDGE_SPAN / 4);
    south.rotation.x = -slopeAng;
    south.userData.blocker = true;
    scene.add(south);
    const north = box(bw, DECK_T, slopeLen + 0.6, mat, bx, y, chanMid + BRIDGE_SPAN / 4);
    north.rotation.x = slopeAng;
    north.userData.blocker = true;
    scene.add(north);
    // Solid parapets both sides, following the slope.
    for (const sx of [-bw / 2 + 0.14, bw / 2 - 0.14]) {
      const parS = box(0.28, 0.55, slopeLen + 0.6, mat,
        bx + sx, deckY(chanMid - 1) + 0.28, chanMid - BRIDGE_SPAN / 4, false, false);
      parS.rotation.x = -slopeAng;
      parS.userData.blocker = true;
      scene.add(parS);
      const parN = box(0.28, 0.55, slopeLen + 0.6, mat,
        bx + sx, deckY(chanMid + 1) + 0.28, chanMid + BRIDGE_SPAN / 4, false, false);
      parN.rotation.x = slopeAng;
      parN.userData.blocker = true;
      scene.add(parN);
    }
  }
}

function buildArch(scene) {
  const mat = matte(COL_ARCH);
  const darkMat = matte(0x6e6b64); // one pillar slightly darker stone
  const ps = ARCH.pillarSize;
  const archP1 = box(ps, ARCH.pillarH, ps, darkMat, ARCH.x, ARCH.pillarH / 2, -ARCH.pillarGap);
  archP1.userData.blocker = true; // pass arch: camera raycast blocker (issue #12)
  scene.add(archP1);
  const archP2 = box(ps, ARCH.pillarH, ps, mat, ARCH.x, ARCH.pillarH / 2, ARCH.pillarGap);
  archP2.userData.blocker = true; // pass arch: camera raycast blocker (issue #12)
  scene.add(archP2);
  const archL = box(ps, ARCH.lintelH, ARCH.pillarGap * 2 + ps, mat, ARCH.x, ARCH.pillarH + ARCH.lintelH / 2, 0);
  archL.userData.blocker = true; // pass arch: camera raycast blocker (issue #12)
  scene.add(archL);
  // Moss patches on the pillars + obsidian shards at the base (visual).
  const moss = M(COL_BUSH[0]);
  flatPart(GEO.box, moss, 0.06, 0.7, 0.5, ARCH.x - ps / 2 - 0.01, 1.1, -ARCH.pillarGap, 0, scene);
  flatPart(GEO.box, moss, 0.06, 0.5, 0.4, ARCH.x - ps / 2 - 0.01, 0.7, ARCH.pillarGap + 0.2, 0, scene);
  const shard = M(COL_WALL_ROCK);
  flatPart(GEO.dodec, shard, 0.35, 0.5, 0.35, ARCH.x + 1.1, 0.2, -ARCH.pillarGap - 0.7, 0.5, scene);
  flatPart(GEO.dodec, shard, 0.28, 0.4, 0.28, ARCH.x + 0.9, 0.15, ARCH.pillarGap + 0.9, 1.2, scene);
  flatPart(GEO.dodec, shard, 0.22, 0.32, 0.22, ARCH.x - 1.2, 0.12, ARCH.pillarGap - 0.4, 2.1, scene);
}

function buildWater(scene) {
  const mat = new THREE.MeshStandardMaterial({
    color: COL_WATER,
    roughness: 0.55,
    metalness: 0,
    flatShading: true,
  });
  // Village channel strip (ground continues underneath; visual only).
  const chan = box(ZONE_VILLAGE.x1 - ZONE_VILLAGE.x0, 0.05, CHANNEL_Z1 - CHANNEL_Z0, mat,
    0, 0.04, (CHANNEL_Z0 + CHANNEL_Z1) / 2, false, false);
  scene.add(chan);
  // Open sea beyond the shoreline ridge (visual only, no ground below).
  const sea = box(SHORE_X - -85, 0.1, 64, mat, (SHORE_X + -85) / 2, SEA_TOP_Y - 0.05, 0, false, false);
  scene.add(sea);
}

function buildLava(scene) {
  const lavaMats = [];
  function lavaMat() {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x3a0a06,
      emissive: COL_LAVA,
      emissiveIntensity: 2,
      roughness: 1,
      metalness: 0,
      flatShading: true,
    });
    lavaMats.push(mat);
    return mat;
  }
  function lavaMesh(geo, x, y, z) {
    const m = new THREE.Mesh(geo, lavaMat());
    m.position.set(x, y, z);
    scene.add(m);
  }
  // Lava moat: a flat emissive annulus circling the fighting disc, between
  // the ring border and the rim piles. Visual-only; the player rolls over it.
  const moat = new THREE.Mesh(
    new THREE.RingGeometry(ARENA_MOAT_IN, ARENA_MOAT_OUT, 64),
    lavaMat()
  );
  moat.rotation.x = -Math.PI / 2;
  moat.position.set(ARENA_CENTER[0], 0.05, ARENA_CENTER[1]);
  moat.receiveShadow = true;
  scene.add(moat);
  // Lava pools tucked between rim piles. Clear of the disc, merged with the
  // moat visually. Visual-only, like all lava.
  for (const [x, z, r] of ARENA_LAVA_POOLS) {
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.08, 14), lavaMat());
    pool.position.set(x, 0.06, z);
    pool.receiveShadow = true;
    scene.add(pool);
  }
  // Thin seams along the pass walls (the dread-building approach; kept dark).
  const seam = new THREE.BoxGeometry(20, 0.06, 0.8);
  lavaMesh(seam, 32, 0.05, -5.2);
  lavaMesh(seam.clone(), 32, 0.05, 5.2);
  return { lavaMats };
}

function buildShafts(scene) {
  function shaft(x, z, color, opacity, rTop = 0.5, rBot = 1.8) {
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    });
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, 9, 8, 1, true), mat);
    m.position.set(x, 4, z);
    m.rotation.z = 0.15;
    scene.add(m);
  }
  // Dappled forest canopy light over clearings and path gaps + arena glow.
  for (const [x, z] of FOREST_SHAFTS) {
    shaft(x, z, COL_SHAFT_FOREST, FOREST_SHAFT_OPACITY);
  }
  // Volcanic glow (issue #9): narrow red wisps off the lava pools and moat.
  // Faint and red: additive blending over black lifts fast under sRGB output,
  // so the old salmon at 0.05 read as solid brown columns; lava red at 0.02
  // stays a dim red glow.
  for (const [x, z] of ARENA_SHAFTS) {
    shaft(x, z, COL_SHAFT_ARENA, 0.02, 0.35, 1.0);
  }
}

// Crater floor (issue #9): a flat ash disc (the fighting floor) with a thin
// lighter-stone ring border at its edge. Both visual-only; the physics ground
// is the arena slab underneath.
function buildArenaDisc(scene) {
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(ARENA_DISC_R, ARENA_DISC_R, 0.06, 48),
    M(COL_ARENA_DISC)
  );
  disc.position.set(ARENA_CENTER[0], 0.03, ARENA_CENTER[1]);
  disc.receiveShadow = true;
  scene.add(disc);
  const border = new THREE.Mesh(
    new THREE.RingGeometry(ARENA_BORDER_IN, ARENA_BORDER_OUT, 64),
    M(COL_STONE)
  );
  border.rotation.x = -Math.PI / 2;
  border.position.set(ARENA_CENTER[0], 0.065, ARENA_CENTER[1]);
  border.receiveShadow = true;
  scene.add(border);
}

// Crater ring (issue #9): collider-segment visuals from the shared layout
// (exact match with physics.js) plus a taller visual-only backdrop row behind
// the piles, so no sky shows through rim gaps. The west gap stays open.
function buildArenaRing(scene) {
  const ring = arenaRingLayout({
    cx: ARENA_CENTER[0],
    cz: ARENA_CENTER[1],
    radius: ARENA_RING_R,
    segments: ARENA_RING_SEGMENTS,
    gapHalfWidth: ARENA_GAP_HALF_WIDTH,
    segOverlap: ARENA_SEG_OVERLAP,
  });
  for (const s of ring.kept) {
    part(GEO.box, M(COL_WALL_ROCK), s.len, ARENA_RING_H, ARENA_RING_T,
      s.x, ARENA_RING_H / 2, s.z, 0, s.rotY, 0, scene)
      .userData.blocker = true; // camera raycast blocker (issue #12)
  }
  const back = arenaRingLayout({
    cx: ARENA_CENTER[0],
    cz: ARENA_CENTER[1],
    radius: ARENA_BACKDROP_R,
    segments: ARENA_RING_SEGMENTS,
    gapHalfWidth: ARENA_GAP_HALF_WIDTH,
    segOverlap: ARENA_SEG_OVERLAP,
  });
  for (const s of back.kept) {
    part(GEO.box, M(COL_OBSIDIAN), s.len, ARENA_BACKDROP_H, ARENA_BACKDROP_T,
      s.x, ARENA_BACKDROP_H / 2, s.z, 0, s.rotY, 0, scene)
      .userData.blocker = true; // camera raycast blocker (issue #12)
  }
}

// One piled-rock cluster: a chained main spire (each rock sits on the one
// below, so nothing floats) plus side branches. Dodecahedrons and squashed
// boxes in obsidian tones. Returns the placed rocks [{x,y,z,s}].
function rockPile(scene, rng, cx, cz, { count, chain, baseSize }) {
  const tones = [M(COL_OBSIDIAN), M(COL_OBSIDIAN_2), M(COL_OBSIDIAN_3)];
  const rocks = [];
  function addRock(s, x, y, z) {
    const tone = tones[Math.floor(rng() * tones.length)];
    let m;
    if (rng() < 0.6) {
      m = part(GEO.dodec, tone, s * 0.55, s * 0.4, s * 0.55,
        x, y, z, 0, rng() * Math.PI, 0, scene);
    } else {
      m = part(GEO.box, tone, s, s * 0.6, s * 0.8,
        x, y, z, (rng() - 0.5) * 0.3, rng() * Math.PI, (rng() - 0.5) * 0.3, scene);
    }
    m.userData.blocker = true; // camera raycast blocker (issue #12)
    rocks.push({ x, y, z, s });
  }
  let px = cx;
  let pz = cz;
  let py = 0;
  let ps = baseSize;
  for (let j = 0; j < count; j++) {
    if (j < chain) {
      // Main spire: stack on the previous rock with a small jitter.
      const s = j === 0 ? ps : Math.max(0.7, ps * (0.78 + rng() * 0.12));
      const x = px + (j === 0 ? 0 : (rng() - 0.5) * 0.7);
      const z = pz + (j === 0 ? 0 : (rng() - 0.5) * 0.7);
      const y = j === 0 ? s * 0.32 : py + ps * 0.55;
      addRock(s, x, y, z);
      px = x;
      pz = z;
      py = y;
      ps = s;
    } else {
      // Side branch: sit on a random earlier rock.
      const parent = rocks[Math.floor(rng() * rocks.length)];
      const s = Math.max(0.7, parent.s * (0.65 + rng() * 0.25));
      addRock(s, parent.x + (rng() - 0.5) * 1.4, parent.y + parent.s * 0.45,
        parent.z + (rng() - 0.5) * 1.4);
    }
  }
  return rocks;
}

// The rim (issue #9): 14 piled-rock clusters around the ring (skipping the
// gap), jagged heights, glowing cracks in a few rocks, strata bands on the
// tallest piles. All visual dressing on the collider ring: no colliders here.
function buildArenaRim(scene) {
  const crackMat = new THREE.MeshStandardMaterial({
    color: 0x3a0a06,
    emissive: COL_LAVA,
    emissiveIntensity: 1.2,
    roughness: 1,
    metalness: 0,
    flatShading: true,
  });
  const rng = mulberry32(ARENA_RIM_SEED);
  const candidates = [];
  let pileIdx = 0;
  for (let i = 0; i < 18; i++) {
    const deg = 10 + i * 20;
    const a = (deg * Math.PI) / 180;
    const dGap = Math.abs(Math.atan2(Math.sin(a - Math.PI), Math.cos(a - Math.PI)));
    if (dGap < (32 * Math.PI) / 180) continue; // keep the mouth clear
    const r = ARENA_PILE_R + (rng() - 0.5) * 1.0;
    const cx = ARENA_CENTER[0] + r * Math.cos(a);
    const cz = ARENA_CENTER[1] + r * Math.sin(a);
    const tall = pileIdx === 2 || pileIdx === 8 || pileIdx === 11;
    const count = tall ? 6 + Math.floor(rng() * 3) : 3 + Math.floor(rng() * 4);
    const rocks = rockPile(scene, rng, cx, cz, {
      count,
      chain: tall ? 6 : count >= 5 ? 4 : 3,
      baseSize: (tall ? 2.0 : 1.9) + rng() * 0.4,
    });
    // Strata band on the tallest piles: a lighter horizontal box partway up.
    if (tall) {
      const topY = Math.max(...rocks.map((k) => k.y));
      part(GEO.box, M(COL_ARENA_STRATA), 1.4, 0.18, 2.2,
        cx, topY * 0.45, cz, 0, Math.PI / 2 - a, 0, scene);
    }
    // Crack candidate: a mid-stack rock with a face toward the arena.
    const mid = rocks[1 + Math.floor(rng() * Math.max(1, rocks.length - 2))];
    candidates.push({ rock: mid, angle: a });
    pileIdx++;
  }
  // Glowing cracks: small emissive slits on a few pile rocks, facing the
  // arena floor. One shared dimmer-than-lava material, pulsed in main.js.
  const crng = mulberry32(ARENA_RIM_SEED + 7);
  const order = candidates
    .map((c, i) => [crng(), i])
    .sort((p, q) => p[0] - q[0])
    .slice(0, ARENA_CRACK_COUNT);
  for (const [, i] of order) {
    const { rock, angle: a } = candidates[i];
    const h = 0.4 + crng() * 0.3;
    const m = part(GEO.box, crackMat, 0.14, h, 0.3,
      rock.x - Math.cos(a) * rock.s * 0.4, rock.y, rock.z - Math.sin(a) * rock.s * 0.4,
      0, Math.PI / 2 - a, 0, scene);
    m.castShadow = false;
  }
  return { crackMats: [crackMat] };
}

// Mouth gate (issue #9): obsidian pillars capping the ring ends + a cracked
// two-piece lintel. Transforms match the physics colliders exactly.
function buildArenaGate(scene) {
  const { gapEdges } = arenaRingLayout({
    cx: ARENA_CENTER[0],
    cz: ARENA_CENTER[1],
    radius: ARENA_RING_R,
    segments: ARENA_RING_SEGMENTS,
    gapHalfWidth: ARENA_GAP_HALF_WIDTH,
    segOverlap: ARENA_SEG_OVERLAP,
  });
  const pw = ARENA_GATE.pillarW;
  const ph = ARENA_GATE.pillarH;
  const pillars = gapEdges.map((e) => [
    ARENA_CENTER[0] + ARENA_RING_R * Math.cos(e),
    ARENA_RING_R * Math.sin(e),
  ]);
  for (const [px, pz] of pillars) {
    part(GEO.box, M(COL_OBSIDIAN_3), pw, ph, pw, px, ph / 2, pz, 0, 0, 0, scene)
      .userData.blocker = true; // mouth-gate pillar: camera raycast blocker (issue #12)
    part(GEO.box, M(COL_OBSIDIAN_2), pw + 0.5, 0.35, pw + 0.5,
      px, ph + 0.17, pz, 0, 0, 0, scene)
      .userData.blocker = true; // cap stone: camera raycast blocker (issue #12)
  }
  const gx = pillars[0][0];
  const lh = ARENA_GATE.lintelH;
  const lw = ARENA_GATE.lintelW;
  const llen = ARENA_GATE.lintelLen;
  part(GEO.box, M(COL_OBSIDIAN_3), lw, lh, llen,
    gx, ph + lh / 2, -llen / 2 + 0.1, 0, 0, 0, scene)
    .userData.blocker = true; // cracked lintel: camera raycast blocker (issue #12)
  part(GEO.box, M(COL_OBSIDIAN_2), lw, lh, llen,
    gx + 0.3, ph + lh / 2 - 0.25, llen / 2 - 0.1, 0, 0, 0, scene)
    .userData.blocker = true; // cracked lintel: camera raycast blocker (issue #12)
}

// Volcanic spires (issue #9): the crater skyline. Twisted two-cone snags on
// squat bases, behind the backdrop wall; bases hidden, tops rising into the
// glow. The upper cone twists 45 degrees and leans off-axis, so facets catch
// the light differently from every side instead of rendering one flat face.
function buildArenaSpires(scene) {
  ARENA_SPIRES.forEach(([x, z, h, w], i) => {
    part(GEO.box, M(COL_OBSIDIAN), w * 1.6, 1.2, w * 1.6, x, 0.6, z, 0, i * 0.4, 0, scene)
      .userData.blocker = true; // spire base: camera raycast blocker (issue #12)
    part(GEO.cone4, M(COL_OBSIDIAN_3), w * 0.8, h * 0.55, w * 0.8,
      x, 0.8 + h * 0.275, z, 0, i * 1.3 + 0.4, 0.04 * (i - 1), scene)
      .userData.blocker = true; // spire: camera raycast blocker (issue #12)
    part(GEO.cone4, M(COL_OBSIDIAN_3), w * 0.55, h * 0.5, w * 0.55,
      x + 0.3 * (i - 1), 0.8 + h * 0.55 - 0.5 + h * 0.25, z + 0.2 * i,
      0.05 * i, i * 1.3 + 0.4 + Math.PI / 4, 0.08 * (i - 1), scene)
      .userData.blocker = true; // spire tip: camera raycast blocker (issue #12)
  });
}

// Approach shoulders (issue #9): rock piles embedded in the corridor wall
// line for the pass's last stretch, tops peeking above the walls. The walls'
// colliders cover the embedded parts; the piles themselves are visual-only.
function buildApproachPiles(scene) {
  const rng = mulberry32(ARENA_APPROACH_SEED);
  for (const [x, z] of ARENA_APPROACH) {
    rockPile(scene, rng, x, z, { count: 4, chain: 4, baseSize: 1.7 + rng() * 0.4 });
  }
}

// Soft round sprite so ember/smoke points read as glow/dust, not squares.
function dotTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.5)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

// Crater garnish (issue #9): ember motes drifting up off the lava ring and
// pools, plus one smoke vent over a rim pool. Animated in main.js.
function buildArenaParticles(scene) {
  const rng = mulberry32(ARENA_RIM_SEED + 5);
  const dot = dotTexture();
  function cloud(count, color, size, opacity, additive, place) {
    const pos = new Float32Array(count * 3);
    const base = [];
    for (let i = 0; i < count; i++) {
      const [x, y, z] = place();
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      base.push([x, y, z, rng() * 2.2, 0.4 + rng() * 0.5, rng() * Math.PI * 2]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color, size, transparent: true, opacity, map: dot,
      sizeAttenuation: true, depthWrite: false,
      ...(additive ? { blending: THREE.AdditiveBlending } : {}),
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    return { points, base };
  }
  // Embers: over the moat ring and inside the pool rims.
  const { points: embers, base: emberBase } = cloud(
    EMBER_COUNT, COL_EMBER, 0.22, 0.9, true, () => {
      if (rng() < 0.6) {
        const a = rng() * Math.PI * 2;
        const r = ARENA_MOAT_IN + rng() * (ARENA_MOAT_OUT - ARENA_MOAT_IN);
        return [ARENA_CENTER[0] + r * Math.cos(a), 0.2 + rng() * 1.3, ARENA_CENTER[1] + r * Math.sin(a)];
      }
      const [px, pz, pr] = ARENA_LAVA_POOLS[Math.floor(rng() * ARENA_LAVA_POOLS.length)];
      const a = rng() * Math.PI * 2;
      const r = rng() * pr * 0.8;
      return [px + r * Math.cos(a), 0.2 + rng() * 1.0, pz + r * Math.sin(a)];
    });
  // Smoke: one soft vent over the first rim pool, slower and taller.
  const [sx, sz] = ARENA_LAVA_POOLS[0];
  const { points: smoke, base: smokeBase } = cloud(
    SMOKE_COUNT, COL_SMOKE, 0.7, 0.22, false,
    () => [sx + (rng() - 0.5) * 2, 0.5 + rng() * 1.0, sz + (rng() - 0.5) * 2]);
  return { embers, emberBase, smoke, smokeBase };
}

function buildFarSilhouettes(scene) {
  const mat = new THREE.MeshBasicMaterial({ color: 0x6a7686, fog: true });
  const cx = 6;
  const cz = -20;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.35;
    const h = 15 + ((i * 7) % 4) * 4;
    const w = 8 + ((i * 3) % 3) * 3;
    const geo = i % 2 === 0 ? new THREE.BoxGeometry(w, h, w) : new THREE.ConeGeometry(w / 2, h, 5);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(cx + Math.cos(a) * 105, h / 2 - 2, cz + Math.sin(a) * 105);
    m.rotation.y = a;
    scene.add(m);
  }
}

function buildProps(scene) {
  const wood = M(COL_BRIDGE);
  const darkWood = M(COL_WOOD_DARK);
  const stone = M(COL_STONE);
  // Crates (some stacked).
  for (const [x, z, ry, s, dy, by = 0] of CRATES) {
    part(GEO.box, wood, s, s, s, x, by + s / 2 + dy, z, 0, ry, 0, scene);
  }
  // Barrels with two band rings.
  for (const [x, z, by = 0] of BARRELS) {
    part(GEO.cyl10, wood, 0.7, 0.9, 0.7, x, by + 0.45, z, 0, 0, 0, scene);
    part(GEO.cyl10, darkWood, 0.72, 0.07, 0.72, x, by + 0.25, z, 0, 0, 0, scene);
    part(GEO.cyl10, darkWood, 0.72, 0.07, 0.72, x, by + 0.65, z, 0, 0, 0, scene);
  }
  // Fence runs (issue #14): village runs are low concrete walls; the shore
  // run (fi 2, beach) keeps its wood posts + draped net. The concrete walls
  // match the fence colliders (0.3 thick, 1.0 high), so movement is unchanged.
  FENCES.forEach(([x1, z1, x2, z2, by = 0], fi) => {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const ry = Math.atan2(x2 - x1, z2 - z1);
    const cx = (x1 + x2) / 2;
    const cz = (z1 + z2) / 2;
    if (fi !== 2) {
      const { light } = brutalistMats();
      part(GEO.box, light, 0.3, 1.0, len, cx, by + 0.5, cz, 0, ry, 0, scene);
      part(GEO.box, light, 0.42, 0.1, len + 0.1, cx, by + 1.0, cz, 0, ry, 0, scene);
      return;
    }
    const n = Math.max(2, Math.round(len / 1.3) + 1);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      part(GEO.box, darkWood, 0.12, 1.0, 0.12, x1 + (x2 - x1) * t, by + 0.5, z1 + (z2 - z1) * t, 0, 0, 0, scene);
    }
    part(GEO.box, wood, 0.08, 0.08, len, cx, by + 0.55, cz, 0, ry, 0, scene);
    part(GEO.box, wood, 0.08, 0.08, len, cx, by + 0.88, cz, 0, ry, 0, scene);
    // Draped fishing net on the shore run (plane width aligned with the run).
    const net = new THREE.Mesh(GEO.plane, new THREE.MeshStandardMaterial({
      color: COL_NET, roughness: 1, metalness: 0, side: THREE.DoubleSide,
    }));
    net.scale.set(len * 0.7, 0.7, 1);
    net.position.set(cx + ((z2 - z1) / len) * 0.12, by + 0.55, cz - ((x2 - x1) / len) * 0.12);
    net.rotation.y = ry - Math.PI / 2;
    scene.add(net);
  });
  // Benches (issue #14): village benches are solid concrete slabs; the beach
  // rest spot keeps its wood. Concrete top (0.6) matches the bench collider.
  for (const [x, z, ry, by = 0] of BENCHES) {
    const g = new THREE.Group();
    g.position.set(x, by, z);
    g.rotation.y = ry;
    if (by === 0) {
      const { light } = brutalistMats();
      part(GEO.box, light, 1.6, 0.5, 0.5, 0, 0.25, 0, 0, 0, 0, g);
      part(GEO.box, light, 1.7, 0.1, 0.6, 0, 0.55, 0, 0, 0, 0, g);
    } else {
      part(GEO.box, darkWood, 0.12, 0.45, 0.4, -0.6, 0.225, 0, 0, 0, 0, g);
      part(GEO.box, darkWood, 0.12, 0.45, 0.4, 0.6, 0.225, 0, 0, 0, 0, g);
      part(GEO.box, wood, 1.6, 0.1, 0.45, 0, 0.5, 0, 0, 0, 0, g);
      part(GEO.box, wood, 1.6, 0.4, 0.08, 0, 0.75, -0.2, 0, 0, 0, g);
    }
    scene.add(g);
  }
  // Lamp posts (issue #14): slim concrete pillars with a simple cap, in the
  // same positions, so the village read stays familiar. Matches the 2.6-high
  // lantern colliders.
  for (const [x, z] of LANTERNS) {
    const { dark } = brutalistMats();
    part(GEO.box, dark, 0.22, 2.6, 0.22, x, 1.3, z, 0, 0, 0, scene);
    part(GEO.box, dark, 0.42, 0.14, 0.42, x, 2.67, z, 0, 0, 0, scene);
  }
  // Retired by issue #14 (visual-only, no colliders): the laundry line and
  // the flower pots were hut-door dressing and read as dollhouse clutter
  // against the monoliths.
  // Big bushes (colliders) + small planted bushes at hut corners (visual).
  BUSH_BIG.forEach(([x, z, r], i) => {
    part(GEO.ico, M(COL_BUSH[i % 3]), r, r * 0.75, r, x, r * 0.55, z, 0, i, 0, scene);
  });
  const smallBush = [
    [-15.5, 10.8], [15.5, 10.8], [-15, -9.5], [15, -9.5],
    [-7.5, -11.5], [9, 6.8], [-15.5, -6.5], [3, 8.8],
  ];
  smallBush.forEach(([x, z], i) => {
    part(GEO.ico, M(COL_BUSH[(i + 1) % 3]), 0.4, 0.3, 0.4, x, 0.22, z, 0, i * 0.7, 0, scene);
  });
  // Market stall: posts + roof + counter crate + goods dots.
  {
    const g = new THREE.Group();
    g.position.set(STALL[0], 0, STALL[1]);
    g.rotation.y = STALL[2];
    for (const px of [-1.0, 1.0]) {
      for (const pz of [-0.7, 0.7]) {
        part(GEO.box, darkWood, 0.12, 2.2, 0.12, px, 1.1, pz, 0, 0, 0, g);
      }
    }
    part(GEO.box, M(COL_HUT_ROOF[0]), 2.6, 0.12, 2.0, 0, 2.25, 0, 0, 0, 0, g);
    part(GEO.box, wood, 1.2, 0.6, 0.8, 0, 0.3, 0, 0, 0, 0, g);
    for (let i = 0; i < 5; i++) {
      part(GEO.ico, M(COL_FLOWER[i % 3]), 0.12, 0.12, 0.12,
        -0.4 + (i % 3) * 0.4, 0.68, i < 3 ? -0.15 : 0.2, 0, 0, 0, g);
    }
    scene.add(g);
  }
  // Well: stone ring + posts + tiny pitched roof.
  {
    const g = new THREE.Group();
    g.position.set(WELL[0], 0, WELL[1]);
    part(GEO.cyl10, stone, 1.3, 0.8, 1.3, 0, 0.4, 0, 0, 0, 0, g);
    part(GEO.cyl10, M(0x1e1c19), 1.0, 0.05, 1.0, 0, 0.75, 0, 0, 0, 0, g);
    part(GEO.box, darkWood, 0.12, 1.6, 0.12, -0.65, 0.8, 0, 0, 0, 0, g);
    part(GEO.box, darkWood, 0.12, 1.6, 0.12, 0.65, 0.8, 0, 0, 0, 0, g);
    part(GEO.box, M(COL_HUT_ROOF[1]), 1.6, 0.08, 0.6, 0, 1.75, -0.25, -0.5, 0, 0, g);
    part(GEO.box, M(COL_HUT_ROOF[1]), 1.6, 0.08, 0.6, 0, 1.75, 0.25, 0.5, 0, 0, g);
    scene.add(g);
  }
  // Cart: bed + wheels + handles, parked by a hut.
  {
    const g = new THREE.Group();
    g.position.set(CART[0], 0, CART[1]);
    g.rotation.y = CART[2];
    part(GEO.box, darkWood, 2.0, 0.25, 1.2, 0, 0.75, 0, 0, 0, 0, g);
    part(GEO.box, wood, 2.0, 0.3, 0.1, 0, 1.0, -0.55, 0, 0, 0, g);
    part(GEO.box, wood, 2.0, 0.3, 0.1, 0, 1.0, 0.55, 0, 0, 0, g);
    for (const px of [-0.7, 0.7]) {
      for (const pz of [-0.65, 0.65]) {
        part(GEO.cyl10, wood, 0.7, 0.12, 0.7, px, 0.35, pz, Math.PI / 2, 0, 0, g);
      }
    }
    part(GEO.cyl8, darkWood, 0.08, 1.6, 0.08, -0.3, 0.5, 1.2, 0.9, 0, 0, g);
    part(GEO.cyl8, darkWood, 0.08, 1.6, 0.08, 0.3, 0.5, 1.2, 0.9, 0, 0, g);
    scene.add(g);
  }
  // Signposts: post + pictogram shape (fish / boat). Never text.
  for (const [x, z, ry, kind] of SIGNS) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    part(GEO.box, darkWood, 0.15, 2.0, 0.15, 0, 1.0, 0, 0, 0, 0, g);
    part(GEO.box, darkWood, 0.9, 0.1, 0.1, 0, 1.75, 0, 0, 0, 0, g);
    if (kind === 'fish') {
      const fm = M(COL_CLOTH[1]);
      part(GEO.cone6, fm, 0.25, 0.7, 0.11, 0.05, 1.45, 0, 0, 0, -Math.PI / 2, g);
      part(GEO.cone6, fm, 0.15, 0.3, 0.07, -0.4, 1.45, 0, 0, 0, Math.PI / 2, g);
    } else if (kind === 'sword') {
      // Sword pictogram: vertical blade + guard + grip, steel and wood.
      const steel = M(0xb9c1c7, 0.5);
      part(GEO.box, steel, 0.12, 0.7, 0.04, 0, 1.3, 0, 0, 0, 0, g);
      part(GEO.cone4, steel, 0.12, 0.14, 0.04, 0, 0.88, 0, Math.PI, 0, 0, g);
      part(GEO.box, darkWood, 0.34, 0.08, 0.06, 0, 1.68, 0, 0, 0, 0, g);
      part(GEO.cyl8, darkWood, 0.05, 0.22, 0.05, 0, 1.82, 0, 0, 0, 0, g);
    } else if (kind === 'hammer') {
      // Hammer pictogram: head bar + handle, steel and wood.
      const steel = M(0xb9c1c7, 0.5);
      part(GEO.box, steel, 0.44, 0.2, 0.06, 0, 1.58, 0, 0, 0, 0, g);
      part(GEO.cyl8, darkWood, 0.06, 0.55, 0.06, 0, 1.2, 0, 0, 0, 0, g);
    } else {
      part(GEO.box, wood, 0.7, 0.2, 0.25, 0, 1.35, 0, 0, 0, 0, g);
      part(GEO.cyl8, darkWood, 0.06, 0.5, 0.06, 0, 1.6, 0, 0, 0, 0, g);
      part(GEO.box, M(COL_CLOTH[0]), 0.3, 0.25, 0.03, 0.17, 1.62, 0, 0, 0, 0, g);
    }
    scene.add(g);
  }
  // Exit gates: wooden posts + crossbeam (woodier than the stone arch).
  for (const [x, z, ry, postH, halfGap] of GATES) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    part(GEO.box, darkWood, 0.35, postH, 0.35, -halfGap, postH / 2, 0, 0, 0, 0, g);
    part(GEO.box, darkWood, 0.35, postH, 0.35, halfGap, postH / 2, 0, 0, 0, 0, g);
    part(GEO.box, wood, halfGap * 2 + 0.6, 0.3, 0.3, 0, postH - 0.15, 0, 0, 0, 0, g);
    scene.add(g);
  }
}

function buildSeaside(scene) {
  const wood = M(COL_BRIDGE);
  const darkWood = M(COL_WOOD_DARK);
  // Pier: plank deck through the dune gap, posts down into the water, railings
  // on both sides (there is no ground below), and a wider end platform with a
  // crate + barrel cluster (props) and a draped net.
  const [x0, x1, z, w, topY] = PIER;
  const [platX, platZ, platS] = PIER_PLATFORM;
  const len = Math.abs(x1 - x0);
  const cx = (x0 + x1) / 2;
  for (let i = 0; i < 5; i++) {
    const px = x0 - 0.5 - i * 1.0;
    part(GEO.box, wood, 0.95, 0.08, w, px, topY - 0.04, z, 0, 0, 0, scene);
  }
  for (let i = 0; i < 3; i++) {
    const px = platX - platS / 2 + 0.4 + i * ((platS - 0.8) / 2);
    part(GEO.box, wood, 0.8, 0.08, platS, px, topY - 0.04, platZ, 0, 0, 0, scene);
  }
  function railing(xa, xb, zr) {
    const rl = Math.abs(xb - xa);
    const rcx = (xa + xb) / 2;
    const n = Math.max(2, Math.round(rl / 1.1) + 1);
    for (let i = 0; i < n; i++) {
      const px = xa + ((xb - xa) * i) / (n - 1);
      part(GEO.box, darkWood, 0.09, 1.0, 0.09, px, topY + 0.5, zr, 0, 0, 0, scene);
    }
    part(GEO.box, darkWood, rl + 0.1, 0.08, 0.1, rcx, topY + 1.0, zr, 0, 0, 0, scene);
  }
  railing(x0, x1, z - w / 2 + 0.08);
  railing(x0, x1, z + w / 2 - 0.08);
  railing(platX - platS / 2, platX + platS / 2, platZ - platS / 2 + 0.08);
  railing(platX - platS / 2, platX + platS / 2, platZ + platS / 2 - 0.08);
  part(GEO.box, darkWood, 0.1, 0.08, platS, platX - platS / 2, topY + 1.0, platZ, 0, 0, 0, scene);
  // Support posts from the deck down past the sea surface.
  for (const [px, pz] of [
    [-53, 4.3],
    [-53, 5.7],
    [-56.5, 4.3],
    [-56.5, 5.7],
    [-58.5, 4.0],
    [-58.5, 6.0],
  ]) {
    part(GEO.cyl8, darkWood, 0.18, 1.6, 0.18, px, topY - 0.75, pz, 0, 0, 0, scene);
  }
  // Draped net on the platform's south rail.
  const net = new THREE.Mesh(GEO.plane, new THREE.MeshStandardMaterial({
    color: COL_NET, roughness: 1, metalness: 0, side: THREE.DoubleSide,
  }));
  net.scale.set(platS * 0.7, 0.7, 1);
  net.position.set(platX, topY + 0.55, platZ + platS / 2 - 0.02);
  scene.add(net);
  // Beached boat: hull + angled bow/stern + mast + furled sail.
  const g = new THREE.Group();
  g.position.set(BOAT[0], BOAT[3] || 0, BOAT[1]);
  g.rotation.y = BOAT[2];
  part(GEO.box, wood, 2.2, 0.5, 1.0, 0, 0.35, 0, 0, 0, 0, g);
  part(GEO.box, wood, 0.5, 0.35, 0.7, 1.15, 0.45, 0, 0, 0, -0.5, g);
  part(GEO.box, wood, 0.5, 0.35, 0.7, -1.15, 0.45, 0, 0, 0, 0.5, g);
  part(GEO.cyl8, darkWood, 0.12, 2.2, 0.12, 0, 1.4, 0, 0, 0, 0, g);
  part(GEO.box, M(COL_CLOTH[0]), 0.9, 0.4, 0.08, 0, 1.5, 0, 0, 0, 0, g);
  scene.add(g);
  // Coiled rope by the pier.
  const rope = part(GEO.torus, wood, 1, 1, 1, ROPE[0], (ROPE[2] || 0) + 0.09, ROPE[1], -Math.PI / 2, 0, 0, scene);
  rope.castShadow = false;
}

// Terraced shelves: grassy tops with rock-strata cliff faces (one box, two
// materials). Transforms mirror the physics shelf bodies exactly.
function buildShelves(scene) {
  const sideMat = M(COL_STRATA);
  BEACH_SHELVES.forEach(([x0, x1, top], i) => {
    const sx = x1 - x0;
    const sy = top - BEACH_BASE_Y;
    const topMat = M(COL_SHELF_TOP[i]);
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(sx, sy, 40),
      [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]
    );
    m.position.set((x0 + x1) / 2, (top + BEACH_BASE_Y) / 2, 0);
    m.castShadow = true;
    m.receiveShadow = true;
    m.userData.blocker = true; // raised terrace slab: camera raycast blocker (issue #12)
    scene.add(m);
  });
}

// Beach ramps: inclined dirt slabs with side posts. Same math as physics.
function buildBeachRamps(scene) {
  const mat = M(COL_RAMP);
  const postMat = M(COL_WOOD_DARK);
  for (const [xE, xW, zC, w, tE, tW] of BEACH_RAMPS) {
    const run = xE - xW;
    const drop = tE - tW;
    const len = Math.hypot(run, drop);
    const ang = Math.atan2(drop, run);
    const topC = (tE + tW) / 2;
    const cx = (xE + xW) / 2;
    const cy = topC - (BEACH_RAMP_THICK / 2) * Math.cos(ang);
    const m = new THREE.Mesh(new THREE.BoxGeometry(len, BEACH_RAMP_THICK, w), mat);
    m.position.set(cx, cy, zC);
    m.rotation.z = ang;
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
    // Side posts following the slope (visual).
    const surfY = (x) => topC + ((x - cx) / (run / 2)) * (drop / 2);
    for (const sz of [-w / 2 + 0.2, w / 2 - 0.2]) {
      for (const t of [0.15, 0.5, 0.85]) {
        const px = xW + run * t;
        part(GEO.box, postMat, 0.12, 0.7, 0.12, px, surfY(px) + 0.3, zC + sz, 0, 0, 0, scene);
      }
    }
  }
}

function buildParapets(scene) {
  const mat = M(COL_STRATA);
  for (const [edgeX, z0, z1, baseY] of BEACH_PARAPETS) {
    part(GEO.box, mat, BEACH_PARAPET_T, BEACH_PARAPET_H, z1 - z0,
      edgeX + BEACH_PARAPET_T / 2, baseY + BEACH_PARAPET_H / 2, (z0 + z1) / 2,
      0, 0, 0, scene);
  }
}

// Cairns: stacked-stone way-down markers at every ramp top.
function buildCairns(scene) {
  const mat = M(COL_STONE);
  for (const [x, z, baseY] of BEACH_CAIRNS) {
    part(GEO.dodec, mat, 0.64, 0.4, 0.64, x, baseY + 0.2, z, 0, x, 0, scene);
    part(GEO.dodec, mat, 0.48, 0.32, 0.48, x, baseY + 0.52, z, 0, z, 0, scene);
    part(GEO.dodec, mat, 0.34, 0.26, 0.34, x, baseY + 0.78, z, 0, x * 2, 0, scene);
    part(GEO.dodec, mat, 0.2, 0.18, 0.2, x, baseY + 0.98, z, 0, 0, 0, scene);
  }
}

function buildStones(scene) {
  const mat = M(COL_ROCK);
  for (const [x, z, baseY, h] of BEACH_STONES) {
    // Axis-aligned: the visual must match the physics box core.
    part(GEO.box, mat, 0.7, h, 0.5, x, baseY + h / 2, z, 0, 0, 0, scene);
  }
}

// Permanent weapon pedestals: the sword's in its cove, the hammer's in the
// forest. Only the weapon despawns on pickup; the stone stays.
function buildPedestals(scene) {
  for (const [x, z, baseY] of [
    [SWORD_COVE[0], SWORD_COVE[1], BEACH_BASE_Y],
    [HAMMER_PEDESTAL[0], HAMMER_PEDESTAL[1], 0],
  ]) {
    part(GEO.cyl10, M(COL_STONE), 0.9, 0.35, 0.9, x, baseY + 0.175, z, 0, 0, 0, scene);
    part(GEO.cyl10, M(COL_ARCH), 1.0, 0.08, 1.0, x, baseY + 0.39, z, 0, 0, 0, scene);
  }
}

function grassTuft(scene, mat, x, baseY, z) {
  for (const tilt of [-0.25, 0, 0.25]) {
    flatPart(GEO.cone6, mat, 0.18, 0.5, 0.18, x + tilt * 0.4, baseY + 0.22, z, 0, scene)
      .rotation.z = tilt;
  }
}

// Shelf-top grass (seeded scatter, kept off ramps/parapets/props) plus dune
// crests, bushes, and the full beach-proper dressing: wet band, foam, sand
// patches, driftwood, seaweed, tide pools, shells. All visual-only.
function buildBeachDressing(scene) {
  const rng = mulberry32(BEACH_TUFT_SEED);
  const tuftMats = [M(COL_BUSH[0]), M(COL_BUSH[2]), M(COL_PATCH_SAND)];
  // Blocked rects per shelf [x0, x1, z0, z1]: ramp corridors + drop/gap lips.
  const blockedRects = [
    [
      [-30, -27.5, -17, -11], // R01 top corridor
      [-30, -27.5, 6, 10], // D1 drop lip
    ],
    [
      [-34, -30, -16.5, -11.5], // R01 bottom corridor
      [-38, -36, 11.5, 16.5], // R12 top corridor
      [-39, -37, -10, -6], // D2 drop lip
    ],
    [
      [-42, -38, 11.5, 16.5], // R12 bottom corridor
      [-46, -44, 11.5, 16.5], // gentle top corridor
      [-46, -44.5, -4, 0], // steep top corridor
    ],
  ];
  const avoid = [
    ...ROCKS.map(([x, z]) => [x, z, 1.6]),
    ...BEACH_STONES.map(([x, z]) => [x, z, 1.6]),
    ...BEACH_CAIRNS.map(([x, z]) => [x, z, 1.1]),
    [-22, 4.5, 1.2], // sword sign
  ];
  BEACH_SHELVES.forEach(([x0, x1, top], si) => {
    let placed = 0;
    for (let tries = 0; tries < 120 && placed < BEACH_TUFTS_PER_SHELF[si]; tries++) {
      const x = x0 + 1.2 + rng() * (x1 - x0 - 2.4);
      const z = -18 + rng() * 36;
      if (x0 + 1.2 >= x1 - 1.2) break;
      let bad = false;
      for (const [bx0, bx1, bz0, bz1] of blockedRects[si]) {
        if (x >= bx0 && x <= bx1 && z >= bz0 && z <= bz1) {
          bad = true;
          break;
        }
      }
      if (!bad) {
        for (const [ax, az, ar] of avoid) {
          if (Math.hypot(x - ax, z - az) < ar) {
            bad = true;
            break;
          }
        }
      }
      if (bad) continue;
      placed++;
      grassTuft(scene, tuftMats[Math.floor(rng() * 3)], x, top, z);
    }
  });
  for (const [x, z, baseY] of DUNE_GRASS) {
    grassTuft(scene, tuftMats[1], x, baseY, z);
  }
  SHELF_BUSHES.forEach(([x, z, baseY, r], i) => {
    part(GEO.ico, M(COL_BUSH[i % 3]), r * 2, r * 1.5, r * 2, x, baseY + r, z, 0, i, 0, scene);
  });

  const B = BEACH_BASE_Y;
  // Wet-sand band along the waterline + a thin static foam edge.
  flatStrip(scene, -51, 0, 2, 40, B + 0.01, COL_SHORE);
  flatStrip(scene, -51.8, 0, 0.5, 36, B + 0.06, COL_FOAM);
  // Sand patches.
  for (const [x, z, r, tone] of SAND_PATCHES) {
    flatPart(GEO.cyl10, M(tone === 0 ? COL_SAND_PALE : COL_SAND_DARK),
      r * 2, 0.03, r * 2, x, B + 0.015, z, x * 1.7, scene);
  }
  // Driftwood: single logs or two angled segments.
  const dwMat = M(COL_DRIFTWOOD);
  for (const [x, z, ry, len, twoSeg] of DRIFTWOOD) {
    const g = new THREE.Group();
    g.position.set(x, B + 0.14, z);
    g.rotation.y = ry;
    part(GEO.cyl8, dwMat, 0.28, len, 0.28, twoSeg ? -len / 4 : 0, 0, 0, 0, 0, Math.PI / 2, g);
    if (twoSeg) {
      part(GEO.cyl8, dwMat, 0.24, len * 0.7, 0.24, len / 4, 0.02, len / 5, 0, 0.5, Math.PI / 2, g);
    }
    g.traverse((o) => {
      if (o.isMesh) o.castShadow = false;
    });
    scene.add(g);
  }
  // Seaweed strips near the waterline.
  for (const [x, z, ry] of SEAWEED) {
    flatPart(GEO.box, M(COL_SEAWEED), 1.2, 0.03, 0.25, x, B + 0.03, z, ry, scene);
  }
  // Tide pools in rock hollows.
  const poolMat = new THREE.MeshStandardMaterial({
    color: COL_TIDE_POOL, roughness: 0.5, metalness: 0, flatShading: true,
  });
  const rimMat = M(COL_ROCK);
  TIDE_POOLS.forEach(([x, z, r], pi) => {
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.04, 14), poolMat);
    pool.position.set(x, B + 0.03, z);
    pool.receiveShadow = true;
    scene.add(pool);
    for (let i = 0; i < 3; i++) {
      const a = pi * 2.1 + (i / 3) * Math.PI * 2;
      const rr = 0.15 + ((pi + i) % 3) * 0.05;
      flatPart(GEO.dodec, rimMat, rr * 2, rr, rr * 2,
        x + Math.cos(a) * (r + 0.15), B + rr * 0.4, z + Math.sin(a) * (r + 0.15), a, scene);
    }
  });
  // Shells and pebbles, denser near the shore.
  const srng = mulberry32(BEACH_SHELL_SEED);
  for (let i = 0; i < BEACH_SHELL_COUNT; i++) {
    const x = -52 + 5.5 * srng() * srng() + 0.2;
    const z = -18 + srng() * 36;
    const r = 0.05 + srng() * 0.04;
    const mat = M(COL_SHELL[Math.floor(srng() * 3)]);
    const geo = srng() < 0.5 ? GEO.ico : GEO.cone6;
    flatPart(geo, mat, r * 2, r * 1.4, r * 2, x, B + r * 0.6, z, srng() * 3, scene);
  }
}

// Pond clearing (issue #8): a still blue disc with a stone rim, ringed by
// mushrooms (built below) and a bench log. Visual-only, no water physics.
function buildForestPond(scene) {
  const [px, pz, r] = FOREST_POND;
  const pool = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, 0.04, 20),
    new THREE.MeshStandardMaterial({
      color: COL_WATER, roughness: 0.5, metalness: 0, flatShading: true,
    })
  );
  pool.position.set(px, 0.03, pz);
  pool.receiveShadow = true;
  scene.add(pool);
  const rimMat = M(COL_ROCK);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const rr = 0.16 + (i % 3) * 0.05;
    flatPart(GEO.dodec, rimMat, rr * 2, rr, rr * 2,
      px + Math.cos(a) * (r + 0.2), rr * 0.4, pz + Math.sin(a) * (r + 0.2), a, scene);
  }
}

// Stream (issue #8): one narrow water strip west-east, visual-only, crossed
// by the winding path on a log bridge and by the shortcut on stepping stones.
// The deck and stones have matching walkable colliders in physics.js.
function buildForestStream(scene) {
  const [x0, x1, z0, z1] = FOREST_STREAM;
  const mat = new THREE.MeshStandardMaterial({
    color: COL_WATER, roughness: 0.55, metalness: 0, flatShading: true,
  });
  const strip = box(x1 - x0, 0.05, z1 - z0, mat, (x0 + x1) / 2, 0.04, (z0 + z1) / 2, false, false);
  scene.add(strip);
  // Log bridge: plank deck along the path with log rails and two posts.
  const [bx, bz, ry] = FOREST_BRIDGE;
  const g = new THREE.Group();
  g.position.set(bx, 0, bz);
  g.rotation.y = ry;
  part(GEO.box, M(COL_BRIDGE), 2.5, 0.22, 3.5, 0, 0.14, 0, 0, 0, 0, g);
  for (const sx of [-1.15, 1.15]) {
    part(GEO.cyl8, M(COL_TRUNK), 0.22, 3.5, 0.22, sx, 0.36, 0, Math.PI / 2, 0, 0, g);
    for (const sz of [-1.4, 1.4]) {
      part(GEO.cyl8, M(COL_WOOD_DARK), 0.14, 0.7, 0.14, sx, 0.35, sz, 0, 0, 0, g);
    }
  }
  scene.add(g);
  // Stepping stones: flat cylinders the cube rolls over.
  for (const [x, z] of FOREST_STONES) {
    part(GEO.cyl10, M(COL_STONE), 0.9, 0.2, 0.9, x, 0.1, z, 0, 0, 0, scene);
  }
}

// Forest floor (issue #8): ground patches, bushes, ferns, mushrooms, logs,
// stumps, mossy rocks, trunk moss, and the stone circle. Blocking pieces have
// matching colliders in physics.js; the rest is visual-only.
function buildForestUndergrowth(scene) {
  // Ground patches: moss, leaf litter, dirt.
  const tones = { moss: M(COL_MOSS), leaf: M(COL_LEAF_LITTER), dirt: M(COL_DIRT) };
  for (const [x, z, r, tone] of FOREST_PATCHES) {
    flatPart(GEO.cyl10, tones[tone], r * 2, 0.04, r * 2, x, 0.015, z, x * 1.3, scene);
  }
  // Big bushes (block) + small bushes (visual). Grove-ring bushes included.
  FOREST_BUSH_BIG.forEach(([x, z, r], i) => {
    part(GEO.ico, M(COL_BUSH[i % 3]), r * 2, r * 1.5, r * 2, x, r * 0.55, z, 0, i * 0.7, 0, scene);
  });
  FOREST_BUSH_SMALL.forEach(([x, z, r], i) => {
    part(GEO.ico, M(COL_BUSH[(i + 1) % 3]), r * 2, r * 1.5, r * 2, x, r * 0.55, z, 0, i, 0, scene);
  });
  // Ferns: fans of thin cones from a point.
  const fernMat = M(COL_FERN);
  for (const [x, z] of FOREST_FERNS) {
    for (let s = 0; s < 4; s++) {
      const tilt = -0.45 + s * 0.3;
      const f = flatPart(GEO.cone6, fernMat, 0.16, 0.7, 0.16, x, 0.3, z, s * 0.8, scene);
      f.rotation.z = tilt;
    }
  }
  // Mushroom clusters: 3 tiny stem+cap pairs, muted cream/tan caps.
  const stemMat = M(COL_MUSHROOM_STEM);
  const capMat = M(COL_MUSHROOM_CAP);
  FOREST_MUSHROOMS.forEach(([x, z], ci) => {
    for (let s = 0; s < 3; s++) {
      const ox = x + ((ci + s * 2) % 3 - 1) * 0.25;
      const oz = z + ((ci * 2 + s) % 3 - 1) * 0.25;
      const h = 0.16 + ((ci + s) % 3) * 0.05;
      part(GEO.cyl8, stemMat, 0.07, h, 0.07, ox, h / 2, oz, 0, 0, 0, scene).castShadow = false;
      part(GEO.sphere, capMat, 0.16, 0.1, 0.16, ox, h + 0.04, oz, 0, 0, 0, scene).castShadow = false;
    }
  });
  // Fallen logs: horizontal bark cylinders. Same segment math as physics.js.
  const logMat = M(COL_TRUNK);
  for (const [x, z, rotY, len, twoSeg, r] of FOREST_LOGS) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    if (!twoSeg) {
      part(GEO.cyl8, logMat, r * 2, len, r * 2, 0, r, 0, 0, 0, Math.PI / 2, g);
    } else {
      const segLen = len * 0.6;
      part(GEO.cyl8, logMat, r * 2, segLen, r * 2, -len * 0.2, r, 0, 0, 0, Math.PI / 2, g);
      const seg2 = part(GEO.cyl8, logMat, r * 2, segLen, r * 2, len * 0.2, r, len * 0.15, 0, 0.5, Math.PI / 2, g);
      void seg2;
    }
    scene.add(g);
  }
  // Stumps: short bark cylinders with flat pale tops.
  for (const [x, z] of FOREST_STUMPS) {
    part(GEO.cyl8, logMat, 0.5, 0.35, 0.5, x, 0.175, z, 0, 0, 0, scene);
    part(GEO.cyl8, M(COL_STUMP_TOP), 0.44, 0.06, 0.44, x, 0.37, z, 0, 0, 0, scene);
  }
  // Mossy rocks: grey dodecahedrons with green caps. Squash matches the
  // physics box cores (same 0.62 factor as beach rocks).
  for (const [x, z, size] of FOREST_MOSSY_ROCKS) {
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(size * 0.5, 0), M(COL_ROCK));
    m.scale.y = 0.62;
    m.position.set(x, size * 0.31, z);
    m.rotation.y = (x * 1.7 + z * 2.3) % Math.PI;
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
    flatPart(GEO.cyl8, M(COL_MOSS), size * 0.5, 0.06, size * 0.5, x, size * 0.62 + 0.02, z, x, scene);
  }
  // Moss on trunks: small green patches on a few old trunks.
  for (const ti of FOREST_TRUNK_MOSS) {
    const t = TREES[ti];
    if (!t) continue;
    const [tx, tz, trunkH] = t;
    const side = (ti % 4) * (Math.PI / 2) + 0.4;
    const nx = Math.cos(side);
    const nz = Math.sin(side);
    const patch = part(GEO.box, M(COL_MOSS), 0.06, 0.5, 0.4,
      tx + nx * (TRUNK_RADIUS + 0.02), Math.min(trunkH * 0.4, 1.4), tz + nz * (TRUNK_RADIUS + 0.02),
      0, -side, 0, scene);
    patch.castShadow = false;
  }
  // Stone circle: mossy ring around the giant tree (gap faces the pedestal).
  for (const [x, z, size] of FOREST_STONE_CIRCLE) {
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(size * 0.5, 0), M(COL_STONE));
    m.scale.y = 0.7;
    m.position.set(x, size * 0.35, z);
    m.rotation.y = (x * 2.1 + z * 1.3) % Math.PI;
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
    flatPart(GEO.cyl8, M(COL_MOSS), size * 0.45, 0.05, size * 0.45, x, size * 0.7 + 0.01, z, z, scene);
  }
}

// Fireflies (issue #8, garnish): one ambient points cloud drifting over the
// pond and grove clearings. Muted green-gold, animated in main.js.
function buildFireflies(scene) {
  const rng = mulberry32(1234);
  const pos = new Float32Array(FIREFLY_COUNT * 3);
  const base = [];
  for (let i = 0; i < FIREFLY_COUNT; i++) {
    // Half over the pond clearing, half over the grove.
    const cx = i % 2 === 0 ? FOREST_POND[0] : GIANT_TREE[0] + 2;
    const cz = i % 2 === 0 ? FOREST_POND[1] : GIANT_TREE[1] + 1;
    const x = cx + (rng() - 0.5) * 7;
    const y = 0.5 + rng() * 2.2;
    const z = cz + (rng() - 0.5) * 7;
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    base.push([x, y, z, rng() * Math.PI * 2]);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: COL_FIREFLY, size: 0.12, transparent: true, opacity: 0.8,
    sizeAttenuation: true, depthWrite: false,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);
  return { points, base };
}

function buildSky(scene) {
  // Gulls circling the shore (animated in main.js).
  const gulls = GULLS.map(([cx, h, cz, r, speed], i) => {
    const g = new THREE.Group();
    const mat = M(COL_GULL);
    part(GEO.box, mat, 0.12, 0.12, 0.35, 0, 0, 0, 0, 0, 0, g).castShadow = false;
    const wingL = new THREE.Group();
    wingL.position.set(-0.06, 0, 0);
    const wl = part(GEO.box, mat, 0.5, 0.03, 0.18, -0.28, 0, 0, 0, 0, 0, wingL);
    wl.castShadow = false;
    g.add(wingL);
    const wingR = new THREE.Group();
    wingR.position.set(0.06, 0, 0);
    const wr = part(GEO.box, mat, 0.5, 0.03, 0.18, 0.28, 0, 0, 0, 0, 0, wingR);
    wr.castShadow = false;
    g.add(wingR);
    scene.add(g);
    return { g, wingL, wingR, cx, h, cz, r, speed, phase: i * 2.1 };
  });
  // Clouds: flat white blobs drifting slowly (animated in main.js).
  const cloudMat = new THREE.MeshBasicMaterial({ color: COL_CLOUD, fog: false });
  const clouds = CLOUDS.map(([x, y, z, s]) => {
    const m = new THREE.Mesh(GEO.sphere, cloudMat);
    m.scale.set(s, s * 0.45, s * 0.7);
    m.position.set(x, y, z);
    scene.add(m);
    return { m };
  });
  return { gulls, clouds };
}

// Hero landmark tower (blend/tower_nw.glb, origin at base centre, metres).
// Loads async over the tagged primitive fallback: on arrival the primitives
// hide (their camera blockers keep raycasting while invisible) and the
// detailed model takes their place. A missing file keeps the primitives.
function swapHeroTower(scene) {
  let hero = null;
  scene.traverse((o) => {
    if (o.userData.heroTower) hero = o;
  });
  if (!hero) return;
  new GLTFLoader().load(
    './blend/tower_nw.glb',
    (gltf) => {
      const model = gltf.scene;
      model.position.copy(hero.position);
      model.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      hero.visible = false;
      scene.add(model);
    },
    undefined,
    () => {}
  );
}

export function buildLevel(scene) {
  slab(scene, ZONE_VILLAGE, COL_VILLAGE_GROUND);
  slab(scene, BEACH_SLAB, COL_BEACH_GROUND, BEACH_BASE_Y);
  slab(scene, ZONE_FOREST, COL_FOREST_GROUND);
  slab(scene, ZONE_PASS, COL_PASS_GROUND);
  slab(scene, ZONE_ARENA, COL_ARENA_GROUND);

  buildPlaza(scene);
  buildRoads(scene);
  buildForestPaths(scene);
  buildPatches(scene);
  buildEdgeStones(scene);
  buildScatter(scene);
  buildWater(scene);
  buildBanks(scene);
  // buildReeds retired by issue #14: reeds lined the natural channel banks,
  // which are now straight concrete walls (reeds would sit inside the walls).
  buildBridges(scene);
  buildWalls(scene);
  buildHills(scene);
  buildTrees(scene);
  buildGiantTree(scene);
  buildRocks(scene);
  buildHuts(scene);
  buildVillageMassing(scene);
  swapHeroTower(scene);
  buildProps(scene);
  buildSeaside(scene);
  buildArch(scene);
  buildShelves(scene);
  buildBeachRamps(scene);
  buildParapets(scene);
  buildCairns(scene);
  buildStones(scene);
  buildPedestals(scene);
  buildBeachDressing(scene);
  buildForestPond(scene);
  buildForestStream(scene);
  buildForestUndergrowth(scene);
  buildArenaDisc(scene);
  buildArenaRing(scene);
  const { crackMats } = buildArenaRim(scene);
  buildArenaGate(scene);
  buildArenaSpires(scene);
  buildApproachPiles(scene);
  const { lavaMats } = buildLava(scene);
  buildShafts(scene);
  buildFarSilhouettes(scene);
  const { gulls, clouds } = buildSky(scene);
  const { points: fireflies, base: fireflyBase } = buildFireflies(scene);
  const { embers, emberBase, smoke, smokeBase } = buildArenaParticles(scene);
  return { lavaMats, crackMats, gulls, clouds, fireflies, fireflyBase, embers, emberBase, smoke, smokeBase };
}

export function buildPlayerMesh() {
  // Cubebot: the Blender character (blend/cubebot.glb) replaces the old
  // placeholder cube. The file loads async; the group returns immediately so
  // physics, motes, and weapons can parent to it, and the model fills in on
  // arrival (userData.bodyMat/eyes land with it; readers must tolerate them
  // missing until then). Falls back to the legacy cube if loading fails.
  const g = new THREE.Group();
  new GLTFLoader().load(
    CUBEBOT_URL,
    (gltf) => wireCubebot(g, gltf.scene),
    undefined,
    () => {
      const legacy = buildLegacyPlayerMesh();
      g.add(legacy);
      g.userData.bodyMat = legacy.userData.bodyMat;
      g.userData.eyes = legacy.userData.eyes;
    }
  );
  // The group scale carries the release stretch pop (issue #4 keeps it as
  // the launch beat); there is no squash during charge.
  return g;
}

// Blender source of the character. Body spans exactly +-1 on every axis
// (measured), so x0.5 normalizes it onto the 1-unit physics cube. Face and
// eyes look down +Z; the three dark socket plates (side pair + mouth) take
// the weapons. Textures and materials come from the file.
const CUBEBOT_URL = './blend/cubebot.glb';
const CUBEBOT_SCALE = PLAYER_SIZE / 2;

function wireCubebot(g, model) {
  model.scale.setScalar(CUBEBOT_SCALE);
  const pivots = [];
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (m && m.name === 'Material.001') g.userData.bodyMat = m; // flash/glow target (§11)
      if (m && (m.name === 'eyes' || m.name === 'eyehighlight')) pivots.push(o);
    }
  });
  // Squint pivots (issue #4 layer 4): the eye prims merge both eyes into one
  // mesh each, so narrow each about its own centroid via a pivot group.
  // worldToLocal (load-time only): the group may sit anywhere when the file
  // resolves, but the pivot must be placed in the mesh parent's space.
  const eyes = [];
  for (const mesh of pivots) {
    const cWorld = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
    const c = mesh.parent.worldToLocal(cWorld.clone());
    const pivot = new THREE.Group();
    pivot.position.copy(c);
    mesh.parent.add(pivot);
    pivot.add(mesh);
    mesh.position.set(-c.x, -c.y, -c.z);
    eyes.push(pivot);
  }
  if (eyes.length > 0) g.userData.eyes = eyes; // squint targets
  g.add(model);
}

function buildLegacyPlayerMesh() {
  // Placeholder cube, kept as the load-failure fallback only.
  const g = new THREE.Group();
  const s = PLAYER_SIZE;
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(s, s, s),
    matte(COL_PLAYER, { roughness: 0.6 })
  );
  cube.castShadow = true;
  cube.receiveShadow = true;
  g.add(cube);
  g.userData.bodyMat = cube.material; // damage flash target (spec section 11)
  const eyeMat = matte(COL_EYE, { roughness: 0.8 });
  const eyes = [];
  for (const ex of [-0.2, 0.2]) {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.06), eyeMat);
    eye.position.set(ex, 0.1, s / 2 + 0.01);
    g.add(eye);
    eyes.push(eye);
  }
  g.userData.eyes = eyes; // squint targets (issue #4: eyes narrow with charge)
  // Cream trim band so the roll direction reads at a glance.
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(s + 0.02, 0.14, s + 0.02),
    matte(0xf2e6c8, { roughness: 0.7 })
  );
  trim.position.set(0, -0.28, 0);
  g.add(trim);
  return g;
}

// Weapon builders. Each returns { group, glintMats }.
// Dagger/sword lie along +X (blade toward +X); hammer stands along +Y.
const STEEL = 0xb9c1c7;
const GRIP = 0x4a3626;

function steelMat(glintMats, glint = true) {
  const m = new THREE.MeshStandardMaterial({
    color: STEEL,
    roughness: 0.4,
    metalness: 0.25,
    flatShading: true,
    emissive: 0xfff2c0,
    emissiveIntensity: glint ? 0.5 : 0,
  });
  if (glint) glintMats.push(m);
  return m;
}

function buildDaggerMesh(glintMats) {
  const g = new THREE.Group();
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 6), matte(GRIP));
  grip.rotation.z = Math.PI / 2;
  grip.position.x = -0.22;
  g.add(grip);
  g.add(box(0.06, 0.24, 0.1, matte(GRIP), -0.1, 0, 0, false, false));
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.11, 0.05), steelMat(glintMats));
  blade.position.x = 0.15;
  g.add(blade);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.12, 4), steelMat(glintMats));
  tip.rotation.z = -Math.PI / 2;
  tip.position.x = 0.42;
  g.add(tip);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  return g;
}

function buildSwordMesh(glintMats) {
  const g = new THREE.Group();
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.25, 6), matte(GRIP));
  grip.rotation.z = Math.PI / 2;
  grip.position.x = -0.38;
  g.add(grip);
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), matte(GRIP));
  pommel.position.x = -0.52;
  g.add(pommel);
  g.add(box(0.08, 0.34, 0.12, matte(GRIP), -0.22, 0, 0, false, false));
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.16, 0.07), steelMat(glintMats));
  blade.position.x = 0.2;
  g.add(blade);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 4), steelMat(glintMats));
  tip.rotation.z = -Math.PI / 2;
  tip.position.x = 0.68;
  g.add(tip);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  return g;
}

function buildHammerMesh(glintMats) {
  const g = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.8, 6), matte(GRIP));
  handle.position.y = -0.1;
  g.add(handle);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.28, 0.28), steelMat(glintMats));
  head.position.y = 0.35;
  g.add(head);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  return g;
}

export function buildWeaponMesh(id) {
  const glintMats = [];
  const builders = { dagger: buildDaggerMesh, sword: buildSwordMesh, hammer: buildHammerMesh };
  const group = builders[id](glintMats);
  return { group, glintMats };
}

// Floating pickup: weapon only. The plaza pedestal is permanent world geometry
// (buildPlaza) and stays after collection; only the weapon despawns.
export function buildPickup(id) {
  const { group: weapon, glintMats } = buildWeaponMesh(id);
  const g = new THREE.Group();
  g.add(weapon);
  return { group: g, glintMats };
}

const PIECE_MASS = { dagger: DAGGER_MASS, sword: SWORD_MASS, hammer: HAMMER_MASS };

// Permanently attach a weapon: visual at its anchor + matching collider + mass.
export function attachWeapon(THREE_NS, CANNON_NS, playerMesh, playerBody, id) {
  void THREE_NS;
  const { group } = buildWeaponMesh(id);
  const a = ANCHOR[id];
  group.position.set(a.pos[0], a.pos[1], a.pos[2]);
  group.rotation.set(a.rot[0], a.rot[1], a.rot[2]); // blades outward, hammer head-forward
  for (const m of group.children) {
    if (m.material && 'emissiveIntensity' in m.material) m.material.emissiveIntensity = 0.12;
  }
  const [hx, hy, hz] = a.half;
  const shape = new CANNON_NS.Box(new CANNON_NS.Vec3(hx, hy, hz));
  group.userData.weaponId = id;
  group.userData.shape = shape;
  playerMesh.add(group);
  playerBody.addShape(shape, new CANNON_NS.Vec3(a.collider[0], a.collider[1], a.collider[2]));
  playerBody.mass += PIECE_MASS[id];
  playerBody.updateMassProperties();
  playerBody.aabbNeedsUpdate = true;
  return playerBody.mass;
}

// Lose a piece to boss damage (spec section 10): destroyed, disappears.
// Removes the last-attached group of that id, its collider, and its mass.
export function detachWeapon(playerMesh, playerBody, id) {
  const kids = playerMesh.children;
  for (let i = kids.length - 1; i >= 0; i--) {
    if (kids[i].userData && kids[i].userData.weaponId === id) {
      const group = kids[i];
      playerMesh.remove(group);
      if (group.userData.shape) playerBody.removeShape(group.userData.shape);
      playerBody.mass -= PIECE_MASS[id];
      playerBody.updateMassProperties();
      playerBody.aabbNeedsUpdate = true;
      return playerBody.mass;
    }
  }
  return playerBody.mass;
}

// Boss ball: pale bone sphere with an angry face and a dark equator band so
// the roll reads. Lighter silhouette tracks against the dark rock (§4.4).
export function buildBossMesh() {
  const g = new THREE.Group();
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(BOSS_RADIUS, 18, 14),
    matte(COL_BOSS, { roughness: 0.75 })
  );
  ball.castShadow = true;
  ball.receiveShadow = true;
  g.add(ball);
  g.userData.bodyMat = ball.material; // damage flash target (spec section 11)
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(BOSS_RADIUS * 1.0, 0.07, 8, 24),
    matte(COL_BOSS_BAND, { roughness: 0.9 })
  );
  band.rotation.x = Math.PI / 2;
  band.castShadow = true;
  g.add(band);
  // Angry face on +Z: whites, pupils, slanted brows.
  const white = matte(0xf2e6c8, { roughness: 0.7 });
  const dark = matte(COL_BOSS_EYE, { roughness: 0.8 });
  const z = BOSS_RADIUS * 0.82;
  for (const ex of [-0.32, 0.32]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.1), white);
    w.position.set(ex, 0.12, z);
    g.add(w);
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.06), dark);
    p.position.set(ex, 0.08, z + 0.06);
    g.add(p);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.08), dark);
    brow.position.set(ex, 0.42, z + 0.02);
    brow.rotation.z = ex < 0 ? -0.45 : 0.45; // slant inward-down
    g.add(brow);
  }
  return g;
}

// Victory (spec section 10): the boss ball itself attaches to the player.
// Reparents the fought boss mesh onto the back anchor + matching collider.
export function attachBossBall(CANNON_NS, playerMesh, playerBody, bossMesh) {
  bossMesh.position.set(BOSS_ANCHOR.pos[0], BOSS_ANCHOR.pos[1], BOSS_ANCHOR.pos[2]);
  bossMesh.rotation.set(0, 0, 0);
  bossMesh.scale.set(1, 1, 1); // clear any wind-up squash
  playerMesh.add(bossMesh); // reparent: three.js removes it from the scene
  playerBody.addShape(
    new CANNON_NS.Sphere(BOSS_RADIUS),
    new CANNON_NS.Vec3(BOSS_ANCHOR.collider[0], BOSS_ANCHOR.collider[1], BOSS_ANCHOR.collider[2])
  );
  playerBody.mass += BOSS_MASS;
  playerBody.updateMassProperties();
  playerBody.aabbNeedsUpdate = true;
  return playerBody.mass;
}
