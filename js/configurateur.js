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

document.addEventListener('click', e => {
  const brick = e.target.closest('.brick');
  if (brick) {
    brick.classList.toggle('open');
    layoutBricks();
  }
});

window.addEventListener('load', layoutBricks);
window.addEventListener('resize', () => setTimeout(layoutBricks, 100));
