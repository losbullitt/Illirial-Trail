# Illirial Trail Progress Snapshot

Last updated: 2026-04-27
Current version: 3.2.4

## Compartment checklist (active)
- settlements
- economy
- monsters
- weapons
- progression_balance
- telemetry_meta
- npc

## Legacy compartments (for reference)
- weapons_and_monsters removed after split into monsters and weapons
- combat
- characters
- ui
- travel_methods
- gameplay

## Versioning rule in use
- Continue patching within the current minor train until `.9`, then roll to the next minor (`3.1.9 -> 3.2.0`).

## Implemented so far

### travel_methods
- Branch destination choice from Cantebury: New Isil or Gustaf.
- Chained travel flow: Cantebury -> Gustaf -> New Isil.
- New Isil arrival ends the run (test-run completion).
- Leg-specific route durations:
  - to Gustaf: 4 days
  - to New Isil: 7 days
- Dynamic route labels and progress text based on current origin/destination.
- Gustaf destination art wired from `images/Gustaf.jpeg`.

### characters
- New character creation with class, gender, age, hometown, bio, and bonus stat allocation.
- Headshot picker in create-character flow (paged choices with show-more).
- Preset leader now has default portrait: `images/headshot/Vale.jpeg`.
- Party members (starter + recruits) receive randomized class/gender-matched portraits.
- Portraits are session-locked; no duplicate portrait reuse within active party when possible.
- Inventory/paper-doll profile opens per individual member and shows stats/progress.

### combat
- Sequential action planning and target selection by character.
- Auto button for round planning.
- Monsters now use balance-data HP values.
- Monster attack baseline increased to 2.

### weapons_and_monsters
- Spreadsheet-backed monster/weapon data loaded via `balance-data.js`.
- Random encounters pull from full monster list.
- Weapon inventory remains wired; settlement shop can purchase weapons.

### gameplay
- Starting resources: 25 gold, 10 supplies.
- Supplies unified (food + water merged).
- XP/leveling is per character; guest/static members excluded from progression.
- Settlement hubs (entered towns) now include church, tavern, shop, and depart tabs.
- Shop in settlements supports supplies, weapons, and gem selling.

### ui
- Top header carries live version text (`web prototype vX.Y.Z`).
- Cache-busting script/style query versions updated with each pass.
- Balance Data screen present in-town.

## Tracking
- Lightweight playtest tracking active (`tracking.js`).
- Endpoint currently configured in `index.html` meta tag.

## Core files touched repeatedly
- `game.js`
- `styles.css`
- `index.html`
- `balance-data.js`
- `tracking.js`

## Immediate next-safe checks when resuming work
- Verify `balance-data.js` version matches header version text in `index.html`.
- Verify cache query bumps for modified assets.
- Run `node --check game.js` after substantial logic edits.
