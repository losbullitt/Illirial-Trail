# Morale System (design — not implemented)

**Status:** Parked. Documentation only; no gameplay wiring yet.

## Purpose

Morale models how willing people are to stay on the trail. It applies to **named party members** (fighters, priest, etc.) and **the civilian train** (farmers, artisans, families). The lower morale falls, the more likely someone is to **leave the caravan — often for good**. Keeping morale up is a core survival skill alongside supplies and HP.

---

## Morale scale (5 steps)

| Value | Label    | Leave risk (party) | Notes |
|------:|----------|--------------------|-------|
| 5 | **Excited** | — | Best mood; no desertion pressure. |
| 4 | **Happy**   | — | Comfortable; no desertion pressure. |
| 3 | **Ok**      | — | Default steady state; no desertion pressure. |
| 2 | **Sad**     | **25% / day** | Each travel day: one independent roll; **no stacking** (see below). |
| 1 | **Morose**  | **50% / day** | Each travel day until morale improves or the character leaves. |

**Internal representation:** integer `1..5` with display labels above. Clamp after every change.

**Starting morale (proposed):** new recruits and fresh caravans begin at **Ok (3)** unless a future event says otherwise.

---

## Who has morale?

### Party (named members)

Each `party[]` member carries their own `morale` (1–5).

- At **Sad** or **Morose**, run the daily leave check for that member only.
- Leaving **for good** means they are removed from the party roster and do not return on later loops (same weight as a deliberate desertion — distinct from combat death or settler story beats unless we later tie them together).

### Caravan (civilians)

The train also has morale, either:

1. **Train-wide meter** — one `state.caravan.morale` applied as the ambient mood for all civilians, or
2. **Per-bucket** — farmers / artisans / families each track morale (heavier simulation).

**Recommendation for v1:** single **train morale** shared by civilians; party members have personal morale that receives the same daily deltas from trail conditions (see Daily tick). Civilian **headcount loss** at Sad/Morose uses the same leave percentages against abstract groups (e.g. roll once per bucket or once per N civilians — TBD in implementation).

---

## Daily tick (travel days)

Run **once per journey day** on the trail (after weather and supply consumption resolve, before the next day’s march):

1. Compute **morale deltas** from conditions (below).
2. Apply deltas to **train morale** and **each living party member** (clamp 1–5).
3. For each party member at **Sad** or **Morose**, roll desertion (below).
4. For civilians (when implemented), roll desertion against train morale / buckets.
5. Log notable shifts (flavor lines already exist for weather and stretch rations — extend, don’t replace).

Town days, combat-only pauses, and adventure/quest legs **do not** advance desertion clocks unless we explicitly extend the system later.

---

## Caravan morale drivers (specified)

These apply **automatically** each qualifying travel day. Each line is **±1 step** on the 1–5 scale (unless noted).

### Reductions (−1 each, per day)

| Trigger | Game hook (existing) | Notes |
|---------|----------------------|-------|
| **Rationing** | `state.rationMode === "stretch"` (`isStretchRations()`) | −1 while stretch rations are in effect that day. |
| **Heavy rainfall** | `steady_rain` or `storm` weather kind | Map “heavy rainfall” to **`steady_rain`** and **`storm`**, not `slight_rain`. |
| **Blizzard** | `blizzard` weather kind | −1 on days the train is halted in whiteout (already burns half rations via `supplyMult: 0.5`). |

### Additions (+1 per day)

| Trigger | Proposed rule | Notes |
|---------|---------------|-------|
| **Well stocked** | `state.food / MAX_SUPPLIES >= 0.80` | “80% or better of supplies” → **≥ 80% of supply cap** (`MAX_SUPPLIES`, currently 50). Evaluated **after** that day’s consumption. |

### Stacking (same day)

Multiple modifiers **stack algebraically** before clamping:

```
moraleDelta = (wellStocked ? +1 : 0)
            + (stretchRations ? -1 : 0)
            + (heavyRain ? -1 : 0)
            + (blizzard ? -1 : 0)
newMorale = clamp(oldMorale + moraleDelta, 1, 5)
```

Example: blizzard + stretch rations + low stock can drop **−2 or −3** in one day.

---

## Desertion rules (party)

Only evaluated when `morale <= 2` after the daily morale update.

| State | Daily leave chance | Stacking |
|-------|-------------------|----------|
| **Sad (2)** | 25% | **No stacking** — each day is a fresh 25% roll. Ten sad days ≠ 250%; it is never worse than 25% on any single day while still Sad. |
| **Morose (1)** | 50% | Same independence rule: 50% each day until morale rises or the character leaves. |

**On leave:** remove from party, log clearly, optional future deserter memorial (not headstones).

**Improving morale:** any change that brings them to **Ok (3)+** stops desertion rolls immediately.

---

## Integration map (existing code — do not wire yet)

| System | File / symbol | Morale touchpoint |
|--------|---------------|-------------------|
| Stretch rations | `isStretchRations()`, `noteStretchedRationGrumbles()` | Daily −1 while active |
| Supply cap | `MAX_SUPPLIES`, `state.food` | Daily +1 if ≥ 80% after consumption |
| Weather | `travelWeatherDef()`, `currentTravelWeatherKind()` | `steady_rain`, `storm`, `blizzard` |
| Daily supplies | travel day advance | Run morale tick after consumption |
| Priest / inn | chapel, inn rest | Future +morale (not in v1 spec) |

---

## Open questions (resolve before implementation)

1. **Storm vs steady rain:** −1 each, or −1 total for any rain ≥ steady?
2. **Blizzard + stretch:** Confirm both −1 stack when blizzard forces half-rations and stretch mode is on.
3. **Civilian desertion:** One roll for whole train vs per profession bucket vs proportional headcount loss.
4. **Party vs train:** Personal morale only, or personal = train + individual modifiers?
5. **Excited / Happy bonuses:** Any upside beyond desertion avoidance?
6. **Recovery without towns:** Camp, priest, random events — out of scope until specified.
7. **Save migration:** Default missing `morale` to 3 (Ok) for loaded saves.

---

## Version note

When implemented, bump game version and add a short blurb to `PLAYER_MANUAL.md` (stretch rations and weather already mention morale in passing).
