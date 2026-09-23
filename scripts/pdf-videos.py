"""Lees oefenvideo's uit de lokale PPL-PDF.

Vereist PyMuPDF: python -m pip install PyMuPDF
Uitvoer: scripts/pdf-videos.json (lokaal, buiten de app-build).
"""

import json
import re
from collections import defaultdict
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import pymupdf


ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "The_Pure_Bodybuilding_Program_-_PPL.pdf"
OUTPUT = Path(__file__).with_name("pdf-videos.json")
VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")


def video_from_uri(uri):
    parsed = urlparse(uri)
    if parsed.scheme != "https" or parsed.netloc != "youtu.be":
        return None
    video_id = parsed.path.removeprefix("/")
    if not VIDEO_ID.fullmatch(video_id):
        raise ValueError(f"Ongeldige YouTube-ID: {uri}")
    start = parse_qs(parsed.query).get("t", [None])[0]
    if start is not None and not start.isdecimal():
        raise ValueError(f"Ongeldige starttijd: {uri}")
    return video_id, int(start) if start is not None else None


def text_in_rect(words, rect):
    # Woorden worden per pagina eenmaal gelezen: get_textbox per link is hier erg traag.
    return " ".join(
        word[4] for word in words
        if rect.contains(pymupdf.Point((word[0] + word[2]) / 2, (word[1] + word[3]) / 2))
    ).strip()


def extract():
    links = []
    occurrences = []
    with pymupdf.open(PDF) as document:
        for page_number, page in enumerate(document, start=1):
            words = page.get_text("words")
            page_links = []
            for link in page.get_links():
                video = video_from_uri(link.get("uri", ""))
                if video is None:
                    continue
                video_id, start = video
                rect = link["from"]
                entry = {
                    "page": page_number,
                    "text": text_in_rect(words, rect),
                    "videoId": video_id,
                    "startSeconds": start,
                }
                links.append(entry)
                page_links.append((entry, rect))

            # Een regelafbreking in een tabel maakt vaak twee linkvlakken van een naam.
            current = None
            previous_rect = None
            for entry, rect in page_links:
                same_name = (
                    current is not None
                    and current["videoId"] == entry["videoId"]
                    and current["startSeconds"] == entry["startSeconds"]
                    and 0 <= rect.y0 - previous_rect.y0 <= 24
                    and abs((rect.x0 + rect.x1 - previous_rect.x0 - previous_rect.x1) / 2) < 100
                )
                if same_name:
                    current["text"] += " " + entry["text"]
                else:
                    current = dict(entry)
                    occurrences.append(current)
                previous_rect = rect

    by_name = defaultdict(list)
    for occurrence in occurrences:
        name = " ".join(occurrence["text"].split())
        if name:
            by_name[name.casefold()].append(occurrence)

    exercises = [
        {"name": items[0]["text"], "occurrences": items}
        for items in by_name.values()
    ]
    conflicts = [
        {"name": item["name"], "videoIds": sorted({row["videoId"] for row in item["occurrences"]})}
        for item in exercises
        if len({row["videoId"] for row in item["occurrences"]}) > 1
    ]
    return {"links": links, "exercises": exercises, "conflicts": conflicts}


def main():
    result = extract()
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(result['links'])} links, {len(result['exercises'])} namen, "
          f"{len(result['conflicts'])} namen met meerdere video-ID's: {OUTPUT}")
    for conflict in result["conflicts"]:
        print(f"  {conflict['name']}: {', '.join(conflict['videoIds'])}")


if __name__ == "__main__":
    main()
