// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game assets
const assets = {
    player: new Image(),
    enemy: new Image(),
    bullet: new Image(),
    explosion: new Image()
};

// Load SVG assets
assets.player.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCI+PHBhdGggZmlsbD0iIzM0OThkYiIgZD0iTTI1IDVMMTAgNDBoMzB6Ii8+PC9zdmc+';
assets.enemy.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMCAzMCI+PHBhdGggZmlsbD0iI2U3NGMzYyIgZD0iTTE1IDBsMTUgMzBIMHoiLz48L3N2Zz4=';
assets.bullet.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDE1Ij48cmVjdCBmaWxsPSIjZjFjNDBmIiB3aWR0aD0iNSIgaGVpZ2h0PSIxNSIvPjwvc3ZnPg==';
assets.explosion.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PGNpcmNsZSBmaWxsPSIjZjM5NzIxIiBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiLz48L3N2Zz4=';

// Background stars
const stars = Array(100).fill().map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 0.5 + 0.1
}));

// Game state
let score = 0;
let gameOver = false;
let comboCount = 0;
let lastHitTime = 0;
let lastFireTime = 0; // Tracks last bullet firing time
const COMBO_TIMEOUT = 2000; // 2 seconds between hits to maintain combo

// Player object
const player = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    width: 50,
    height: 50,
    speed: 5
};

// Bullets array
let bullets = [];

// Enemies array
let enemies = [];

// Explosions array
let explosions = [];

// Key states
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    Space: false
};

// Event listeners for keyboard
window.addEventListener('keydown', (e) => {
    console.log('Key pressed:', e.code); // Debug logging
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
        keys[e.code] = true;
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
        keys[e.code] = false;
        e.preventDefault();
    }
});

// Update player position based on key presses
function updatePlayer() {
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (keys.ArrowUp && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys.ArrowDown && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
    
    // Firing with cooldown (200ms) using Space or Up Arrow
    const now = Date.now();
    if ((keys.Space || keys.ArrowUp) && now - lastFireTime > 200) {
        fireBullet();
        lastFireTime = now;
    }
}

// Draw the player
function drawPlayer() {
    ctx.drawImage(assets.player, player.x, player.y, player.width, player.height);
}

// Fire a new bullet
function fireBullet() {
    bullets.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 15,
        speed: 7
    });
}

// Update bullets
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }
}

// Draw bullets
function drawBullets() {
    bullets.forEach(bullet => {
        ctx.drawImage(assets.bullet, bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Enemy types with constant speeds (no difficulty scaling)
const ENEMY_TYPES = [
    { width: 30, height: 30, speed: 5, points: 10, health: 1 }, // Basic
    { width: 40, height: 40, speed: 4, points: 20, health: 2 }, // Tank 
    { width: 20, height: 20, speed: 7, points: 30, health: 1 }  // Fast
];

// Spawn new enemies with different types
function spawnEnemy() {
    if (Math.random() < 0.1) { // High spawn rate (10% chance per frame)
        const type = Math.floor(Math.random() * ENEMY_TYPES.length);
        const enemyType = ENEMY_TYPES[type];
        
        enemies.push({
            x: Math.random() * (canvas.width - enemyType.width),
            y: -enemyType.height,
            width: enemyType.width,
            height: enemyType.height,
            speed: enemyType.speed,
            points: enemyType.points,
            type: type
        });
    }
}

// Update enemies
function updateEnemies() {
    spawnEnemy();
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
        }
    }
}

// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(assets.enemy, enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Draw health bar if enemy has more than 1 health
        if (enemy.maxHealth > 1) {
            const healthBarWidth = enemy.width;
            const healthBarHeight = 5;
            const healthPercentage = enemy.health / enemy.maxHealth;
            
            // Background
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(enemy.x, enemy.y - 8, healthBarWidth, healthBarHeight);
            
            // Foreground
            ctx.fillStyle = healthPercentage > 0.5 ? '#2ecc71' : 
                          healthPercentage > 0.25 ? '#f39c12' : '#e74c3c';
            ctx.fillRect(enemy.x, enemy.y - 8, healthBarWidth * healthPercentage, healthBarHeight);
        }
    });
}

// Create explosion
function createExplosion(x, y) {
    explosions.push({
        x: x - 20,
        y: y - 20,
        width: 40,
        height: 40,
        frame: 0,
        maxFrames: 10
    });
}

