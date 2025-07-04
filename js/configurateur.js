// ========================================
// GESTION DES BOUTONS DE NAVIGATION
// ========================================

/**
 * Initialise les boutons de navigation avec slider
 */
function initializeNavigationButtons() {
  const buttons = document.querySelectorAll(".pointView button");
  const slider = document.querySelector(".pointView .slider");
  
  if (!buttons.length || !slider) return;
  
  buttons.forEach((btn, index) => {
    btn.addEventListener("click", () => handleButtonClick(btn, index, buttons, slider));
  });
}

function handleButtonClick(clickedButton, index, allButtons, slider) {
  allButtons.forEach(btn => btn.classList.remove("active"));
  clickedButton.classList.add("active");
  slider.style.transform = `translateX(${index * 100}%)`;
}

// ========================================
// SYSTÈME DE LAYOUT DES BRIQUES
// ========================================

const LAYOUT_CONFIG = {
  columnGapVW: 1,
  rowGapVW: 1.5,
  totalCols: 100
};

function layoutBricks() {
  const container = document.querySelector('.brick-container');
  if (!container) return;
  
  const bricks = Array.from(container.querySelectorAll('.brick'));
  const { columnGapPixels, rowGapPixels } = calculateGaps();
  const containerWidth = container.clientWidth;
  const cols = new Array(LAYOUT_CONFIG.totalCols).fill(0);

  bricks.forEach(brick => {
    const brickData = extractBrickData(brick);
    const position = findBestPosition(brickData.widthPercent, cols, brickData.isAutoWidth);
    
    applyBrickStyles(brick, position, brickData, containerWidth, columnGapPixels);
    updateColumnsHeight(cols, position, brickData, rowGapPixels);
  });

  container.style.height = `${Math.max(...cols)}px`;
}

function calculateGaps() {
  return {
    columnGapPixels: (LAYOUT_CONFIG.columnGapVW * window.innerWidth) / 100,
    rowGapPixels: (LAYOUT_CONFIG.rowGapVW * window.innerWidth) / 100
  };
}

function extractBrickData(brick) {
  const wValue = brick.style.getPropertyValue('--w');
  const widthPercent = wValue === 'auto' ? calculateAutoWidth(brick) : parseInt(wValue);
  const isOpen = brick.classList.contains('open');
  const hValue = brick.style.getPropertyValue('--h');
  
  let height;
  if (hValue === 'auto') {
    height = calculateAutoHeight(brick);
  } else {
    const numericVW = parseFloat(hValue);
    height = isOpen ? (numericVW * window.innerWidth) / 100 : (3.5 * window.innerWidth) / 100;
  }
  
  return { 
    widthPercent, 
    isOpen, 
    height, 
    isAutoWidth: wValue === 'auto', 
    isAutoHeight: hValue === 'auto' 
  };
}

function findBestPosition(brickColsCount, cols, isAutoWidth = false) {
  let bestX = 0;
  let minY = Infinity;

  for (let x = 0; x <= LAYOUT_CONFIG.totalCols - brickColsCount; x++) {
    const segmentMaxY = Math.max(...cols.slice(x, x + brickColsCount));
    
    if (segmentMaxY < minY) {
      minY = segmentMaxY;
      bestX = x;
      if (isAutoWidth) break;
    }
  }

  return { bestX, minY };
}

function applyBrickStyles(brick, position, brickData, containerWidth, columnGapPixels) {
  const pixelLeft = (position.bestX / 100) * containerWidth + (position.bestX * columnGapPixels / 100);
  
  brick.style.left = `${pixelLeft}px`;
  brick.style.top = `${position.minY}px`;
  
  if (brickData.isAutoWidth) {
    brick.style.width = 'auto';
    brick.style.maxWidth = `calc(${100 - position.bestX}% - ${LAYOUT_CONFIG.columnGapVW}vw)`;
  } else {
    const widthCorrection = brickData.widthPercent < 100 ? LAYOUT_CONFIG.columnGapVW : 0;
    brick.style.width = `calc(${brickData.widthPercent}% - ${widthCorrection}vw)`;
  }
  
  if (!brickData.isAutoHeight) {
    brick.style.height = `${brickData.height}px`;
  }
}

