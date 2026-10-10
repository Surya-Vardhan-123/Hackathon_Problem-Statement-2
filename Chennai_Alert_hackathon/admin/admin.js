'use strict';

(function () {

  var BASE = '/.netlify/functions/reports';
  var token = getToken();

  function getToken() {
    var m = (window.location.search || '').match(/[?&]secret=([^&]+)/);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  function el(id) { return document.getElementById(id); }

  function reportIconClass(type) {
    var map = {
      flood: 'water_drop',
      storm: 'storm',
      blocked: 'construction',
      unsafe: 'warning',
      livewire: 'bolt',
      other: 'error'
    };
    return map[type] || map.other;
  }

  function reportColor(type) {
    var map = {
      flood: '#1a73e8',
      storm: '#d93025',
      blocked: '#e8710a',
      unsafe: '#f09000',
      livewire: '#d93025',
      other: '#5f6368'
    };
    return map[type] || map.other;
  }

  function fmtWhen(t) {
    var s = Math.floor((Date.now() - t) / 1000);
    if (s < 60) return s + 's ago';
    var m = Math.floor(s / 60);
    if (m < 60) return m + 'm ago';
    var h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    return Math.floor(h / 24) + 'd ago';
  }

  function fmtCoords(lat, lng) {
    return 'Lat ' + lat.toFixed(5) + ' · Lng ' + lng.toFixed(5);
  }

  function showToast(msg) {
    var t = el('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  function setLoading(show) {
    var list = el('list');
    if (show) {
      list.innerHTML =
        '<div class="empty"><span class="ms">hourglass_empty</span>Loading reports…</div>';
    }
  }

  function render(list) {
    var node = el('list');
    if (!list || list.length === 0) {
      var cur = el('statusSel').value;
      var hint = cur === 'all' ? 'No reports yet.' :
        'No ' + cur + ' reports.';
      node.innerHTML =
        '<div class="empty"><span class="ms">inbox</span>' + hint + '</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      var icon = reportIconClass(r.type);
      var color = reportColor(r.type);
      var badgeCls = r.status === 'accepted' ? 'b-acc' :
        r.status === 'declined' ? 'b-dec' : 'b-pen';
      var badgeTxt = r.status.toUpperCase();
      var actions = '';
      if (r.status === 'pending') {
        actions =
          '<button class="btn primary" data-act="accept" data-id="' + r.id + '">' +
          '<span class="ms">check_circle</span>Accept</button>' +
          '<button class="btn danger" data-act="decline" data-id="' + r.id + '">' +
          '<span class="ms">cancel</span>Decline</button>';
      } else {
        actions =
          '<span class="muted" style="font-size:12px">' + badgeTxt +
          ' · ' + fmtWhen(r.seen || r.t) + '</span>';
      }

      html +=
        '<div class="row">' +
        '<div class="icon" style="background:' + color + '"><span class="ms">' + icon + '</span></div>' +
        '<div class="body">' +
        '<div class="top">' +
        '<span class="type">' + humanType(r.type) + '</span>' +
        '<span class="badge ' + badgeCls + '">' + badgeTxt + '</span>' +
        '<span class="when">' + fmtWhen(r.t) + '</span>' +
        '</div>' +
        (r.note ? '<div class="note">' + escapeHtml(r.note) + '</div>' : '') +
        '<div class="loc">' + fmtCoords(r.lat, r.lng) + '</div>' +
        '<div class="actions">' + actions + '</div>' +
        '</div>' +
        '</div>';
    }
    node.innerHTML = html;

    var accepts = node.querySelectorAll('[data-act="accept"]');
    for (var a = 0; a < accepts.length; a++) {
      accepts[a].onclick = function () { act('accept', this.getAttribute('data-id')); };
    }
    var declines = node.querySelectorAll('[data-act="decline"]');
    for (var d = 0; d < declines.length; d++) {
      declines[d].onclick = function () { act('decline', this.getAttribute('data-id')); };
    }
  }

  function humanType(t) {
    var map = {
      flood: 'Flood water',
      storm: 'Cyclone / storm damage',
      blocked: 'Road blocked',
      unsafe: 'Generally unsafe area',
      livewire: 'Fallen power line',
      other: 'Other danger'
    };
    return map[t] || map.other;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function updateCounts(reports) {
    var p = 0, a = 0, d = 0;
    for (var i = 0; i < reports.length; i++) {
      var s = reports[i].status;
      if (s === 'pending') p++;
      else if (s === 'accepted') a++;
      else if (s === 'declined') d++;
    }
    el('cntPending').textContent = p;
    el('cntAccepted').textContent = a;
    el('cntDeclined').textContent = d;
    el('updated').textContent = fmtWhen(reports.updated ? reports.updated : Date.now());
  }

  function load() {
    var status = el('statusSel').value;
    var url = BASE + '?status=' + encodeURIComponent(status) +
      '&secret=' + encodeURIComponent(token);

    setLoading(true);
    fetch(url, { cache: 'no-cache' })
      .then(function (r) { return r.json().then(function (j) {
        if (!r.ok) throw new Error(j && j.message ? j.message : 'request failed');
        return j;
      }); })
      .then(function (j) {
        render(j.reports);
        updateCounts(j);
      })
      .catch(function (e) {
        el('list').innerHTML =
          '<div class="err"><span class="ms">cloud_off</span>Could not reach the admin store: ' +
          escapeHtml(e.message || 'network error') + '</div>';
      })
      .then(function () { setLoading(false); });
  }

  function act(action, id) {
    var url = BASE + '/' + id + '/' + action + '?secret=' +
      encodeURIComponent(token);
    fetch(url, { method: 'POST', cache: 'no-cache' })
      .then(function (r) { return r.json().then(function (j) {
        if (!r.ok) throw new Error(j && j.message ? j.message : 'action failed');
        return j;
      }); })
      .then(function () {
        showToast(action === 'accept' ? 'Report accepted' : 'Report declined');
        load();
      })
      .catch(function (e) {
        showToast('Action failed: ' + (e.message || 'unknown'));
      });
  }

  function gate() {
    if (!token) {
      el('list').innerHTML =
        '<div class="err"><span class="ms">lock</span>This admin panel is locked. ' +
        'Open it with a secret token in the URL, for example:<br><br>' +
        '<code>/admin/?secret=YOUR_TOKEN</code></div>';
      el('toolbar').style.display = 'none';
      el('statusBar').style.display = 'none';
      return;
    }
  }

  function wire() {
    el('refreshBtn').onclick = load;
    el('search').oninput = debounce(performSearch, 220);
    el('statusSel').onchange = load;
  }

  function performSearch() {
    var q = el('search').value.trim().toLowerCase();
    var listEl = el('list');
    var rows = listEl.querySelectorAll('.row');
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var text = row.textContent.toLowerCase();
      row.style.display = text.indexOf(q) === -1 ? 'none' : 'flex';
    }
  }

  function debounce(fn, ms) {
    var timer = null;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(function () { fn(); }, ms);
    };
  }

  gate();
  wire();
  load();
  setInterval(load, 30000);
})();
