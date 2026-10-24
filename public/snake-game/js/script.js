function formatSeconds(s) {

    if(typeof s !== 'number' || isNaN(s)){
        return "?:??.???";
    }

    const abso = Math.abs(s);
    const minutes = Math.floor(abso / 60);
    const seconds = Math.floor(abso % 60);

    const milliseconds = Math.round((abso % 1) * 1000);

    const sec = String(seconds).padStart(2, '0');
    const milli = String(milliseconds).padStart(3, '0');

    if ( s >= 0 ) {
        return minutes + ":" + sec + "." + milli; } else {
        return "-" + minutes + ":" + sec + "." + milli;
        }
}

function scalarProduct(a, c) {
    if(!Array.isArray(a)){
        return undefined;
    }

    if (typeof c !== 'number' || Number.isNaN(c)) {
        return undefined;
    }

    const n = [];
    for(let i=0; i < a.length; i++){
            if(Number.isNaN(a[i])){
                    return undefined;
                }
        n[i] = a[i] * c;
    }
    return n;
}

function innerProduct(a, b) {
    if(!Array.isArray(a)){
        return undefined;
    }

    if(!Array.isArray(b)){
        return undefined;
    }

    if(a.length != b.length){
        return undefined;
    }

    let sum = 0;
        for(let i=0; i < a.length; i++){
            if((Number.isNaN(a[i])) || (Number.isNaN(b[i]))) {
                    return undefined;
                }
            sum = sum + (a[i] * b[i]);
        }
    return sum;

}

function getErrors(a, b) {

    if (typeof a !== 'string' || typeof b !== 'string') {
        return undefined;
    }

    const result = [];

    for(let i=0; i < a.length; i++){
        if(a[i] !== b[i]){
            result.push(true);
        } else {
            result.push(false);
        }
    }

    return result;
}

function countErrors(a, b) {
    const errors = getErrors(a, b);

    if (errors === undefined) {
        return undefined;
    }

    let count = 0;
    for (let i = 0; i < errors.length; i++) {
        if (errors[i] === true) {
            count++;
        }
    }
    return count;
}

function findSwapped(a, b) {

    if (typeof a !== 'string' || typeof b !== 'string') {
        return undefined;
    }

    const result = [];

    const arrA = [];
    for (let i = 0; i < a.length; i++) {
        arrA.push(a[i]);
    }

    const arrB = [];
    for (let i = 0; i < b.length; i++) {
        arrB.push(b[i]);
    }

    for (let i = 0; i < arrA.length; i++) {
        if (arrA[i] === arrB[i]) {
            result[i] = false;
            arrA[i] = null;
            arrB[i] = null;
        }
    }

    for (let i = 0; i < arrA.length; i++) {
        if (arrA[i] !== null) {
            let foundIndex = -1;

            for (let j = 0; j < arrB.length; j++) {
                if (arrB[j] !== null && arrB[j] === arrA[i]) {
                    foundIndex = j;
                    break;
                }
            }

            if (foundIndex !== -1) {
                result[i] = true;
                arrA[i] = null;
                arrB[foundIndex] = null;
            } else {
                result[i] = false;
            }
        }
    }

    return result;
}

const EMPTY = "_";
const X = "X";
const O = "O";
const INVALID = /[^XO_]/;
const TIE = "tie";

function tttParse(s) {

    if (typeof s !== 'string' || s.length !== 9) {
        return undefined;
    }

    const board = [[], [], []];

    for (let i = 0; i < s.length; i++) {
        if (i < 3) {
            board[0].push(s[i]);
        } else if (i < 6) {
            board[1].push(s[i]);
        } else {
            board[2].push(s[i]);
        }
    }

    return board;
}

function tttCheck(s) {
    if (typeof s !== 'string' || s.length !== 9) {
        return false;
    }
    for (let i = 0; i < s.length; i++) {
        const char = s[i];
        if (char !== '_' && char !== 'X' && char !== 'O') {
            return false;
        }
    }
    return true;
}

function tttIsGameOver(m) {

    if (!Array.isArray(m)) {
        return false;
    }
    for (let r = 0; r < m.length; r++) {

        for (let c = 0; c < m[r].length; c++) {
            if (m[r][c] === '_') {
                return false;
            }
        }
    }

    return true;
}