function updateColumnsHeight(cols, position, brickData, rowGapPixels) {
  for (let i = position.bestX; i < position.bestX + brickData.widthPercent; i++) {
    cols[i] = position.minY + brickData.height + rowGapPixels;
  }
}

function calculateAutoWidth(brick) {
  const tempDiv = brick.cloneNode(true);
  tempDiv.style.position = 'absolute';
  tempDiv.style.visibility = 'hidden';
  tempDiv.style.width = 'auto';
  document.body.appendChild(tempDiv);
  
  const naturalWidth = tempDiv.offsetWidth;
  const containerWidth = document.querySelector('.brick-container').clientWidth;
  const percentWidth = Math.min(100, Math.max(20, (naturalWidth / containerWidth) * 100));
  
  document.body.removeChild(tempDiv);
  return Math.ceil(percentWidth / 5) * 5;
}

function calculateAutoHeight(brick) {
  if (!brick.classList.contains('open')) {
    return (3.5 * window.innerWidth) / 100;
  }
  
  const tempDiv = brick.cloneNode(true);
  tempDiv.style.position = 'absolute';
  tempDiv.style.visibility = 'hidden';
  tempDiv.style.width = brick.offsetWidth + 'px';
  tempDiv.style.height = 'auto';
  tempDiv.classList.add('open');
  document.body.appendChild(tempDiv);
  
  const naturalHeight = tempDiv.offsetHeight;
  document.body.removeChild(tempDiv);
  
  const hValue = brick.style.getPropertyValue('--h');
  if (hValue && hValue !== 'auto') {
    const vwValue = parseFloat(hValue);
    return (vwValue * window.innerWidth) / 100;
  }
  
  return Math.max((3.5 * window.innerWidth) / 100, naturalHeight);
}

// ========================================
// GESTION DES GRILLES DE COULEURS
// ========================================

function setupColorGrids() {
  document.querySelectorAll('.color-grid').forEach(grid => {
    const config = {
      presentation: grid.dataset.presentation || "basic",
      cols: grid.dataset.cols === "auto" ? "auto" : parseInt(grid.dataset.cols) || 4,
      rows: grid.dataset.rows === "auto" ? "auto" : parseInt(grid.dataset.rows) || "auto",
      fillDirection: grid.dataset.fillDirection || 'cols'
    };
    
    if (config.presentation === "carousel") {
      initBrickCarousel(grid, config, false);
    } else if (config.presentation === "scroll") {
      setupScrollGrid(grid, config); // Nouvelle fonction pour gérer le scroll
    } else {
      applyGridLayout(grid, config);
    }
    
    setupGridItems(grid, config);
  });
}
function setupScrollGrid(grid, config) {
  const items = Array.from(grid.querySelectorAll('.color-item'));
  
  // Réinitialiser le style
  grid.innerHTML = '';
  grid.style.display = 'flex';
  grid.style.flexDirection = 'column';
  grid.style.flexWrap = 'nowrap';
  grid.style.overflowX = 'auto';
  

  
  // Créer les lignes
  for (let row = 0; row < config.rows; row++) {
    const rowContainer = document.createElement('div');
    rowContainer.style.display = 'flex';
    rowContainer.style.gap = '1vw';
    // Ajouter les éléments selon fill-direction
    if (config.fillDirection === 'rows') {
      const itemsPerRow = Math.ceil(items.length / config.rows);
      const startIdx = row * itemsPerRow;
      const endIdx = Math.min(startIdx + itemsPerRow, items.length);
      
      for (let i = startIdx; i < endIdx; i++) {
        rowContainer.appendChild(items[i].cloneNode(true));
      }
    } else {
      for (let col = 0; col < Math.ceil(items.length / config.rows); col++) {
        const idx = col * config.rows + row;
        if (idx < items.length) {
          rowContainer.appendChild(items[idx].cloneNode(true));
        }
      }
    }
    
    grid.appendChild(rowContainer);
  }
  
  // Masquer les flèches pour le mode scroll
  const prevBtn = grid.parentElement.querySelector('.prev');
  const nextBtn = grid.parentElement.querySelector('.next');
  if (prevBtn && nextBtn) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  }
  
  // Forcer le scroll à revenir au début
  setTimeout(() => {
    grid.scrollLeft = 0;
  }, 10);
}

