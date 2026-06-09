#!/usr/bin/env python3
"""Compare capped vs sheet enemy atk across early/late progression tiers."""
import json
import random
import re
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BALANCE = ROOT / "balance-data.js"

def load_monsters():
    text = BALANCE.read_text(encoding="utf-8")
    return json.loads(re.search(r'"monsters":\s*(\[.*?\])\s*,\s*"weapons"', text, re.S).group(1))

def capped_dmg(name):
    lower = (name or "").lower()
    if "dragon" in lower:
        return 5
    if "lich king" in lower:
        return 4
    if "lich" in lower:
        return 3
    return 2

def sheet_dmg(mon):
    return max(1, int(mon.get("atk") or 2))

def hp_mult(leg, day_ratio):
    return 1 + leg * 0.35 + day_ratio * 0.15

def party_dmg(level, stats):
    d = 4 + max(0, stats["strength"] - 4) * (2 if level >= 10 else 1)
    return max(1, d)

def party_hp_pool(level, stats):
    per = 10 + max(0, stats["stamina"] - 4) * 2 + max(0, level - 1) * 2
    return per * 4

def simulate(monsters, scenario, use_sheet_atk, trials=5000):
    leg, day_r, party_level = scenario
    mult = hp_mult(leg, day_r)
    pool = [m for m in monsters if (m.get("level") or 1) <= party_level + 2] or monsters
    soldier = {"strength": 7, "stamina": 5}
    deaths = 0
    rounds_list = []
    hp_left = []
    dmg_taken = []
    for _ in range(trials):
        foes = []
        for _ in range(random.randint(1, 3)):
            mon = random.choice(pool)
            foes.append({
                "hp": max(1, round(int(mon["hp"]) * mult)),
                "atk": sheet_dmg(mon) if use_sheet_atk else capped_dmg(mon["name"]),
            })
        php = party_hp_pool(party_level, soldier)
        patk = party_dmg(party_level, soldier) * 4
        rounds = 0
        taken = 0
        while rounds < 100:
            rounds += 1
            t = min(foes, key=lambda f: f["hp"])
            t["hp"] -= patk
            foes = [f for f in foes if f["hp"] > 0]
            if not foes:
                break
            for f in foes:
                if php <= 0:
                    break
                php -= f["atk"]
                taken += f["atk"]
            if php <= 0:
                deaths += 1
                break
        rounds_list.append(rounds)
        hp_left.append(max(0, php) / party_hp_pool(party_level, soldier))
        dmg_taken.append(taken)
    return {
        "mean_rounds": statistics.mean(rounds_list),
        "death_rate": deaths / trials,
        "mean_hp_left_pct": statistics.mean(hp_left),
        "mean_dmg_taken": statistics.mean(dmg_taken),
    }

def main():
    monsters = load_monsters()
    scenarios = [
        ("early L1 leg0", (0, 0.15, 1)),
        ("early L2 leg0", (0, 0.3, 2)),
        ("mid L5 leg2", (2, 0.5, 5)),
        ("late L8 leg4", (4, 0.85, 8)),
        ("late L10 leg4", (4, 1.0, 10)),
    ]
    print("Monte Carlo — 4 soldiers, focus fire, no defend/heal\n")
    print(f"{'scenario':<22}  capped: rnd  die%  hpLeft | sheet: rnd  die%  hpLeft | Δdie")
    for label, sc in scenarios:
        c = simulate(monsters, sc, False)
        a = simulate(monsters, sc, True)
        print(
            f"{label:<22}  {c['mean_rounds']:4.1f} {c['death_rate']*100:5.1f}% {c['mean_hp_left_pct']*100:5.0f}%"
            f" | {a['mean_rounds']:4.1f} {a['death_rate']*100:5.1f}% {a['mean_hp_left_pct']*100:5.0f}%"
            f" | {((a['death_rate']-c['death_rate'])*100):+5.1f} pp"
        )
    print("\nLargest cap undervalues:")
    for mon in sorted(monsters, key=lambda m: sheet_dmg(m) - capped_dmg(m["name"]), reverse=True)[:10]:
        print(f"  {mon['name']}: capped={capped_dmg(mon['name'])} sheet={sheet_dmg(mon)}")

if __name__ == "__main__":
    main()
