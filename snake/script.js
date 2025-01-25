const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const highScoreElement = document.getElementById('highScore');
const levelUpDisplay = document.getElementById('levelUp');
const gameOverDisplay = document.querySelector('.gameOver');

// Configurações iniciais
const gridSize = 20;
const tileCount = 25;
canvas.width = tileCount * gridSize;
canvas.height = tileCount * gridSize;

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

highScoreElement.textContent = highScore;

// Efeitos sonoros
const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');

// Controles
document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight && lastDirection !== 'right') {
        dx = -1;
        dy = 0;
        lastDirection = 'left';
    }
    if (keyPressed === UP_KEY && !goingDown && lastDirection !== 'down') {
        dx = 0;
        dy = -1;
        lastDirection = 'up';
    }
    if (keyPressed === RIGHT_KEY && !goingLeft && lastDirection !== 'left') {
        dx = 1;
        dy = 0;
        lastDirection = 'right';
    }
    if (keyPressed === DOWN_KEY && !goingUp && lastDirection !== 'up') {
        dx = 0;
        dy = 1;
        lastDirection = 'down';
    }
}

function drawGame() {
    let head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };

    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        eatSound.currentTime = 0;
        eatSound.play();
        food = generateValidFood();
        checkLevelUp();
    } else {
        snake.pop();
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    ctx.fillStyle = '#ff4081';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2, 0, Math.PI * 2);
    ctx.fill();

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

function checkLevelUp() {
    if (score > level * 50) {
        level++;
        levelElement.textContent = level;
        gameSpeed = Math.max(50, gameSpeed - 10);
        levelUpDisplay.style.display = 'block';
        setTimeout(() => levelUpDisplay.style.display = 'none', 1000);
        clearInterval(gameLoop);
        gameLoop = setInterval(drawGame, gameSpeed);
    }
}

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

// Iniciar jogo
gameLoop = setInterval(drawGame, gameSpeed);