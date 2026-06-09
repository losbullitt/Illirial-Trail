#!/usr/bin/env python3
"""Sync equipmentCatalog weapon dmgBonus from weapons sheet dmgModifier."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BALANCE = ROOT / "balance-data.js"


def load_balance_arrays(text):
    weapons = json.loads(
        re.search(r'"weapons":\s*(\[.*?\])\s*,\s*\n\s*"statGainsPerClass"', text, re.S).group(1)
    )
    catalog = json.loads(
        re.search(r'"equipmentCatalog":\s*(\[.*?\])\s*\n\}', text, re.S).group(1)
    )
    return weapons, catalog


def sync_catalog_damage(catalog, weapons):
    by_id = {w.get("id"): w for w in weapons if w.get("id")}
    synced = 0
    for item in catalog:
        if item.get("slot") != "weapon" or not item.get("id"):
            continue
        w = by_id.get(item["id"])
        if not w or "dmgModifier" not in w:
            continue
        dmg = int(w["dmgModifier"])
        if item.get("dmgBonus") != dmg:
            item["dmgBonus"] = dmg
            synced += 1
    return catalog, synced


def main():
    text = BALANCE.read_text(encoding="utf-8")
    weapons, catalog = load_balance_arrays(text)
    catalog, synced = sync_catalog_damage(catalog, weapons)
    cat_block = json.dumps(catalog, indent=2)
    text = re.sub(
        r'"equipmentCatalog":\s*\[.*?\]\s*\n\}',
        '"equipmentCatalog": ' + cat_block + "\n}",
        text,
        count=1,
        flags=re.S,
    )
    BALANCE.write_text(text, encoding="utf-8")
    print(f"Synced {synced} weapon dmgBonus values in equipmentCatalog")


if __name__ == "__main__":
    main()
