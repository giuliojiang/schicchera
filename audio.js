// Raw WebAudio, all sounds synthesized. Never blocks the render loop.
import {
  CHARGE_TONE_BASE,
  CHARGE_TONE_GAIN,
  CHARGE_TONE_TOP,
  MUSIC_LOCK_TAU,
  MUSIC_MASTER_GAIN,
  MUSIC_STOP_TAU,
  MUSIC_TRACK_LEN,
  MUSIC_UNLOCK_TAU,
} from './constants.js';

let ctx = null;
let chargeOsc = null;
let chargeGain = null;

// Single 🔊/🔇 toggle (issue #11 §3): mutes music and SFX together, persisted
// like the menu toggle. SFX guards read it at creation time; the roll bed and
// live charge/wind-up gains are zeroed in setMuted below.
let muted = false;
try {
  muted = localStorage.getItem('schicchera_muted') === '1';
} catch {
  muted = false;
}

export function ensureAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  } catch {
    ctx = null;
  }
  return ctx;
}

// Charge tone: pitch driven by the same quadratic fraction as speed.
export function startCharge() {
  if (muted) return;
  const ac = ensureAudio();
  if (!ac) return;
  stopCharge(0.01);
  try {
    chargeOsc = ac.createOscillator();
    chargeGain = ac.createGain();
    chargeOsc.type = 'triangle';
    chargeOsc.frequency.value = CHARGE_TONE_BASE;
    chargeGain.gain.value = 0.0001;
    chargeOsc.connect(chargeGain).connect(ac.destination);
    chargeOsc.start();
    chargeGain.gain.exponentialRampToValueAtTime(CHARGE_TONE_GAIN, ac.currentTime + 0.08);
  } catch {
    chargeOsc = null;
    chargeGain = null;
  }
}

export function updateCharge(fraction01) {
  if (!ctx || !chargeOsc) return;
  const f = CHARGE_TONE_BASE + (CHARGE_TONE_TOP - CHARGE_TONE_BASE) * fraction01;
  try {
    chargeOsc.frequency.setTargetAtTime(f, ctx.currentTime, 0.03);
  } catch {
    /* ignore */
  }
}

export function stopCharge(release = 0.05) {
  if (!ctx || !chargeOsc || !chargeGain) {
    chargeOsc = null;
    chargeGain = null;
    return;
  }
  try {
    const t = ctx.currentTime;
    chargeGain.gain.cancelScheduledValues(t);
    chargeGain.gain.setTargetAtTime(0.0001, t, release / 3);
    const osc = chargeOsc;
    setTimeout(() => {
      try {
        osc.stop();
      } catch {
        /* ignore */
      }
    }, release * 1000 + 80);
  } catch {
    /* ignore */
  }
  chargeOsc = null;
  chargeGain = null;
}

