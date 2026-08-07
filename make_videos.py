#!/usr/bin/env python3
"""
Pharma Video Generator - Complete Batch HD Version
- Processes all 78 optimized scripts in G:/GMP Pharma/video-scripts-optimized/
- Multi-Slide HD Rendering: 1920x1080 resolution, card containers, section badges, dark navy/teal aesthetic.
- Generates synced audio and outputs final MP4 videos in G:/GMP Pharma/videos/final/
"""

import os
import sys
import re
import subprocess
import shutil
import time
import textwrap
from pathlib import Path
from datetime import datetime

# ========== CONFIGURATION ==========
FOLDER = Path("G:/GMP Pharma")
SCRIPTS = FOLDER / "video-scripts-optimized"
OUTPUT = FOLDER / "videos" / "final"
TEMP_DIR = FOLDER / "videos" / "temp"

OUTPUT.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)

LOGS = FOLDER / "logs"
LOGS.mkdir(parents=True, exist_ok=True)

W, H = 1920, 1080
BG_COLOR = (11, 19, 43)        # #0B132B Deep Navy
CARD_BG = (28, 42, 72)         # #1C2A48 Card Container
TEAL = (0, 230, 195)          # #00E6C3 Mint Teal Accent
GOLD = (244, 196, 48)         # #F4C430 Gold Accent
WHITE = (255, 255, 255)
LIGHT_BLUE = (210, 225, 245)
FOOTER_TEXT = "GMP Pharma Pro Academy • Professional Training Module"

# ========== DEPENDENCIES ==========
try:
    from gtts import gTTS
except ImportError:
    print("❌ gTTS missing: pip install gTTS")
    sys.exit(1)

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("❌ Pillow missing: pip install pillow")
    sys.exit(1)

def find_ffmpeg():
    which = shutil.which("ffmpeg")
    if which:
        return which
    possible = [
        "ffmpeg",
        "ffmpeg.exe",
        "C:/ffmpeg/bin/ffmpeg.exe",
        "C:/Program Files/ffmpeg/bin/ffmpeg.exe",
        str(Path.home() / "AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"),
    ]
    for p in possible:
        if p and Path(p).exists():
            return p
    return None

FFMPEG = find_ffmpeg()

def parse_markdown_sections(script_path):
    """Parse Markdown file into multi-slide section blocks"""
    content = script_path.read_text(encoding='utf-8')
    lines = content.split('\n')

    title = "Pharmaceutical Training Module"
    sections = []
    
    current_sec_title = "Overview"
    current_sec_lines = []

    for line in lines:
        line_str = line.strip()
        if not line_str:
            continue
        
        if line_str.startswith("# "):
            title = line_str.lstrip('# ').strip()
        elif line_str.startswith("## "):
            if current_sec_lines:
                sections.append((current_sec_title, current_sec_lines))
                current_sec_lines = []
            current_sec_title = line_str.lstrip('## ').strip()
        elif line_str.startswith("> "):
            continue
        else:
            current_sec_lines.append(line_str)

    if current_sec_lines:
        sections.append((current_sec_title, current_sec_lines))

    if not sections:
        sections = [("Overview", ["Welcome to this training module."])]

    return title, sections

def create_slide_image(main_title, sec_title, sec_lines, slide_idx, total_slides, output_path):
    """Render high quality 1920x1080 slide graphic using Pillow"""
    img = Image.new("RGB", (W, H), BG_COLOR)
    draw = ImageDraw.Draw(img)

    font_paths = [
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/tahoma.ttf",
    ]
    
    f_title = f_sec = f_body = f_small = None

    for fp in font_paths:
        if Path(fp).exists():
            try:
                f_title = ImageFont.truetype(fp, 36)
                f_sec = ImageFont.truetype(fp, 52)
                f_body = ImageFont.truetype(fp, 34)
                f_small = ImageFont.truetype(fp, 24)
                break
            except:
                pass

    if not f_title:
        f_title = f_sec = f_body = f_small = ImageFont.load_default()

    # Header Bar
    draw.rectangle([0, 0, W, 90], fill=(16, 26, 54))
    draw.rectangle([0, 86, W, 90], fill=TEAL)

    # Title
    t_text = main_title if len(main_title) < 70 else main_title[:67] + "..."
    draw.text((60, 24), t_text, fill=WHITE, font=f_title)

    # Slide Badge
    badge_str = f"Slide {slide_idx} of {total_slides}"
    draw.rounded_rectangle([W - 240, 20, W - 60, 68], radius=10, fill=CARD_BG, outline=TEAL, width=2)
    draw.text((W - 220, 32), badge_str, fill=TEAL, font=f_small)

    # Section Title
    draw.text((80, 130), sec_title, fill=TEAL, font=f_sec)
    draw.rectangle([80, 200, 350, 204], fill=GOLD)

    # Content Container
    draw.rounded_rectangle([80, 230, W - 80, H - 100], radius=20, fill=CARD_BG, outline=(40, 60, 100), width=2)

    # Text Body Rendering
    y = 270
    max_y = H - 140
    
    for item in sec_lines:
        if y >= max_y:
            break

        is_bullet = item.startswith("-")
        clean_item = re.sub(r'^[\-\*\•]\s*', '', item)
        clean_item = clean_item.replace('**', '')

        wrap_w = 68 if is_bullet else 75
        wrapped = textwrap.wrap(clean_item, width=wrap_w)

        for line_idx, w_line in enumerate(wrapped):
            if y >= max_y:
                break

            if is_bullet and line_idx == 0:
                draw.ellipse([120, y + 10, 134, y + 24], fill=GOLD)
                draw.text((150, y), w_line, fill=WHITE, font=f_body)
            elif is_bullet:
                draw.text((150, y), w_line, fill=LIGHT_BLUE, font=f_body)
            else:
                draw.text((120, y), w_line, fill=WHITE, font=f_body)

            y += 48
            
        y += 10

    # Footer
    draw.rectangle([0, H - 60, W, H], fill=(16, 26, 54))
    draw.text((80, H - 42), FOOTER_TEXT, fill=(120, 145, 175), font=f_small)

    img.save(output_path)
    return True

