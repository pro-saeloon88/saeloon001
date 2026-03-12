// ==============================
// Saeloon Article Script
// Handles collapsible sections, TOC, and language switcher
// ==============================

document.addEventListener("DOMContentLoaded", function() {

  // ------------------------------
  // 1) Collapsible headings (H2/H3)
  // ------------------------------
  const headings = document.querySelectorAll('.collapsible-heading');

  headings.forEach(heading => {
    heading.addEventListener('click', function(e) {
      e.preventDefault();
      heading.classList.toggle('open');

      const content = heading.nextElementSibling;
      if(content && content.classList.contains('collapsible-content')) {
        content.classList.toggle('open');

        // Use scrollHeight recursively for nested content
        const updateHeight = (el) => {
          el.style.maxHeight = null; // reset
          if(el.classList.contains('open')) {
            el.style.maxHeight = el.scrollHeight + "px";
          }
          // recursively update nested collapsibles
          const nested = el.querySelectorAll('.collapsible-content.open');
          nested.forEach(n => {
            n.style.maxHeight = n.scrollHeight + "px";
          });
        };
        updateHeight(content);
      }
    });
  });

  // Recalculate heights when images load inside collapsibles
  const collapsibleImages = document.querySelectorAll('.collapsible-content img');
  collapsibleImages.forEach(img => {
    img.addEventListener('load', () => {
      document.querySelectorAll('.collapsible-content.open').forEach(openContent => {
        openContent.style.maxHeight = openContent.scrollHeight + "px";
      });
    });
  });

  // ------------------------------
  // 2) Build Table of Contents
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

      // Adjust position to prevent overflow
      const rect = langList.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      if(rect.right > viewportWidth - 10) {
        langList.style.left = 'auto';
        langList.style.right = '0';
      }
    });
  }

  // ------------------------------
  // 4) Prevent scroll to top for #
  // ------------------------------
  document.addEventListener("click", function(e) {
    const link = e.target.closest("a");
    if (!link) return;
    if (link.getAttribute("href") === "#") e.preventDefault();
  });

  // ------------------------------
  // 5) Close language menu if click outside
  // ------------------------------
  document.addEventListener('click', function(e) {
    if(langList && !langList.contains(e.target) && e.target !== langButton) {
      langList.classList.add('hidden');
      langList.style.left = ''; // reset
      langList.style.right = '';
    }
  });

  // ------------------------------
  // 6) Adjust all open collapsibles on window resize
  // ------------------------------
  window.addEventListener('resize', () => {
    document.querySelectorAll('.collapsible-content.open').forEach(openContent => {
      openContent.style.maxHeight = openContent.scrollHeight + "px";
    });
  });

});
