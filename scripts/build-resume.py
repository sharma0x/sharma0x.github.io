#!/usr/bin/env python3
"""
Build resume assets for the portfolio site.

Generates HTML and PDF from resume_data.json using the resume-generator
 toolchain, then places them in public/ so Vite copies them to dist/.

Outputs:
  - public/prince-sharma-resume/index.html  (HTML resume page)
  - public/prince_sharma_resume.pdf          (PDF resume)
"""

import subprocess
import sys
import shutil
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RESUME_GENERATOR = PROJECT_ROOT / "resume-generator"
PUBLIC_DIR = PROJECT_ROOT / "public"
TEMP_OUTPUT = PROJECT_ROOT / "tmp-resume-output"


def main() -> int:
    # Clean up any previous temp output
    if TEMP_OUTPUT.exists():
        shutil.rmtree(TEMP_OUTPUT)

    # Run the resume generator (HTML + PDF) via uv from the resume-generator dir
    cmd = [
        "uv",
        "run",
        "scripts/generate.py",
        "--input",
        str(PROJECT_ROOT / "resume_data.json"),
        "--output",
        str(TEMP_OUTPUT),
        "--html",
        "--pdf",
    ]
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=str(RESUME_GENERATOR))
    print(result.stdout, end="")
    if result.returncode != 0:
        print(result.stderr, file=sys.stderr)
        return result.returncode

    # Ensure public directories exist
    (PUBLIC_DIR / "prince-sharma-resume").mkdir(parents=True, exist_ok=True)

    # Copy HTML as index.html for the /prince-sharma-resume route
    html_src = TEMP_OUTPUT / "resume.html"
    html_dst = PUBLIC_DIR / "prince-sharma-resume" / "index.html"
    shutil.copy2(html_src, html_dst)
    print(f"✅ HTML resume copied to {html_dst}")

    # Copy PDF for the /prince_sharma_resume.pdf route
    pdf_src = TEMP_OUTPUT / "resume.pdf"
    pdf_dst = PUBLIC_DIR / "prince_sharma_resume.pdf"
    shutil.copy2(pdf_src, pdf_dst)
    print(f"✅ PDF resume copied to {pdf_dst}")

    # Cleanup temp files
    shutil.rmtree(TEMP_OUTPUT)
    print("🎉 Resume assets built successfully!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