function tttGetWinner(m) {

    if (!Array.isArray(m)) {
        return "";
    }

    for (let r = 0; r < 3; r++) {
        if (m[r][0] !== '_' && m[r][0] === m[r][1] && m[r][1] === m[r][2]) {
            return m[r][0];
        }
    }

    for (let c = 0; c < 3; c++) {
        if (m[0][c] !== '_' && m[0][c] === m[1][c] && m[1][c] === m[2][c]) {
            return m[0][c];
        }
    }

    if (m[0][0] !== '_' && m[0][0] === m[1][1] && m[1][1] === m[2][2]) {
        return m[0][0];
    }

    if (m[0][2] !== '_' && m[0][2] === m[1][1] && m[1][1] === m[2][0]) {
        return m[0][2];
    }

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (m[r][c] === '_') {
                return "";
            }
        }
    }

    return "tie";
}

function startClock(t0) {

    if (typeof t0 !== 'number') {
        return undefined;
    }

    return function getElapsedTime(t) {
        if (typeof t !== 'number') {
            return undefined;
        }

        return t - t0;
    }
}

function iterator(a) {
    if (!Array.isArray(a)) {
        return undefined;
    }

    let arr = a;
    let index = 0;

    return function next(b) {

        if (b === undefined) {
            if (index >= arr.length) {
                throw new Error("there are no more Array elements");
            }
            const element = arr[index];
            index = index + 1;
            return element;
        }

        if (Array.isArray(b) === true) {
            arr = b;
            index = 0;
            return next;
        }

        if (typeof b === 'number' && Number.isInteger(b) === true) {
            index = index + b;
            return index;
        }
    }
}

function makeDelay(time = 500) {

    if (time < 0) {
        throw new Error("time duration cannot be negative");
    }

    let timer = null;

    return function(callback){

        if(timer !== null){
            clearTimeout(timer);
        }
        timer = setTimeout(callback, time);
    }
}

function button_start_click(event) {
    logFunctionArguments(arguments);

    currentLev = 1;
    document.querySelector('.level span').textContent = '001';

    getElapsedTime = startClock(performance.now());

    stopTimer = startTimer(tick);

    challenge = pickRandomChallenge();

    displayChallenge(challenge);

    emptyInput();

    input_text.disabled = false;

    focusInput();

    score();

}

function txt_input(event) {
    logFunctionArguments(arguments);

    const typed = input_text.value;

    const currentChallenge = challenge;

    const errors = getErrors(typed, currentChallenge);
    const errorCount = countErrors(typed, currentChallenge);

    if (typed.length > 0 && errors[typed.length - 1] === false) {
        score(1);
    }

    displayChallenge(currentChallenge, errors);

    if (typed.length > 0) {

        displayErrors(1 - (errorCount / typed.length));
    } else {
        displayErrors(0);
    }

    if (typed.length >= currentChallenge.length) {

        input_text.disabled = true;

        gameOver();
    }
}

function logFunctionArguments(a) {

    console.log(`${a.callee.name}(${Array.from(a).map(j => JSON.stringify(j)).join(", ")})`)

}

function button_quit_click(event){

    logFunctionArguments(arguments);

    gameOver();
    input_text.disabled = true;
}

let currentLev = 1

function button_next_click(event){
    logFunctionArguments(arguments);

    currentLev+=1;
    document.querySelector('.level span').textContent = String(currentLev).padStart(3, '0');

    challenge = pickRandomChallenge();
    displayChallenge(challenge);

    emptyInput();
    input_text.disabled = false;
    focusInput();
}

function init_high_scores() {

    const scoresList = document.querySelector("#scores-list");

    if (!scoresList) {
        return;
    }

    scoresList.innerHTML = "";

    const rawScores = localStorage.getItem("high_scores");

    if (!rawScores) {
        return;
    }

    const results = JSON.parse(rawScores);

    results.forEach(result => {

        const li = document.createElement("li");

        li.textContent =
            `${result.player}: ${result.score} (${formatSeconds(result.time)})`;

        scoresList.appendChild(li);
    });
}

window.addEventListener("storage", () => {
    init_high_scores();
});
