const themeToggle = document.getElementById('theme-toggle');
const authForm = document.getElementById('auth-form');
const screenAuth = document.getElementById('screen-auth');
const screenGame = document.getElementById('screen-game');
const screenGameOver = document.getElementById('screen-gameover');

// --- 1. מנגנון מצב כהה/בהיר (Dark Mode) ---
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
 document.body.classList.add('dark-mode');
}

themeToggle.addEventListener('click', () => {
 document.body.classList.toggle('dark-mode');
 const mode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
 localStorage.setItem('theme', mode);
});

// --- 2. אימות טופס פשוט ומעבר ישיר למשחק ---
authForm.addEventListener('submit', (e) => {
 e.preventDefault();
 const username = document.getElementById('username').value.trim();
 const email = document.getElementById('email').value.trim();
 const password = document.getElementById('password').value;
 
 const emailError = document.getElementById('email-error');
 const passwordError = document.getElementById('password-error');
 
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
 let isValid = true;

 // איפוס שגיאות
 emailError.style.display = 'none';
 passwordError.style.display = 'none';

 if (!emailRegex.test(email)) {
 emailError.textContent = 'כתובת אימייל לא תקינה';
emailError.style.display = 'block';
  isValid = false;
 }

 if (!passwordRegex.test(password)) {
passwordError.style.display = 'block';
 isValid = false;
 }

 if (isValid) {
 localStorage.setItem('lastLoggedInUser', username);
 showScreen(screenGame); // מעבר מסך
 
 if (typeof initGame === "function") {
 initGame(username); // הפעלת המשחק בקובץ game.js
 }
 }
});

function showScreen(screenToShow) {
[screenAuth, screenGame, screenGameOver].forEach(s => s.classList.remove('active'));
 screenToShow.classList.add('active');
}
