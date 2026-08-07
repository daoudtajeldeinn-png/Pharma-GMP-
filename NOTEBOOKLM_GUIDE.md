# 🚀 NotebookLM & YouTube Video Update Guide

This guide explains how to use **Google NotebookLM** with your clean scripts and how to update your videos on **YouTube**.

---

## 📌 Part 1: Does YouTube Update Automatically from Local Files?

> **Short Answer**: **No, YouTube will NOT update automatically from your local computer drive.**
> 
> - **YouTube Rules**: YouTube does not auto-sync with local folders on your computer.
> - **Video URL Policy**: YouTube **does not allow directly overwriting an existing video file** on an existing video URL without changing the video ID.
> - **How to Update Your Videos on YouTube**:
>   1. **Manual Upload**: Upload the new high-quality `.mp4` video from `G:\GMP Pharma\videos\final\` to your YouTube Channel.
>   2. **Manage Old Video**: Unlist, set to private, or delete the old video on YouTube, then add the new video link to your playlists and website.
>   3. **YouTube Data API (Optional Automation)**: You can use a Python script with YouTube Data API v3 to automate uploading new videos and updating titles/descriptions automatically.

---

## 🎙️ Part 2: How to Use NotebookLM for Audio & Script Enhancement

Google NotebookLM is an ideal tool for creating AI-powered podcasts ("Audio Overviews"), study guides, and enhanced narration for your training videos.

### Step 1: Upload Source Documents
1. Open [Google NotebookLM](https://notebooklm.google.com/).
2. Click **Create New Notebook** (e.g. name it *Pharma CAPA Training*).
3. Click **Add Source** -> Upload files.
4. Select the consolidated source file from your local folder:
   - `G:\GMP Pharma\notebooklm-sources\CAPA_Module_Complete_Source.md`
   - Or any of the other module files in `G:\GMP Pharma\notebooklm-sources\`.

### Step 2: Generate Audio Overview (NotebookLM Podcast)
1. On the NotebookLM dashboard, locate the **Notebook Guide** on the right side.
2. Click **Audio Overview** -> **Generate**.
3. NotebookLM will automatically create a 2-host conversational podcast discussing your exact GMP script content!
4. Download the generated `.mp3` audio.

### Step 3: Enhance Video Narration with NotebookLM Audio
1. Replace the standard TTS audio with the high-quality NotebookLM `.mp3` audio in your video editor or Python generator.
2. Pair the audio with your generated HD slides in `videos/final/`.

---

## 💡 Prompts to Use Inside NotebookLM

You can type these custom prompts into NotebookLM's chat:

- **Generate Video Voiceover Script**:
  > *"Based on the uploaded CAPA source document, write a clear, engaging 3-minute video narration script divided into 4 clear sections: Introduction, Core Concepts, Real-world Example, and Summary."*

- **Generate Quiz & FAQ**:
  > *"Create a 5-question multiple choice quiz with answer key and explanatory notes based on the uploaded document."*

---

## 🎬 Part 3: Video Quality Improvements Overview

Your local video pipeline has been upgraded with:
- **Clean Markdown Scripts**: Removed timestamps `(0:00 - 1:00)`, figure markers, and jammed text lines.
- **Multi-Slide HD Layout**: Renders clean 1920x1080 slides per section with header badges, section titles, card containers, and styled bullet points.
- **Color Palette**: Dark Navy (`#0B132B`), Mint Teal (`#00E6C3`), and Gold (`#F4C430`).
- **Synchronized Audio & Video**: Concatenates sections into a clean output file inside `G:\GMP Pharma\videos\final\`.
