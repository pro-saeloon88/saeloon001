// ==============================
// Saeloon Article Script – Ultimate Fix
// Handles nested collapsibles, TOC, and language switcher
// ==============================

document.addEventListener("DOMContentLoaded", function() {

  // ------------------------------
  // 1) Collapsible headings (H2/H3)
  // ------------------------------
  const headings = document.querySelectorAll('.collapsible-heading');

  headings.forEach(heading => {
    const content = heading.nextElementSibling;

    if(content && content.classList.contains('collapsible-content')) {
      content.style.display = 'none';
    }

    heading.addEventListener('click', function(e) {
      e.preventDefault();
      heading.classList.toggle('open');

      if(!content) return;

      if(content.style.display === 'none') {
        content.style.display = 'block';
        const fullHeight = content.scrollHeight;
        content.style.height = '0px';
        setTimeout(() => {
          content.style.transition = 'height 0.35s ease';
          content.style.height = fullHeight + 'px';
        }, 10);

        content.addEventListener('transitionend', function cleanup() {
          content.style.height = 'auto';
          content.removeEventListener('transitionend', cleanup);
        });

      } else {
        const fullHeight = content.scrollHeight;
        content.style.height = fullHeight + 'px';
        setTimeout(() => {
          content.style.transition = 'height 0.35s ease';
          content.style.height = '0px';
        }, 10);

        content.addEventListener('transitionend', function hide() {
          content.style.display = 'none';
          content.removeEventListener('transitionend', hide);
        });
      }
    });
  });

  // ------------------------------
  // 2) Build Table of Contents (H2/H3)
  // ------------------------------
  const tocContainer = document.getElementById('toc');
  if(tocContainer) {
    const tocList = document.createElement('ul');
    const articleHeadings = document.querySelectorAll('.article-content h2, .article-content h3');
    articleHeadings.forEach(h => {
      const id = h.textContent.trim().toLowerCase().replace(/\s+/g, '-');
      h.id = id;
      const li = document.createElement('li');
      li.style.marginLeft = h.tagName === 'H3' ? '20px' : '0';
      const a = document.createElement('a');
      a.href = `#${id}`;
      a.textContent = h.textContent;
      li.appendChild(a);
      tocList.appendChild(li);
    });
    tocContainer.appendChild(tocList);
  }

  // ------------------------------
  // 3) Language switcher
  // ------------------------------
  const langButton = document.getElementById('lang-button');
  const langList = document.getElementById('lang-list');

  if(langButton && langList) {
    langButton.addEventListener('click', function(e) {
      e.stopPropagation();
      langList.classList.toggle('hidden');
    });
  }

  // ------------------------------
  // 4) Close language menu if click outside
  // ------------------------------
  document.addEventListener('click', function(e) {
    if(langList && !langList.contains(e.target) && e.target !== langButton) {
      langList.classList.add('hidden');
    }
  });

  // ------------------------------
  // 5) Prevent page scroll to top for #
  // ------------------------------
  document.querySelectorAll('a[href="#"]').forEach(a => {
    a.addEventListener('click', e => e.preventDefault());
  });

});
