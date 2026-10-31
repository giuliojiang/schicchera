// Three.js environment: 5 zones, props, water/lava, player mesh, weapons.
// Primitives only, flat-shaded matte. Visuals match physics.js shapes.
import * as THREE from 'three';
import {
  ANCHOR,
  ARCH,
  ARENA_CENTER,
  BARRELS,
  BENCHES,
  BOAT,
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
  COL_ARENA_GROUND,
  COL_BEACH_GROUND,
  COL_BRIDGE,
  COL_BUSH,
  COL_CANOPY,
  COL_CLOTH,
  COL_CLOUD,
  COL_DIRT,
  COL_DOOR,
  COL_EYE,
  COL_FLOWER,
  COL_FOREST_GROUND,
  COL_GLASS,
  COL_GULL,
  COL_HILL_BEACH,
  COL_HILL_FOREST,
  COL_HUT_BODY,
  COL_HUT_ROOF,
  COL_LAVA,
  COL_NET,
  COL_PASS_GROUND,
  COL_PATCH_GRASS,
  COL_PATCH_SAND,
  COL_PLAZA,
  COL_PLAZA_RING,
  COL_PLAYER,
  COL_ROAD,
  COL_ROAD_WEAR,
  COL_ROCK,
  COL_SHORE,
  COL_STONE,
  COL_THATCH,
  COL_TRUNK,
  COL_VILLAGE_GROUND,
  COL_WALL_DUNE,
  COL_WALL_FENCE,
  COL_WALL_ROCK,
  COL_WALL_TREELINE,
  COL_WATER,
  COL_WOOD_DARK,
  CRATES,
  DAGGER_MASS,
  FENCES,
  GATES,
  GULLS,
  HAMMER_MASS,
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
  PLAYER_SIZE,
  PLAYER_SPAWN,
  POTS,
  ROCKS,
  ROPE,
  SCATTER_COUNT,
  SCATTER_SEED,
  SHADOW_EXTENT,
  SHADOW_MAP_SIZE,
  SHORE_X,
  SIGNS,
  SPURS,
  STALL,
  SUN_COLOR,
  SUN_INTENSITY,
  SUN_OFFSET,
  SWORD_MASS,
  TREES,
  TRUNK_RADIUS,
  WALLS,
  WELL,
  ZONE_ARENA,
  ZONE_BEACH,
  ZONE_FOREST,
  ZONE_PASS,
  ZONE_VILLAGE,
} from './constants.js';
import { mulberry32 } from './game.js';

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
  sun.shadow.camera.far = 80;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  scene.add(sun.target);
  return { sun };
}

function slab(scene, zone, color) {
  const sx = zone.x1 - zone.x0;
  const sz = zone.z1 - zone.z0;
  const m = box(
    sx,
    1,
    sz,
    matte(color),
    (zone.x0 + zone.x1) / 2,
    -0.5,
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
  // PERMANENT pedestal: stays after the dagger is collected.
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 0.35, 10), M(COL_STONE));
  ped.position.set(0, 0.175, 0);
  ped.castShadow = true;
  ped.receiveShadow = true;
  scene.add(ped);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 10), M(COL_ARCH));
  cap.position.set(0, 0.39, 0);
  cap.castShadow = true;
  scene.add(cap);
  // Planting ring just outside the paving (skips the road crossings).
  for (const deg of [30, 60, 120, 150, 210, 240, 300, 330]) {
    const a = (deg / 180) * Math.PI;
    const bx = Math.cos(a) * 7.2;
    const bz = Math.sin(a) * 7.2;
    part(GEO.ico, M(COL_BUSH[(deg / 30) % 3]), 0.35, 0.28, 0.35, bx, 0.22, bz, 0, 0, 0, scene);
    part(GEO.ico, M(COL_FLOWER[(deg / 30) % 3]), 0.08, 0.08, 0.08,
      bx + 0.4, 0.1, bz + 0.2, 0, 0, 0, scene);
  }
}

