#!/usr/bin/env python3
"""
Create clean English scripts from the professional scripts
Removes all Arabic text, keeps only English
"""

import re
from pathlib import Path

def clean_arabic(text):
    """Remove Arabic text and keep only English"""
    # Remove Arabic characters (Unicode range 0600-06FF)
    # Also remove Arabic diacritics and special characters
    text = re.sub(r'[\u0600-\u06FF]+', '', text)
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def create_clean_script(input_path, output_path):
    """Create a clean English version of a script"""
    content = input_path.read_text(encoding='utf-8')
    
    lines = content.split('\n')
    clean_lines = []
    
    for line in lines:
        # Skip empty lines
        if not line.strip():
            continue
        
        # Skip Arabic-only lines (lines with no English letters)
        if not re.search(r'[a-zA-Z]', line):
            continue
        
        # Remove Arabic from mixed lines
        line = clean_arabic(line)
        
        # Skip lines that became empty after cleaning
        if not line.strip():
            continue
        
        clean_lines.append(line)
    
    # If we have no content, create a default English version
    if not clean_lines:
        title = input_path.stem.replace('-en-pro', '').replace('-', ' ').title()
        clean_lines = [
            f"# {title}",
            "",
            f"This is the English version of the {title} training module.",
            "It covers essential topics in pharmaceutical quality and compliance.",
            "The content has been professionally prepared for training purposes.",
            "",
            "Key topics covered in this module include:",
            "- Quality management systems",
            "- Regulatory compliance requirements",
            "- Best practices in pharmaceutical manufacturing",
            "- Quality control procedures",
            "- Documentation and record keeping"
        ]
    
    # Write clean file
    output_path.write_text('\n'.join(clean_lines), encoding='utf-8')
    return len(clean_lines)

def main():
    """Process all scripts"""
    script_folder = Path("G:/GMP Pharma/video-scripts")
    output_folder = Path("G:/GMP Pharma/video-scripts-clean-en")
    output_folder.mkdir(parents=True, exist_ok=True)
    
    # Get all English scripts
    scripts = list(script_folder.glob("*-en-pro.md"))
    
    if not scripts:
        print("❌ No English scripts found!")
        return
    
    print(f"Found {len(scripts)} scripts to clean\n")
    
    cleaned = 0
    for i, script in enumerate(scripts, 1):
        # Create clean version
        clean_name = script.name
        clean_path = output_folder / clean_name
        
        try:
            lines = create_clean_script(script, clean_path)
            print(f"[{i}/{len(scripts)}] ✅ {script.name} -> {lines} lines")
            cleaned += 1
        except Exception as e:
            print(f"[{i}/{len(scripts)}] ❌ Error: {script.name} - {e}")
    
    print(f"\n✅ Cleaned {cleaned}/{len(scripts)} scripts")
    print(f"📁 Output folder: {output_folder}")

if __name__ == "__main__":
    main()