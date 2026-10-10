
'use strict';

var UiTime = (function () {
  function ago(t) {
    var m = Math.max(0, Math.floor((Date.now() - t) / 60000));
    if (m < 1) return T('d_now');
    if (m < 60) return fmt('d_min', { m: m });
    return fmt('d_hr', { h: Math.floor(m / 60) });
  }
  function dist(m) { return m < 950 ? m + ' m' : (m / 1000).toFixed(1) + ' km'; }
  return { ago: ago, dist: dist };
})();

var UIRenderer = (function () {

  var emergencyShownFor = {};   
  var reportState = { type: null };

  

  function el(id) { return document.getElementById(id); }

  var STATUS = {
    ok:        { cls: 'ok',        icon: 'check_circle' },
    advisory:  { cls: 'advisory',  icon: 'error' },
    warning:   { cls: 'warning',   icon: 'warning' },
    emergency: { cls: 'emergency', icon: 'emergency' }
  };

  var ZONE_COLORS = { emergency: '#d93025', warning: '#e8710a', advisory: '#f09000' };

  function doDontHtml(al) {
    var li = function (x, cls) {
      var icon = cls === 'mi-do' ? 'check_circle' : 'cancel';
      return '<li><span class="mi ' + cls + '"><span class="ms">' + icon + '</span></span>' + x + '</li>';
    };
    return '<h3 class="sec">' + T('sheet_do') + '</h3><ul class="do-list">' +
      al.do.map(function (x) { return li(x, 'mi-do'); }).join('') + '</ul>' +
      '<h3 class="sec">' + T('sheet_dont') + '</h3><ul class="do-list">' +
      al.dont.map(function (x) { return li(x, 'mi-no'); }).join('') + '</ul>';
  }

  function nearestShelterHtml(lat, lng) {
    var best = null, bd = Infinity;
    SHELTERS.forEach(function (s) {
      var d = Zones.distM(lat, lng, s.lat, s.lng);
      if (d <= 5000 && d < bd) { bd = d; best = s; }
    });
    if (!best) return T('nearest_none');
    return fmt('nearest', { n: best.n, d: UiTime.dist(bd), la: best.lat, ln: best.lng });
  }

  
  function adviceFor(z) {
    var esc = z.status === 'emergency';
    function wrap(emg, normal) { return esc ? emg : normal; }
    if (lang === 'ta') return wrap(
      { do: ['<b>112</b> அல்லது <b>108</b> க்கு அழைக்கவும்', 'உடனடியாக அருகிலுள்ள பாதுகாப்பு இடத்திற்கு செல்லுங்கள்', 'கூட்டமாக இருங்கள்; சிக்கிய பயணிகளுக்கு உதவுங்கள்', 'செல்போனை சார்ஜ் வைத்திருங்கள்'],
        dont: ['வெள்ள நீரில் நடக்கவோ வாகனம் ஓட்டவோ வேண்டாம்', 'விழுந்த மின் கம்பிகளைத் தொட வேண்டாம்', 'கடற்கரை/ஆற்றங்கரை அருகில் நிற்க வேண்டாம்', 'வதந்திகளை நம்ப வேண்டாம் — இந்த வரைபடத்தின் தகவலை மட்டும் பின்பற்றுங்கள்'] },
      { do: ['வானிலை தகவலை கண்காணிக்கவும்', 'காவல்/கடைக்காரர்களிடம் உறுதிப்படுத்திய வழிமுறைகளை கேளுங்கள்', 'விளக்கு உள்ள பிரதான சாலைகளை பயன்படுத்துங்கள்', 'மழை அதிகமானால் பாதுகாப்பு இடத்தை தேடுங்கள்'],
        dont: ['கால் ஆழம் தண்ணீரில் நடக்க வேண்டாம் (கழிவுகள்/மின் கம்பி மறைந்திருக்கும்)', 'ஓடும் நீரில் இறங்க வேண்டாம்', 'இரவில் தனியாக அலைய வேண்டாம்'] });
    if (lang === 'hi') return wrap(
      { do: ['<b>112</b> या <b>108</b> पर कॉल करें', 'तुरंत नज़दीकी सुरक्षित आश्रय तक जाएँ', 'समूह में रहें; फँसे पर्यटकों की मदद करें', 'फ़ोन चार्ज रखें'],
        dont: ['बाढ़ के पानी में न चलें, न वाहन चलाएँ', 'गिरी बिजली की लाइन न छुएँ', 'बीच/नदी किनारे न रुकें', 'अफ़वाहों पर भरोसा न करें — इसी मानचित्र का डेटा देखें'] },
      { do: ['मौसम जानकारी पर नज़र रखें', 'पुलिस/दुकानदारों से पुष्ट निर्देश पूछें', 'रोशनी वाली मुख्य सड़कों का उपयोग करें', 'बारिश बढ़े तो आश्रय खोजें'],
        dont: ['घुटने-गहरे पानी में न चलें (मैनहोल/तार छिपे होते हैं)', 'बहते पानी में न उतरें', 'रात में अकेले न भटकें'] });
    return wrap(
      { do: ['Call <b>112</b> (national) or <b>108</b> (ambulance)', 'Move to the nearest safe shelter right away', 'Stay in groups; help other stranded tourists', 'Keep your phone charged'],
        dont: ['Do not walk or drive into flood water', 'Do not touch fallen power lines or poles', 'Do not stand near beaches or river banks', 'Do not trust rumours — follow only this map’s verified reports'] },
      { do: ['Keep watching the live weather strip', 'Ask police or shopkeepers for verified directions', 'Use lit main roads, not shortcuts', 'Find a shelter if the rain worsens'],
        dont: ['Never walk through knee-deep water — manholes and wires stay hidden', 'Avoid moving water entirely', 'Avoid lonely streets after dark'] });
  }

  

  function renderBanner() {
    var card = el('statusCard'), iconWrap = el('scIcon');
    var c = MapModule.getCenter();
    var near = Zones.nearestTo(c.lat, c.lng);
    var meta = STATUS.ok, txt = T('status_ok');
    if (near) {
      if (near.zone.status === 'emergency') {
        meta = STATUS.emergency;
        txt = fmt('banner_emergency', { n: near.zone.n, area: near.zone.area });
      } else if (near.zone.status === 'warning') {
        meta = STATUS.warning;
        txt = fmt('banner_warning', { n: near.zone.n, area: near.zone.area });
      } else {
        meta = STATUS.advisory;
        txt = fmt('banner_advisory', { n: near.zone.n, area: near.zone.area });
      }
    }
    card.className = meta.cls;
    iconWrap.className = meta.cls;
    iconWrap.innerHTML = '<span class="ms">' + meta.icon + '</span>';
    el('scText').innerHTML = txt;

    if (near && near.zone.status === 'emergency' &&
        !emergencyShownFor[near.zone.key]) {
      emergencyShownFor[near.zone.key] = true;
      openEmergency(near.zone);
      UIEffects.vibrate([300, 120, 300, 120, 600]);
    }
  }

  

  function openZone(z) {
    var dist = Zones.distM(MapModule.getCenter().lat, MapModule.getCenter().lng, z.lat, z.lng);
    var repRows = z.reps.slice(-6).reverse().map(function (r) {
      var tp = null;
      for (var i = 0; i < REPORT_TYPES.length; i++) {
        if (REPORT_TYPES[i].id === r.type) { tp = REPORT_TYPES[i]; break; }
      }
      if (!tp) tp = REPORT_TYPES[REPORT_TYPES.length - 1];
      return '<div class="kv"><span class="ms">' + tp.icon + '</span><span class="label">' +
        fmt('t_' + r.type, {}) + (r.note ? ' — ' + escapeHtml(r.note) : '') +
        '</span><span class="when">' + UiTime.ago(r.t) + '</span></div>';
    }).join('');

    var badgeCls = z.status === 'emergency' ? 'b-emg' : z.status === 'warning' ? 'b-wrn' : 'b-adv';

    el('sheetBody').innerHTML =
      '<div class="stitle"><span class="ms" style="color:' + ZONE_COLORS[z.status] + '">' +
      STATUS[z.status].icon + '</span>' + z.area +
      '<span class="badge ' + badgeCls + '">' + z.status.toUpperCase() + ' · ' + z.n + '</span></div>' +
      '<div class="sub">' + T('zone_here') + ' ' + z.status.toUpperCase() + ' · ' +
      UiTime.dist(dist) + ' from map centre · ' + T('sheet_live') + '</div>' +
      '<h3 class="sec">' + T('sheet_reports') + '</h3>' + repRows +
      doDontHtml(adviceFor(z)) +
      '<h3 class="sec">' + T('nearest_h') + '</h3>' +
      '<div class="kv"><span class="ms">local_hospital</span><span class="label">' +
      nearestShelterHtml(z.lat, z.lng) + '</span></div>' +
      '<button class="btn btn-text" id="closeSheet">' + T('emg_ok') + '</button>';

    el('closeSheet').onclick = closeSheet;
    openSheet();
  }

  

  function openSummary() {
    var c = MapModule.getCenter();
    var zones = Zones.active();
    var near = zones.filter(function (z) {
      return Zones.distM(c.lat, c.lng, z.lat, z.lng) < 2000;
    });

    var html;
    if (near.length === 0) {
      html = '<div class="stitle"><span class="ms" style="color:var(--green)">check_circle</span>' +
        T('sheet_none_title') + '</div><div class="sub">' + T('sheet_none') + '</div>';
    } else {
      html = zones.map(function (z) {
        var d = Zones.distM(c.lat, c.lng, z.lat, z.lng);
        var badgeCls = z.status === 'emergency' ? 'b-emg' : z.status === 'warning' ? 'b-wrn' : 'b-adv';
        return '<div class="kv" data-zone="' + z.key + '" style="cursor:pointer">' +
          '<span class="ms" style="color:' + ZONE_COLORS[z.status] + '">' + STATUS[z.status].icon + '</span>' +
          '<span class="label">' + z.area + '</span>' +
          '<span class="when">' + UiTime.dist(d) + '</span>' +
          '<span class="badge ' + badgeCls + '">' + z.n + '</span></div>';
      }).join('');
    }

    var top = 0;
    zones.forEach(function (z) { if (z.n > top) top = z.n; });
    html += '<h3 class="sec">' + T('sim_title') + '</h3>' +
      '<button class="btn btn-outline" id="simBtn"><span class="ms">bolt</span>' +
      T('sim_btn') + '</button>' +
      '<div class="sub centered">' + fmt('sim_note', { n: Math.max(0, CONFIG.THRESHOLDS.EMERGENCY - top) }) + '</div>';

    el('sheetBody').innerHTML = html;

    var list = document.querySelectorAll('[data-zone]');
    for (var i = 0; i < list.length; i++) {
      (function (node) {
        node.onclick = function () {
          var z = null;
          zones.forEach(function (zz) { if (zz.key === node.getAttribute('data-zone')) z = zz; });
          if (z) openZone(z);
        };
      })(list[i]);
    }
    el('simBtn').onclick = Demo.simulate;
    openSheet();
  }

  function openNearest(lat, lng) {
    el('sheetBody').innerHTML =
      '<div class="stitle"><span class="ms" style="color:var(--blue)">near_me</span>' +
      T('nearest_h') + '</div><div class="sub">' + nearestShelterHtml(lat, lng) + '</div>' +
      '<button class="btn btn-text" id="closeSheet">' + T('emg_ok') + '</button>';
    el('closeSheet').onclick = closeSheet;
    openSheet();
  }

  

  function openReportForm() {
    reportState = { type: null };
    var chips = REPORT_TYPES.map(function (t) {
      return '<button class="chip" data-type="' + t.id + '">' +
        '<span class="ms">' + t.icon + '</span>' + fmt('t_' + t.id, {}) + '</button>';
    }).join('');

    el('sheetBody').innerHTML =
      '<div class="stitle"><span class="ms" style="color:var(--red)">emergency</span>' +
      T('rep_title') + '</div>' +
      '<div class="sub">' + T('choose_area') + '</div>' +
      '<h3 class="sec">' + T('type_label') + '</h3>' +
      '<div class="chiprow" id="typeRow">' + chips + '</div>' +
      '<input class="note" id="noteInput" placeholder="' + T('note_ph') + '" maxlength="140">' +
      '<button class="btn btn-primary" id="sendBtn" disabled><span class="ms">send</span>' +
      T('send') + '</button>' +
      '<button class="btn btn-text" id="closeRep">' + T('emg_ok') + '</button>' +
      '<div class="disc">GPS · crowd-verified · Chennai geofence only</div>';

    var row = el('typeRow');
    row.onclick = function (e) {
      var b = e.target.closest ? e.target.closest('.chip') : null;
      if (!b) return;
      var all = row.querySelectorAll('.chip');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('sel');
      b.classList.add('sel');
      reportState.type = b.getAttribute('data-type');
      el('sendBtn').disabled = false;
    };
    el('sendBtn').onclick = submitReport;
    el('closeRep').onclick = function () {
      closeSheet();
      MapModule.setReticle(false);
    };
    MapModule.setReticle(true);
    openSheet();
  }

  function submitReport() {
    var c = MapModule.getCenter();
    if (!MapModule.inChennai(c.lat, c.lng)) {
      ToastBox.show(T('out_of_chennai'));
      return;
    }
    Store.add({ lat: c.lat, lng: c.lng, type: reportState.type, note: el('noteInput').value });
    closeSheet();
    MapModule.setReticle(false);
    MapModule.flyTo([c.lat, c.lng], 15, 0.6);
    ToastBox.show(T('saved'));
    UIEffects.vibrate(120);
  }

  

  function openEmergency(z) {
    var al = adviceFor(z);
    el('emgBody').innerHTML =
      '<div class="sub">' + fmt('emg_where', { area: z.area, n: z.n }) + '</div>' +
      '<div class="emg-strip"><span class="ms">call</span><span>' + T('emg_call') + '</span></div>' +
      doDontHtml(al) +
      '<div class="emg-strip"><span class="ms">local_hospital</span><span>' +
      nearestShelterHtml(z.lat, z.lng) + '</span></div>' +
      '<div class="emg-strip" style="background:var(--gray-2)">' +
      '<span class="ms" style="color:var(--blue)">map</span>' +
      '<span><a class="rowlink" id="emgSee" href="#">' + T('emg_view') + '</a></span></div>' +
      '<button class="btn btn-primary" id="emgOk">' + T('emg_ok') + '</button>';

    el('emgWrap').classList.add('show');
    el('emgOk').onclick = function () { el('emgWrap').classList.remove('show'); };
    el('emgSee').onclick = function (e) {
      e.preventDefault();
      el('emgWrap').classList.remove('show');
      MapModule.flyTo([z.lat, z.lng], 15, 0.7);
      openZone(z);
    };
  }

  

  function openSheet()  { var s = el('sheet'); if (s) s.classList.add('open'); }
  function closeSheet() { var s = el('sheet'); if (s) s.classList.remove('open'); }
  function sheetOpen()  { var s = el('sheet'); return s ? s.classList.contains('open') : false; }

  var ToastBox = (function () {
    var timer = null;
    function show(msg) {
      var t = el('toast');
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(timer);
      timer = setTimeout(function () { t.classList.remove('show'); }, 2600);
    }
    return { show: show };
  })();

  var UIEffects = {
    vibrate: function (p) {
      if (navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {  } }
    }
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  return {
    renderBanner: renderBanner,
    openZone: openZone,
    openSummary: openSummary,
    openNearest: openNearest,
    openReportForm: openReportForm,
    openEmergency: openEmergency,
    openSheet: openSheet,
    closeSheet: closeSheet,
    sheetOpen: sheetOpen,
    ToastBox: ToastBox,
    UIEffects: UIEffects,
    escapeHtml: escapeHtml
  };
})();
