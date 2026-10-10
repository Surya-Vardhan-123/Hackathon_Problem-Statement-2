
'use strict'; 

var CONFIG = {
  
  BOUNDS: [[12.80, 80.05], [13.35, 80.42]],

  
  CENTER: [13.0827, 80.2707],
  START_ZOOM: 13,

  
  CELL_DEG: 0.0045,                 
  REPORT_WINDOW_MS: 3 * 60 * 60 * 1000,  

  
  THRESHOLDS: { EMERGENCY: 10, WARNING: 4, ADVISORY: 1, SHARED_REPORTS: 3 },

  
  LS_KEY: 'chennaiAlert_reports_v1',

  
  WEATHER_POLL_MS: 5 * 60 * 1000,

  WEATHER_URL: 'https://api.open-meteo.com/v1/forecast' +
    '?latitude=13.0827&longitude=80.2707' +
    '&current=temperature_2m,precipitation,wind_speed_10m,weather_code',

  
  TILE_URLS: [
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
  ]
};


var REPORT_TYPES = [
  { id: 'flood',    icon: 'water_drop',   sev: 3 },
  { id: 'storm',    icon: 'storm',        sev: 3 },
  { id: 'blocked',  icon: 'construction', sev: 2 },
  { id: 'unsafe',   icon: 'warning',      sev: 2 },
  { id: 'livewire', icon: 'bolt',         sev: 3 },
  { id: 'other',    icon: 'error',        sev: 1 }
];


var HOTSPOTS = [
  { n: 'Marina Beach Road',    lat: 13.0503, lng: 80.2820 },
  { n: 'Besant Nagar Beach',   lat: 13.0002, lng: 80.2668 },
  { n: 'Velachery lake area',  lat: 12.9795, lng: 80.2216 },
  { n: 'Adyar river bank',     lat: 13.0067, lng: 80.2570 },
  { n: 'Mylapore',             lat: 13.0339, lng: 80.2698 },
  { n: 'T. Nagar',             lat: 13.0418, lng: 80.2330 },
  { n: 'Guindy',               lat: 13.0067, lng: 80.2206 },
  { n: 'Nungambakkam',         lat: 13.0569, lng: 80.2425 },
  { n: 'Thiruvanmiyur',        lat: 12.9829, lng: 80.2594 },
  { n: 'Perungudi',            lat: 12.9643, lng: 80.2453 },
  { n: 'Saidapet, Anna Salai', lat: 13.0210, lng: 80.2260 }
];


if (typeof module !== 'undefined' && module.exports) module.exports = { CONFIG: CONFIG, REPORT_TYPES: REPORT_TYPES, HOTSPOTS: HOTSPOTS };
