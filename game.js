const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: 50,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 8,
    jumpStrength: 10,
    gravity: 0.5,
    velX: 0,
    velY: 0,
    jumping: false
};

const enemies = [];

const keys = [];
let gamePaused = false;
let startTime = Date.now();
let lastDifficultyIncreaseTime = startTime;
let enemyFallSpeed = 10;
let previousSurvivedTime = parseFloat(localStorage.getItem('previousSurvivedTime')) || 0;
let highScore = parseFloat(localStorage.getItem('highScore')) || 0; // Initialize high score from local storage

window.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
    if (e.keyCode === 32 && !player.jumping) {
        player.velY = -player.jumpStrength;
        player.jumping = true;
    }
});
window.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
    if ((e.keyCode === 65 && player.velX < 0) || (e.keyCode === 68 && player.velX > 0)) {
        player.velX = 0;
    }
});

let lastTime = 0;
let fps = 0;
let frameCount = 0;

function update(currentTime) {
    if (!gamePaused) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        fps = Math.round(1000 / deltaTime);

        if (keys[65]) {
            player.velX = -player.speed;
        }
        if (keys[68]) {
            player.velX = player.speed;
        }

        player.velY += player.gravity;
        
        player.x += player.velX;
        player.y += player.velY;
        
        if (player.x < 0) {
            player.x = 0;
        } else if (player.x + player.width > canvas.width) {
            player.x = canvas.width - player.width;
        }
        
        if (player.y < 0) {
            player.y = 0;
        } else if (player.y + player.height > canvas.height) {
            player.y = canvas.height - player.height;
            player.jumping = false;
        }

        if (Math.random() < 0.2) {
            const enemySize = 30;
            const enemyX = Math.random() * (canvas.width - enemySize);
            const enemyColor = '#' + Math.floor(Math.random()*16777215).toString(16);
            enemies.push({ x: enemyX, y: 0, size: enemySize, color: enemyColor, speed: enemyFallSpeed });
        }

        enemies.forEach((enemy, index) => {
            enemy.y += enemy.speed;
            if (player.x < enemy.x + enemy.size &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.size &&
                player.y + player.height > enemy.y) {
                gamePaused = true;
                showGameOverScreen();
            }
            if (enemy.y > canvas.height) {
                enemies.splice(index, 1);
            }
        });
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(player.x, player.y, player.width, player.height);

        enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
        });

        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("FPS: " + fps, 10, 20);
        ctx.fillText("Time survived: " + ((Date.now() - startTime) / 1000).toFixed(1) + "s", 10, 40);
        ctx.fillText("Previous Survived Time: " + previousSurvivedTime.toFixed(1) + "s", 10, 60);
        ctx.fillText("High Survived Time: " + highScore.toFixed(1) + "s", 10, 80);
        
        frameCount++;
        requestAnimationFrame(update);
    }
    
    if (!gamePaused && (currentTime - lastDifficultyIncreaseTime) >= 10000) {
        lastDifficultyIncreaseTime = currentTime;
        enemyFallSpeed += 50;
    }
}


function updateFPS() {
    fps = frameCount;
    frameCount = 0;
    setTimeout(updateFPS, 1000);
}

function showGameOverScreen() {
    const gameOverScreen = document.createElement('div');
    gameOverScreen.style.position = 'absolute';
    gameOverScreen.style.top = '50%';
    gameOverScreen.style.left = '50%';
    gameOverScreen.style.transform = 'translate(-50%, -50%)';
    gameOverScreen.style.textAlign = 'center';
    gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    gameOverScreen.style.padding = '20px';
    gameOverScreen.style.color = 'white';
    gameOverScreen.innerHTML = '<h1>Game Over</h1><p>You died!</p><button onclick="restartGame()">Restart</button>';
    document.body.appendChild(gameOverScreen);
    
    previousSurvivedTime = (Date.now() - startTime) / 1000;
    localStorage.setItem('previousSurvivedTime', previousSurvivedTime.toString()); // Save previous survived time
    
    if (previousSurvivedTime > highScore) { // Update high score if the current survived time is higher
        highScore = previousSurvivedTime;
        localStorage.setItem('highScore', highScore.toString());
    }

    // Play game over sound
    const gameOverSound = document.getElementById('gameOverSound');
    gameOverSound.play();
}


function restartGame() {
    gamePaused = false;
    enemies.length = 0;
    player.x = 50;
    player.y = canvas.height - 50;
    startTime = Date.now();
    lastDifficultyIncreaseTime = startTime;
    enemyFallSpeed = 10;
    document.querySelector('div').remove();
    requestAnimationFrame(update);
}

updateFPS();
requestAnimationFrame(update);
