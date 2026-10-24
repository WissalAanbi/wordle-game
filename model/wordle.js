const fs = require('fs-extra');
const path = require('path');

const script = require('../modules/script');

const words = require('./words');

let make_wordle_model = function (filename = path.resolve("./model/wordle-state.json")) {

    let state = {
        _id: 0,
        wordles: {}
    };

    function save() {

        try {

            fs.writeJSONSync(filename, state, { spaces: 2});
        } catch (err) {
            console.log('Could not save ' + filename, err);
        }
    }

    function load() {

        try {

            state = fs.readJSONSync(filename);
        } catch (err) {
            state = {
            _id: 0,
            wordles: {}
        };
        save();
        }

    }

    function nextId() {
        return "" + state._id++;
    }

    function createWordle() {

        let id = nextId();
    let used = Object.values(state.wordles).map(w => w.word);
    let word;
    do {
        word = words.getRandomWord();
    } while (used.includes(word));

    let wordle = {
        id: id,
        word: word,
        guesses: [],
        maxGuesses: 6
    };

    state.wordles[id] = wordle;
    save();

    return wordle;
}

function guessWordle(id, guess) {
    let w = state.wordles[id];

    if (w) {

        let won = w.guesses.includes(w.word);
        if (won || w.guesses.length >= w.maxGuesses) {
            throw new Error("Game is already over");
        }

        if (guess === undefined) {
            throw new Error("Word is undefined");
        }

        if (typeof guess !== 'string') {
            throw new Error("Invalid guess");
        }

        guess = guess.toLowerCase().trim();

        if (w.guesses.includes(guess)) {
            throw new Error("Word has already been guessed");
        }

        if (guess.length !== 5) {
            throw new Error("Word must be 5 characters long");
        }

        if (!words.isValidWord(guess)) {
            throw new Error("Not a valid dictionary word");
        }

        w.guesses.push(guess);

        save();

        return w;
    } else {
        throw new Error(`Wordle ${id} not found`);
    }
}

    function deleteWordle(id) {

        if (state.wordles[id]){
            delete state.wordles[id];
            save();
            return true;
        }
        return false;
    }

function getWordle(id) {
    let w = state.wordles[id];

    if (!w) return null;

    if (w.word === undefined && w.secret !== undefined) {
        w.word = w.secret;
    }

    if (w.guesses === undefined && w.attempts !== undefined) {
        w.guesses = w.attempts;
    }

    if (w.maxGuesses === undefined) {
        w.maxGuesses = 6;
    }

    if (w.id === undefined) {
        w.id = id;
    }

    return w;
}

    function getAllWordles() {
        return state.wordles;
    }

    function getAllCheckedWordles() {
        return Object.keys(state.wordles).map(getCheckedWordle);
    }

function getCheckedWordle(id) {
    let w = getWordle(id);
    if (!w) return null;

    let result = {
        id: w.id,
        maxGuesses: w.maxGuesses,
        attempts: [],
        won: false,
        done: false
    };

    result.won = w.guesses.includes(w.word);
    result.done = !result.won && w.guesses.length >= w.maxGuesses;

    if (result.won || result.done) {
    result.word = w.word;
    }

    w.guesses.forEach(guess => {
        let errors = script.getErrors(guess, w.word);
        let swapped = script.findSwapped(guess, w.word);

        let feedback = [];

        for (let i = 0; i < guess.length; i++) {
            let color;

            if (swapped[i]) {
                color = "swapped";
            } else if (errors[i]) {
                color = "error";
            } else {
                color = "ok";
            }

            feedback.push({
                char: guess[i],
                color: color
            });
        }

        result.attempts.push({
            guess: guess,
            errors: errors,
            swapped: swapped,
            feedback: feedback
        });
    });

    return result;
}

    load();

    return {
        getAllWordles,
        getAllCheckedWordles,
        getWordle,
        getCheckedWordle,
        createWordle,
        guessWordle,
        deleteWordle
    }

}

module.exports = make_wordle_model;
