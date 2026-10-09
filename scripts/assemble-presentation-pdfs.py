"""Package reviewed browser slide captures without changing their appearance.

Usage: python scripts/assemble-presentation-pdfs.py capture-results.json output-dir
Capture each online slide at 1440x810 through the browser, then visually review it.
The resulting PDFs contain fixed slide images, bookmarks and live source links.
"""
import json
import sys
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

from PIL import Image
from pypdf import PdfReader
from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfdoc import PDFString

source, destination = map(Path, sys.argv[1:3])
records = json.loads(source.read_text(encoding="utf-8"))
story = json.loads((Path(__file__).resolve().parent.parent / "content/presentation-story.json").read_text(encoding="utf-8"))
order = [step["id"] for step in story["main"] + story["appendices"]]
titles = {step["id"]: step["title"] for step in story["main"] + story["appendices"]}
french = json.loads((Path(__file__).resolve().parent.parent / "content/locales/fr-presentation.json").read_text(encoding="utf-8"))
destination.mkdir(parents=True, exist_ok=True)
width, height = 1080, 607.5
scale = width / 1440

for language in ("en", "es", "fr"):
    pages = {item["id"]: item for item in records if item["lang"] == language}
    assert set(pages) == set(order), f"Incomplete {language} capture"
    filename = destination / f"Dulcinea-Presentation-{language.upper()}.pdf"
    pdf = canvas.Canvas(str(filename), pagesize=(width, height), pageCompression=1)
    pdf.setTitle({"en": "Dulcinea One - Investor presentation", "es": "Dulcinea One - Presentación para inversionistas", "fr": "Dulcinea One - Présentation aux investisseurs"}[language])
    pdf.setAuthor("Dulcinea Investments, LLC")
    pdf.setSubject("Online presentation: 20 slides and member booking appendix. Video shown as still images.")
    pdf.setCreator("Dulcinea online presentation export")
    pdf._doc.Catalog.Lang = PDFString({"en": "en-US", "es": "es-CO", "fr": "fr-FR"}[language])
    for identifier in order:
        page = pages[identifier]
        image = Path(page["file"])
        with Image.open(image) as picture:
            assert picture.size == (1440, 810), f"Incorrect capture size: {image}"
        assert not page.get("overflows"), f"Text outside canvas: {identifier}"
        assert all(item["loaded"] for item in page["images"]), f"Missing image: {identifier}"
        pdf.drawImage(str(image), 0, 0, width=width, height=height)
        pdf.bookmarkPage(identifier)
        title = titles[identifier][language == "es"]
        pdf.addOutlineEntry(french.get(title, title) if language == "fr" else title, identifier)
        for link in page["links"]:
            box = link["box"]
            if not (0 <= box["left"] < box["right"] <= 1440 and 0 <= box["top"] < box["bottom"] <= 810):
                continue
            rect = (box["left"] * scale, height - box["bottom"] * scale, box["right"] * scale, height - box["top"] * scale)
            url = urlsplit(link["href"])
            subject = url.fragment.removeprefix("present-")
            if url.fragment.startswith("present-") and subject in order:
                pdf.linkRect("", subject, rect, relative=0, thickness=0)
            else:
                target = urlunsplit(("https", "invest.dulcineainvestments.org", url.path, url.query, url.fragment)) if url.hostname in ("localhost", "127.0.0.1") else link["href"]
                pdf.linkURL(target, rect, relative=0, thickness=0)
        pdf.showPage()
    pdf.save()
    reader = PdfReader(filename)
    assert len(reader.pages) == 21
    assert all(float(page.mediabox.width) == width and float(page.mediabox.height) == height for page in reader.pages)
    assert len(reader.outline) == 21
    print(f"{filename.name}: 21 pages, {filename.stat().st_size:,} bytes")
