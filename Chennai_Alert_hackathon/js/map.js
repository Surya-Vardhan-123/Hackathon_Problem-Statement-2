
'use strict';

var MapModule = (function () {

  var map, zoneLayer, reportLayer, shelterLayer, userLayer;
  var shelterVisible = true;
  var centerReticle = null;
  var tileLayer = null, tileIdx = 0;

  

  function init() {
    if (!window.__leafletCheck || !window.__leafletCheck()) {
      document.getElementById('scText').textContent =
        T('wx_off') + ' — Leaflet failed to load. Check your connection.';
      return false;
    }

    map = L.map('map', {
      zoomControl: false,
      attributionControl: true,          
      maxBounds: L.latLngBounds(CONFIG.BOUNDS),
      maxBoundsViscosity: 0.9
    }).setView(CONFIG.CENTER, CONFIG.START_ZOOM);

    L.tileLayer(CONFIG.TILE_URLS[0], { maxZoom: 18 }).addTo(map);

    
    map.on('tileerror', function () {
      if (tileIdx < CONFIG.TILE_URLS.length - 1) {
        tileIdx += 1;
        if (tileLayer) map.removeLayer(tileLayer);
        tileLayer = L.tileLayer(CONFIG.TILE_URLS[tileIdx], { maxZoom: 18 }).addTo(map);
      }
    });

    zoneLayer    = L.layerGroup().addTo(map);
    reportLayer  = L.layerGroup().addTo(map);
    shelterLayer = L.layerGroup().addTo(map);
    userLayer    = L.layerGroup().addTo(map);

    renderShelters();
    return true;
  }

  

  function getCenter() { return map ? map.getCenter() : L.latLng(CONFIG.CENTER); }
  function getMap()    { return map; }

  

  function renderShelters() {
    if (!shelterLayer) return;
    shelterLayer.clearLayers();
    if (!shelterVisible) return;
    SHELTERS.forEach(function (s) {
      L.marker([s.lat, s.lng], {
        icon: L.divIcon({
          className: '',
          html: '<div class="poi"><span class="ms">' + s.icon + '</span></div>',
          iconSize: [30, 30],
          iconAnchor: [15, 28]
        }),
        title: s.n
      }).bindPopup('<b>' + s.n + '</b><br><a class="rowlink" target="_blank"' +
        ' href="https://www.google.com/maps/dir/?api=1&destination=' + s.lat + ',' + s.lng + '">' +
        T('dirs') + '</a>').addTo(shelterLayer);
    });
  }

  function toggleShelters() {
    shelterVisible = !shelterVisible;
    renderShelters();
    return shelterVisible;
  }

  

  var ZONE_COLORS = { emergency: '#d93025', warning: '#e8710a', advisory: '#f09000' };
  var STATUS_ICON = { emergency: 'emergency', warning: 'warning', advisory: 'error' };

  function render() {
    if (!map) return;
    zoneLayer.clearLayers();
    reportLayer.clearLayers();
    var now = Date.now();

    Zones.active().forEach(function (z) {
      var color = ZONE_COLORS[z.status];
      var radius = 450 + Math.min(z.n, 25) * 35;

      L.circle([z.lat, z.lng], {
        radius: radius, color: color, weight: 2,
        fillColor: color, fillOpacity: z.status === 'emergency' ? 0.22 : 0.12
      }).bindPopup('<b>' + z.area + '</b><br>' + z.status.toUpperCase() + ' · ' +
        z.n + ' ' + T('sheet_reports').toLowerCase()).addTo(zoneLayer);

      if (z.status === 'emergency') {
        L.marker([z.lat, z.lng], {
          icon: L.divIcon({
            className: '',
            html: '<div class="pulse" style="width:' + (radius * 2) + 'px;height:' + (radius * 2) +
                  'px;background:' + color + ';left:' + (-radius) + 'px;top:' + (-radius) +
                  'px;opacity:.3"></div>',
            iconSize: [0, 0]
          }),
          interactive: false
        }).addTo(zoneLayer);
      }

      L.marker([z.lat, z.lng], {
        icon: L.divIcon({
          className: '',
          html: '<div class="count-pill" style="background:' + color + '">' + z.n + '</div>',
          iconSize: [30, 25], iconAnchor: [15, 13]
        }),
        zIndexOffset: 800
      }).addTo(zoneLayer).on('click', function () { UIRenderer.openZone(z); });
    });

    Store.all().forEach(function (r) {
      if (now - r.t > CONFIG.REPORT_WINDOW_MS) return;
      var tp = null;
      for (var i = 0; i < REPORT_TYPES.length; i++) {
        if (REPORT_TYPES[i].id === r.type) { tp = REPORT_TYPES[i]; break; }
      }
      if (!tp) tp = REPORT_TYPES[REPORT_TYPES.length - 1];
      var bg = r.sev >= 3 ? '#d93025' : '#e8710a';

      L.marker([r.lat, r.lng], {
        icon: L.divIcon({
          className: '',
          html: '<div class="rep-pin" style="background:' + bg + '"><span class="ms">' +
                tp.icon + '</span></div>',
          iconSize: [22, 22], iconAnchor: [4, 20]
        }),
        zIndexOffset: 300
      }).addTo(reportLayer).bindPopup(
        '<span class="ms" style="font-size:16px;color:' + bg + ';vertical-align:bottom">' +
        tp.icon + '</span> <b>' + fmt('t_' + r.type, {}) + '</b><br>' +
        (r.note ? escapeHtml(r.note) + '<br>' : '') +
        '<span style="color:var(--txt-3)">' + UiTime.ago(r.t) + '</span>'
      );
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  

  function setReticle(on) {
    if (!map) return;
    if (!on) {
      if (centerReticle) {
        map.off('move', centerReticle._mv);
        map.removeLayer(centerReticle);
        centerReticle = null;
      }
      return;
    }
    var mv = function () {
      var c = map.getCenter();
      if (!centerReticle) {
        centerReticle = L.marker(c, {
          icon: L.divIcon({
            className: '',
            html: '<div class="reticle"><span class="ms">location_on</span></div>',
            iconSize: [0, 0], iconAnchor: [0, 0]
          }),
          interactive: false, zIndexOffset: 1000
        }).addTo(map);
        centerReticle._mv = mv;
      } else {
        centerReticle.setLatLng(c);
      }
    };
    mv();
    map.on('move', mv);
  }

  function flyTo(latlng, zoom, secs) {
    if (map) map.flyTo(latlng, zoom, { duration: secs || 0.7 });
  }

  

  var USER_OPTS = { enableHighAccuracy: true, timeout: 12000, maximumAge: 2000 };

  function locate(onDone) {
    if (!navigator.geolocation) {
      onDone({ ok: false, reason: 'unsupported' });
      return;
    }
    navigator.geolocation.getCurrentPosition(function (pos) {
      var c = pos.coords;
      onDone({
        ok: true,
        lat: c.latitude, lng: c.longitude,
        accuracy: c.accuracy || 0
      });
    }, function (err) {
      onDone({ ok: false, reason: err && err.code === 1 ? 'denied' : 'failed' });
    }, USER_OPTS);
  }

  
  function drawUser(lat, lng, accuracy) {
    if (!map) return;
    userLayer.clearLayers();

    L.circle([lat, lng], {
      radius: Math.min(Math.max(accuracy, 12), 400),
      color: '#1a73e8', weight: 1,
      fillColor: '#1a73e8', fillOpacity: 0.12, opacity: 0.25
    }).addTo(userLayer);

    L.marker([lat, lng], {
      icon: L.divIcon({ className: '', html: '<div class="ubadge"></div>',
        iconSize: [16, 16], iconAnchor: [8, 8] }),
      zIndexOffset: 900
    }).addTo(userLayer).bindPopup('<b>' + T('you_here') + '</b>').openPopup();

    L.marker([lat, lng], {
      icon: L.divIcon({
        className: '',
        html: '<div class="pulse" style="width:60px;height:60px;background:var(--blue);left:-30px;top:-30px;opacity:.3"></div>',
        iconSize: [0, 0]
      }),
      interactive: false
    }).addTo(userLayer);
  }

  function inChennai(lat, lng) {
    return L.latLng(lat, lng) && L.latLngBounds(CONFIG.BOUNDS).contains(L.latLng(lat, lng));
  }

  return {
    init: init,
    getCenter: getCenter,
    getMap: getMap,
    toggleShelters: toggleShelters,
    render: render,
    setReticle: setReticle,
    flyTo: flyTo,
    locate: locate,
    drawUser: drawUser,
    inChennai: inChennai
  };
})();
