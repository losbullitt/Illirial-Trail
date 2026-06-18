# A Paladin's Tale (design — not implemented)

**Status:** Parked. Optional multi-phase class questline. Documentation only.

**Design intent:** Take the caravan *off* the main loop for weeks at a time — deliberately optional, narrative-heavy, not required for the New Isil march.

---

## Overview

| Field | Value |
|-------|--------|
| **Questline id** | `paladins_tale` |
| **Display name** | A Paladin's Tale |
| **Order** | Silver Blades apply → giant hunt → Jephro detour → miasma / Naga → Cantebury knighting |
| **Final reward** | Title **"of the Silver Blades"**, class **Paladin**, **+10 Stamina**, improved healing spells, AP→MP (abilities use mana) |
| **Trait** | TBD at Cantebury ceremony (Reginald the Hawk) |

---

## Faction & NPCs

### Yosef — Silver Blades commander (guest officer)

- **Location:** Solem keep / garrison (guest officer, not permanent Solem roster)
- **Faction:** Silver Blades, Paladins of Sidra
- **Role:** Quest giver for phases 1–2; deferred handoff after Jephro twist

### Lady Stillwater

- **Location:** Road encounter **outside Gustaf** (phase 3)
- **Role:** "Rare Air" — miasma source, tome moral choice

### Reginald the Hawk — Paladin Lord

- **Location:** Cantebury (castle / keep)
- **Role:** Final ceremony — title, class change, trait (if questline completed honestly)

---

## Entry: applying to the Silver Blades

### Eligibility (per **one party member** — quest tracks `paladinCandidateId`)

| Requirement | Rule |
|-------------|------|
| Level | **≥ 10** |
| Class | **Soldier** only |
| Strength | **≥ 12** |
| Stamina | **≥ 12** |

### Opening dialogue

> **Yosef:** "Do you want to give more to your people?"

| Choice | Effect |
|--------|--------|
| **Yes** | Start phase 1 — **The Giant Question** |
| **No** | Increment `yosefDeclineCount` for this save/caravan |

**Three total "No" answers** (across any visits while eligible): remove Silver Blades offer for **entire party/caravan** until **another** character reaches level 10 (then offer reopens).

---

## Phase 1 — The Giant Question

**Goal:** Save **5 civilians** in a **remote town** from **Giants**.

### Combat

| Wave | Foes |
|------|------|
| 1 | **2** Giants |
| 2 | **3** Giants |

### Success

- Loot: **`giants_head`** (quest item)
- Return to **Yosef at Solem** → turn in → phase 2 briefing

---

## Phase 2 — Helsfort / Jephro (rare metal ingots)

**Brief:** Travel to **Jephro** (Helsfort mountains, south of Dragonspine, **weeks off** the main route).

### Jephro side quests

| Order | Quest | Summary |
|-------|--------|---------|
| 1 | **The Ghosts that Pray** | Night in graveyard; fight ghosts seeking peace |
| 2 | **The Lumbering Woods** | Cut timber in the forest; deliver to town |
| 3 | **Mind Your Mines** | Mine nodes; **10%** chance per node for target ingot |

**Gating:** Complete **Ghosts** + **Lumbering Woods** before **Mind Your Mines**.

### Twist (return to Yosef)

Positions filled while you were away; he learned too late from this remote post.

> "Next time you're in town, I'll let you know if something opens."

- Status → `waiting_for_opening`
- Finish caravan loop; no class change yet

---

## Phase 3 — Rare Air (Gustaf outskirts)

**Trigger:** Next leg — **Lady Stillwater** outside Gustaf. Guards ill from **miasma**.

| Field | Value |
|-------|--------|
| Quest name | **Rare Air** |
| Boss | **Naga** (spellcaster) in marsh |
| Loot | **Dark channeling tome** |

### Return dialogue

> Did you retrieve anything?

| Answer | Outcome |
|--------|---------|
| **Yes** → give tome | Success path → **Reginald the Hawk** in Cantebury |
| **No** / withhold | Gold only; **questline ends** until restarted via Yosef |

---

## Phase 4 — Cantebury (Reginald the Hawk)

**Prerequisite:** Tome delivered to Lady Stillwater.

**Reginald grants:**

1. Title suffix: **`[Name] of the Silver Blades`**
2. Class change: Soldier → **Paladin**
3. **+10 Stamina** (one-time on knighting)
4. Improved **healing spells**
5. **AP → MP** — abilities use mana
6. **Trait:** TBD

---

## Paladin class (mechanical sketch)

| Aspect | Soldier (today) | Paladin (proposed) |
|--------|-----------------|---------------------|
| Role key | `soldier` | `paladin` |
| Resource | AP | **MP** for abilities |
| Stamina | base | **+10** on knighting |
| Healing | — | Buffed heal potency (TBD) |
| Title | — | `" of the Silver Blades"` in UI |

---

## Save state sketch

```javascript
state.paladinQuest = {
  status: "idle" | "declined_locked" | "phase1" | "phase2_jephro" | "waiting_for_opening" | "phase3_rare_air" | "ready_for_cantebury" | "completed" | "failed_withheld_tome",
  candidateId: null,
  yosefDeclineCount: 0,
  jephro: {
    ghostsComplete: false,
    lumberComplete: false,
    minesUnlocked: false,
    ingotsFound: 0,
  },
  hasGiantsHead: false,
  hasDarkTome: false,
  tomeDelivered: false,
};
```

---

## Open questions

1. Remote giant-town **name** and map hook
2. **Jephro** placement — Helsfort / south of Dragonspine not on current trail graph
3. If player says "No" but has tome — hard fail or allow bluff?
4. One candidate at a time vs choose among eligible soldiers
5. **Paladin trait** options
6. **Caravan clock** while "weeks away" on Jephro arc
7. Does **`giants_head`** consume on turn-in only?

---

## Integration map (existing code)

| System | Location | Touchpoint |
|--------|----------|------------|
| Quest catalog | `game.js` → `QUEST_CATALOG` | New entries; givers `yosef`, `stillwater` |
| Quest flow | `acceptQuest`, `beginQuestTrek` | Off-trail treks, wave fights |
| Solem | keep / garrison UI | Yosef guest officer |
| Gustaf | travel encounters | Lady Stillwater |
| Cantebury | castle / keep | Reginald the Hawk |
| Classes | `balance-data.js`, combat | `paladin` role, MP abilities |

---

## Version note

When implemented, bump game version and add optional-quest notes to `PLAYER_MANUAL.md`.

---

## Dialogue

Full draft script: **[paladins-tale-dialogue.md](./paladins-tale-dialogue.md)**

- Original design lines preserved under **(design)** markers
- Generated placeholder lines for all other beats; refine in pass
