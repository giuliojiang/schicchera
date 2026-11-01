# schicchera

3D physics collectathon for a game jam. Theme constraint: **No Text** — the
game guides only through visuals, sound, and physics behavior.

Spec: [issue #1](https://github.com/giuliojiang/schicchera/issues/1)

## Current state: movement core + world

Cubebot character (`blend/cubebot.glb`, async load with legacy-cube fallback),
orbit-to-aim follow camera with raycast collision pull-in, charge-and-flick movement
(quadratic charge, additive velocity, speed clamp), ground/air drag switching,
fixed-timestep physics, full hub-and-spoke world (village hub, beach, forest,
mountain pass, volcanic crater arena), Brutalist village (7 concrete monoliths
13-20x cube height with base reveals, vertical slots and roof bulkheads, gate
pylons and street towers, landmark towers — one Blender-modelled hero tower —
full-length east/shore-road canyon bars with setback tiers, channeled stream,
slab bridge, monolith pedestal, plaza, props, pier, gates; Blender-baked
board-formed concrete), terraced beach
(layered shelves, switchback ramps, gentle/steep fork,
sword cove, shore dressing, pier), navigable forest grove (thicket walls,
4 clearings, winding paths, slalom shortcut, pond, lookout hill, giant tree,
hammer grove, stream with bridge and stepping stones), collectible weapons
that attach with mass + colliders, bump-attacking ball boss with a
momentum-rules fight (wind-up telegraphs, piece loss, win/lose icon screens,
victory boss-ball attach), per-zone fog, synthesized audio plus a layered
180 s music track (base bed + one stem per weapon; the mix thickens with HP),
mirrored visual layers (gloom-to-gold fullscreen grade + fog + gradient sky,
keyed to held weapons: gray haze, then light, then yellows, then gold),
`?debug=1` state bridge, Futurism force lines (ghost echoes, flick streaks,
wind-up lines, roll/whoosh noise — visual-only, past motion only), edge safety
net (sea/lava/fall/out-of-bounds respawn at the last grounded spot with a
fade and a camera-anchor snap, never damage) with diegetic outer boundaries
(pass cliffs, village hedges, forest rim thicket, shore rock lip, arena ring;
invisible backstops behind the dressing). No build step.

## Run it

```sh
cd schicchera
node serve.mjs 8765
```

Open http://127.0.0.1:8765/ in a browser.

## Controls

- **A / D** — orbit the camera around the cube (this is the aim)
- **Space / Enter** — hold to charge, release to flick
- **M** or the speaker icon (top right) — mute music + SFX together

Debug hooks: `?debug=1` exposes `window.__GAME__` (snapshot, `step()`,
`setSeed()`); `?autoplay&seed=N` runs a scripted input loop;
`?at=x,z[,y]&orbit=rad` overrides the spawn for level inspection;
`?sim=N[&script=win|trade|moatout|cliff]` runs N fixed steps headlessly and
reports the outcome in `<title>` (win = scripted victory, trade = scripted
piece loss, moatout = arena-exit respawn check, cliff = cliff-face
impassability check; the title also reports the last respawn reason).
