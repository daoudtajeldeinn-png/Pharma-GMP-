#!/usr/bin/env python3
"""
Pharma Video Generator - ENGLISH VERSION
Fixed: English only audio, no language mixing, professional output
"""

import os
import sys
import re
import subprocess
import shutil
import time
from pathlib import Path
from datetime import datetime

# ========== CONFIGURATION ==========
FOLDER = Path("G:/GMP Pharma")

if not FOLDER.exists():
    print("ERROR: Folder not found:", FOLDER)
    sys.exit(1)

SCRIPTS = FOLDER / "video-scripts"
OUTPUT = FOLDER / "videos" / "final"
OUTPUT.mkdir(parents=True, exist_ok=True)

LOGS = FOLDER / "logs"
LOGS.mkdir(parents=True, exist_ok=True)

print("=" * 70)
print("PHARMA VIDEO GENERATOR - ENGLISH VERSION")
print("=" * 70)
print(f"Scripts: {SCRIPTS}")
print(f"Output:  {OUTPUT}")
print(f"Logs:    {LOGS}")

# ========== FIND FFMPEG ==========
def find_ffmpeg():
    """Find FFmpeg executable"""
    possible_paths = [
        "ffmpeg",
        "ffmpeg.exe",
        "C:/ffmpeg/bin/ffmpeg.exe",
        "C:/Program Files/ffmpeg/bin/ffmpeg.exe",
        "C:/Program Files (x86)/ffmpeg/bin/ffmpeg.exe",
        "C:/ProgramData/chocolatey/bin/ffmpeg.exe",
        str(Path.home() / "AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"),
        str(Path.home() / "scoop/shims/ffmpeg.exe"),
    ]
    
    which_ffmpeg = shutil.which("ffmpeg")
    if which_ffmpeg:
        possible_paths.insert(0, which_ffmpeg)
    
    for p in possible_paths:
        if p and Path(p).exists():
            return p
    
    try:
        result = subprocess.run(["where", "ffmpeg"], capture_output=True, text=True)
        if result.returncode == 0:
            paths = result.stdout.strip().split('\n')
            if paths:
                return paths[0]
    except:
        pass
    
    return None

FFMPEG = find_ffmpeg()

if FFMPEG:
    print(f"✅ FFmpeg found at: {FFMPEG}")
else:
    print("⚠️ FFmpeg not found, will use MoviePy only")

# ========== CHECK DEPENDENCIES ==========
deps_ok = True

try:
    from gtts import gTTS
    print("✅ gTTS")
except ImportError:
    print("❌ gTTS missing: pip install gTTS")
    deps_ok = False

try:
    from moviepy import ImageClip, AudioFileClip
    from PIL import Image, ImageDraw, ImageFont
    print("✅ MoviePy + Pillow")
except ImportError as e:
    print(f"❌ MoviePy/Pillow missing: pip install moviepy pillow")
    deps_ok = False

if not deps_ok:
    print("\n❌ Missing dependencies. Please install them and try again.")
    sys.exit(1)

import textwrap

# ========== VIDEO SETTINGS ==========
W, H = 1920, 1080
BG = "#0A1628"
TEAL = "#00D4AA"
GOLD = "#C9A84C"

# ========== SCRIPT PROCESSING ==========
def get_scripts():
    """Get all scripts - English only"""
    scripts = sorted(SCRIPTS.glob("*-en-pro.md"))
    return scripts

def extract_content(text):
    """Extract clean content from script - ENGLISH ONLY"""
    lines = text.split('\n')
    
    title = ""
    for line in lines[:5]:
        if line.startswith('#') and line.strip():
            title = line.lstrip('#').strip()
            break
    if not title:
        title = "Pharma Training Video"
    
    body_lines = []
    skip_patterns = ['Speaker Notes:', 'ملاحظات للمتحدث:', '---']
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if any(pattern in line for pattern in skip_patterns):
            continue
        if line.startswith('#'):
            continue
        # Remove markdown formatting
        line = re.sub(r'[#*_`]', '', line)
        body_lines.append(line)
    
    body = ' '.join(body_lines)
    
    # ENGLISH ONLY - no Arabic text
    if len(body) < 50:
        body = f"Welcome to {title}. This video covers an important topic in pharmaceutical quality and compliance."
    
    return title, body

