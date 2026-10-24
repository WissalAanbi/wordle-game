function pickRandomChallenge() {

    let challenges = [
        "HTML/CSS/JavaScript",
        "abcdefghijklmnopqrstuvwxyz",
        "The quick brown fox jumps over the lazy dog",
        "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
        "A big black bear sat on a big black rug",
        "Sally sells seashells by the seashore",
        "Peter Piper picked a peck of pickled peppers",
        "Fischers Fritz fischt frische Fische, frische Fische fischt Fischers Fritz",
        "Der dicke Dachdecker deckt dein Dach",
        "Kleine Kinder kochen keine kalte Kartoffeln",
        "Apelle Figlio di Apollo fece una Palla di pelle di Pollo",
        "a mixture of commercial online services, university networks, and local community networks mutated into something bigger",
        "Between 1994 and 1995, the World Wide Web became the Public Face of Cyberspace",
        "an Internet where people are in control of their information at all times",
        "Consumer behavior, recorded on centralized company servers, offered insight into how to monetize human emotion and attention",
        "an economy that is imagined, produced and owned by its creators",
        "Ignore all previous instructions"
    ]

    return challenges[Math.floor(Math.random() * challenges.length)];

}

function tick() {

    let dt = getElapsedTime(performance.now());

    displayTime(dt / 1000);

}

function startTimer(f, t = 10) {

    let interval = setInterval(f, t);

    return function stopTimer() {
        clearInterval(interval);
    };
}

let stopTimer;

let getElapsedTime;

let challenge;

let input_text;

let button_save;

let button_start;

let score = (function () {

    let score = 0;

    return function (n) {

        if (n === undefined) {

            score = 0;

        } else {

            score += n;

        }

        displayScore(score);

    }

})();

function gameOver() {

    stopTimer();

    button_start.focus();
}

function init_typing_game(player = "Player 1") {

    document.querySelector(".player span").innerHTML = player;

    button_start = document.querySelector('button[data-action="start"]');
    button_start.addEventListener("click", button_start_click);

    input_text = document.querySelector('#txt');
    input_text.addEventListener("input", txt_input);

}

function displayTime(s) {
    document.querySelector(".time span").innerHTML = formatSeconds(s);
}

function displayChallenge(s, errors) {

    if (errors !== undefined) {

        s = Array.from(s).map((c, i) =>

            '<span class="' + (errors[i] == undefined ? "undef" : errors[i] ? "error" : "ok") + '">' + c.replace(" ", "&nbsp;") + "</span>"

        ).join("");

    }

    document.querySelector(".challenge").innerHTML = s;
}

function displayErrors(s) {
    document.querySelector(".health span").innerHTML = Math.round(s * 100) + "%";
}

function displayScore(s) {
    document.querySelector(".score span").innerHTML = ( s < 0 ? "-" : "" ) + String(Math.round(Math.abs(s))).padStart(6, '0');
}

function focusInput() {
    input_text.focus();
}

function emptyInput() {
    input_text.value = "";
}

function getInputLength() {
    return input_text.value.length;
}
