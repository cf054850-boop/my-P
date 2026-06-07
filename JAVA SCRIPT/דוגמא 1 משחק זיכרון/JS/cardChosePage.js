//אם לא נרצה לשנות ניתובי תמונה- ניצור מערך תמונות הכוללות את כל הניתובים
// בדוגמא זו , הניתונים הם לפי מספרים עוקבים
const picArr=["1.jpg","2.jpg","3.jpg","4.jpg","5.jpg","6.jpg","7.jpg","8.jpg","9.jpg","10.jpg","11.jpg","12.jpg","13.jpg","14.jpg","15.jpg","16.jpg","17.jpg","18.jpg"]
// פונקציה שתיצור דיבים עם תמונות, לבחירת המשתמש אלו כרטיבסים מעונין
const picChosen=[];
function createPicCard(picArr){
    // לולאה שעוברת על המערך
    for (const img of picArr) {
        // יצירת אלמנט
        const imgElement=document.createElement("img");
        // הוספת הגדרות
        imgElement.style.height="150px";
        imgElement.src=`../PIC/${img}`;
        imgElement.onclick=choosePic;
           // imgElement.src=`../PIC/${img}`;//הוספת ניתוב לתמונה
        // הוספתו לדף ה HTML
        document.querySelector("#containerPics").append(imgElement);


    }
}
//  debugger
createPicCard(picArr);

// כל לחיצה- מוסיפה את הניתוב הזה למערך
function choosePic(){
picChosen.push(this.src);
console.log(picChosen)
}

// הוספת המערך הזה  ל
// localStorage