def create_audio(text, audio_path, lang="en"):
    """Create audio with error handling - ENGLISH ONLY"""
    try:
        # Ensure directory exists
        audio_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Clean up any existing file
        if audio_path.exists():
            try:
                audio_path.unlink()
            except:
                pass
        
        # Split long text
        if len(text) > 5000:
            chunks = [text[i:i+5000] for i in range(0, len(text), 5000)]
            temp_files = []
            
            for i, chunk in enumerate(chunks):
                temp_path = audio_path.parent / f"{audio_path.stem}_part{i}.mp3"
                gTTS(text=chunk, lang=lang, slow=False).save(str(temp_path))
                temp_files.append(temp_path)
            
            if len(temp_files) > 1:
                try:
                    from pydub import AudioSegment
                    combined = AudioSegment.empty()
                    for f in temp_files:
                        combined += AudioSegment.from_mp3(str(f))
                    combined.export(str(audio_path), format="mp3")
                    for f in temp_files:
                        try:
                            f.unlink()
                        except:
                            pass
                except:
                    if temp_files:
                        shutil.move(str(temp_files[0]), str(audio_path))
            else:
                if temp_files:
                    shutil.move(str(temp_files[0]), str(audio_path))
        else:
            gTTS(text=text, lang=lang, slow=False).save(str(audio_path))
        
        # Verify file was created
        if audio_path.exists() and audio_path.stat().st_size > 0:
            return True
        else:
            return False
            
    except Exception as e:
        print(f"  ⚠️ Audio error: {e}")
        return False

def create_slide(title, body, slide_path):
    """Create a professional slide - ENGLISH ONLY"""
    font_paths = [
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/tahoma.ttf",
    ]
    
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    
    font_large = None
    font_normal = None
    font_small = None
    
    for fp in font_paths:
        if Path(fp).exists():
            try:
                font_large = ImageFont.truetype(fp, 55)
                font_normal = ImageFont.truetype(fp, 40)
                font_small = ImageFont.truetype(fp, 30)
                break
            except:
                continue
    
    if not font_large:
        font_large = ImageFont.load_default()
        font_normal = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Title bar
    draw.rectangle([0, 0, W, 8], fill=TEAL)
    
    # Title
    title_text = title[:80] + "..." if len(title) > 80 else title
    draw.text((80, 60), title_text, fill=TEAL, font=font_large)
    draw.rectangle([80, 130, 400, 134], fill=GOLD)
    
    # Body text - English only
    body_clean = re.sub(r'[#*_`]', '', body)
    if len(body_clean) > 3000:
        body_clean = body_clean[:3000] + "..."
    
    wrapped_lines = textwrap.wrap(body_clean, width=55)
    max_lines = 20
    if len(wrapped_lines) > max_lines:
        wrapped_lines = wrapped_lines[:max_lines-1] + ["..."]
    
    y = 180
    line_height = 45
    
    for line in wrapped_lines:
        draw.text((80, y), line, fill="white", font=font_normal)
        y += line_height
    
    # Footer
    draw.text((80, H - 60), "PharmaPro Academy", fill="#2a3a4a", font=font_small)
    img.save(slide_path)
    return True

def create_video(slide_path, audio_path, output_path):
    """Create video with fallback methods"""
    try:
        # Verify files exist
        if not slide_path.exists():
            print(f"  Slide not found: {slide_path}")
            return False
        if not audio_path.exists():
            print(f"  Audio not found: {audio_path}")
            return False
        
        # Try MoviePy first
        try:
            audio = AudioFileClip(str(audio_path))
            slide_clip = ImageClip(str(slide_path)).with_duration(audio.duration)
            video = slide_clip.with_audio(audio)
            
            # Write video file
            video.write_videofile(
                str(output_path),
                fps=24,
                codec='libx264',
                audio_codec='aac'
            )
            audio.close()
            video.close()
            return True
        except Exception as e:
            print(f"  MoviePy error: {e}")
            
            # Try FFmpeg directly if MoviePy fails
            if FFMPEG:
                try:
                    cmd = [
                        FFMPEG,
                        "-y",
                        "-loop", "1",
                        "-i", str(slide_path),
                        "-i", str(audio_path),
                        "-c:v", "libx264",
                        "-tune", "stillimage",
                        "-c:a", "aac",
                        "-b:a", "192k",
                        "-pix_fmt", "yuv420p",
                        "-shortest",
                        str(output_path)
                    ]
                    result = subprocess.run(cmd, capture_output=True, text=True)
                    if result.returncode == 0:
                        return True
                    else:
                        print(f"  FFmpeg error: {result.stderr}")
                        return False
                except Exception as e2:
                    print(f"  FFmpeg error: {e2}")
                    return False
            else:
                return False
            
    except Exception as e:
        print(f"  Video creation error: {e}")
        return False

