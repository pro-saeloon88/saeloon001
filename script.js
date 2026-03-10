document.addEventListener("DOMContentLoaded", function() {
    const headings = document.querySelectorAll(".collapsible-heading");
    headings.forEach(h => {
        h.addEventListener("click", function() {
            this.classList.toggle("active");
            const content = this.nextElementSibling;
            if(content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    });
});
// Auto Table of Contents

document.addEventListener("DOMContentLoaded", function () {

const toc = document.getElementById("toc");
if (!toc) return;

const headings = document.querySelectorAll(".article-content h2");

let list = document.createElement("ol");

headings.forEach((heading, i) => {

let id = "section-" + i;
heading.id = id;

let li = document.createElement("li");
let a = document.createElement("a");

a.href = "#" + id;
a.textContent = heading.textContent;

li.appendChild(a);
list.appendChild(li);

});

let title = document.createElement("h2");
title.textContent = "Contents";

toc.appendChild(title);
toc.appendChild(list);

});
