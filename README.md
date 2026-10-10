Problem Statement:

TravelTech
Real-Time Crisis Communication for Tourists During Extreme Weather Events
CONTEXT: When localized extreme weather events occur—such as sudden flash floods or severe cyclones—foreign tourists are highly vulnerable due to their lack of local geographic knowledge and language barriers.
PROBLEM: Local weather warnings, emergency broadcasts, and safe-zone declarations are fragmented and rarely translated or localized for tourists. Travelers struggle to verify which areas are actively flooded or unsafe and cannot easily access translated instructions from local authorities, forcing them to rely on chaotic, unverified social media rumors.
IMPACT: This communication gap leads to widespread panic, stranded travelers wandering into high-risk weather zones, and unnecessary strain on local rescue services during critical windows.

Demo Video link:
https://drive.google.com/drive/folders/19NhK0qqyarQCTpWxnB6O0Bfg78m_82Cj

ChennaiAlert:

ChennaiAlert is a mobile-friendly tourist safety companion for Chennai.

What the website does

•
Shows a live Chennai map using Leaflet and OpenStreetMap.

•
Displays weather conditions from Open-Meteo.

•
Lets users report floods, storms, blocked roads, unsafe areas, and fallen power lines.

•
Groups nearby reports into advisory, warning, and emergency zones.

•
Shows hospitals, safe shelters, fire stations, police stations, transit hubs, and community locations.


•
Supports 20 languages, including English, Tamil, Hindi, Bengali, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Urdu, Nepali, Spanish, French, German, Arabic, Chinese, Japanese, Korean, and Portuguese.

•
Provides emergency guidance and links to directions for nearby safety locations.

The website is designed for quick use on mobile phones during heavy rain, flooding, storms, or other local hazards.

You can access the website at https://chennai-alert.netlify.app/

Project structure
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


Admin dashboard and Netlify deployment
Deploy the public site and admin page as one Netlify site. Connect the repository to Netlify so the serverless function is deployed too.
Use the settings in `NETLIFY\_DEPLOY.md` and add a Netlify environment variable named `SECRET\_TOKEN`.
The admin page is:
```text
https://YOUR-SITE.netlify.app/admin/?secret=YOUR\_SECRET\_TOKEN
```
A report becomes visible in the admin dashboard only after three reports overlap in the same map cell within three hours. The Netlify function is `netlify/functions/reports.js`.
The current file-based API store is suitable for a hackathon/demo deployment. For a multi-instance production deployment, replace `reports-store.json` with a persistent database.

