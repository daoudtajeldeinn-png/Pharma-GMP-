#!/usr/bin/env python3
"""
Master Script Optimizer for GMP Pharma Video Pipeline
- Removes timestamps, duration headings, and figure markers.
- Splits dense text lines into clean, formatted bullet points and paragraphs.
- Structures Markdown cleanly with Title, Overview, Sections, Bullet Points, and Key Takeaways.
"""

import re
from pathlib import Path

BASE_DIR = Path("G:/GMP Pharma")
INPUT_DIR = BASE_DIR / "video-scripts-clean-en"
OUTPUT_DIR = BASE_DIR / "video-scripts-optimized"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# List of bullet splitting triggers
BULLET_SPLIT_KEYWORDS = [
    "Actions to ", "Organized system ", "Essential for ", "Prevents ", "Improves ", "Ensures ", "Reduces ",
    "CAPA is ", "Taken after ", "Taken before ", "Aim to ", "Executed after ", "Executed based ",
    "Corrective actions ", "Preventive actions ", "Both are ", "Deviations from ", "Customer complaints",
    "Patient complaints", "Doctor complaints", "Pharmacist complaints", "Product recalls", "Defective product",
    "Unsafe product", "Ineffective product", "Internal inspection", "External inspection", "Regulatory inspection",
    "Supplier inspection", "Negative trend", "Historical data", "Performance metrics", "Risk analysis",
    "FDA CAPA", "ICH Q10", "WHO GMP", "EU GMP", "FDA requires", "WHO provides", "EU GMP requires",
    "Definition of", "Difference between", "When CAPA is", "Documentation is", "In the next lecture"
]

def format_clean_text(raw_text, file_stem):
    # Remove timestamps and metadata
    text = re.sub(r'Video Script:\s*', '', raw_text, flags=re.I)
    text = re.sub(r'Duration:\s*\d+\s*minutes?\s*', '', text, flags=re.I)
    text = re.sub(r'\(\d+:\d+\s*-\s*\d+:\d+\)', '', text)
    text = re.sub(r'\(\d+:\d+\)', '', text)
    text = re.sub(r'\[\d+:\d+\]', '', text)
    text = re.sub(r'Figure\s*\d+:?', '', text, flags=re.I)

    # Clean title
    title = file_stem.replace('-en-pro', '').replace('-', ' ').title()
    lines = [l.strip() for l in text.split('\n') if l.strip()]

    if lines:
        first = lines[0]
        if "CAPA" in first or "GMP" in first or "ISO" in first or "QC" in first or "Validation" in first:
            if "Welcome" in first:
                parts = first.split("Welcome", 1)
                if parts[0].strip():
                    title = parts[0].strip()
                lines[0] = "Welcome " + parts[1]
            else:
                title = first
                lines = lines[1:]

    # Break jammed lines by inserting newlines before bullet keywords
    processed_lines = []
    for line in lines:
        curr_line = line
        for kw in BULLET_SPLIT_KEYWORDS:
            pattern = re.compile(rf'(?<=[^.\n])\s+({re.escape(kw)})')
            curr_line = pattern.sub(r'\n- \1', curr_line)
        processed_lines.extend(curr_line.split('\n'))

    # Re-structure into sections
    sections = []
    current_sec = "Overview"
    current_items = []

    headings_map = {
        "what is capa": "What is CAPA?",
        "what is gmp": "What is GMP?",
        "corrective actions": "Corrective Actions",
        "preventive actions": "Preventive Actions",
        "difference between corrective and preventive actions": "Difference Between Corrective & Preventive Actions",
        "when is capa required": "When is CAPA Required?",
        "main situations": "Main Situations Requiring Action",
        "regulatory requirements": "Regulatory Requirements",
        "main regulations": "Main Regulations & Standards",
        "in this lecture, we learned": "Module Summary",
        "key points to remember": "Key Points to Remember"
    }

    for line in processed_lines:
        line_s = line.strip()
        if not line_s:
            continue

        line_lower = line_s.lower().rstrip(':?')
        matched_h = None

        for h_key, h_title in headings_map.items():
            if h_key in line_lower:
                matched_h = h_title
                break

        if matched_h:
            if current_items:
                sections.append((current_sec, current_items))
                current_items = []
            current_sec = matched_h
            
            # Extract post heading content if present
            for h_key in headings_map.keys():
                if h_key in line_lower:
                    idx = line_lower.find(h_key) + len(h_key)
                    remainder = line_s[idx:].strip().lstrip(':?')
                    if remainder:
                        if remainder.startswith("-"):
                            current_items.append(remainder)
                        else:
                            current_items.append(remainder)
                    break
        else:
            if ":" in line_s and not line_s.startswith("http") and not line_s.startswith("-") and len(line_s.split(":")[0]) < 25:
                parts = line_s.split(":", 1)
                label = parts[0].strip()
                val = parts[1].strip()
                if val:
                    current_items.append(f"- **{label}**: {val}")
                else:
                    current_items.append(f"- **{label}**")
            elif line_s.startswith("-"):
                current_items.append(line_s)
            else:
                if any(line_s.startswith(w) for w in ["Actions", "Prevents", "Improves", "Ensures", "Reduces", "Taken", "Aim", "Executed", "Deviations", "Complaints", "Recalls", "Inspections", "FDA", "ICH", "WHO", "EU", "CAPA"]):
                    current_items.append(f"- {line_s}")
                else:
                    current_items.append(line_s)

    if current_items:
        sections.append((current_sec, current_items))

    # Output Markdown
    out = []
    out.append(f"# {title.strip()}\n")
    out.append("> **Pharmaceutical Quality & Compliance Training Script**\n")

    for sec_title, items in sections:
        out.append(f"## {sec_title}\n")
        for item in items:
            if item.startswith("-"):
                out.append(item)
            else:
                out.append(f"{item}\n")
        out.append("")

    return "\n".join(out)

def main():
    scripts = sorted(INPUT_DIR.glob("*.md"))
    print(f"Optimizing {len(scripts)} scripts with master splitter...")
    for s in scripts:
        raw = s.read_text(encoding='utf-8')
        opt = format_clean_text(raw, s.stem)
        (OUTPUT_DIR / s.name).write_text(opt, encoding='utf-8')
    print(f"✅ Finished optimizing all {len(scripts)} scripts!")

if __name__ == "__main__":
    main()
