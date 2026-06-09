/* === החלת המצב הכהה/בהיר שנשמר בזיכרון ברגע שהדף נטען === */
function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}
applyTheme();

/* === מנגנון כפתור שינוי מצב התצוגה === */
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const mode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', mode);
    });
}

/* === מנגנון כפתורי רמת הקושי במסך ההרשמה === */
let selectedDifficulty = 'medium'; /* ברירת מחדל */
const btnEasy = document.getElementById('btn-easy');
const btnMedium = document.getElementById('btn-medium');
const btnHard = document.getElementById('btn-hard');
const diffButtons = [btnEasy, btnMedium, btnHard];

function changeDiff(targetBtn, level) {
    diffButtons.forEach(btn => { if(btn) btn.classList.remove('active'); });
    if(targetBtn) targetBtn.classList.add('active');
    selectedDifficulty = level;
}

if(btnEasy) btnEasy.addEventListener('click', () => changeDiff(btnEasy, 'easy'));
if(btnMedium) btnMedium.addEventListener('click', () => changeDiff(btnMedium, 'medium'));
if(btnHard) btnHard.addEventListener('click', () => changeDiff(btnHard, 'hard'));


/* === מנגנון בדיקת תקינות הקלט בהרשמה === */
const authForm = document.getElementById('auth-form');

if (authForm) {
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const emailError = document.getElementById('email-error');
        const passwordError = document.getElementById('password-error');

        emailError.style.display = 'none';
        passwordError.style.display = 'none';

        let isFormValid = true;

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            emailError.style.display = 'block';
            isFormValid = false;
        }

        const hasLetters = /[a-zA-Zא-ת]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const isLongEnough = password.length >= 6;

        if (!isLongEnough || !hasLetters || !hasNumbers) {
            passwordError.style.display = 'block';
            isFormValid = false;
        }

        if (isFormValid) {
            /* שמירת שם המשתמש ורמת הקושי שנבחרה בזיכרון */
            localStorage.setItem('currentPlayer', username);
            localStorage.setItem('gameDifficulty', selectedDifficulty);
            
            /* איפוס מונה הניסיונות ל-0 עבור השחקן החדש שנרשם עכשיו */
            localStorage.setItem('gameAttempts', 0);
            
            window.location.href = 'game.html';
        }
    });
}