def process_script(script_path, output_dir, logs_dir):
    """Process a single script"""
    output_path = output_dir / f"{script_path.stem}.mp4"
    log_file = logs_dir / f"{script_path.stem}.log"
    
    # Skip if output exists
    if output_path.exists():
        print(f"  ⏭️ SKIP: {output_path.name} (already exists)")
        return True
    
    print(f"  🎬 PROCESSING: {script_path.name}")
    start_time = time.time()
    
    # Create temp paths
    audio_path = output_dir / f"{script_path.stem}.mp3"
    slide_path = output_dir / f"{script_path.stem}.png"
    
    # Clean up any old temp files
    for temp_file in [audio_path, slide_path]:
        if temp_file.exists():
            try:
                temp_file.unlink()
            except:
                pass
    
    try:
        # Read and parse script
        text = script_path.read_text(encoding="utf-8")
        title, body = extract_content(text)
        
        # Create audio - ENGLISH ONLY
        if not create_audio(body, audio_path, lang="en"):
            print(f"  ❌ Audio creation failed")
            return False
        
        # Create slide
        if not create_slide(title, body, slide_path):
            print(f"  ❌ Slide creation failed")
            if audio_path.exists():
                try:
                    audio_path.unlink()
                except:
                    pass
            return False
        
        # Create video
        success = create_video(slide_path, audio_path, output_path)
        
        # Cleanup temp files
        for temp_file in [audio_path, slide_path]:
            if temp_file.exists():
                try:
                    temp_file.unlink()
                except:
                    pass
        
        if success:
            elapsed = time.time() - start_time
            print(f"  ✅ DONE: {output_path.name} ({elapsed:.1f}s)")
            with open(log_file, 'w', encoding='utf-8') as f:
                f.write(f"Success: {datetime.now()}\n")
                f.write(f"Title: {title}\n")
                f.write(f"Script: {script_path}\n")
            return True
        else:
            print(f"  ❌ FAILED: {script_path.name}")
            with open(log_file, 'w', encoding='utf-8') as f:
                f.write(f"Failed: {datetime.now()}\n")
                f.write(f"Script: {script_path}\n")
            return False
            
    except Exception as e:
        print(f"  ❌ ERROR: {e}")
        # Cleanup temp files
        for temp_file in [audio_path, slide_path]:
            if temp_file.exists():
                try:
                    temp_file.unlink()
                except:
                    pass
        with open(log_file, 'w', encoding='utf-8') as f:
            f.write(f"Error: {datetime.now()}\n")
            f.write(f"Script: {script_path}\n")
            f.write(f"Exception: {e}\n")
        return False

def main():
    """Main execution"""
    print("\n" + "=" * 70)
    print(f"Processing started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70 + "\n")
    
    scripts = get_scripts()
    
    if not scripts:
        print("❌ No scripts found in:", SCRIPTS)
        print("   Make sure your .md files are in the 'video-scripts' folder")
        return
    
    print(f"Found {len(scripts)} scripts to process\n")
    
    successful = []
    failed = []
    
    for i, script_path in enumerate(scripts, 1):
        print(f"[{i}/{len(scripts)}]")
        success = process_script(script_path, OUTPUT, LOGS)
        if success:
            successful.append(script_path.name)
        else:
            failed.append(script_path.name)
        print()
    
    # Summary
    print("=" * 70)
    print("PROCESSING SUMMARY")
    print("=" * 70)
    print(f"Total scripts:  {len(scripts)}")
    print(f"Successful:     {len(successful)}")
    print(f"Failed:         {len(failed)}")
    
    if failed:
        print("\n❌ Failed scripts:")
        for f in failed:
            print(f"  - {f}")
    
    # Create report
    report_path = LOGS / f"summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("VIDEO GENERATION SUMMARY\n")
        f.write("=" * 50 + "\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Total: {len(scripts)}\n")
        f.write(f"Success: {len(successful)}\n")
        f.write(f"Failed: {len(failed)}\n\n")
        if failed:
            f.write("Failed scripts:\n")
            for name in failed:
                f.write(f"  - {name}\n")
    
    print(f"\n📄 Report saved to: {report_path}")
    print("\n" + "=" * 70)
    print("DONE!")
    print("=" * 70)

if __name__ == "__main__":
    main()
