
'use strict';

var Store = (function () {

  var KEY = CONFIG.LS_KEY;
  var reports = [];
  var listeners = [];
  var bc = null;

  var SHARED_ENDPOINT = (function () {
    try {
      var v = localStorage.getItem('chennaiAlert_sharedEndpoint');
      if (v && v.indexOf('http') === 0) return v;
    } catch (e) { }
    return window.__chennaiAlertSharedEndpoint || '';
  })();

  function sendToShared(r) {
    if (!SHARED_ENDPOINT) return;
    var x = null;
    try { x = new XMLHttpRequest(); } catch (e) { return; }
    x.open('POST', SHARED_ENDPOINT + '/reports', true);
    x.setRequestHeader('Content-Type', 'application/json');
    x.timeout = 2500;
    x.send(JSON.stringify(r));
  }

  function canUseLocalStorage() {
    try {
      localStorage.setItem('__ca_probe', '1');
      localStorage.removeItem('__ca_probe');
      return true;
    } catch (e) {
      return false;   
    }
  }
  var storageOK = canUseLocalStorage();

  function load() {
    if (!storageOK) return [];
    try {
      var raw = localStorage.getItem(KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function prune() {
    var now = Date.now();
    reports = reports.filter(function (r) {
      return r && typeof r.lat === 'number' && typeof r.lng === 'number' &&
             now - r.t < CONFIG.REPORT_WINDOW_MS * 2;
    });
  }

  function publish() {
    listeners.forEach(function (fn) { try { fn(reports); } catch (e) {  } });
    if (bc) {
      try { bc.postMessage({ type: 'reports', reports: reports }); } catch (e) {  }
    }
  }

  function persist() {
    if (storageOK) {
      try { localStorage.setItem(KEY, JSON.stringify(reports)); } catch (e) {  }
    }
  }

  

  function init() {
    reports = load();
    prune();
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel('chennaiAlert');
      bc.onmessage = function (ev) {
        if (ev.data && ev.data.type === 'reports' && Array.isArray(ev.data.reports)) {
          reports = ev.data.reports;
          prune();
          
          listeners.forEach(function (fn) { try { fn(reports, true); } catch (e) {  } });
        }
      };
    }
    persist();
  }

  function all() { return reports.slice(); }

  function add(report) {
    var now = Date.now();
    reports.push({
      id:  'r' + now + Math.random().toString(36).slice(2, 6),
      lat: Math.round(report.lat * 1e5) / 1e5,
      lng: Math.round(report.lng * 1e5) / 1e5,
      type: report.type,
      sev:  (function () {
              var t = REPORT_TYPES.filter(function (x) { return x.id === report.type; })[0];
              return t ? t.sev : 1;
            })(),
      note: (report.note || '').slice(0, 140),
      t:    now
    });
    prune();
    persist();
    publish();
    sendToShared(reports[reports.length - 1]);
  }

  function onChange(fn) {
    if (typeof fn === 'function') listeners.push(fn);
  }

  
  function addRaw(report) {
    var t = REPORT_TYPES.filter(function (x) { return x.id === report.type; })[0];
    reports.push({
      id:  's' + Date.now() + Math.random().toString(36).slice(2, 6),
      lat: Math.round(report.lat * 1e5) / 1e5,
      lng: Math.round(report.lng * 1e5) / 1e5,
      type: report.type,
      sev: t ? t.sev : 1,
      note: report.note || '',
      t: Date.now()
    });
    prune();
    persist();
    publish();
    sendToShared({
      lat: report.lat, lng: report.lng, type: report.type, note: report.note
    });
  }

  return { init: init, all: all, add: add, onChange: onChange, addRaw: addRaw, storageOK: function () { return storageOK; } };
})();
