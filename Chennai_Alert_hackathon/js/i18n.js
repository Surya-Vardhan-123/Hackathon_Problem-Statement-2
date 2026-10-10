
'use strict';
 
var LANGS = {

en: {
  titleSub: 'Tourist crisis companion',
  fab_report: 'Report a hazard',
  fab_nearest: 'Find nearest safe place',

  status_ok: 'No dangerous zone active right now. The map is live.',
  status_checking: 'Checking nearby tourist reports…',
  banner_advisory: '{n} recent tourist report(s) near <b>{area}</b>. Stay alert; avoid that area if you can.',
  banner_warning: '<b>{n} reports</b> near <b>{area}</b>. The area is unsafe — roads may be flooded or blocked. Do not go there.',
  banner_emergency: '<b>EMERGENCY ZONE</b> — {n}+ tourists reported danger near <b>{area}</b>. Do not enter. Tap for instructions.',

  wx_loading: 'Chennai · fetching live weather…',
  wx_temp: '{t}°C · {d} · rain {r} mm · wind {w} km/h',
  wx_off: 'Chennai · live weather unavailable',

  sheet_none_title: 'All clear in Chennai',
  sheet_none: 'No unsafe tourist zone within 2 km of the map centre. Still avoid flooded streets and follow local officials.',
  sheet_live: 'Live · auto-refreshing',
  zone_here: 'Currently:',
  sheet_reports: 'Recent reports in this zone',
  sheet_do: 'What to do',
  sheet_dont: 'What not to do',

  nearest_h: 'Nearest safe shelter',
  nearest_none: 'No safe shelter, hospital, or police station was found within 5 km.',
  dirs: 'Directions',
  nearest: '<b>{n}</b> · {d} · <a class="rowlink" href="https://www.google.com/maps/dir/?api=1&destination={la},{ln}" target="_blank">Directions</a>',

  rep_title: 'Report a hazard · Chennai only',
  choose_area: 'Pan the map so the red pin sits on the spot, then pick what you see.',
  type_label: 'What do you see?',
  note_ph: 'Optional note (e.g. “water knee-deep on the bridge”)',
  send: 'Submit live report',
  t_flood: 'Flood water', t_storm: 'Cyclone / storm damage', t_blocked: 'Road blocked',
  t_unsafe: 'Generally unsafe area', t_livewire: 'Fallen power line', t_other: 'Other danger',

  locating: 'Getting an accurate GPS fix…',
  locate_lowacc: 'Weak GPS signal (±{a} m). Move to an open spot for a better fix.',
  you_here: 'You are here',
  you_here_acc: 'You are here · ±{a} m accuracy',
  locate_none: 'Could not get your location. Allow location access or find your spot on the map.',
  locate_out: 'You appear to be outside Chennai. This app covers Chennai only.',

  saved: 'Report submitted to the live map',
  out_of_chennai: 'Reports are accepted only inside Chennai city limits.',
  toast_emergency: 'Emergency zone declared — check the map and instructions',
  toast_zones_on: 'Safe shelters shown',
  toast_zones_off: 'Safe shelters hidden',

  emg_title: 'EMERGENCY ZONE',
  emg_where: 'Around <b>{area}</b> — {n} tourist reports in the last 3 hours.',
  emg_call: 'Move to the nearest safe shelter, avoid flood water and fallen lines. Call <b>112</b> (national emergency) or <b>108</b> (ambulance).',
  emg_ok: 'I understand',
  emg_view: 'View zone on map',

  sim_title: 'Demo',
  sim_btn: 'Simulate live tourist reports',
  sim_note: 'Adds random reports at known flood-prone spots. {n} more until a zone reaches the 10-report emergency threshold.',
  d_now: 'now', d_min: '{m} min ago', d_hr: '{h} h ago'
},

ta: {
  titleSub: 'சுற்றுலா அவசர உதவியாளர்',
  fab_report: 'ஆபத்தை அறிவிக்கவும்',
  fab_nearest: 'அருகிலுள்ள பாதுகாப்பான இடத்தைக் கண்டறியவும்',

  status_ok: 'தற்போது ஆபத்தான பகுதி இல்லை. வரைபடம் நேரடியாக இயங்குகிறது.',
  status_checking: 'அருகிலுள்ள அறிக்கைகள் சரிபார்க்கப்படுகின்றன…',
  banner_advisory: '<b>{area}</b> பகுதியில் {n} சமீபத்திய அறிக்கைகள். கவனமாக இருங்கள்; முடிந்தால் அப்பகுதியைத் தவிர்க்கவும்.',
  banner_warning: '<b>{area}</b> அருகில் <b>{n} அறிக்கைகள்</b>. பகுதி பாதுகாப்பற்றது — சாலைகள் வெள்ளத்தில் இருக்கலாம். செல்ல வேண்டாம்.',
  banner_emergency: '<b>அவசர மண்டலம்</b> — <b>{area}</b> அருகில் {n}+ பயணிகள் ஆபத்தைத் தெரிவித்துள்ளனர். நுழைய வேண்டாம். வழிமுறைகளுக்கு தட்டவும்.',

  wx_loading: 'சென்னை · நேரடி வானிலை வருகிறது…',
  wx_temp: '{t}°C · {d} · மழை {r} மி.மீ · காற்று {w} கி.மீ/ம',
  wx_off: 'சென்னை · நேரடி வானிலை கிடைக்கவில்லை',

  sheet_none_title: 'சென்னையில் அமைதி',
  sheet_none: 'வரைபட மையத்திற்கு 2 கி.மீ. உள்ளே ஆபத்தான பகுதி இல்லை. இருப்பினும் வெள்ள சாலைகளைத் தவிர்த்து, உள்ளூர் அதிகாரிகளின் வழிமுறைகளைப் பின்பற்றுங்கள்.',
  sheet_live: 'நேரடி · தானியங்கி புதுப்பிப்பு',
  zone_here: 'தற்போது:',
  sheet_reports: 'இப்பகுதியின் சமீபத்திய அறிக்கைகள்',
  sheet_do: 'என்ன செய்வது',
  sheet_dont: 'என்ன செய்யக்கூடாது',

  nearest_h: 'அருகிலுள்ள பாதுகாப்பு இடம்',
  nearest_none: '5 கி.மீ.க்குள் பாதுகாப்பு இடம், மருத்துவமனை அல்லது காவல் நிலையம் இல்லை.',
  dirs: 'வழி காட்டு',
  nearest: '<b>{n}</b> · {d} · <a class="rowlink" href="https://www.google.com/maps/dir/?api=1&destination={la},{ln}" target="_blank">வழி காட்டு</a>',

  rep_title: 'ஆபத்தை அறிவிக்கவும் · சென்னை மட்டும்',
  choose_area: 'சிவப்பு முள் சரியான இடத்தில் இருக்கும்படி வரைபடத்தை நகர்த்தி, பிறகு என்ன உள்ளது என்பதைத் தேர்வு செய்யுங்கள்.',
  type_label: 'என்ன தெரிகிறது?',
  note_ph: 'விருப்ப குறிப்பு (எ.கா. “பாலத்தில் கால் ஆழம் தண்ணீர்”)',
  send: 'நேரடி அறிக்கை சமர்ப்பி',
  t_flood: 'வெள்ள நீர்', t_storm: 'புயல் சேதம்', t_blocked: 'சாலை அடைபட்டது',
  t_unsafe: 'பாதுகாப்பற்ற பகுதி', t_livewire: 'விழுந்த மின் கம்பி', t_other: 'பிற ஆபத்து',

  locating: 'துல்லியமான GPS இடம் பெறப்படுகிறது…',
  locate_lowacc: 'GPS சமிக்ஞை பலவீனம் (±{a} மீ). திறந்த இடத்திற்கு நகர்ந்து முயலுங்கள்.',
  you_here: 'நீங்கள் இங்கே இருக்கிறீர்கள்',
  you_here_acc: 'நீங்கள் இங்கே · ±{a} மீ துல்லியம்',
  locate_none: 'உங்கள் இடம் கிடைக்கவில்லை. அனுமதி தாருங்கள் அல்லது வரைபடத்தில் தேடுங்கள்.',
  locate_out: 'நீங்கள் சென்னைக்கு வெளியே இருக்கலாம். இது சென்னைக்கு மட்டுமே.',

  saved: 'அறிக்கை நேரடி வரைபடத்தில் பதிவு ஆனது',
  out_of_chennai: 'அறிக்கைகள் சென்னை நகர எல்லைக்குள் மட்டுமே.',
  toast_emergency: 'அவசர மண்டலம் அறிவிக்கப்பட்டது — வரைபடத்தைப் பாருங்கள்',
  toast_zones_on: 'பாதுகாப்பு இடங்கள் காட்டப்படுகின்றன',
  toast_zones_off: 'பாதுகாப்பு இடங்கள் மறைக்கப்பட்டன',

  emg_title: 'அவசர மண்டலம்',
  emg_where: '<b>{area}</b> அருகில் — கடந்த 3 மணி நேரத்தில் {n} அறிக்கைகள்.',
  emg_call: 'அருகிலுள்ள பாதுகாப்பு இடத்திற்கு செல்லுங்கள்; வெள்ள நீர், விழுந்த மின் கம்பிகளைத் தவிர்க்கவும். <b>112</b> (தேசிய) அல்லது <b>108</b> (ஆம்புலன்ஸ்) அழைக்கவும்.',
  emg_ok: 'புரிந்தது',
  emg_view: 'மண்டலத்தை வரைபடத்தில் பார்',

  sim_title: 'டெமோ',
  sim_btn: 'நேரடி அறிக்கைகளை உருவாக்கு',
  sim_note: 'அறியப்பட்ட வெள்ளப் பகுதிகளில் சீரற்ற அறிக்கைகள் சேர்க்கும். அவசர வாசலுக்கு {n} அறிக்கைகள் மீதி.',
  d_now: 'இப்போது', d_min: '{m} நிமி முன்', d_hr: '{h} மணி முன்'
},

hi: {
  titleSub: 'पर्यटक संकट सहायक',
  fab_report: 'ख़तरा रिपोर्ट करें',
  fab_nearest: 'नज़दीकी सुरक्षित स्थान खोजें',

  status_ok: 'अभी कोई ख़तरनाक क्षेत्र सक्रिय नहीं है। मानचित्र लाइव है।',
  status_checking: 'नज़दीकी रिपोर्टें जाँची जा रही हैं…',
  banner_advisory: '<b>{area}</b> के पास {n} हालिया रिपोर्टें। सतर्क रहें; जहाँ तक हो सके उस क्षेत्र से बचें।',
  banner_warning: '<b>{area}</b> के पास <b>{n} रिपोर्टें</b>। क्षेत्र असुरक्षित है — सड़कें जलमग्न या बंद हो सकती हैं। वहाँ न जाएँ।',
  banner_emergency: '<b>आपातकालीन क्षेत्र</b> — <b>{area}</b> के पास {n}+ पर्यटकों ने ख़तरा रिपोर्ट किया। दाखिल न हों। निर्देशों के लिए टैप करें।',

  wx_loading: 'चेन्नई · लाइव मौसम लाया जा रहा है…',
  wx_temp: '{t}°C · {d} · बारिश {r} मिमी · हवा {w} किमी/घं',
  wx_off: 'चेन्नई · लाइव मौसम उपलब्ध नहीं',

  sheet_none_title: 'चेन्नई में सब ठीक है',
  sheet_none: 'मानचित्र केंद्र के 2 किमी में कोई असुरक्षित क्षेत्र नहीं। फिर भी जलमग्न सड़कों से बचें और स्थानीय अधिकारियों के निर्देश मानें।',
  sheet_live: 'लाइव · स्वतः अपडेट',
  zone_here: 'अभी:',
  sheet_reports: 'इस क्षेत्र की हालिया रिपोर्टें',
  sheet_do: 'क्या करें',
  sheet_dont: 'क्या न करें',

  nearest_h: 'नज़दीकी सुरक्षित आश्रय',
  nearest_none: '5 किमी के भीतर कोई सुरक्षित आश्रय, अस्पताल या पुलिस स्टेशन नहीं मिला।',
  dirs: 'रास्ता देखें',
  nearest: '<b>{n}</b> · {d} · <a class="rowlink" href="https://www.google.com/maps/dir/?api=1&destination={la},{ln}" target="_blank">रास्ता देखें</a>',

  rep_title: 'ख़तरा रिपोर्ट करें · केवल चेन्नई',
  choose_area: 'लाल पिन सही जगह पर आए, इसके लिए मानचित्र खिसकाएँ, फिर चुनें कि आपको क्या दिख रहा है।',
  type_label: 'आपको क्या दिख रहा है?',
  note_ph: 'वैकल्पिक नोट (जैसे “पुल पर घुटने तक पानी”)',
  send: 'लाइव रिपोर्ट भेजें',
  t_flood: 'बाढ़ का पानी', t_storm: 'तूफ़ान की क्षति', t_blocked: 'सड़क बंद',
  t_unsafe: 'सामान्य असुरक्षित क्षेत्र', t_livewire: 'गिरी बिजली की लाइन', t_other: 'अन्य ख़तरा',

  locating: 'सटीक GPS स्थान प्राप्त हो रहा है…',
  locate_lowacc: 'GPS संकेत कमज़ोर (±{a} मी)। खुली जगह पर जाकर फिर कोशिश करें।',
  you_here: 'आप यहाँ हैं',
  you_here_acc: 'आप यहाँ · ±{a} मी सटीकता',
  locate_none: 'आपकी जगह नहीं मिली। लोकेशन अनुमति दें या मानचित्र पर खोजें।',
  locate_out: 'आप चेन्नई के बाहर लगते हैं। यह सेवा केवल चेन्नई के लिए है।',

  saved: 'रिपोर्ट लाइव मानचित्र पर भेजी गई',
  out_of_chennai: 'रिपोर्टें केवल चेन्नई नगर सीमा के भीतर स्वीकार्य हैं।',
  toast_emergency: 'आपातकालीन क्षेत्र घोषित — मानचित्र और निर्देश देखें',
  toast_zones_on: 'सुरक्षित आश्रय दिखाए जा रहे हैं',
  toast_zones_off: 'सुरक्षित आश्रय छिपाए गए',

  emg_title: 'आपातकालीन क्षेत्र',
  emg_where: '<b>{area}</b> के आसपास — पिछले 3 घंटों में {n} रिपोर्टें।',
  emg_call: 'नज़दीकी सुरक्षित आश्रय तक पहुँचें; बाढ़ के पानी और गिरे तारों से बचें। <b>112</b> (राष्ट्रीय) या <b>108</b> (एम्बुलेंस) पर कॉल करें।',
  emg_ok: 'समझ गया',
  emg_view: 'मानचित्र पर क्षेत्र देखें',

  sim_title: 'डेमो',
  sim_btn: 'लाइव पर्यटक रिपोर्ट सिम्युलेट करें',
  sim_note: 'जाने-माने बाढ़ क्षेत्रों में रैंडम रिपोर्टें जोड़ता है। आपातकालीन सीमा तक {n} रिपोर्टें बाकी।',
  d_now: 'अभी', d_min: '{m} मिन पहले', d_hr: '{h} घं पहले'
}
};

if (typeof EXTRA_LANGS !== 'undefined') {
  Object.keys(EXTRA_LANGS).forEach(function (code) {
    LANGS[code] = EXTRA_LANGS[code].strings;
  });
}


var lang = (navigator.language || 'en').slice(0, 2);
if (!LANGS[lang]) lang = 'en';
var savedLang = null;
try { savedLang = localStorage.getItem('chennaiAlert_lang'); } catch (e) {  }
if (savedLang && LANGS[savedLang]) lang = savedLang;

function T(key) {
  return LANGS[lang] && LANGS[lang][key] !== undefined
    ? LANGS[lang][key]
    : LANGS.en[key];
}

function fmt(key, vars) {
  return T(key).replace(/\{(\w+)\}/g, function (_, k) {
    return (vars && vars[k] !== undefined) ? vars[k] : '';
  });
}

function setLang(newLang) {
  if (!LANGS[newLang]) return;
  lang = newLang;
  try { localStorage.setItem('chennaiAlert_lang', lang); } catch (e) {  }
}
