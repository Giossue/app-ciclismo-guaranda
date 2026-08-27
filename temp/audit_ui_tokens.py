#!/usr/bin/env python3
"""Inventaría radios, sombras y colores utilitarios en la UI de Guaranda Go.

Uso:
    python3 temp/audit_ui_tokens.py
    python3 temp/audit_ui_tokens.py --details

No modifica archivos. Sirve para localizar estilos que aún no consumen los
tokens globales de resources/css/app.css antes de un refactor visual.
"""

from __future__ import annotations

import argparse
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
TARGETS = (ROOT / "resources" / "js", ROOT / "resources" / "css")
EXTENSIONS = {".css", ".ts", ".tsx"}
EXCLUDED_PARTS = {"actions", "routes", "wayfinder"}
PATTERNS = {
    "radius": re.compile(r"(?<![\w-])(rounded(?:-[\w\[\]()./%-]+)?)"),
    "shadow": re.compile(r"(?<![\w-])(shadow(?:-[\w\[\]()./%-]+)?)"),
    "raw_color": re.compile(
        r"(?<![\w-])(?:bg|text|border|ring|fill|stroke)-(?:red|orange|yellow|"
        r"green|blue|indigo|purple|pink|gray|slate|zinc|neutral|white|black)-"
        r"[\w/\[\].%-]+"
    ),
    "css_radius_token": re.compile(r"--[\w-]*(?:radius|radius)[\w-]*"),
    "literal_css_radius": re.compile(r"border-radius:\s*([^;]+);"),
}


def files_to_scan() -> list[Path]:
    return sorted(
        file
        for target in TARGETS
        for file in target.rglob("*")
        if file.is_file()
        and file.suffix in EXTENSIONS
        and not EXCLUDED_PARTS.intersection(file.relative_to(ROOT).parts)
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--details", action="store_true", help="Muestra coincidencias por archivo."
    )
    args = parser.parse_args()

    totals: dict[str, Counter[str]] = defaultdict(Counter)
    by_file: dict[str, dict[Path, Counter[str]]] = defaultdict(lambda: defaultdict(Counter))

    for file in files_to_scan():
        content = file.read_text(encoding="utf-8")
        for category, pattern in PATTERNS.items():
            matches = pattern.findall(content)
            if not matches:
                continue
            totals[category].update(matches)
            by_file[category][file].update(matches)

    print(f"Archivos analizados: {len(files_to_scan())}")
    for category in (
        "radius",
        "shadow",
        "raw_color",
        "css_radius_token",
        "literal_css_radius",
    ):
        print(f"\n{category} ({sum(totals[category].values())} coincidencias)")
        for value, count in totals[category].most_common():
            print(f"  {count:>4}  {value}")

        if args.details:
            print("  Archivos:")
            for file, values in sorted(by_file[category].items()):
                summary = ", ".join(
                    f"{value}×{count}" for value, count in values.most_common()
                )
                print(f"    {file.relative_to(ROOT)}: {summary}")


if __name__ == "__main__":
    main()
