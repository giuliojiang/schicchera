// Visual layers (issue #16): the world wakes up as you arm up.
// One custom grade ShaderPass in an EffectComposer chain (RenderPass ->
// grade -> OutputPass) plus animated scene fog and a gradient sky dome.
// Layers mirror the music layers (issue #11): same per-item keying, same
// run lifecycle. No chromatic aberration, no motion blur, no bloom/vignette.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import {
  FOG_DENSITY,
  VIS_CONTRAST_GLOOM,
  VIS_CONTRAST_GOLD_BOOST,
  VIS_CONTRAST_NORMAL,
  VIS_EXPOSURE_GLOOM,
  VIS_EXPOSURE_GOLD_BOOST,
  VIS_EXPOSURE_NORMAL,
  VIS_FOG_GLOOM,
  VIS_FOG_GOLD,
  VIS_FOG_MIX,
  VIS_FOG_SWORD,
  VIS_FOG_TINT_GLOOM,
  VIS_FOG_TINT_GOLD,
  VIS_FOG_TINT_SWORD,
  VIS_SAT_BASE,
  VIS_SAT_FULL,
  VIS_SAT_GREEN_KEPT,
  VIS_SAT_OTHER_SWORD,
  VIS_SAT_YELLOW_SWORD,
  VIS_SKY_RADIUS,
  VIS_SKY_ZENITH_GLOOM,
  VIS_SKY_ZENITH_LIFTED,
  VIS_SKY_ZENITH_WARM,
  VIS_WARM_TINT,
} from './constants.js';

// Pure: layer targets from ITEMS HELD (not collection order). Each item's
// deltas compose independently; hammer wins fog, sword owns yellows, dagger
// owns the light. Out-of-order hammer-before-sword gives golden fog with
// still-dull yellows per the spec — that combination is correct, not a bug.
export function visualTargets(pieces) {
  const has = (id) => pieces.includes(id);
  const dagger = has('dagger');
  const sword = has('sword');
  const hammer = has('hammer');
  return {
    exposure:
      VIS_EXPOSURE_GLOOM +
      (dagger ? VIS_EXPOSURE_NORMAL - VIS_EXPOSURE_GLOOM : 0) +
      (hammer ? VIS_EXPOSURE_GOLD_BOOST : 0),
    contrast:
      VIS_CONTRAST_GLOOM +
      (dagger ? VIS_CONTRAST_NORMAL - VIS_CONTRAST_GLOOM : 0) +
      (hammer ? VIS_CONTRAST_GOLD_BOOST : 0),
    // Sword wakes yellows; hammer lifts everything to full, but only where
    // the sword already woke yellows — hammer alone leaves yellows dull.
    satYellow: sword ? (hammer ? VIS_SAT_FULL : VIS_SAT_YELLOW_SWORD) : VIS_SAT_BASE,
    satGreen: hammer ? VIS_SAT_FULL : VIS_SAT_GREEN_KEPT,
    satOther: hammer ? VIS_SAT_FULL : sword ? VIS_SAT_OTHER_SWORD : VIS_SAT_BASE,
    fogFactor: hammer ? VIS_FOG_GOLD : sword ? VIS_FOG_SWORD : VIS_FOG_GLOOM,
    fogTint: hammer ? VIS_FOG_TINT_GOLD : sword ? VIS_FOG_TINT_SWORD : VIS_FOG_TINT_GLOOM,
    zenith: hammer ? VIS_SKY_ZENITH_WARM : dagger ? VIS_SKY_ZENITH_LIFTED : VIS_SKY_ZENITH_GLOOM,
    warm: hammer ? [...VIS_WARM_TINT] : [1, 1, 1],
  };
}

