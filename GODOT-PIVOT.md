# Godot pivot — planning notes

**Saved from design chat:** 2026-05-20  
**Status:** Parked until the web prototype is tight. Revisit when ready for the next step.

This doc captures decisions and resource planning for moving from the current browser text prototype to an Oregon Trail–style Godot title (animation, music, illustrated events, etc.).

---

## Current state (what carries forward)

The web build is a **mechanics lab**. Most of the value is portable as design and data, not as DOM code:

| Asset | Today | Carries forward as |
|-------|--------|---------------------|
| Game rules | `chart for game.xlsx` → `balance-data.js` | Source of truth for balance |
| State machine | travel / settlement / combat / ruins / quest phases | Design + refactor target in Godot |
| Combat, progression, permadeath | `game.js` | Same loops, new presentation |
| Content | towns, routes, monsters, quests, memorials | Content pipeline (data-driven strings + art) |

**Contract to preserve:** spreadsheet → validated JSON (`balance-data.js` schema). Never lose progression fields, monster levels, etc. again.

---

## Engine decision

**Godot 4** — agreed direction.

- 2D scenes, animation, audio, export to web/desktop/mobile
- Strong fit for trail map, town scenes, turn-based combat UI
- Gameplay logic will be **ported/refactored** from `game.js`; not a line-for-line copy

**Alternatives considered:** stay on web with Phaser/Pixi (faster beta, less “boxed game” feel); Unity/Unreal (overkill for 2D trail scope).

---

## What “Oregon Trail–esque” means for Illirial Trail

Not wagon physics — it’s **presentation + pacing**:

1. Map/trail view with party moving day-by-day  
2. Event cards with illustration (illness, ambush, ruins, quest beats)  
3. Towns as places (building icons), not just tabs  
4. Quiet days vs danger spikes (already in logic)  
5. Death with weight (In Memoriam / headstones — already in)

Logic is largely OT-shaped; the gap is **scene layer + juice** (motion, sound, art).

---

## Creative team (when the time comes)

### Illustrator / animator — hire first

Highest-leverage seat. One strong 2D artist (pixel or painted) can cover:

- Party + monster sprites (map + battle)
- Walk / attack / hit / die cycles (4–8 frames)
- Trail backgrounds, town exteriors, ruins tiles
- Event illustrations
- UI frames (shop, church, tavern, party sheet)

Split **animator** as a second seat only when roster/enemy count grows. Early: illustrator often animates their own sprites.

**Brief with:** mood board, resolution (e.g. 64×64 characters), **vertical slice** asset list — not the full world on day one.

### Music / audio — hire second

Scope as **game audio**, not film score:

- 3–5 loops to start: trail, town, combat, tense event, quest milestone  
- SFX: UI, footsteps, combat, spell, coin, rest, death  
- Loop points / stems for crossfade (travel → ambush)

**Implementation:** lead dev wires Godot `AudioStreamPlayer` + phase playlists. FMOD/Wwise optional later.

### Video / “small in-game movies” — defer or scope tiny

Clarify format before hiring a dedicated cutter:

| Approach | When to use |
|----------|-------------|
| **In-engine cutscenes** (sprites, pan, dialogue) | Default — same illustrator + dev |
| **Motion comics** (still art + pan/zoom + SFX) | Cheap, very OT-adjacent |
| **Pre-rendered video** (.webm in Godot) | 1–2 tentpoles only (departure, Fire in the sky, New Isil) |

Most beats = **event card + one illustration**. Reserve real “movies” for tentpoles.

### Writing — you lead

No lead narrative hire needed early. You own:

- Main quest arc and milestone beats  
- System-facing copy (camp, shop, failure states)  
- Voice rules per class/phase  
- Canon doc (places, factions, truth in the world)  
- Final edit on everything that ships  

**Guest contributors** (optional): tavern rumors, headstone epitaphs, ruin blurbs, rare barks. Give templates + one-page style sheet; you reconcile quest logic yourself.

**Style sheet (starter):**

- Tone: matter-of-fact, dry humor ok; permadeath treated with weight  
- Length: events 2–4 sentences; headstones ~1 line + optional epitaph  
- POV: second person travel/events; third person memorials  
- Avoid: modern slang, lore dumps in combat log  

**Production:** string IDs in data (`event.hollow_banks.ambush_intro`), tags for phase/quest/contributor/draft|final.

### Engineering — you (for a long time)

- Godot port of core sim  
- Spreadsheet → JSON pipeline  
- Saves (beyond localStorage)  
- UI layout — OT games are UI-heavy  

Optional later: one-week **narrative edit** contract (proofread + unify names), not co-authorship.

---

## Suggested migration phases

```
chart for game.xlsx → balance-data.js (keep as contract)
game.js → extract pure sim (no DOM) while still on web
     ↓
Vertical slice in Godot: Cantebury → one fight → Gustaf
     + walk animation + one music track + event art
     ↓
Content pass: all towns, real ruins map, quests
```

**Hire order:** illustrator → composer → ship slice → animator/motion only if needed → video person only for tentpoles.

Avoid hiring all creatives in parallel before **style is locked**.

---

## Vertical slice (first Godot milestone)

Minimum proof that the feel works:

- One trail leg with map movement  
- One settlement (buildings as scenes)  
- One combat encounter with animated sprites  
- One illustrated random event + camp flow  
- Trail + town + combat audio  
- Save/load one slot  

Use this to brief illustrators and composers (RFP-ready manifest).

---

## Rough resource picture (honest ranges)

| Scope | Team | Part-time calendar |
|-------|------|---------------------|
| Polished web 2.0 (Phaser + art/audio) | You + contractors | 3–6 months |
| Godot indie vertical slice | You + 1 artist + audio | 6–12 months |
| Full commercial OT-style (Steam, all routes) | Small team 3–5 | 12–24+ months |

Contractor ballpark for minimal pro pass: **~$2k–8k** (music + key art + UI); **~$30k+** for ongoing art/audio production.

---

## Before opening this doc again (web prototype “tighten the rigging”)

Finish tightening the current browser build first — balance, ruins navigation, content manifest, export scripts in repo, etc. This file is intentionally **not** the active sprint; see `PROGRESS.md` and `git log` for day-to-day work.

When ready: read this file → draft vertical slice asset manifest → talk to one illustrator with style samples.

---

## Chat reference

Planning conversation saved from Cursor session (Invin workspace, Illirial Trail context), May 2026. Agent transcript ID: `30ab9e0c-3fed-4ce0-b3fc-ad6208086d0a` (local Cursor project history).
