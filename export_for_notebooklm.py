#!/usr/bin/env python3
"""
NotebookLM Source Exporter for GMP Pharma
- Consolidates optimized scripts into single structured source documents per module topic.
- Topics: CAPA, GMP Basics, ISO 9001, QC Lab, Validation.
- Saves clean source files into notebooklm-sources/ ready for direct upload to Google NotebookLM.
"""

import os
from pathlib import Path

BASE_DIR = Path("G:/GMP Pharma")
INPUT_DIR = BASE_DIR / "video-scripts-optimized"
OUTPUT_DIR = BASE_DIR / "notebooklm-sources"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

TOPICS = {
    "CAPA_Module_Complete_Source.md": "capa-",
    "GMP_Basics_Module_Complete_Source.md": "gmp-basics-",
    "ISO_9001_Module_Complete_Source.md": "iso-9001-",
    "QC_Lab_Module_Complete_Source.md": "qc-lab-",
    "Validation_Module_Complete_Source.md": "validation-"
}

def export_sources():
    print("=" * 70)
    print("NOTEBOOKLM SOURCE EXPORTER")
    print("=" * 70)
    
    scripts = sorted(INPUT_DIR.glob("*.md"))
    if not scripts:
        print("❌ No optimized scripts found!")
        return

    for out_name, prefix in TOPICS.items():
        matching = [s for s in scripts if s.name.startswith(prefix)]
        print(f"Exporting {len(matching)} scripts for topic: {out_name}...")
        
        combined_text = []
        combined_text.append(f"# {prefix.rstrip('-').upper().replace('_', ' ')} COMPLETE TRAINING COURSE")
        combined_text.append("> **Comprehensive Pharmaceutical Quality & Compliance Source Document**\n")
        combined_text.append("---")
        combined_text.append("")

        for s in matching:
            content = s.read_text(encoding='utf-8')
            combined_text.append(content)
            combined_text.append("\n---\n")

        out_path = OUTPUT_DIR / out_name
        out_path.write_text("\n".join(combined_text), encoding='utf-8')
        print(f"  ✅ Created: {out_path.name}")

    print("\n" + "=" * 70)
    print(f"All NotebookLM source files created in: {OUTPUT_DIR}")
    print("=" * 70)

if __name__ == "__main__":
    export_sources()