function buildRoads(scene) {
  // Varied widths per road; the longest gets a darker center wear strip.
  flatStrip(scene, -26, 0, 52, 3.2, 0.02, COL_ROAD); // plaza -> shore
  flatStrip(scene, 0, -29, 2.8, 58, 0.02, COL_ROAD); // plaza -> forest
  flatStrip(scene, 10, 0, 20, 3.0, 0.02, COL_ROAD); // plaza -> pass
  flatStrip(scene, 32, 0, 24, 2.6, 0.02, COL_ARCH); // through the pass
  flatStrip(scene, 0, -29, 1.2, 58, 0.05, COL_ROAD_WEAR); // worn middle
  for (const [cx, cz, sx, sz, rotY] of SPURS) {
    flatStrip(scene, cx, cz, sx, sz, 0.025, COL_ROAD_WEAR, rotY);
  }
  // Wet-sand shore strip where the slab meets the sea.
  flatStrip(scene, -58, 2, 4, 16, 0.02, COL_SHORE);
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
  edging(-50, 0, -2, 0, 2.0); // shore road (half-width 1.6)
  edging(0, -56, 0, -2, 1.8); // forest road (half-width 1.4)
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
      // Flower cluster: 3 muted dots.
      for (let i = 0; i < 3; i++) {
        part(GEO.ico, M(COL_FLOWER[Math.floor(rng() * 3)]), 0.08, 0.08, 0.08,
          x + (rng() - 0.5) * 0.5, 0.1, z + (rng() - 0.5) * 0.5, 0, 0, 0, scene);
      }
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
  // Raised earth along both channel edges: a dug waterway, not a painted line.
  const m = box(40, 0.12, 0.7, M(COL_DIRT), 0, 0.06, CHANNEL_Z0 - 0.35, false, true);
  scene.add(m);
  const m2 = box(40, 0.12, 0.7, M(COL_DIRT), 0, 0.06, CHANNEL_Z1 + 0.35, false, true);
  scene.add(m2);
}

function buildWalls(scene) {
  const mats = {
    fence: matte(COL_WALL_FENCE),
    dune: matte(COL_WALL_DUNE),
    treeline: matte(COL_WALL_TREELINE),
    rock: matte(COL_WALL_ROCK),
  };
  for (const [x, y, z, sx, sy, sz, style] of WALLS) {
    if (style === 'none') continue; // invisible shoreline wall
    scene.add(box(sx, sy, sz, mats[style], x, y, z));
  }
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

function buildRocks(scene) {
  const mat = matte(COL_ROCK);
  for (const [x, z, size] of ROCKS) {
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(size * 0.5, 0), mat);
    m.scale.y = 0.62; // squash matches the physics box core
    m.position.set(x, size * 0.31, z);
    m.rotation.y = (x * 1.7 + z * 2.3) % Math.PI;
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
  }
}

