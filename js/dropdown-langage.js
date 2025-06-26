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
    catalog.style.scrollBehavior = "auto";

    const selectedCard = document.querySelector(".card.selected");
    if (!expanded && selectedCard) {
        selectedCard.scrollIntoView({
            inline: "center",
            block: "nearest"
        });
    }

    // Réactiver le scroll smooth (optionnel)
    setTimeout(() => {
        catalog.style.scrollBehavior = "smooth";
    }, 0);


    toggleBtn.querySelector("p").textContent = expanded ? "Voir Moins" : "Voir Tout";

    toggleBtn.querySelector("img").classList.toggle("rotated", expanded);

    document.querySelector(".filter").style.display = expanded ? "flex" : "none";
    document.querySelector(".description").style.display = expanded ? "none" : "flex";
    document.querySelector(".part-bottom").style.display = expanded ? "none" : "flex";
    document.querySelector(".expandBtn").style.display = expanded ? "none" : "";
});













const descriptionBtns = [
    document.getElementById("descriptionView"),
    document.getElementById("descriptionView2")
];
const configureBtn = document.querySelector(".configureBtn");
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














// Ajouter l’événement à chaque bouton info
descriptionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        view_description = true;
        updateDescriptionView();
    });
});

// Gérer le clic sur le bouton "Configurer"
configureBtn.addEventListener("click", () => {
    if (view_description) {
        view_description = false;
        updateDescriptionView();
    }
});


const expandBtn = document.getElementById("expandBtn");
const leftpart = document.querySelector(".left-part");
let expand_visual = false;

expandBtn.addEventListener("click", () => {
    expand_visual = !expand_visual;

    leftpart.classList.toggle("expand-visual", expand_visual);

    document.querySelector(".filter").style.display = expand_visual ? "flex" : "none";
    document.querySelector(".right-part").style.display = expand_visual ? "none" : "";
    document.querySelector(".catalog").style.display = expand_visual ? "none" : "";
    document.querySelector(".shape-Models").style.display = expand_visual ? "none" : "";
    document.querySelector(".searchBox-more-models-container").style.display = expand_visual ? "none" : ""
});














const catalogCards = document.querySelectorAll(".catalog .card");

catalogCards.forEach(card => {
  card.addEventListener("click", () => {
    // Supprimer la sélection sur toutes les cartes
    catalogCards.forEach(c => c.classList.remove("selected"));
    
    // Ajouter la sélection sur celle cliquée
    card.classList.add("selected");
  });
});









document.addEventListener("DOMContentLoaded", function () {
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");
  const track = document.querySelector(".slider-track");
  const slides = document.querySelectorAll(".slide");

  const slidesPerPage = 4;
  const gapPercent = 4;
  const slideWidthPercent = 22;
  const fullSlidePercent = slideWidthPercent + gapPercent;
  const totalSlides = slides.length;

  let currentIndex = 0;

  function updateSlider() {
    const offset = currentIndex * fullSlidePercent;
    track.style.transform = `translateX(-${offset}%)`;
    updateButtons();
  }

  function updateButtons() {
    prevBtn.classList.toggle("disabled", currentIndex === 0);
    nextBtn.classList.toggle("disabled", currentIndex >= totalSlides - slidesPerPage);
  }

  nextBtn.addEventListener("click", () => {
    const slidesRemaining = totalSlides - currentIndex;
    const step = slidesRemaining > slidesPerPage ? slidesPerPage : slidesRemaining;
    currentIndex += step;
    if (currentIndex > totalSlides - slidesPerPage) {
      currentIndex = totalSlides - slidesPerPage;
      if (currentIndex < 0) currentIndex = 0;
    }
    updateSlider();
  });

  prevBtn.addEventListener("click", () => {
    currentIndex -= slidesPerPage;
    if (currentIndex < 0) currentIndex = 0;
    updateSlider();
  });

  // ➕ Gérer le clic sur les slides
  slides.forEach(slide => {
    slide.addEventListener("click", () => {
      // Retirer la classe "active" de toutes les slides
      slides.forEach(s => s.classList.remove("active"));
      // Ajouter la classe "active" à la slide cliquée
      slide.classList.add("active");
    });
  });
  if (slides.length <= slidesPerPage) {
    document.querySelector('.slider-container').style.justifyContent = 'flex-end';
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
    track.style.justifyContent = 'flex-end';
}

  // Initial
  updateSlider();
});





const carouselContainer = document.querySelector('.carousel-container');

const visualButtons = document.querySelectorAll('.visualBtn');
const btn2 = document.getElementById('visualBtn2');

// Par défaut, activer le bouton 1
document.getElementById('visualBtn1').classList.add('active');
carouselContainer.style.display = 'none'; // caché par défaut

visualButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Supprimer la classe active de tous les boutons
    visualButtons.forEach(b => b.classList.remove('active'));

    // Ajouter la classe active au bouton cliqué
    btn.classList.add('active');

    // Afficher ou cacher le carousel selon le bouton
    if (btn === btn2) {
      carouselContainer.style.display = 'block';
    } else {
      carouselContainer.style.display = 'none';
    }
  });
});
