#!/usr/bin/env python3
"""
Resume Generator
Reads resume_data.json and generates HTML, DOCX, and PDF outputs.
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

from jinja2 import Environment, FileSystemLoader


# ── Paths ──────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
OUTPUT_DIR = PROJECT_DIR / "output"
TEMPLATES_DIR = PROJECT_DIR / "templates"
STYLES_DIR = PROJECT_DIR / "styles"

DEFAULT_JSON_PATH = PROJECT_DIR.parent / "resume_data.json"


# ── Helpers ────────────────────────────────────────────────────────────

def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def load_json(json_path: Path) -> dict:
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


def render_html(data: dict, css_embed: bool = True) -> str:
    env = Environment(
        loader=FileSystemLoader(TEMPLATES_DIR),
        trim_blocks=True,
        lstrip_blocks=True,
    )
    template = env.get_template("resume.html.j2")

    # Optionally embed CSS so the HTML file is self-contained
    if css_embed:
        css_path = STYLES_DIR / "resume.css"
        css_content = css_path.read_text(encoding="utf-8")
        # Inject CSS into the template context
        html = template.render(**data)
        # Simple replace for embedded CSS
        html = html.replace(
            '<link rel="stylesheet" href="../styles/resume.css">',
            f"<style>\n{css_content}\n</style>",
        )
    else:
        html = template.render(**data)

    return html


def write_html(html: str, output_path: Path) -> None:
    output_path.write_text(html, encoding="utf-8")
    print(f"✅ HTML generated: {output_path}")


def generate_docx(html_path: Path, docx_path: Path) -> bool:
    """Convert HTML to DOCX using Pandoc."""
    try:
        subprocess.run(
            [
                "pandoc",
                str(html_path),
                "-f", "html",
                "-t", "docx",
                "-o", str(docx_path),
                "--resource-path", str(PROJECT_DIR),
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        print(f"✅ DOCX generated: {docx_path}")
        return True
    except FileNotFoundError:
        print("❌ Pandoc not found. Install it: https://pandoc.org/installing.html")
        print("   macOS: brew install pandoc")
        print("   Ubuntu: sudo apt-get install pandoc")
        return False
    except subprocess.CalledProcessError as e:
        print(f"❌ Pandoc failed:\n{e.stderr}")
        return False


def generate_pdf(html_path: Path, pdf_path: Path) -> bool:
    """Convert HTML to PDF using Playwright via a local HTTP server."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("❌ Playwright not installed. Run: pip install playwright")
        print("   Then: playwright install chromium")
        return False

    # Serve HTML over localhost so external resources (Google Fonts, etc.) load correctly.
    from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
    import threading

    class _QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass

    server_dir = str(html_path.parent)
    handler = lambda *args, **kwargs: _QuietHandler(*args, directory=server_dir, **kwargs)
    httpd = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    port = httpd.server_address[1]

    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto(f"http://127.0.0.1:{port}/resume.html")
            # Wait for all network requests (fonts, etc.) to finish
            page.wait_for_load_state("networkidle")
            # Ensure web fonts are fully loaded and ready
            page.evaluate("document.fonts.ready")
            page.pdf(
                path=str(pdf_path),
                format="Letter",
                print_background=True,
                margin={
                    "top": "0.55in",
                    "right": "0.63in",
                    "bottom": "0.55in",
                    "left": "0.63in",
                },
            )
            browser.close()
        print(f"✅ PDF generated: {pdf_path}")
        return True
    except Exception as e:
        print(f"❌ PDF generation failed: {e}")
        return False
    finally:
        httpd.shutdown()


# ── Main ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Generate resume in HTML, DOCX, and PDF from JSON."
    )
    parser.add_argument(
        "--input", "-i",
        type=Path,
        default=DEFAULT_JSON_PATH,
        help=f"Path to resume JSON file (default: {DEFAULT_JSON_PATH})",
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=OUTPUT_DIR,
        help=f"Output directory (default: {OUTPUT_DIR})",
    )
    parser.add_argument(
        "--html", action="store_true", help="Generate HTML only"
    )
    parser.add_argument(
        "--docx", action="store_true", help="Generate DOCX only"
    )
    parser.add_argument(
        "--pdf", action="store_true", help="Generate PDF only"
    )
    parser.add_argument(
        "--all", action="store_true", help="Generate all formats (default)"
    )
    parser.add_argument(
        "--no-embed-css", action="store_true",
        help="Keep external CSS link instead of embedding"
    )
    parser.add_argument(
        "--watch", action="store_true",
        help="Watch templates for changes and regenerate (not implemented yet)"
    )

    args = parser.parse_args()

    # Default to all if no specific format requested
    if not (args.html or args.docx or args.pdf):
        args.all = True

    json_path = args.input.resolve()
    if not json_path.exists():
        print(f"❌ JSON file not found: {json_path}")
        sys.exit(1)

    output_dir = args.output.resolve()
    ensure_dir(output_dir)

    # Load data
    print(f"📄 Loading resume data from: {json_path}")
    data = load_json(json_path)

    # Generate HTML (required base for DOCX/PDF)
    html = render_html(data, css_embed=not args.no_embed_css)
    html_path = output_dir / "resume.html"
    write_html(html, html_path)

    # Generate DOCX
    if args.all or args.docx:
        docx_path = output_dir / "resume.docx"
        generate_docx(html_path, docx_path)

    # Generate PDF
    if args.all or args.pdf:
        pdf_path = output_dir / "resume.pdf"
        generate_pdf(html_path, pdf_path)

    print("\n🎉 Done!")


if __name__ == "__main__":
    main()
