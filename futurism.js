// Futurism lines of force (issue #10): ghost echoes, flick streaks,
// high-speed shimmer, boss wind-up force lines.
// Visual-only by construction: world-space primitives in the gold-white
// family, no colliders, never touch bodies/velocity/collision/damage.
// Past motion only: echoes record where the cube HAS BEEN, streaks burst
// along a flick that HAS ALREADY FIRED. Nothing here appears before a
// release or indicates a future direction. Fixed pools, no per-frame alloc.
import { mulberry32 } from './game.js';

// Ghost afterimages (Balla simultaneity, §3): one translucent cube per
// recent snapshot, tumbling with the snapshot rotation. Cube body ONLY,
// never weapons, to keep the trail cheap and readable.
export function createGhostTrail(THREE, opts) {
  const count = opts.count;
  const fade = opts.fade;
  const interval = opts.interval;
  const minSpeed = opts.minSpeed;
  const maxOpacity = opts.maxOpacity;
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(opts.size, opts.size, opts.size);
  const meshes = [];
  const life = new Float32Array(count); // remaining lifetime per slot
  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: opts.tint,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const m = new THREE.Mesh(geo, mat);
    m.visible = false;
    m.frustumCulled = false;
    group.add(m);
    meshes.push(m);
  }
  let cursor = 0;
  let timer = 0;

  function frame(dt, px, py, pz, qx, qy, qz, qw, speed) {
    // Snapshot while fast; a resting cube never trails.
    if (speed > minSpeed) {
      timer += dt;
      if (timer >= interval) {
        timer = 0;
        const slot = cursor;
        cursor = (cursor + 1) % count;
        const m = meshes[slot];
        m.position.set(px, py, pz);
        m.quaternion.set(qx, qy, qz, qw);
        m.visible = true;
        life[slot] = fade;
      }
    } else {
      timer = interval; // slow roll looks clean: next fast move trails at once
    }
    for (let i = 0; i < count; i++) {
      if (!(life[i] > 0)) continue;
      life[i] -= dt;
      const m = meshes[i];
      if (life[i] <= 0) {
        life[i] = 0;
        m.visible = false;
        m.material.opacity = 0;
      } else {
        m.material.opacity = maxOpacity * (life[i] / fade);
      }
    }
  }

  return {
    group,
    frame,
    hide() {
      for (let i = 0; i < count; i++) {
        life[i] = 0;
        meshes[i].visible = false;
        meshes[i].material.opacity = 0;
      }
      timer = 0;
    },
  };
}

// Streak pool (§4 release bursts + §5 high-speed shimmer, shared): thin
// stretched boxes, never LineSegments (one-pixel lines vanish at the follow
// camera distance). Slots fade in place; the player moving away is what
// makes them read as trailing. Scratch vectors live per-pool, reused.
export function createStreakPool(THREE, opts) {
  const count = opts.count;
  const thick = opts.thick;
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const meshes = [];
  const life = new Float32Array(count);
  const maxLife = new Float32Array(count);
  const baseOp = new Float32Array(count);
  const rng = mulberry32(opts.seed || 5);
  const dirV = new THREE.Vector3();
  const xV = new THREE.Vector3(1, 0, 0);
  const q = new THREE.Quaternion();
  let cursor = 0;

  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: opts.tint,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const m = new THREE.Mesh(geo, mat);
    m.visible = false;
    m.frustumCulled = false;
    group.add(m);
    meshes.push(m);
  }

  // One line along (dx,dy,dz) through (px,py,pz), fading over `span` seconds.
  function spawn(px, py, pz, dx, dy, dz, len, span, opacity) {
    const dl = Math.hypot(dx, dy, dz);
    if (!(dl > 1e-6) || !(span > 0)) return;
    const slot = cursor;
    cursor = (cursor + 1) % count;
    const m = meshes[slot];
    dirV.set(dx / dl, dy / dl, dz / dl);
    q.setFromUnitVectors(xV, dirV);
    m.quaternion.copy(q);
    m.position.set(px + dirV.x * len * 0.5, py + dirV.y * len * 0.5, pz + dirV.z * len * 0.5);
    m.scale.set(len, thick, thick);
    m.visible = true;
    m.material.opacity = opacity;
    life[slot] = span;
    maxLife[slot] = span;
    baseOp[slot] = opacity;
  }

  // Release burst (§4): COUNT diagonal lines along the fired flick direction,
  // fanned a few degrees so the burst reads as a sheaf of force lines.
  // Call exactly on release, never during charge (past motion only).
  function burstRelease(px, py, pz, dx, dz, n, lenMin, lenMax, span, opacity, spread) {
    const base = Math.atan2(dx, dz);
    for (let i = 0; i < n; i++) {
      const fan = (rng() * 2 - 1) * spread;
      const a = base + fan;
      const tilt = (rng() * 2 - 1) * spread * 0.7;
      const len = lenMin + rng() * (lenMax - lenMin);
      const off = 0.4 + rng() * 0.5; // start just off the cube surface
      const c = Math.cos(a);
      const s = Math.sin(a);
      spawn(
        px + s * off, py + tilt * off + 0.1, pz + c * off,
        s, tilt, c, len, span * (0.8 + rng() * 0.4), opacity
      );
    }
  }

  function frame(dt) {
    for (let i = 0; i < count; i++) {
      if (!(life[i] > 0)) continue;
      life[i] -= dt;
      const m = meshes[i];
      if (life[i] <= 0) {
        life[i] = 0;
        m.visible = false;
        m.material.opacity = 0;
      } else {
        m.material.opacity = baseOp[i] * (life[i] / maxLife[i]);
      }
    }
  }

  return {
    group,
    spawn,
    burstRelease,
    frame,
    random: rng,
    hide() {
      for (let i = 0; i < count; i++) {
        life[i] = 0;
        meshes[i].visible = false;
        meshes[i].material.opacity = 0;
      }
    },
  };
}

