#!/usr/bin/env python3
"""
Convert GMP scripts to professional video scripts
Removes speaker tags, cleans formatting, creates flowing speech text
"""

import re
from pathlib import Path

def convert_to_professional_script(text):
    """Convert raw script to professional flowing speech"""
    
    # Remove markdown headers (# ## ###)
    text = re.sub(r'#+\s*', '', text)
    
    # Remove speaker tags
    text = re.sub(r'\*\*المتحدث:\*\*', '', text)
    text = re.sub(r'\*\*Speaker:\*\*', '', text)
    text = re.sub(r'المتحدث:', '', text)
    text = re.sub(r'Speaker:', '', text)
    
    # Remove section labels
    labels = [
        'التعريف:', 'أهمية', 'الشرح التفصيلي:', 'الأنواع الرئيسية:',
        'المبادئ الأساسية:', 'الإجراءات:', 'المراحل:', 'النقاط الرئيسية:',
        'ملخص', 'مقدمة', 'Definition:', 'Importance', 'Main Types:',
        'Basic Principles:', 'Procedures:', 'Stages:', 'Key Points:',
        'Summary', 'Introduction', 'Detailed Explanation:'
    ]
    
    for label in labels:
        text = re.sub(rf'\*\*{label}\*\*', '', text)
        text = re.sub(rf'{label}', '', text)
    
    # Remove markdown formatting
    text = re.sub(r'\*\*', '', text)
    text = re.sub(r'\_\_', '', text)
    text = re.sub(r'\`', '', text)
    
    # Clean up numbered lists - make them flow naturally
    # "1. نص" -> "أولاً: نص" or just remove numbers
    text = re.sub(r'(\d+)\.\s*', '', text)
    
    # Remove "الشرح التفصيلي:" and similar
    text = re.sub(r'الشرح التفصيلي[:\s]+', '', text)
    text = re.sub(r'Detailed Explanation[:\s]+', '', text)
    
    # Remove "ملاحظات للمتحدث" section and everything after
    text = re.sub(r'ملاحظات للمتحدث:.*$', '', text, flags=re.MULTILINE | re.DOTALL)
    text = re.sub(r'Speaker Notes:.*$', '', text, flags=re.MULTILINE | re.DOTALL)
    
    # Remove "---" separators
    text = re.sub(r'---', '', text)
    
    # Fix multiple spaces and newlines
    text = re.sub(r'\n\s*\n', '\n\n', text)
    text = re.sub(r' +', ' ', text)
    
    # Remove empty lines at start/end
    text = text.strip()
    
    # Add professional flow: connect sentences
    lines = text.split('\n')
    clean_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Skip lines that are just numbers or bullets
        if re.match(r'^[\d\.\-\*\s]+$', line):
            continue
        
        # Remove leading bullets
        line = re.sub(r'^[\-\*\•]\s*', '', line)
        
        # Capitalize first letter (for Arabic, we keep as is)
        clean_lines.append(line)
    
    # Join with proper spacing
    final_text = ' '.join(clean_lines)
    
    # Fix multiple spaces
    final_text = re.sub(r' +', ' ', final_text)
    
    # Add pauses for sections (double newline)
    final_text = re.sub(r'([\.\?\!])\s+', r'\1\n\n', final_text)
    
    return final_text

def process_all_scripts():
    """Process all scripts in video-scripts folder"""
    
    script_folder = Path("G:/GMP Pharma/video-scripts")
    output_folder = Path("G:/GMP Pharma/video-scripts-professional")
    output_folder.mkdir(parents=True, exist_ok=True)
    
    scripts = sorted(script_folder.glob("*.md"))
    
    print(f"Found {len(scripts)} scripts to convert\n")
    
    for i, script_path in enumerate(scripts, 1):
        print(f"[{i}/{len(scripts)}] Processing: {script_path.name}")
        
        # Read original
        content = script_path.read_text(encoding='utf-8')
        
        # Convert
        professional = convert_to_professional_script(content)
        
        # Save with -pro suffix
        output_path = output_folder / f"{script_path.stem}-pro.md"
        output_path.write_text(professional, encoding='utf-8')
        
        print(f"  ✅ Saved to: {output_path.name}")
    
    print(f"\n✅ All scripts converted! Saved to: {output_folder}")
    print(f"   Total: {len(scripts)} scripts")

if __name__ == "__main__":
    process_all_scripts()