# ChennaiAlert — Tourist Crisis Companion

A mobile-first web app that shows **live crowd-sourced danger zones in Chennai**
during extreme weather. Built as plain HTML/CSS/JS — no build step, no backend.

## What it does

| Rule | Behaviour |
|------|-----------|
| **10+ reports** clustered in one ~500 m zone (last 3 h) | **EMERGENCY** — pulsing red map zone, full-screen instructions with emergency numbers, phone vibration |
| **4–9 reports** | **Warning** — orange zone, strong banner: "do not enter" |
| **1–3 reports** | **Advisory only** — soft yellow banner, no drama |

- **Live interactive map** of Chennai only (`OpenStreetMap`/Leaflet, geofenced)
- **Crowd reports** — flood, storm damage, road blocked, unsafe area, fallen power line
- **Live weather** for Chennai from Open-Meteo, auto-refreshing every 5 min
- **Safe shelters** — hospitals/high ground/transit hubs with GoogleMaps directions
- **Three languages** — English / தமிழ் / हिन्दी, everything translated

## Project structure

```
├── index.html          ← entry page (loads everything below)
├── css/
│   └── style.css       ← Google-Maps-flavoured light mobile theme
├── js/
│   ├── leaflet-load.js ← loads Leaflet with CDN fallback chain
│   ├── config.js       ← thresholds, hotspots, shelters, bounds
│   ├── i18n.js         ← all UI strings in en/ta/hi
│   ├── store.js        ← report ledger (localStorage + tab sync)
│   ├── zones.js        ← clustering + threshold logic
│   ├── map.js          ← Leaflet map layers + GPS locate
│   ├── ui.js           ← status card, sheets, emergency dialog
│   ├── weather.js      ← Open-Meteo polling
│   └── app.js          ← bootstrap, event wiring, demo simulator
└── README.md
```

## Run locally

Just open `index.html` in a phone or desktop browser — it works from the
raw file. If you prefer a server:

```bash
python3 -m http.server 8734
# then visit http://localhost:8734
```

## Put it live (free, permanent URL)

Pick **one** of these — both are free and permanent:

### Option A — Netlify Drop (60 seconds, no terminal)
1. Go to <https://app.netlify.com/drop>
2. Drag the whole project folder onto the page
3. You instantly get a URL like `https://your-app.netlify.app`
4. Open that URL on your phone → the map works because Leaflet comes from
   a CDN with automatic fallback.

### Option B — GitHub Pages
```bash
git init && git add . && git commit -m "ChennaiAlert initial commit"
# push to a GitHub repo, then:
# repo Settings → Pages → Source: main branch → Save
```
Your site appears at `https://<your-username>.github.io/<repo-name>/`.

> **Note:** after deploying, the live weather and the map both load over the
> network; everything else (reports, thresholds, alerts) runs fully on-device,
> so the URL keeps working even with modest connectivity.

## Try the emergency flow

1. Open the app
2. Tap the **yellow info banner** → bottom sheet → **"Simulate live tourist reports"**
3. Keep tapping **"Simulate"** — watch a zone go 3 → 7 → 10 reports
4. At **10**, the zone turns red, pulses, and the emergency dialog with
   instructions and nearest shelter pops up with a vibration alert.

## Honest limitations

- Reports are per-device (localStorage) — two phones don't share reports
  because there is no backend. That was a deliberate scope choice for v1.
- Weather is real; crowd reports are real *locally* (and simulatable for demo).
- GPS accuracy depends on the device; the blue dot shows a translucent
  accuracy circle like Google Maps does.


## Admin dashboard and Netlify deployment
Deploy the public site and admin page as **one Netlify site**. Connect the repository to Netlify so the serverless function is deployed too.

Use the settings in `NETLIFY_DEPLOY.md` and add a Netlify environment variable named `SECRET_TOKEN`.

The admin page is:
```text
https://YOUR-SITE.netlify.app/admin/?secret=YOUR_SECRET_TOKEN
```

A report becomes visible in the admin dashboard only after **three reports overlap in the same map cell within three hours**. The Netlify function is `netlify/functions/reports.js`.

The current file-based API store is suitable for a hackathon/demo deployment. For a multi-instance production deployment, replace `reports-store.json` with a persistent database.

## Editable safe places
Edit `js/shelters.js` to add or remove hospitals, shelters, fire stations, transit hubs, and police stations. The nearest-place feature only returns a result when the closest entry is within **5 km** of the user's GPS location; otherwise it shows a no-result message.
