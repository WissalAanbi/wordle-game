const fs = require('fs-extra');
const path = require('path');

let words = fs.readFileSync(path.resolve('model', 'words.txt'), 'utf-8').split('\n');

console.log("Loaded " + words.length + " words");

function getRandomWord() {
    return words[Math.floor(Math.random() * words.length)];
}

function getWords() {
    return [...words];
}

function isValidWord(w) {
    return w && w.length == 5 && words.includes(w);
}

function save() {
    fs.writeFileSync(path.resolve('model', 'words.txt'), words.join('\n'));
}

function addWord(w) {

    if (w === undefined) {
        throw new Error("Word is undefined");
    }
    if (w.length != 5) {
        throw new Error("Word must be 5 characters long");
    }
    if (words.includes(w)) {
        throw new Error("Word already exists");
    }

    words.push(w);
    words = words.sort();
    save();
}

module.exports = {
    getWords,
    getRandomWord,
    isValidWord,
    addWord
}
