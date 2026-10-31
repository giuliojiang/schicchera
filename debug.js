// Dev-only state bridge (spec 14.1). Loaded only with ?debug=1 or ?autoplay.
import { FIXED_DT } from './constants.js';
import { mulberry32 } from './game.js';

let seed = 1;
let rng = mulberry32(seed);

export function initDebug(ctx) {
  const { THREE, renderer, camera, world, playerBody, input, getState, actions, params } = ctx;

  const tmpV = new THREE.Vector3();

  function playerScreen() {
    tmpV.set(playerBody.position.x, playerBody.position.y, playerBody.position.z);
    tmpV.project(camera);
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      ndcX: +tmpV.x.toFixed(4),
      ndcY: +tmpV.y.toFixed(4),
      pxX: +((tmpV.x * 0.5 + 0.5) * w).toFixed(1),
      pxY: +((-tmpV.y * 0.5 + 0.5) * h).toFixed(1),
      behind: tmpV.z > 1,
    };
  }

  function snapshot() {
    const s = getState();
    return {
      player: {
        pos: [
          +playerBody.position.x.toFixed(4),
          +playerBody.position.y.toFixed(4),
          +playerBody.position.z.toFixed(4),
        ],
        vel: [
          +playerBody.velocity.x.toFixed(4),
          +playerBody.velocity.y.toFixed(4),
          +playerBody.velocity.z.toFixed(4),
        ],
        mass: +playerBody.mass.toFixed(4),
        hp: 1 + s.pieces.length,
        pieces: s.pieces,
      },
      boss: null,
      charge01: +s.charge01.toFixed(4),
      charging: !!s.charging,
      grounded: !!s.grounded,
      phase: s.phase,
      zone: s.zone,
      pickups: s.pickups,
      orbitAngle: +s.orbitAngle.toFixed(4),
      cam: s.cam,
      anchor: s.anchor,
      frames: s.frames,
      lastDtMs: +(s.lastDt * 1000).toFixed(2),
      screen: playerScreen(),
      seed,
    };
  }

  window.__GAME__ = {
    snapshot,
    render_game_to_text() {
      return JSON.stringify(snapshot());
    },
    step(dt = FIXED_DT) {
      // Advance physics deterministically outside the rAF loop.
      let acc = dt;
      while (acc >= FIXED_DT) {
        world.step(FIXED_DT);
        acc -= FIXED_DT;
      }
      return snapshot();
    },
    setSeed(n) {
      seed = n >>> 0;
      rng = mulberry32(seed);
      return seed;
    },
    teleport(x, z, y = 2) {
      // Dev-only level inspection: drop the player at (x, z).
      playerBody.position.set(x, y, z);
      playerBody.velocity.set(0, 0, 0);
      playerBody.angularVelocity.set(0, 0, 0);
      playerBody.wakeUp();
      return snapshot();
    },
    get rngSample() {
      return rng();
    },
  };

  // Minimal autoplay for the core: slow orbit, periodic full-ish flicks.
  if (params.has('autoplay')) {
    const seedParam = parseInt(params.get('seed') || '1', 10);
    if (Number.isFinite(seedParam)) {
      seed = seedParam >>> 0;
      rng = mulberry32(seed);
    }
    let tick = 0;
    setInterval(() => {
      tick++;
      // Orbit drift via input flags.
      input.left = tick % 8 < 4;
      input.right = !input.left;
      // Charge 1s, release, rest 1s.
      const phase = tick % 4;
      if (phase === 0) actions.beginCharge();
      else if (phase === 2) actions.releaseFlick();
    }, 1000);
  }
}
