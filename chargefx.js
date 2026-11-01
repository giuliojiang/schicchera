// Charge feedback swarm (issue #4, layer 1 + §9 boss reuse).
// One THREE.Points cloud per character, fixed pool, no per-frame allocation.
// Visual-only: positions and colors live in the parent mesh's local space and
// never touch the physics body, velocity, or collision. Trajectories with the
// effects on equal trajectories with them off.
import { mulberry32 } from './game.js';

// Procedural soft-dot sprite (no asset files). Shared by every swarm.
let dotTexture = null;
function getDotTexture(THREE) {
  if (dotTexture) return dotTexture;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.6)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  dotTexture = new THREE.CanvasTexture(c);
  return dotTexture;
}

// opts: { count, size, tint, rOut, rIn, burstTime, seed }.
// All motion params derive from the caller-supplied fraction f (the same
// quadratic chargeFraction that sets flick speed), so visuals match power.
export function createMotes(THREE, opts) {
  const count = opts.count;
  const rOut = opts.rOut;
  const rIn = opts.rIn;
  const burstDur = opts.burstTime;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: opts.size,
    map: getDotTexture(THREE),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false; // local positions orbit; stale bounds would cull
  points.visible = false;

  // Per-mote fixed randoms (seeded: no Math.random in the tested path).
  const rng = mulberry32(opts.seed || 1);
  const bx = new Float32Array(count);
  const by = new Float32Array(count);
  const bz = new Float32Array(count);
  const ang = new Float32Array(count);
  const spd = new Float32Array(count);
  const rad = new Float32Array(count);
  const twk = new Float32Array(count);
  const vel = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Random unit base vector.
    let x = rng() * 2 - 1;
    let y = rng() * 2 - 1;
    let z = rng() * 2 - 1;
    let len = Math.hypot(x, y, z);
    if (!(len > 1e-4)) {
      x = 1;
      y = 0;
      z = 0;
      len = 1;
    }
    bx[i] = x / len;
    by[i] = y / len;
    bz[i] = z / len;
    ang[i] = rng() * Math.PI * 2;
    spd[i] = (0.8 + rng() * 1.2) * (rng() < 0.5 ? -1 : 1);
    rad[i] = rOut * (0.75 + rng() * 0.5);
    twk[i] = rng() * Math.PI * 2;
  }

  const tint = new THREE.Color(opts.tint);
  let mode = 'idle'; // idle | gather | burst | fade
  let t = 0;
  let burstT = 0;

  function markDirty() {
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  }

  // Gathering: motes orbit faster, brighten, and spiral inward with f.
  function gather(dt, f) {
    mode = 'gather';
    t += dt;
    points.visible = true;
    const n = f <= 0 ? 0 : Math.max(1, Math.floor(count * Math.min(1, f * 1.15)));
    const shell = f >= 1; // full charge: snap into a tight bright shell
    const spin = 0.6 + 3.0 * f;
    // Density compensation: additive blending stacks every overlap, so a
    // dense shell at full per-mote brightness whites out the face behind it.
    // Scale per-mote brightness down as the visible count rises; the shell
    // still limb-brightens into a ring, but the character stays readable.
    const comp = n > 0 ? Math.min(1, 12 / n) : 1;
    for (let i = 0; i < count; i++) {
      const o = i * 3;
      if (i >= n) {
        pos[o] = 0;
        pos[o + 1] = 0;
        pos[o + 2] = 0;
        col[o] = 0;
        col[o + 1] = 0;
        col[o + 2] = 0;
        continue;
      }
      ang[i] += spd[i] * spin * dt;
      let r = rad[i] + (rIn - rad[i]) * f;
      if (shell) r = rIn * 0.85;
      const c = Math.cos(ang[i]);
      const s = Math.sin(ang[i]);
      // Base vector rotated around local Y: horizontal swirl at mixed heights.
      pos[o] = (bx[i] * c + bz[i] * s) * r;
      pos[o + 1] = by[i] * r;
      pos[o + 2] = (-bx[i] * s + bz[i] * c) * r;
      const tw = 0.75 + 0.25 * Math.sin(t * 7 + twk[i]);
      let b = (0.25 + 0.75 * f) * tw * comp;
      if (shell) b *= 1.1 + 0.2 * Math.sin(t * 10);
      col[o] = tint.r * b;
      col[o + 1] = tint.g * b;
      col[o + 2] = tint.b * b;
    }
    markDirty();
  }

  // Release burst: the whole swarm fires along (dx,dy,dz) in local space and
  // fades over burstDur. Pass 0,0,0 for a pure radial burst (boss bump).
  function burst(dx, dy, dz, speed) {
    mode = 'burst';
    burstT = burstDur;
    points.visible = true;
    for (let i = 0; i < count; i++) {
      const o = i * 3;
      let rx = pos[o];
      let ry = pos[o + 1];
      let rz = pos[o + 2];
      let rl = Math.hypot(rx, ry, rz);
      if (!(rl > 1e-4)) {
        rx = bx[i];
        ry = by[i];
        rz = bz[i];
        rl = 1;
      }
      const h = 0.7 + 0.6 * ((twk[i] % 1 + 1) % 1);
      const rv = (speed * 0.45 * h) / rl;
      vel[o] = rx * rv + dx * speed * h;
      vel[o + 1] = ry * rv + dy * speed * h;
      vel[o + 2] = rz * rv + dz * speed * h;
    }
  }

  function frameBurst(dt) {
    burstT -= dt;
    const k = Math.max(0, burstT / burstDur);
    const damp = Math.exp(-2.5 * dt);
    for (let i = 0; i < count; i++) {
      const o = i * 3;
      pos[o] += vel[o] * dt;
      pos[o + 1] += vel[o + 1] * dt;
      pos[o + 2] += vel[o + 2] * dt;
      vel[o] *= damp;
      vel[o + 1] *= damp;
      vel[o + 2] *= damp;
      const tw = 0.75 + 0.25 * Math.sin(t * 7 + twk[i]);
      const b = k * tw;
      col[o] = tint.r * b;
      col[o + 1] = tint.g * b;
      col[o + 2] = tint.b * b;
    }
    t += dt;
    markDirty();
    if (burstT <= 0) {
      mode = 'idle';
      points.visible = false;
    }
  }

  function frameFade(dt) {
    const d = Math.exp(-6 * dt);
    let m = 0;
    for (let j = 0; j < col.length; j++) {
      col[j] *= d;
      if (col[j] > m) m = col[j];
    }
    geo.attributes.color.needsUpdate = true;
    if (m < 0.02) {
      mode = 'idle';
      points.visible = false;
    }
  }

  return {
    points,
    isActive() {
      return mode !== 'idle';
    },
    // Per-frame driver. Pass the charge fraction while gathering, null when
    // the charge/wind-up is not held: burst and fade advance themselves.
    frame(dt, fOrNull) {
      if (fOrNull !== null && fOrNull !== undefined) {
        gather(dt, fOrNull);
      } else if (mode === 'burst') {
        frameBurst(dt);
      } else if (mode === 'fade') {
        frameFade(dt);
      } else if (mode === 'gather') {
        // Charge ended without an explicit burst or cancel: dissipate.
        mode = 'fade';
        frameFade(dt);
      }
    },
    burst,
    // Charge cancelled without firing: motes simply dissipate, no burst.
    dissipate() {
      if (mode === 'gather') mode = 'fade';
    },
    hide() {
      mode = 'idle';
      points.visible = false;
    },
  };
}
