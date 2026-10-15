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

  /* ---------- search ---------- */
  var idx = [];
  function buildIndex() {
    idx = [];
    document.querySelectorAll('main details.sec').forEach(function (d) {
      if (d.id === 'editor') return;
      var h = d.querySelector('summary h2');
      var txt = Array.prototype.map.call(d.children, function (c) { return c.tagName === 'SUMMARY' ? '' : c.textContent; }).join(' ').replace(/\s+/g, ' ').trim();
      idx.push({ id: d.id, title: h ? h.textContent : '', text: txt, local: d.id.indexOf('local-') === 0 });
    });
    var h1 = document.querySelector('main h1');
    if (h1) idx.unshift({ id: 'main', title: h1.textContent, text: (h1.nextElementSibling || {}).textContent || '' });
  }
  function norm(s) { return s.toLowerCase().replace(/[\u064B-\u065F\u0670]/g, ''); }
  var q = $('q'), res = $('results'), sel = -1;
  function snippet(text, term) {
    var i = norm(text).indexOf(term); if (i < 0) return text.slice(0, 90);
    var a = Math.max(0, i - 30); return (a ? '…' : '') + text.slice(a, a + 100);
  }
  function search() {
    var term = norm(q.value.trim()); res.textContent = ''; sel = -1;
    if (!term) { res.hidden = true; return; }
    var hits = idx.map(function (e) {
      var inT = norm(e.title).indexOf(term) > -1, inX = norm(e.text).indexOf(term) > -1;
      return (inT || inX) ? { e: e, score: inT ? 2 : 1 } : null;
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score; });
    if (!hits.length) res.appendChild(el('li', { 'class': 'none', text: S.nomatch }));
    hits.forEach(function (h) {
      var a = el('a', { href: '#' + h.e.id }, [el('strong', { text: h.e.title + (h.e.local ? ' (' + S.local + ')' : '') }), el('span', { text: snippet(h.e.text, term) })]);
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

  var toc = $('toc');
  if (toc && window.matchMedia && window.matchMedia('(min-width: 721px)').matches) toc.open = true;

  buildEditor();
  openHash();
})();
