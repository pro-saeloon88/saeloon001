// ==============================
// Saeloon Article Script
// Handles collapsible sections, TOC, and language switcher
// ==============================

document.addEventListener("DOMContentLoaded", function() {

  // ------------------------------
  // 1) Collapsible headings
  // ------------------------------
  const headings = document.querySelectorAll('.collapsible-heading');

  headings.forEach(heading => {
    heading.addEventListener('click', function(e) {
      e.preventDefault(); // prevent any default link jump
      heading.classList.toggle('open'); // toggle class for CSS arrow

      const content = heading.nextElementSibling;
      if(content && content.classList.contains('collapsible-content')) {
        content.classList.toggle('open'); // toggle the open class
        if(content.classList.contains('open')) {
          content.style.maxHeight = content.scrollHeight + "px";
        } else {
          content.style.maxHeight = null;
        }
      }
    });
  });

  // ------------------------------
  // 2) Build Table of Contents (TOC)
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
  const langButton = document.querySelector('.lang-switcher');
  if(langButton) {
    const menu = document.querySelector('.lang-dropdown'); // use correct class from CSS
    langButton.addEventListener('click', function(e) {
      e.stopPropagation(); // prevent document click
      if(menu) {
        menu.classList.toggle('hidden'); // toggle hidden class
      }
    });
  }

});

// ------------------------------
// 4) Prevent page scroll to top on empty links
// ------------------------------
document.addEventListener("click", function(e) {
  const link = e.target.closest("a");
  if (!link) return;
  if (link.getAttribute("href") === "#") {
    e.preventDefault();
  }
});

// ------------------------------
// 5) Close language menu if click outside
// ------------------------------
document.addEventListener('click', function(e) {
  const menus = document.querySelectorAll('.lang-dropdown');
  menus.forEach(menu => {
    if (!menu.classList.contains('hidden') && !menu.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });
});
