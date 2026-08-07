#!/usr/bin/env python3
"""Verifica a saúde de um site estático:

1. Todos os arquivos JSON do repositório são válidos
2. Página principal existe (index.html na raiz ou em docs/)
3. Referências locais (href/src relativas) dos HTML apontam para arquivos existentes

Uso:  python3 scripts/verify_site.py
Saída: exit code 0 se tudo OK, 1 se houver erros.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
errors: list[str] = []
warnings: list[str] = []

SKIP_DIRS = {".git", "node_modules", "dist", ".next", "out"}


def is_skip(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.parts)


# 1. JSON válidos
json_count = 0
for p in sorted(ROOT.rglob("*.json")):
    if is_skip(p):
        continue
    json_count += 1
    try:
        json.loads(p.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        errors.append(f"JSON inválido: {p.relative_to(ROOT)} -> {exc}")
print(f"✔ {json_count} arquivo(s) JSON validado(s)")

# 2. Página principal
entry = ROOT / "index.html"
if not entry.exists():
    entry = ROOT / "docs" / "index.html"
if entry.exists():
    print(f"✔ Página principal: {entry.relative_to(ROOT)}")
else:
    errors.append("Nenhum index.html encontrado na raiz ou em docs/")

# 3. Referências locais dos HTML
EXTERNAL = ("http://", "https://", "mailto:", "tel:", "data:", "javascript:", "//")
html_count = 0
ref_count = 0
for html in sorted(ROOT.rglob("*.html")):
    if is_skip(html):
        continue
    html_count += 1
    try:
        text = html.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        warnings.append(f"Não foi possível ler {html.relative_to(ROOT)}: {exc}")
        continue
    base = html.parent
    for attr in ("href", "src", "poster"):
        for match in re.finditer(rf'{attr}\s*=\s*"([^"]+)"', text):
            ref = match.group(1).strip()
            if not ref or ref.startswith(("#", "/")) or ref.startswith(EXTERNAL):
                continue
            ref = ref.split("?")[0].split("#")[0]
            # Referências dinâmicas (template literals JS etc.) não são verificáveis
            if "${" in ref or any(ch in ref for ch in ("+", "*", " ")):
                continue
            target = (base / ref).resolve()
            try:
                target.relative_to(ROOT.resolve())
            except ValueError:
                warnings.append(f"{html.relative_to(ROOT)}: referência fora do repo: {ref}")
                continue
            if not target.exists():
                errors.append(f"{html.relative_to(ROOT)}: referência quebrada: {ref}")
            else:
                ref_count += 1
print(f"✔ {html_count} arquivo(s) HTML verificado(s), {ref_count} referência(s) local(is) ok")

# Resumo
if warnings:
    print("\n⚠ Avisos (não bloqueiam):")
    for w in warnings[:10]:
        print(f"  - {w}")
    if len(warnings) > 10:
        print(f"  ... e mais {len(warnings) - 10}")

if errors:
    print(f"\n✘ {len(errors)} erro(s):")
    for e in errors[:15]:
        print(f"  - {e}")
    sys.exit(1)

print("\n✔ Site OK!")
