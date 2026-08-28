#!/usr/bin/env python3
"""Detecta dependencias de navegador alcanzables desde páginas Inertia por imports estáticos."""

from __future__ import annotations

import argparse
import re
from collections.abc import Iterator
from dataclasses import dataclass
from pathlib import Path


BROWSER_PACKAGES = {
    "leaflet",
    "leaflet-draw",
    "leaflet-control-geocoder",
    "mapbox-gl",
    "maplibre-gl",
    "react-leaflet",
}
IMPORT_STATEMENT = re.compile(r"(?ms)^\s*import\b.*?;")
IMPORT_TARGET = re.compile(r"['\"]([^'\"]+)['\"]")
GLOBAL_PATTERN = re.compile(r"\b(window|document|navigator|localStorage|sessionStorage)\b")
SOURCE_EXTENSIONS = (".ts", ".tsx")


@dataclass(frozen=True)
class Finding:
    page: Path
    path: Path
    package: str
    lineage: tuple[Path, ...]


def static_imports(source: str) -> Iterator[str]:
    for statement in IMPORT_STATEMENT.finditer(source):
        code = statement.group()

        if re.match(r"^\s*import\s+type\b", code):
            continue

        targets = IMPORT_TARGET.findall(code)
        if targets:
            yield targets[-1]


def source_file(path: Path) -> Path | None:
    if path.is_file():
        return path

    for extension in SOURCE_EXTENSIONS:
        candidate = path.with_suffix(extension)
        if candidate.is_file():
            return candidate

    for extension in SOURCE_EXTENSIONS:
        candidate = path / f"index{extension}"
        if candidate.is_file():
            return candidate

    return None


def resolve_local_import(source: Path, target: str, root: Path) -> Path | None:
    if target.startswith("@/"):
        return source_file(root / target.removeprefix("@/"))

    if target.startswith("."):
        return source_file(source.parent / target)

    return None


def browser_package(target: str) -> str | None:
    package = target.split("/", maxsplit=1)[0]
    if target.startswith("@"):
        package = "/".join(target.split("/", maxsplit=2)[:2])

    return package if package in BROWSER_PACKAGES else None


def find_findings(root: Path) -> list[Finding]:
    findings: list[Finding] = []

    def visit(page: Path, path: Path, lineage: tuple[Path, ...], visited: set[Path]) -> None:
        if path in visited:
            return

        visited.add(path)
        source = path.read_text(encoding="utf-8")

        for target in static_imports(source):
            package = browser_package(target)
            if package is not None:
                findings.append(Finding(page, path, package, lineage + (path,)))
                continue

            dependency = resolve_local_import(path, target, root)
            if dependency is not None:
                visit(page, dependency, lineage + (path,), visited)

    for page in sorted((root / "pages").rglob("*.tsx")):
        visit(page, page, (), set())

    return findings


def browser_global_candidates(root: Path) -> Iterator[tuple[Path, int, str]]:
    for path in sorted(root.rglob("*")):
        if path.suffix not in SOURCE_EXTENSIONS or path.name.endswith(".d.ts"):
            continue

        for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            if GLOBAL_PATTERN.search(line):
                yield path, line_number, line.strip()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--details",
        action="store_true",
        help="Incluye candidatos de globals; requieren revisión manual porque pueden estar dentro de useEffect o eventos.",
    )
    parser.add_argument(
        "root",
        nargs="?",
        type=Path,
        default=Path("resources/js"),
        help="Directorio TypeScript a inspeccionar (por defecto: resources/js)",
    )
    args = parser.parse_args()
    findings = find_findings(args.root)

    if not findings:
        print("SSR audit: no browser-only package is reachable through static page imports.")
    else:
        print("SSR audit: browser-only packages reachable during page SSR:")
        for finding in findings:
            chain = " -> ".join(str(part) for part in finding.lineage)
            print(f"- {finding.package}: {chain} (page: {finding.page})")

    if args.details:
        print("\nAdvisory browser-global candidates (not failures by themselves):")
        for path, line, code in browser_global_candidates(args.root):
            print(f"- {path}:{line} {code}")

    return 1 if findings else 0


if __name__ == "__main__":
    raise SystemExit(main())
