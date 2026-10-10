
'use strict';

var Demo = (function () {

  function simulate() {
    var h = HOTSPOTS[Math.floor(Math.random() * HOTSPOTS.length)];
    var pool = ['flood', 'flood', 'flood', 'blocked', 'unsafe', 'livewire', 'storm'];
    var type = pool[Math.floor(Math.random() * pool.length)];
    var jitter = 0.0025;
    Store.addRaw({
      lat: h.lat + (Math.random() - 0.5) * jitter,
      lng: h.lng + (Math.random() - 0.5) * jitter,
      type: type,
      note: ''
    });
    if (navigator.vibrate) { try { navigator.vibrate(60); } catch (e) {  } }
  }

  return { simulate: simulate };
})();

var App = (function () {

  

  function init() {
    populateLanguages();
    applyStaticI18n();

    
    var attempts = 0;

    (function boot() {
      attempts += 1;
      Store.init();
      var mapOk = MapModule.init();

      if (mapOk) {
        Weather.start();
        renderAll();
        Store.onChange(renderAll);
        wireButtons();
        wireLanguage();
        startLoops();
        seedIfEmpty();
      } else if (attempts < 12) {
        setTimeout(boot, 500);
      } else {
        
        var t = document.getElementById('scText');
        if (t) t.textContent = T('wx_off');
        ToastBoxShow(T('locate_none'));
      }
    })();
  }

  function populateLanguages() {
    var sel = document.getElementById('langSel');
    if (!sel || typeof LANGUAGE_LABELS === 'undefined') return;
    sel.innerHTML = Object.keys(LANGUAGE_LABELS).map(function (code) {
      return '<option value="' + code + '">' + LANGUAGE_LABELS[code] + '</option>';
    }).join('');
  }

  function startLoops() {
    
    setInterval(function () {
      if (MapModule.getMap()) UIRenderer.renderBanner();
    }, 20000);

    
    setInterval(function () {
      if (MapModule.getMap()) renderAll();
    }, 120000);
  }

  function applyStaticI18n() {
    document.getElementById('tTitleSub').textContent = T('titleSub');
    document.getElementById('fabReport').title = T('fab_report');
    document.getElementById('fabNearest').title = T('fab_nearest');
  }

  function renderAll() {
    MapModule.render();
    UIRenderer.renderBanner();
    
    if (UIRenderer.sheetOpen() && !document.getElementById('sendBtn')) {
      UIRenderer.openSummary();
    }
  }

  function ToastBoxShow(msg) { UIRenderer.ToastBox.show(msg); }

  

  function wireButtons() {
    document.getElementById('fabReport').onclick = function () {
      UIRenderer.openReportForm();
    };

    document.getElementById('fabLocate').onclick = function () {
      ToastBoxShow(T('locating'));
      MapModule.locate(function (res) {
        if (!res.ok) {
          ToastBoxShow(T('locate_none'));
          return;
        }
        if (!MapModule.inChennai(res.lat, res.lng)) {
          MapModule.flyTo(CONFIG.CENTER, 12, 0.8);
          ToastBoxShow(T('locate_out'));
          return;
        }
        MapModule.flyTo([res.lat, res.lng], 16, 0.8);
        MapModule.drawUser(res.lat, res.lng, res.accuracy);
        if (res.accuracy > 40) {
          ToastBoxShow(fmt('locate_lowacc', { a: Math.round(res.accuracy) }));
        } else {
          ToastBoxShow(fmt('you_here_acc', { a: Math.round(res.accuracy) }));
        }
        UIRenderer.openSummary();
      });
    };

    document.getElementById('fabNearest').onclick = function () {
      ToastBoxShow(T('locating'));
      MapModule.locate(function (res) {
        var c = res.ok && MapModule.inChennai(res.lat, res.lng) ? res : MapModule.getCenter();
        if (res.ok && MapModule.inChennai(res.lat, res.lng)) {
          MapModule.flyTo([c.lat, c.lng], 16, 0.8);
          MapModule.drawUser(c.lat, c.lng, c.accuracy);
        }
        UIRenderer.openNearest(c.lat, c.lng);
      });
    };

    document.getElementById('fabZones').onclick = function () {
      var shown = MapModule.toggleShelters();
      this.classList.toggle('active-tint', shown);
      ToastBoxShow(shown ? T('toast_zones_on') : T('toast_zones_off'));
    };

    document.getElementById('statusCard').onclick = function () {
      UIRenderer.openSummary();
    };
  }

  

  function wireLanguage() {
    var sel = document.getElementById('langSel');
    sel.value = lang;
    sel.onchange = function () {
      setLang(sel.value);
      applyStaticI18n();
      Weather.refresh();
      renderAll();
      sel.value = lang;
    };
  }

  

  function seedIfEmpty() {
    if (!Store.storageOK()) return;
    if (Store.all().length > 0) return;
    [[13.0503, 80.2820], [13.0002, 80.2668], [12.9795, 80.2216]].forEach(function (p) {
      Store.addRaw({
        lat: p[0], lng: p[1], type: 'flood', note: '',
        t: Date.now() - Math.floor(Math.random() * 3600000)
      });
    });
    renderAll();
  }

  return { init: init };
})();

document.addEventListener('DOMContentLoaded', function () { App.init(); });
