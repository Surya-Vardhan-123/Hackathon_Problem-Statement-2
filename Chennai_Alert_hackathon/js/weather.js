
'use strict';

var Weather = (function () {

  var ICONS = {
    0:  ['Clear sky', 'wb_sunny'],
    1:  ['Mainly clear', 'wb_sunny'],
    2:  ['Partly cloudy', 'partly_cloudy_day'],
    3:  ['Overcast', 'cloud'],
    45: ['Fog', 'foggy'],
    48: ['Fog', 'foggy'],
    51: ['Light drizzle', 'water_drop'],
    53: ['Drizzle', 'rainy'],
    55: ['Heavy drizzle', 'rainy'],
    61: ['Light rain', 'umbrella'],
    63: ['Rain', 'rainy'],
    65: ['Heavy rain', 'thunderstorm'],
    66: ['Freezing rain', 'rainy'],
    67: ['Freezing rain', 'rainy'],
    71: ['Light snow', 'ac_unit'],
    73: ['Snow', 'ac_unit'],
    75: ['Heavy snow', 'ac_unit'],
    77: ['Snow grains', 'ac_unit'],
    80: ['Rain showers', 'rainy'],
    81: ['Showers', 'rainy'],
    82: ['Violent showers', 'thunderstorm'],
    95: ['Thunderstorm', 'thunderstorm'],
    96: ['Thunderstorm + hail', 'thunderstorm'],
    99: ['Severe thunderstorm', 'thunderstorm']
  };

  function riskLevel(code, mm) {
    if (mm > 7.5 || (code !== undefined && code >= 95)) return 'high';
    if (mm > 2.5) return 'mid';
    return 'low';
  }

  function render(c) {
    var w = ICONS[c.weather_code] || ['—', 'thermostat'];
    var nodeName = document.getElementById('wxText');
    var nodeIcon = document.getElementById('wxIcon');
    var nodeDot  = document.getElementById('wxDot');
    if (!nodeName) return;
    nodeName.textContent = 'Chennai · ' + fmt('wx_temp', {
      t: Math.round(c.temperature_2m),
      d: w[0],
      r: c.precipitation,
      w: Math.round(c.wind_speed_10m)
    });
    nodeIcon.textContent = w[1];
    nodeDot.className = riskLevel(c.weather_code, c.precipitation);
  }

  function setOffline() {
    var t = document.getElementById('wxText');
    if (t) t.textContent = T('wx_off');
    var d = document.getElementById('wxDot');
    if (d) d.className = 'off';
  }

  function refresh() {
    if (typeof fetch === 'undefined') { setOffline(); return; }
    fetch(CONFIG.WEATHER_URL)
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.current) render(j.current);
        else setOffline();
      })
      .catch(setOffline);
  }

  function start() {
    refresh();
    setInterval(refresh, CONFIG.WEATHER_POLL_MS);
  }

  return { start: start, refresh: refresh };
})();
