
'use strict';

var Zones = (function () {
 
  
  function distM(a, b, c, d) {
    var R = 63710, rad = function (x) { return x * Math.PI / 180; };
    var dLat = rad(c - a), dLng = rad(d - b);
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return Math.round(2 * R * Math.asin(Math.sqrt(h)));
  }

  function statusFor(count) {
    if (count >= CONFIG.THRESHOLDS.EMERGENCY) return 'emergency';
    if (count >= CONFIG.THRESHOLDS.WARNING)   return 'warning';
    if (count >= CONFIG.THRESHOLDS.ADVISORY)  return 'advisory';
    return 'ok';
  }

  
  function areaName(lat, lng) {
    var best = HOTSPOTS[0], bd = Infinity;
    for (var i = 0; i < HOTSPOTS.length; i++) {
      var h = HOTSPOTS[i];
      var d = (h.lat - lat) * (h.lat - lat) + (h.lng - lng) * (h.lng - lng);
      if (d < bd) { bd = d; best = h; }
    }
    return best.n;
  }

  function active() {
    var now = Date.now();
    var cells = {};
    var order = [];

    Store.all().forEach(function (r) {
      if (now - r.t > CONFIG.REPORT_WINDOW_MS) return;
      var key = Math.round(r.lat / CONFIG.CELL_DEG) + '_' +
                Math.round(r.lng / CONFIG.CELL_DEG);
      if (!cells[key]) {
        cells[key] = { key: key, lat: 0, lng: 0, n: 0, reps: [] };
        order.push(key);
      }
      var z = cells[key];
      z.lat += r.lat; z.lng += r.lng; z.n += 1; z.reps.push(r);
    });

    return order.map(function (key) {
      var z = cells[key];
      z.lat /= z.n; z.lng /= z.n;
      z.status = statusFor(z.n);
      z.area = areaName(z.lat, z.lng);
      return z;
    }).filter(function (z) { return z.status !== 'ok'; });
  }

  function nearestTo(lat, lng) {
    var zones = active();
    var best = null, bd = Infinity;
    zones.forEach(function (z) {
      var d = distM(lat, lng, z.lat, z.lng);
      if (d < bd) { bd = d; best = z; }
    });
    return best ? { zone: best, dist: bd } : null;
  }

  function inZone(lat, lng) {
    var n = nearestTo(lat, lng);
    return (n && n.dist < 900) ? n : null;
  }

  return {
    distM: distM,
    statusFor: statusFor,
    areaName: areaName,
    active: active,
    nearestTo: nearestTo,
    inZone: inZone
  };
})();
