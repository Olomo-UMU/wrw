/* Interactive visuals for the career progression deck.
   Every placeholder <div data-viz="name"></div> is filled by VIZ[name](el). */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var C = {
    ink: '#1b2230', soft: '#4a5466', muted: '#6b7485', line: '#d8dde6', faint: '#eef1f5',
    tvet: '#1f5fbf', tvet2: '#cfe0f7', uni: '#1d7a4c', uni2: '#cfeadb',
    money: '#a8660f', money2: '#f6e4c4', warn: '#b42318', warn2: '#f8d9d6'
  };
  /* Trade data. jobs follow the ladder: level 2, level 3, level 4, higher diploma, bachelor's, master's and PhD. */
  var TRADES = {
    auto: { name: 'Automotive', col: '#2f6fd6', now: 'Motor vehicle mechanic', place: 'garage', lesson: 'wheel alignment', loan: true,
      jobs: ['Assistant mechanic', 'Mechanic', 'Automotive technician', 'Senior technician, workshop supervisor', 'Mechanical or automotive engineer', 'Specialist engineer, lecturer'],
      route: { dip: 'Technician diploma in automotive technology', dipWhere: 'accredited technical colleges', deg: "Bachelor's in mechanical engineering", degWhere: 'Uganda Martyrs University (Fort Portal), or automotive engineering at other universities', degY: [3, 4] } },
    build: { name: 'Building', col: '#b5651d', now: 'Mason and builder', place: 'building site', lesson: 'setting out a foundation', loan: true,
      jobs: ['Builder’s assistant', 'Mason, builder', 'Site technician', 'Senior site technician, clerk of works', 'Civil engineer, site manager', 'Specialist engineer, lecturer'],
      route: { dip: 'Diploma in building construction or civil engineering', dipWhere: 'technical colleges, or Uganda Martyrs University (Fort Portal)', deg: 'BSc Civil Engineering', degWhere: 'Uganda Martyrs University (Fort Portal) and other universities', degY: [3, 4] } },
    fit: { name: 'Fitting and machining', col: '#55687d', now: 'Fitter and machinist', place: 'workshop', lesson: 'cutting a thread on the lathe', loan: true,
      jobs: ['Machine operator', 'Fitter, machinist', 'Maintenance technician', 'Senior technician, workshop supervisor', 'Mechanical or production engineer', 'Specialist engineer, lecturer'],
      route: { dip: 'Diploma in mechanical and manufacturing engineering', dipWhere: 'technical colleges, or Uganda Martyrs University (Fort Portal)', deg: 'BSc Mechanical and Manufacturing Engineering', degWhere: 'Uganda Martyrs University (Fort Portal) and other universities', degY: [3, 4] } },
    hair: { name: 'Hairdressing', col: '#b83280', now: 'Hairdresser and stylist', place: 'salon', lesson: 'safe relaxer application', loan: false,
      jobs: ['Salon assistant', 'Hairdresser', 'Senior stylist', 'Salon supervisor, trainer', 'Salon owner or manager, beauty educator', 'Lecturer, researcher'],
      route: { dip: 'Diploma in cosmetology', dipWhere: 'accredited colleges', deg: "Bachelor's in cosmetology, or in business to run a salon", degWhere: 'Other universities; business administration at Uganda Martyrs University', degY: [3, 3] } },
    fash: { name: 'Fashion and design', col: '#6b46c1', now: 'Tailor and designer', place: 'tailoring shop', lesson: 'drafting a bodice block', loan: false,
      jobs: ['Sewing assistant', 'Tailor', 'Pattern cutter, designer', 'Senior designer, production supervisor', 'Fashion designer, production manager', 'Lecturer, researcher'],
      route: { dip: 'Diploma in fashion or garment design', dipWhere: 'accredited colleges', deg: 'BA Fashion and Textile Design', degWhere: 'Uganda Martyrs University and other universities', degY: [3, 3] } },
    elec: { name: 'Electrical installation', col: '#c53030', now: 'Electrician and wireman', place: 'wiring firm', lesson: 'wiring a two-way switch', loan: true,
      jobs: ['Electrician’s assistant', 'Wireman, electrician', 'Electrical technician', 'Senior technician, electrical supervisor', 'Electrical engineer', 'Specialist engineer, lecturer'],
      route: { dip: 'Diploma in Electrical Engineering', dipWhere: 'technical colleges, or Uganda Martyrs University (Fort Portal)', deg: 'BSc Electrical Engineering', degWhere: 'Uganda Martyrs University (Fort Portal) and other universities', degY: [3, 4] } },
    carp: { name: 'Carpentry and joinery', col: '#667a1e', now: 'Carpenter and joiner', place: 'joinery workshop', lesson: 'cutting a mortise and tenon joint', loan: true,
      jobs: ['Carpenter’s assistant', 'Carpenter, joiner', 'Workshop technician, foreman', 'Senior technician, site supervisor', 'Civil engineer or architect, site manager', 'Specialist, lecturer'],
      route: { dip: 'Diploma in building construction or civil engineering', dipWhere: 'technical colleges, or Uganda Martyrs University (Fort Portal)', deg: 'BSc Civil Engineering, or Bachelor of Environmental Design', degWhere: 'Uganda Martyrs University (Fort Portal or Nkozi) and other universities', degY: [3, 4] } },
    plumb: { name: 'Plumbing', col: '#0e7490', now: 'Plumber and pipe fitter', place: 'plumbing firm', lesson: 'joining PPR pipes', loan: true,
      jobs: ['Plumber’s assistant', 'Plumber', 'Plumbing or water technician', 'Senior technician, works supervisor', 'Civil or water engineer', 'Specialist engineer, lecturer'],
      route: { dip: 'Diploma in Water Engineering', dipWhere: 'technical colleges and universities, including Uganda Martyrs University (Fort Portal)', deg: 'BSc Civil Engineering', degWhere: 'Uganda Martyrs University (Fort Portal) and other universities', degY: [3, 4] } }
  };
  var ORDER = ['auto', 'build', 'carp', 'elec', 'plumb', 'fit', 'hair', 'fash'];
  /* where each graduate starts: two certificates and two apprenticeship levels */
  var STARTS = {
    jun: { label: 'Junior Certificate', now: 'Now: Junior Certificate' },
    nat: { label: 'National Certificate', now: 'Now: National Certificate' },
    app: { label: 'Apprenticeship', now: 'Now: Apprenticeship', appr: true },
    wsa: { label: 'Workshop Apprenticeship', now: 'Now: Workshop Apprenticeship', appr: true }
  };
  var START_ORDER = ['jun', 'nat', 'app', 'wsa'];
  function startItems() { return START_ORDER.map(function (k) { return { k: k, label: STARTS[k].label }; }); }
  var state = { trade: 'auto', start: 'nat' };
  (function () {
    var q = /[?&]trade=(\w+)/.exec(location.search), t = q && q[1];
    if (!t) { try { t = localStorage.getItem('career-trade'); } catch (e) { t = null; } }
    if (t && TRADES[t]) state.trade = t;
    var st = null;
    try { st = localStorage.getItem('career-start'); } catch (e) { st = null; }
    if (st && STARTS[st]) state.start = st;
  })();
  var listeners = [];
  function setTrade(t) {
    if (!TRADES[t]) return;
    state.trade = t;
    try { localStorage.setItem('career-trade', t); } catch (e) { }
    listeners.forEach(function (f) { f(); });
  }
  function setStart(k) {
    if (!STARTS[k]) return;
    state.start = k;
    try { localStorage.setItem('career-start', k); } catch (e) { }
    listeners.forEach(function (f) { f(); });
  }

  /* ---------- helpers ---------- */
  function S(tag, a, p) {
    var e = document.createElementNS(NS, tag);
    if (a) for (var k in a) e.setAttribute(k, a[k]);
    if (p) p.appendChild(e);
    return e;
  }
  function H(tag, cls, html, p) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (p) p.appendChild(e);
    return e;
  }
  function svg(w, h, p) {
    var s = S('svg', { width: w, height: h, viewBox: '0 0 ' + w + ' ' + h, role: 'img' }, p);
    return s;
  }
  function wrap(text, n) {
    var words = String(text).split(' '), lines = [], line = '';
    words.forEach(function (w) {
      if ((line + ' ' + w).trim().length > n && line) { lines.push(line); line = w; }
      else line = (line + ' ' + w).trim();
    });
    if (line) lines.push(line);
    return lines;
  }
  function T(p, x, y, text, a, n, lh) {
    a = a || {};
    var t = S('text', Object.assign({ x: x, y: y, 'font-size': 16, fill: C.ink }, a), p);
    var lines = n ? wrap(text, n) : String(text).split('\n');
    lh = lh || (parseFloat(a['font-size'] || 16) * 1.22);
    lines.forEach(function (ln, i) {
      var ts = S('tspan', { x: x, dy: i === 0 ? 0 : lh }, t);
      ts.textContent = ln;
    });
    return t;
  }
  function money(n) { return 'Shs ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTHS_L = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function src(p, text) { return H('p', 'src', text, p); }
  function pickRow(p, label, items, onPick, current) {
    var row = H('div', 'ctl', label ? '<span class="lab">' + label + '</span>' : '', p);
    var btns = [];
    items.forEach(function (it) {
      var b = H('button', 'pick' + (it.k === current ? ' on' : ''), '', row);
      if (it.icon) { var s = svg(26, 26, b); s.setAttribute('viewBox', '0 0 100 100'); icon(s, it.icon, 0, 0, 1, it.k === current ? '#fff' : TRADES[it.icon].col); b._ic = it.icon; }
      H('span', null, it.label, b);
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('on'); recolor(x, false); });
        b.classList.add('on'); recolor(b, true);
        onPick(it.k);
      });
      btns.push(b);
    });
    function recolor(b, on) {
      if (!b._ic) return;
      var s = b.querySelector('svg');
      while (s.firstChild) s.removeChild(s.firstChild);
      icon(s, b._ic, 0, 0, 1, on ? '#fff' : TRADES[b._ic].col);
    }
    row._set = function (k) {
      btns.forEach(function (x, i) { var on = items[i].k === k; x.classList.toggle('on', on); recolor(x, on); });
    };
    return row;
  }

  /* ---------- trade icons, drawn in a 100 x 100 box ---------- */
  function icon(p, kind, x, y, s, col) {
    var g = S('g', { transform: 'translate(' + x + ',' + y + ') scale(' + s + ')' }, p);
    var dark = col === '#fff' ? '#fff' : C.ink;
    if (kind === 'auto') {
      S('path', { d: 'M8 66 L16 46 Q21 36 33 36 L63 36 Q72 36 78 44 L86 52 Q94 55 94 63 L94 70 L8 70 Z', fill: col }, g);
      S('path', { d: 'M25 50 L32 41 L47 41 L47 50 Z M52 41 L63 41 Q68 41 72 46 L75 50 L52 50 Z', fill: col === '#fff' ? C.ink : '#fff', opacity: 0.9 }, g);
      [28, 75].forEach(function (cx) {
        S('circle', { cx: cx, cy: 71, r: 10, fill: dark }, g);
        S('circle', { cx: cx, cy: 71, r: 4, fill: col === '#fff' ? C.ink : '#fff' }, g);
      });
    } else if (kind === 'build') {
      var rows = [[0, 4], [11, 3], [0, 4]];
      rows.forEach(function (r, i) {
        for (var j = 0; j < r[1]; j++) {
          S('rect', { x: 8 + r[0] + j * 22, y: 44 + i * 14, width: 20, height: 12, rx: 1.5, fill: col }, g);
        }
      });
      S('path', { d: 'M58 8 L88 20 L70 36 Z', fill: dark }, g);
      S('path', { d: 'M58 8 L48 0', stroke: dark, 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    } else if (kind === 'fit') {
      gear(g, 40, 56, 30, 23, 10, col);
      S('circle', { cx: 40, cy: 56, r: 9, fill: col === '#fff' ? C.ink : '#fff' }, g);
      gear(g, 76, 24, 17, 12, 8, dark);
      S('circle', { cx: 76, cy: 24, r: 5, fill: col === '#fff' ? C.ink : '#fff' }, g);
    } else if (kind === 'hair') {
      S('rect', { x: 52, y: 18, width: 40, height: 11, rx: 3, fill: col }, g);
      for (var k = 0; k < 9; k++) S('rect', { x: 54 + k * 4.2, y: 28, width: 2.4, height: 16, fill: col }, g);
      S('path', { d: 'M30 70 L74 30 M46 76 L66 36', stroke: dark, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
      S('circle', { cx: 25, cy: 76, r: 9, fill: 'none', stroke: col, 'stroke-width': 5 }, g);
      S('circle', { cx: 44, cy: 86, r: 9, fill: 'none', stroke: col, 'stroke-width': 5 }, g);
    } else if (kind === 'fash') {
      S('path', { d: 'M50 6 a6 6 0 1 1 6 6 M56 12 L50 18 L22 32 L78 32 L50 18', fill: 'none', stroke: dark, 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
      S('path', { d: 'M38 30 L62 30 L58 48 L78 92 L22 92 L42 48 Z', fill: col }, g);
      S('path', { d: 'M42 48 L58 48', stroke: col === '#fff' ? C.ink : '#fff', 'stroke-width': 3 }, g);
    } else if (kind === 'elec') {
      /* lightning bolt over a plug */
      S('path', { d: 'M56 4 L22 52 L44 52 L34 90 L78 36 L55 36 L68 4 Z', fill: col }, g);
      S('rect', { x: 66, y: 64, width: 26, height: 22, rx: 4, fill: dark }, g);
      S('path', { d: 'M72 64 L72 54 M86 64 L86 54 M79 86 L79 96', stroke: dark, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    } else if (kind === 'carp') {
      /* hand saw over a plank */
      S('rect', { x: 6, y: 74, width: 88, height: 16, rx: 2, fill: col, opacity: 0.55 }, g);
      var sd = 'M34 34 L94 44 L94 52';
      for (var tt = 0; tt < 10; tt++) {
        sd += ' L' + (91 - 6 * tt) + ' ' + (52 + 0.3 * (6 * tt + 3) + 5).toFixed(1) + ' L' + (88 - 6 * tt) + ' ' + (52 + 0.3 * 6 * (tt + 1)).toFixed(1);
      }
      S('path', { d: sd + ' Z', fill: col }, g);
      S('path', { d: 'M6 30 Q6 22 14 22 L34 28 L34 70 L14 70 Q6 70 6 62 Z', fill: dark }, g);
      S('rect', { x: 14, y: 38, width: 12, height: 20, rx: 6, fill: col === '#fff' ? C.ink : '#fff' }, g);
    } else if (kind === 'plumb') {
      /* pipe elbow with a tap and a drop */
      S('path', { d: 'M6 28 L52 28 Q70 28 70 46 L70 66', fill: 'none', stroke: col, 'stroke-width': 16, 'stroke-linejoin': 'round' }, g);
      S('rect', { x: 24, y: 16, width: 8, height: 24, rx: 2, fill: dark }, g);
      S('rect', { x: 58, y: 58, width: 24, height: 8, rx: 2, fill: dark }, g);
      S('path', { d: 'M38 8 L58 8 M48 8 L48 18', stroke: dark, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
      S('path', { d: 'M70 74 Q60 88 70 96 Q80 88 70 74 Z', fill: col }, g);
    }
    return g;
  }
  function gear(p, cx, cy, ro, ri, n, col) {
    var d = '';
    for (var i = 0; i < n * 2; i++) {
      var a0 = (i / (n * 2)) * Math.PI * 2, a1 = ((i + 1) / (n * 2)) * Math.PI * 2;
      var r = i % 2 === 0 ? ro : ri;
      d += (i === 0 ? 'M' : 'L') + (cx + r * Math.cos(a0)).toFixed(1) + ' ' + (cy + r * Math.sin(a0)).toFixed(1) +
        ' L' + (cx + r * Math.cos(a1)).toFixed(1) + ' ' + (cy + r * Math.sin(a1)).toFixed(1) + ' ';
    }
    S('path', { d: d + 'Z', fill: col }, p);
  }
  function person(p, x, y, col, s) {
    s = s || 1;
    var g = S('g', { transform: 'translate(' + x + ',' + y + ') scale(' + s + ')' }, p);
    S('circle', { cx: 0, cy: -46, r: 9, fill: col }, g);
    S('path', { d: 'M-11 -2 L-9 -30 Q0 -36 9 -30 L11 -2 Z', fill: col }, g);
    S('path', { d: 'M-6 -2 L-7 0 M6 -2 L7 0', stroke: col, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    return g;
  }

  var VIZ = {};
  var TRADE_AWARE = ['framework', 'route', 'skip', 'teach', 'fees', 'zigzag', 'plans', 'loans', 'savings', 'lifelong', 'ways', 'training', 'card', 'takehome'];

  /* compact trade switcher: five icon buttons, used at the top right of trade-aware slides */
  function tradeSwitch() {
    var box = H('div', 'tswitch');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Choose a trade');
    var lab = H('span', 'tname', '', box);
    var brow = H('div', 'tbtns', null, box);
    var btns = {};
    ORDER.forEach(function (k) {
      var b = H('button', 'tbtn', '', brow);
      b.title = TRADES[k].name;
      b.setAttribute('aria-label', TRADES[k].name);
      b.addEventListener('click', function (e) { e.stopPropagation(); setTrade(k); });
      btns[k] = b;
    });
    function upd() {
      lab.textContent = TRADES[state.trade].name;
      lab.style.color = TRADES[state.trade].col;
      ORDER.forEach(function (k) {
        var b = btns[k], on = k === state.trade;
        b.classList.toggle('on', on);
        b.style.background = on ? TRADES[k].col : '#fff';
        b.style.borderColor = on ? TRADES[k].col : 'var(--line)';
        b.innerHTML = '';
        var s = svg(26, 26, b); s.setAttribute('viewBox', '0 0 100 100');
        icon(s, k, 0, 0, 1, on ? '#fff' : TRADES[k].col);
      });
    }
    listeners.push(upd); upd();
    return box;
  }

  /* ---------- title hero: a staircase with the five trades at the bottom ---------- */
  VIZ.hero = function (root) {
    var s = svg(560, 560, root);
    var steps = ['Certificate', 'Diploma', 'Higher diploma', "Bachelor's degree", "Master's", 'PhD'];
    var fills = ['#3d78cf', '#2f69bf', '#1f5fbf', '#174a96', '#1d7a4c', '#145c39'];
    steps.forEach(function (t, i) {
      var x = 20 + i * 88, h = 60 + i * 62, y = 470 - h;
      var g = S('g', { class: 'pop d' + Math.min(7, i + 1) }, s);
      S('rect', { x: x, y: y, width: 86, height: h, fill: fills[i], rx: 3 }, g);
      T(g, x + 8, y + 22, t, { 'font-size': 14, fill: '#fff', 'font-weight': 500 }, 11, 16);
    });
    S('rect', { x: 20, y: 470, width: 526, height: 4, fill: C.ink }, s);
    var marks = {}, HS = 526 / ORDER.length;
    ORDER.forEach(function (k, i) {
      var g = S('g', { class: 'hit' }, s);
      S('rect', { x: 20 + i * HS, y: 478, width: HS - 4, height: 80, fill: 'transparent' }, g);
      icon(g, k, 22 + i * HS + (HS - 56) / 2, 486, 0.52, TRADES[k].col);
      marks[k] = S('rect', { x: 22 + i * HS + (HS - 44) / 2, y: 546, width: 40, height: 5, rx: 2.5, fill: TRADES[k].col, opacity: 0 }, g);
      g.addEventListener('click', function () { setTrade(k); });
    });
    var capW = S('g', { class: 'pop d7' }, s);
    var cap = S('g', { transform: 'translate(503,70)' }, capW);
    S('path', { d: 'M-34 0 L0 -16 L34 0 L0 16 Z', fill: C.ink }, cap);
    S('path', { d: 'M-20 8 L-20 24 Q0 34 20 24 L20 8 L0 16 Z', fill: C.ink }, cap);
    S('path', { d: 'M26 4 L26 26', stroke: C.money, 'stroke-width': 3 }, cap);
    function upd() { ORDER.forEach(function (k) { marks[k].setAttribute('opacity', k === state.trade ? 1 : 0); }); }
    listeners.push(upd); upd();
  };

  /* ---------- 1. two starting points ---------- */
  VIZ.start = function (root) {
    var s = svg(1160, 420, root);
    var defs = S('defs', {}, s);
    var pat = S('pattern', { id: 'doing', width: 14, height: 14, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    S('rect', { width: 14, height: 14, fill: C.money2 }, pat);
    S('rect', { width: 5, height: 14, fill: '#ecd3a6' }, pat);
    var lanes = [
      { k: 'jun', from: 'P7', years: 3, note: 'Three years after Primary 7. Counts as equal to O-level (UCE).' },
      { k: 'nat', from: 'S4', years: 2, note: 'Two years after Senior 4 (UCE).' },
      { k: 'app', from: null, doing: 'Learning by doing, beside skilled workers', note: 'Practical skills that UVTAB can assess and certify.' },
      { k: 'wsa', from: null, doing: 'Learning by doing real jobs in a workshop', note: 'Practical skills that UVTAB can assess and certify.' }
    ];
    var DY = 184, XB = 610, BW = 280, bands = {};
    lanes.forEach(function (L, li) {
      var y = 52 + li * 98;
      var g = S('g', { class: 'hit' }, s);
      var band = S('rect', { x: 0, y: y - 46, width: 920, height: 92, rx: 12, fill: 'transparent', 'stroke-width': 3 }, g);
      bands[L.k] = band;
      S('circle', { cx: 50, cy: y - 6, r: 34, fill: C.faint, stroke: C.ink, 'stroke-width': 2 }, g);
      if (L.from) T(g, 50, y + 3, L.from, { 'font-size': 25, 'font-weight': 700, 'text-anchor': 'middle' });
      else {
        S('rect', { x: 32, y: y - 14, width: 36, height: 24, rx: 3, fill: C.money }, g);
        S('path', { d: 'M42 ' + (y - 14) + ' L42 ' + (y - 20) + ' L58 ' + (y - 20) + ' L58 ' + (y - 14), stroke: C.money, 'stroke-width': 4, fill: 'none' }, g);
        S('rect', { x: 32, y: y - 5, width: 36, height: 3, fill: '#fff' }, g);
      }
      if (L.years) {
        for (var i = 0; i < L.years; i++) {
          var x = 100 + i * 164;
          var b = S('g', { class: 'pop d' + Math.min(7, li * 2 + i + 1) }, g);
          S('rect', { x: x, y: y - 26, width: 156, height: 40, rx: 6, fill: C.tvet2 }, b);
          T(b, x + 78, y + 1, 'Year ' + (i + 1), { 'font-size': 19, 'text-anchor': 'middle', fill: C.tvet, 'font-weight': 500 });
        }
      } else {
        var bb = S('g', { class: 'pop d' + Math.min(7, li * 2 + 1) }, g);
        S('rect', { x: 100, y: y - 26, width: 484, height: 40, rx: 6, fill: 'url(#doing)' }, bb);
        T(bb, 342, y + 1, L.doing, { 'font-size': 18, 'text-anchor': 'middle', fill: C.money, 'font-weight': 700 });
      }
      var bx = L.years ? 100 + L.years * 164 + 4 : XB;
      var bg = S('g', { class: 'pop d' + Math.min(7, li * 2 + 2) }, g);
      S('rect', { x: bx, y: y - 32, width: BW, height: 52, rx: 26, fill: L.from ? C.tvet : C.money }, bg);
      T(bg, bx + BW / 2, y + 1, STARTS[L.k].label, { 'font-size': 19, 'text-anchor': 'middle', fill: '#fff', 'font-weight': 700 });
      T(g, 100, y + 38, L.note, { 'font-size': 15, fill: C.soft });
      var ex = bx + BW, d = 'M' + ex + ' ' + (y - 6) + ' C ' + (ex + 60) + ' ' + (y - 6) + ' ' + (960 - 60) + ' ' + DY + ' 960 ' + DY;
      S('path', { d: d, fill: 'none', stroke: C.ink, 'stroke-width': 3, 'stroke-dasharray': '8 7' }, s);
      g.addEventListener('click', function () { setStart(L.k); });
    });
    var door = S('g', { class: 'pop d7' }, s);
    S('rect', { x: 960, y: DY - 130, width: 150, height: 260, rx: 6, fill: '#fff', stroke: C.uni, 'stroke-width': 4 }, door);
    S('rect', { x: 975, y: DY - 115, width: 120, height: 230, rx: 4, fill: C.uni2 }, door);
    S('circle', { cx: 1078, cy: DY + 6, r: 7, fill: C.uni }, door);
    T(door, 1035, DY - 30, 'Your next\nstep', { 'font-size': 22, 'text-anchor': 'middle', fill: C.uni, 'font-weight': 700 });
    function upd() { START_ORDER.forEach(function (k) { bands[k].setAttribute('stroke', k === state.start ? C.ink : 'none'); bands[k].setAttribute('fill', k === state.start ? '#f6f8fb' : 'transparent'); }); }
    listeners.push(upd); upd();
  };

  /* ---------- 1b. five trades on one step ---------- */
  VIZ.trades = function (root) {
    var s = svg(1160, 420, root);
    var groups = {};
    ORDER.forEach(function (k, i) {
      var cx = 145 + (i % 4) * 290, y0 = Math.floor(i / 4) * 212;
      var g = S('g', { class: 'hit pop d' + Math.min(7, i + 1) }, s);
      S('rect', { x: cx - 140, y: y0 + 2, width: 280, height: 204, fill: 'transparent' }, g);
      var sel = S('rect', { x: cx - 136, y: y0 + 4, width: 272, height: 200, rx: 10, fill: 'none', stroke: TRADES[k].col, 'stroke-width': 4, opacity: 0 }, g);
      icon(g, k, cx - 50, y0 + 18, 1, TRADES[k].col);
      T(g, cx, y0 + 152, TRADES[k].name, { 'font-size': 22, 'font-weight': 700, 'text-anchor': 'middle' });
      T(g, cx, y0 + 180, TRADES[k].now, { 'font-size': 18, fill: C.soft, 'text-anchor': 'middle' });
      g.addEventListener('click', function () { setTrade(k); });
      groups[k] = sel;
    });
    function upd() { ORDER.forEach(function (k) { groups[k].setAttribute('opacity', k === state.trade ? 1 : 0); }); }
    listeners.push(upd); upd();
  };

  /* ---------- 2b. who does what ---------- */
  VIZ.actors = function (root) {
    var s = svg(1160, 490, root);
    var you = { x: 580, y: 245 };
    var nodes = [
      { x: 172, y: 70, t: 'TVET Council', l: ['Licenses colleges and trainers', 'Approves the curricula'], v: 'trains you in a licensed college', col: C.tvet },
      { x: 988, y: 70, t: 'UVTAB', l: ['Assesses your skills', 'Issues your certificate or diploma'], v: 'certifies what you can do', col: C.tvet },
      { x: 172, y: 420, t: 'Universities', l: ['Uganda Martyrs and others', 'Admit diploma holders to degrees'], v: 'admits you to a degree', col: C.uni },
      { x: 988, y: 420, t: 'Student loans', l: ['Ministry of Education and Sports', 'Loans for first-year students'], v: 'lends you fees', col: C.money }
    ];
    nodes.forEach(function (n, i) {
      var g = S('g', { class: 'pop d' + (i + 1) }, s);
      S('line', { x1: you.x, y1: you.y, x2: n.x, y2: n.y, stroke: n.col, 'stroke-width': 3 }, g);
      var mx = (you.x + n.x) / 2, my = (you.y + n.y) / 2 + 5;
      var lbl = S('g', {}, g);
      var tw = n.v.length * 8.6 + 20;
      S('rect', { x: mx - tw / 2, y: my - 20, width: tw, height: 30, rx: 15, fill: '#fff', stroke: n.col, 'stroke-width': 1.5 }, lbl);
      T(lbl, mx, my, n.v, { 'font-size': 16, 'text-anchor': 'middle', fill: n.col, 'font-weight': 500 });
      S('rect', { x: n.x - 162, y: n.y - 62, width: 324, height: 124, rx: 10, fill: '#fff', stroke: n.col, 'stroke-width': 2.5 }, g);
      T(g, n.x, n.y - 22, n.t, { 'font-size': 26, 'font-weight': 700, 'text-anchor': 'middle', fill: n.col });
      T(g, n.x, n.y + 10, n.l[0], { 'font-size': 18, 'text-anchor': 'middle', fill: C.soft });
      T(g, n.x, n.y + 34, n.l[1], { 'font-size': 18, 'text-anchor': 'middle', fill: C.soft });
    });
    S('circle', { cx: you.x, cy: you.y, r: 62, fill: C.ink }, s);
    T(s, you.x, you.y + 11, 'You', { 'font-size': 32, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' });
    src(root, 'Sources: Technical and Vocational Education and Training Act (2025); Nafula (2026a); Ministry of Education and Sports (2026).');
  };

  /* ---------- 3. route finder ---------- */
  function yrs(y) {
    if (y == null) return '';
    if (typeof y === 'number') return y + (y === 1 ? ' year' : ' years');
    return y[0] === y[1] ? y[0] + ' years' : y[0] + ' to ' + y[1] + ' years';
  }
  VIZ.route = function (root) {
    var goal = 'deg';
    var r2 = H('div', 'row', null, root);
    r2.style.gap = '24px';
    var startRow = pickRow(r2, 'I completed', startItems(), function (k) { setStart(k); }, state.start);
    pickRow(r2, 'Goal', [{ k: 'deg', label: 'A degree' }, { k: 'teach', label: 'Teach my trade' }], function (k) { goal = k; draw(); }, goal);
    var holder = H('div', null, null, root);
    var sum = H('div', 'kpis', null, root);
    src(root, 'Programmes: Uganda Martyrs University (2026a, 2026b) and UVTAB diploma list (PML Daily, 2026). The craft level for Junior Certificate holders is shown as about two years, like today’s National Certificate. Apprentices: skills gained by doing can be assessed and certified by UVTAB, and assessed skills to level 3 open a diploma (Kyobe, 2026; Nafula, 2026b).');
    function draw() {
      startRow._set(state.start);
      var tr = TRADES[state.trade], R = tr.route, col = tr.col;
      var nodes = [];
      if (state.start === 'jun') {
        nodes.push({ t: 'Now: Junior Certificate', job: tr.jobs[0] });
        nodes.push({ t: 'National Craftsperson Certificate', w: 'Vocational training institutes', y: [2, 2], about: true, job: tr.jobs[1] });
      } else if (STARTS[state.start].appr) {
        nodes.push({ t: STARTS[state.start].now, job: tr.jobs[0] });
        nodes.push({ t: 'Skills assessed and certified to level 3', w: 'UVTAB, through an accredited assessment centre', pill: 'Mar, Jun, Sep or Dec', job: tr.jobs[1] });
      } else nodes.push({ t: 'Now: National Certificate', job: tr.jobs[1] });
      nodes.push({ t: R.dip, w: R.dipWhere, y: [2, 2], job: tr.jobs[2] });
      if (goal === 'deg') {
        nodes.push({ t: R.deg, w: R.degWhere, y: R.degY, job: tr.jobs[4], uni: true });
        nodes.push({ t: "Later: master's, then PhD", w: 'Universities in Uganda and abroad', job: tr.jobs[5], faint: true });
      } else {
        nodes.push({ t: 'Instructor or technical teacher training', w: 'TVET instructor colleges and some universities', y: [1, 2], job: 'TVET instructor (licensed by the TVET Council)', uni: true });
        nodes.push({ t: 'Degree in technical or vocational education', w: 'Other universities, often while you teach', y: [3, 3], job: 'Senior instructor', faint: true });
      }
      holder.innerHTML = '';
      var s = svg(1160, 400, holder);
      var n = nodes.length, x0 = 100, x1 = 1060, step = (x1 - x0) / (n - 1), CY = 140;
      var d = 'M' + x0 + ' ' + CY;
      for (var i = 1; i < n; i++) {
        var xa = x0 + (i - 1) * step, xb = x0 + i * step;
        d += ' C ' + (xa + step / 2) + ' ' + (CY + (i % 2 ? -36 : 36)) + ' ' + (xb - step / 2) + ' ' + (CY + (i % 2 ? 36 : -36)) + ' ' + xb + ' ' + CY;
      }
      S('path', { d: d, fill: 'none', stroke: C.line, 'stroke-width': 18, 'stroke-linecap': 'round' }, s);
      var line = S('path', { d: d, fill: 'none', stroke: col, 'stroke-width': 5, 'stroke-linecap': 'round', class: 'draw', style: '--len:1400' }, s);
      requestAnimationFrame(function () { line.style.strokeDashoffset = '1400'; requestAnimationFrame(function () { line.style.strokeDashoffset = ''; }); });
      var lo = 0, hi = 0;
      nodes.forEach(function (nd, i) {
        var x = x0 + i * step;
        if (!nd.faint && nd.y) { lo += nd.y[0]; hi += nd.y[1]; }
        var g = S('g', { opacity: nd.faint ? 0.5 : 1 }, S('g', { class: 'pop d' + (i + 1) }, s));
        S('circle', { cx: x, cy: CY, r: 30, fill: nd.uni ? C.uni : (i === 0 ? C.ink : col) }, g);
        if (i === 0) T(g, x, CY + 7, 'Now', { 'font-size': 17, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' });
        else T(g, x, CY + 9, String(i), { 'font-size': 26, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' });
        var lines = wrap(nd.t, 22);
        T(g, x, CY - 50 - (lines.length - 1) * 20, nd.t, { 'font-size': 17, 'text-anchor': 'middle', 'font-weight': 700 }, 22, 20);
        var yy = CY + 50;
        if (nd.y) {
          S('rect', { x: x - 66, y: yy, width: 132, height: 28, rx: 14, fill: nd.uni ? C.uni2 : C.tvet2 }, g);
          T(g, x, yy + 19, (nd.about ? 'about ' : '') + yrs(nd.y), { 'font-size': 16, 'text-anchor': 'middle', fill: nd.uni ? C.uni : C.tvet, 'font-weight': 700 });
          yy += 52;
        } else if (nd.pill) {
          S('rect', { x: x - 84, y: yy, width: 168, height: 28, rx: 14, fill: C.money2 }, g);
          T(g, x, yy + 19, nd.pill, { 'font-size': 15, 'text-anchor': 'middle', fill: C.money, 'font-weight': 700 });
          yy += 52;
        } else yy += 22;
        var jl = wrap(nd.job, 22).length;
        T(g, x, yy, nd.job, { 'font-size': 16, 'text-anchor': 'middle', fill: C.ink }, 22, 19);
        if (nd.w) T(g, x, yy + jl * 19 + 6, nd.w, { 'font-size': 14, 'text-anchor': 'middle', fill: C.muted }, 26, 17);
      });
      var label = (goal === 'deg' ? 'years from today to a degree' : 'years from today to teach your trade') + (STARTS[state.start].appr ? ', after your assessment' : '');
      sum.innerHTML = '<div class="kpi"><div class="bignum" style="color:' + col + '">' + (lo === hi ? lo : lo + ' to ' + hi) + ' <small>' + label + '</small></div></div>' +
        '<div class="kpi"><div class="l" style="max-width:520px;font-size:17px">Studying full time, with no gaps. Universities that let diploma holders skip year one cut this. Working between steps adds years but also experience, savings and stronger applications.</div></div>';
    }
    listeners.push(draw);
    draw();
  };

  /* ---------- 3b. years saved by entering a degree with a diploma ---------- */
  VIZ.skip = function (root) {
    var progs = [
      { t: 'Civil and building engineering', tr: 'build', trs: ['build', 'carp', 'plumb'], y: [4, 3, 2] },
      { t: 'Electrical engineering', tr: 'elec', trs: ['elec'], y: [4, 3, 2] },
      { t: 'Mechanical and manufacturing engineering', tr: 'fit', trs: ['fit'], y: [4, 3, 2] },
      { t: 'Automotive and power engineering', tr: 'auto', trs: ['auto'], y: [4, 3, null] },
      { t: 'Fashion and cosmetology', tr: 'hair', trs: ['hair'], y: [3, 2, null] },
      { t: 'Textile and apparel design', tr: 'fash', trs: ['fash'], y: [3, 2, null] }
    ];
    var entry = 1;
    pickRow(root, 'With my diploma I am admitted into', [{ k: 0, label: 'Year one' }, { k: 1, label: 'Year two' }, { k: 2, label: 'Year three' }], function (k) { entry = k; draw(); }, entry);
    var s = svg(1160, 436, root);
    var rows = [];
    progs.forEach(function (p, i) {
      var y = 6 + i * 70;
      var g = S('g', { style: 'transition:opacity .4s' }, s);
      var band = S('rect', { x: -4, y: y, width: 1168, height: 58, rx: 8, fill: 'none', 'stroke-width': 3 }, g);
      var ic = S('g', {}, g);
      T(g, 60, y + 25, p.t, { 'font-size': 18, 'font-weight': 500 }, 26, 21);
      var cells = [];
      for (var k = 0; k < p.y[0]; k++) {
        var r = S('rect', { x: 400 + k * 150, y: y + 7, width: 144, height: 44, rx: 6, fill: C.uni, style: 'transition:fill .5s' }, g);
        var tx = T(g, 472 + k * 150, y + 36, 'Year ' + (k + 1), { 'font-size': 17, 'text-anchor': 'middle', fill: '#fff', 'font-weight': 500 });
        cells.push({ r: r, t: tx });
      }
      var out = T(g, 1020, y + 32, '', { 'font-size': 20, 'font-weight': 700 });
      var note = T(g, 1020, y + 50, '', { 'font-size': 13, fill: C.muted });
      rows.push({ p: p, g: g, band: band, cells: cells, out: out, note: note, ic: ic, y: y });
    });
    src(root, 'Example durations from one public university’s 2026/27 diploma entry advert (Kyambogo University, 2026). Uganda Martyrs University’s 2026 brochure does not state year-two entry, so ask its admissions office. Your trade’s nearest programme is outlined.');
    function draw() {
      rows.forEach(function (R) {
        var mine = R.p.trs.indexOf(state.trade) >= 0;
        var it = mine ? state.trade : R.p.tr;
        while (R.ic.firstChild) R.ic.removeChild(R.ic.firstChild);
        icon(R.ic, it, 8, R.y + 9, 0.4, TRADES[it].col);
        R.g.setAttribute('opacity', mine ? 1 : 0.42);
        R.band.setAttribute('stroke', mine ? TRADES[it].col : 'none');
        var e = entry;
        while (e > 0 && R.p.y[e] == null) e--;
        var skipped = R.p.y[0] - R.p.y[e];
        R.cells.forEach(function (c, k) {
          var sk = k < skipped;
          c.r.setAttribute('fill', sk ? C.faint : C.uni);
          c.t.setAttribute('fill', sk ? C.muted : '#fff');
          c.t.textContent = sk ? 'Skipped' : 'Year ' + (k + 1);
        });
        R.out.textContent = R.p.y[e] + ' years';
        R.note.textContent = e !== entry ? 'no year ' + (entry + 1) + ' entry' : '';
        R.out.setAttribute('fill', skipped ? C.uni : C.ink);
      });
    }
    listeners.push(draw);
    draw();
  };

  /* ---------- 3c. teach your trade ---------- */
  VIZ.teach = function (root) {
    var s = svg(1160, 420, root);
    var g = S('g', { class: 'pop d1' }, s);
    S('rect', { x: 10, y: 20, width: 300, height: 180, rx: 6, fill: C.ink }, g);
    var board = S('g', {}, g);
    person(g, 345, 300, C.uni, 1.9);
    person(g, 60, 330, C.muted, 1.3); person(g, 140, 330, C.muted, 1.3); person(g, 220, 330, C.muted, 1.3);
    T(g, 345, 352, 'You, teaching', { 'font-size': 17, 'text-anchor': 'middle', fill: C.uni, 'font-weight': 700 });
    function drawBoard() {
      while (board.firstChild) board.removeChild(board.firstChild);
      T(board, 32, 58, 'Today:', { 'font-size': 17, fill: '#9aa3b2' });
      T(board, 32, 84, TRADES[state.trade].lesson, { 'font-size': 20, fill: '#fff' }, 18, 24);
      icon(board, state.trade, 214, 104, 0.82, '#fff');
      S('path', { d: 'M32 150 L170 150 M32 176 L150 176', stroke: '#fff', 'stroke-width': 3, opacity: 0.45 }, board);
    }
    var steps = [
      { t: 'Your diploma', d: 'about 2 years', c: C.tvet },
      { t: 'Instructor or technical teacher training', d: '1 to 2 years', c: C.uni },
      { t: 'Degree in technical or vocational education', d: 'about 3 years', c: '#145c39' }
    ];
    steps.forEach(function (st, i) {
      var x = 440 + i * 245, gg = S('g', { class: 'pop d' + (i + 2) }, s);
      S('rect', { x: x, y: 30, width: 222, height: 200, rx: 10, fill: '#fff', stroke: st.c, 'stroke-width': 3 }, gg);
      T(gg, x + 16, 66, st.t, { 'font-size': 20, 'font-weight': 700, fill: st.c }, 19, 24);
      S('rect', { x: x + 16, y: 178, width: 190, height: 34, rx: 17, fill: i ? C.uni2 : C.tvet2 }, gg);
      T(gg, x + 111, 201, st.d, { 'font-size': 15, fill: i ? C.uni : C.tvet, 'text-anchor': 'middle', 'font-weight': 500 });
      if (i < 2) S('path', { d: 'M' + (x + 224) + ' 130 L' + (x + 242) + ' 130 M' + (x + 234) + ' 122 L' + (x + 243) + ' 130 L' + (x + 234) + ' 138', stroke: C.ink, 'stroke-width': 3, fill: 'none' }, gg);
    });
    var sum = S('g', { class: 'pop d5' }, s);
    T(sum, 440, 290, 'With a National Certificate: about 3 to 4 years to teach your trade.', { 'font-size': 22, 'font-weight': 700 });
    T(sum, 440, 326, 'Trainers must now register with the TVET Council and hold a licence.', { 'font-size': 19, fill: C.soft });
    T(sum, 440, 356, 'The Council wants trainers with real practical expertise, like yours.', { 'font-size': 19, fill: C.soft });
    src(root, 'Trainer licensing: Technical and Vocational Education and Training Act (2025); Nafula (2026a). Course lengths vary by institution, so check with the college.');
    listeners.push(drawBoard); drawBoard();
  };

  /* ---------- 4. three doors into a diploma ---------- */
  VIZ.doors = function (root) {
    var doors = [
      { t: 'National Craftsperson Certificate', s: 'craft certificate, or its equivalent', d: 'The main door. Bring certified copies of your certificate and transcript.' },
      { t: 'Assessed skills', s: 'prior learning or credit transfer, to level 3', d: 'For apprentices and people who learnt on the job. Your skills are assessed and counted up to competence level 3.' },
      { t: 'A-level (UACE)', s: '1 principal pass and 2 subsidiary passes', d: 'For those who went the school route. Core subjects or a related project.' }
    ];
    var s = svg(1160, 380, root);
    var info = H('p', 'big', 'Tap a door.', root);
    var rects = [];
    doors.forEach(function (dd, i) {
      var x = 30 + i * 230, g = S('g', { class: 'hit pop d' + (i + 1) }, s);
      var fr = S('rect', { x: x, y: 30, width: 190, height: 250, rx: 6, fill: '#fff', stroke: C.tvet, 'stroke-width': 4 }, g);
      S('rect', { x: x + 14, y: 44, width: 162, height: 222, rx: 4, fill: C.tvet2 }, g);
      S('circle', { cx: x + 160, cy: 160, r: 7, fill: C.tvet }, g);
      T(g, x + 95, 110, String(i + 1), { 'font-size': 56, 'font-weight': 700, 'text-anchor': 'middle', fill: C.tvet });
      T(g, x + 95, 312, dd.t, { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle' }, 22, 20);
      T(g, x + 95, 334 + (wrap(dd.t, 22).length - 1) * 20, dd.s, { 'font-size': 14, 'text-anchor': 'middle', fill: C.soft }, 28, 17);
      g.addEventListener('click', function () {
        rects.forEach(function (r) { r.setAttribute('stroke-width', 4); });
        fr.setAttribute('stroke-width', 8);
        info.innerHTML = '<b>Door ' + (i + 1) + ':</b> ' + dd.d;
      });
      rects.push(fr);
      S('path', { d: 'M' + (x + 95) + ' 28 L' + (x + 95) + ' 12', fill: 'none', stroke: C.soft, 'stroke-width': 3 }, s);
    });
    S('path', { d: 'M125 12 L840 12 L840 112 M830 100 L840 114 L850 100', fill: 'none', stroke: C.soft, 'stroke-width': 3, 'stroke-linejoin': 'round' }, s);
    var gate = S('g', { class: 'pop d5' }, s);
    S('rect', { x: 740, y: 120, width: 200, height: 130, rx: 10, fill: C.money2, stroke: C.money, 'stroke-width': 3 }, gate);
    T(gate, 840, 168, 'Interview or\npractical test', { 'font-size': 21, 'font-weight': 700, 'text-anchor': 'middle', fill: C.money });
    T(gate, 840, 228, 'everyone, from 2026/27', { 'font-size': 15, 'text-anchor': 'middle', fill: C.money });
    S('path', { d: 'M942 185 L1000 185 M990 175 L1002 185 L990 195', stroke: C.ink, 'stroke-width': 3, fill: 'none', class: 'pop d6' }, s);
    var fl = S('g', { class: 'pop d7' }, s);
    S('circle', { cx: 1070, cy: 185, r: 62, fill: C.uni }, fl);
    T(fl, 1070, 180, 'Admitted', { 'font-size': 20, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' });
    T(fl, 1070, 204, 'to a diploma', { 'font-size': 15, fill: '#fff', 'text-anchor': 'middle' });
  };

  /* ---------- 4b. dates strip for diploma admissions ---------- */
  VIZ.dipdates = function (root) {
    var s = svg(1160, 150, root);
    var ev = [
      { d: '21 Sep', t: 'Forms in, with Shs 40,000 fee' },
      { d: '22 to 24 Sep', t: 'Interviews and practical tests' },
      { d: '28 Sep', t: 'Admission lists out' },
      { d: '7 Oct', t: 'Report to college' }
    ];
    S('line', { x1: 40, y1: 50, x2: 1120, y2: 50, stroke: C.ink, 'stroke-width': 3 }, s);
    ev.forEach(function (e, i) {
      var x = 150 + i * 300, g = S('g', { class: 'pop d' + (i + 1) }, s);
      S('circle', { cx: x, cy: 50, r: 12, fill: i === 3 ? C.uni : C.tvet }, g);
      T(g, x, 26, e.d, { 'font-size': 20, 'font-weight': 700, 'text-anchor': 'middle' });
      T(g, x, 92, e.t, { 'font-size': 17, 'text-anchor': 'middle', fill: C.soft }, 26, 20);
    });
  };

  /* ---------- 4d. your grade ---------- */
  VIZ.grade = function (root) {
    var msg;
    var top = H('div', null, null, root);
    var row = H('div', 'row', null, root);
    var left = H('div', 'grow', null, row);
    pickRow(top, 'My result', [{ k: 'f', label: 'First class' }, { k: 'su', label: 'Second upper' }, { k: 'sl', label: 'Second lower' }, { k: 'p', label: 'Pass' }], function (k) {
      if (k === 'p') msg.innerHTML = '<span style="color:var(--warn)"><b>Not yet enough</b></span> for a diploma at Uganda Martyrs University, which asks certificate holders for at least a credit or second class in a related field. Other universities use similar rules. Options: re-sit modules through UVTAB, get your skills assessed at the next level, or apply later through mature age entry where a university offers it.';
      else msg.innerHTML = '<span style="color:var(--uni)"><b>Meets the class rule.</b></span> At Uganda Martyrs University, certificate holders with a credit or second class in a related field can apply for a diploma. Diploma holders with a credit or second class are invited to apply for a bachelor’s degree. The higher your class, the stronger your application anywhere.';
    }, null);
    msg = H('p', 'big', 'Pick your class to see what it opens.', left);
    var s = svg(560, 300, row);
    var data = [{ t: 'First class', v: 9, c: C.uni }, { t: 'Second class upper', v: 30, c: C.uni }, { t: 'Second class lower', v: 26, c: C.uni }, { t: 'All other results', v: 35, c: C.muted }];
    T(s, 0, 20, 'National Certificate results, 2024 (20,052 candidates)', { 'font-size': 16, 'font-weight': 500 });
    data.forEach(function (d, i) {
      var y = 46 + i * 58;
      T(s, 0, y + 26, d.t, { 'font-size': 16, fill: C.soft });
      S('rect', { x: 170, y: y + 6, width: d.v * 9, height: 32, rx: 4, fill: d.c, class: 'pop d' + (i + 1) }, s);
      T(s, 178 + d.v * 9, y + 29, d.v + '%', { 'font-size': 18, 'font-weight': 700 });
    });
    T(s, 0, 290, 'About 2 in 3 candidates reached second class or better.', { 'font-size': 15, fill: C.uni });
    src(root, 'Class rules: Uganda Martyrs University (2026a, 2026b). Results: UVTAB release reported by Nile Post (2025).');
  };

  /* ---------- 5. work and learn zigzag ---------- */
  VIZ.zigzag = function (root) {
    var s = svg(1160, 400, root);
    var dyn = S('g', {}, s);
    function draw() {
      while (dyn.firstChild) dyn.removeChild(dyn.firstChild);
      var tr = TRADES[state.trade];
      T(dyn, 0, 106, 'Working', { 'font-size': 18, 'font-weight': 700, fill: C.money });
      T(dyn, 0, 236, 'Assessed', { 'font-size': 18, 'font-weight': 700, fill: C.tvet });
      var UP = 100, DN = 230;
      var pts = [
        { x: 170, y: UP, t: 'Work in a ' + tr.place + ' as a ' + tr.jobs[1].split(',')[0].toLowerCase(), up: true },
        { x: 330, y: DN, t: 'Register at a TVET provider a month ahead' },
        { x: 545, y: DN, t: 'UVTAB assessment: March, June, September or December' },
        { x: 695, y: UP, t: 'Certificate: module, Worker’s PAS or level 1 to 4', up: true },
        { x: 870, y: UP, t: 'Next job: ' + tr.jobs[2].split(',')[0].toLowerCase(), up: true },
        { x: 1050, y: DN, t: 'Next level, or a diploma' }
      ];
      var d = 'M' + pts[0].x + ' ' + pts[0].y;
      pts.slice(1).forEach(function (p) { d += ' L' + p.x + ' ' + p.y; });
      S('path', { d: d, fill: 'none', stroke: C.ink, 'stroke-width': 4, 'stroke-linejoin': 'round' }, dyn);
      pts.forEach(function (p, i) {
        var g = S('g', {}, dyn);
        S('circle', { cx: p.x, cy: p.y, r: 16, fill: p.up ? C.money : C.tvet }, g);
        var nl = wrap(p.t, 21).length;
        T(g, p.x, p.up ? p.y - 30 - (nl - 1) * 19 : p.y + 42, p.t, { 'font-size': 16, 'text-anchor': 'middle' }, 21, 19);
      });
      icon(dyn, state.trade, 30, 20, 0.5, tr.col);
    }
    var fees = ['One module: Shs 70,000', 'Worker’s PAS, 2 modules: Shs 150,000', 'Full occupation level 3: Shs 150,000', 'Level 4: Shs 220,000'];
    T(s, 0, 344, 'UVTAB assessment fees, 2026', { 'font-size': 15, fill: C.muted, 'font-weight': 500 });
    fees.forEach(function (f, i) {
      var x = i * 290, g = S('g', { class: 'pop d' + (i + 3) }, s);
      S('rect', { x: x, y: 356, width: 276, height: 34, rx: 17, fill: C.faint }, g);
      T(g, x + 138, 379, f, { 'font-size': 15, 'text-anchor': 'middle', fill: C.soft });
    });
    listeners.push(draw); draw();
  };

  /* ---------- 5b. three plans to a diploma ---------- */
  VIZ.plans = function (root) {
    var plans = [
      { t: 'A. Straight on', seg: [['study', 0, 2], ['work', 2, 8]], dip: 2 },
      { t: 'B. Work 2 years, then study', seg: [['work', 0, 2], ['study', 2, 4], ['work', 4, 8]], dip: 4 },
      { t: 'C. Work and study part time', seg: [['both', 0, 3], ['work', 3, 8]], dip: 3 }
    ];
    var s = svg(1160, 320, root);
    var X0 = 300, PX = 105;
    for (var y = 0; y <= 8; y++) {
      S('line', { x1: X0 + y * PX, y1: 20, x2: X0 + y * PX, y2: 268, stroke: C.faint, 'stroke-width': 2 }, s);
      if (y < 8) T(s, X0 + y * PX + PX / 2, 290, String(2027 + y), { 'font-size': 15, 'text-anchor': 'middle', fill: C.muted });
    }
    var fills = { study: C.tvet, work: C.money2, both: 'url(#hatch)' };
    var defs = S('defs', {}, s);
    var pat = S('pattern', { id: 'hatch', width: 12, height: 12, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    S('rect', { width: 12, height: 12, fill: C.money2 }, pat);
    S('rect', { width: 6, height: 12, fill: C.tvet }, pat);
    var labels = [];
    plans.forEach(function (p, i) {
      var y = 30 + i * 80;
      T(s, 0, y + 30, p.t, { 'font-size': 19, 'font-weight': 700 });
      p.seg.forEach(function (sg) {
        S('rect', { x: X0 + sg[1] * PX + 1, y: y + 8, width: (sg[2] - sg[1]) * PX - 2, height: 36, rx: 4, fill: fills[sg[0]] }, s);
      });
      var star = S('g', {}, s);
      S('circle', { cx: X0 + p.dip * PX, cy: y + 26, r: 14, fill: C.uni, stroke: '#fff', 'stroke-width': 3 }, star);
      T(star, X0 + p.dip * PX, y + 32, 'D', { 'font-size': 15, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' });
      labels.push(T(s, 0, y + 54, '', { 'font-size': 15, fill: C.soft }));
    });
    var cursor = S('line', { x1: X0, y1: 16, x2: X0, y2: 272, stroke: C.ink, 'stroke-width': 3, opacity: 0 }, s);
    var ctl = H('div', 'ctl', null, root);
    var btn = H('button', 'play', 'Play the years', ctl);
    H('span', 'note', '<span class="tag" style="background:var(--tvet);color:#fff">Study</span><span class="tag" style="background:var(--money2)">Work</span><span class="tag" style="background:var(--uni);color:#fff">D = diploma done</span>', ctl);
    var notes = H('div', null, null, root);
    function drawNotes() {
      var tr = TRADES[state.trade], dip = tr.route.dip.toLowerCase();
      notes.innerHTML =
        '<p class="note"><b>A. Straight on:</b> ' + dip + ' done by the end of 2028. No work experience yet, no savings.</p>' +
        '<p class="note"><b>B. Work 2 years, then study:</b> diploma by the end of 2030, after 2 years in a ' + tr.place + ' and savings toward fees.</p>' +
        '<p class="note"><b>C. Work and study part time:</b> diploma by the end of 2029 in this example. Income all the way, but long days.</p>';
    }
    listeners.push(drawNotes); drawNotes();
    src(root, 'An example for planning only. Full-time technician diplomas run about 2 years; part-time length depends on the college.');
    var timer = null;
    btn.addEventListener('click', function () {
      clearInterval(timer);
      var t = 0;
      cursor.setAttribute('opacity', 1);
      timer = setInterval(function () {
        t += 0.05;
        if (t > 8) { clearInterval(timer); t = 8; }
        var x = X0 + t * PX;
        cursor.setAttribute('x1', x); cursor.setAttribute('x2', x);
        plans.forEach(function (p, i) {
          var st = '';
          p.seg.forEach(function (sg) { if (t >= sg[1] && t < sg[2]) st = sg[0]; });
          var exp = 0;
          p.seg.forEach(function (sg) { if (sg[0] !== 'study') exp += Math.max(0, Math.min(t, sg[2]) - sg[1]); });
          labels[i].textContent = (t >= p.dip ? 'Diploma done. ' : (st === 'work' ? 'Working. ' : st === 'study' ? 'Studying. ' : 'Working and studying. ')) + 'Work experience: ' + exp.toFixed(1) + ' yrs';
        });
      }, 40);
    });
  };

  /* ---------- 6. loan applications sorted ---------- */
  VIZ.loans = function (root) {
    var row = H('div', 'row', null, root);
    var left = H('div', null, null, row);
    var s = svg(720, 276, left);
    var dots = [];
    for (var i = 0; i < 192; i++) {
      var c = i % 24, r = Math.floor(i / 24);
      dots.push(S('circle', { cx: 16 + c * 29, cy: 16 + r * 29, r: 11, fill: C.line, style: 'transition:fill .4s ease' }, s));
    }
    T(s, 0, 262, 'Each dot is 10 applications. 2023/24 total: 1,921.', { 'font-size': 16, fill: C.soft });
    var ctl = H('div', 'ctl', null, left);
    var btn = H('button', 'play', 'Sort the applications', ctl);
    H('span', 'note', '<span class="tag" style="background:var(--warn);color:#fff">Not eligible: 640</span><span class="tag" style="background:var(--uni);color:#fff">Loan awarded: 1,196</span><span class="tag" style="background:var(--money);color:#fff">Eligible, no loan: 85</span>', ctl);
    var right = H('div', 'grow', null, row);
    right.innerHTML =
      '<div class="kpi"><div class="bignum" style="color:var(--warn)">640 <small>rejected</small></div><p class="l" style="max-width:none">failed the eligibility rules before anyone read further</p></div>' +
      '<div class="kpi" style="margin-top:12px"><div class="bignum" style="color:var(--uni)">1,196 <small>got loans</small></div><p class="l" style="max-width:none">total Shs 5.2 billion for tuition and functional fees</p></div>';
    var rules = H('div', 'rules', null, root);
    rules.innerHTML = '<span class="lab">2026/27 rules</span>' +
      ['First year only', 'Diploma or degree, not a certificate', 'Aged 35 or under', 'Up to Shs 7.6 million a year', 'Apply online, Shs 53,000 fee'].map(function (t) { return '<span class="rule">' + t + '</span>'; }).join('');
    var tnote = H('p', 'big', '', root);
    src(root, '2023/24 figures: Nangonzi (2024). 2026/27 rules and priority areas: Ministry of Education and Sports (2026).');
    function upd() {
      var tr = TRADES[state.trade];
      tnote.innerHTML = tr.loan
        ? '<b style="color:' + tr.col + '">' + tr.name + ':</b> engineering is one of the 14 priority areas, so a related diploma or degree can qualify.'
        : '<b style="color:' + tr.col + '">' + tr.name + ':</b> not among the 14 priority areas. Plan for savings, a bursary or a sponsor. Students with a disability may apply for any accredited programme.';
    }
    listeners.push(upd); upd();
    btn.addEventListener('click', function () {
      dots.forEach(function (d) { d.setAttribute('fill', C.line); });
      var i = 0;
      var tm = setInterval(function () {
        for (var n = 0; n < 6 && i < 192; n++, i++) dots[i].setAttribute('fill', i < 64 ? C.warn : i < 184 ? C.uni : C.money);
        if (i >= 192) clearInterval(tm);
      }, 30);
    });
  };

  /* ---------- 6b. savings planner ---------- */
  VIZ.savings = function (root) {
    var presets = [
      { k: 'ed', label: 'Engineering diploma', v: 1160000, tr: ['build', 'fit', 'auto', 'elec', 'carp', 'plumb'] },
      { k: 'fd', label: 'Fashion and textile degree', v: 2040000, tr: ['fash'] },
      { k: 'bd', label: 'Business diploma, evening', v: 858000, tr: ['hair'] },
      { k: 'eg', label: 'Engineering degree', v: 2978000, tr: [] },
      { k: 'own', label: 'My own figure', v: null, tr: [] }
    ];
    var pr = pickRow(root, 'One year of Uganda Martyrs tuition', presets.map(function (p) { return { k: p.k, label: p.label }; }), function (k) { choose(k, true); }, null);
    var ctl = H('div', 'ctl', null, root);
    ctl.innerHTML = '<span class="lab">My target (Shs)</span>';
    var target = H('input', null, null, ctl);
    target.type = 'number'; target.value = 1160000; target.step = 10000; target.min = 100000; target.style.width = '150px';
    H('span', 'lab', '&nbsp; I can save each month', ctl);
    var rng = H('input', null, null, ctl);
    rng.type = 'range'; rng.min = 10000; rng.max = 500000; rng.step = 10000; rng.value = 100000; rng.style.width = '220px';
    var rv = H('b', null, '', ctl);
    var out = H('p', 'big', '', root);
    var s = svg(1160, 120, root);
    src(root, 'Tuition for two semesters at Uganda Martyrs University, 2026/27 (Uganda Martyrs University, 2026a). Food, rent and any other charges are extra. Put in the real figure from your admission letter.');
    function choose(k, manual) {
      var p = presets.filter(function (x) { return x.k === k; })[0];
      pr._set(k);
      if (p.v) target.value = p.v;
      else if (!manual) target.value = 2000000;
      draw();
    }
    function byTrade() {
      var p = presets.filter(function (x) { return x.tr.indexOf(state.trade) >= 0; })[0] || presets[4];
      choose(p.k, false);
    }
    function draw() {
      var tg = Math.max(100000, parseFloat(target.value) || 0), m = parseFloat(rng.value);
      rv.textContent = money(m);
      var months = Math.ceil(tg / m);
      var end = new Date(2027, months - 1, 1);
      out.innerHTML = 'Starting January 2027, you reach <b>' + money(tg) + '</b> in <b style="color:var(--uni)">' + months + ' months</b>: by ' + MONTHS_L[end.getMonth()] + ' ' + end.getFullYear() + '.';
      while (s.firstChild) s.removeChild(s.firstChild);
      var shown = Math.min(months, 60), w = 1160 / Math.max(shown, 12);
      for (var i = 0; i < shown; i++) {
        var yr = Math.floor(i / 12);
        S('rect', { x: i * w + 1, y: 20, width: w - 3, height: 50, rx: 3, fill: yr % 2 ? '#2a8f5c' : C.uni }, s);
        if (i % 12 === 0) T(s, i * w + 2, 96, String(2027 + yr), { 'font-size': 15, fill: C.muted });
      }
      if (months > 60) T(s, 1150, 96, 'more than 5 years: save more or aim for a cheaper first step', { 'font-size': 15, fill: C.warn, 'text-anchor': 'end' });
    }
    target.addEventListener('input', function () { pr._set('own'); draw(); });
    rng.addEventListener('input', draw);
    listeners.push(byTrade); byTrade();
  };

  /* ---------- 7. a real climb: Eng. Dr Morris Odoch ---------- */
  var CLIMB = [
    { b: 'Primary', q: 'Primary Leaving Examination', w: 'Pawor Primary School, West Nile', n: 'He was among the top three in the Primary Leaving Examination.', c: '#3d78cf' },
    { b: 'Junior Technical Certificate', q: 'Uganda Junior Technical Certificate', w: 'Inde Technical School, Arua (now Madi-Okollo)', n: 'The village technical school. The same first award many of you hold.', c: '#3d78cf' },
    { b: 'Craft Part I', q: 'Craft Part I certificate', w: 'Moyo Technical Institute', n: '', c: '#1f5fbf' },
    { b: 'Craft Part II', q: 'Craft Part II certificate', w: 'St Joseph Technical Institute, Kisubi', n: '', c: '#1f5fbf' },
    { b: 'Diploma and degree', q: 'Diploma, and Bachelor of Civil and Building Engineering', w: 'Kyambogo University', n: 'Both awards are in civil and building engineering.', c: '#1d7a4c' },
    { b: 'Postgraduate diploma', q: 'Postgraduate Diploma in Project Planning and Management', w: 'Uganda Management Institute', n: '', c: '#1d7a4c' },
    { b: "Master's, Japan", q: "Master's in Infrastructure Planning and Management", w: 'Yokohama National University, Japan', n: 'Named Best Research Student of the Year. Also trained in comprehensive bridge engineering in Japan.', c: '#187046' },
    { b: "Two more master's, UK", q: "Master of Business Administration, and a master's in International Construction Law", w: 'University of Wales; Liverpool John Moores University', n: '', c: '#187046' },
    { b: 'Doctorate', q: 'Doctorate in International Construction Management', w: 'European Institute for Advanced Studies in Management (EIASM)', n: 'He paid for it himself, with support from a few friends.', c: '#145c39' },
    { b: 'Bridges engineer', q: 'Bridges and structures engineer, Uganda National Roads Authority', w: 'Resident engineer on the new Nile bridge at Jinja and the Kampala Flyover; led the Isimba bridge on the Kamuli to Kayunga road', n: 'UNRA Overall Best Employee, 2018.', c: C.money }
  ];
  VIZ.odoch = function (root) {
    var s = svg(1160, 380, root);
    var defs = S('defs', {}, s);
    var cp = S('clipPath', { id: 'odochClip' }, defs);
    S('circle', { cx: 0, cy: 0, r: 40 }, cp);
    var BW = 112, GAP = 4.5, BOT = 376;
    var cols = [];
    CLIMB.forEach(function (st, i) {
      var x = i * (BW + GAP), h = 42 + i * 25, y = BOT - h;
      var g = S('g', { class: 'hit' }, s);
      var r = S('rect', { x: x, y: y, width: BW, height: h, rx: 3, fill: st.c, 'stroke-width': 4 }, g);
      T(g, x + 9, y + 22, st.b, { 'font-size': 15, fill: '#fff', 'font-weight': 500 }, 13, 18);
      g.addEventListener('click', function () { clearInterval(tm); go(i); });
      cols.push({ r: r, cx: x + BW / 2, top: y });
    });
    /* the climber: his photo in a ring with a pointer down to the step */
    var who = S('g', { style: 'transition:transform .7s ease' }, s);
    S('path', { d: 'M-10 40 L0 54 L10 40 Z', fill: C.ink }, who);
    S('circle', { cx: 0, cy: 0, r: 45, fill: C.ink }, who);
    var img = S('image', { x: -40, y: -40, width: 80, height: 80, 'clip-path': 'url(#odochClip)', preserveAspectRatio: 'xMidYMid slice' }, who);
    img.setAttribute('href', 'assets/img/odoch.jpg');
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'assets/img/odoch.jpg');
    var row = H('div', 'climbrow', null, root);
    var ctl = H('div', 'climbctl', null, row);
    var btn = H('button', 'play', 'Climb', ctl);
    H('p', 'note', 'Tap any step to see the award and where he earned it.', ctl);
    var card = H('div', 'card climb', null, row);
    src(root, 'Story and photo of Eng. Dr Morris Odoch: The Observer (Nangonzi, 2025).');
    var cur = 0, tm = null;
    function go(i) {
      cur = i;
      var c = cols[i], st = CLIMB[i];
      who.setAttribute('transform', 'translate(' + c.cx + ',' + (c.top - 60) + ')');
      cols.forEach(function (k, j) { k.r.setAttribute('stroke', j === i ? C.ink : 'none'); });
      card.style.borderColor = st.c;
      card.innerHTML = '<p class="note" style="margin:0">Step ' + (i + 1) + ' of ' + CLIMB.length + '</p>' +
        '<h4>' + st.q + '</h4><p class="role" style="color:' + st.c + '">' + st.w + '</p>' + (st.n ? '<p>' + st.n + '</p>' : '');
    }
    function climb() {
      clearInterval(tm);
      go(0);
      tm = setInterval(function () {
        if (cur >= CLIMB.length - 1) { clearInterval(tm); return; }
        go(cur + 1);
      }, 1100);
    }
    go(0);
    btn.addEventListener('click', climb);
    document.addEventListener('slideenter', function (e) { if (e.target.contains(root)) setTimeout(climb, 500); });
    root._finish = function () { clearInterval(tm); go(CLIMB.length - 1); };
  };

  /* ---------- 8. a year on the calendar ---------- */
  VIZ.calendar = function (root) {
    var months = [];
    for (var i = 0; i < 12; i++) months.push((10 + i) % 12);
    var s = svg(1160, 380, root);
    var X0 = 220, MW = 78;
    months.forEach(function (m, i) {
      S('rect', { x: X0 + i * MW, y: 10, width: MW - 2, height: 30, fill: i === 0 ? C.ink : C.faint }, s);
      T(s, X0 + i * MW + MW / 2, 31, MONTHS[m], { 'font-size': 15, 'text-anchor': 'middle', fill: i === 0 ? '#fff' : C.soft, 'font-weight': 500 });
      S('line', { x1: X0 + i * MW, y1: 40, x2: X0 + i * MW, y2: 352, stroke: C.faint }, s);
    });
    T(s, X0 + 39, 372, 'Today', { 'font-size': 14, 'text-anchor': 'middle', fill: C.ink, 'font-weight': 700 });
    function mi(m) { return (m - 10 + 12) % 12; }
    var lanes = [
      { t: 'Public university diploma-holder entry', col: C.uni, bands: [[1, 2.2]], d: 'Public universities run an entry scheme for diploma holders early in the year. In 2026 one deadline was Friday 6 March.' },
      { t: 'Student loans', col: C.money, bands: [[4.8, 6.55]], d: 'In 2026 the online window ran from 25 May to 17 July, with a Shs 53,000 processing fee. Apply once admitted, for your first year.' },
      { t: 'Uganda Martyrs August intake', col: '#187046', bands: [[7, 8]], d: 'Uganda Martyrs University admits for an August intake. Apply online beforehand; the undergraduate application fee is Shs 30,000.' },
      { t: 'UVTAB skills assessment', col: C.tvet, dots: [11, 2, 5, 8], d: 'Assessments of informally acquired skills run in March, June, September and December. Register through a TVET provider at least a month before.' },
      { t: 'Technician diploma admissions', col: '#174a96', bands: [[8.6, 9.25]], d: 'In 2026: forms in by 21 September, interviews and practical tests 22 to 24 September, report by 7 October.' }
    ];
    var info = H('p', 'big', 'Tap a coloured bar.', root);
    lanes.forEach(function (L, i) {
      var y = 60 + i * 60;
      T(s, 0, y + 16, L.t, { 'font-size': 16, 'font-weight': 500 }, 24, 18);
      var g = S('g', { class: 'hit' }, s);
      S('rect', { x: X0, y: y, width: 12 * MW, height: 40, fill: 'transparent' }, g);
      (L.bands || []).forEach(function (b) {
        S('rect', { x: X0 + mi(b[0]) * MW, y: y + 4, width: (b[1] - b[0]) * MW, height: 32, rx: 6, fill: L.col }, g);
      });
      (L.dots || []).forEach(function (m) {
        S('rect', { x: X0 + mi(m - 1) * MW + 6, y: y + 12, width: MW - 12, height: 16, rx: 8, fill: C.tvet2 }, g);
        S('circle', { cx: X0 + mi(m) * MW + MW / 2, cy: y + 20, r: 14, fill: L.col }, g);
      });
      g.addEventListener('click', function () { info.innerHTML = '<b style="color:' + L.col + '">' + L.t + ':</b> ' + L.d; });
    });
    src(root, 'Dates from the 2026 rounds (Kyambogo University, 2026; Ministry of Education and Sports, 2026; Uganda Martyrs University, 2026b; Plus News, 2026; Nafula, 2026b). Dates change each year, so watch for the new adverts.');
  };

  /* ---------- 8b. my next-step card ---------- */
  VIZ.card = function (root) {
    var row = H('div', 'row', null, root);
    var left = H('div', 'grow', null, row);
    var ctl = H('div', 'ctl', '<span class="lab">I start my next step in</span>', left);
    var selY = H('select', null, '<option>2027</option><option>2028</option><option>2029</option>', ctl);
    var plan = H('p', 'plan', '', left);
    var right = H('div', 'grow', null, row);
    var ul = H('ul', 'check', null, right);
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem('career-card') || '{}'); } catch (e) { saved = {}; }
    function items() {
      var tr = TRADES[state.trade];
      return [
        'Get certified copies of my certificate and transcript',
        'Keep a logbook with photos of jobs I do in the ' + tr.place,
        'Check that my chosen college is accredited by the TVET Council',
        'Save something every month toward fees',
        state.trade === 'elec' ? 'Apply to ERA for my electrical installation permit (Class D to start)' : 'Ask the TVET Council about the artisan practising permit the new law requires',
        'Join my trade association or SACCO, and one workshop or fair this year',
        'Watch for the diploma and degree admission adverts',
        tr.loan ? 'Apply for a student loan in my first year (engineering is a priority area)' : 'Find a bursary or sponsor (my field is not a loan priority area)'
      ];
    }
    function upd() {
      var tr = TRADES[state.trade], R = tr.route;
      plan.style.borderColor = tr.col;
      var job = tr.jobs[1].split(',')[0].toLowerCase();
      plan.innerHTML = STARTS[state.start].appr
        ? 'First, I will get my ' + STARTS[state.start].label.toLowerCase() + ' skills assessed and certified by <b>UVTAB</b>. In <b>' + selY.value + '</b> I will start a <b>' + R.dip.toLowerCase() + '</b> at ' + R.dipWhere + '. Meanwhile I will work as a <b>' + job + '</b> and keep proof of every job.'
        : 'In <b>' + selY.value + '</b> I will start a <b>' + R.dip.toLowerCase() + '</b> at ' + R.dipWhere + '. While I wait, I will work as a <b>' + job + '</b> and keep proof of every job.';
      ul.innerHTML = '';
      items().forEach(function (t, i) {
        var li = H('li', saved[i] ? 'done' : '', '<span class="box"></span><span class="t">' + t + '</span>', ul);
        li.addEventListener('click', function () {
          li.classList.toggle('done');
          saved[i] = li.classList.contains('done');
          try { localStorage.setItem('career-card', JSON.stringify(saved)); } catch (e) { }
        });
      });
    }
    selY.addEventListener('change', upd);
    src(root, 'Permits: electricians need an installation permit from the Electricity Regulatory Authority (Electricity (Installation Permits) Regulations, 2003); other artisans need registration and a practising permit under the TVET Act 2025 (Mayanja, n.d.).');
    listeners.push(upd);
    upd();
  };

  /* ---------- 2. the qualifications framework, as set by the TVET Act 2025 ---------- */
  var FW_TVET = [
    { k: 'mod', t: 'Module or Worker’s PAS', tag: 'Part certificate', st: ['In use now'], who: 'UVTAB', where: 'Any TVET provider. Skills learnt at work or in an apprenticeship count.', entry: 'No entry rule. You are assessed on one or more modules of your trade, or on the full occupation.', more: 'A first step for apprentices and people who learnt on the job. In the older vocational framework (UVQF), full certificates ran from level 1 to level 3 and the national diploma sat at level 4.', job: 0 },
    { k: 'art', t: 'Artisan certificate', tag: 'Certificate, level 2', st: ['New TVET framework'], who: 'UVTAB', where: 'Vocational training institutes and skills development centres.', entry: 'Three years after P7, or skills shown through recognition of prior learning.', more: 'Officials compare it to S4. A Junior Certificate (three years after P7, equal to UCE) sits at about this height.', job: 0 },
    { k: 'craft', t: 'National Craftsperson Certificate', tag: 'Certificate', st: ['TVET Act 2025'], who: 'UVTAB', where: 'Vocational training institutes and skills development centres. It is the top award of lower TVET.', entry: 'An artisan certificate, S4, or assessed skills.', more: 'Officials compare craft certificates to S6. A National Certificate sits at about this height; ask admissions offices to confirm it counts as equivalent.', job: 1 },
    { k: 'ntd', t: 'National Technician Diploma', tag: 'Diploma', st: ['TVET Act 2025'], who: 'UVTAB', where: 'Technical colleges.', entry: 'A craft certificate or equivalent, skills assessed to level 3, or A-level; then an interview or practical test.', more: 'About two years full time. The TVET Council approved 17 new curricula in September 2026.', job: 2 },
    { k: 'nhd', t: 'National Higher Diploma', tag: 'Higher diploma', st: ['TVET Act 2025'], who: 'National polytechnics', where: 'National polytechnics.', entry: 'A national diploma from a TVET institution.', more: 'Universities may not offer TVET programmes at this level or above.', job: 3 },
    { k: 'ntu', t: 'National Technical University', tag: 'Bachelor’s to PhD', st: ['TVET Act 2025'], who: 'National Technical University', where: 'The National Technical University that the Act provides for.', entry: 'Set by the university.', more: 'A route to a degree that stays inside TVET.', job: 4 }
  ];
  var FW_UNI = [
    { k: 'udip', row: 3, t: 'University diploma', tag: 'Diploma', st: ['In use now'], who: 'The university', where: 'Universities, for example Uganda Martyrs University (Fort Portal) for civil and mechanical engineering.', entry: 'A-level, or a certificate with a credit or second class in a related field.', more: 'About two years.', job: 2 },
    { k: 'bach', row: 5, t: 'Bachelor’s degree', tag: 'Bachelor’s', st: ['In use now'], who: 'The university', where: 'Uganda Martyrs University and other universities.', entry: 'Two A-level principal passes, or a diploma with a credit or second class.', more: 'Three to four years. Some universities let diploma holders skip year one.', job: 4 },
    { k: 'pgd', row: 6, t: 'Postgraduate diploma', tag: 'After a degree', st: ['In use now'], who: 'The university or institute', where: 'Universities and institutes, for example Uganda Management Institute.', entry: 'A degree.', more: 'Often one year, studied while working.', job: 4 },
    { k: 'mast', row: 7, t: 'Master’s degree', tag: 'Master’s', st: ['In use now'], who: 'The university', where: 'Universities in Uganda and abroad.', entry: 'A degree.', more: 'Often part time, alongside work.', job: 5 },
    { k: 'phd', row: 8, t: 'PhD or doctorate', tag: 'Doctorate', st: ['In use now'], who: 'The university', where: 'Universities in Uganda and abroad.', entry: 'A master’s degree.', more: 'Original research that adds new knowledge.', job: 5 }
  ];
  var FW_BRIDGE = {
    dhe: { t: 'Diploma-holder entry', d: 'A diploma with a credit or second class lets you apply for a bachelor’s degree. Some universities admit diploma holders straight into year two.' },
    cats: { t: 'Credit transfer', d: 'Credits you have earned move with you to another programme or provider, so you do not repeat what you already passed. In the draft national framework, 1 credit unit is 10 hours of learning and a full year is 120 credits.' },
    rpl: { t: 'Recognition of prior learning', d: 'Skills learnt at work, through a portfolio, interview and assessment, can count toward a certificate or toward entry to a diploma (skills assessed to level 3).' },
    mat: { t: 'Mature age entry', d: 'Adults without the usual school papers can sit an entry examination for a university degree, where the university offers it.' }
  };
  var STCOL = { 'TVET Act 2025': C.tvet, 'New TVET framework': '#2f69bf', 'In use now': C.money, 'Draft': C.muted };
  VIZ.framework = function (root) {
    var top = H('div', 'ctl', null, root);
    var startRow = pickRow(top, 'I completed', startItems(), function (k) { stop(); setStart(k); }, state.start);
    var playBtn = H('button', 'play', 'Show a route to the top', top);
    var s = svg(1160, 418, root);
    var X1 = 236, X2 = 600, U1 = 744, U2 = 1156, RH = 36, GAP = 6, BOT = 416;
    function ry(row) { return BOT - (row + 1) * (RH + GAP); }
    T(s, (X1 + X2) / 2, 18, 'TVET', { 'font-size': 20, 'font-weight': 700, 'text-anchor': 'middle', fill: C.tvet });
    T(s, U1 - 14, ry(8) + 24, 'University', { 'font-size': 20, 'font-weight': 700, 'text-anchor': 'end', fill: C.uni });
    var nodes = {}, all = [];
    /* tier bands for lower and upper TVET, from s. 31 of the Act */
    var tiers = [
      { k: 'low', t: 'Lower TVET', from: 0, to: 2, d: 'Vocational education and training. Vocational training institutes and skills development centres award the National Craftsperson Certificate and below (TVET Act 2025, s. 31).' },
      { k: 'up', t: 'Upper TVET', from: 3, to: 5, d: 'Technical education and training. Technical colleges award the National Technician Diploma and below; national polytechnics the National Higher Diploma and below; the National Technical University degrees and postgraduate awards (TVET Act 2025, s. 31).' }
    ];
    tiers.forEach(function (tr) {
      var g = S('g', { class: 'hit' }, s);
      var y0 = ry(tr.to), y1 = ry(tr.from) + RH;
      var r = S('rect', { x: 0, y: y0, width: 100, height: y1 - y0, rx: 8, fill: tr.k === 'low' ? '#e3ecfa' : C.tvet2, 'stroke-width': 3 }, g);
      var tx = S('text', { x: 56, y: (y0 + y1) / 2, 'font-size': 17, 'font-weight': 700, fill: C.tvet, 'text-anchor': 'middle', transform: 'rotate(-90 56 ' + ((y0 + y1) / 2) + ')' }, g);
      tx.textContent = tr.t;
      g.addEventListener('click', function () { stop(); select({ tier: tr, r: r }); });
      all.push({ r: r, isTier: true });
      tr.r = r;
    });
    function rung(item, x1, x2, row, col) {
      var g = S('g', { class: 'hit' }, s);
      var y = ry(row);
      var r = S('rect', { x: x1, y: y, width: x2 - x1, height: RH, rx: 6, fill: col, 'stroke-width': 4 }, g);
      T(g, x1 + 14, y + 24, item.t, { 'font-size': 17, fill: '#fff', 'font-weight': 500 });
      T(g, x2 - 12, y + 24, item.tag, { 'font-size': 14, fill: '#fff', 'text-anchor': 'end', opacity: 0.85 });
      g.addEventListener('click', function () { stop(); select({ item: item, r: r }); });
      nodes[item.k] = { r: r, x1: x1, x2: x2, y: y, item: item };
      all.push({ r: r });
    }
    var tcol = ['#7d9fd6', '#3d78cf', '#2f69bf', '#1f5fbf', '#174a96', '#123c7c'];
    FW_TVET.forEach(function (it, i) { rung(it, X1, X2, i, tcol[i]); });
    var ucol = { udip: '#3a9466', bach: '#1d7a4c', pgd: '#187046', mast: '#145c39', phd: '#0f4a2e' };
    FW_UNI.forEach(function (it) { rung(it, U1, U2, it.row, ucol[it.k]); });
    /* skills from work */
    var wy = ry(0);
    var wg = S('g', { class: 'hit' }, s);
    var wr = S('rect', { x: U1, y: wy - 44, width: U2 - U1, height: RH + 44, rx: 8, fill: C.money2, 'stroke-width': 4 }, wg);
    T(wg, (U1 + U2) / 2, wy - 14, 'Skills learnt at work', { 'font-size': 18, 'font-weight': 700, fill: C.money, 'text-anchor': 'middle' });
    T(wg, (U1 + U2) / 2, wy + 12, 'apprenticeships and every workplace', { 'font-size': 15, fill: C.money, 'text-anchor': 'middle' });
    var workItem = { k: 'work', t: 'Skills learnt at work', tag: 'Any time', st: ['In use now'], who: 'UVTAB assesses them', where: 'Your workplace.', entry: 'None.', more: 'Work experience is learning. Through recognition of prior learning it can turn into a certificate, and it strengthens any application.', job: 1 };
    wg.addEventListener('click', function () { stop(); select({ item: workItem, r: wr }); });
    all.push({ r: wr });
    /* bridges */
    var bridges = {};
    function bridge(k, d, lx, ly, anchorLeft) {
      var g = S('g', { class: 'hit' }, s);
      var p = S('path', { d: d, fill: 'none', stroke: C.money, 'stroke-width': 4, 'stroke-dasharray': '9 7' }, g);
      S('path', { d: d, fill: 'none', stroke: 'transparent', 'stroke-width': 18 }, g);
      var w = FW_BRIDGE[k].t.length * 7.6 + 22;
      if (anchorLeft) lx = lx + w / 2;
      var pill = S('rect', { x: lx - w / 2, y: ly - 15, width: w, height: 28, rx: 14, fill: '#fff', stroke: C.money, 'stroke-width': 2 }, g);
      T(g, lx, ly + 5, FW_BRIDGE[k].t, { 'font-size': 14, fill: C.money, 'text-anchor': 'middle', 'font-weight': 500 });
      g.addEventListener('click', function () { stop(); select({ bridge: k, r: pill, p: p }); });
      bridges[k] = { p: p, pill: pill };
    }
    var nt = nodes.ntd, ba = nodes.bach, ud = nodes.udip, cr = nodes.craft;
    bridge('cats', 'M' + X2 + ' ' + (nt.y + RH / 2) + ' L' + U1 + ' ' + (ud.y + RH / 2), (X2 + U1) / 2, nt.y + RH / 2 - 16);
    bridge('dhe', 'M' + X2 + ' ' + (nt.y + 8) + ' C 672 ' + (nt.y + 8) + ' 672 ' + (ba.y + RH / 2) + ' ' + U1 + ' ' + (ba.y + RH / 2), U1 + 8, ry(4) + RH / 2, true);
    bridge('rpl', 'M' + U1 + ' ' + (wy - 20) + ' C 672 ' + (wy - 20) + ' 672 ' + (cr.y + RH / 2) + ' ' + X2 + ' ' + (cr.y + RH / 2), U1 + 8, ry(2) + RH / 2 - 4, true);
    bridge('mat', 'M' + (U2 - 30) + ' ' + (wy - 44) + ' L' + (U2 - 30) + ' ' + (ud.y + RH + 4) + ' M' + (U2 - 30) + ' ' + (ud.y - 4) + ' L' + (U2 - 30) + ' ' + (ba.y + RH + 2), U2 - 96, ry(4) + RH / 2);
    /* you are here */
    var marker = S('g', { style: 'transition:transform .6s ease' }, s);
    S('circle', { cx: 0, cy: 0, r: 15, fill: C.money, stroke: '#fff', 'stroke-width': 3 }, marker);
    var mlab = S('g', {}, marker);
    S('rect', { x: -132, y: -14, width: 112, height: 28, rx: 14, fill: C.money }, mlab);
    T(mlab, -76, 6, 'You are here', { 'font-size': 14, fill: '#fff', 'text-anchor': 'middle', 'font-weight': 500 });
    /* detail card */
    var card = H('div', 'card fwcard', null, root);
    src(root, 'Tiers and awarding bodies: Technical and Vocational Education and Training Act (2025, ss. 28, 31, 77). Artisan level: Kazibwe (2026). Older levels: Directorate of Industrial Training (n.d.). University entry: Uganda Martyrs University (2026a). Bridges: Uganda Vice Chancellors’ Forum (2025). Rungs side by side show order, not official equivalence.');
    var cur = null;
    function clear() {
      all.forEach(function (a) { a.r.setAttribute('stroke', 'none'); });
      Object.keys(bridges).forEach(function (k) { bridges[k].p.setAttribute('stroke-width', 4); bridges[k].pill.setAttribute('stroke-width', 2); });
    }
    function chips(list) { return list.map(function (x) { return '<span class="chip" style="background:' + STCOL[x] + '">' + x + '</span>'; }).join(''); }
    function select(o) {
      cur = o;
      clear();
      var tr = TRADES[state.trade];
      if (o.item) {
        o.r.setAttribute('stroke', C.ink);
        var it = o.item;
        card.style.borderColor = FW_UNI.indexOf(it) >= 0 ? C.uni : (it.k === 'work' ? C.money : C.tvet);
        card.innerHTML = '<h4>' + it.t + ' ' + chips(it.st) + '</h4>' +
          '<div class="fwgrid"><p><b>Awarded by</b>' + it.who + '</p><p><b>Where</b>' + it.where + '</p><p><b>Entry</b>' + it.entry + '</p>' +
          '<p><b>In ' + tr.name.toLowerCase() + '</b>' + tr.jobs[it.job] + '</p></div><p class="note">' + it.more + '</p>';
      } else if (o.tier) {
        o.r.setAttribute('stroke', C.ink);
        card.style.borderColor = C.tvet;
        card.innerHTML = '<h4>' + o.tier.t + ' ' + chips(['TVET Act 2025']) + '</h4><p>' + o.tier.d + '</p>';
      } else if (o.bridge) {
        bridges[o.bridge].p.setAttribute('stroke-width', 7);
        bridges[o.bridge].pill.setAttribute('stroke-width', 4);
        card.style.borderColor = C.money;
        card.innerHTML = '<h4>Bridge: ' + FW_BRIDGE[o.bridge].t + '</h4><p>' + FW_BRIDGE[o.bridge].d + '</p>';
      }
    }
    function place() {
      startRow._set(state.start);
      var n = nodes[{ jun: 'art', nat: 'craft', app: 'mod', wsa: 'mod' }[state.start]];
      shown = state.start;
      marker.setAttribute('transform', 'translate(' + (n.x1 - 4) + ',' + (n.y + RH / 2) + ')');
      select({ item: n.item, r: n.r });
    }
    var tm = null;
    function stop() { clearInterval(tm); tm = null; }
    playBtn.addEventListener('click', function () {
      stop();
      var seq = { jun: ['art', 'craft', 'ntd', 'B:dhe', 'bach', 'mast', 'phd'], nat: ['craft', 'ntd', 'B:dhe', 'bach', 'mast', 'phd'], app: ['mod', 'B:rpl', 'ntd', 'B:dhe', 'bach', 'mast', 'phd'] }[STARTS[state.start].appr ? 'app' : state.start];
      var i = 0;
      function step() {
        var k = seq[i];
        if (k.indexOf('B:') === 0) select({ bridge: k.slice(2) });
        else select({ item: nodes[k].item, r: nodes[k].r });
        i++;
        if (i >= seq.length) stop();
      }
      step();
      tm = setInterval(step, 1500);
    });
    var shown = null;
    listeners.push(function () { if (shown !== state.start) place(); else if (cur) select(cur); });
    place();
  };

  /* ---------- 2c. what each level means: draft national framework descriptors ---------- */
  var LEVELS = [
    { k: 'Basic knowledge, reading, writing and numbers for everyday life.', s: 'Simple routine tasks under close supervision.', a: 'Respects human values and ethics.' },
    { k: 'Basic facts and procedures in a field of work.', s: 'Simple routine tasks with little supervision.', a: 'Self-motivated, works in a team, a responsible citizen.' },
    { k: 'General concepts of one or more related fields.', s: 'Applies methods and resources in familiar situations.', a: 'Promotes cultural heritage and healthy living.' },
    { k: 'Broad knowledge, including abstract and technical ideas.', s: 'Complex tasks; middle-management responsibility.', a: 'Follows ethical and professional standards.' },
    { k: 'Broad, in-depth knowledge that produces new insights.', s: 'Specialised technical work; decides with real independence.', a: 'Weighs social, environmental, economic and ethical issues.' },
    { k: 'The theories and principles behind the work, applied in context.', s: 'Solves complex or abstract problems.', a: 'Socially responsible and accountable.' },
    { k: 'Specialist knowledge and mastery of research.', s: 'High-level research; supervises and mentors others.', a: 'Helps set ethical and professional standards.' },
    { k: 'Creates and interprets new knowledge through original research.', s: 'Critical, creative work on hard problems.', a: 'Shapes ethical practice and community change.' }
  ];
  /* the award at each level: draft UNQF qualification pathways, with the TVET framework for levels 2 and 3 */
  var AWARDS = [
    { a: 'Primary (PLE)', d: 'Primary Leaving Examination (PLE); foundation literacy and numeracy' },
    { a: 'Certificate', d: 'O-level (UCE); artisan certificate (level 2 in the TVET framework). A Junior Certificate sits about here.' },
    { a: 'Certificate', d: 'A-level (UACE); craft certificate, such as the National Craftsperson Certificate; higher education certificate. A National Certificate sits about here.' },
    { a: 'Diploma', d: 'Diploma, such as the National Technician Diploma or a university diploma' },
    { a: 'Higher diploma', d: 'Higher diploma, such as the National Higher Diploma' },
    { a: 'Bachelor’s', d: 'Bachelor’s degree; postgraduate diploma' },
    { a: 'Master’s', d: 'Master’s degree' },
    { a: 'PhD', d: 'PhD or doctorate' }
  ];
  VIZ.levels = function (root) {
    var s = svg(1160, 286, root);
    var cols = [];
    var fills = ['#9db7e3', '#7d9fd6', '#3d78cf', '#2f69bf', '#1f5fbf', '#174a96', '#1d7a4c', '#145c39'];
    LEVELS.forEach(function (L, i) {
      var x = i * 145, h = 50 + i * 25, y = 246 - h;
      var g = S('g', { class: 'hit' }, s);
      S('rect', { x: x, y: 0, width: 140, height: 286, fill: 'transparent' }, g);
      var r = S('rect', { x: x, y: y, width: 140, height: h, rx: 4, fill: fills[i], 'stroke-width': 5 }, g);
      T(g, x + 14, y + 38, String(i + 1), { 'font-size': 34, 'font-weight': 700, fill: '#fff' });
      T(g, x + 70, 276, AWARDS[i].a, { 'font-size': 19, 'font-weight': 700, fill: fills[i] === '#9db7e3' ? '#5d7fb8' : fills[i], 'text-anchor': 'middle' });
      g.addEventListener('click', function () { show(i); });
      cols.push(r);
    });
    var grid = H('div', 'lvgrid', null, root);
    var q = H('div', 'ctl', '<span class="lab">Which sounds most like you at work today?</span>', root);
    var opts = [
      { k: 1, label: 'Routine tasks, little supervision' },
      { k: 2, label: 'I work alone on familiar jobs' },
      { k: 3, label: 'Complex jobs, and I guide others' },
      { k: 4, label: 'Specialised work, my own decisions' }
    ];
    var res = H('p', 'note', '', root);
    pickRow(q, '', opts, function (k) {
      show(k);
      res.innerHTML = 'That sounds closest to <b>level ' + (k + 1) + '</b> of the draft. Use it as a talking point with a mentor, not as an official level.';
    }, null);
    src(root, 'Draft Uganda National Qualifications Framework, 8 levels, and its qualification pathways (Uganda Vice Chancellors’ Forum, 2025). Artisan and craft placements: Kazibwe (2026); officials say comparisons below the diploma are still under discussion. An earlier 2024 draft described 9 levels (Uganda National Commission for UNESCO, n.d.). In November 2026 officials said the national framework was still being developed (Kazibwe, 2026).');
    function show(i) {
      cols.forEach(function (r, j) { r.setAttribute('stroke', j === i ? C.ink : 'none'); });
      var L = LEVELS[i];
      grid.innerHTML = '<div class="lvnum" style="color:' + fills[i] + '">Level ' + (i + 1) + '<span class="lvaw">' + AWARDS[i].d + '</span></div>' +
        '<div><b>Knowledge</b>' + L.k + '</div><div><b>Skills and responsibility</b>' + L.s + '</div><div><b>Attitude and behaviour</b>' + L.a + '</div>';
    }
    show(2);
  };

  /* ---------- 4c. few free places ---------- */
  function chair(p, x, y, col, s) {
    var g = S('g', { transform: 'translate(' + x + ',' + y + ') scale(' + (s || 1) + ')' }, p);
    S('rect', { x: 6, y: 0, width: 48, height: 46, rx: 6, fill: col }, g);
    S('rect', { x: 0, y: 46, width: 60, height: 14, rx: 4, fill: col }, g);
    S('path', { d: 'M6 60 L6 90 M54 60 L54 90', stroke: col, 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    return g;
  }
  VIZ.seats = function (root) {
    var s = svg(1160, 300, root);
    T(s, 0, 26, 'Public university, diploma-holder entry', { 'font-size': 21, 'font-weight': 700 });
    for (var i = 0; i < 3; i++) chair(S('g', { class: 'pop d' + (i + 1) }, s), 10 + i * 90, 60, C.money, 1.05);
    T(s, 0, 228, '3', { 'font-size': 64, 'font-weight': 700, fill: C.money });
    T(s, 52, 204, 'government places per programme', { 'font-size': 19 });
    T(s, 52, 228, 'on most programmes in one 2026/27 advert', { 'font-size': 17, fill: C.soft });
    T(s, 0, 276, 'Everyone else admitted pays fees.', { 'font-size': 19, fill: C.soft });
    S('line', { x1: 540, y1: 10, x2: 540, y2: 290, stroke: C.line, 'stroke-width': 2 }, s);
    T(s, 580, 26, 'Private university, for example Uganda Martyrs', { 'font-size': 21, 'font-weight': 700 });
    for (var j = 0; j < 3; j++) {
      var g = S('g', { class: 'pop d' + (j + 3) }, s);
      chair(g, 590 + j * 90, 60, '#fff', 1.05).querySelectorAll('rect,path').forEach(function (e) { e.setAttribute('stroke', C.line); e.setAttribute('stroke-width', 3); });
    }
    T(s, 580, 228, '0', { 'font-size': 64, 'font-weight': 700, fill: C.muted });
    T(s, 632, 204, 'government places', { 'font-size': 19 });
    T(s, 632, 228, 'everyone pays tuition', { 'font-size': 17, fill: C.soft });
    T(s, 580, 276, 'Half-tuition bursaries on some full-time programmes.', { 'font-size': 19, fill: C.uni });
    H('p', 'big', '<b style="color:var(--money)">Plan to pay, borrow or be sponsored.</b> For a Uganda Martyrs half-tuition bursary, get a recommendation from a bishop, superior general, head teacher or LC5 chairperson.', root);
    src(root, 'Government places: Kyambogo University (2026). Bursaries: Uganda Martyrs University (2026a).');
  };

  /* ---------- 4d. fee calculator from the Uganda Martyrs 2026/27 brochure ---------- */
  var UMU = [
    { k: 'dce', t: 'Diploma in Civil Engineering', c: 'Fort Portal', y: [2, 2], f: 580000, tr: ['build', 'carp'] },
    { k: 'dee', t: 'Diploma in Electrical Engineering', c: 'Fort Portal', y: [2, 2], f: 580000, tr: ['elec'] },
    { k: 'dwe', t: 'Diploma in Water Engineering', c: 'Fort Portal', y: [2, 2], f: 580000, tr: ['plumb'] },
    { k: 'dme', t: 'Diploma in Mechanical and Manufacturing Engineering', c: 'Fort Portal', y: [2, 2], f: 580000, tr: ['fit', 'auto'] },
    { k: 'bce', t: 'BSc Civil Engineering', c: 'Fort Portal', y: [3, 4], f: 1489000, tr: ['build', 'carp', 'plumb'] },
    { k: 'bee', t: 'BSc Electrical Engineering', c: 'Fort Portal', y: [3, 4], f: 1489000, tr: ['elec'] },
    { k: 'bme', t: 'BSc Mechanical and Manufacturing Engineering', c: 'Fort Portal', y: [3, 4], f: 1489000, tr: ['fit', 'auto'] },
    { k: 'bed', t: 'Bachelor of Environmental Design', c: 'Nkozi', y: [3, 3], f: 2457900, tr: ['build', 'carp'] },
    { k: 'bft', t: 'BA Fashion and Textile Design', c: 'Nkozi', y: [3, 3], f: 1020000, tr: ['fash'] },
    { k: 'dba', t: 'Diploma in Business Administration and Management', c: 'Masaka, evening', y: [2, 2], f: 429000, tr: ['hair', 'fash'] },
    { k: 'bba', t: 'Bachelor of Business Administration and Management', c: 'Masaka, evening', y: [3, 3], f: 893000, tr: ['hair'] }
  ];
  VIZ.fees = function (root) {
    var pick = H('div', 'ctl', '<span class="lab">Programme</span>', root);
    var sel = H('select', 'feesel', UMU.map(function (p) { return '<option value="' + p.k + '">' + p.t + ' (' + p.c + ')</option>'; }).join(''), pick);
    var bur = H('label', 'tog', '<input type="checkbox"> Half-tuition bursary', pick);
    var cb = bur.querySelector('input');
    var mine = H('div', 'ctl', null, root);
    var s = svg(1160, 250, root);
    var out = H('p', 'big', '', root);
    src(root, 'Tuition per semester for 2026/27, from the Uganda Martyrs University brochure (Uganda Martyrs University, 2026a). The brochure lists tuition only; ask about other charges, food and rent. Undergraduate application fee: Shs 30,000.');
    function fill() {
      mine.innerHTML = '<span class="lab">For ' + TRADES[state.trade].name.toLowerCase() + '</span>';
      var list = UMU.filter(function (p) { return p.tr.indexOf(state.trade) >= 0; });
      list.forEach(function (p) {
        var b = H('button', 'pick' + (p.k === sel.value ? ' on' : ''), p.t, mine);
        b.addEventListener('click', function () { sel.value = p.k; draw(); });
      });
    }
    function byTrade() {
      var p = UMU.filter(function (x) { return x.tr.indexOf(state.trade) >= 0; })[0];
      if (p) sel.value = p.k;
      draw();
    }
    function draw() {
      fill();
      var p = UMU.filter(function (x) { return x.k === sel.value; })[0];
      var half = cb.checked ? 0.5 : 1, sem = p.f * half;
      var rows = [
        { t: 'Per semester', v: [sem, sem] },
        { t: 'Per year (2 semesters)', v: [sem * 2, sem * 2] },
        { t: 'Whole course', v: [sem * 2 * p.y[0], sem * 2 * p.y[1]] }
      ];
      var max = 2457900 * 2 * 4;
      while (s.firstChild) s.removeChild(s.firstChild);
      rows.forEach(function (r, i) {
        var y = 14 + i * 78;
        T(s, 0, y + 30, r.t, { 'font-size': 19, 'font-weight': 500 });
        var w0 = Math.max(4, r.v[0] / max * 640), w1 = r.v[1] / max * 640;
        if (w1 > w0) S('rect', { x: 260, y: y + 8, width: w1, height: 36, rx: 4, fill: C.uni2 }, s);
        S('rect', { x: 260, y: y + 8, width: w0, height: 36, rx: 4, fill: i === 2 ? TRADES[state.trade].col : C.uni }, s);
        T(s, 272 + Math.max(w0, w1), y + 33, r.v[0] === r.v[1] ? money(r.v[0]) : money(r.v[0]) + ' to ' + money(r.v[1]), { 'font-size': 19, 'font-weight': 700 });
      });
      T(s, 260, 246, p.y[0] === p.y[1] ? p.y[0] + ' years' : p.y[0] + ' or ' + p.y[1] + ' years (pale bar: the longer route)', { 'font-size': 15, fill: C.muted });
      out.innerHTML = '<b>' + p.t + '</b>, ' + p.c + ': ' + money(p.f) + ' tuition per semester' + (cb.checked ? ', halved by a bursary' : '') + '.' +
        (TRADES[state.trade].loan ? ' A student loan can cover up to Shs 7.6 million a year for priority areas such as engineering.' : '');
    }
    sel.addEventListener('change', draw);
    cb.addEventListener('change', draw);
    listeners.push(byTrade); byTrade();
  };

  /* ---------- 9. learning never ends ---------- */
  var PHASES = [
    { a: 18, b: 25, t: 'Getting started' },
    { a: 25, b: 35, t: 'Getting good' },
    { a: 35, b: 45, t: 'Leading' },
    { a: 45, b: 60, t: 'Passing it on' }
  ];
  var PD = {
    auto: ['Get assessed by UVTAB at the next level while you work; apply for a manufacturer apprenticeship such as the CFAO Motors technical trainee programme.', 'Learn electric vehicle systems, as Kiira Motors and UNDP now teach; visit the motor show at the Uganda International Trade Fair; join a mechanics SACCO.', 'Run or supervise a workshop; learn business skills with Enterprise Uganda; mentor apprentices.', 'Teach mechanics as a licensed TVET trainer; lead your SACCO or association.'],
    build: ['Get assessed by UVTAB at the next level; attend a Hima Cement builders’ workshop on foundations, roofing and reading drawings.', 'Learn building codes and site safety, as 250 fundis did at Makerere in April 2026; take on bigger jobs.', 'Lead a site team; learn business skills with Enterprise Uganda; enter or judge skills competitions.', 'Teach building as a licensed TVET trainer; mentor young masons.'],
    fit: ['Get assessed by UVTAB at the next level; join an EDIC engineering bootcamp to work on modern machines.', 'Join a welders SACCO; visit the Uganda International Trade Fair to see new machinery.', 'Supervise a workshop; learn business skills with Enterprise Uganda; mentor apprentices.', 'Teach fitting and machining as a licensed TVET trainer.'],
    hair: ['Get assessed by UVTAB at the next level; learn new styles and products from suppliers.', 'Join FUSPRO, the Federation of Uganda Salons and Beauty Professionals, and its training on running a salon and managing money.', 'Run your own salon; join a salon operators SACCO; train your staff.', 'Teach hairdressing as a licensed TVET trainer; lead your association.'],
    fash: ['Get assessed by UVTAB at the next level; learn from senior tailors at work.', 'Show at the Fashion and Business Expo of Uganda International Fashion Week; join a tailors SACCO.', 'Build your label; meet buyers; learn business skills with Enterprise Uganda.', 'Mentor young tailors, for example through fashion week training programmes; teach as a licensed TVET trainer.'],
    elec: ['Get an installation permit from the Electricity Regulatory Authority (ERA): Class D lets you wire homes of up to five bedrooms. Get assessed by UVTAB at the next level.', 'Move up to a Class C permit for storeyed buildings such as schools and hotels; learn solar installation with SENDEA Academy; attend Makerere’s fundis workshop.', 'Classes B and A cover bigger and high-voltage work, and a diploma or degree helps you qualify; run a contracting firm; learn business skills with Enterprise Uganda.', 'Teach electrical installation as a licensed TVET trainer; mentor young wiremen.'],
    carp: ['Get assessed by UVTAB at the next level; join a carpenters SACCO under Emyooga.', 'Show your furniture at the Uganda International Trade Fair; learn machine woodworking and finishing from senior joiners.', 'Run a joinery workshop and fitting-out contracts; learn business skills with Enterprise Uganda; mentor apprentices.', 'Teach carpentry as a licensed TVET trainer, or at a Presidential Industrial Hub.'],
    plumb: ['Get assessed by UVTAB at the next level; get the artisan practising permit the TVET Act 2025 requires.', 'Attend Makerere’s yearly fundis workshop on building codes; learn water systems, as NWSC teaches at its skills facility in Ggaba.', 'Run a plumbing business and take on building contracts; learn business skills with Enterprise Uganda.', 'Teach plumbing as a licensed TVET trainer; mentor apprentices.']
  };
  VIZ.lifelong = function (root) {
    var s = svg(1160, 300, root);
    var A0 = 18, A1 = 60, X0 = 150, X1 = 1120;
    function ax(a) { return X0 + (a - A0) / (A1 - A0) * (X1 - X0); }
    for (var a = 20; a <= 60; a += 10) {
      S('line', { x1: ax(a), y1: 30, x2: ax(a), y2: 250, stroke: C.faint, 'stroke-width': 2 }, s);
      T(s, ax(a), 274, 'age ' + a, { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    }
    T(s, 0, 74, 'Formal courses', { 'font-size': 18, 'font-weight': 700, fill: C.tvet });
    T(s, 0, 174, 'Learning at work', { 'font-size': 18, 'font-weight': 700, fill: C.uni });
    T(s, 0, 196, 'and beyond', { 'font-size': 18, 'font-weight': 700, fill: C.uni });
    [[19, 21, 'Diploma'], [23, 26, 'Degree'], [33, 35, 'Master’s, if you want']].forEach(function (b, i) {
      S('rect', { x: ax(b[0]), y: 56, width: ax(b[1]) - ax(b[0]), height: 34, rx: 6, fill: i === 2 ? C.tvet2 : C.tvet, class: 'pop d' + (i + 1) }, s);
      T(s, ax(b[0]), 48, b[2], { 'font-size': 15, fill: C.tvet, 'font-weight': 500 });
    });
    var band = S('rect', { x: ax(18), y: 150, width: ax(60) - ax(18), height: 56, rx: 10, fill: C.uni2 }, s);
    var dots = S('g', {}, s);
    for (var d = 19; d < 60; d += 1.5) S('circle', { cx: ax(d), cy: 178, r: 6, fill: C.uni, opacity: 0.6 + 0.4 * Math.sin(d) }, dots);
    PHASES.forEach(function (p) { T(s, ax(p.a) + 8, 140, p.t, { 'font-size': 15, fill: C.uni, 'font-weight': 500 }); S('line', { x1: ax(p.a), y1: 128, x2: ax(p.a), y2: 214, stroke: C.uni, 'stroke-width': 2 }, s); });
    var mk = S('g', {}, s);
    S('line', { x1: 0, y1: 36, x2: 0, y2: 236, stroke: C.ink, 'stroke-width': 3 }, mk);
    S('circle', { cx: 0, cy: 178, r: 12, fill: C.ink }, mk);
    var ctl = H('div', 'ctl', '<span class="lab">Move through a career: age</span>', root);
    var rng = H('input', null, null, ctl);
    rng.type = 'range'; rng.min = 18; rng.max = 59; rng.value = 22; rng.style.width = '380px';
    var age = H('b', null, '', ctl);
    var play = H('button', 'play', 'Play a career', ctl);
    var out = H('p', 'big', '', root);
    src(root, 'Examples drawn from the opportunities on the next slide. Course years are an example.');
    function draw() {
      var a = +rng.value;
      age.textContent = a;
      mk.setAttribute('transform', 'translate(' + ax(a) + ',0)');
      var pi = 0;
      PHASES.forEach(function (p, i) { if (a >= p.a) pi = i; });
      var tr = TRADES[state.trade];
      out.innerHTML = '<b style="color:' + tr.col + '">' + tr.name + ', age ' + a + ' (' + PHASES[pi].t.toLowerCase() + '):</b> ' + PD[state.trade][pi];
    }
    var tm = null;
    play.addEventListener('click', function () {
      clearInterval(tm);
      rng.value = 18;
      tm = setInterval(function () { rng.value = +rng.value + 1; draw(); if (+rng.value >= 59) clearInterval(tm); }, 220);
    });
    rng.addEventListener('input', draw);
    listeners.push(draw); draw();
  };

  /* ---------- 9b. six ways to keep learning outside a classroom ---------- */
  var WAYS = [
    { k: 'assess', sh: 'UVTAB, four times a year', t: 'Get your work skills assessed', g: 'UVTAB assesses skills learnt at work four times a year: one module, a Worker’s PAS, or a full level.', src: 'Plus News (2026)',
      tr: { auto: 'Each new skill you master in the garage can become a module certificate.', build: 'Prove each new skill from site, such as roofing or plastering, as a module.', fit: 'Turn welding or machining experience into a module certificate.', hair: 'Turn new styling skills into a module certificate.', fash: 'Turn new garment skills into a module certificate.', elec: 'Turn new wiring skills into a module certificate. For an ERA installation permit, practical experience counts alongside certificates (Africa-Press, n.d.).', carp: 'Turn new joinery skills, such as door frames or fitted cupboards, into a module certificate.', plumb: 'Turn new pipework skills into a module certificate.' } },
    { k: 'industry', sh: 'Company workshops and apprenticeships', t: 'Learn from industry', g: 'Companies train the people who use their products and fix their machines. Watch for adverts and ask your employer.', src: '',
      tr: { auto: 'CFAO Motors Uganda (formerly Toyota Uganda) has run a two-year apprentice and technical trainee programme for certificate and diploma holders in automotive (The Ugandan Jobline, 2023).', build: 'Hima Cement runs one-day builders’ workshops across Uganda on foundations, roofing, reading drawings and site safety, with tools, protective gear and certificates of attendance (Matooke Republic, 2023). In April 2026 it trained over 250 fundis with Makerere University (Nile Post, 2026a).', fit: 'The Engineering Development and Innovation Centre (EDIC) runs an 8-week hands-on engineering bootcamp at its Smart Manufacturing Centre in Rwebiteete, Kiruhura, including die, mould and tool making (Mwibo, 2025). See the next slide.', hair: 'In February 2026 Equity Bank trained over 200 salon owners, stylists and barbers in money management and growing a salon (Eagle Online, 2026a).', fash: 'Uganda International Fashion Week’s CREATE programme aims to train more than 500 skilled tailors over three years (Asingwire, 2026).', elec: 'SENDEA Academy, the training arm of an association of solar importers and distributors, has trained close to 1,000 solar installation technicians, with a year of field mentorship (SUN-CONNECT, n.d.). EDIC’s bootcamp also covers electrical engineering. See the next slide.', carp: 'An FAO and European Union programme offers graduate training in sawmilling, seasoning and wood value addition, with attachments at forestry companies, for diploma or degree holders in wood science or a related field (Nandudu, 2026). A goal for after your diploma.', plumb: 'The National Water and Sewerage Corporation (NWSC) trains industrial plumbers at its Vocational Skills Development Facility in Ggaba; 259 staff graduated in May 2026 (Sseryazi, 2026). NWSC also lists training for plumbers as an external service (National Water and Sewerage Corporation, n.d.).' } },
    { k: 'join', sh: 'Associations and Emyooga SACCOs', t: 'Join your trade body or SACCO', g: 'Members learn from each other, get training and reach funds. Emyooga SACCOs exist for mechanics, welders, carpenters, salon operators and tailors.', src: 'Microfinance Support Centre (n.d.)',
      tr: { auto: 'Mechanics SACCOs under Emyooga.', build: 'Carpenters or welders SACCOs under Emyooga, if your building work includes joinery or metal.', fit: 'Welders SACCOs under Emyooga.', hair: 'FUSPRO, the Federation of Uganda Salons and Beauty Professionals, works in 141 districts and represents about 120,000 salon owners and trainers (Eagle Online, 2026a). Salon operators SACCOs under Emyooga.', fash: 'Tailors SACCOs under Emyooga.', elec: 'ERA holds an installation permit conference for Class C and D permit holders (Mulindwa, 2023). Electricians are not an Emyooga category, so ask about electrical contractors’ associations in your area.', carp: 'Carpenters SACCOs under Emyooga.', plumb: 'Plumbers are not an Emyooga category. Makerere’s yearly fundis workshop brings plumbers together with masons, electricians and other building trades (Musinguzi, 2026).' } },
    { k: 'business', sh: 'Enterprise Uganda training', t: 'Learn business skills', g: 'Enterprise Uganda’s BEST training teaches how to spot opportunities, deal with customers and suppliers and run a business. It trained over 1,000 young people in May 2026.', src: 'Nile Post (2026b)',
      tr: { auto: 'Useful when you open your own garage.', build: 'Useful when you start taking contracts.', fit: 'Useful when you open a fabrication workshop.', hair: 'Useful when you open your own salon.', fash: 'Useful when you start your own label.', elec: 'Useful when you start an electrical contracting firm.', carp: 'Useful when you open your own joinery workshop.', plumb: 'Useful when you start taking plumbing contracts.' } },
    { k: 'show', sh: 'Trade fairs and expos', t: 'Show your work and see what is new', g: 'The Uganda International Trade Fair at Lugogo, run every year by the Uganda Manufacturers Association, has SME, education and textile pavilions and a motor show area.', src: 'Uganda Manufacturers Association (2026)',
      tr: { auto: 'Visit the motor show area to see new vehicles and equipment.', build: 'Meet building material makers and suppliers.', fit: 'See new machines and the SME pavilion.', hair: 'Meet product makers and suppliers in the SME pavilion.', fash: 'The Fashion and Business Expo of Uganda International Fashion Week lets designers show work and meet buyers (Asingwire, 2026).', elec: 'Meet suppliers of cables, switchgear and solar equipment.', carp: 'Show your furniture and meet timber and hardware suppliers.', plumb: 'Meet makers of pipes, tanks and fittings.' } },
    { k: 'compete', sh: 'Competitions and free skilling hubs', t: 'Compete, or learn a second trade', g: 'Skills competitions test you against others. Presidential Industrial Hubs (19 so far, 17 more planned) teach carpentry, welding, tailoring, building, hairdressing, shoe making and mechanics free, with UVTAB certificates.', src: 'The Independent (2025); State House Uganda (2026)',
      tr: { auto: 'Add welding to your mechanics.', build: 'The Kampala Metropolitan Vocational Skills Competition at Lugogo VTI included building construction (The Independent, 2025).', fit: 'Add carpentry or mechanics to your fitting.', hair: 'Learn a second trade such as tailoring.', fash: 'Learn shoe making to match your clothing.', elec: 'Add welding or building to your wiring.', carp: 'Add welding for steel and wood furniture.', plumb: 'Add welding or building to your plumbing.' } }
  ];
  function wayIcon(p, k, col) {
    var g = S('g', {}, p);
    if (k === 'assess') { S('circle', { cx: 24, cy: 22, r: 16, fill: col }, g); S('path', { d: 'M16 22 L22 28 L33 15', stroke: '#fff', 'stroke-width': 4, fill: 'none' }, g); S('path', { d: 'M16 36 L12 46 L20 42 L24 48 L26 38 M32 36 L36 46 L28 42', fill: col }, g); }
    else if (k === 'industry') { S('path', { d: 'M4 46 L4 24 L16 30 L16 22 L28 28 L28 10 L36 10 L36 46 Z', fill: col }, g); S('rect', { x: 40, y: 30, width: 6, height: 16, fill: col }, g); }
    else if (k === 'join') { [8, 24, 40].forEach(function (x, i) { S('circle', { cx: x, cy: 16 + (i === 1 ? -2 : 2), r: 7, fill: col }, g); S('path', { d: 'M' + (x - 9) + ' 46 Q' + x + ' ' + (22 + (i === 1 ? -2 : 2)) + ' ' + (x + 9) + ' 46 Z', fill: col }, g); }); }
    else if (k === 'business') { [[6, 30], [18, 22], [30, 14]].forEach(function (b) { S('rect', { x: b[0], y: b[1], width: 9, height: 46 - b[1], fill: col }, g); }); S('path', { d: 'M4 20 L18 12 L28 16 L44 4', stroke: col, 'stroke-width': 3, fill: 'none' }, g); }
    else if (k === 'show') { S('path', { d: 'M2 20 L24 4 L46 20 Z', fill: col }, g); S('rect', { x: 6, y: 20, width: 36, height: 26, fill: 'none', stroke: col, 'stroke-width': 4 }, g); S('rect', { x: 18, y: 30, width: 12, height: 16, fill: col }, g); }
    else if (k === 'compete') { S('path', { d: 'M12 4 L36 4 L34 22 Q24 32 14 22 Z', fill: col }, g); S('rect', { x: 20, y: 30, width: 8, height: 8, fill: col }, g); S('rect', { x: 12, y: 38, width: 24, height: 8, rx: 2, fill: col }, g); }
    return g;
  }
  VIZ.ways = function (root) {
    var wrap = H('div', 'ways', null, root);
    var detail = H('div', 'card waycard', null, root);
    var tiles = [];
    WAYS.forEach(function (w, i) {
      var b = H('button', 'way', '', wrap);
      var s = svg(48, 48, b);
      wayIcon(s, w.k, C.uni);
      H('span', 'wt', w.t, b);
      var ex = H('span', 'wx', '', b);
      b.addEventListener('click', function () { cur = i; show(); });
      tiles.push({ b: b, ex: ex });
    });
    src(root, 'Sources are given with each example; full list in the references.');
    var cur = 0;
    function show() {
      var tr = TRADES[state.trade];
      tiles.forEach(function (t, i) {
        t.b.classList.toggle('on', i === cur);
        t.ex.textContent = WAYS[i].sh;
      });
      var w = WAYS[cur];
      detail.style.borderColor = tr.col;
      detail.innerHTML = '<h4>' + w.t + '</h4><p>' + w.g + '</p><p><b style="color:' + tr.col + '">In ' + tr.name.toLowerCase() + ':</b> ' + w.tr[state.trade] + '</p>' + (w.src ? '<p class="note">Source: ' + w.src + '.</p>' : '');
    }
    listeners.push(show); show();
  };

  /* ---------- 9c. more training you can join, compared by length ---------- */
  var TRAIN = [
    { k: 'hima', t: 'Hima Cement builders’ workshop', m: 1 / 30, len: '1 day', tr: ['build'],
      by: 'Hima Cement', where: 'Towns across Uganda', learn: 'Foundations, roofing, reading drawings and site safety. Masons receive tools, protective gear and a certificate of attendance.', who: 'Masons and builders. Over 3,000 trained in one countrywide round.', how: 'Watch for workshop notices from Hima Cement and hardware dealers.', src: 'Matooke Republic (2023)' },
    { k: 'cedat', t: 'Makerere fundis workshop', m: 2 / 30, len: '2 days, every year', tr: ['build', 'plumb', 'elec'],
      by: 'Makerere University’s College of Engineering, Design, Art and Technology (CEDAT), with support from building industry firms', where: 'Makerere University, Kampala', learn: 'Building codes, modern construction methods and sustainable design, with an exhibition of building materials.', who: 'Masons, builders, plumbers, electricians, painters and metal fabricators. Over 250 attended in April 2026, and over 700 since 2023.', how: 'Watch for CEDAT’s yearly call for fundis.', src: 'Musinguzi (2026)' },
    { k: 'edic', t: 'EDIC engineering bootcamp (TIER)', m: 2, len: '8 weeks', tr: ['fit', 'elec', 'auto', 'build'],
      by: 'Engineering Development and Innovation Centre (EDIC), under the Science, Technology and Innovation Secretariat in the Office of the President', where: 'Smart Manufacturing Centre, Rwebiteete, Kiruhura District. EDIC offices are in the Namanve industrial area.', learn: 'Hands-on work in mechanical, electrical, civil and agricultural engineering, including die, mould and tool making. Trainees received certificates.', who: 'The first cohort in 2025 had over 75 young graduates of universities and vocational institutes.', how: 'EDIC posts an Engineering Occupational Training Bootcamp call for applications on edic.go.ug. It also lists internships and attachments, and heavy equipment operator training.', src: 'Mwibo (2025); Engineering Development and Innovation Centre (n.d.-a, n.d.-b, n.d.-c)' },
    { k: 'uiri', t: 'UIRI Nakaseke Textile Skills Centre', m: 2, len: '2 months', tr: ['fash'],
      by: 'Uganda Industrial Research Institute (UIRI)', where: 'Nakaseke District', learn: 'Practical sewing and textile production on industrial machines, linked to real production.', who: 'Open to anyone willing to learn, including school dropouts; textile workers can upgrade their skills. Up to 20 learners a day.', how: 'Contact UIRI or the centre in Nakaseke.', src: 'AllAfrica (2025)' },
    { k: 'nap', t: 'National Apprenticeship Programme', m: 6, len: '6 months', tr: ['build', 'carp', 'plumb', 'elec', 'fit'],
      by: 'Ministry of Gender, Labour and Social Development', where: 'Workplaces with host employers', learn: 'Structured learning on the job, ending with a certificate. Sector committees set up in June 2026 cover construction and manufacturing, as well as agriculture and oil and gas.', who: 'Ugandans aged 16 to 35. Of the first 984 apprentices, about 8 in 10 found formal jobs. Graduate volunteer placements also run.', how: 'Watch for Ministry adverts for apprentices and graduate volunteers.', src: 'Nile Post (2026c); Eagle Online (2026b)' },
    { k: 'sendea', t: 'SENDEA Academy solar technicians', m: 12, len: '1 year of mentorship', tr: ['elec'],
      by: 'SENDEA Academy, the training arm of an association of solar importers and distributors', where: 'Recent groups in Kampala, Kamuli and Kumi', learn: 'Installing, checking and maintaining solar systems, with a year of practical field mentorship.', who: 'Close to 1,000 solar installation technicians trained over three years. Trainees were certified by the Directorate of Industrial Training.', how: 'Contact SENDEA Academy about its next intake.', src: 'SUN-CONNECT (n.d.)' },
    { k: 'emob', t: 'Electric vehicle skilling', m: 12, len: '1 year', tr: ['auto'],
      by: 'UNDP with Makerere University’s Innovation Pod and Kiira Motors Corporation', where: 'Kampala, with Kiira Motors instructors', learn: 'Electric vehicle powertrains, batteries, motors, controllers and charging systems.', who: 'The first group of 25 were university engineering students, so a diploma helps you qualify.', how: 'Follow Kiira Motors and the Makerere Innovation Pod for new calls.', src: 'United Nations Development Programme (2024)' },
    { k: 'cfao', t: 'CFAO Motors technical trainee', m: 24, len: '2 years', tr: ['auto'],
      by: 'CFAO Motors Uganda (formerly Toyota Uganda)', where: 'Kampala workshops', learn: 'Dealer-standard servicing and repair of modern vehicles, on the job.', who: 'Certificate and diploma holders in motor vehicle mechanics.', how: 'Watch job sites for the apprentice and technical trainee advert.', src: 'The Ugandan Jobline (2023)' },
    { k: 'ucc', t: 'Youth ICT and multimedia skilling', m: null, len: 'set by each trainer', tr: ['hair', 'fash', 'auto', 'build', 'fit', 'elec', 'carp', 'plumb'],
      by: 'Uganda Communications Commission, through non-profit trainers', where: 'Ten underserved districts in 2026/27, among them Agago, Sironko, Kikuube and Kalangala', learn: 'Digital marketing, graphic design, photography and video, social media and online selling: useful for showing and selling your work.', who: '1,000 young people in 2026/27.', how: 'Ask your district youth office which trainer won the grant in your area.', src: 'Uganda Communications Commission (2026)' },
    { k: 'nwsc', t: 'NWSC water skills facility', m: null, len: 'length not published', tr: ['plumb', 'elec'],
      by: 'National Water and Sewerage Corporation (NWSC)', where: 'Vocational Skills Development Facility, Ggaba, Kampala', learn: 'Industrial plumbing, water treatment, electromechanical systems and water quality control.', who: 'So far mainly NWSC staff: 259 graduated with Practically Acquired Skills certificates in May 2026. NWSC also lists training for plumbers among its external services.', how: 'Ask NWSC external services whether places are open to non-staff.', src: 'Sseryazi (2026); National Water and Sewerage Corporation (n.d.)' },
    { k: 'fao', t: 'Wood processing graduate training', m: null, len: 'length not published', tr: ['carp'],
      by: 'Food and Agriculture Organization (FAO), funded by the European Union', where: 'Industrial attachments with forestry companies', learn: 'Harvesting, sawmilling, seasoning and preserving wood, and adding value to it.', who: 'Diploma or degree holders in wood science, forest products or a related field, qualified 2022 to 2025. A goal for after your diploma.', how: 'Watch for FAO calls for the graduate training programme.', src: 'Nandudu (2026)' },
    { k: 'hubs', t: 'Presidential Industrial Hubs', m: null, len: 'length not published', tr: ['carp', 'build', 'fit', 'auto', 'hair', 'fash'],
      by: 'State House, Uganda', where: '19 hubs so far, with 17 more planned', learn: 'Carpentry, welding, tailoring, building, hairdressing, shoe making and mechanics.', who: 'Young people learning a trade, free of charge, with UVTAB certificates. For you, a way to add a second trade.', how: 'Ask at the hub in your region.', src: 'State House Uganda (2026)' }
  ];
  VIZ.training = function (root) {
    var ctl = H('div', 'ctl', null, root);
    var only = false;
    var tog = pickRow(ctl, 'Show', [{ k: 'all', label: 'All programmes' }, { k: 'mine', label: 'My trade only' }], function (k) { only = k === 'mine'; draw(); }, 'all');
    var s = svg(1160, 378, root);
    var card = H('div', 'card traincard', null, root);
    src(root, 'Bar length shows how long each programme runs. Sources are given with each programme; full list in the references.');
    var cur = 'edic', seen = null;
    function draw() {
      while (s.firstChild) s.removeChild(s.firstChild);
      var tr = TRADES[state.trade];
      if (seen !== state.trade) {
        seen = state.trade;
        var first = TRAIN.filter(function (x) { return x.tr.indexOf(state.trade) >= 0; })[0];
        if (first) cur = first.k;
      }
      var X0 = 400, PX = 27;
      [0, 6, 12, 18, 24].forEach(function (m) {
        S('line', { x1: X0 + m * PX, y1: 0, x2: X0 + m * PX, y2: 352, stroke: C.faint, 'stroke-width': 2 }, s);
        T(s, X0 + m * PX, 372, m === 0 ? '0' : m + ' months', { 'font-size': 14, fill: C.muted, 'text-anchor': 'middle' });
      });
      var list = TRAIN.filter(function (p) { return !only || p.tr.indexOf(state.trade) >= 0; });
      if (list.filter(function (p) { return p.k === cur; }).length === 0 && list.length) cur = list[0].k;
      var RH = Math.min(42, 350 / Math.max(list.length, 1));
      list.forEach(function (p, i) {
        var y = i * RH + 4, mine = p.tr.indexOf(state.trade) >= 0, col = mine ? tr.col : '#aab2bf';
        var g = S('g', { class: 'hit' }, s);
        S('rect', { x: 0, y: y - 2, width: 1160, height: RH - 4, fill: p.k === cur ? '#f2f5f9' : 'transparent', rx: 6 }, g);
        T(g, 10, y + RH / 2 + 2, p.t, { 'font-size': 17, 'font-weight': mine ? 700 : 400, fill: mine ? C.ink : C.muted });
        if (p.m == null) {
          S('rect', { x: X0, y: y + 6, width: 120, height: RH - 16, rx: 4, fill: 'none', stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, g);
        } else {
          S('rect', { x: X0, y: y + 6, width: Math.max(8, p.m * PX), height: RH - 16, rx: 4, fill: col }, g);
        }
        T(g, X0 + Math.max(p.m == null ? 120 : p.m * PX, 8) + 10, y + RH / 2 + 2, p.len, { 'font-size': 15, fill: C.soft });
        g.addEventListener('click', function () { cur = p.k; draw(); });
      });
      var p = TRAIN.filter(function (x) { return x.k === cur; })[0];
      if (!p) { card.innerHTML = '<p>No programme for this trade in the list.</p>'; return; }
      var mine = p.tr.indexOf(state.trade) >= 0;
      card.style.borderColor = mine ? tr.col : C.line;
      card.innerHTML = '<h4>' + p.t + (mine ? ' <span class="chip" style="background:' + tr.col + '">fits ' + tr.name.toLowerCase() + '</span>' : '') + '</h4>' +
        '<div class="fwgrid"><p><b>Run by</b>' + p.by + '</p><p><b>Where</b>' + p.where + '</p><p><b>What you learn</b>' + p.learn + '</p><p><b>Who it is for</b>' + p.who + '</p></div>' +
        '<p class="note"><b>How to join:</b> ' + p.how + ' Source: ' + p.src + '.</p>';
    }
    listeners.push(draw); draw();
  };

  /* ---------- 10. take-home message ---------- */
  var TAKE = [
    { h: 'Your certificate is a starting line', d: 'Not a finish line. Every level of the framework has a door above it.' },
    { h: 'There is more than one road up', d: 'TVET and university tracks run side by side, with bridges between them. Your skills from work count too.' },
    { h: 'Get your papers ready now', d: 'Certified copies of certificates and transcripts, and photos of your work. Admissions move fast.' },
    { h: 'Plan the money early', d: 'Save every month, look for a bursary or sponsor, and check whether your field qualifies for a student loan.' },
    { h: 'Keep learning, all your life', d: 'At work, in your trade body or SACCO, at workshops and fairs, and through UVTAB assessment. Classrooms are only one place to learn.' }
  ];
  VIZ.takehome = function (root) {
    var s = svg(1160, 440, root);
    var fills = ['#3d78cf', '#1f5fbf', '#174a96', '#1d7a4c', '#145c39'];
    var W = 228, steps = [];
    TAKE.forEach(function (t, i) {
      var x = i * (W + 5), h = 140 + i * 55, y = 436 - h;
      var g = S('g', { class: 'hit pop d' + (i + 1) }, s);
      var r = S('rect', { x: x, y: y, width: W, height: h, rx: 4, fill: fills[i], 'stroke-width': 5 }, g);
      T(g, x + 16, y + 44, String(i + 1), { 'font-size': 38, 'font-weight': 700, fill: '#fff', opacity: 0.55 });
      T(g, x + 16, y + 80, t.h, { 'font-size': 21, 'font-weight': 700, fill: '#fff' }, 17, 26);
      g.addEventListener('click', function () { show(i); });
      steps.push(r);
    });
    var who = S('g', { style: 'transition:transform .6s ease' }, s);
    person(who, 0, 0, C.money, 1.2);
    var card = H('div', 'card takecard', null, root);
    var next = H('p', 'plan', '', root);
    var cur = 0;
    function show(i) {
      cur = i;
      steps.forEach(function (r, j) { r.setAttribute('stroke', j === i ? C.ink : 'none'); });
      var x = i * (W + 5) + W - 30, y = 436 - (140 + i * 55);
      who.setAttribute('transform', 'translate(' + x + ',' + (y - 4) + ')');
      card.style.borderColor = fills[i];
      card.innerHTML = '<h4>' + TAKE[i].h + '</h4><p>' + TAKE[i].d + '</p>';
    }
    function upd() {
      var tr = TRADES[state.trade];
      next.style.borderColor = tr.col;
      next.innerHTML = '<b style="color:' + tr.col + '">Your next step in ' + tr.name.toLowerCase() + ':</b> ' +
        (STARTS[state.start].appr ? 'get your skills assessed and certified by UVTAB, then a ' : '') +
        tr.route.dip.toLowerCase() + ', at ' + tr.route.dipWhere + '. Then keep climbing.';
    }
    var tm = null;
    document.addEventListener('slideenter', function (e) {
      if (!e.target.contains(root)) return;
      clearInterval(tm); show(0);
      tm = setInterval(function () { if (cur >= TAKE.length - 1) { clearInterval(tm); return; } show(cur + 1); }, 1400);
    });
    root.addEventListener('click', function () { clearInterval(tm); });
    root._finish = function () { clearInterval(tm); show(TAKE.length - 1); };
    listeners.push(upd); upd(); show(0);
  };

  window.Viz = {
    renderAll: function (doc) {
      Array.prototype.slice.call(doc.querySelectorAll('[data-viz]')).forEach(function (el) {
        var f = VIZ[el.getAttribute('data-viz')];
        if (!f) return;
        try { f(el); } catch (e) { el.textContent = 'This visual could not be drawn.'; if (window.console) console.error(e); }
      });
    },
    finishAll: function () {
      Array.prototype.slice.call(document.querySelectorAll('[data-viz]')).forEach(function (el) { if (el._finish) el._finish(); });
    },
    isTradeAware: function (el) {
      return !!el.querySelector && Array.prototype.some.call(el.querySelectorAll('[data-viz]'), function (v) { return TRADE_AWARE.indexOf(v.getAttribute('data-viz')) >= 0; });
    },
    tradeSwitch: tradeSwitch,
    setTrade: setTrade,
    getTrade: function () { return state.trade; },
    onTrade: function (f) { listeners.push(f); },
    trades: function () { return ORDER.map(function (k) { return { k: k, name: TRADES[k].name }; }); },
    nextTrade: function () { setTrade(ORDER[(ORDER.indexOf(state.trade) + 1) % ORDER.length]); }
  };
})();