function buildHuts(scene) {
  const bodyMats = COL_HUT_BODY.map((c) => M(c));
  const roofMats = [...COL_HUT_ROOF.map((c) => M(c)), M(COL_THATCH)];
  const frameMat = M(COL_WOOD_DARK);
  const doorMat = M(COL_DOOR);
  const glassMat = M(COL_GLASS, 0.6);
  const stoneMat = M(COL_STONE);
  const strawMat = M(COL_HUT_ROOF[0]);
  HUTS.forEach(([x, z, rotY, bodyTone, roofTone, bodyH, roofKind], hi) => {
    const feats = HUT_FEATURES[hi];
    const has = (f) => feats.includes(f);
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    const bsx = HUT_BODY[0];
    const bsy = bodyH || HUT_BODY[1];
    const bsz = HUT_BODY[2];
    const small = bsy < 2.2;
    part(GEO.box, bodyMats[bodyTone], bsx, bsy, bsz, 0, bsy / 2, 0, 0, 0, 0, g);

    // Roof: pyramid or pitched gable.
    if (roofKind === 1) {
      const roof = part(GABLE_GEO, roofMats[roofTone], 1, 0.45, 1, 0, bsy + 0.585, 0, 0, 0, 0, g);
      roof.castShadow = true;
      part(GEO.box, frameMat, 5.2, 0.12, 0.4, 0, bsy + 1.75, 0, 0, 0, 0, g); // ridge cap
    } else {
      const roofR = Math.hypot(bsx / 2, bsz / 2) + 0.3;
      const roofH = small ? 1.4 : 1.8;
      part(GEO.cone4, roofMats[roofTone], roofR, roofH, roofR, 0, bsy + roofH / 2, 0, 0, Math.PI / 4, 0, g);
    }

    // Door upgrade on every hut: frame + wood panel + step stone.
    const fz = bsz / 2;
    part(GEO.box, frameMat, 0.12, 1.7, 0.1, -0.56, 0.85, fz + 0.02, 0, 0, 0, g);
    part(GEO.box, frameMat, 0.12, 1.7, 0.1, 0.56, 0.85, fz + 0.02, 0, 0, 0, g);
    part(GEO.box, frameMat, 1.24, 0.12, 0.1, 0, 1.73, fz + 0.02, 0, 0, 0, g);
    part(GEO.box, doorMat, 1.0, 1.6, 0.08, 0, 0.8, fz + 0.02, 0, 0, 0, g);
    part(GEO.box, stoneMat, 1.2, 0.12, 0.5, 0, 0.06, fz + 0.3, 0, 0, 0, g);

    // Windows with frames + shutters on the door face.
    const winY = small ? 1.25 : 1.55;
    if (has('windows') || has('flowerbox')) {
      for (const wx of [-1.15, 1.15]) {
        part(GEO.box, frameMat, 0.9, 0.9, 0.08, wx, winY, fz + 0.02, 0, 0, 0, g);
        part(GEO.box, glassMat, 0.66, 0.66, 0.1, wx, winY, fz + 0.03, 0, 0, 0, g);
        part(GEO.box, doorMat, 0.22, 0.9, 0.06, wx - 0.56, winY, fz + 0.02, 0, 0, 0, g);
        part(GEO.box, doorMat, 0.22, 0.9, 0.06, wx + 0.56, winY, fz + 0.02, 0, 0, 0, g);
      }
    }
    // Flower box under the right window.
    if (has('flowerbox')) {
      part(GEO.box, frameMat, 0.9, 0.22, 0.28, 1.15, winY - 0.62, fz + 0.12, 0, 0, 0, g);
      for (let i = 0; i < 4; i++) {
        part(GEO.ico, M(COL_FLOWER[i % 3]), 0.07, 0.07, 0.07,
          0.85 + i * 0.2, winY - 0.46, fz + 0.12, 0, 0, 0, g);
      }
    }
    // Timber framing on front + back faces.
    if (has('timber')) {
      for (const sz of [fz + 0.01, -fz - 0.01]) {
        for (const vx of [-1.9, 0, 1.9]) {
          part(GEO.box, frameMat, 0.14, bsy - 0.2, 0.06, vx, bsy / 2, sz, 0, 0, 0, g);
        }
        part(GEO.box, frameMat, 3.9, 0.14, 0.06, 0, bsy - 0.5, sz, 0, 0, 0, g);
      }
    }
    // Chimney sunk into the roof slope, alternating stone/brick.
    if (has('chimney')) {
      const cm = hi % 2 === 0 ? stoneMat : M(COL_BRIDGE);
      if (roofKind === 1) {
        part(GEO.box, cm, 0.5, 1.2, 0.5, 1.2, bsy + 1.43, 0.8, 0, 0, 0, g);
      } else {
        part(GEO.box, cm, 0.5, 1.2, 0.5, 1.0, bsy + 1.22, 0, 0, 0, 0, g);
      }
    }
    // Porch: slab roof on two posts over the door.
    if (has('porch')) {
      const py = small ? 1.7 : 2.0;
      part(GEO.box, strawMat, 1.8, 0.1, 1.0, 0, py, fz + 0.5, 0, 0, 0, g);
      part(GEO.box, frameMat, 0.1, py, 0.1, -0.8, py / 2, fz + 0.9, 0, 0, 0, g);
      part(GEO.box, frameMat, 0.1, py, 0.1, 0.8, py / 2, fz + 0.9, 0, 0, 0, g);
    }
    // Stone wall base grounding the hut.
    if (has('wallbase')) {
      part(GEO.box, stoneMat, bsx + 0.15, 0.35, bsz + 0.15, 0, 0.175, 0, 0, 0, 0, g);
    }
    scene.add(g);
    // Fenced garden bed beside the hut (fence run itself is in FENCES).
    if (has('garden')) {
      part(GEO.ico, M(COL_BUSH[0]), 0.5, 0.38, 0.5, -9.5, 0.3, -11.3, 0, 0, 0, scene);
      const dots = [[-9.2, -10.6], [-9.8, -10.8], [-9.4, -12.1], [-9.0, -11.6], [-9.9, -12.3]];
      dots.forEach(([dx, dz], i) => {
        part(GEO.ico, M(COL_FLOWER[i % 3]), 0.08, 0.08, 0.08, dx, 0.12, dz, 0, 0, 0, scene);
      });
    }
  });
}

