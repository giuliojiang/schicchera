# Brutalist village assets (rebuildable): tileable board-formed concrete
# color+bump textures, hero landmark tower .glb, preview render, .blend.
# Idempotent: rerunning reproduces everything (seeded Random).
# Usage: blender -b --factory-startup --python-exit-code 1 -P village_brutalist.py
import sys
import os
import random
import struct
import zlib

SKILL = "/home/gj/.local/share/muse/skills/bundled/muse-core~v1/skills/blender/scripts"
sys.path.insert(0, SKILL)
import bpy_helpers as H
import bpy
import bmesh

HERE = os.path.dirname(os.path.abspath(__file__))
COLOR_PNG = os.path.join(HERE, "village_concrete.png")
BUMP_PNG = os.path.join(HERE, "village_concrete_bump.png")
TOWER_GLB = os.path.join(HERE, "tower_nw.glb")
BLEND_OUT = os.path.join(HERE, "village_brutalist.blend")
PREVIEW = "/tmp/tower_preview.png"

P = {
    "seed": 1401,
    "tile_m": 6.0,          # world metres covered by one texture tile
    "tex_size": 1024,
    "bump_size": 512,
    # tower_nw collider: 3 x 18 x 3 at (-11, -18); origin = base centre
    "tower": {"s": 3.0, "h": 18.0},
}

# ---------------------------------------------------------------- PNG writer
def write_png(path, w, h, buf):
    def chunk(typ, data):
        c = struct.pack(">I", len(data)) + typ + data
        return c + struct.pack(">I", zlib.crc32(typ + data) & 0xFFFFFFFF)
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        raw += bytes(buf[y * w * 3:(y + 1) * w * 3])
    open(path, "wb").write(
        b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 6)) + chunk(b"IEND", b""))