// Draw explosions
function drawExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        ctx.globalAlpha = 1 - (exp.frame / exp.maxFrames);
        ctx.drawImage(assets.explosion, exp.x, exp.y, exp.width, exp.height);
        ctx.globalAlpha = 1;
        exp.frame++;
        if (exp.frame >= exp.maxFrames) {
            explosions.splice(i, 1);
        }
    }
}

// Draw background stars
function drawStars() {
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

// Check collisions
function checkCollisions() {
    // Bullet-enemy collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (isColliding(bullets[i], enemies[j])) {
                createExplosion(enemies[j].x + enemies[j].width/2, enemies[j].y + enemies[j].height/2);
                
                // Calculate combo multiplier
                const now = Date.now();
                if (now - lastHitTime < COMBO_TIMEOUT) {
                    comboCount++;
                } else {
                    comboCount = 1;
                }
                lastHitTime = now;
                
                // Calculate score with combo multiplier
                const comboMultiplier = Math.min(5, 1 + comboCount * 0.2); // Max 5x multiplier
                const pointsEarned = Math.floor(enemies[j].points * comboMultiplier);
                
                // Show floating points text
                ctx.fillStyle = '#2ecc71';
                ctx.font = '20px Orbitron';
                ctx.fillText(`+${pointsEarned}`, enemies[j].x, enemies[j].y);
                
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += pointsEarned;
                scoreElement.textContent = score;
                break;
            }
        }
    }

    // Player-enemy collisions
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (isColliding(player, enemies[i])) {
            createExplosion(player.x + player.width/2, player.y + player.height/2);
            gameOver = true;
            setTimeout(() => {
                alert(`Game Over! Your score: ${score}`);
                document.location.reload();
            }, 300);
        }
    }
}

// Collision detection helper
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Game control variables
let gameRunning = false;
let animationFrameId = null;

// Main game loop
function gameLoop() {
    if (!gameRunning || gameOver) return;
    
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawStars();
    
    // Update game state
    updatePlayer();
    updateBullets();
    updateEnemies();
    
    // Draw everything
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawExplosions();
    
    // Check collisions
    checkCollisions();
    
    // Continue the loop
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Start game function
function startGame() {
    // Ensure UI elements exist
    const container = document.querySelector('.container');
    const overlay = document.querySelector('.overlay');
    const canvas = document.getElementById('gameCanvas');
    
    if (!container || !overlay || !canvas) {
        console.error('Missing UI elements');
        return;
    }

    // Hide menu and show game
    container.style.display = 'none';
    overlay.style.display = 'none';
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (!gameRunning) {
        gameRunning = true;
        resetGame();
        gameLoop();
    }
}

// Make function globally available
window.startGame = startGame;

// Stop game function
function stopGame() {
    gameRunning = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}

// Game state and assets
let gameStarted = false;
const ships = {
    basic: { color: '#3498db', speed: 5, fireRate: 300 },
    fast: { color: '#2ecc71', speed: 7, fireRate: 200 },
    tank: { color: '#e74c3c', speed: 3, fireRate: 500 }
};
let currentShip = 'basic';
let scores = JSON.parse(localStorage.getItem('galacticDefenderScores')) || [];

function initGame() {
    // Existing initialization code
    if (!gameStarted) {
        resetGame();
    }
}

function startGame() {
    // Ensure UI elements are properly hidden/shown
    const container = document.querySelector('.container');
    const overlay = document.querySelector('.overlay');
    const canvas = document.getElementById('gameCanvas');
    
    if (container && overlay && canvas) {
        container.style.display = 'none';
        overlay.style.display = 'none';
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    if (!gameStarted) {
        gameStarted = true;
        resetGame();
        gameLoop();
        // Hide menu and show game
        document.querySelector('.container').style.display = 'none';
        document.querySelector('.overlay').style.display = 'none';
        document.getElementById('gameCanvas').style.display = 'block';
    }
}

function resetGame() {
    // Reset game state
    player.x = canvas.width / 2;
    player.y = canvas.height - 80;
    bullets = [];
    enemies = [];
    explosions = [];
    score = 0;
    gameOver = false;
}

function saveScore() {
    scores.push({
        score: score,
        ship: currentShip,
        date: new Date().toLocaleString()
    });
    scores.sort((a,b) => b.score - a.score);
    localStorage.setItem('galacticDefenderScores', JSON.stringify(scores));
}

function setShip(shipType) {
    if (ships[shipType]) {
        currentShip = shipType;
        player.speed = ships[shipType].speed;
        // Update player appearance based on ship type
        assets.player.src = `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                <path fill="${ships[shipType].color}" d="M25 5L10 40h30z"/>
            </svg>
        `)}`;
    }
}

// Initialize ship selection
setShip('basic');
