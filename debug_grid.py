"""Draw a labeled grid over the team slide so we can read exact pixel coords."""
from PIL import Image, ImageDraw, ImageFont
import os

OUT  = "/Users/gaura1/RoboRaptors Website/images"
img  = Image.open(f"{OUT}/team-slide-raw.png").convert("RGBA")
W, H = img.size   # 2400 x 3106

overlay = img.copy()
draw    = ImageDraw.Draw(overlay)

STEP = 200   # grid line every 200 px

# Vertical lines + x labels
for x in range(0, W, STEP):
    draw.line([(x, 0), (x, H)], fill=(255, 0, 100, 120), width=2)
    draw.text((x+4, 4), str(x), fill=(255, 0, 100, 220))

# Horizontal lines + y labels
for y in range(0, H, STEP):
    draw.line([(0, y), (W, y)], fill=(255, 0, 100, 120), width=2)
    draw.text((4, y+4), str(y), fill=(255, 0, 100, 220))

# Downscale to 800px wide so it's easy to view
scale = 800 / W
out_h = int(H * scale)
small = overlay.resize((800, out_h), Image.LANCZOS)
small.save(f"{OUT}/team-grid-debug.png")
print(f"Saved team-grid-debug.png  ({800}x{out_h})")
