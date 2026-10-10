/* One-off tool: strips all comments from the app's JS/CSS/HTML in place. */
'use strict';
const fs = require('fs');

function stripJs(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  let prevSig = '';
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') {
      while (i < n && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && d === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const q = c;
      out += c; i++;
      while (i < n) {
        if (src[i] === '\\') { out += src[i] + (src[i + 1] || ''); i += 2; continue; }
        out += src[i];
        if (src[i] === q) { i++; break; }
        i++;
      }
      prevSig = q;
      continue;
    }
    if (c === '/') {
      const m = /^\/((?:\\.|\[(?:\\.|[^\]\\])*\]|[^\/\\\n])+?)\/[gimsuy]*/.exec(src.slice(i));
      const canBeRegex = /[(,=:!&|?{};\n+\-*%<>]|^$/.test(prevSig) || prevSig === '';
      if (m && canBeRegex) {
        out += m[0];
        i += m[0].length;
        prevSig = ')';
        continue;
      }
    }
    out += c;
    if (!/\s/.test(c)) prevSig = c;
    i++;
  }
  return out;
}

function stripCss(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'") {
      const q = c;
      out += c; i++;
      while (i < n) {
        if (src[i] === '\\') { out += src[i] + (src[i + 1] || ''); i += 2; continue; }
        out += src[i];
        if (src[i] === q) { i++; break; }
        i++;
      }
      continue;
    }
    out += c;
    i++;
  }
  return out.replace(/\n\s*\n\s*\n+/g, '\n\n');
}

function stripHtml(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    if (src.startsWith('<!--', i)) {
      const end = src.indexOf('-->', i);
      i = end === -1 ? n : end + 3;
      continue;
    }
    out += src[i];
    i++;
  }
  return out.replace(/\n\s*\n\s*\n+/g, '\n\n');
}

const targets = [
  ['index.html', 'html'],
  ['css/style.css', 'css'],
  ['js/leaflet-load.js', 'js'],
  ['js/config.js', 'js'],
  ['js/i18n.js', 'js'],
  ['js/store.js', 'js'],
  ['js/zones.js', 'js'],
  ['js/map.js', 'js'],
  ['js/ui.js', 'js'],
  ['js/weather.js', 'js'],
  ['js/app.js', 'js']
];

for (const [path, kind] of targets) {
  const src = fs.readFileSync(path, 'utf8');
  const out = kind === 'js' ? stripJs(src) : kind === 'css' ? stripCss(src) : stripHtml(src);
  fs.writeFileSync(path, out);
  console.log('stripped', path, src.length, '->', out.length);
}
