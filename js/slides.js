/* Slide engine: turns the page of section.sec blocks into 16:9 slides.
   Elements are moved, not copied, so every control keeps working.
   ?view=page shows the same content as one scrolling page. */
(function () {
  'use strict';
  var W = 1280, H = 720, BAR = 52;
  var params = new URLSearchParams(location.search);
  var pageMode = params.get('view') === 'page';
  var slides = [], cur = 0, stage, deck, bar, fitTimer = null;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    if (window.Viz) window.Viz.renderAll(document);
    if (window.Quiz) window.Quiz.init(document);
    if (pageMode) return buildPage();
    buildDeck();
  });

  /* trade menu, kept in step with every other trade control */
  function tradeSelect(cls) {
    var sel = el('select', cls);
    sel.title = 'Change the trade shown on the slides (T)';
    sel.setAttribute('aria-label', 'Trade');
    if (!window.Viz) return sel;
    window.Viz.trades().forEach(function (t) {
      var o = document.createElement('option');
      o.value = t.k; o.textContent = t.name;
      sel.appendChild(o);
    });
    sel.value = window.Viz.getTrade();
    sel.addEventListener('change', function () { window.Viz.setTrade(sel.value); sel.blur(); });
    window.Viz.onTrade(function () { sel.value = window.Viz.getTrade(); });
    return sel;
  }

  /* ---------- page view ---------- */
  function buildPage() {
    document.body.classList.add('page-mode');
    var pb = el('div', 'pagebar', '<b>Page view</b><a href="' + location.pathname + '">Back to slides</a><span class="tlab">Trade</span>');
    pb.appendChild(tradeSelect('tsel'));
    document.body.insertBefore(pb, document.body.firstChild);
  }

  /* ---------- deck ---------- */
  function newSlide(kicker, titleNode, sectionName, cls) {
    var s = el('section', 'slide' + (cls ? ' ' + cls : ''));
    var head = el('div', 'shead');
    if (kicker) head.appendChild(el('p', 'kick', kicker));
    if (titleNode) head.appendChild(titleNode);
    var body = el('div', 'sbody');
    var fit = el('div', 'fitbox');
    body.appendChild(fit);
    s.appendChild(head); s.appendChild(body);
    s._fit = fit; s._section = sectionName || ''; s._title = titleNode ? titleNode.textContent : '';
    slides.push(s);
    stage.appendChild(s);
    return s;
  }

  function buildDeck() {
    document.body.classList.add('deck-mode');
    deck = el('div'); deck.id = 'deck';
    stage = el('div', 'stage');
    deck.appendChild(stage);
    document.body.appendChild(deck);

    var doc = document.getElementById('doc');
    var cover = document.getElementById('cover');
    var secs = Array.prototype.slice.call(doc.querySelectorAll('section.sec'));

    /* title slide */
    var t = newSlide(null, null, 'Title', 'title');
    var grid = el('div', 'title-grid');
    var left = el('div');
    Array.prototype.slice.call(cover.children).forEach(function (c) {
      if (c.id === 'hero') return;
      left.appendChild(c);
    });
    var toc = el('ul', 'toc');
    left.appendChild(toc);
    grid.appendChild(left);
    var hero = document.getElementById('hero');
    if (hero) grid.appendChild(hero);
    t.querySelector('.sbody').replaceChild(grid, t._fit);
    t._fit = null;

    secs.forEach(function (sec) {
      var h2 = sec.querySelector('h2');
      var num = h2.querySelector('.n') ? h2.querySelector('.n').textContent.trim() : '';
      var name = h2.textContent.replace(num, '').trim();
      var kick = (num ? '<span class="n">' + num + '</span>' : '') + '<span>' + name + '</span>';
      var firstIndex = slides.length;
      var curSlide = null;

      var kids = Array.prototype.slice.call(sec.children);
      kids.forEach(function (node) {
        if (node === h2) return;
        if (node.tagName === 'H3') {
          curSlide = newSlide(kick, node, name);
          return;
        }
        if (node.classList && node.classList.contains('quiz')) {
          var qs = Array.prototype.slice.call(node.querySelectorAll('.q'));
          qs.forEach(function (q, i) {
            var tt = el('h3', null, 'Question ' + (i + 1) + ' of ' + qs.length);
            var s = newSlide(kick, tt, name);
            s._fit.appendChild(q);
          });
          curSlide = null;
          return;
        }
        if (node.classList && node.classList.contains('refs')) {
          var items = Array.prototype.slice.call(node.children);
          var parts = Math.ceil(items.length / 7), per = Math.ceil(items.length / parts);
          for (var p = 0; p < parts; p++) {
            var th = el('h3', null, 'References' + (parts > 1 ? ' (' + (p + 1) + ' of ' + parts + ')' : ''));
            var s2 = newSlide(kick, th, name);
            var ol = el('ol', 'refs');
            items.slice(p * per, p * per + per).forEach(function (li) { ol.appendChild(li); });
            s2._fit.appendChild(ol);
          }
          curSlide = null;
          return;
        }
        if (!curSlide) curSlide = newSlide(kick, el('h3', null, name), name);
        curSlide._fit.appendChild(node);
      });

      /* contents entry jumps to the first slide of the section */
      var li = el('li', null, (num ? '<b>' + num + '</b>' : '') + name);
      li.addEventListener('click', function () { go(firstIndex); });
      toc.appendChild(li);
    });

    if (window.Viz) slides.forEach(function (s) {
      if (s._fit && window.Viz.isTradeAware(s._fit)) {
        s.classList.add('tradeaware');
        s.querySelector('.shead').appendChild(window.Viz.tradeSwitch());
      }
    });

    buildBar();
    window.addEventListener('resize', function () { scaleStage(); });
    document.addEventListener('keydown', onKey);
    var m = /slide-(\d+)/.exec(location.hash);
    var start = m ? Math.min(slides.length - 1, Math.max(0, parseInt(m[1], 10) - 1)) : 0;
    scaleStage();
    fitAll();
    go(start, true);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
    setTimeout(fitAll, 400);

    var mo = new MutationObserver(function (list) {
      var touched = [];
      list.forEach(function (r) {
        var s = r.target.closest ? r.target.closest('.slide') : null;
        if (!s && r.target.parentElement) s = r.target.parentElement.closest('.slide');
        if (s && touched.indexOf(s) < 0) touched.push(s);
      });
      clearTimeout(fitTimer);
      fitTimer = setTimeout(function () { touched.forEach(fitSlide); }, 60);
    });
    mo.observe(stage, { childList: true, subtree: true, characterData: true });

    if (window.innerWidth < 700) {
      var tst = el('div', 'toast', '<span>On a phone, <a href="?view=page">Page view</a> is easier to read.</span><button aria-label="Close">x</button>');
      tst.querySelector('button').onclick = function () { tst.remove(); };
      document.body.appendChild(tst);
    }
  }

  /* ---------- fitting ---------- */
  function fitSlide(s) {
    var box = s._fit;
    if (!box) return;
    var body = box.parentNode;
    var aw = body.clientWidth, ah = body.clientHeight;
    if (!aw || !ah) return;
    var maxZ = parseFloat(s.getAttribute('data-maxzoom') || box.firstElementChild && box.firstElementChild.getAttribute('data-maxzoom') || '1.6');
    var z = maxZ, minZ = 0.45, ok = false;
    while (z >= minZ) {
      box.style.width = (aw / z) + 'px';
      box.style.transform = 'scale(' + z + ')';
      var h = box.offsetHeight * z;
      var w = box.scrollWidth * z;
      if (h <= ah + 0.5 && w <= aw + 1) { ok = true; break; }
      z = z * 0.97;
    }
    if (!ok) { z = minZ; box.style.width = (aw / z) + 'px'; box.style.transform = 'scale(' + z + ')'; }
    box.setAttribute('data-zoom', z.toFixed(3));
  }
  function fitAll() { slides.forEach(fitSlide); }

  function scaleStage() {
    var fs = document.documentElement.classList.contains('fsmode');
    var vw = window.innerWidth, vh = window.innerHeight - (fs ? 0 : BAR);
    var s = Math.min(vw / W, vh / H);
    var x = (vw - W * s) / 2, y = (vh - H * s) / 2;
    stage.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
  }

  /* ---------- navigation ---------- */
  function go(i, silent) {
    if (i < 0 || i >= slides.length) return;
    slides[cur].classList.remove('on');
    cur = i;
    var s = slides[cur];
    s.classList.add('on');
    fitSlide(s);
    s.dispatchEvent(new CustomEvent('slideenter', { bubbles: true }));
    bar.querySelector('.where').textContent = s._section + (s._title && s._title !== s._section ? ': ' + s._title : '');
    bar.querySelector('.count').textContent = (cur + 1) + ' / ' + slides.length;
    bar.querySelector('select.jump').value = String(cur);
    bar.querySelector('.prog').style.width = ((cur + 1) / slides.length * 100) + '%';
    if (!silent || cur) history.replaceState(null, '', '#slide-' + (cur + 1));
  }
  function next() { go(cur + 1); }
  function prev() { go(cur - 1); }

  function onKey(e) {
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && tag !== 'BUTTON')) { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { go(0); }
    else if (e.key === 'End') { go(slides.length - 1); }
    else if (e.key === 'f' || e.key === 'F') { toggleFs(); }
    else if ((e.key === 't' || e.key === 'T') && window.Viz) { window.Viz.nextTrade(); }
  }

  function buildBar() {
    bar = el('div', 'deckbar');
    bar.innerHTML =
      '<div class="prog"></div>' +
      '<button data-a="home" title="First slide">Home</button>' +
      '<span class="where"></span>' +
      '<select class="jump" title="Jump to a slide"></select>' +
      '<span class="tlab">Trade</span>' +
      '<button data-a="prev" title="Previous slide (Left arrow)">Previous</button>' +
      '<span class="count"></span>' +
      '<button data-a="next" class="main" title="Next slide (Right arrow or Space)">Next</button>' +
      '<button data-a="page" class="opt-w" title="Show everything as one page">Page view</button>' +
      '<button data-a="fs" title="Full screen (F)">Full screen</button>' +
      '<button data-a="pdf" class="opt-w" title="Save all slides as PDF">PDF</button>';
    var sel = bar.querySelector('select.jump');
    bar.insertBefore(tradeSelect('tsel'), sel.nextSibling.nextSibling);
    slides.forEach(function (s, i) {
      var o = document.createElement('option');
      o.value = String(i);
      o.textContent = (i + 1) + '. ' + (s._title || s._section);
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () { go(parseInt(sel.value, 10)); sel.blur(); });
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var a = b.getAttribute('data-a');
      if (a === 'home') go(0);
      else if (a === 'prev') prev();
      else if (a === 'next') next();
      else if (a === 'page') location.href = location.pathname + '?view=page';
      else if (a === 'fs') toggleFs();
      else if (a === 'pdf') exportPdf();
    });
    document.body.appendChild(bar);

    var idle = null;
    function wake(e) {
      var root = document.documentElement;
      if (!root.classList.contains('fsmode')) return;
      if (e && e.clientY < window.innerHeight - 90) {
        clearTimeout(idle);
        idle = setTimeout(function () { root.classList.add('barhid'); }, 2200);
        return;
      }
      root.classList.remove('barhid');
      clearTimeout(idle);
      idle = setTimeout(function () { root.classList.add('barhid'); }, 4000);
    }
    document.addEventListener('mousemove', wake);
    document.addEventListener('fullscreenchange', function () {
      var root = document.documentElement;
      root.classList.toggle('fsmode', !!document.fullscreenElement);
      root.classList.remove('barhid');
      if (document.fullscreenElement) idle = setTimeout(function () { root.classList.add('barhid'); }, 2500);
      setTimeout(function () { scaleStage(); fitAll(); }, 120);
    });
  }

  function toggleFs() {
    if (!document.fullscreenElement) {
      var r = document.documentElement.requestFullscreen;
      if (r) r.call(document.documentElement).catch(function () {});
    } else if (document.exitFullscreen) document.exitFullscreen();
  }

  function exportPdf() {
    var root = document.documentElement;
    root.classList.add('printing');
    slides.forEach(function (s) { s.classList.add('on'); });
    fitAll();
    if (window.Viz && window.Viz.finishAll) window.Viz.finishAll();
    setTimeout(function () {
      window.print();
    }, 250);
  }
  window.addEventListener('afterprint', function () {
    document.documentElement.classList.remove('printing');
    slides.forEach(function (s, i) { if (i !== cur) s.classList.remove('on'); });
  });

  window.Deck = { go: go, next: next, prev: prev, fitAll: fitAll, count: function () { return slides.length; }, current: function () { return cur; } };
})();
