This is a demo using cursor to build an Oregon Trail styled game. 

It is a web version for now but will update in the future for a standalone setup. 


## Lightweight playtest tracking

This project now includes a small client-side tracker (`tracking.js`) for deployed playtests.

### What it records

- `page_view`
- `app_loaded`
- `run_started`
- `travel_started`
- `day_advanced`
- `combat_started`
- `combat_won` / `combat_lost`
- `member_leveled`
- `run_completed`

Data includes a generated anonymous session id and event payload details (no auth/user identity).

### Enable it on deployment

Set an endpoint that accepts JSON POSTs:

1. Add a meta tag to `index.html`:

```html
<meta name="playtest-tracking-endpoint" content="https://your-endpoint.example/track" />
```

2. Or set at runtime before `tracking.js` runs:

```html
<script>
  window.ILLIRIAL_TRACKING_ENDPOINT = "https://your-endpoint.example/track";
</script>
```

3. Or set from browser console/local storage:

```js
window.PlaytestTracker.setEndpoint("https://your-endpoint.example/track");
```

Tracking is disabled on localhost by default. For local verification only, open with `?track_local=1`.