def paint_concrete(size, seed, bump=False):
    rng = random.Random(seed)
    S = size
    buf = bytearray(S * S * 3)
    base = 128 if bump else 155
    baseg = 128 if bump else 151
    for i in range(0, S * S * 3, 3):
        buf[i] = base
        buf[i + 1] = base
        buf[i + 2] = baseg

    def px(x, y):
        return ((y % S) * S + (x % S)) * 3

    def rect(x, y, w, h, rgb, a):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                i = px(xx, yy)
                for c in range(3):
                    buf[i + c] = int(buf[i + c] * (1 - a) + rgb[c] * a)

    # large soft tonal patches (wrapped)
    for _ in range(40):
        w = rng.randint(100, 400) * S // 1024
        h = rng.randint(100, 400) * S // 1024
        x = rng.randint(0, S - 1)
        y = rng.randint(0, S - 1)
        light = rng.random() < 0.5
        v = (150 if bump else 175) if light else (105 if bump else 132)
        g = v - (4 if not bump and not light else 0)
        for ox, oy in ((0, 0), (-S, 0), (S, 0), (0, -S), (0, S)):
            rect(x + ox, y + oy, w, h, (v, v, g), 0.10)

    row = 36 * S // 1024  # formwork board height
    # horizontal board lines
    for y in range(0, S, row):
        for xx in range(S):
            i = px(xx, y)
            for c in range(3):
                buf[i + c] = int(buf[i + c] * 0.88)
            if not bump and y + 1 < S:
                i2 = px(xx, y + 1)
                for c in range(3):
                    v = buf[i2 + c] + 10
                    buf[i2 + c] = 255 if v > 255 else v
    # board end joints, staggered per row
    r = 0
    for y in range(0, S, row):
        for k in range(2):
            x = (r * 97 + k * 131 + 40) % S
            for yy in range(y, min(y + row, S)):
                i = px(x, yy)
                for c in range(3):
                    buf[i + c] = int(buf[i + c] * 0.90)
        r += 1
    # formwork tie holes on a wrapped grid
    step = 128 * S // 1024
    for ty in range(step // 2, S, step):
        for tx in range(step // 2, S, step):
            ox = tx + (step // 2 if (ty // step) % 2 else 0)
            for dy in range(-5 * S // 1024, 6 * S // 1024):
                for dx in range(-5 * S // 1024, 6 * S // 1024):
                    d = (dx * dx + dy * dy) ** 0.5
                    rr = 5 * S / 1024
                    if d < rr:
                        i = px(int(ox + dx), int(ty + dy))
                        a = 0.35 if d < rr * 0.45 else 0.22
                        for c in range(3):
                            buf[i + c] = int(buf[i + c] * (1 - a))
    # faint vertical weathering streaks (wrapped in x)
    for _ in range(60):
        x = rng.randint(0, S - 1)
        w = rng.randint(3, 8) * S // 1024
        h = rng.randint(200, S)
        y0 = rng.randint(0, S - 1)
        for yy in range(y0, y0 + h):
            for xx in range(x, x + w):
                i = px(xx, yy)
                for c in range(3):
                    buf[i + c] = int(buf[i + c] * 0.95)
    # fine grain
    amp = 8 if bump else 5
    for i in range(0, S * S * 3, 3):
        n = rng.randint(-amp, amp)
        for c in range(3):
            v = buf[i + c] + n
            buf[i + c] = 0 if v < 0 else (255 if v > 255 else v)
    return buf


# ------------------------------------------------------- worldscale box UVs
def box_uv_worldscale(obj, scale):
    mesh = obj.data
    if not mesh.uv_layers:
        mesh.uv_layers.new(name="UVMap")
    uv = mesh.uv_layers.active.data
    for poly in mesh.polygons:
        n = poly.normal
        ax = max(range(3), key=lambda a: abs(n[a]))
        for li in poly.loop_indices:
            co = mesh.vertices[mesh.loops[li].vertex_index].co
            if ax == 0:
                u, v = co.y / scale, co.z / scale
            elif ax == 1:
                u, v = co.x / scale, co.z / scale
            else:
                u, v = co.x / scale, co.y / scale
            uv[li].uv = (u, v)


# ---------------------------------------------------------------- materials
def concrete_material(color_png, bump_png):
    mat = H.material("BrutConcrete", "#9b9b97", roughness=0.9, metallic=0.0)
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = next(n for n in nodes if n.type == "BSDF_PRINCIPLED")
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(color_png)
    tex.image.colorspace_settings.name = "sRGB"
    tex.interpolation = "Linear"
    links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    btex = nodes.new("ShaderNodeTexImage")
    btex.image = bpy.data.images.load(bump_png)
    btex.image.colorspace_settings.name = "Non-Color"
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.5
    links.new(btex.outputs["Color"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    tex.location = (-600, 300)
    btex.location = (-600, -100)
    bump.location = (-300, 0)
    return mat


# ------------------------------------------------------------------- tower
def build_tower(concrete, dark, leaf):
    s = P["tower"]["s"]
    f = s / 2  # face offset
    conc, dk = [], []
    B = lambda name, size, loc, m, bev=0.0: (conc if m == concrete else dk).append(
        H.add_box(name, size=size, location=loc, mat=m, bevel=bev))
    B("plinth", (3.4, 3.4, 0.5), (0, 0, 0.25), concrete, 0.04)
    B("shaft", (3.0, 3.0, 13.5), (0, 0, 7.25), concrete, 0.05)
    B("reveal", (3.04, 3.04, 0.5), (0, 0, 0.75), dark)
    B("crown", (2.4, 2.4, 2.6), (0, 0, 15.3), concrete, 0.05)
    B("cap", (3.2, 3.2, 0.4), (0, 0, 16.8), concrete, 0.04)
    B("core", (1.3, 1.3, 1.2), (0, 0, 17.6), concrete, 0.04)
    for sx in (-1.3, 1.3):
        for sy in (-1.3, 1.3):
            B("pier", (0.5, 0.5, 3.0), (sx, sy, 1.5), concrete, 0.03)
    # inset window panels + sill fins + full-height slot, per face
    for side in range(4):
        ang = side * 90.0
        import math
        fx = math.sin(math.radians(ang))
        fy = math.cos(math.radians(ang))
        for wx in (-0.62, 0.62):
            # across-face offset (perpendicular to the face normal)
            ax = fx * (f - 0.03) + (-fy) * wx
            ay = fy * (f - 0.03) + (fx) * wx
            for wy in (4.2, 5.88, 7.56, 9.24, 10.92, 12.6):
                dk.append(H.add_box("win", size=(0.7, 0.1, 0.9),
                                    location=(ax, ay, wy), rotation=(0, 0, ang), mat=dark))
                conc.append(H.add_box("fin", size=(1.9, 0.22, 0.18),
                                      location=(fx * f, fy * f, wy - 0.62),
                                      rotation=(0, 0, ang), mat=concrete, bevel=0.02))
        dk.append(H.add_box("slot", size=(0.5, 0.1, 9.6),
                            location=(fx * (f - 0.03), fy * (f - 0.03), 8.2),
                            rotation=(0, 0, ang), mat=dark))
    bush = H.add_sphere("bush", radius=0.5, location=(0.6, -0.4, 18.35),
                        scale=(1.0, 1.0, 0.76), mat=leaf, segments=10, rings=6)
    return conc, dk, bush


def main():
    H.reset_scene()
    print("painting concrete textures...")
    write_png(COLOR_PNG, P["tex_size"], P["tex_size"],
              paint_concrete(P["tex_size"], P["seed"]))
    write_png(BUMP_PNG, P["bump_size"], P["bump_size"],
              paint_concrete(P["bump_size"], P["seed"] + 7, bump=True))
    print("textures saved")

    concrete = concrete_material(COLOR_PNG, BUMP_PNG)
    dark = H.material("BrutDark", "#17191c", roughness=0.92, metallic=0.0)
    leaf = H.material("BrutLeaf", "#5a703f", roughness=0.95, metallic=0.0)

    conc, dk, bush = build_tower(concrete, dark, leaf)
    tower_conc = H.join(conc, name="TowerConcrete")
    tower_dark = H.join(dk, name="TowerDark")
    for o in (tower_conc, tower_dark):
        box_uv_worldscale(o, P["tile_m"])
    print("tower tris:", len(tower_conc.data.polygons) + len(tower_dark.data.polygons))

    # export selected only
    bpy.ops.object.select_all(action="DESELECT")
    for o in (tower_conc, tower_dark, bush):
        o.select_set(True)
    bpy.context.view_layer.objects.active = tower_conc
    bpy.ops.export_scene.gltf(filepath=TOWER_GLB, export_format="GLB",
                              use_selection=True, export_yup=True)
    print("exported", TOWER_GLB, os.path.getsize(TOWER_GLB), "bytes")

    # preview: ground + sun + framed camera, EEVEE quick
    ground = H.add_box("ground", size=(60, 60, 0.2), location=(0, 0, -0.1),
                       mat=H.material("GroundWarm", "#ada07c", roughness=1.0))
    H.sun_and_sky(elevation=42.0, azimuth=140.0)
    cam = H.add_camera("Cam", location=(14, -16, 9), target=(0, 0, 8), lens=35.0)
    H.set_render(engine="BLENDER_EEVEE", resolution=(900, 900), samples=64,
                 percentage=100, denoise=False)
    H.render_still(PREVIEW, camera=cam)
    H.save_blend(BLEND_OUT)
    H.report()
    print("DONE preview:", PREVIEW)


main()
