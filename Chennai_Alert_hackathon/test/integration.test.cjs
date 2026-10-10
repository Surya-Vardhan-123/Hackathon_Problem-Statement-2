
'use strict';
const fs = require('fs');
const vm = require('vm');


const sandbox = {
  console, Date, Math, JSON, Infinity, isNaN, setTimeout, setInterval, clearTimeout,
  navigator: { language: 'en', vibrate: () => {} },
  localStorage: {
    _d: {},
    getItem(k) { return this._d[k] ?? null; },
    setItem(k, v) { this._d[k] = String(v); },
    removeItem(k) { delete this._d[k]; }
  },
  document: {
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({ classList: { add() {}, remove() {} } }),
    head: { appendChild() {} },
    write() {}
  }
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.L = undefined;
sandbox.__leafletCheck = () => true;
vm.createContext(sandbox);

const files = ['translations.js','config.js','shelters.js','i18n.js','store.js','zones.js','map.js','ui.js','weather.js','app.js'];
let failed = false;
for (const f of files) {
  try {
    vm.runInContext(fs.readFileSync('js/' + f, 'utf8'), sandbox, { filename: 'js/' + f });
    console.log('load OK  ' + f);
  } catch (e) {
    console.log('LOAD FAIL ' + f + ' — ' + e.message);
    failed = true;
  }
}
if (failed) process.exit(1);


const t = (name, cond) => {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name);
  if (!cond) process.exitCode = 1;
};

t('threshold 3 -> advisory',  sandbox.Zones.statusFor(3)  === 'advisory');
t('threshold 9 -> warning',   sandbox.Zones.statusFor(9)  === 'warning');
t('threshold 10 -> emergency', sandbox.Zones.statusFor(10) === 'emergency');


for (let i = 0; i < 12; i++) {
  sandbox.Store.addRaw({ lat: 13.0503 + Math.random() * 0.0003, lng: 80.2825 + Math.random() * 0.0003, type: 'flood' });
}
const zones = sandbox.Zones.active();
const maxN = Math.max(...zones.map(z => z.n));
t('12 close reports cluster into a single zone', zones.length === 1 && maxN === 12);
t('clustered zone reaches emergency status', zones[0] && zones[0].status === 'emergency');

t('CONFIG.LS_KEY wired', !!sandbox.CONFIG.LS_KEY);
t('i18n T() wired', typeof sandbox.T('status_ok') === 'string' && sandbox.T('status_ok').length > 0);
t('Tamil translation present', /\u0B9A\u0BC6\u0BA9\u0BCD\u0BA9\u0BC8/.test(sandbox.LANGS.ta.out_of_chennai)); 
t('20 languages available', Object.keys(sandbox.LANGS).length === 20);
t('26 safe places available', sandbox.SHELTERS.length === 26);

process.exit(process.exitCode || 0);
