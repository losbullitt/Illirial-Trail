# Settlement growth (planned)

**Status:** Parked after v6.0.0 — data hooks exist; simulation not implemented.

## Goal

Companions left behind in **New Isil** (`state.newIsilSettlers`) should eventually influence how the harbor city grows between caravan loops.

## v6.0.0 hooks in `game.js`

| State field | Purpose |
|-------------|---------|
| `newIsilSettlers[]` | Who was settled (name, role, day, loop index) |
| `newIsilGrowth.population` | Simple count = settlers + baseline |
| `caravanLoops` | How many times the party returned to Cantebury |
| `totalDaysElapsed` vs `stabilityTargetDays` (100) | Stability win condition |

## Future design questions

- Do settlers grant passive income, recruits, or shop stock on return visits?
- Class mix (farmers vs soldiers) changing growth rate?
- Memorial / reputation effects from prior runs?
- Export growth tables from spreadsheet tab (TBD)?

## Related

- Cantebury ↔ New Isil loop: march **westward** to the harbor, settle members, march **eastbound** home, then west again until **100 journey days**.
