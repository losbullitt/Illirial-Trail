# Cantebury Trails — Player & Technical Manual

**Version:** 6.3.0 (web prototype)  
**Repository:** [losbullitt/Illirial-Trail](https://github.com/losbullitt/Illirial-Trail)

---

## 1. Introduction

**Cantebury Trails** is a single-player, browser-first game in the spirit of *The Oregon Trail*, set in a medieval fantasy world. You lead a caravan from the outpost city of **Cantebury** westward along the trade road toward the harbor colony of **New Isil**.

Your job is to prepare a party, manage supplies, survive travel and combat, visit settlements along the route, and complete the campaign before attrition wins.

### What kind of game is this?

| Aspect | Detail |
|--------|--------|
| **Genre** | Trail simulation + light RPG (party, stats, combat, inventory) |
| **Platform** | Web browser (primary); optional desktop wrapper via Python |
| **Save model** | Browser session + local storage for memorial/headstone data — no cloud account |
| **Status** | Active prototype; balance and features change between versions |

### The world in one sentence

Cantebury sends caravans west through forked roads, marsh towns, and citadels; New Isil is the harbor goal; Governor **Kew Kumber** and the road itself can extend how long the march must last.

---

## 2. How to play (getting the game running)

### Play online (no install)

Open in a modern browser (Chrome, Firefox, Safari, Edge):

**https://losbullitt.github.io/Illirial-Trail/index.html**

Use the full `index.html` URL. Opening the bare repo URL can fail to load scripts on some browsers.

### Play locally (developers / offline)

From the project folder, start a static file server, then open the app:

```bash
cd Illirial-Trail
python3 -m http.server 8080
```

Browser: **http://127.0.0.1:8080/index.html**

On Windows you can also use `serve.ps1` or `py -3 -m http.server 8080`.

### Desktop window (optional)

Requires Python and pywebview:

```bash
py -3 -m pip install pywebview
py -3 desktop.py
```

Or double-click `desktop.bat` on Windows.

### Version check

The live build version appears in the page header, e.g. `web prototype v6.3.0`, and in `balance-data.js`.

---

## 3. How to play (gameplay)

### 3.1 Start a new run

When the game loads, choose how to begin:

- **New character** — Build your caravan leader: name, class, gender, age, hometown, bio, portrait, and bonus stat points.
- **Preset character** — A leader with existing backstory; the rest of the party is rolled randomly.

After setup you arrive in **Cantebury** with starting resources (typical run: gold, supplies, a small civilian caravan, and a fighting party).

### 3.2 Party and classes

- Up to **5** active party members in the fighting line.
- Core classes include **Soldier**, **Priest**, **Mercenary**, and **Mage** (each with different HP, stats, and combat roles).
- Stats: **Strength**, **Intelligence**, **Stamina**, **Luck** — they affect combat, growth, and some interactions.
- Members can **level up** from XP earned in fights; HP and MP matter on the road and in combat.

### 3.3 Cantebury (starting hub)

Tabs at Cantebury:

| Tab | Purpose |
|-----|---------|
| **Castle** | Speak with Governor Kew Kumber and Chancellor Aldric Venn |
| **City** | Shop for supplies, weapons, armor, potions |
| **Party** | Roster, character sheets, inventory, equipment, trail ledger |
| **Adventure** | Short local trek for encounters and loot (consumes supplies) |
| **Depart** | Choose your first westbound fork and begin the march |

### 3.4 The western route (v6.3 forks)

The trail is not a single straight line. Each **fork pair** lets you pick one branch westbound; you do not visit both towns in the same pair on one outbound march.

```
Cantebury
    ├─ Gustaf (port)          ─┐  lower fork — pick one
    └─ Brookside (village)    ─┘
              ↓
    ├─ Hollow Banks (marsh)   ─┐  upper fork — pick one
    └─ Glennhardt (city)      ─┘
              ↓
         Solem (citadel)
              ↓
         New Isil (harbor)
```

Your choices are **remembered**. On the **eastbound return**, you generally march your route in **reverse**, with options to detour to towns you visited earlier.

Each leg length is rolled once per route key (typically **3–10 travel days**) and stays consistent for that hop on later loops.

### 3.5 Travel

On the road:

- Press **Next day** to advance. Each day usually costs **1 supply** (rations).
- **Encounter chance** rises after quiet days; fights scale with how far west you have marched.
- Party members recover **+1 MP** per travel day; **Camp** can restore more.
- **Ruins** may appear on the map — optional side content with encounters and loot.
- Open **Inventory** during travel for the trail ledger (gold, supplies, caravan, journey progress).

**Caravan civilians** (farmers, artisans, etc.) travel with you until the first full arrival at New Isil, when they disembark to help settle the harbor. A new civilian train may be assigned when you return to Cantebury.

**Rations:** You can set caravan rations to **normal** or **stretch** (supplies last longer; morale may suffer).

### 3.6 Settlements

When you reach a town (Gustaf, Brookside, Hollow Banks, Glennhardt, Solem, or New Isil), you enter a settlement hub with tabs:

| Tab | Purpose |
|-----|---------|
| **Castle / Keep** | Cantebury and Solem only — officials and story dialogue |
| **Church** | Blessings, memorials, headstones for fallen companions |
| **Inn** | Paid full rest or free stables rest (efficiency drops with consecutive stable nights) |
| **Tavern** | Barkeep dialogue, quests, rumors |
| **Shop** | Resupply — food, potions, weapons, armor, gem trading |
| **Party** | Inventory, equipment, quests panel |
| **Adventure** | Multi-day trek near the town (outbound encounters; return leg is safer) |
| **Depart** | Continue west, or (on eastbound march) revisit towns toward Cantebury |

**Recruiting** varies by town: Solem favors soldiers; small villages offer few slots; Glennhardt can field a fuller roster.

### 3.7 Combat

Combat is turn-based:

- Plan actions for each living party member (attack, defend, spell, item, etc.).
- **Auto** can plan a round for you.
- Enemies use spreadsheet-backed stats from `balance-data.js`; tougher creatures appear deeper on the western march.
- Use potions from inventory or combat menus. Priests can heal allies.
- If a member falls, they may later appear in the **Church** memorial system; revives and headstones track journey context.

### 3.8 Inventory and equipment

- Each character has gear slots: **weapons** and **armor** affect ATK/DEF.
- Items include healing potions, life potions, magic potions (MP restore), and equippable gear bought in shops.
- The **Party / Inventory** screen is the hub for using items in town or on the road.
- **Cover** photo logic applies to party presentation where portraits are used.

### 3.9 New Isil and winning

**Campaign goal (v6.3):** Reach **New Isil** after logging enough **journey days** (default target: **100 days**, shown in the UI). The run ends in victory when you arrive at New Isil with the journey threshold met and any final gate cleared.

At New Isil you can:

- **Settle** companions to grow harbor population (at least one leader must remain to continue).
- On the **eastbound return**, invite settled companions back with a **permanent −25% stat penalty**.
- **Depart eastbound** — reverse your fork path or detour to visited towns.

**Final harbor boss (Kew Kumber):** After journey day **90+**, the governor may block the last westward leg to New Isil until defeated in combat. This can **extend** the day target until the blockade is broken.

Blessings from the church **fade** after a random number of journey days (1–8).

### 3.10 Eastbound loop (optional mid-campaign play)

After settling members at New Isil, you can march **east** toward Cantebury, revisiting towns you passed. When you reach Cantebury again, a new civilian caravan may be assigned and you can march west on a new loop. Population and settler stats persist in the UI; deep settlement simulation is still planned (see `SETTLEMENT_GROWTH.md`).

### 3.11 Death and game over

- If the party is wiped, the run may end in **game over**.
- Individual deaths feed the **memorial / headstone** system in the Church tab.
- Start a new run from the game-over screen when offered.

---

## 4. FAQs

### Do I need to install anything?

**No** for the public web link — only a browser. Local play needs Python (or any static server) to serve files; opening `index.html` directly from disk often breaks script loading.

### Does the game save my progress?

Progress lives in the **browser session** for the active run. Memorial/headstone and playthrough counter data may persist in **localStorage**. There is no login or cloud save. Refreshing the page may lose an unsaved run depending on browser behavior — treat long sessions as fragile.

### Why does the page look like plain text?

Styles or scripts did not load. Use a local server (see §2) or the GitHub Pages URL with `index.html`.

### What is the difference between “Cantebury Trails” and “Illirial Trail”?

**Cantebury Trails** is the in-game title. **Illirial Trail** is the repository/project name. Same game.

### How do I win?

Arrive at **New Isil** on a westward leg after meeting the **journey day** requirement (100+, possibly extended for the final boss march). You do not need to return to Cantebury to win in v6.3.

### Can I visit both Gustaf and Brookside on one trip west?

**No** — each fork pair is a either/or choice outbound. You may visit the road not taken on a **return** or **detour** eastbound if that town was marked visited.

### What happens to my caravan at New Isil?

The first time civilians **disembark** at the harbor. Your fighting party continues; later returns to Cantebury can grant a **new** civilian train (random size 1–15).

### What are gems for?

Gems are loot from encounters and ruins; shops let you **sell gems for gold** in settlements.

### Is there multiplayer or cross-device sync?

**No.** Single-player, one browser, local data only.

### Are my plays tracked?

The public build may send **anonymous playtest events** (page load, travel, combat, run complete) to a configured endpoint — no account name or personal identity. Tracking is disabled on localhost unless you add `?track_local=1`. See `README.md` and the `playtest-tracking-endpoint` meta tag in `index.html`.

### Where does balance data come from?

`balance-data.js` is exported from `chart for game.xlsx`. Monster levels, XP curves, class stats, and dialogue pools are driven from that file.

### What is not implemented yet?

- Full **New Isil settlement growth** simulation (hooks exist; see `SETTLEMENT_GROWTH.md`)
- **Godot** migration / standalone commercial build (`GODOT-PIVOT.md` — parked)
- Cloud accounts and multi-device sync

---

## 5. Quick reference

| Topic | Value / note |
|-------|----------------|
| Party size | 5 (fighting line) |
| Starting caravan civilians | 10 (first march) |
| Journey win target | 100 days (extendable) |
| Final boss gate | Day 90+ westward to New Isil |
| Blessing duration | 1–8 journey days |
| Settler rejoin penalty | −25% stats, permanent |
| Classes | Soldier, Priest, Mercenary, Mage (+ caravan role flavor) |

---

## 6. For developers

| File | Role |
|------|------|
| `index.html` | Shell, version tagline, script includes |
| `game.js` | Main simulation, UI, state machine |
| `balance-data.js` | Spreadsheet-backed balance and dialogue |
| `names-data.js` | Random name generation |
| `styles.css` | Presentation |
| `tracking.js` | Optional anonymous playtest telemetry |
| `PLAY_LINKS.txt` | Run instructions |
| `DOMAIN.md` | One-page design intent |

Report bugs and balance feedback against the version string in the header when testing.

---

*Last updated for v6.3.0 — forked western trail, eastbound return routing, New Isil victory.*
