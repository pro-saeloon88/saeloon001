document.addEventListener("DOMContentLoaded", function() {

  // ------------------------------
  // Collapsible headings (H2/H3)
  // ------------------------------
  const headings = document.querySelectorAll('.collapsible-heading');

  function getFullHeight(el) {
    // calculate full height including nested open collapsibles
    let total = el.scrollHeight;
    const nested = el.querySelectorAll('.collapsible-content.open');
    nested.forEach(n => {
      total += n.scrollHeight;
    });
    return total;
  }

  headings.forEach(heading => {
    heading.addEventListener('click', function(e) {
      e.preventDefault();
      heading.classList.toggle('open');

      const content = heading.nextElementSibling;
      if(content && content.classList.contains('collapsible-content')) {
        content.classList.toggle('open');

        if(content.classList.contains('open')) {
          content.style.maxHeight = getFullHeight(content) + "px";
        } else {
          content.style.maxHeight = "0px";
        }
      }
    });
  });

  // adjust heights after images load
  const imgs = document.querySelectorAll('.collapsible-content img');
  imgs.forEach(img => {
    img.addEventListener('load', () => {
      document.querySelectorAll('.collapsible-content.open').forEach(c => {
        c.style.maxHeight = getFullHeight(c) + "px";
      });
    });
  });

  // ------------------------------
  // Build Table of Contents
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
  // Language switcher
  // ------------------------------
  const langButton = document.getElementById('lang-button');
  const langList = document.getElementById('lang-list');

  if(langButton && langList) {
    langButton.addEventListener('click', function(e) {
      e.stopPropagation();
      langList.classList.toggle('hidden');
    });
  }

  // close language dropdown if clicked outside
  document.addEventListener('click', function(e) {
    if(langList && !langList.contains(e.target) && e.target !== langButton) {
      langList.classList.add('hidden');
    }
  });

  // ------------------------------
  // Prevent # links from jumping
  // ------------------------------
  document.addEventListener("click", function(e) {
    const link = e.target.closest("a");
    if (!link) return;
    if (link.getAttribute("href") === "#") e.preventDefault();
  });

  // ------------------------------
  // Adjust open collapsibles on resize
  // ------------------------------
  window.addEventListener('resize', () => {
    document.querySelectorAll('.collapsible-content.open').forEach(c => {
      c.style.maxHeight = getFullHeight(c) + "px";
    });
  });

});