// Flick release: short pitch sweep thwip, louder with charge.
export function playFlick(strength01) {
  if (muted) return;
  const ac = ensureAudio();
  if (!ac) return;
  try {
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'triangle';
    const peak = 500 + 500 * strength01;
    osc.frequency.setValueAtTime(peak, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12 + 0.18 * strength01, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  } catch {
    /* ignore */
  }
}

// Weapon pickup: bright chime, pitch rises with each consecutive pickup.
export function playPickup(count) {
  if (muted) return;
  const ac = ensureAudio();
  if (!ac) return;
  try {
    const t = ac.currentTime;
    const base = 660 * (1 + 0.25 * count);
    for (const [i, mult] of [[0, 1], [1, 1.5]]) {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      const at = t + i * 0.09;
      osc.frequency.setValueAtTime(base * mult, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.22, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);
      osc.connect(gain).connect(ac.destination);
      osc.start(at);
      osc.stop(at + 0.35);
    }
  } catch {
    /* ignore */
  }
}

// Boss wind-up: rising telegraph tone across the wind-up duration.
let bossOsc = null;
let bossGain = null;

export function startBossWindup(dur) {
  if (muted) return;
  const ac = ensureAudio();
  if (!ac) return;
  stopBossWindup(0.01);
  try {
    bossOsc = ac.createOscillator();
    bossGain = ac.createGain();
    bossOsc.type = 'sawtooth';
    const t = ac.currentTime;
    const d = Math.max(0.1, dur);
    bossOsc.frequency.setValueAtTime(120, t);
    bossOsc.frequency.linearRampToValueAtTime(520, t + d);
    bossGain.gain.setValueAtTime(0.0001, t);
    bossGain.gain.exponentialRampToValueAtTime(0.08, t + 0.08);
    bossOsc.connect(bossGain).connect(ac.destination);
    bossOsc.start(t);
  } catch {
    bossOsc = null;
    bossGain = null;
  }
}

export function stopBossWindup(release = 0.05) {
  if (!ctx || !bossOsc || !bossGain) {
    bossOsc = null;
    bossGain = null;
    return;
  }
  try {
    const t = ctx.currentTime;
    bossGain.gain.cancelScheduledValues(t);
    bossGain.gain.setTargetAtTime(0.0001, t, release / 3);
    const osc = bossOsc;
    setTimeout(() => {
      try {
        osc.stop();
      } catch {
        /* ignore */
      }
    }, release * 1000 + 80);
  } catch {
    /* ignore */
  }
  bossOsc = null;
  bossGain = null;
}

// Boss bump: heavy thud + downward whoosh.
export function playBossBump() {
  if (muted) return;
  const ac = ensureAudio();
  if (!ac) return;
  try {
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.25);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.4);
    const w = ac.createOscillator();
    const wg = ac.createGain();
    w.type = 'triangle';
    w.frequency.setValueAtTime(420, t);
    w.frequency.exponentialRampToValueAtTime(110, t + 0.22);
    wg.gain.setValueAtTime(0.0001, t);
    wg.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
    wg.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    w.connect(wg).connect(ac.destination);
    w.start(t);
    w.stop(t + 0.3);
  } catch {
    /* ignore */
  }
}

// Damage: dull hit for either party taking 1 HP.
export function playDamage() {
  if (muted) return;
  const ac = ensureAudio();
  if (!ac) return;
  try {
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.18);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.2, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  } catch {
    /* ignore */
  }
}

// Victory: short ascending arpeggio.
export function playVictory() {
  if (muted) return;
  const ac = ensureAudio();
  if (!ac) return;
  try {
    const t = ac.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      const at = t + i * 0.12;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.22, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.35);
      osc.connect(gain).connect(ac.destination);
      osc.start(at);
      osc.stop(at + 0.4);
    });
  } catch {
    /* ignore */
  }
}

// Russolo audio nod (issue #10 §7, optional stretch): velocity-tied noise.
// Shared white-noise buffer, built lazily. All gains sit below the cues
// (charge tone, wind-up, damage, pickup): garnish, never masking.
let noiseBuf = null;
function getNoiseBuf(ac) {
  if (noiseBuf) return noiseBuf;
  try {
    const len = Math.floor(ac.sampleRate * 1);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    noiseBuf = buf;
  } catch {
    noiseBuf = null;
  }
  return noiseBuf;
}

// Flick whoosh: short filtered-noise burst on release, through the existing
// synthesized setup. No files, no samples.
export function playWhoosh(strength01) {
  if (muted) return;
  const ac = ensureAudio();
  if (!ac) return;
  const buf = getNoiseBuf(ac);
  if (!buf) return;
  try {
    const t = ac.currentTime;
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = 0.9 + 0.4 * Math.min(1, Math.max(0, strength01));
    const filt = ac.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.setValueAtTime(900 + 1400 * strength01, t);
    filt.frequency.exponentialRampToValueAtTime(320, t + 0.22);
    filt.Q.value = 0.8;
    const gain = ac.createGain();
    const peak = 0.04 + 0.08 * Math.min(1, Math.max(0, strength01));
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    src.connect(filt).connect(gain).connect(ac.destination);
    src.start(t);
    src.stop(t + 0.3);
  } catch {
    /* ignore */
  }
}

