# HP Growth Models

Selected default: **Optimal** (`k(level) = level + 1`)

Base formula:

`hpGain = max(1, ceil(stamina/2) + rng(0..level) - k(level))`

## Models kept on file

- `conservative`: `k(level) = ceil(1.2 * level) + 2`
- `optimal`: `k(level) = level + 1`
- `optimalA`: `k(level) = level`

## Notes

- `optimal` is the active baseline for tuning.
- `conservative` and `optimalA` are retained for A/B testing.
- This is documentation only; gameplay wiring can reference these values when implemented.
