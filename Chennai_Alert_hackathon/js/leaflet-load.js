
(function () {
  'use strict';
 
  var CDNS = [
    'https://unpkg.com/leaflet@1.9.4/dist/',
    'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/'
  ];
  var JS_FILE = 'leaflet.js';
  var CSS_FILE = 'leaflet.css';

  
  document.write('<link rel="stylesheet" href="' + CDNS[0] + CSS_FILE + '">');

  
  for (var i = 0; i < CDNS.length; i++) {
    document.write('<script src="' + CDNS[i] + JS_FILE + '"><\/script>');

    if (i < CDNS.length - 1) {
      var nextUrl = CDNS[i + 1] + JS_FILE;
      document.write(
        '<script>' +
        'if(!window.L){' +
        'var fb=document.createElement("script");' +
        'fb.src="' + nextUrl + '";' +
        'fb.onload=function(){window.__leafletReady();};' +
        'document.head.appendChild(fb);' +
        '}' +
        '<\/script>'
      );
    }
  }

  
  window.__leafletCheck = function () { return typeof window.L !== 'undefined'; };
})();
