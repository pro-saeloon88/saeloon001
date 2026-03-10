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
