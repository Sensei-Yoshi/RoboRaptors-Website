"""
Final calibrated extraction — all coords in full-image pixels (2400x3106).
Determined by visual inspection of horizontal band debug images.
"""
from PIL import Image, ImageDraw
import os, glob

OUT   = "/Users/gaura1/RoboRaptors Website/images"
TEAM  = Image.open(f"{OUT}/team-slide-raw.png").convert("RGBA")
COVER = Image.open(f"{OUT}/cover-slide-raw.png").convert("RGBA")

# ── circle crop helper ──────────────────────────────────────────────
def circle_crop(src, cx, cy, r, path, out_size=300):
    box     = (cx-r, cy-r, cx+r, cy+r)
    crop    = src.crop(box)
    mask    = Image.new("L", crop.size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0, crop.width-1, crop.height-1), fill=255)
    result  = Image.new("RGBA", crop.size, (0, 0, 0, 0))
    result.paste(crop, mask=mask)
    result.resize((out_size, out_size), Image.LANCZOS).save(path)
    print(f"  ✓  {os.path.basename(path)}")

def rect_crop(src, x1, y1, x2, y2, path):
    src.crop((x1, y1, x2, y2)).save(path)
    print(f"  ✓  {os.path.basename(path)}")

# ── Team member photos ──────────────────────────────────────────────
# All coords measured from band debug images (band_start + display_px * 3)
# Radius = 114 px (38 display * 3 scale)
R = 114

members = [
    # name              cx     cy
    # Programming Squad  (visible in build_sq_r1 band y=800-1150)
    ("ansh",            180,   941),
    ("ishaal",         1380,   941),
    # Build Squad row 1  (build_sq_r2 band y=1150-1500)
    ("kush",            186,  1339),
    ("aadi",           1386,  1339),
    # Build Squad row 2  (build_captain band y=1500-1850)
    ("swasti",          165,  1581),
    ("sid",            1362,  1581),
    # Sanjay — captain   (sanjay_out band y=2100-2450)
    ("sanjay",          165,  2145),
    # Outreach Squad     (avi_sash band y=2450-2900)
    ("avi",             171,  2615),
    ("sash",           1365,  2720),
]

print("Extracting team photos...")
for name, cx, cy in members:
    circle_crop(TEAM, cx, cy, R, f"{OUT}/member_{name}.png")

# ── RoboRaptors logo ───────────────────────────────────────────────
# Bottom-right of cover slide: full coords (1881,2660)→(2400,3106)
print("\nExtracting logo...")
rect_crop(COVER, 1860, 2620, 2400, 3106, f"{OUT}/logo.png")

# ── Clean up debug files ───────────────────────────────────────────
for f in glob.glob(f"{OUT}/debug_*.png") + glob.glob(f"{OUT}/team-grid-debug.png"):
    os.remove(f)
    print(f"  🗑  removed {os.path.basename(f)}")

print("\nDone! Final images:")
for f in sorted(os.listdir(OUT)):
    if not f.endswith("-raw.png") and not f.endswith(".py"):
        print(f"  {f}")