function initBrickCarousel(grid, config, isScroll) {
  const items = Array.from(grid.querySelectorAll('.color-item'));
  const itemsPerSlide = config.rows * config.cols;
  const prevBtn = grid.parentElement.querySelector('.prev');
  const nextBtn = grid.parentElement.querySelector('.next');
  
  grid.innerHTML = '';
  const track = document.createElement('div');
  track.className = 'brick-carousel-track';
  
  if (isScroll) {
    track.classList.add('scrollable');
    track.style.setProperty('--scroll-rows', config.rows);
    grid.classList.add('scroll-container');
  }
  
  grid.appendChild(track);

  createCarouselSlides(track, items, config, itemsPerSlide);
  applyCarouselStyles(grid, track, config.rows, config.cols, isScroll, config.fillDirection);
  
  if (items.length > itemsPerSlide && !isScroll) {
    setupCarouselNavigation(grid, track, items.length, itemsPerSlide, prevBtn, nextBtn);
  } else if (prevBtn && nextBtn) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  }
}





function applyGridLayout(grid, config) {
  const items = grid.querySelectorAll('.color-item');
  const itemCount = items.length;
  const containerWidth = grid.clientWidth;
  const itemWidth = 3; // 3vw
  const gap = 1; // 1vw
  const fillByRows = config.fillDirection === 'rows';

  // Reset styles
  grid.style.display = 'grid';
  grid.style.gap = gap + 'vw';
  grid.style.gridAutoFlow = '';
  grid.style.gridTemplateColumns = '';
  grid.style.gridTemplateRows = '';

  // 1. Mode auto-auto - Remplissage dynamique par ligne
  if (config.cols === "auto" && config.rows === "auto") {
    // Calcul du nombre max d'éléments par ligne
    const maxItemsPerRow = Math.max(1, Math.floor(
      (containerWidth + gap) / (itemWidth + gap)
    ));
    
    grid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${itemWidth}vw, 1fr))`;
    grid.style.gridAutoRows = `${itemWidth}vw`;
    return;
  }

  // 2. Colonnes auto, lignes fixes
  if (config.cols === "auto") {
    const colsNeeded = Math.ceil(itemCount / config.rows);
    grid.style.gridTemplateColumns = `repeat(${colsNeeded}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${config.rows}, 1fr)`;
  }
  // 3. Lignes auto, colonnes fixes
  else if (config.rows === "auto") {
    const rowsNeeded = Math.ceil(itemCount / config.cols);
    grid.style.gridTemplateRows = `repeat(${rowsNeeded}, 1fr)`;
    grid.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
  }
  // 4. Dimensions fixes
  else {
    grid.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${config.rows}, 1fr)`;
  }

  // Réorganisation physique pour fill-direction cols
  if (!fillByRows && !(config.cols === "auto" && config.rows === "auto")) {
    const itemsArray = Array.from(items);
    grid.innerHTML = '';
    
    const cols = config.cols === "auto" ? 
      Math.ceil(itemCount / config.rows) : config.cols;
    const rows = config.rows === "auto" ? 
      Math.ceil(itemCount / config.cols) : config.rows;
    
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const index = col * rows + row;
        if (index < itemsArray.length) {
          grid.appendChild(itemsArray[index].cloneNode(true));
        }
      }
    }
  }
}

