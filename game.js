/* --- בדיקת המצב הכהה והחלתו מיד עם טעינת הדף --- */
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
}

/* תפיסת אלמנט ה-HTML של אזור המשחק המרכזי שבו הכל קורה */
const gameBox = document.getElementById('game-box');
/* תפיסת אלמנט ה-HTML של הציפור (השחקן) */
const bird = document.getElementById('bird');
/* תפיסת האלמנט שמציג את שם השחקן הנוכחי על המסך בזמן המשחק */
const hudUsername = document.getElementById('hud-username');
/* תפיסת האלמנט שמציג את הניקוד המתעדכן בזמן המשחק */
const hudScore = document.getElementById('hud-score');
/* תפיסת האלמנט שמציג את הניקוד הסופי במסך ה-GameOver */
const finalScore = document.getElementById('final-score');
/* תפיסת כפתור ה"הפעלה מחדש" שמופיע בסוף המשחק */
const btnRestart = document.getElementById('btn-restart');
/* תפיסת גוף הטבלה (tbody) שבו יוצגו שורות טבלת שיאי השחקנים */
const leaderboardBody = document.getElementById('leaderboard-body');
/* תפיסת תיבת הטקסט המאפשרת לחפש ולסנן שחקנים בטבלת השיאים */
const searchPlayer = document.getElementById('search-player');

/* משתנה גלובלי שיחזיק את כל מאגר רמות הקושי שנטען מה-JSON */
let allSettingsData = null;
/* האובייקט הפעיל כרגע שקובע את הפיזיקה הנוכחית של המשחק */
let gameSettings = {};

/* הגדרת המיקום ההתחלתי של הציפור בציר האנכי (Y) */
let birdY = 200;
/* מהירות התנועה הנוכחית של הציפור (חיובי = ירידה, שלילי = קפיצה/עלייה) */
let velocity = 0;
/* משתנה ששומר את הניקוד הנוכחי של השחקן בסיבוב הזה */
let score = 0;
/* משתנה בוליאני (אמת/שקר) שמסמן האם המשחק פעיל עכשיו או שהשחקן נפסל */
let isPlaying = false;
/* מערך ריק שיכיל את כל אובייקטי הצינורות שנמצאים כרגע על המסך */
let pipes = [];

/* משתנה שיחזיק את הטיימר האחראי על לולאת עדכון הפיזיקה של המשחק */
let gameLoopInterval = null;
/* משתנה שיחזיק את הטיימר האחראי על יצירת הצינורות החדשים בכל כמה שניות */
let pipeSpawnInterval = null;

/* פונקציה המשתמשת ב-fetch כדי לטעון נתונים מקובץ JSON מקומי חיצוני */
function loadGameSettings() {
    fetch('settings.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("לא ניתן לטעון את קובץ ההגדרות");
            }
            return response.json();
        })
        .then(data => {
            allSettingsData = data;
            
            /* שליפת רמת הקושי שהמשתמש בחר במסך הראשון! (אם אין, ברירת מחדל medium) */
            const chosenDifficulty = localStorage.getItem('gameDifficulty') || 'medium';
            
            /* החלת הפיזיקה המתאימה מתוך ה-JSON על סמך הבחירה */
            gameSettings = allSettingsData[chosenDifficulty];
            
            console.log(`המשחק נטען ברמת קושי: ${chosenDifficulty}`, gameSettings);
            
            /* הפעלת המשחק */
            if (window.location.pathname.includes('game.html')) {
                const savedPlayer = localStorage.getItem('currentPlayer') || "שחקן אורח";
                initGame(savedPlayer);
            }
        })
        .catch(error => {
            console.error("שגיאה ב-fetch, משתמשים בגיבוי קשיח:", error);
            gameSettings = { speed: 3, gravity: 0.3, jump: -6, pipeSpawnRate: 2000 };
            if (window.location.pathname.includes('game.html')) {
                const savedPlayer = localStorage.getItem('currentPlayer') || "שחקן אורח";
                initGame(savedPlayer);
            }
        });
}


/* פונקציה שמטפלת בהחלפת רמות הקושי בזמן אמת ללא רענון הדף */
function setupDifficultyButtons() {
    const btnEasy = document.getElementById('btn-easy');
    const btnMedium = document.getElementById('btn-medium');
    const btnHard = document.getElementById('btn-hard');
    const buttons = [btnEasy, btnMedium, btnHard];

    function updateActiveButton(targetBtn) {
        buttons.forEach(btn => { if(btn) btn.classList.remove('active'); });
        if(targetBtn) targetBtn.classList.add('active');
    }

    if(btnEasy) {
        btnEasy.addEventListener('click', () => {
            if(allSettingsData) {
                gameSettings = allSettingsData.easy; /* שינוי הנתונים בלייב מה-JSON */
                updateActiveButton(btnEasy);
                restartSpawningWithNewRate(); /* עדכון קצב יצירת הצינורות מיד */
            }
        });
    }
    if(btnMedium) {
        btnMedium.addEventListener('click', () => {
            if(allSettingsData) {
                gameSettings = allSettingsData.medium;
                updateActiveButton(btnMedium);
                restartSpawningWithNewRate();
            }
        });
    }
    if(btnHard) {
        btnHard.addEventListener('click', () => {
            if(allSettingsData) {
                gameSettings = allSettingsData.hard;
                updateActiveButton(btnHard);
                restartSpawningWithNewRate();
            }
        });
    }
}

/* פונקציית עזר שמעדכנת את הטיימר של הצינורות ברגע שהקושי משתנה בלייב */
function restartSpawningWithNewRate() {
    if (isPlaying) {
        clearInterval(pipeSpawnInterval);
        pipeSpawnInterval = setInterval(createPipe, gameSettings.pipeSpawnRate);
    }
}