function buildBridges(scene) {
  const mat = matte(COL_BRIDGE);
  const postMat = matte(COL_TRUNK);
  const slopeLen = Math.hypot(BRIDGE_SPAN / 2, BRIDGE_CREST_H);
  const slopeAng = Math.atan2(BRIDGE_CREST_H, BRIDGE_SPAN / 2);
  const chanMid = (CHANNEL_Z0 + CHANNEL_Z1) / 2;
  const railMat = M(COL_WOOD_DARK);
  // Deck top line: outer ends low, crest high.
  const deckY = (z) => 0.15 + BRIDGE_CREST_H * (1 - Math.abs(z - chanMid) / (BRIDGE_SPAN / 2));
  for (const [bx, bw] of BRIDGES) {
    const y = BRIDGE_CREST_H / 2;
    const south = box(bw, BRIDGE_THICK, slopeLen, mat, bx, y, chanMid - BRIDGE_SPAN / 4);
    south.rotation.x = -slopeAng;
    scene.add(south);
    const north = box(bw, BRIDGE_THICK, slopeLen, mat, bx, y, chanMid + BRIDGE_SPAN / 4);
    north.rotation.x = slopeAng;
    scene.add(north);
    // Railings both sides: posts following the slope + sloped top rails.
    // Visual-only: the deck collider is what matters, rails never narrow it.
    for (const sx of [-bw / 2 + 0.15, bw / 2 - 0.15]) {
      for (const dz of [-1.7, -1.0, -0.3, 0.3, 1.0, 1.7]) {
        const z = chanMid + dz;
        const p = box(0.09, 0.6, 0.09, postMat, bx + sx, deckY(z) + 0.25, z, false, false);
        scene.add(p);
      }
      const railS = box(0.08, 0.08, slopeLen + 0.2, railMat, bx + sx, deckY(chanMid - 1) + 0.55, chanMid - BRIDGE_SPAN / 4, false, false);
      railS.rotation.x = -slopeAng;
      scene.add(railS);
      const railN = box(0.08, 0.08, slopeLen + 0.2, railMat, bx + sx, deckY(chanMid + 1) + 0.55, chanMid + BRIDGE_SPAN / 4, false, false);
      railN.rotation.x = slopeAng;
      scene.add(railN);
    }
    // Plank lines across each slope (visual).
    for (const sc of [chanMid - BRIDGE_SPAN / 4, chanMid + BRIDGE_SPAN / 4]) {
      for (const off of [-0.6, 0, 0.6]) {
        const z = sc + off;
        const ang = sc < chanMid ? -slopeAng : slopeAng;
        const p = box(bw - 0.3, 0.02, 0.14, railMat, bx, deckY(z) + 0.01, z, false, false);
        p.rotation.x = ang;
        scene.add(p);
      }
    }
  }
}

function buildArch(scene) {
  const mat = matte(COL_ARCH);
  const darkMat = matte(0x6e6b64); // one pillar slightly darker stone
  const ps = ARCH.pillarSize;
  scene.add(box(ps, ARCH.pillarH, ps, darkMat, ARCH.x, ARCH.pillarH / 2, -ARCH.pillarGap));
  scene.add(box(ps, ARCH.pillarH, ps, mat, ARCH.x, ARCH.pillarH / 2, ARCH.pillarGap));
  scene.add(
    box(ps, ARCH.lintelH, ARCH.pillarGap * 2 + ps, mat, ARCH.x, ARCH.pillarH + ARCH.lintelH / 2, 0)
  );
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
  // Open sea beyond the shoreline.
  const sea = box(SHORE_X - -85, 0.1, 64, mat, (SHORE_X + -85) / 2, -0.65, 0, false, false);
  scene.add(sea);
}