function createCarouselSlides(track, items, config, itemsPerSlide) {
  const totalSlides = Math.ceil(items.length / itemsPerSlide);

  for (let slideIndex = 0; slideIndex < totalSlides; slideIndex++) {
    const slide = document.createElement('div');
    slide.className = 'brick-carousel-slide';
    
    const startIdx = slideIndex * itemsPerSlide;
    const slideItems = items.slice(startIdx, startIdx + itemsPerSlide);
    
    organizeItemsInSlide(slide, slideItems, config);
    track.appendChild(slide);
  }
}

















function organizeItemsInSlide(slide, items, config) {
  const fillByRows = config.fillDirection === 'rows';
  const cols = parseInt(config.cols) || 4;
  const rows = parseInt(config.rows) || 2;
  const totalItems = cols * rows;
  
  // Créer une grille temporaire pour organiser les éléments
  const tempGrid = document.createElement('div');
  tempGrid.style.display = 'grid';
  tempGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  tempGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  tempGrid.style.width = '0';
  tempGrid.style.height = '0';
  tempGrid.style.visibility = 'hidden';
  tempGrid.style.position = 'absolute';
  
  // Ajouter les éléments dans l'ordre logique
  for (let i = 0; i < totalItems; i++) {
    if (i < items.length) {
      const itemContainer = createItemContainer(items[i]);
      
      // Calculer la position selon fill-direction
      let row, col;
      if (fillByRows) {
        row = Math.floor(i / cols);
        col = i % cols;
      } else {
        col = Math.floor(i / rows);
        row = i % rows;
      }
      
      itemContainer.style.gridColumn = col + 1;
      itemContainer.style.gridRow = row + 1;
      tempGrid.appendChild(itemContainer);
    }
  }
  
  // Transférer les éléments organisés dans la slide réelle
  while (tempGrid.firstChild) {
    slide.appendChild(tempGrid.firstChild);
  }
}

function createItemContainer(item) {
  const clonedItem = item.cloneNode(true);
  const itemContainer = document.createElement('div');
  itemContainer.className = 'brick-carousel-item-container';
  itemContainer.appendChild(clonedItem);
  return itemContainer;
}
function applyCarouselStyles(grid, track, rows, cols, isScroll, fillDirection = 'cols') {
  const slides = track.querySelectorAll('.brick-carousel-slide');
  
  if (isScroll) {
    grid.style.overflowX = 'auto';
    grid.style.overflowY = 'hidden';
    grid.style.scrollSnapType = 'x mandatory';
    
    track.style.display = 'grid';
    track.style.gridTemplateColumns = `repeat(auto-fill, 100%)`;
    track.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  }
  
  slides.forEach(slide => {
    slide.style.display = 'grid';
    if (fillDirection === 'rows') {
      slide.style.gridAutoFlow = 'row';
    }
    slide.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    slide.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  });
}


