const express = require('express');
const router = express.Router();
module.exports = router;

const words = require('../model/words');

const LANGUAGES = ['en'];

router.post('/:language', function(req, res) {
    let language = req.params.language;
    if (!LANGUAGES.includes(language)) {
        return res.status(404).send('Dictionary not found');
    }

    let word = typeof req.body.word === 'string' ? req.body.word.toLowerCase().trim() : undefined;
    let error, message;

    try {

        if (!/^[a-z]{5}$/.test(word || '')) {
            throw new Error('Word must be 5 letters (a-z)');
        }
        words.addWord(word);
        message = `Word "${word}" added to the dictionary`;
    } catch (err) {
        error = err.message;
    }

    res.format({
        'text/html': function() {
            let q = error ? 'error=' + encodeURIComponent(error)
                          : 'message=' + encodeURIComponent(message);
            res.redirect('/wordle?' + q);
        },
        'application/json': function() {
            if (error) return res.status(400).json({ error });
            res.status(201).json({ word });
        },
        'default': function() {
            res.status(406).send('Not Acceptable');
        }
    });
});
