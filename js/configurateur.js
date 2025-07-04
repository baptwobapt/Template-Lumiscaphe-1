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
      cols: grid.dataset.cols,
      rows: grid.dataset.rows,
      carousel: grid.dataset.carousel === "true",
      carouselRows: parseInt(grid.dataset.carouselRows) || 2,
      carouselCols: parseInt(grid.dataset.carouselCols) || 4,
      fillDirection: grid.dataset.fillDirection || 'cols',
      selected: parseInt(grid.dataset.selected) || 0
    };
    
    const tooltip = grid.parentElement.querySelector('.color-tooltip');
    
    if (config.carousel) {
      initBrickCarousel(grid, config);
    } else {
      applyGridLayout(grid, config);
    }
    
    setupGridItems(grid, config, tooltip);
  });
}

function applyGridLayout(grid, config) {
  if (config.cols === "auto" && config.rows !== "auto") {
    const itemsCount = grid.children.length;
    const calculatedCols = Math.ceil(itemsCount / config.rows);
    grid.style.gridTemplateRows = `repeat(${config.rows}, 1fr)`;
    grid.style.gridTemplateColumns = `repeat(${calculatedCols}, 1fr)`;
  } else if (config.rows === "auto" && config.cols !== "auto") {
    const itemsCount = grid.children.length;
    const calculatedRows = Math.ceil(itemsCount / config.cols);
    grid.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${calculatedRows}, 1fr)`;
  } else {
    grid.style.gridTemplateColumns = config.cols === "auto" ? 'auto' : `repeat(${config.cols}, 1fr)`;
    grid.style.gridTemplateRows = config.rows === "auto" ? 'auto' : `repeat(${config.rows}, 1fr)`;
  }
}

function initBrickCarousel(grid, config) {
  const items = Array.from(grid.querySelectorAll('.color-item'));
  const itemsPerSlide = config.carouselRows * config.carouselCols;
  const prevBtn = grid.parentElement.querySelector('.prev');
  const nextBtn = grid.parentElement.querySelector('.next');
  
  grid.innerHTML = '';
  const track = document.createElement('div');
  track.className = 'brick-carousel-track';
  grid.appendChild(track);

  createCarouselSlides(track, items, config, itemsPerSlide);
  applyCarouselStyles(grid, track, config.carouselRows, config.carouselCols);
  
  if (items.length > itemsPerSlide) {
    setupCarouselNavigation(grid, track, items.length, itemsPerSlide, prevBtn, nextBtn);
  } else if (prevBtn && nextBtn) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
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
  items.forEach((item, index) => {
    const itemContainer = document.createElement('div');
    itemContainer.className = 'brick-carousel-item-container';
    itemContainer.appendChild(item.cloneNode(true));
    slide.appendChild(itemContainer);
  });
}

function applyCarouselStyles(grid, track, rows, cols) {
  const slides = track.querySelectorAll('.brick-carousel-slide');
  slides.forEach(slide => {
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
function setupGridItems(grid, config, tooltip = null) {
  const items = grid.querySelectorAll('.color-item');
  const colorGroup = grid.closest('.color-group');
  const playerContent = grid.closest('.brick-content');
  const playerNumber = playerContent.dataset.player;

  // Initialisation du stockage global si inexistant
  if (!window.colorSelections) window.colorSelections = {};

  items.forEach((item, index) => {
    const colorName = item.dataset.name || item.textContent.trim();
    const colorPrice = item.dataset.price || colorGroup.querySelector('.color-group-price').textContent;

    // Sélection initiale
    if (index === config.selected) {
      item.classList.add('selected');
      window.colorSelections[`player${playerNumber}`] = { name: colorName, price: colorPrice };
    }

    item.addEventListener('click', function() {
      // Désélectionner tous les items du joueur
      playerContent.querySelectorAll('.color-item').forEach(i => i.classList.remove('selected'));
      
      // Sélectionner l'item cliqué
      this.classList.add('selected');
      grid.dataset.selected = index.toString();
      
      // Stocker la sélection
      window.colorSelections[`player${playerNumber}`] = {
        name: colorName,
        price: colorPrice
      };
    });
  });
}

// Initialisation
document.querySelectorAll('.color-grid').forEach(grid => {
  const tooltip = grid.parentElement.querySelector('.color-tooltip');
  setupGridItems(grid, {
    cols: grid.dataset.cols,
    rows: grid.dataset.rows,
    selected: parseInt(grid.dataset.selected) || -1,
    carousel: grid.dataset.carousel === "true"
  }, tooltip);
});

function updatePlayerTitle(playerNumber, colorName, price) {
  const playerTitle = document.querySelector(`.brick-content[data-player="${playerNumber}"] h4`);
  if (playerTitle) {
    playerTitle.textContent = `Joueur ${playerNumber}: ${colorName} (${price})`;
  }
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
  
  window.addEventListener('load', layoutBricks);
  window.addEventListener('resize', handleWindowResize);
}

document.addEventListener('DOMContentLoaded', initializeApp);