function setupCarouselNavigation(grid, track, totalItems, itemsPerSlide, prevBtn, nextBtn) {
  if (!prevBtn || !nextBtn) return;
  
  const slides = track.querySelectorAll('.brick-carousel-slide');
  let currentSlide = 0;
  
  function updateCarousel() {
    track.style.transform = `translateX(calc(-${currentSlide * 120}% ))`;
    prevBtn.classList.toggle('disabled', currentSlide === 0);
    nextBtn.classList.toggle('disabled', currentSlide >= slides.length - 1);
  }

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentSlide > 0) {
      currentSlide--;
      updateCarousel();
    }
  });
  
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      updateCarousel();
    }
  });
  
  updateCarousel();
}
function setupGridItems(grid) {
  const colorGroup = grid.closest('.color-group');
  const groupPriceElement = colorGroup.querySelector('.color-group-price');
  const brickContent = grid.closest('.brick-content');
  const defaultSelectedName = brickContent.dataset.selected;
  
  // Créer un conteneur global pour les tooltips
  let tooltipContainer = document.getElementById('tooltip-container');
  if (!tooltipContainer) {
    tooltipContainer = document.createElement('div');
    tooltipContainer.id = 'tooltip-container';
    document.body.appendChild(tooltipContainer);
  }
  
  // Vérifier si le contenu est du texte brut
  const isStaticText = groupPriceElement.textContent.trim() !== '' && 
                      !groupPriceElement.textContent.trim().match(/^\d+€?$/);
  
  let selectedItem = null;
  const items = grid.querySelectorAll('.color-item');

  // Trouver l'item sélectionné par défaut
  if (defaultSelectedName) {
    selectedItem = Array.from(items).find(item => item.dataset.name === defaultSelectedName);
    if (selectedItem && !isStaticText) {
      groupPriceElement.textContent = selectedItem.dataset.price;
    }
  }

  items.forEach(item => {
    const originalTooltip = item.querySelector('.item-tooltip');
    const colorName = item.dataset.name;
    const colorPrice = item.dataset.price;

    // Supprimer l'ancien tooltip
    if (originalTooltip) {
      originalTooltip.remove();
    }

    // Créer un nouveau tooltip dans le conteneur global
    const tooltip = document.createElement('div');
    tooltip.className = 'global-tooltip';
    
    tooltip.innerHTML = `
      <div class="item-name">${colorName}</div>
      <div class="item-price">${colorPrice}</div>
    `;
    
    tooltipContainer.appendChild(tooltip);

    // Sélection initiale
    if (item === selectedItem) {
      item.classList.add('selected');
    }

    // Fonction pour positionner le tooltip
    function positionTooltip() {
      const rect = item.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.top = `${rect.top - 10}px`;
      tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
    }

    // Gestion hover avec timer
    let hoverTimer;
    item.addEventListener('mouseenter', () => {
      hoverTimer = setTimeout(() => {
        positionTooltip();
        tooltip.style.opacity = '1';
      }, 500);
    });

    item.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
      tooltip.style.opacity = '0';
    });

    // Gestion clic
    item.addEventListener('click', () => {
      // Désélectionner tous les items dans ce brick-content
      brickContent.querySelectorAll('.color-item').forEach(i => {
        i.classList.remove('selected');
      });

      // Sélectionner le nouvel item
      item.classList.add('selected');
      selectedItem = item;

      // Mettre à jour le prix seulement si pas de texte statique
      if (!isStaticText) {
        groupPriceElement.textContent = colorPrice;
      }
    });
  });

  // Si aucun item sélectionné et pas de texte statique, vider le prix
  if (!selectedItem && !isStaticText) {
    groupPriceElement.textContent = '';
  }
}

// Initialisation
document.querySelectorAll('.color-grid').forEach(grid => {
  setupGridItems(grid, {
    cols: grid.dataset.cols,
    rows: grid.dataset.rows,
    selected: parseInt(grid.dataset.selected) || -1,
    carousel: grid.dataset.carousel === "true"
  });
});

function updatePlayerTitle(playerNumber, colorName, price) {
  const playerTitle = document.querySelector(`.brick-content[data-player="${playerNumber}"] h4`);
  if (playerTitle) {
    playerTitle.textContent = `Joueur ${playerNumber}: ${colorName} (${price})`;
  }
}








