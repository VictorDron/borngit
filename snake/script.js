// Constantes e variáveis globais
const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const highScoreElement = document.getElementById('highScore');
const levelUpDisplay = document.getElementById('levelUp');
const gameOverDisplay = document.querySelector('.gameOver');

// Configurações do jogo
const gridSize = 20;
const tileCount = 25;
let snake = [{x: 12, y: 12}];
let food = generateValidFood();
let dx = 1;
let dy = 0;
let score = 0;
let level = 1;
let highScore = localStorage.getItem('highScore') || 0;
let gameSpeed = 150;
let gameLoop;
let lastDirection = 'right';
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Elementos de áudio
const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');

// Inicialização
highScoreElement.textContent = highScore;
canvas.width = tileCount * gridSize;
canvas.height = tileCount * gridSize;

// Controles
document.addEventListener('keydown', changeDirection);

// Função principal do jogo
function drawGame() {
    moveSnake();
    checkCollisions();
    clearCanvas();
    drawGrid();
    drawFood();
    drawSnake();
}

// Movimento da cobra
function moveSnake() {
    const head = {
        x: (snake[0].x + dx + tileCount) % tileCount,
        y: (snake[0].y + dy + tileCount) % tileCount
    };
    
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        handleFoodCollision();
    } else {
        snake.pop();
    }
}

// Verificação de colisões
function checkCollisions() {
    const head = snake[0];
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
}

// Manipulação de comida
function handleFoodCollision() {
    score += 10;
    scoreElement.textContent = score;
    eatSound.currentTime = 0;
    eatSound.play();
    food = generateValidFood();
    checkLevelUp();
}

// Geração de comida
function generateValidFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

// Sistema de níveis
function checkLevelUp() {
    if (score > level * 50) {
        level++;
        levelElement.textContent = level;
        gameSpeed = Math.max(50, gameSpeed - 10);
        showLevelUp();
        resetGameLoop();
    }
}

function showLevelUp() {
    levelUpDisplay.style.display = 'block';
    setTimeout(() => levelUpDisplay.style.display = 'none', 1000);
}

function resetGameLoop() {
    clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, gameSpeed);
}

// Game Over
function gameOver() {
    clearInterval(gameLoop);
    gameOverSound.currentTime = 0;
    gameOverSound.play();
    gameOverDisplay.style.display = 'block';
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = highScore;
    }

    setTimeout(() => {
        if (confirm(`Game Over! Pontuação: ${score}\nJogar novamente?`)) {
            window.location.reload();
        }
    }, 500);
}

// Renderização
function clearCanvas() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
    ctx.strokeStyle = '#4CAF5050';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

function drawFood() {
    ctx.fillStyle = '#ff4081';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2, 0, Math.PI * 2);
    ctx.fill();
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const alpha = 1 - (index * 0.02);
        const size = gridSize - 2 - (index * 0.3);
        ctx.fillStyle = `hsla(${(index * 5) % 360}, 100%, 50%, ${alpha})`;
        ctx.fillRect(
            segment.x * gridSize + (gridSize - size)/2,
            segment.y * gridSize + (gridSize - size)/2,
            size,
            size
        );
    });
}

// Controles
function handleDirectionChange(newDx, newDy, direction) {
    if (
        (direction === 'left' && lastDirection !== 'right') ||
        (direction === 'right' && lastDirection !== 'left') ||
        (direction === 'up' && lastDirection !== 'down') ||
        (direction === 'down' && lastDirection !== 'up')
    ) {
        dx = newDx;
        dy = newDy;
        lastDirection = direction;
    }
}

function changeDirection(event) {
    if(isTouchDevice) return;

    const keyMapping = {
        37: () => handleDirectionChange(-1, 0, 'left'),
        38: () => handleDirectionChange(0, -1, 'up'),
        39: () => handleDirectionChange(1, 0, 'right'),
        40: () => handleDirectionChange(0, 1, 'down')
    };

    if(keyMapping[event.keyCode]) {
        event.preventDefault();
        keyMapping[event.keyCode]();
    }
}

// Inicialização do jogo
gameLoop = setInterval(drawGame, gameSpeed);