function buildLava(scene) {
  const lavaMats = [];
  function lavaMesh(geo, x, y, z) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x3a0a06,
      emissive: COL_LAVA,
      emissiveIntensity: 2,
      roughness: 1,
      metalness: 0,
      flatShading: true,
    });
    lavaMats.push(mat);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    scene.add(m);
  }
  // Edge strips along the arena's north/south walls (off the fighting floor).
  const strip = new THREE.BoxGeometry(24, 0.08, 2.5);
  lavaMesh(strip, ARENA_CENTER[0], 0.06, -11.75);
  lavaMesh(strip.clone(), ARENA_CENTER[0], 0.06, 11.75);
  // Corner pools at the arena's east edge.
  const pool = new THREE.CylinderGeometry(2, 2, 0.08, 12);
  lavaMesh(pool, 70, 0.06, -12);
  lavaMesh(pool.clone(), 70, 0.06, 12);
  // Thin seams along the pass walls.
  const seam = new THREE.BoxGeometry(20, 0.06, 0.8);
  lavaMesh(seam, 32, 0.05, -5.2);
  lavaMesh(seam.clone(), 32, 0.05, 5.2);
  return { lavaMats };
}

function buildShafts(scene) {
  function shaft(x, z, color, opacity) {
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    });
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.8, 9, 8, 1, true), mat);
    m.position.set(x, 4, z);
    m.rotation.z = 0.15;
    scene.add(m);
  }
  // Dappled forest canopy light + ominous arena glow.
  shaft(5, -35, 0xd8e8c0, 0.1);
  shaft(-6, -45, 0xd8e8c0, 0.1);
  shaft(10, -50, 0xd8e8c0, 0.09);
  shaft(52, -6, 0xff6a4a, 0.05);
  shaft(56, 6, 0xff6a4a, 0.05);
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
  for (const [x, z, ry, s, dy] of CRATES) {
    part(GEO.box, wood, s, s, s, x, s / 2 + dy, z, 0, ry, 0, scene);
  }
  // Barrels with two band rings.
  for (const [x, z] of BARRELS) {
    part(GEO.cyl10, wood, 0.7, 0.9, 0.7, x, 0.45, z, 0, 0, 0, scene);
    part(GEO.cyl10, darkWood, 0.72, 0.07, 0.72, x, 0.25, z, 0, 0, 0, scene);
    part(GEO.cyl10, darkWood, 0.72, 0.07, 0.72, x, 0.65, z, 0, 0, 0, scene);
  }
  // Fence runs: posts + two rails; the shore run gets a draped net.
  FENCES.forEach(([x1, z1, x2, z2], fi) => {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const ry = Math.atan2(x2 - x1, z2 - z1);
    const n = Math.max(2, Math.round(len / 1.3) + 1);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      part(GEO.box, darkWood, 0.12, 1.0, 0.12, x1 + (x2 - x1) * t, 0.5, z1 + (z2 - z1) * t, 0, 0, 0, scene);
    }
    const cx = (x1 + x2) / 2;
    const cz = (z1 + z2) / 2;
    part(GEO.box, wood, 0.08, 0.08, len, cx, 0.55, cz, 0, ry, 0, scene);
    part(GEO.box, wood, 0.08, 0.08, len, cx, 0.88, cz, 0, ry, 0, scene);
    if (fi === 2) {
      // Draped fishing net on the shore run (plane width aligned with the run).
      const net = new THREE.Mesh(GEO.plane, new THREE.MeshStandardMaterial({
        color: COL_NET, roughness: 1, metalness: 0, side: THREE.DoubleSide,
      }));
      net.scale.set(len * 0.7, 0.7, 1);
      net.position.set(cx + ((z2 - z1) / len) * 0.12, 0.55, cz - ((x2 - x1) / len) * 0.12);
      net.rotation.y = ry - Math.PI / 2;
      scene.add(net);
    }
  });
  // Benches: legs + seat + back.
  for (const [x, z, ry] of BENCHES) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    part(GEO.box, darkWood, 0.12, 0.45, 0.4, -0.6, 0.225, 0, 0, 0, 0, g);
    part(GEO.box, darkWood, 0.12, 0.45, 0.4, 0.6, 0.225, 0, 0, 0, 0, g);
    part(GEO.box, wood, 1.6, 0.1, 0.45, 0, 0.5, 0, 0, 0, 0, g);
    part(GEO.box, wood, 1.6, 0.4, 0.08, 0, 0.75, -0.2, 0, 0, 0, g);
    scene.add(g);
  }
  // Lantern posts (unlit daytime props).
  for (const [x, z] of LANTERNS) {
    part(GEO.cyl8, darkWood, 0.14, 2.6, 0.14, x, 1.3, z, 0, 0, 0, scene);
    part(GEO.box, darkWood, 0.3, 0.08, 0.3, x, 2.42, z, 0, 0, 0, scene);
    part(GEO.box, M(0xf2e6c8, 0.7), 0.22, 0.3, 0.22, x, 2.6, z, 0, 0, 0, scene);
    part(GEO.box, darkWood, 0.3, 0.08, 0.3, x, 2.78, z, 0, 0, 0, scene);
    part(GEO.cone4, darkWood, 0.4, 0.25, 0.4, x, 2.94, z, 0, Math.PI / 4, 0, scene);
  }
  // Laundry line: posts + line + muted cloth rectangles (never text).
  {
    const [x1, z1, x2, z2] = LAUNDRY;
    const len = Math.hypot(x2 - x1, z2 - z1);
    part(GEO.cyl8, darkWood, 0.18, 2.2, 0.18, x1, 1.1, z1, 0, 0, 0, scene);
    part(GEO.cyl8, darkWood, 0.18, 2.2, 0.18, x2, 1.1, z2, 0, 0, 0, scene);
    const line = part(GEO.cyl8, M(COL_ROCK), 0.04, len, 0.04, (x1 + x2) / 2, 2.0, (z1 + z2) / 2, 0, 0, Math.PI / 2, scene);
    line.castShadow = false;
    for (let i = 0; i < 4; i++) {
      const t = 0.15 + (i / 3) * 0.7;
      const c = part(GEO.box, M(COL_CLOTH[i % 3]), 0.45, 0.6, 0.03,
        x1 + (x2 - x1) * t, 1.65, z1 + (z2 - z1) * t, 0, 0, 0, scene);
      c.castShadow = false;
    }
  }
  // Flower pots by doors.
  for (const [x, z] of POTS) {
    part(GEO.cyl8, M(COL_DOOR), 0.32, 0.25, 0.32, x, 0.125, z, 0, 0, 0, scene);
    for (let i = 0; i < 3; i++) {
      part(GEO.ico, M(COL_FLOWER[i % 3]), 0.07, 0.07, 0.07,
        x - 0.08 + i * 0.08, 0.32, z + (i % 2) * 0.08, 0, 0, 0, scene);
    }
  }
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
  // Pier: plank deck on the dune gap + railed walkway toward the sea.
  const [x0, x1, z, w, topY] = PIER;
  const len = Math.abs(x1 - x0);
  const cx = (x0 + x1) / 2;
  for (let i = 0; i < 5; i++) {
    const px = x0 - 0.5 - i * 1.0;
    part(GEO.box, wood, 0.95, 0.08, w, px, topY - 0.04, z, 0, 0, 0, scene);
  }
  for (const sz of [-w / 2 + 0.08, w / 2 - 0.08]) {
    for (let i = 0; i < 5; i++) {
      const px = x0 - 0.3 - i * 1.1;
      part(GEO.box, darkWood, 0.09, 1.0, 0.09, px, 0.5, z + sz, 0, 0, 0, scene);
    }
    part(GEO.box, darkWood, len + 0.2, 0.08, 0.1, cx, 1.0, z + sz, 0, 0, 0, scene);
  }
  part(GEO.box, darkWood, 0.1, 0.08, w, Math.min(x0, x1), 1.0, z, 0, 0, 0, scene);
  // Beached boat: hull + angled bow/stern + mast + furled sail.
  const g = new THREE.Group();
  g.position.set(BOAT[0], 0, BOAT[1]);
  g.rotation.y = BOAT[2];
  part(GEO.box, wood, 2.2, 0.5, 1.0, 0, 0.35, 0, 0, 0, 0, g);
  part(GEO.box, wood, 0.5, 0.35, 0.7, 1.15, 0.45, 0, 0, 0, -0.5, g);
  part(GEO.box, wood, 0.5, 0.35, 0.7, -1.15, 0.45, 0, 0, 0, 0.5, g);
  part(GEO.cyl8, darkWood, 0.12, 2.2, 0.12, 0, 1.4, 0, 0, 0, 0, g);
  part(GEO.box, M(COL_CLOTH[0]), 0.9, 0.4, 0.08, 0, 1.5, 0, 0, 0, 0, g);
  scene.add(g);
  // Coiled rope by the pier.
  const rope = part(GEO.torus, wood, 1, 1, 1, ROPE[0], 0.09, ROPE[1], -Math.PI / 2, 0, 0, scene);
  rope.castShadow = false;
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

