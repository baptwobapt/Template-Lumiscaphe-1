const buttons = document.querySelectorAll(".pointView button");
const slider = document.querySelector(".pointView .slider");

buttons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    // Retirer la classe active
    buttons.forEach(b => b.classList.remove("active"));
    // Ajouter au bouton sélectionné
    btn.classList.add("active");
    // Déplacer le slider
    slider.style.transform = `translateX(${index * 100}%)`;
  });
});






function layoutBricks() {
  const container = document.querySelector('.brick-container');
  const bricks = Array.from(container.querySelectorAll('.brick'));
  
  const columnGapVW = 1;
  const rowGapVW = 1.5;
  const columnGapPixels = (columnGapVW * window.innerWidth) / 100;
  const rowGapPixels = (rowGapVW * window.innerWidth) / 100;
  
  const containerWidth = container.clientWidth;
  const totalCols = 100;
  const cols = new Array(totalCols).fill(0);

  bricks.forEach(brick => {
    const widthPercent = parseInt(brick.style.getPropertyValue('--w'));
    const isOpen = brick.classList.contains('open');
    const hValue = brick.style.getPropertyValue('--h');
    const numericVW = parseFloat(hValue);
    const height = isOpen ? (numericVW * window.innerWidth) / 100 : 50;

    const brickColsCount = widthPercent;

    let bestX = 0;
    let minY = Infinity;

    for (let x = 0; x <= totalCols - brickColsCount; x++) {
      let segmentMaxY = 0;
      for (let i = x; i < x + brickColsCount; i++) {
        if (cols[i] > segmentMaxY) segmentMaxY = cols[i];
      }

      if (segmentMaxY < minY) {
        minY = segmentMaxY;
        bestX = x;
      }
    }

    const pixelLeft = (bestX / 100) * containerWidth + (bestX * columnGapPixels / 100);
    
    // Modification clé ici :
    const shouldApplyGap = widthPercent < 100; // Ne pas appliquer le gap si 100%
    const widthCorrection = shouldApplyGap ? columnGapVW : 0;
    
    brick.style.left = `${pixelLeft}px`;
    brick.style.top = `${minY}px`;
    brick.style.width = `calc(${widthPercent}% - ${widthCorrection}vw)`;

    for (let i = bestX; i < bestX + brickColsCount; i++) {
      cols[i] = minY + height + rowGapPixels;
    }
  });

  container.style.height = `${Math.max(...cols)}px`;
}
function setupColorGrids() {
  document.querySelectorAll('.color-grid').forEach(grid => {
    const rows = grid.dataset.rows;
    const cols = grid.dataset.cols;
    const fillDirection = grid.dataset.fillDirection || 'rows'; // 'cols' ou 'rows'
    
    // Reset des propriétés
    grid.style.gridAutoFlow = '';
    grid.style.gridTemplateColumns = '';
    grid.style.gridTemplateRows = '';

    if (cols === "auto" && rows !== "auto") {
      // Mode: colonnes auto, lignes fixes
      const itemsCount = grid.children.length;
      const calculatedCols = Math.ceil(itemsCount / rows);
      
      grid.style.gridAutoFlow = fillDirection === 'cols' ? 'column' : 'row';
      grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
      grid.style.gridTemplateColumns = `repeat(${calculatedCols}, 1fr)`;
      
    } else if (rows === "auto" && cols !== "auto") {
      // Mode: lignes auto, colonnes fixes
      const itemsCount = grid.children.length;
      const calculatedRows = Math.ceil(itemsCount / cols);
      
      grid.style.gridAutoFlow = fillDirection === 'cols' ? 'column' : 'row';
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      grid.style.gridTemplateRows = `repeat(${calculatedRows}, 1fr)`;
    }

    // Gestion de la sélection
    const items = grid.querySelectorAll('.color-item');
    items.forEach(item => {
      item.addEventListener('click', function() {
        items.forEach(i => i.classList.remove('selected'));
        this.classList.add('selected');
      });
    });
  });
}

// Initialiser après le chargement et le layout des briques
document.addEventListener('DOMContentLoaded', function() {
  layoutBricks();
  setupColorGrids();
});

window.addEventListener('resize', () => {
  setTimeout(() => {
    layoutBricks();
    setupColorGrids();
  }, 100);
});
// Initialisation
document.querySelectorAll('.color-grid').forEach(setupColorGrid);

document.addEventListener('click', e => {
  const arrowIcon = e.target.closest('.arrow-icon');
  if (arrowIcon) {
    const brick = arrowIcon.closest('.brick');
    brick.classList.toggle('open');
    layoutBricks();
    e.stopPropagation(); // Empêche la propagation à d'autres éléments
  }
});

// Garder le reste du code inchangé
window.addEventListener('load', layoutBricks);
window.addEventListener('resize', () => setTimeout(layoutBricks, 100));

















document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.color-grid').forEach(setupColorGrid);
});

function setupColorGrid(grid) {
  const rows = grid.dataset.rows;
  const cols = grid.dataset.cols;
  const fillDirection = grid.dataset.fillDirection || 'row';
  
  // Définir la direction de remplissage
  grid.style.setProperty('--fill-direction', fillDirection);
  
  if (cols === "auto" && rows !== "auto") {
    // Mode: colonnes auto, lignes fixes
    grid.style.setProperty('--rows', rows);
    
    // Calculer le nombre de colonnes nécessaires
    const itemCount = grid.children.length;
    const colCount = Math.ceil(itemCount / rows);
    grid.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;
    
  } else if (rows === "auto" && cols !== "auto") {
    // Mode: lignes auto, colonnes fixes
    grid.style.setProperty('--cols', cols);
    
    // Calculer le nombre de lignes nécessaires
    const itemCount = grid.children.length;
    const rowCount = Math.ceil(itemCount / cols);
    grid.style.gridTemplateRows = `repeat(${rowCount}, 1fr)`;
    
  } else {
    // Mode par défaut si les deux sont auto ou fixes
    grid.style.gridTemplateColumns = cols === "auto" ? 'auto' : `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows = rows === "auto" ? 'auto' : `repeat(${rows}, 1fr)`;
  }
    const items = grid.querySelectorAll('.color-item');
  items.forEach(item => {
    item.addEventListener('click', function() {
      // Retire la sélection actuelle
      items.forEach(i => i.classList.remove('selected'));
      
      // Ajoute la sélection à l'item cliqué
      this.classList.add('selected');
      
      // Stocke la sélection (optionnel)
      grid.dataset.selected = this.textContent;
    });
  });

  // Sélection initiale du premier élément (optionnel)
  if (items.length > 0 && !grid.querySelector('.selected')) {
    items[0].classList.add('selected');
  }
}