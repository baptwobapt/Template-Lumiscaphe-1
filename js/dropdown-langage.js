const toggleBtn = document.getElementById("toggleView");
const visual = document.querySelector(".visual");
const catalog = document.querySelector(".catalog");
let expanded = false;

toggleBtn.addEventListener("click", () => {
    expanded = !expanded;

    // Cacher SVG
    visual.classList.toggle("hide-svg", expanded);

    // Changer l'affichage du catalogue
    catalog.classList.toggle("expanded", expanded);


    toggleBtn.querySelector("p").textContent = expanded ? "Voir Moins" : "Voir Tout";

    toggleBtn.querySelector("img").classList.toggle("rotated", expanded);

    document.querySelector(".filter").style.display = expanded ? "flex" : "none";
    document.querySelector(".description").style.display = expanded ? "none" : "flex";
    document.querySelector(".part-bottom").style.display = expanded ? "none" : "flex";
});



const DescriptionBtn = document.getElementById("descriptionView");
const rightpart = document.querySelector(".right-part");

let view_description = false;

DescriptionBtn.addEventListener("click", () => {
    // Inverser l'état
    view_description = !view_description;

    rightpart.classList.toggle("view_description", view_description);

    document.querySelector(".all-description").style.display = view_description ? "flex" : "none";
    document.querySelector(".description").style.display = view_description ? "none" : "";
    document.querySelector(".visual").style.display = view_description ? "none" : "";
    document.querySelector(".catalog").style.display = view_description ? "none" : "";
});














window.addEventListener('resize', () => {
  document.body.classList.add('no-transition');

  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.body.classList.remove('no-transition');
  }, 300); // attends 300ms après le redimensionnement pour réactiver les transitions
});