// Rolling noise bed: continuous low filtered noise, gain tied to speed.
// Cuttable: if it ever masks a cue in playtesting, delete the call site.
let rollSrc = null;
let rollGain = null;
export function updateRollNoise(speed, minSpeed, maxGain) {
  const ac = ctx || ensureAudio();
  if (!ac) return;
  try {
    if (!rollSrc || !rollGain) {
      const buf = getNoiseBuf(ac);
      if (!buf) return;
      rollSrc = ac.createBufferSource();
      rollSrc.buffer = buf;
      rollSrc.loop = true;
      const filt = ac.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 420;
      rollGain = ac.createGain();
      rollGain.gain.value = 0.0001;
      rollSrc.connect(filt).connect(rollGain).connect(ac.destination);
      rollSrc.start();
    }
    const over = Math.max(0, speed - minSpeed);
    const target = muted ? 0.0001 : Math.min(maxGain, (over / 16) * maxGain);
    rollGain.gain.setTargetAtTime(Math.max(0.0001, target), ac.currentTime, 0.1);
  } catch {
    /* ignore */
  }
}

// Layered music (issue #11): base + one stem per weapon on one 180 s timeline.
// OGG is primary, MP3 the fallback for browsers without Ogg Vorbis; the
// format is picked once at boot via canPlayType and never mixed in a run.
// All four stems start in the same tick with loop=true, so sync is structural:
// same sample count, same start, same 180 s loop — no drift to correct.
// (The MP3 loop seam is inaudible: the track fades to silence over its last
// 2 s before the loop point.)
const MUSIC_ORDER = ['base', 'dagger', 'sword', 'hammer'];
let musicExtPick = null;
let musicBufs = null; // {base, dagger, sword, hammer} AudioBuffers, decoded
let musicLoad = null; // in-flight preload promise
let musicNodes = null; // {sources, gains, master, t0} while a run plays
let musicGen = 0; // start/stop generation: a stop cancels a deferred start
let heldLayers = new Set(['base']); // base is the run's ambient bed, always on

function pickMusicExt() {
  if (musicExtPick) return musicExtPick;
  try {
    const el = document.createElement('audio');
    musicExtPick = el.canPlayType && el.canPlayType('audio/ogg') ? 'ogg' : 'mp3';
  } catch {
    musicExtPick = 'ogg';
  }
  return musicExtPick;
}

// Decode all four stems before the run starts. Preload during boot; a run
// never starts with a subset of stems — startRunMusic waits for this.
export function preloadMusic() {
  if (musicLoad) return musicLoad;
  musicLoad = (async () => {
    try {
      const ext = pickMusicExt();
      const ac = ensureAudio();
      if (!ac) return false;
      const parts = await Promise.all(
        MUSIC_ORDER.map(async (name) => {
          const res = await fetch(`audio/layer-${name}.${ext}`);
          if (!res.ok) throw new Error(`music stem missing: ${name}`);
          const buf = await ac.decodeAudioData(await res.arrayBuffer());
          return [name, buf];
        })
      );
      musicBufs = Object.fromEntries(parts);
      return true;
    } catch {
      return false;
    }
  })();
  return musicLoad;
}

// Start all four stems together from t=0 (a fresh run = a fresh track).
// Called on the first-gesture audio unlock, same path as the SFX. Safe to
// call repeatedly: a playing run is left alone, missing stems defer the start
// until preload resolves instead of starting a partial set.
export function startRunMusic() {
  const ac = ensureAudio();
  if (!ac || musicNodes) return !!musicNodes;
  if (!musicBufs) {
    const gen = musicGen;
    preloadMusic().then((ok) => {
      if (ok && gen === musicGen && !musicNodes) startRunMusic();
    });
    return false;
  }
  try {
    const master = ac.createGain();
    master.gain.value = muted ? 0 : MUSIC_MASTER_GAIN;
    master.connect(ac.destination);
    const t = ac.currentTime + 0.05;
    const sources = [];
    const gains = {};
    for (const name of MUSIC_ORDER) {
      const src = ac.createBufferSource();
      src.buffer = musicBufs[name];
      src.loop = true;
      const g = ac.createGain();
      g.gain.value = 0;
      src.connect(g).connect(master);
      src.start(t, 0);
      sources.push(src);
      gains[name] = g;
    }
    musicNodes = { sources, gains, master, t0: t };
    gains.base.gain.setTargetAtTime(1, t, 0.1);
    for (const name of heldLayers) {
      if (name !== 'base' && gains[name]) gains[name].gain.setTargetAtTime(1, t, MUSIC_UNLOCK_TAU);
    }
    return true;
  } catch {
    return false;
  }
}