// Boss wind-up force lines (§6): short lines radiating outward, pulsing with
// wind-up progress. Additive to squash + glow + swarm + tone, never a
// replacement. World space around the boss ball, no squash inheritance.
export function createBossLines(THREE, opts) {
  const count = opts.count;
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const meshes = [];
  // Fixed per-slot radial directions (seeded) + length + phase variation.
  const rng = mulberry32(opts.seed || 9);
  const dx = new Float32Array(count);
  const dy = new Float32Array(count);
  const dz = new Float32Array(count);
  const len = new Float32Array(count);
  const ph = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    let x = rng() * 2 - 1;
    let y = rng() * 2 - 1;
    let z = rng() * 2 - 1;
    let l = Math.hypot(x, y, z);
    if (!(l > 1e-4)) {
      x = 1;
      y = 0;
      z = 0;
      l = 1;
    }
    dx[i] = x / l;
    dy[i] = y / l;
    dz[i] = z / l;
    len[i] = opts.lenMin + rng() * (opts.lenMax - opts.lenMin);
    ph[i] = rng() * Math.PI * 2;
    const mat = new THREE.MeshBasicMaterial({
      color: opts.tint,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const m = new THREE.Mesh(geo, mat);
    m.visible = false;
    m.frustumCulled = false;
    group.add(m);
    meshes.push(m);
  }
  const dirV = new THREE.Vector3();
  const xV = new THREE.Vector3(1, 0, 0);
  const qq = new THREE.Quaternion();

  // progress in [0,1] across the wind-up; time is the game clock for pulse.
  function frame(dt, on, bx, by, bz, progress, time) {
    void dt;
    if (!on) {
      for (let i = 0; i < count; i++) {
        meshes[i].visible = false;
        meshes[i].material.opacity = 0;
      }
      return;
    }
    const p = Math.min(1, Math.max(0, progress));
    const shown = Math.ceil(count * (0.35 + 0.65 * p)); // denser as bump nears
    const reach = opts.radius + 0.35 * p;
    for (let i = 0; i < count; i++) {
      const m = meshes[i];
      if (i >= shown) {
        m.visible = false;
        m.material.opacity = 0;
        continue;
      }
      m.visible = true;
      dirV.set(dx[i], dy[i], dz[i]);
      qq.setFromUnitVectors(xV, dirV);
      m.quaternion.copy(qq);
      const pulse = 0.75 + 0.25 * Math.sin(time * 12 + ph[i]);
      m.position.set(
        bx + dx[i] * (reach + len[i] * 0.5),
        by + dy[i] * (reach + len[i] * 0.5),
        bz + dz[i] * (reach + len[i] * 0.5)
      );
      m.scale.set(len[i], opts.thick, opts.thick);
      m.material.opacity = opts.maxOpacity * (0.35 + 0.65 * p) * pulse;
    }
  }

  return {
    group,
    frame,
    hide() {
      for (let i = 0; i < count; i++) {
        meshes[i].visible = false;
        meshes[i].material.opacity = 0;
      }
    },
  };
}
