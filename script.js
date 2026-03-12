// script.js

document.addEventListener("DOMContentLoaded", function () {
  // ----- COLLAPSIBLES -----
  const headings = document.querySelectorAll(".collapsible-heading");

  headings.forEach((heading) => {
    // Start collapsed
    const content = heading.nextElementSibling;
    if (content) content.style.display = "none";

    // Click to toggle
    heading.style.cursor = "pointer";
    heading.addEventListener("click", () => {
      if (content.style.display === "none") {
        content.style.display = "block";
      } else {
        content.style.display = "none";
      }
    });
  });

  // ----- TOC -----
  const tocContainer = document.getElementById("toc");
  if (tocContainer) {
    const tocList = document.createElement("ul");
    headings.forEach((heading, index) => {
      const id = "section-" + index;
      heading.setAttribute("id", id);

      const li = document.createElement("li");
      li.style.cursor = "pointer";
      li.style.listStyle = "disc";
      li.style.marginBottom = "4px";

      const link = document.createElement("a");
      link.href = "#" + id;
      link.textContent = heading.textContent;
      link.style.textDecoration = "none";
      link.style.color = "inherit";

      li.appendChild(link);
      tocList.appendChild(li);
    });
    tocContainer.appendChild(tocList);
  }
});
