let carNames = [];
let lastKM = [];
let lastDate;
let currentKM = [];
const d = new Date();
const day = d.getDate();
const m = d.getMonth() + 1;
const y = d.getFullYear();
const currentDate = `${day}\/${m}\/${y}`;

const tbody = document.querySelector('#tbody');
const btn = document.getElementById("saveData");

checkZavCode();



function checkZavCode() {
    const zavCode = prompt("תכניס קוד של צב  התנועה");
    if (zavCode != 3144){
         alert("קוד לא נכון. נסה שנית.");
         checkZavCode()
    }else{
        loadEventListeners();
    }
    
}

function loadEventListeners() {
    document.addEventListener('DOMContentLoaded', getCarNames);
    btn.addEventListener('click', saveData);
}


// פונקצינ כללי לשליחת ברשת post
function post(url, data) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(data => resolve(data))
            .catch(err => reject(err));
    });
}
// פנקציה שקוראת את שמות הרכבים של צב התנועה
async function getCarNames() {
    await post('https://powerful-plains-19345.herokuapp.com/http://tsavhatnuatavel.appspot.com/getvalue?tag=רכבי צב התנועה').then(function (v) {
        carNames = v[2].replace(/\"/g, '').split(','); // הופך את שמות הרכבים לארי
    });
    //קוראה לפנקציה שלוקחת את הנתונים של הרכבים
    getCarData();
}


async function getCarData() {
    // קריאה של התאריך האחרון שבוא קראו את נתונים
    await post(`https://powerful-plains-19345.herokuapp.com/http://tsavhatnuatavel.appspot.com/getvalue?tag=תאריך_קודם`).then(function (v) {
        lastDate = v[2].replace(/\"/g, '').replace(/\\/g, '');
    });
    // לולאה שעוברת על כל רכב
    for (let i = 0; i < carNames.length; i++) {
        // קריאה של הק"מ מהפעם הקודמת
        await post(`https://powerful-plains-19345.herokuapp.com/http://tsavhatnuatavel.appspot.com/getvalue?tag=${carNames[i]}_קמ_קודם`)
            .then(function (v) {
                lastKM.splice(i, 0, v[2].replace(/\"/g, ''));

            });

        //קריאה של הק"מ הנוכחי
        await post(`https://powerful-plains-19345.herokuapp.com/http://tsavhatnuatavel.appspot.com/getvalue?tag=${carNames[i]}_Start_kiometers`)
            .then(function (v) {
                currentKM.splice(i, 0, v[2].replace(/\"/g, ''));
            });

        //הכמנס של הנתונים לטבלה במסך 
        // Create tr element
        const row = document.createElement('tr');
        // Insert cols
        row.innerHTML = `
            <th scope="row">${carNames[i]}</th>
            <td dir="ltr">${lastDate}</td>
            <td>${lastKM[i]}</td>
            <td dir="ltr">${currentDate}</td>
            <td>${currentKM[i]}</td>
            `;

        tbody.appendChild(row);
        // מסיים את התהליך. מופיע הפתור השמור וכותרת משתנה
        if (i === carNames.length - 1) {
            btn.style.display = "block";
            const h1 = document.querySelector("h1").innerText = 'סיים לקרוא נתונים';
        };
    }
}
// פןנקציה לשלמירה של הנתונים פועלת בכפתור
async function saveData() {
    // שמירה של התאריך הקודם 
    await post(`https://powerful-plains-19345.herokuapp.com/http://tsavhatnuatavel.appspot.com/storeavalue?tag=תאריך_קודם&value="${currentDate}"`)
        .catch(err => console.log(err));
    //שמירה של הק"מ הקודם לכול רכב
    for (let i = 0; i < carNames.length; i++) {
        await post(`https://powerful-plains-19345.herokuapp.com/http://tsavhatnuatavel.appspot.com/storeavalue?tag=${carNames[i]}_קמ_קודם&value="${currentKM[i]}"`)
            .catch(err => console.log(err));

    };
}