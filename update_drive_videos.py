import urllib.request
import re
import json
from pathlib import Path

BASE_DIR = Path(__file__).parent
VIDEOS_JSON = BASE_DIR / "videos.json"

url = "https://drive.google.com/drive/folders/1CaLJL_FGxDmrxZVgeEr6mzQftGpk0Hh5?usp=sharing"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

print("Fetching folder contents from Google Drive...")
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')

    # Extract all mp4 files and their 33-char Drive IDs
    matches = re.findall(r'([\w\-]+\.mp4).*?([a-zA-Z0-9_-]{33})', html)

    print(f"Found {len(matches)} total matches in Drive HTML:")
    drive_mapping = {}

    for filename, file_id in matches:
        print(f"  {filename} -> {file_id}")
        clean_name = filename.replace(".mp4", "")
        # Remove any suffix like -en-pro, -ar-pro, -clean-en, -pro, -en, -ar
        key = re.sub(r'-(en-pro|ar-pro|clean-en|pro|en|ar)$', '', clean_name)
        drive_mapping[key] = file_id
        drive_mapping[clean_name] = file_id

    print(f"\nTotal mapped keys: {len(drive_mapping)}")

    if drive_mapping:
        with open(VIDEOS_JSON, 'r', encoding='utf-8') as f:
            v_data = json.load(f)

        updated_count = 0
        changed_keys = []

        for k in list(v_data.keys()):
            if k in drive_mapping:
                old_val = v_data[k]
                new_val = drive_mapping[k]
                if old_val != new_val:
                    v_data[k] = new_val
                    updated_count += 1
                    changed_keys.append(f"  {k}: {old_val} -> {new_val}")
            else:
                print(f"Key missing from Drive mapping: {k}")

        if updated_count > 0:
            with open(VIDEOS_JSON, 'w', encoding='utf-8') as f:
                json.dump(v_data, f, indent=2)

            print(f"\n✅ Updated {updated_count} NEW video entries in videos.json:")
            for item in changed_keys:
                print(item)
        else:
            print("\nℹ️ All existing keys in videos.json are already up to date!")

except Exception as e:
    print(f"Error fetching or parsing Drive URL: {e}")
