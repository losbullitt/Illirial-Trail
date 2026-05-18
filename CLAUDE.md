# Agent Working Rules — Illirial Trail

## First: Read These Files

Before taking any action in this repository, read in order:
1. `DOMAIN.md` — what the game is and its core loop.
2. `PROGRESS.md` — implemented systems and "what to verify when resuming". May drift; cross-check against `git log -10` and the version string in `index.html`.
3. `README.md` — deployment and playtest tracking notes.

Do not skip these. Context you skip becomes an assumption you will regret.

---

## Portfolio context (cross-project)

If the user references another of Los's projects (currently: Invin), fetch the portfolio index hosted in Invin (private repo, agents access via `gh`):

```
gh api repos/losbullitt/Invin/contents/PORTFOLIO.md --jq '.content' | base64 -d
```

Use it only as a cross-project map. It is not a substitute for this repo's own `DOMAIN.md` / `PROJECT.md`.

---

## Source Discipline

- Cite game design, balance, or systems facts from `balance-data.js`, `PROGRESS.md`, or `DOMAIN.md`. Do not invent encounters, monsters, weapons, settlements, stats, or version numbers.
- This is browser-first and single-player. There is no backend. Playtest tracking is a fire-and-forget JSON POST configured per `tracking.js` and the meta tag in `index.html` — treat it as optional telemetry, not a service dependency.

---

## Edit Discipline

- Read before you write. Prefer targeted edits over rewrites.
- After substantial logic edits to `game.js`, run `node --check game.js`.
- When changing balance values, weapons, monsters, or progression: bump the version in the `index.html` header text and the cache-bust query strings on linked scripts/styles (`?v=X.Y.Z`). Keep `balance-data.js`'s internal version in lockstep with the header.
- Versioning rule in use: patch within the current minor until `.9`, then roll the minor (e.g. `4.7.9 -> 4.8.0`).

---

## Boundaries

- This project is worked on via Cursor (often Cursor cloud agents). Do not assume a specific local clone path; the repo may not be present on any given machine.
- No telemetry or third-party scripts beyond the existing opt-in `tracking.js` endpoint. Do not add analytics, ads, or remote calls without explicit approval.
- Do not modify `DOMAIN.md` without explicit instruction.
- Do not commit or push unless the task explicitly requires it.
