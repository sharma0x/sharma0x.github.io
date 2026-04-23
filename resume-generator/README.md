# Resume Generator

Generate professional resumes in **HTML**, **DOCX**, and **PDF** from structured JSON data.

---

## Quick Start

```bash
cd resume-generator

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
playwright install chromium

# Generate all formats
python scripts/generate.py
```

Outputs will appear in `output/`:
- `resume.html` — View in browser or embed in portfolio
- `resume.docx` — Edit in Microsoft Word / Google Docs
- `resume.pdf` — Print-ready PDF

---

## Usage

### Generate All Formats
```bash
python scripts/generate.py
```

### Generate Specific Format
```bash
python scripts/generate.py --html      # HTML only
python scripts/generate.py --docx      # DOCX only
python scripts/generate.py --pdf       # PDF only
```

### Custom Input File
```bash
python scripts/generate.py --input /path/to/resume.json
```

### Custom Output Directory
```bash
python scripts/generate.py --output ./my-resumes
```

---

## Dependencies

| Tool | Purpose | Install |
|------|---------|---------|
| Python 3.9+ | Runtime | — |
| Jinja2 | HTML templating | `pip install jinja2` |
| Playwright | PDF generation | `pip install playwright` + `playwright install chromium` |
| Pandoc | DOCX generation | `brew install pandoc` or [pandoc.org](https://pandoc.org/installing.html) |

---

## Project Structure

```
resume-generator/
├── scripts/
│   └── generate.py          # Main entry point
├── templates/
│   ├── resume.html.j2       # Main layout
│   └── partials/            # Section templates
│       ├── header.html.j2
│       ├── experience.html.j2
│       ├── skills.html.j2
│       ├── projects.html.j2
│       ├── education.html.j2
│       ├── achievements.html.j2
│       └── publications.html.j2
├── styles/
│   └── resume.css           # Print-optimized A4 stylesheet
├── output/                  # Generated files (gitignored)
├── requirements.txt
└── README.md
```

---

## Customization

### Edit Content
Modify `resume_data.json` in the parent directory, then regenerate.

### Edit Styling
Tweak `styles/resume.css` and rerun the generator.

### Add Sections
1. Create a new partial in `templates/partials/`
2. Include it in `templates/resume.html.j2`
3. Add corresponding data to `resume_data.json`

---

## License

MIT
