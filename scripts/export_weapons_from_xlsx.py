#!/usr/bin/env python3
"""Merge weapons tab from chart for game.xlsx into balance-data.js.

Purchase rule (weapons tab):
  Column [purchase]: y = sold at any town shop; n = loot/treasure only.
  If [purchase] is missing, infer: numeric buy price => y; "-" or blank => n.
"""
import json, re, sys
from pathlib import Path

try:
    import openpyxl
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "openpyxl", "-q"])
    import openpyxl

ROOT = Path(__file__).resolve().parents[1]
XLSX = ROOT / "chart for game.xlsx"
BALANCE = ROOT / "balance-data.js"
RARITY = {"c": "common", "u": "uncommon", "r": "rare", "ur": "ultra_rare"}

def slug(text):
    return re.sub(r"[^a-z0-9]+", "_", str(text).lower()).strip("_")

def norm_rarity(raw):
    if raw is None: return "common"
    s = str(raw).strip().lower()
    if s in RARITY: return RARITY[s]
    if "ultra" in s or s == "ur": return "ultra_rare"
    if s.startswith("r"): return "rare"
    if s.startswith("u"): return "uncommon"
    return "common"

def find_purchase_column(rows):
    for row in rows[:8]:
        for ci, cell in enumerate(row or []):
            if cell and "purchase" in str(cell).lower():
                return ci
    return None

def parse_weapons_sheet(path):
    ws = openpyxl.load_workbook(path, read_only=True, data_only=True)["weapons"]
    rows = list(ws.iter_rows(values_only=True))
    purchase_col = find_purchase_column(rows)
    current_group = None
    out = []
    for row in rows:
        if not row or not row[0] or row[0] == "Weapons":
            continue
        if row[1] == "dmg modifier":
            current_group = slug(row[0])
            continue
        if row[1] is None or str(row[1]).strip() == "":
            continue
        name = str(row[0]).strip()
        buy_raw = row[7] if len(row) > 7 else None
        sell_raw = row[5] if len(row) > 5 else None
        purch_raw = row[purchase_col] if purchase_col is not None and len(row) > purchase_col else None
        purchase = None
        if purch_raw is not None and str(purch_raw).strip():
            p = str(purch_raw).strip().lower()
            if p in ("y", "yes", "true", "1"): purchase = True
            elif p in ("n", "no", "false", "0"): purchase = False
        if purchase is None:
            if buy_raw is None or str(buy_raw).strip() in ("", "-", "\u2014"):
                purchase = False
            else:
                try:
                    float(buy_raw)
                    purchase = True
                except ValueError:
                    purchase = False
        buy_price = sell_price = None
        if purchase:
            try:
                buy_price = int(float(buy_raw))
            except (TypeError, ValueError):
                purchase = False
        try:
            if sell_raw is not None and str(sell_raw).strip() not in ("", "-", "\u2014"):
                sell_price = int(float(sell_raw))
        except (TypeError, ValueError):
            pass
        try:
            dmg_modifier = int(float(row[1]))
        except (TypeError, ValueError):
            dmg_modifier = 1
        extras = [str(row[j]).strip() for j in range(2, 4) if j < len(row) and row[j]]
        entry = {
            "name": name, "id": slug(name), "group": current_group or "misc",
            "dmgModifier": dmg_modifier, "extras": extras,
            "rarity": norm_rarity(row[6] if len(row) > 6 else None),
            "purchase": purchase,
        }
        if buy_price is not None: entry["buyPrice"] = buy_price
        if sell_price is not None: entry["sellPrice"] = sell_price
        out.append(entry)
    return out



def sync_equipment_weapon_damage(catalog, weapons):
    by_id = {w.get("id"): w for w in weapons if w.get("id")}
    out = []
    for item in catalog:
        row = dict(item)
        if row.get("slot") == "weapon" and row.get("id") in by_id:
            mod = by_id[row["id"]].get("dmgModifier")
            if isinstance(mod, (int, float)):
                row["dmgBonus"] = int(mod)
        out.append(row)
    return out

def merge_weapons(existing, sheet_rows):
    by_id = {w.get("id"): w for w in existing if w.get("id")}
    by_name = {w.get("name", "").lower(): w for w in existing if w.get("name")}
    merged = []
    for sw in sheet_rows:
        ex = by_id.get(sw["id"]) or by_name.get(sw["name"].lower())
        row = dict(ex) if ex else {}
        row.update(sw)
        row["id"] = (ex or {}).get("id") or sw["id"]
        merged.append(row)
    return merged

def main():
    text = BALANCE.read_text(encoding="utf-8")
    existing = json.loads(re.search(r'"weapons":\s*(\[.*?\])\s*,\s*\n\s*"statGainsPerClass"', text, re.S).group(1))
    weapons = parse_weapons_sheet(XLSX)
    merged = merge_weapons(existing, weapons)
    block = json.dumps(merged, indent=2)
    text = re.sub(r'"weapons":\s*\[.*?\]\s*,\s*\n\s*"statGainsPerClass"', '"weapons": ' + block + ',\n  "statGainsPerClass"', text, count=1, flags=re.S)
    catalog = json.loads(re.search(r'"equipmentCatalog":\s*(\[.*?\])\s*\n\}', text, re.S).group(1))
    catalog = sync_equipment_weapon_damage(catalog, merged)
    cat_block = json.dumps(catalog, indent=2)
    text = re.sub(r'"equipmentCatalog":\s*\[.*?\]\s*\n\}', '"equipmentCatalog": ' + cat_block + '\n}', text, count=1, flags=re.S)
    BALANCE.write_text(text, encoding="utf-8")
    y = sum(1 for w in weapons if w.get("purchase"))
    print(f"Exported {len(weapons)} weapons ({y} shop, {len(weapons)-y} loot-only)")

if __name__ == "__main__":
    main()