// Fullscreen grade: exposure + contrast + hue-selective saturation + warm
// tint. The sword layer needs saturation by hue range (yellows up, greens
// dull), so the mask is HSL-based per §4 — not a single global slider.
// Lava red sits in "other": dull gray at Layer 0, full red at Layer 3.
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uExposure: { value: VIS_EXPOSURE_GLOOM },
    uContrast: { value: VIS_CONTRAST_GLOOM },
    uSatYellow: { value: VIS_SAT_BASE },
    uSatGreen: { value: VIS_SAT_GREEN_KEPT },
    uSatOther: { value: VIS_SAT_BASE },
    uWarmTint: { value: new THREE.Vector3(1, 1, 1) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uExposure;
    uniform float uContrast;
    uniform float uSatYellow;
    uniform float uSatGreen;
    uniform float uSatOther;
    uniform vec3 uWarmTint;
    varying vec2 vUv;
    void main() {
      vec4 tex = texture2D(tDiffuse, vUv);
      vec3 col = tex.rgb;
      col *= uExposure;
      col = (col - 0.5) * uContrast + 0.5;
      // Hue from RGB (achromatic -> 0, deterministic; gray is unaffected anyway).
      float cmax = max(col.r, max(col.g, col.b));
      float cmin = min(col.r, min(col.g, col.b));
      float delta = cmax - cmin;
      float hue = 0.0;
      if (delta > 1e-4) {
        if (cmax == col.r) hue = mod((col.g - col.b) / delta, 6.0) / 6.0;
        else if (cmax == col.g) hue = ((col.b - col.r) / delta + 2.0) / 6.0;
        else hue = ((col.r - col.g) / delta + 4.0) / 6.0;
        if (hue < 0.0) hue += 1.0;
      }
      // Yellow ~0.14, green ~0.33. Smooth bands, no overlap. The green
      // band runs wide (forest ground and moss are yellow-green olives, not
      // just canopy deep green) while yellow keeps its narrow core so beach
      // sand still wakes fully at the sword layer.
      float wY = 1.0 - smoothstep(0.03, 0.07, abs(hue - 0.14));
      float wG = (1.0 - smoothstep(0.08, 0.13, abs(hue - 0.33))) * (1.0 - clamp(wY, 0.0, 1.0));
      wY = clamp(wY, 0.0, 1.0);
      wG = clamp(wG, 0.0, 1.0);
      float wO = clamp(1.0 - wY - wG, 0.0, 1.0);
      float sat = uSatYellow * wY + uSatGreen * wG + uSatOther * wO;
      float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(luma), col, clamp(sat, 0.0, 1.5));
      col *= uWarmTint;
      gl_FragColor = vec4(col, tex.a);
    }
  `,
};

// Sky dome: vertical gradient, BackSide sphere, fog disabled so fog never
// grays it out. Horizon tracks the fog color every frame so sky and fog meet
// with no seam; zenith is the layer parameter.
const SkyShader = {
  uniforms: {
    topColor: { value: new THREE.Color(VIS_SKY_ZENITH_GLOOM) },
    bottomColor: { value: new THREE.Color(VIS_FOG_TINT_GLOOM) },
  },
  vertexShader: `
    varying vec3 vDir;
    void main() {
      vDir = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    varying vec3 vDir;
    void main() {
      float t = smoothstep(0.0, 0.5, vDir.y);
      gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
    }
  `,
};

const scratchTargetFog = new THREE.Color();
const scratchTargetZenith = new THREE.Color();
const scratchFinalFog = new THREE.Color();

export function createVisualLayers(renderer, scene, camera) {
  // Sky dome first: one draw call, negligible cost.
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(VIS_SKY_ZENITH_GLOOM) },
      bottomColor: { value: new THREE.Color(VIS_FOG_TINT_GLOOM) },
    },
    vertexShader: SkyShader.vertexShader,
    fragmentShader: SkyShader.fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const skyMesh = new THREE.Mesh(new THREE.SphereGeometry(VIS_SKY_RADIUS, 32, 15), skyMat);
  skyMesh.frustumCulled = false;
  skyMesh.renderOrder = -1;
  scene.add(skyMesh);
  // The dome is the background now; a scene color would hide it.
  scene.background = null;

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(new RenderPass(scene, camera));
  const gradePass = new ShaderPass(GradeShader);
  composer.addPass(gradePass);
  composer.addPass(new OutputPass());
  return { composer, gradePass, skyMesh, skyUniforms: skyMat.uniforms };
}

export function createInitialVisualState() {
  const t = visualTargets([]);
  return {
    exposure: t.exposure,
    contrast: t.contrast,
    satYellow: t.satYellow,
    satGreen: t.satGreen,
    satOther: t.satOther,
    fogFactor: t.fogFactor,
    fogTint: new THREE.Color(t.fogTint),
    zenith: new THREE.Color(t.zenith),
    warm: [...t.warm],
  };
}

// Advance the animated current toward the held-items target and apply it:
// grade uniforms, fog density + fog color (zone mixed toward the layer
// tint), sky horizon (= fog, no seam) and zenith. Returns the target for
// the debug bridge. No hard cuts: call every frame with a ~0.3 s tau.
export function updateVisualLayers({ dt, pieces, zoneColor, scene, camera, current, gradeUniforms, skyUniforms, skyMesh, tau }) {
  const target = visualTargets(pieces);
  const k = 1 - Math.exp(-dt / Math.max(1e-3, tau));
  current.exposure += (target.exposure - current.exposure) * k;
  current.contrast += (target.contrast - current.contrast) * k;
  current.satYellow += (target.satYellow - current.satYellow) * k;
  current.satGreen += (target.satGreen - current.satGreen) * k;
  current.satOther += (target.satOther - current.satOther) * k;
  current.fogFactor += (target.fogFactor - current.fogFactor) * k;
  scratchTargetFog.setHex(target.fogTint);
  scratchTargetZenith.setHex(target.zenith);
  current.fogTint.lerp(scratchTargetFog, k);
  current.zenith.lerp(scratchTargetZenith, k);
  for (let i = 0; i < 3; i++) current.warm[i] += (target.warm[i] - current.warm[i]) * k;

  gradeUniforms.uExposure.value = current.exposure;
  gradeUniforms.uContrast.value = current.contrast;
  gradeUniforms.uSatYellow.value = current.satYellow;
  gradeUniforms.uSatGreen.value = current.satGreen;
  gradeUniforms.uSatOther.value = current.satOther;
  gradeUniforms.uWarmTint.value.set(current.warm[0], current.warm[1], current.warm[2]);

  scene.fog.density = FOG_DENSITY * current.fogFactor;
  scratchFinalFog.copy(zoneColor).lerp(current.fogTint, VIS_FOG_MIX);
  scene.fog.color.copy(scratchFinalFog);
  skyUniforms.bottomColor.value.copy(scratchFinalFog);
  skyUniforms.topColor.value.copy(current.zenith);
  skyMesh.position.copy(camera.position);
  return target;
}

// Headless/sim: snap straight to the target so a single render shows the
// correct layer without waiting out the fade.
export function snapVisualLayers({ pieces, zoneColor, scene, camera, current, gradeUniforms, skyUniforms, skyMesh }) {
  const target = visualTargets(pieces);
  current.exposure = target.exposure;
  current.contrast = target.contrast;
  current.satYellow = target.satYellow;
  current.satGreen = target.satGreen;
  current.satOther = target.satOther;
  current.fogFactor = target.fogFactor;
  current.fogTint.setHex(target.fogTint);
  current.zenith.setHex(target.zenith);
  current.warm = [...target.warm];
  gradeUniforms.uExposure.value = current.exposure;
  gradeUniforms.uContrast.value = current.contrast;
  gradeUniforms.uSatYellow.value = current.satYellow;
  gradeUniforms.uSatGreen.value = current.satGreen;
  gradeUniforms.uSatOther.value = current.satOther;
  gradeUniforms.uWarmTint.value.set(current.warm[0], current.warm[1], current.warm[2]);
  scene.fog.density = FOG_DENSITY * current.fogFactor;
  scratchFinalFog.copy(zoneColor).lerp(current.fogTint, VIS_FOG_MIX);
  scene.fog.color.copy(scratchFinalFog);
  skyUniforms.bottomColor.value.copy(scratchFinalFog);
  skyUniforms.topColor.value.copy(current.zenith);
  skyMesh.position.copy(camera.position);
  return target;
}

export function visualSnapshot(current, pieces) {
  return {
    held: [...pieces],
    exposure: +current.exposure.toFixed(3),
    contrast: +current.contrast.toFixed(3),
    satYellow: +current.satYellow.toFixed(3),
    satGreen: +current.satGreen.toFixed(3),
    satOther: +current.satOther.toFixed(3),
    fogFactor: +current.fogFactor.toFixed(3),
    fogTint: current.fogTint.getHexString(),
    zenith: current.zenith.getHexString(),
    warm: current.warm.map((v) => +v.toFixed(3)),
  };
}
