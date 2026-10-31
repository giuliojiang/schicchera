// Three.js static environment + player mesh. Visuals match physics shapes.
import * as THREE from 'three';
import {
  GROUND_SIZE,
  PLAYER_SIZE,
  WALL_HEIGHT,
  WALL_THICKNESS,
} from './constants.js';

function groundTexture() {
  const s = 512;
  const c = document.createElement('canvas');
  c.width = s;
  c.height = s;
  const g = c.getContext('2d');
  g.fillStyle = '#2a3340';
  g.fillRect(0, 0, s, s);
  // Subtle checker for motion readability, drawn in code.
  g.fillStyle = '#313c4c';
  const n = 8;
  const cell = s / n;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if ((x + y) % 2 === 0) g.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  g.strokeStyle = 'rgba(255,255,255,0.10)';
  g.lineWidth = 2;
  for (let i = 0; i <= n; i++) {
    g.beginPath();
    g.moveTo(i * cell, 0);
    g.lineTo(i * cell, s);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i * cell);
    g.lineTo(s, i * cell);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function buildLights(scene) {
  const hemi = new THREE.HemisphereLight(0xbdd3ff, 0x2a2418, 0.75);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff2dd, 1.6);
  key.position.set(10, 16, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -26;
  key.shadow.camera.right = 26;
  key.shadow.camera.top = 26;
  key.shadow.camera.bottom = -26;
  key.shadow.camera.far = 50;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x88aaff, 0.35);
  fill.position.set(-8, 6, -10);
  scene.add(fill);
}

export function buildLevel(scene) {
  const half = GROUND_SIZE / 2;

  const groundMat = new THREE.MeshStandardMaterial({
    map: groundTexture(),
    roughness: 0.9,
    metalness: 0,
  });
  const ground = new THREE.Mesh(new THREE.BoxGeometry(GROUND_SIZE, 1, GROUND_SIZE), groundMat);
  ground.position.set(0, -0.5, 0);
  ground.receiveShadow = true;
  scene.add(ground);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x6b7b8f, roughness: 0.8, metalness: 0 });
  const wt = WALL_THICKNESS;
  const wh = WALL_HEIGHT;
  const walls = [
    [0, wh / 2, -half, GROUND_SIZE + wt * 2, wh, wt],
    [0, wh / 2, half, GROUND_SIZE + wt * 2, wh, wt],
    [-half, wh / 2, 0, wt, wh, GROUND_SIZE],
    [half, wh / 2, 0, wt, wh, GROUND_SIZE],
  ];
  for (const [x, y, z, sx, sy, sz] of walls) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), wallMat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
  }

  // Ramps mirror physics.js transforms exactly.
  const rampMat = new THREE.MeshStandardMaterial({ color: 0x8f9bb0, roughness: 0.75, metalness: 0 });
  const rampGeo = new THREE.BoxGeometry(8, 0.6, 4);
  const rampA = new THREE.Mesh(rampGeo, rampMat);
  rampA.position.set(-7, 0.9, -6);
  rampA.rotation.z = 0.32;
  rampA.castShadow = true;
  rampA.receiveShadow = true;
  scene.add(rampA);
  const rampB = new THREE.Mesh(rampGeo.clone(), rampMat);
  rampB.position.set(7, 0.9, -2);
  rampB.rotation.z = -0.32;
  rampB.castShadow = true;
  rampB.receiveShadow = true;
  scene.add(rampB);

  // Far silhouettes fading into haze so no void shows past the walls.
  const farMat = new THREE.MeshBasicMaterial({ color: 0x1a2433, fog: true });
  const farGeo = new THREE.BoxGeometry(6, 14, 6);
  const ring = 34;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    const m = new THREE.Mesh(farGeo, farMat);
    m.position.set(Math.cos(a) * ring, 4, Math.sin(a) * ring);
    m.rotation.y = a;
    scene.add(m);
  }
}

export function buildPlayerMesh() {
  // Naked cube: what you see is what collides.
  const geo = new THREE.BoxGeometry(PLAYER_SIZE, PLAYER_SIZE, PLAYER_SIZE);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xe8873a,
    roughness: 0.45,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
