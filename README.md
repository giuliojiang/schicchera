# schicchera

3D physics collectathon for a game jam. Theme constraint: **No Text** — the
game guides only through visuals, sound, and physics behavior.

Spec: [issue #1](https://github.com/giuliojiang/schicchera/issues/1)

## Current state: movement core + world

Cube character with a face, orbit-to-aim follow camera, charge-and-flick movement
(quadratic charge, additive velocity, speed clamp), ground/air drag switching,
fixed-timestep physics, full hub-and-spoke world (village hub, beach, forest,
mountain pass, boss arena), dressed village (7 huts, plaza, props, pier,
gates), collectible weapons that attach with mass + colliders, per-zone fog,
synthesized audio, `?debug=1` state bridge. No build step.

## Run it

```sh
cd schicchera
node serve.mjs 8765
```

Open http://127.0.0.1:8765/ in a browser.

## Controls

- **A / D** — orbit the camera around the cube (this is the aim)
- **Space / Enter** — hold to charge, release to flick

Debug hooks: `?debug=1` exposes `window.__GAME__` (snapshot, `step()`,
`setSeed()`); `?autoplay&seed=N` runs a scripted input loop.