export function buildLevel(scene) {
  slab(scene, ZONE_VILLAGE, COL_VILLAGE_GROUND);
  slab(scene, ZONE_BEACH, COL_BEACH_GROUND);
  slab(scene, ZONE_FOREST, COL_FOREST_GROUND);
  slab(scene, ZONE_PASS, COL_PASS_GROUND);
  slab(scene, ZONE_ARENA, COL_ARENA_GROUND);

  buildPlaza(scene);
  buildRoads(scene);
  buildPatches(scene);
  buildEdgeStones(scene);
  buildScatter(scene);
  buildWater(scene);
  buildBanks(scene);
  buildReeds(scene);
  buildBridges(scene);
  buildWalls(scene);
  buildHills(scene);
  buildTrees(scene);
  buildRocks(scene);
  buildHuts(scene);
  buildProps(scene);
  buildSeaside(scene);
  buildArch(scene);
  const { lavaMats } = buildLava(scene);
  buildShafts(scene);
  buildFarSilhouettes(scene);
  const { gulls, clouds } = buildSky(scene);
  return { lavaMats, gulls, clouds };
}

export function buildPlayerMesh() {
  // Cube character with a simple face: reads as a character, not a crate.
  const g = new THREE.Group();
  const s = PLAYER_SIZE;
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(s, s, s),
    matte(COL_PLAYER, { roughness: 0.6 })
  );
  cube.castShadow = true;
  cube.receiveShadow = true;
  g.add(cube);
  const eyeMat = matte(COL_EYE, { roughness: 0.8 });
  for (const ex of [-0.2, 0.2]) {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.06), eyeMat);
    eye.position.set(ex, 0.1, s / 2 + 0.01);
    g.add(eye);
  }
  // Cream trim band so the roll direction reads at a glance.
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(s + 0.02, 0.14, s + 0.02),
    matte(0xf2e6c8, { roughness: 0.7 })
  );
  trim.position.set(0, -0.28, 0);
  g.add(trim);
  // Proxy scale like a Mesh so squash-and-stretch keeps working on the group.
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
  if (id === 'sword') group.rotation.y = Math.PI; // blade points outward
  for (const m of group.children) {
    if (m.material && 'emissiveIntensity' in m.material) m.material.emissiveIntensity = 0.12;
  }
  playerMesh.add(group);
  const [hx, hy, hz] = a.half;
  playerBody.addShape(
    new CANNON_NS.Box(new CANNON_NS.Vec3(hx, hy, hz)),
    new CANNON_NS.Vec3(a.collider[0], a.collider[1], a.collider[2])
  );
  playerBody.mass += PIECE_MASS[id];
  playerBody.updateMassProperties();
  playerBody.aabbNeedsUpdate = true;
  return playerBody.mass;
}
