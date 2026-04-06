"""
Extract text from 'ATS CV.pdf' in the workspace and heuristically split into sections.
Writes:
 - data/cv_raw.txt
 - data/cv.json

This script uses PyPDF2 (will be installed if missing).
"""
import os
import json
import re

try:
    from PyPDF2 import PdfReader
except Exception as e:
    print("PyPDF2 not installed. Please run: pip install PyPDF2")
    raise

PDF_NAME = "ATS CV.pdf"
PDF_PATH = os.path.join(os.getcwd(), PDF_NAME)
OUT_DIR = os.path.join(os.getcwd(), "data")
os.makedirs(OUT_DIR, exist_ok=True)

if not os.path.exists(PDF_PATH):
    print(f"ERROR: PDF not found at {PDF_PATH}")
    raise SystemExit(1)

reader = PdfReader(PDF_PATH)
texts = []
for page in reader.pages:
    try:
        texts.append(page.extract_text() or "")
    except Exception:
        texts.append("")

full_text = "\n\n".join(texts)
# Save raw
with open(os.path.join(OUT_DIR, "cv_raw.txt"), "w", encoding="utf-8") as f:
    f.write(full_text)

# Heuristic parsing into sections
lines = [ln.strip() for ln in full_text.splitlines() if ln.strip()]
text_joined = "\n".join(lines)

# Section headings we look for
headings = [
    "contact",
    "summary",
    "professional summary",
    "about",
    "skills",
    "technical skills",
    "experience",
    "work experience",
    "projects",
    "portfolio",
    "education",
    "certifications",
    "awards",
]

# Find heading indices
indices = {}
for i, ln in enumerate(lines):
    low = ln.lower()
    for h in headings:
        if low.startswith(h):
            if h not in indices:
                indices[h] = i

# Sort found headings by index
sorted_heads = sorted(indices.items(), key=lambda x: x[1])

sections = {}
for idx, (h, start_i) in enumerate(sorted_heads):
    end_i = len(lines)
    if idx + 1 < len(sorted_heads):
        end_i = sorted_heads[idx + 1][1]
    content = "\n".join(lines[start_i + 1:end_i]).strip()
    sections[h] = content

# Fallbacks for common fields
contact = sections.get('contact') or sections.get('about') or ''
summary = sections.get('summary') or sections.get('professional summary') or ''
skills = sections.get('skills') or sections.get('technical skills') or ''
experience = sections.get('experience') or sections.get('work experience') or ''
projects = sections.get('projects') or sections.get('portfolio') or ''
education = sections.get('education') or ''

# Simple splits
skills_list = [s.strip() for s in re.split(r'[;,\n]|\u2022', skills) if s.strip()]

# Parse experience into entries by looking for lines that start with a year or a role pattern
exp_entries = []
if experience:
    # split by blank lines in the original raw text
    for block in experience.split('\n\n'):
        block = block.strip()
        if not block:
            continue
        exp_entries.append(block)

proj_entries = []
if projects:
    for block in projects.split('\n\n'):
        block = block.strip()
        if not block:
            continue
        # Try to get a title line
        lines_block = block.split('\n')
        title = lines_block[0]
        desc = ' '.join(lines_block[1:])
        proj_entries.append({"title": title, "description": desc})

cv = {
    "raw_pdf_path": PDF_NAME,
    "contact": contact,
    "summary": summary,
    "skills": skills_list,
    "experience": exp_entries,
    "projects": proj_entries,
    "education": education,
}

with open(os.path.join(OUT_DIR, "cv.json"), "w", encoding="utf-8") as f:
    json.dump(cv, f, indent=2, ensure_ascii=False)

print("WROTE:", os.path.join(OUT_DIR, "cv.json"))

