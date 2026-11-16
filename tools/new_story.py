#!/usr/bin/env python3
"""Create a new story folder from stories/_template and register it in stories/registry.ts.

    npm run new-story -- lakshman-neend --title "Lakshman ji ki neend" \
        --hook "Lakshman 14 saal soye kyun nahi?" --language hinglish --style paperCutout \
        --series "Ramayan ki 30 kahaniyan" --part 1
"""
import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "stories" / "_template"
REGISTRY = ROOT / "stories" / "registry.ts"
LANGUAGES = ["hinglish", "hindi", "english", "other"]
STYLES = ["flat", "paperCutout", "madhubani", "glowLine", "stickTales"]


def camel(slug: str) -> str:
    head, *rest = slug.split("-")
    return head + "".join(w.capitalize() for w in rest)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("slug", help="folder and composition name: lower-case letters, numbers, dashes")
    p.add_argument("--title", help="story title (default: the slug)")
    p.add_argument("--hook", default="TODO: the question the reel opens with")
    p.add_argument("--language", choices=LANGUAGES, default="hinglish")
    p.add_argument("--style", choices=STYLES, default="flat")
    p.add_argument("--series", default="")
    p.add_argument("--part", type=int, default=1)
    a = p.parse_args()

    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", a.slug):
        print("error: slug must be lower-case letters, numbers and single dashes, e.g. lakshman-neend", file=sys.stderr)
        return 1
    dest = ROOT / "stories" / a.slug
    if dest.exists():
        print(f"error: {dest} already exists", file=sys.stderr)
        return 1

    values = {
        "slug": a.slug,
        "title": a.title or a.slug,
        "hook": a.hook,
        "language": a.language,
        "style": a.style,
        "series": a.series,
        "part": str(a.part),
    }
    dest.mkdir(parents=True)
    for src in sorted(TEMPLATE.iterdir()):
        if src.name.startswith("."):
            continue
        text = src.read_text(encoding="utf-8")
        for k, v in values.items():
            text = text.replace("{{" + k + "}}", v.replace("\\", "\\\\").replace('"', '\\"') if src.suffix == ".json" else v)
        (dest / src.name).write_text(text, encoding="utf-8")
    (dest / "timings.json").write_text('{"audio": "", "language": "", "duration": 0, "words": []}\n', encoding="utf-8")

    name = camel(a.slug)
    reg = REGISTRY.read_text(encoding="utf-8")
    reg = reg.replace(
        "// <stories:imports>",
        f"// <stories:imports>\nimport {name} from './{a.slug}/story.json';\nimport {name}Timings from './{a.slug}/timings.json';",
    )
    reg = reg.replace("  // <stories:list>", f"  // <stories:list>\n  entry({name}, {name}Timings),")
    REGISTRY.write_text(reg, encoding="utf-8")

    print(f"created stories/{a.slug}/ and registered it.")
    print("next: write the script (script.md + voice.txt), get it approved, record the voice, then run the timings.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
