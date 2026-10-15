(function () {
  'use strict';
  var AR = document.documentElement.lang === 'ar';
  var KEY = 'saeloon.articles.v1';
  var S = AR ? {
    title: 'العنوان', body: 'نص المقالة', save: 'حفظ', clear: 'جديد', newart: 'مقالة جديدة',
    saved: 'تم الحفظ في هذا المتصفح فقط.', empty: 'أدخل العنوان والنص.', edit: 'تحرير', del: 'حذف',
    confDel: 'حذف هذه المقالة المحلية نهائياً؟', exp: 'تصدير JSON', imp: 'استيراد JSON',
    notice: 'تنبيه: الحفظ المحلي يبقى في هذا المتصفح وهذا الجهاز فقط. لا يغيّر الموقع المنشور ولا يظهر للزوار الآخرين.',
    list: 'المقالات المحفوظة محلياً', none: 'لا توجد مقالات محفوظة محلياً.', nomatch: 'لا توجد نتائج مطابقة.',
    badjson: 'ملف غير صالح. لم يتم تغيير شيء.', confImp: 'سيتم دمج المقالات المستوردة مع المحفوظة (نفس المعرّف يُستبدل). متابعة؟',
    imported: 'تم استيراد المقالات: ', local: 'محلي', storeErr: 'تعذر الحفظ (التخزين غير متاح أو ممتلئ).', cancel: 'إلغاء التحرير'
  } : {
    title: 'Title', body: 'Article text', save: 'Save', clear: 'New', newart: 'New article',
    saved: 'Saved in this browser only.', empty: 'Enter both a title and text.', edit: 'Edit', del: 'Delete',
    confDel: 'Permanently delete this local article?', exp: 'Export JSON', imp: 'Import JSON',
    notice: 'Note: local saving stays in this browser on this device only. It does not update the public website and other visitors will not see it.',
    list: 'Locally saved articles', none: 'No locally saved articles.', nomatch: 'No matches found.',
    badjson: 'Invalid file. Nothing was changed.', confImp: 'Imported articles will be merged with saved ones (same id is replaced). Continue?',
    imported: 'Articles imported: ', local: 'local', storeErr: 'Could not save (storage unavailable or full).', cancel: 'Cancel edit'
  };

  function $(id) { return document.getElementById(id); }
  function el(tag, props, kids) {
    var e = document.createElement(tag), k;
    for (k in (props || {})) { if (k === 'text') e.textContent = props[k]; else e.setAttribute(k, props[k]); }
    (kids || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }

  /* ---------- reading settings: theme and text size (every page with a header) ---------- */
  var VKEY = 'saeloon.view.v1', STEPS = [0.9, 1, 1.1, 1.25, 1.4], THEMES = ['light', 'sepia', 'dark'];
  var V = { theme: 'light', fs: 1 };
  try {
    var sv = JSON.parse(localStorage.getItem(VKEY) || '{}');
    if (THEMES.indexOf(sv.theme) > -1) V.theme = sv.theme;
    if (STEPS.indexOf(sv.fs) > -1) V.fs = sv.fs;
  } catch (e) { /* storage unavailable: defaults */ }
  function applyView() {
    var r = document.documentElement;
    r.setAttribute('data-theme', V.theme);
    r.style.setProperty('--fs', V.fs);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', { light: '#ffffff', sepia: '#f4ecd8', dark: '#101418' }[V.theme]);
  }
  function saveView() { try { localStorage.setItem(VKEY, JSON.stringify(V)); } catch (e) { /* ignore */ } }
  applyView();
  (function () {
    var nav = document.querySelector('.bar nav'); if (!nav) return;
    var R = AR ? { title: 'إعدادات القراءة', theme: 'المظهر', light: 'فاتح', sepia: 'سيبيا', dark: 'داكن', size: 'حجم النص', smaller: 'نص أصغر', larger: 'نص أكبر', reset: 'إعادة الضبط' }
               : { title: 'Reading settings', theme: 'Theme', light: 'Light', sepia: 'Sepia', dark: 'Dark', size: 'Text size', smaller: 'Smaller text', larger: 'Larger text', reset: 'Reset' };
    var bar = nav.parentNode;
    var btn = el('button', { type: 'button', 'class': 'aa', id: 'aa', 'aria-expanded': 'false', 'aria-controls': 'rs', 'aria-label': R.title, text: 'Aa' });
    var panel = el('div', { id: 'rs', 'class': 'rs', role: 'group', 'aria-label': R.title, hidden: '' });
    var tb = THEMES.map(function (t) {
      var b = el('button', { type: 'button', 'class': 'chip', text: R[t] });
      b.onclick = function () { V.theme = t; applyView(); saveView(); sync(); };
      return b;
    });
    var minus = el('button', { type: 'button', 'class': 'chip', 'aria-label': R.smaller, text: 'A\u2212' });
    var plus = el('button', { type: 'button', 'class': 'chip', 'aria-label': R.larger, text: 'A+' });
    var pct = el('span', { 'class': 'pct', 'aria-live': 'polite' });
    var reset = el('button', { type: 'button', 'class': 'chip', text: R.reset });
    function step(d) { var i = STEPS.indexOf(V.fs) + d; if (i < 0 || i >= STEPS.length) return; V.fs = STEPS[i]; applyView(); saveView(); sync(); }
    minus.onclick = function () { step(-1); }; plus.onclick = function () { step(1); };
    reset.onclick = function () { V.theme = 'light'; V.fs = 1; applyView(); saveView(); sync(); };
    function sync() {
      tb.forEach(function (b, i) { b.setAttribute('aria-pressed', THEMES[i] === V.theme ? 'true' : 'false'); });
      pct.textContent = Math.round(V.fs * 100) + '%';
      minus.disabled = V.fs === STEPS[0]; plus.disabled = V.fs === STEPS[STEPS.length - 1];
    }
    panel.appendChild(el('div', { 'class': 'rs-l', text: R.theme }));
    panel.appendChild(el('div', { 'class': 'rs-row' }, tb));
    panel.appendChild(el('div', { 'class': 'rs-l', text: R.size }));
    panel.appendChild(el('div', { 'class': 'rs-row' }, [minus, pct, plus, reset]));
    bar.appendChild(panel); nav.insertBefore(btn, nav.firstChild); sync();
    function closeP() { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    btn.onclick = function () { var o = panel.hidden; panel.hidden = !o; btn.setAttribute('aria-expanded', o ? 'true' : 'false'); };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { closeP(); btn.focus(); } });
    document.addEventListener('click', function (e) { if (!panel.hidden && !e.target.closest('#rs') && e.target !== btn) closeP(); });
  })();
  if (!$('q')) return; /* the home page has no article, search or editor */

  /* ---------- language switch keeps the hash ---------- */
  var sw = $('langsw');
  function fixSwitch() { if (sw) sw.href = document.body.getAttribute('data-other') + location.hash; }
  fixSwitch(); window.addEventListener('hashchange', fixSwitch);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.toc a');
    if (a) { var d = document.querySelector(a.getAttribute('href')); if (d && d.tagName === 'DETAILS') d.open = true; }
  });

  /* ---------- collapse controls ---------- */
  function setAll(v) { document.querySelectorAll('details.sec').forEach(function (d) { d.open = v; }); }
  if ($('expand')) $('expand').onclick = function () { setAll(true); };
  if ($('collapse')) $('collapse').onclick = function () { setAll(false); };
  function openHash() {
    var id = location.hash.slice(1); if (!id) return;
    var t = document.getElementById(decodeURIComponent(id)); if (!t) return;
    var d = t.closest('details'); if (d) d.open = true;
    t.scrollIntoView(); t.classList.add('target'); setTimeout(function () { t.classList.remove('target'); }, 1700);
  }
  window.addEventListener('hashchange', openHash);

  /* ---------- media fallbacks ---------- */
  var f1 = $('flag'), f2 = $('flag2');
  if (f1) f1.addEventListener('error', function () { f1.hidden = true; $('flagfb').hidden = false; });
  if (f2) f2.addEventListener('error', function () { f2.parentNode.hidden = true; });
  document.querySelectorAll('.gallery img').forEach(function (im) { im.addEventListener('error', function () { im.hidden = true; im.nextElementSibling.hidden = false; }); });
  function brokenNow(img, fn) { if (img && img.complete && img.naturalWidth === 0) fn(); }
  brokenNow(f1, function () { f1.hidden = true; $('flagfb').hidden = false; });
  brokenNow(f2, function () { f2.parentNode.hidden = true; });
  document.querySelectorAll('.gallery img').forEach(function (im) { brokenNow(im, function () { im.hidden = true; im.nextElementSibling.hidden = false; }); });
  var au = $('anthem');
  function audioFail() { au.hidden = true; $('audfb').hidden = false; }
  if (au) { au.addEventListener('error', audioFail); var s = au.querySelector('source'); if (s) s.addEventListener('error', audioFail); }

  /* ---------- storage ---------- */
  function load() {
    try {
      var a = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(a) ? a.filter(valid) : [];
    } catch (e) { return []; }
  }
  function valid(a) { return a && typeof a.id === 'string' && typeof a.title === 'string' && typeof a.body === 'string' && a.id && a.title.trim() && a.body.trim(); }
  function store(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); return true; } catch (e) { return false; } }
  function uid() { return 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---------- render local articles (textContent only: no HTML injection) ---------- */
  function renderArticles() {
    var box = $('local-articles'); box.textContent = '';
    load().forEach(function (a) {
      var d = el('details', { 'class': 'sec', id: 'local-' + a.id, open: '' });
      d.appendChild(el('summary', {}, [el('h2', { text: a.title })]));
      a.body.split(/\n\s*\n/).forEach(function (p) { if (p.trim()) d.appendChild(el('p', { text: p.trim() })); });
      box.appendChild(d);
    });
    buildIndex();
  }

  /* ---------- editor ---------- */
  var editing = null;
  function buildEditor() {
    var root = $('editor-root');
    root.appendChild(el('p', { 'class': 'warn', text: S.notice }));
    var form = el('form', { 'class': 'ed', novalidate: '' });
    form.appendChild(el('label', { 'for': 'ed-title', text: S.title }));
    form.appendChild(el('input', { id: 'ed-title', type: 'text', maxlength: '200' }));
    form.appendChild(el('label', { 'for': 'ed-body', text: S.body }));
    form.appendChild(el('textarea', { id: 'ed-body' }));
    var row = el('div', { 'class': 'tools' }, [
      el('button', { type: 'submit', text: S.save }),
      el('button', { type: 'button', id: 'ed-new', text: S.clear })
    ]);
    form.appendChild(row);
    form.appendChild(el('div', { id: 'saved', role: 'status', 'aria-live': 'polite' }));
    form.appendChild(el('div', { id: 'err', role: 'alert' }));
    root.appendChild(form);
    root.appendChild(el('h3', { text: S.list }));
    root.appendChild(el('ul', { 'class': 'local', id: 'ed-list' }));
    var tools = el('div', { 'class': 'tools' }, [
      el('button', { type: 'button', id: 'ed-exp', text: S.exp }),
      el('button', { type: 'button', id: 'ed-imp', text: S.imp }),
      el('input', { type: 'file', id: 'ed-file', accept: 'application/json,.json', hidden: '' })
    ]);
    root.appendChild(tools);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = $('ed-title').value.trim(), b = $('ed-body').value.trim();
      $('saved').textContent = ''; $('err').textContent = '';
      if (!t || !b) { $('err').textContent = S.empty; return; }
      var arr = load(), i;
      if (editing && (i = arr.findIndex(function (x) { return x.id === editing; })) > -1) { arr[i].title = t; arr[i].body = b; arr[i].updated = Date.now(); }
      else arr.push({ id: uid(), title: t, body: b, updated: Date.now() });
      if (!store(arr)) { $('err').textContent = S.storeErr; return; }
      resetForm(); $('saved').textContent = S.saved; refresh();
    });
    $('ed-new').onclick = function () { resetForm(); $('saved').textContent = ''; $('err').textContent = ''; };
    $('ed-exp').onclick = function () {
      var blob = new Blob([JSON.stringify({ app: 'saeloon', version: 1, articles: load() }, null, 2)], { type: 'application/json' });
      var a = el('a', { href: URL.createObjectURL(blob), download: 'saeloon-articles.json' });
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    };
    $('ed-imp').onclick = function () { $('ed-file').click(); };
    $('ed-file').addEventListener('change', function (e) {
      var file = e.target.files[0]; e.target.value = ''; if (!file) return;
      var r = new FileReader();
      r.onload = function () {
        $('saved').textContent = ''; $('err').textContent = '';
        var data;
        try { data = JSON.parse(r.result); } catch (x) { $('err').textContent = S.badjson; return; }
        var list = Array.isArray(data) ? data : (data && Array.isArray(data.articles) ? data.articles : null);
        if (!list) { $('err').textContent = S.badjson; return; }
        var ok = list.filter(valid).map(function (a) { return { id: a.id.slice(0, 40), title: a.title.slice(0, 200), body: a.body, updated: Date.now() }; });
        if (!ok.length) { $('err').textContent = S.badjson; return; }
        if (!confirm(S.confImp)) return;
        var cur = load();
        ok.forEach(function (n) { var i = cur.findIndex(function (x) { return x.id === n.id; }); if (i > -1) cur[i] = n; else cur.push(n); });
        if (!store(cur)) { $('err').textContent = S.storeErr; return; }
        $('saved').textContent = S.imported + ok.length; refresh();
      };
      r.onerror = function () { $('err').textContent = S.badjson; };
      r.readAsText(file);
    });
    refresh();
  }
  function resetForm() { editing = null; $('ed-title').value = ''; $('ed-body').value = ''; }
  function refresh() { renderList(); renderArticles(); }
  function renderList() {
    var ul = $('ed-list'); ul.textContent = ''; var arr = load();
    if (!arr.length) { ul.appendChild(el('li', { text: S.none })); return; }
    arr.forEach(function (a) {
      var li = el('li', {}, [
        el('a', { 'class': 't', href: '#local-' + a.id, text: a.title }),
        el('button', { type: 'button', text: S.edit }),
        el('button', { type: 'button', 'class': 'danger', text: S.del })
      ]);
      var bs = li.querySelectorAll('button');
      bs[0].onclick = function () { editing = a.id; $('ed-title').value = a.title; $('ed-body').value = a.body; $('saved').textContent = ''; $('ed-title').focus(); };
      bs[1].onclick = function () {
        if (!confirm(S.confDel)) return;
        store(load().filter(function (x) { return x.id !== a.id; }));
        if (editing === a.id) resetForm(); refresh();
      };
      ul.appendChild(li);
    });
  }

  /* ---------- subsection anchors ---------- */
  var T = AR ? { count: function (n) { return 'عدد النتائج: ' + n; }, related: 'أقسام ذات صلة:', gal: 'عارض الصور', open: 'فتح الصورة', close: 'إغلاق', prev: 'الصورة السابقة', next: 'الصورة التالية' }
             : { count: function (n) { return n + (n === 1 ? ' result' : ' results'); }, related: 'Related sections:', gal: 'Image viewer', open: 'Open image', close: 'Close', prev: 'Previous image', next: 'Next image' };
  document.querySelectorAll('main details.sec').forEach(function (d) {
    var n = 0;
    d.querySelectorAll('h3').forEach(function (h) { if (!h.id) h.id = d.id + '-' + (++n); });
  });

  /* ---------- search ---------- */
  var idx = [];
  function nmap(s) { /* normalise Arabic letter variants and drop diacritics; keep a map back to the original text */
    var out = '', map = [], i, j, c;
    for (i = 0; i < s.length; i++) {
      c = s.charAt(i);
      if (/[\u064B-\u065F\u0670\u0640]/.test(c)) continue;
      c = c.toLowerCase();
      if ('أإآٱ'.indexOf(c) > -1) c = 'ا'; else if (c === 'ى') c = 'ي'; else if (c === 'ة') c = 'ه';
      for (j = 0; j < c.length; j++) { out += c.charAt(j); map.push(i); }
    }
    return { n: out, map: map };
  }
  function norm(s) { return nmap(s).n; }
  function txt(node) {
    var c = node.cloneNode(true);
    c.querySelectorAll('.fallback,.related,summary').forEach(function (x) { x.remove(); });
    return c.textContent.replace(/\s+/g, ' ').trim();
  }
  function buildIndex() {
    idx = [];
    var h1 = document.querySelector('main h1');
    if (h1) idx.push({ id: 'main', title: h1.textContent, sec: '', text: Array.prototype.map.call(document.querySelectorAll('main > .lead'), txt).join(' ') });
    document.querySelectorAll('main details.sec').forEach(function (d) {
      if (d.id === 'editor') return;
      var h = d.querySelector('summary h2'), title = h ? h.textContent : '';
      var cur = { sub: null, text: '' }, parts = [];
      Array.prototype.forEach.call(d.children, function (c) {
        if (c.tagName === 'SUMMARY' || c.classList.contains('related')) return;
        if (c.tagName === 'H3') { parts.push(cur); cur = { sub: c, text: '' }; } else cur.text += ' ' + txt(c);
      });
      parts.push(cur);
      idx.push({ id: d.id, title: title, sec: '', text: parts.map(function (p) { return (p.sub ? p.sub.textContent + ' ' : '') + p.text; }).join(' ').trim(), local: d.id.indexOf('local-') === 0 });
      parts.forEach(function (p) { if (p.sub) idx.push({ id: p.sub.id, title: p.sub.textContent, sec: title, text: p.text.trim() }); });
    });
  }
  var q = $('q'), res = $('results'), sel = -1;
  res.setAttribute('aria-live', 'polite');
  function snippet(text, toks) {
    var m = nmap(text), best = -1, ranges = [], start, end, i, k, from, p, s, node = document.createDocumentFragment();
    toks.forEach(function (t) { var x = m.n.indexOf(t); if (x > -1 && (best < 0 || x < best)) best = x; });
    start = best > -1 ? Math.max(0, m.map[best] - 35) : 0; end = Math.min(text.length, start + 110);
    toks.forEach(function (t) {
      from = 0;
      while ((i = m.n.indexOf(t, from)) > -1) {
        s = m.map[i]; k = m.map[i + t.length - 1] + 1;
        if (k > start && s < end) ranges.push([Math.max(s, start), Math.min(k, end)]);
        from = i + t.length;
      }
    });
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    p = start; if (start > 0) node.appendChild(document.createTextNode('\u2026'));
    ranges.forEach(function (r) {
      if (r[1] <= p) return;
      if (r[0] > p) node.appendChild(document.createTextNode(text.slice(p, r[0])));
      node.appendChild(el('mark', { text: text.slice(Math.max(r[0], p), r[1]) })); p = r[1];
    });
    node.appendChild(document.createTextNode(text.slice(p, end) + (end < text.length ? '\u2026' : '')));
    return node;
  }
  function search() {
    var raw = q.value.trim(), toks, hits = [];
    res.textContent = ''; sel = -1;
    if (!raw) { res.hidden = true; return; }
    toks = norm(raw).split(/\s+/).filter(Boolean);
    idx.forEach(function (e) {
      var nt = norm(e.title), nx = norm(e.text), score = 0, ok = true;
      toks.forEach(function (t) {
        var a = nt.indexOf(t) > -1, b = nx.indexOf(t) > -1;
        if (!a && !b) { ok = false; return; }
        score += a ? (e.sec ? 3 : 5) : 1; if (nt.indexOf(t) === 0) score += 1;
      });
      if (ok) hits.push({ e: e, score: score });
    });
    hits.sort(function (a, b) { return b.score - a.score; });
    if (!hits.length) { res.appendChild(el('li', { 'class': 'none', text: S.nomatch })); res.hidden = false; return; }
    res.appendChild(el('li', { 'class': 'count', text: T.count(hits.length) }));
    hits.slice(0, 12).forEach(function (h) {
      var e = h.e, sp = el('span');
      sp.appendChild(snippet(e.text, toks));
      var a = el('a', { href: '#' + e.id }, [el('strong', { text: (e.sec ? e.sec + ' \u203A ' : '') + e.title + (e.local ? ' (' + S.local + ')' : '') }), sp]);
      res.appendChild(el('li', {}, [a]));
    });
    res.hidden = false;
  }
  function links() { return res.querySelectorAll('a'); }
  function mark(n) {
    var l = links(); if (!l.length) return;
    sel = (n + l.length) % l.length;
    l.forEach(function (a, i) { a.classList.toggle('sel', i === sel); }); l[sel].scrollIntoView({ block: 'nearest' });
  }
  q.addEventListener('input', search);
  q.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); mark(sel + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); mark(sel - 1); }
    else if (e.key === 'Enter') { var l = links(); var t = l[sel > -1 ? sel : 0]; if (t) { e.preventDefault(); t.click(); } }
    else if (e.key === 'Escape') { q.value = ''; search(); }
  });
  res.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return;
    var id = a.getAttribute('href').slice(1); res.hidden = true;
    if (location.hash === '#' + id) { e.preventDefault(); openHash(); }
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.searchwrap')) res.hidden = true; });

  /* ---------- related sections (computed from shared uncommon words; nothing is hand-written) ---------- */
  (function () {
    var skip = { gallery: 1, references: 1, timeline: 1 };
    var secs = Array.prototype.filter.call(document.querySelectorAll('main details.sec'), function (d) { return d.id && d.id !== 'editor' && d.id.indexOf('local-') !== 0; });
    var core = secs.filter(function (d) { return !skip[d.id]; }), df = {}, toks = [];
    core.forEach(function (d, i) {
      var seen = {}; toks[i] = {};
      norm(txt(d)).split(/[^a-z0-9\u0600-\u06ff]+/).forEach(function (w) {
        if (w.length < 4 || /^\d+$/.test(w) || seen[w]) return;
        seen[w] = 1; toks[i][w] = 1; df[w] = (df[w] || 0) + 1;
      });
    });
    core.forEach(function (d, i) {
      var scored = [];
      core.forEach(function (o, j) {
        if (i === j) return;
        var n = 0, w; for (w in toks[i]) if (toks[j][w] && df[w] >= 2 && df[w] <= 3) n++;
        if (n >= 2) scored.push({ d: o, n: n, j: j });
      });
      scored.sort(function (a, b) { return b.n - a.n || a.j - b.j; });
      if (!scored.length) return;
      var p = el('p', { 'class': 'related' }, [el('strong', { text: T.related + ' ' })]);
      scored.slice(0, 3).forEach(function (s, k) {
        if (k) p.appendChild(document.createTextNode(' \u00B7 '));
        p.appendChild(el('a', { href: '#' + s.d.id, text: s.d.querySelector('summary h2').textContent }));
      });
      d.appendChild(p);
    });
  })();

  /* ---------- timeline year filter ---------- */
  var tlf = document.querySelector('.tl-filter');
  if (tlf) tlf.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var y = b.getAttribute('data-year');
    tlf.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    document.querySelectorAll('.timeline li').forEach(function (li) {
      li.hidden = y !== 'all' && (' ' + li.getAttribute('data-year') + ' ').indexOf(' ' + y + ' ') < 0;
    });
  });

  /* ---------- gallery viewer ---------- */
  (function () {
    var imgs = Array.prototype.slice.call(document.querySelectorAll('.gallery img')); if (!imgs.length) return;
    var im = el('img', { alt: '' }), cap = el('figcaption'), x = el('button', { type: 'button', text: T.close, 'aria-label': T.close });
    var pv = el('button', { type: 'button', text: AR ? '\u203A' : '\u2039', 'aria-label': T.prev }), nx = el('button', { type: 'button', text: AR ? '\u2039' : '\u203A', 'aria-label': T.next });
    var box = el('div', { id: 'lb', 'class': 'lb', role: 'dialog', 'aria-modal': 'true', 'aria-label': T.gal, hidden: '' }, [el('figure', {}, [im, cap]), el('div', { 'class': 'lbbar' }, [pv, x, nx])]);
    document.body.appendChild(box);
    var cur = 0, last = null;
    function vis() { return imgs.filter(function (i) { return !i.hidden; }); }
    function show(i) {
      var v = vis(); if (!v.length) return; cur = (i + v.length) % v.length;
      im.src = v[cur].currentSrc || v[cur].src; im.alt = v[cur].alt;
      var f = v[cur].closest('figure').querySelector('figcaption'); cap.textContent = f ? f.textContent : '';
    }
    function open(t) { last = t; box.hidden = false; document.body.classList.add('noscroll'); show(vis().indexOf(t)); x.focus(); }
    function close() { box.hidden = true; document.body.classList.remove('noscroll'); if (last) last.focus(); }
    function dirStep(k) { show(cur + (AR ? -k : k)); }
    imgs.forEach(function (t) {
      t.tabIndex = 0; t.setAttribute('role', 'button'); t.setAttribute('aria-label', T.open + ': ' + t.alt);
      t.addEventListener('click', function () { open(t); });
      t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(t); } });
    });
    x.onclick = close; pv.onclick = function () { show(cur - 1); }; nx.onclick = function () { show(cur + 1); };
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') dirStep(-1);
      else if (e.key === 'ArrowRight') dirStep(1);
      else if (e.key === 'Tab') {
        var f = [pv, x, nx];
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[2].focus(); }
        else if (!e.shiftKey && document.activeElement === f[2]) { e.preventDefault(); f[0].focus(); }
      }
    });
  })();

  var toc = $('toc');
  if (toc && window.matchMedia && window.matchMedia('(min-width: 721px)').matches) toc.open = true;

  buildEditor();
  openHash();
})();
