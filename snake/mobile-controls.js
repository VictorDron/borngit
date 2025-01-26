// Detecta dispositivo touch
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Cria controles touch
function createTouchControls() {
    const controls = document.createElement('div');
    controls.className = 'controls-container';
    
    const controlsHTML = `
        <div class="control-btn" id="up">↑</div>
        <div class="control-btn" id="left">←</div>
        <div class="control-btn" id="down">↓</div>
        <div class="control-btn" id="right">→</div>
    `;
    
    controls.innerHTML = controlsHTML;
    document.body.appendChild(controls);
    
    // Event listeners para controles
    const handleTouch = (direction) => {
        const directions = {
            up: () => { if(lastDirection !== 'down') { dx = 0; dy = -1; lastDirection = 'up'; } },
            left: () => { if(lastDirection !== 'right') { dx = -1; dy = 0; lastDirection = 'left'; } },
            down: () => { if(lastDirection !== 'up') { dx = 0; dy = 1; lastDirection = 'down'; } },
            right: () => { if(lastDirection !== 'left') { dx = 1; dy = 0; lastDirection = 'right'; } }
        };
        directions[direction]();
    };

    ['up', 'left', 'down', 'right'].forEach(direction => {
        document.getElementById(direction).addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleTouch(direction);
        });
    });
}

// Inicialização condicional
if(isTouchDevice) {
    createTouchControls();
    
    // Prevenir zoom
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    
    // Ajustar canvas para mobile
    const adjustCanvasSize = () => {
        const maxSize = Math.min(window.innerWidth - 40, 500);
        canvas.style.width = `${maxSize}px`;
        canvas.style.height = `${maxSize}px`;
    };
    
    adjustCanvasSize();
    window.addEventListener('resize', adjustCanvasSize);
}