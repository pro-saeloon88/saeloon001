// script.js — robust single-click collapsibles with smooth full expand/collapse
document.addEventListener('DOMContentLoaded', () => {

  // helper: find the next element sibling that is the collapsible content
  function nextCollapsible(node) {
    let el = node.nextElementSibling;
    while (el && !el.classList.contains('collapsible-content')) el = el.nextElementSibling;
    return el || null;
  }

  // ensure a clean transitionend handler that only runs once per toggle
  function onTransitionEndOnce(el, cb) {
    function handler(e) {
      if (e.propertyName === 'max-height') {
        el.removeEventListener('transitionend', handler);
        cb && cb();
      }
    }
    el.addEventListener('transitionend', handler);
  }

  // initialize headings
  const headings = Array.from(document.querySelectorAll('.collapsible-heading'));
  headings.forEach(h => {
    h.setAttribute('role', 'button');
    h.tabIndex = 0;
    h.setAttribute('aria-expanded', 'false');

    const content = nextCollapsible(h);
    if (content) {
      // ensure collapsed initial state unless it has .open class
      content.style.overflow = 'hidden';
      if (content.classList.contains('open')) {
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.opacity = '1';
        h.classList.add('open');
        h.setAttribute('aria-expanded', 'true');
      } else {
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
        // keep display:block so scrollHeight measurements work consistently
        content.style.display = 'block';
      }
    }

    // click toggles
    h.addEventListener('click', (e) => {
      e.stopPropagation();
      const c = nextCollapsible(h);
      if (!c) return;

      const isOpening = !c.classList.contains('open');

      if (isOpening) {
        // Make visible for measurement
        c.style.display = 'block';
        // Remove any leftover 'none' so scrollHeight is accurate
        c.style.opacity = '0';

        // measure target
        const target = c.scrollHeight;

        // start the animation from current 0 -> target px
        // ensure we are starting from 0
        c.style.maxHeight = '0px';

        // force reflow then animate
        requestAnimationFrame(() => {
          c.classList.add('open');
          h.classList.add('open');
          h.setAttribute('aria-expanded', 'true');
          c.style.opacity = '1';
          c.style.transition = 'max-height 340ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease';
          c.style.maxHeight = target + 'px';
        });

        // after transition, clear maxHeight so content can resize naturally
        onTransitionEndOnce(c, () => {
          if (c.classList.contains('open')) {
            c.style.maxHeight = 'none'; // allow natural height growth
          }
        });

      } else {
        // closing: snap to current height then animate to 0
        // if maxHeight is 'none' make it current scrollHeight first
        if (c.style.maxHeight === 'none' || !c.style.maxHeight) {
          c.style.maxHeight = c.scrollHeight + 'px';
        }

        // force reflow then animate to 0
        requestAnimationFrame(() => {
          c.classList.remove('open');
          h.classList.remove('open');
          h.setAttribute('aria-expanded', 'false');
          c.style.transition = 'max-height 340ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease';
          c.style.maxHeight = '0px';
          c.style.opacity = '0';
        });

        // after it finishes collapsing, keep display:block but maxHeight 0 (so it can reopen smoothly)
        onTransitionEndOnce(c, () => {
          // keep display:block (so measurements work), maxHeight already 0, opacity 0
          // nothing else needed
        });
      }
    });

    // keyboard controls
    h.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        h.click();
      }
    });
  });

  // (Optional) If you build a TOC in script, keep it — not touched here.
});
