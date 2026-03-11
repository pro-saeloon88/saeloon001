// script.js — robust single-click collapsibles, TOC builder, and language switcher
document.addEventListener('DOMContentLoaded', function() {

  // Prevent links like "#" from jumping to top
document.querySelectorAll('a[href="#"]').forEach(link=>{
  link.addEventListener('click',e=>e.preventDefault());
});

  // ---------- Collapsibles ----------
  function nextCollapsible(el) {
    let n = el.nextElementSibling;
    while (n && !n.classList.contains('collapsible-content')) n = n.nextElementSibling;
    return n || null;
  }

  function onTransitionEndOnce(el, propName, cb) {
    function handler(e) {
      if (!propName || e.propertyName === propName) {
        el.removeEventListener('transitionend', handler);
        cb && cb();
      }
    }
    el.addEventListener('transitionend', handler);
  }

  const headings = Array.from(document.querySelectorAll('.collapsible-heading'));
  headings.forEach(h => {
    h.setAttribute('role','button');
    h.tabIndex = 0;
    h.setAttribute('aria-expanded','false');

    const c = nextCollapsible(h);
    if (c) {
      c.style.display = 'block';
      c.style.overflow = 'hidden';
      if (c.classList.contains('open')) {
        c.style.maxHeight = c.scrollHeight + 'px';
        c.style.opacity = '1';
        h.classList.add('open');
        h.setAttribute('aria-expanded','true');
      } else {
        c.style.maxHeight = '0px';
        c.style.opacity = '0';
      }
    }

    h.addEventListener('click', function(e) {
      e.stopPropagation();
      const content = nextCollapsible(h);
      if (!content) return;
      const willOpen = !content.classList.contains('open');

      if (willOpen) {
        // prepare open
        content.style.display = 'block';
        // ensure start from 0
        content.style.maxHeight = '0px';
        // force reflow
        content.getBoundingClientRect();
        content.classList.add('open');
        h.classList.add('open');
        h.setAttribute('aria-expanded','true');
        content.style.opacity = '1';
        content.style.transition = 'max-height 360ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease';
        content.style.maxHeight = content.scrollHeight + 'px';

        onTransitionEndOnce(content, 'max-height', () => {
          // allow natural height after open
          if (content.classList.contains('open')) content.style.maxHeight = 'none';
        });

      } else {
        // closing
        // set current height so transition can run
        if (content.style.maxHeight === 'none' || !content.style.maxHeight) {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
        // force reflow
        content.getBoundingClientRect();
        content.classList.remove('open');
        h.classList.remove('open');
        h.setAttribute('aria-expanded','false');
        content.style.transition = 'max-height 360ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease';
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
        onTransitionEndOnce(content, 'max-height', () => {
          // keep display:block to allow measurements next time
        });
      }
    });

    h.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); h.click();
      }
    });
  });

  // ---------- TOC builder ----------
  const tocEl = document.getElementById('toc');
  if (tocEl) {
    const headers = Array.from(document.querySelectorAll('.article-content h2'));
    if (headers.length) {
      const title = document.createElement('h2'); title.textContent = 'Contents';
      tocEl.appendChild(title);
      const ol = document.createElement('ol');
      headers.forEach((h, i) => {
        if (!h.id) h.id = 'section-' + i;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        a.addEventListener('click', function(ev) {
          ev.preventDefault();
          document.querySelector('#' + h.id).scrollIntoView({behavior:'smooth', block:'start'});
        });
        li.appendChild(a);
        ol.appendChild(li);
      });
      tocEl.appendChild(ol);
    }
  }

  // ---------- language switcher ----------
  const switcher = document.getElementById('lang-switcher');
  const dropdown = document.getElementById('lang-dropdown');
  if (switcher && dropdown) {
    function openDropdown() {
      dropdown.classList.remove('hidden');
      switcher.setAttribute('aria-expanded','true');
    }
    function closeDropdown() {
      dropdown.classList.add('hidden');
      switcher.setAttribute('aria-expanded','false');
    }
    // click toggles
    switcher.addEventListener('click', function(e) {
      const open = !dropdown.classList.contains('hidden');
      if (open) closeDropdown(); else openDropdown();
    });
    // close on outside click
    document.addEventListener('click', function(e) {
      if (!switcher.contains(e.target) && !dropdown.contains(e.target)) closeDropdown();
    });
    // keyboard
    switcher.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeDropdown();
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const open = !dropdown.classList.contains('hidden');
        if (open) closeDropdown(); else openDropdown();
      }
    });
  }

});

// ---------- optional safety: reposition language dropdown if it would overflow ----------
(function () {
  // try common IDs used in our HTML
  const btn = document.getElementById('lang-button') || document.getElementById('lang-switcher');
  const list = document.getElementById('lang-list') || document.getElementById('lang-dropdown');
  if (!btn || !list) return; // nothing to do if elements missing

  function clampDropdown() {
    // reset inline style anchors
    list.style.left = '';
    list.style.right = '';
    list.style.maxWidth = '';

    const listRect = list.getBoundingClientRect();
    const pad = 8; // margin from viewport edge in px

    // if left side is off-screen
    if (listRect.left < pad) {
      list.style.left = pad + 'px';
      list.style.right = 'auto';
    }

    // if right side is off-screen
    if (listRect.right > (window.innerWidth - pad)) {
      list.style.right = pad + 'px';
      list.style.left = 'auto';
      const maxW = window.innerWidth - (pad * 2);
      list.style.maxWidth = maxW + 'px';
    }
  }

  // observe 'class' changes (to detect open/close via .hidden)
  const obs = new MutationObserver(() => {
    if (!list.classList.contains('hidden')) {
      // wait a frame so CSS/layout is updated, then clamp
      requestAnimationFrame(clampDropdown);
    }
  });
  obs.observe(list, { attributes: true, attributeFilter: ['class'] });

  // also clamp on resize if dropdown is open
  window.addEventListener('resize', () => {
    if (!list.classList.contains('hidden')) clampDropdown();
  });
})();

// language icon button behavior (add this inside DOMContentLoaded or at end of file)
(function() {
  const btn = document.getElementById('lang-button');
  const list = document.getElementById('lang-list');
  if (!btn || !list) return;

  // toggle dropdown
  function openList() {
    list.classList.remove('hidden');
    btn.setAttribute('aria-expanded','true');
    // focus first link for keyboard users
    const first = list.querySelector('a');
    if (first) first.focus();
  }
  function closeList() {
    list.classList.add('hidden');
    btn.setAttribute('aria-expanded','false');
    btn.focus();
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (list.classList.contains('hidden')) openList(); else closeList();
  });

  // click a language -> navigate
  list.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    // let normal navigation occur; if you need SPA behavior, use location.href = a.href
  });

  // close when clicking outside
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !list.contains(e.target)) closeList();
  });

  // keyboard support
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openList(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); openList(); }
  });
  list.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeList(); }
  });
})();
