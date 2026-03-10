document.addEventListener('DOMContentLoaded', function() {
  const headings = document.querySelectorAll('.collapsible-heading');

  headings.forEach(heading => {
    heading.addEventListener('click', function() {
      heading.classList.toggle('active');

      // Find the next sibling that has class "collapsible-content"
      let content = heading.nextElementSibling;
      while(content && !content.classList.contains('collapsible-content')) {
        content = content.nextElementSibling;
      }

      if(content) {
        content.style.display = (content.style.display === 'block') ? 'none' : 'block';
      }
    });
  });
});