def generate_section_audio(text, audio_path):
    try:
        if audio_path.exists():
            audio_path.unlink()
        
        clean_txt = re.sub(r'[#\*\_`\-\>]', ' ', text)
        clean_txt = re.sub(r'\s+', ' ', clean_txt).strip()

        if len(clean_txt) < 5:
            clean_txt = "Overview of section."

        gTTS(text=clean_txt, lang='en', slow=False).save(str(audio_path))
        return audio_path.exists() and audio_path.stat().st_size > 0
    except Exception as e:
        print(f"  ⚠️ Audio TTS error: {e}")
        return False

def render_section_video_ffmpeg(slide_img, audio_mp3, output_mp4):
    if not FFMPEG:
        return False
    cmd = [
        FFMPEG, "-y",
        "-loop", "1",
        "-i", str(slide_img),
        "-i", str(audio_mp3),
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        str(output_mp4)
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.returncode == 0 and output_mp4.exists()

def concatenate_clips_ffmpeg(clip_paths, final_output_path):
    if not FFMPEG:
        return False

    list_file = TEMP_DIR / f"concat_{final_output_path.stem}.txt"
    with open(list_file, 'w', encoding='utf-8') as f:
        for c in clip_paths:
            f.write(f"file '{c.resolve().as_posix()}'\n")

    cmd = [
        FFMPEG, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(list_file),
        "-c", "copy",
        str(final_output_path)
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if list_file.exists():
        list_file.unlink()
    return res.returncode == 0 and final_output_path.exists()

def process_single_script(script_path):
    out_video = OUTPUT / f"{script_path.stem}.mp4"
    if out_video.exists():
        print(f"  ⏭️ SKIP: {out_video.name} (already rendered)")
        return True

    print(f"  🎬 RENDERING: {script_path.name}")
    start_t = time.time()

    main_title, sections = parse_markdown_sections(script_path)
    total_slides = len(sections)

    section_clips = []

    for i, (sec_title, sec_lines) in enumerate(sections, 1):
        slide_img = TEMP_DIR / f"{script_path.stem}_slide_{i}.png"
        audio_mp3 = TEMP_DIR / f"{script_path.stem}_audio_{i}.mp3"
        sec_mp4 = TEMP_DIR / f"{script_path.stem}_sec_{i}.mp4"

        create_slide_image(main_title, sec_title, sec_lines, i, total_slides, slide_img)

        sec_narration = f"{sec_title}. " + " ".join(sec_lines)
        if not generate_section_audio(sec_narration, audio_mp3):
            print(f"  ❌ Failed TTS audio for slide {i}")
            return False

        if not render_section_video_ffmpeg(slide_img, audio_mp3, sec_mp4):
            print(f"  ❌ Failed FFmpeg render for slide {i}")
            return False

        section_clips.append(sec_mp4)

    success = concatenate_clips_ffmpeg(section_clips, out_video)

    for clip in section_clips:
        if clip.exists():
            clip.unlink()

    if success:
        dur = time.time() - start_t
        print(f"  ✅ SUCCESS: {out_video.name} ({dur:.1f}s, {total_slides} slides)")
        return True
    else:
        print(f"  ❌ Concatenation failed for {script_path.name}")
        return False

def main():
    print("=" * 70)
    print("PHARMA FULL BATCH MULTI-SLIDE HD VIDEO GENERATOR")
    print("=" * 70)

    scripts = sorted(SCRIPTS.glob("*.md"))
    if not scripts:
        print("❌ No scripts found in", SCRIPTS)
        return

    print(f"Processing all {len(scripts)} scripts...\n")

    success_count = 0
    for i, s in enumerate(scripts, 1):
        print(f"[{i}/{len(scripts)}]")
        if process_single_script(s):
            success_count += 1
        print()

    print("=" * 70)
    print(f"Full Batch Complete: {success_count}/{len(scripts)} successful!")
    print(f"Generated videos saved in: {OUTPUT}")
    print("=" * 70)

if __name__ == "__main__":
    main()
