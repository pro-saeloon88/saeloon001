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
        if(content.classList.contains('open')) {
          // calculate height including nested content
          let totalHeight = content.scrollHeight;
          // add any nested open collapsibles
          const nestedOpen = content.querySelectorAll('.collapsible-content.open');
          nestedOpen.forEach(nc => totalHeight += nc.scrollHeight);
          content.style.maxHeight = totalHeight + "px";
        } else {
          content.style.maxHeight = null;
        }
      }
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
  // 3) Language switcher button
  // ------------------------------
  const langButton = document.getElementById('lang-button');
  const langList = document.getElementById('lang-list');

  if(langButton && langList) {
    langButton.addEventListener('click', function(e) {
      e.stopPropagation();
      langList.classList.toggle('hidden');

      // Ensure dropdown fits inside viewport
      const rect = langList.getBoundingClientRect();
      const overflowX = rect.right - window.innerWidth;
      if (overflowX > 0) {
        langList.style.left = `-${overflowX + 5}px`;
      } else {
        langList.style.left = 'auto';
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
    }
  });

  // ------------------------------
  // 6) Ensure collapsible sections recalc on window resize
  // ------------------------------
  window.addEventListener('resize', () => {
    document.querySelectorAll('.collapsible-content.open').forEach(content => {
      content.style.maxHeight = content.scrollHeight + "px";
    });
  });

});