function organizeGridItems(grid, items, rows, cols, fillDirection) {
  grid.innerHTML = '';
  grid.style.display = 'flex';
  grid.style.flexDirection = 'column';
  grid.style.flexWrap = 'nowrap';
  grid.style.height = `${rows * 3.5}vw`; // 3.5vw par row

  // Création des lignes
  for (let r = 0; r < rows; r++) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '1vw';
    
    // Remplissage selon la direction
    if (fillDirection === 'rows') {
      const startIdx = r * cols;
      const endIdx = Math.min(startIdx + cols, items.length);
      for (let i = startIdx; i < endIdx; i++) {
        row.appendChild(items[i].cloneNode(true));
      }
    } else { // fillDirection === 'cols'
      for (let c = 0; c < cols; c++) {
        const idx = c * rows + r;
        if (idx < items.length) {
          row.appendChild(items[idx].cloneNode(true));
        }
      }
    }
    
    grid.appendChild(row);
  }
}





function setupPerfectDragScroll() {
  document.querySelectorAll('.color-grid[data-presentation="scroll"]').forEach(grid => {
    let isDragging = false;
    let startX;
    let startScrollLeft;
    let animationId;
    let lastX;
    let velocity = 0;
    let lastTime;
    let deltaX = 0;
    let lastDeltaTime = 0;

    // Animation d'inertie améliorée
    const inertiaAnimation = (time) => {
      if (!lastTime) lastTime = time;
      const deltaTime = Math.min(time - lastTime, 100);
      lastTime = time;

      // Ajout d'un seuil minimal pour arrêter
      if (Math.abs(velocity) < 0.3 || deltaTime > 100) {
        velocity = 0;
        return;
      }

      // Appliquer la vélocité avec frottement
      const friction = 0.92 - Math.min(Math.abs(velocity) * 0.005, 0.2);
      grid.scrollLeft += velocity * (deltaTime / 16);
      velocity *= friction;

      animationId = requestAnimationFrame(inertiaAnimation);
    };

    const startDrag = (clientX) => {
      isDragging = true;
      grid.style.cursor = 'grabbing';
      startX = clientX;
      startScrollLeft = grid.scrollLeft;
      lastX = clientX;
      velocity = 0;
      deltaX = 0;
      lastDeltaTime = 0;
      cancelAnimationFrame(animationId);
    };

    const moveDrag = (clientX) => {
      if (!isDragging) return;
      
      const now = performance.now();
      deltaX = clientX - lastX;
      lastX = clientX;

      // Calcul de vélocité plus précis
      if (lastDeltaTime > 0) {
        velocity = deltaX / (now - lastDeltaTime) * 16;
      }
      lastDeltaTime = now;

      grid.scrollLeft = startScrollLeft - (clientX - startX);
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      grid.style.cursor = '';

      // Seuil de vélocité minimum avant inertie
      if (Math.abs(velocity) > 1) {
        animationId = requestAnimationFrame(inertiaAnimation);
      } else {
        velocity = 0;
      }
    };

    // Événements Souris
    grid.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startDrag(e.clientX);
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      moveDrag(e.clientX);
    });

    document.addEventListener('mouseup', endDrag);

    // Événements Tactile
    grid.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrag(e.touches[0].clientX);
    });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      moveDrag(e.touches[0].clientX);
    }, { passive: false });

    document.addEventListener('touchend', endDrag);
  });
}
// ========================================
// GESTION DES ÉVÉNEMENTS
// ========================================

function setupArrowClickEvents() {
  document.addEventListener('click', (e) => {
    const arrowIcon = e.target.closest('.arrow-icon');
    if (arrowIcon) {
      const brick = arrowIcon.closest('.brick');
      brick.classList.toggle('open');
      layoutBricks();
      e.stopPropagation();
    }
  });
}

function handleWindowResize() {
  setTimeout(() => {
    layoutBricks();
    setupColorGrids();
  }, 100);
}

// ========================================
// INITIALISATION PRINCIPALE
// ========================================

function initializeApp() {
  initializeNavigationButtons();
  layoutBricks();
  setupColorGrids();
  setupArrowClickEvents();
  setupPerfectDragScroll(); // Ajoutez cette ligne
  
  window.addEventListener('load', layoutBricks);
  window.addEventListener('resize', handleWindowResize);
}

document.addEventListener('DOMContentLoaded', initializeApp);