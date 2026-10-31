// Raw WebAudio, all sounds synthesized. Never blocks the render loop.
import { CHARGE_TONE_BASE, CHARGE_TONE_GAIN, CHARGE_TONE_TOP } from './constants.js';

let ctx = null;
let chargeOsc = null;
let chargeGain = null;

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

// Collision thud, volume scaled by impact velocity.
export function playThud(impact) {
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
