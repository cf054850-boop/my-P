const gameBox = document.getElementById('game-box');
const bird = document.getElementById('bird');
const hudUsername = document.getElementById('hud-username');
const hudScore = document.getElementById('hud-score');
const finalScore = document.getElementById('final-score');
const btnRestart = document.getElementById('btn-restart');
const leaderboardBody = document.getElementById('leaderboard-body');
const searchPlayer = document.getElementById('search-player');

// הגדרות קבועות מוטמעות ישירות בקוד לעקיפת בעיות דפדפן
const gameSettings = { 
    speed: 3, 
    gravity: 0.3, 
    jump: -6, 
    pipeSpawnRate: 2000 
};

let birdY = 200;
let velocity = 0;
let score = 0;
let isPlaying = false;
let pipes = [];

let gameLoopInterval = null;
let pipeSpawnInterval = null;

// אתחול המשחק
function initGame(username) {
    hudUsername.textContent = username || "שחקן אורח";
    resetGameLogic();
    
    isPlaying = true;
    
    window.removeEventListener('keydown', handleJump);
    gameBox.removeEventListener('click', handleJump);
    
    window.addEventListener('keydown', handleJump);
    gameBox.addEventListener('click', handleJump);

    clearInterval(gameLoopInterval);
    clearInterval(pipeSpawnInterval);

    // התחלה מיידית: מייצרים צינור ראשון מיד ללא המתנה
    createPipe();

    gameLoopInterval = setInterval(updateGame, 20);
    pipeSpawnInterval = setInterval(createPipe, gameSettings.pipeSpawnRate);
}

function handleJump(e) {
    if (e.type === 'click' || e.code === 'Space') {
        if(e.code === 'Space') e.preventDefault();
        velocity = gameSettings.jump;
    }
}

function resetGameLogic() {
    birdY = 200;
    velocity = 0;
    score = 0;
    hudScore.textContent = '0';
    
    pipes.forEach(p => {
        if(p.el && p.el.parentNode) p.el.remove();
    });
    pipes = [];
    bird.style.top = birdY + 'px';
}

function updateGame() {
    if (!isPlaying) return;

    velocity += gameSettings.gravity;
    birdY += velocity;
    bird.style.top = birdY + 'px';

    if (birdY < 0 || birdY > gameBox.clientHeight - 24) {
        gameOver();
        return;
    }

    pipes.forEach((pipe) => {
        pipe.x -= gameSettings.speed;
        pipe.el.style.left = pipe.x + 'px';

        if (checkCollision(bird, pipe.el)) {
            gameOver();
            return;
        }

        // חישוב ניקוד מדויק ללא כפילויות
        if (pipe.isScoreTracked && !pipe.passed && pipe.x < 80) {
            pipe.passed = true;
            score++;
            hudScore.textContent = score;
        }
    });

    pipes = pipes.filter(pipe => {
        if (pipe.x < -60) {
            pipe.el.remove();
            return false;
        }
        return true;
    });
}

// יצירה דינמית של זוג צינורות
function createPipe() {
    if (!isPlaying) return;

    const gap = 130; 
    const minHeight = 40;
    const maxHeight = gameBox.clientHeight - gap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    const bottomHeight = gameBox.clientHeight - topHeight - gap;

    const topPipe = document.createElement('div');
    topPipe.className = 'pipe';
    topPipe.style.height = topHeight + 'px';
    topPipe.style.top = '0px';
    topPipe.style.left = gameBox.clientWidth + 'px';

    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe';
    bottomPipe.style.height = bottomHeight + 'px';
    bottomPipe.style.bottom = '0px';
    bottomPipe.style.left = gameBox.clientWidth + 'px';

    gameBox.appendChild(topPipe);
    gameBox.appendChild(bottomPipe);

    pipes.push({ el: topPipe, x: gameBox.clientWidth, passed: false, isScoreTracked: true });
    pipes.push({ el: bottomPipe, x: gameBox.clientWidth, passed: false, isScoreTracked: false });
}

function checkCollision(el1, el2) {
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}

function gameOver() {
    isPlaying = false;
    clearInterval(gameLoopInterval);
    clearInterval(pipeSpawnInterval);
    
    window.removeEventListener('keydown', handleJump);
    gameBox.removeEventListener('click', handleJump);

    finalScore.textContent = score;
    
    let scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
    scores.push({ name: hudUsername.textContent, score: score });
    localStorage.setItem('leaderboard', JSON.stringify(scores));

    renderLeaderboard();
    showScreen(screenGameOver); // מעבר למסך תוצאות
}

// מיון, סינון והצגה חד-פעמית של כל שחקן
function renderLeaderboard(filterText = '') {
    let scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
    scores.sort((a, b) => b.score - a.score);

    if (filterText) {
        scores = scores.filter(p => p.name.toLowerCase().includes(filterText.toLowerCase()));
    }

    leaderboardBody.innerHTML = '';
    const seenNames = new Set();
    let displayedCount = 0;

    scores.forEach((entry) => {
        if (seenNames.has(entry.name)) return; 
        if (displayedCount >= 5) return;

        seenNames.add(entry.name);
        displayedCount++;

        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${displayedCount}</td><td>${entry.name}</td><td>${entry.score}</td>`;
        leaderboardBody.appendChild(tr);
    });
}

searchPlayer.addEventListener('input', (e) => {
    renderLeaderboard(e.target.value);
});

btnRestart.addEventListener('click', () => {
    showScreen(screenGame);
    initGame(hudUsername.textContent);
});