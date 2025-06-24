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
const configureBtn = document.querySelector(".configure");
const rightpart = document.querySelector(".right-part");

let view_description = false;

function updateDescriptionView() {
    rightpart.classList.toggle("view_description", view_description);

    configureBtn.querySelector("h6").textContent = view_description ? "Retour" : "Configurer";

    document.querySelector(".all-description").style.display = view_description ? "flex" : "none";
    document.querySelector(".description").style.display = view_description ? "none" : "";
    document.querySelector(".visual").style.display = view_description ? "none" : "";
    document.querySelector(".catalog").style.display = view_description ? "none" : "";
    document.querySelector(".little-visual").style.display = view_description ? "flex" : "none";
}

// Afficher la description quand on clique sur le bouton info
DescriptionBtn.addEventListener("click", () => {
    view_description = true;
    updateDescriptionView();
});

// Si on est en mode description, le bouton "configurer" sert à quitter ce mode
configureBtn.addEventListener("click", () => {
    if (view_description) {
        view_description = false;
        updateDescriptionView();
    }
});









window.addEventListener('resize', () => {
  document.body.classList.add('no-transition');

  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.body.classList.remove('no-transition');
  }, 300); // attends 300ms après le redimensionnement pour réactiver les transitions
});