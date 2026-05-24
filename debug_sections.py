"""Crop key horizontal bands to identify exact face positions."""
from PIL import Image, ImageDraw
import os

OUT  = "/Users/gaura1/RoboRaptors Website/images"
img  = Image.open(f"{OUT}/team-slide-raw.png").convert("RGBA")
W, H = img.size  # 2400 x 3106

def save_band(y1, y2, name):
    band = img.crop((0, y1, W, y2)).resize((800, int((y2-y1)*800/W)), Image.LANCZOS)
    path = f"{OUT}/debug_{name}.png"
    band.save(path)
    print(f"Saved {name}  y={y1}-{y2}")

# Bands covering each squad's photo row
save_band(400,  750, "prog_squad")      # Programming Squad photos
save_band(800, 1150, "build_sq_r1")    # Build Squad row 1
save_band(1150, 1500, "build_sq_r2")   # Build Squad row 2
save_band(1500, 1850, "build_captain") # Sanjay / Build Captain
save_band(1850, 2200, "outreach")      # Outreach Squad
