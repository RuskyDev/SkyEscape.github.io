const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: 50,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 5,
    jumpStrength: 10,
    gravity: 0.5,
    velX: 0,
    velY: 0,
    jumping: false
};

const enemies = [];

const keys = [];
let gamePaused = false; // Track game pause state
let startTime = Date.now(); // Track start time of the game
let lastDifficultyIncreaseTime = startTime; // Track the last time the difficulty increased
let enemyFallSpeed = 10; // Initial falling speed of enemies

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
    if (!gamePaused) { // Check if game is paused
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
        
        // Prevent player from going off the left and right edges
        if (player.x < 0) {
            player.x = 0;
        } else if (player.x + player.width > canvas.width) {
            player.x = canvas.width - player.width;
        }
        
        // Prevent player from going off the top and bottom edges
        if (player.y < 0) {
            player.y = 0;
        } else if (player.y + player.height > canvas.height) {
            player.y = canvas.height - player.height;
            player.jumping = false; // Reset jumping flag when player lands
        }

        // Generate enemies
        if (Math.random() < 0.2) { // Adjust this value to control enemy spawn rate
            const enemySize = 30;
            const enemyX = Math.random() * (canvas.width - enemySize);
            const enemyColor = '#' + Math.floor(Math.random()*16777215).toString(16); // Random hex color
            enemies.push({ x: enemyX, y: 0, size: enemySize, color: enemyColor, speed: enemyFallSpeed });
        }

        // Update enemies
        enemies.forEach((enemy, index) => {
            enemy.y += enemy.speed; // Adjust enemy falling speed
            // Check collision with player
            if (player.x < enemy.x + enemy.size &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.size &&
                player.y + player.height > enemy.y) {
                // Collision detected, player "dies" (you can add game over logic here)
                gamePaused = true; // Pause the game
                showGameOverScreen(); // Show game over screen
            }
            // Remove enemies that are off the screen
            if (enemy.y > canvas.height) {
                enemies.splice(index, 1);
            }
        });
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Draw enemies
        enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
        });

        ctx.font = "18px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("FPS: " + fps, 10, 20);
        ctx.fillText("Coordinates: (" + player.x + ", " + player.y + ")", 10, 40);
        ctx.fillText("Time survived: " + ((Date.now() - startTime) / 1000).toFixed(1) + " seconds", 10, 60); // Display time survived in seconds
        
        frameCount++;
        requestAnimationFrame(update);
    }
    
    // Increase difficulty every 10 seconds
    if (!gamePaused && (currentTime - lastDifficultyIncreaseTime) >= 10000) {
        lastDifficultyIncreaseTime = currentTime;
        enemyFallSpeed += 50; // Increase falling speed of enemies
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
}

function restartGame() {
    gamePaused = false; // Unpause the game
    enemies.length = 0; // Clear the enemies array
    player.x = 50; // Reset player position
    player.y = canvas.height - 50;
    startTime = Date.now(); // Reset start time
    lastDifficultyIncreaseTime = startTime; // Reset difficulty increase time
    enemyFallSpeed = 10; // Reset falling speed of enemies
    document.querySelector('div').remove(); // Remove the game over screen
    requestAnimationFrame(update); // Restart the game loop
}

updateFPS();
requestAnimationFrame(update);
