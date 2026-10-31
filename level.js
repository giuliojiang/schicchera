// Three.js environment: 5 zones, props, water/lava, player mesh, weapons.
// Primitives only, flat-shaded matte. Visuals match physics.js shapes.
import * as THREE from 'three';
import {
  ANCHOR,
  ARCH,
  ARENA_CENTER,
  BRIDGE_CREST_H,
  BRIDGE_SPAN,
  BRIDGE_THICK,
  BRIDGES,
  CHANNEL_Z0,
  CHANNEL_Z1,
  COL_ARCH,
  COL_ARENA_GROUND,
  COL_BEACH_GROUND,
  COL_BRIDGE,
  COL_CANOPY,
  COL_EYE,
  COL_FOREST_GROUND,
  COL_HILL_BEACH,
  COL_HILL_FOREST,
  COL_HUT_BODY,
  COL_HUT_ROOF,
  COL_LAVA,
  COL_PASS_GROUND,
  COL_PLAZA,
  COL_PLAYER,
  COL_ROAD,
  COL_ROCK,
  COL_TRUNK,
  COL_VILLAGE_GROUND,
  COL_WALL_DUNE,
  COL_WALL_FENCE,
  COL_WALL_ROCK,
  COL_WALL_TREELINE,
  COL_WATER,
  DAGGER_MASS,
  HAMMER_MASS,
  HEMI_GROUND,
  HEMI_INTENSITY,
  HEMI_SKY,
  HILLS,
  HUT_BODY,
  HUTS,
  PLAYER_SIZE,
  PLAYER_SPAWN,
  ROCKS,
  SHADOW_EXTENT,
  SHADOW_MAP_SIZE,
  SHORE_X,
  SUN_COLOR,
  SUN_INTENSITY,
  SUN_OFFSET,
  SWORD_MASS,
  TREES,
  TRUNK_RADIUS,
  WALLS,
  ZONE_ARENA,
  ZONE_BEACH,
  ZONE_FOREST,
  ZONE_PASS,
  ZONE_VILLAGE,
} from './constants.js';

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

function flatStrip(scene, cx, cz, sx, sz, y, color) {
  const m = box(sx, 0.05, sz, matte(color), cx, y, cz, false, true);
  scene.add(m);
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
  const bodyMats = COL_HUT_BODY.map((c) => matte(c));
  const roofMats = COL_HUT_ROOF.map((c) => matte(c));
  const doorMat = matte(0x2e2620);
  for (const [x, z, rotY, bodyTone, roofTone] of HUTS) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    const [bsx, bsy, bsz] = HUT_BODY;
    const body = box(bsx, bsy, bsz, bodyMats[bodyTone], 0, bsy / 2, 0);
    g.add(body);
    const roofR = Math.hypot(bsx / 2, bsz / 2) + 0.3;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(roofR, 1.8, 4), roofMats[roofTone]);
    roof.position.set(0, bsy + 0.9, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    roof.receiveShadow = true;
    g.add(roof);
    const door = box(1, 1.6, 0.12, doorMat, 0, 0.8, bsz / 2 + 0.02);
    g.add(door);
    scene.add(g);
  }
}

function buildBridges(scene) {
  const mat = matte(COL_BRIDGE);
  const postMat = matte(COL_TRUNK);
  const slopeLen = Math.hypot(BRIDGE_SPAN / 2, BRIDGE_CREST_H);
  const slopeAng = Math.atan2(BRIDGE_CREST_H, BRIDGE_SPAN / 2);
  const chanMid = (CHANNEL_Z0 + CHANNEL_Z1) / 2;
  for (const [bx, bw] of BRIDGES) {
    const y = BRIDGE_CREST_H / 2;
    const south = box(bw, BRIDGE_THICK, slopeLen, mat, bx, y, chanMid - BRIDGE_SPAN / 4);
    south.rotation.x = -slopeAng;
    scene.add(south);
    const north = box(bw, BRIDGE_THICK, slopeLen, mat, bx, y, chanMid + BRIDGE_SPAN / 4);
    north.rotation.x = slopeAng;
    scene.add(north);
    // Corner posts: tiny decor, no colliders (too small to matter).
    for (const px of [-bw / 2 + 0.1, bw / 2 - 0.1]) {
      for (const pz of [chanMid - BRIDGE_SPAN / 2 + 0.2, chanMid + BRIDGE_SPAN / 2 - 0.2]) {
        const post = box(0.12, 0.5, 0.12, postMat, bx + px, 0.25, pz, false, false);
        scene.add(post);
      }
    }
  }
}

function buildArch(scene) {
  const mat = matte(COL_ARCH);
  const ps = ARCH.pillarSize;
  scene.add(box(ps, ARCH.pillarH, ps, mat, ARCH.x, ARCH.pillarH / 2, -ARCH.pillarGap));
  scene.add(box(ps, ARCH.pillarH, ps, mat, ARCH.x, ARCH.pillarH / 2, ARCH.pillarGap));
  scene.add(
    box(ps, ARCH.lintelH, ARCH.pillarGap * 2 + ps, mat, ARCH.x, ARCH.pillarH + ARCH.lintelH / 2, 0)
  );
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

export function buildLevel(scene) {
  slab(scene, ZONE_VILLAGE, COL_VILLAGE_GROUND);
  slab(scene, ZONE_BEACH, COL_BEACH_GROUND);
  slab(scene, ZONE_FOREST, COL_FOREST_GROUND);
  slab(scene, ZONE_PASS, COL_PASS_GROUND);
  slab(scene, ZONE_ARENA, COL_ARENA_GROUND);

  // Plaza disc at the village center (flat decor, ground slab carries physics).
  const plaza = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 0.06, 24), matte(COL_PLAZA));
  plaza.position.set(0, 0.03, 0);
  plaza.receiveShadow = true;
  scene.add(plaza);

  // Roads: wayfinding strips from the plaza to the three exits.
  flatStrip(scene, -26, 0, 52, 3, 0.02, COL_ROAD); // plaza -> shore
  flatStrip(scene, 0, -29, 3, 58, 0.02, COL_ROAD); // plaza -> forest
  flatStrip(scene, 10, 0, 20, 3, 0.02, COL_ROAD); // plaza -> pass
  flatStrip(scene, 32, 0, 24, 3, 0.02, COL_ARCH); // through the pass

  buildWater(scene);
  buildBridges(scene);
  buildWalls(scene);
  buildHills(scene);
  buildTrees(scene);
  buildRocks(scene);
  buildHuts(scene);
  buildArch(scene);
  const { lavaMats } = buildLava(scene);
  buildShafts(scene);
  buildFarSilhouettes(scene);
  return { lavaMats };
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

// Floating pickup: weapon + stone pedestal. Group origin = weapon center.
export function buildPickup(id, baseY) {
  const { group: weapon, glintMats } = buildWeaponMesh(id);
  const g = new THREE.Group();
  g.add(weapon);
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.62, 0.1, 10),
    matte(COL_ARCH, { roughness: 0.85 })
  );
  pedestal.position.y = -baseY + 0.05;
  pedestal.receiveShadow = true;
  g.add(pedestal);
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