/* הפעלה מיידית של פונקציית ה-fetch ברגע שקובץ ה-JS עולה */
loadGameSettings();

/* בדיקה אוטומטית: אם הדפדפן נמצא בעמוד סיום המשחק, נציג את הניקוד האחרון ונטען את הטבלה */
if (window.location.pathname.includes('gameover.html')) {
    if (finalScore) {
        finalScore.textContent = localStorage.getItem('lastScore') || '0';
    }
    renderLeaderboard();
}

/* פונקציית אתחול שמפעילה סיבוב משחק חדש ומקבלת את שם השחקן */
function initGame(username) {
    if (hudUsername) hudUsername.textContent = username || "שחקן אורח";
    resetGameLogic();
    isPlaying = true;
    
    window.removeEventListener('keydown', handleJump);
    if (gameBox) gameBox.removeEventListener('click', handleJump);
    
    window.addEventListener('keydown', handleJump);
    if (gameBox) gameBox.addEventListener('click', handleJump);

    clearInterval(gameLoopInterval);
    clearInterval(pipeSpawnInterval);

    createPipe();

    gameLoopInterval = setInterval(updateGame, 20);
    pipeSpawnInterval = setInterval(createPipe, gameSettings.pipeSpawnRate);
}

/* פונקציה שמטפלת בפקודת הקפיצה של הציפור */
function handleJump(e) {
    if (e.type === 'click' || e.code === 'Space') {
        if (e.code === 'Space') e.preventDefault();
        velocity = gameSettings.jump;
    }
}

/* פונקציה שמנקה את לוח המשחק ומאפסת את המשתנים לקראת סיבוב חדש */
function resetGameLogic() {
    birdY = 200;
    velocity = 0;
    score = 0;
    if (hudScore) hudScore.textContent = '0';
    
    pipes.forEach(p => {
        if (p.el && p.el.parentNode) p.el.remove();
    });
    pipes = [];
    if (bird) bird.style.top = birdY + 'px';
}

/* פונקציית הלולאה הראשית של המשחק */
function updateGame() {
    if (!isPlaying) return;

    velocity += gameSettings.gravity;
    birdY += velocity;
    if (bird) bird.style.top = birdY + 'px';

    if (gameBox && (birdY < 0 || birdY > gameBox.clientHeight - 24)) {
        gameOver();
        return;
    }

    pipes.forEach((pipe) => {
        pipe.x -= gameSettings.speed;
        pipe.el.style.left = pipe.x + 'px';

        if (bird && checkCollision(bird, pipe.el)) {
            gameOver();
            return;
        }

        if (pipe.isScoreTracked && !pipe.passed && pipe.x < 80) {
            pipe.passed = true;
            score++;
            if (hudScore) hudScore.textContent = score;
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

/* פונקציה לייצור דינמי של זוג צינורות חדש */
function createPipe() {
    if (!isPlaying || !gameBox) return;

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

/* פונקציה לבדיקת התנגשות */
function checkCollision(el1, el2) {
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}

/* פונקציה שמטפלת בסיום המשחק ובודקת אם השחקן ניצל את 5 הניסיונות שלו */
function gameOver() {
    isPlaying = false;
    clearInterval(gameLoopInterval);
    clearInterval(pipeSpawnInterval);
    
    window.removeEventListener('keydown', handleJump);
    if (gameBox) gameBox.removeEventListener('click', handleJump);

    // 1. שמירת הניקוד האחרון של הסיבוב הנוכחי בזיכרון
    localStorage.setItem('lastScore', score);
    
    // 2. עדכון טבלת השיאים הכללית
    let scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const currentName = hudUsername ? hudUsername.textContent : "שחקן אורח";
    scores.push({ name: currentName, score: score });
    localStorage.setItem('leaderboard', JSON.stringify(scores));

    // 3. מנגנון ספירת הניסיונות (מקסימום 5)
    // שולף כמה ניסיונות נוצלו כבר, אם זו פעם ראשונה זה יהיה 0, ומוסיף 1
    let attempts = parseInt(localStorage.getItem('gameAttempts')) || 0;
    attempts++;
    
    console.log(`ניסיון מספר: ${attempts} מתוך 5`);

    if (attempts >= 5) {
        // אם המשתמש נכשל 5 פעמים - מאפסים את הנתונים ומחזירים אותו להרשמה!
        localStorage.setItem('gameAttempts', 0); // איפוס המונה לפעם הבאה
        localStorage.removeItem('currentPlayer'); // מחיקת השם הנוכחי כדי שיצטרך להירשם מחדש
        
        alert("ניצלת את כל 5 הניסיונות שלך! מעביר אותך להרשמה מחדש.");
        window.location.href = 'index.html'; // חזרה לדף ההרשמה המקורית
    } else {
        // אם נשארו לו עוד ניסיונות - שומרים את המונה המעודכן ומעבירים לעמוד התוצאה הרגיל
        localStorage.setItem('gameAttempts', attempts);
        window.location.href = 'gameover.html'; 
    }
}

/* פונקציה להצגת וסינון טבלת המובילים */
function renderLeaderboard(filterText = '') {
    if (!leaderboardBody) return;

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

/* האזנה לחיפוש שחקנים */
if (searchPlayer) {
    searchPlayer.addEventListener('input', (e) => {
        renderLeaderboard(e.target.value);
    });
}

/* האזנה לכפתור משחק חדש */
if (btnRestart) {
    btnRestart.addEventListener('click', () => {
        window.location.href = 'game.html';
    });
}