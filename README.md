Game Developer Portfolio (static site)

Quick preview:

1. Start a local server from the project root:

```powershell
cd D:\_Portfolio
python -m http.server 8000
```

2. Open http://localhost:8000 in your browser.

What I added:
- `index.html`, `css/styles.css`, `js/main.js`
- `data/cv.json` (populated from `ATS CV.pdf`)
- `tools/extract_cv.py` (extracts text from `ATS CV.pdf` into `data/cv.json`)
- `assets/resume.pdf` (copy of `ATS CV.pdf`)

Next steps (optional):
- Add project screenshots and playable builds under `projects/`.
- Improve visual design, add dark-mode toggle, and add animations.
- Deploy to GitHub Pages by pushing this folder to a repository.