// Weapon collected: fade its layer 0->1 over ~1 s, on top of the pickup chime.
export function unlockMusicLayer(id) {
  if (MUSIC_ORDER.includes(id)) heldLayers.add(id);
  try {
    if (musicNodes && musicNodes.gains[id]) {
      musicNodes.gains[id].gain.setTargetAtTime(1, ctx.currentTime, MUSIC_UNLOCK_TAU);
    }
  } catch {
    /* ignore */
  }
}

// Weapon lost to damage: fade its layer out over ~0.5 s (default — layers
// follow current attachments, so the music thins as HP drops). The latch
// alternative is a one-line change here (skip this fade); it needs Giulio's
// word to switch, so the default ships.
export function lockMusicLayer(id) {
  heldLayers.delete(id);
  try {
    if (musicNodes && musicNodes.gains[id]) {
      musicNodes.gains[id].gain.setTargetAtTime(0, ctx.currentTime, MUSIC_LOCK_TAU);
    }
  } catch {
    /* ignore */
  }
}

// Game over: ramp every stem to 0 over ~1 s, then stop the sources.
// On victory this is NOT called — the held layers keep playing under the
// victory arpeggio, and die with the page when leaving the victory screen.
export function stopRunMusic() {
  musicGen++; // cancel any deferred start
  heldLayers = new Set(['base']);
  if (!musicNodes || !ctx) {
    musicNodes = null;
    return;
  }
  const { sources, gains, master } = musicNodes;
  musicNodes = null;
  try {
    const t = ctx.currentTime;
    for (const name of MUSIC_ORDER) gains[name].gain.setTargetAtTime(0, t, MUSIC_STOP_TAU);
    setTimeout(() => {
      for (const s of sources) {
        try {
          s.stop();
        } catch {
          /* ignore */
        }
      }
      try {
        master.disconnect();
      } catch {
        /* ignore */
      }
    }, MUSIC_STOP_TAU * 1000 * 4 + 300);
  } catch {
    /* ignore */
  }
}

export function isMuted() {
  return muted;
}

// The single toggle: music master to 0 plus SFX silenced at creation, live
// one-shots zeroed. Sources are never stopped, so unmuting resumes the track
// at the same position.
export function setMuted(m) {
  muted = !!m;
  try {
    localStorage.setItem('schicchera_muted', muted ? '1' : '0');
  } catch {
    /* ignore */
  }
  if (!ctx) return muted;
  try {
    const t = ctx.currentTime;
    if (musicNodes) musicNodes.master.gain.setTargetAtTime(muted ? 0 : MUSIC_MASTER_GAIN, t, 0.05);
    for (const g of [chargeGain, bossGain, rollGain]) {
      if (g) g.gain.setTargetAtTime(0.0001, t, 0.03);
    }
  } catch {
    /* ignore */
  }
  return muted;
}

// Debug snapshot for the §14 hook and the issue #11 acceptance tests: stem
// gains plus the shared track position (one clock, so all stems agree).
export function musicSnapshot() {
  const layers = {};
  for (const name of MUSIC_ORDER) {
    try {
      layers[name] = musicNodes ? +musicNodes.gains[name].gain.value.toFixed(4) : 0;
    } catch {
      layers[name] = 0;
    }
  }
  let time = 0;
  try {
    if (musicNodes && ctx) {
      const len = (musicBufs && musicBufs.base && musicBufs.base.duration) || MUSIC_TRACK_LEN;
      time = +((((ctx.currentTime - musicNodes.t0) % len) + len) % len).toFixed(3);
    }
  } catch {
    /* ignore */
  }
  return { ext: musicExtPick || 'ogg', ready: !!musicBufs, playing: !!musicNodes, layers, musicTime: time };
}

// Collision thud, volume scaled by impact velocity.
export function playThud(impact) {
  if (muted) return;
  const ac = ctx || ensureAudio();
  if (!ac || !(impact > 0.5)) return;
  try {
    const t = ac.currentTime;
    const v = Math.min(1, impact / 10);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.12);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.05 + 0.3 * v, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  } catch {
    /* ignore */
  }
}
