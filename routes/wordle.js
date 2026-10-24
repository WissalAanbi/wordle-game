const express = require('express');
const router = express.Router();
module.exports = router;

const wordleModel = require('../model/wordle')();

function toApi(wordle) {

    const { word, ...rest } = wordle;
    rest.attempts = rest.attempts.map(({ guess, feedback }) => ({ guess, feedback }));
    return rest;
}

router.get('/', function(req, res) {

    let all = wordleModel.getAllCheckedWordles();

    let stats = {
        total: all.length,
        won: all.filter(w => w.won).length,
        lost: all.filter(w => w.done).length,
        active: all.filter(w => !w.won && !w.done).length
    };

    let histogram = {};
    for (let i = 1; i <= 6; i++) histogram[i] = 0;
    all.filter(w => w.won).forEach(w => { histogram[w.attempts.length] = (histogram[w.attempts.length] || 0) + 1; });

    let counts = {};
    all.forEach(w => w.attempts.forEach(a => { counts[a.guess] = (counts[a.guess] || 0) + 1; }));
    let topGuesses = Object.entries(counts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 10);

    let filter = req.query.filter;
    let wordles = all;
    if (filter === 'active') wordles = all.filter(w => !w.won && !w.done);
    else if (filter === 'lost') wordles = all.filter(w => w.done);
    else if (filter === 'won') wordles = all.filter(w => w.won);
    else filter = undefined;

    res.format({
        'text/html': function() {
            res.render('layout', {content: "wordle/list", wordles, stats, filter, histogram, topGuesses,
                error: req.query.error, message: req.query.message});
        },
        'application/json': function() {

           res.json(wordles.map(toApi));
        },
        'default': function() {
            res.status(406).send('Not Acceptable');
        }
    });

});

const definitions = {};
async function getDefinition(word) {
    if (word in definitions) return definitions[word];
    let result = null;
    try {
        let r = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word),
            { signal: AbortSignal.timeout(3000) });
        if (r.ok) {
            let data = await r.json();
            result = data[0].meanings[0].definitions[0].definition;
        }
    } catch (err) {

        return null;
    }
    definitions[word] = result;
    return result;
}

router.get('/:id', async function(req, res) {

    let id = req.params.id;
    let wordle = wordleModel.getCheckedWordle(id);

    if (!wordle) {
        return res.redirect('/wordle');
    }

    let definition = null;
    if (wordle.won || wordle.done) {
        let secret = wordleModel.getWordle(id).word;
        definition = await getDefinition(secret);
    }

    res.format({
        'text/html': function() {
            res.render('layout', {
                content: 'wordle/show',
                wordle,
                definition,
                error: req.query.error,
                message: req.query.message
            });
        },
        'application/json': function() {
            res.json(toApi(wordle));
        },
        'default': function() {
            res.status(406).send('Not Acceptable');
        }
    });
});

router.post('/', function(req, res) {

    let w = wordleModel.createWordle();

    res.format({
        'text/html': function() {
            res.redirect('/wordle/' + w.id);
        },
        'application/json': function(){

            res.status(200).json(toApi(wordleModel.getCheckedWordle(w.id)));
        },
        'default': function() {
            res.status(406).send('Not Acceptable');
        }
    });

});

router.post('/:id/guess', function(req, res){
    let id = req.params.id;

    if (!wordleModel.getWordle(id)) {
        return res.status(404).send('Wordle not found');
    }

    let guess = req.body ? req.body.guess : undefined;
    if (guess === undefined) {
        return res.status(400).send('Missing guess');
    }

    try{
        let w = wordleModel.guessWordle(id, guess);
        res.format({
            'text/html': function() {
                res.redirect('/wordle/' + id);
            },
            'application/json': function() {
               res.json(toApi(wordleModel.getCheckedWordle(id)));
            },
            'default': function() {
                res.status(406).send('Not Acceptable');
            }
        });
    } catch (err) {
    if (err.message.includes('not found')) {
        return res.status(404).send(err.message);
    }

    return res.format({
        'text/html': function() {
            res.redirect(
                '/wordle/' + id + '?error=' +
                encodeURIComponent(err.message)
            );
        },
        'application/json': function() {
            res.status(200).json({
        error: err.message,
        wordle: toApi(wordleModel.getCheckedWordle(id))
    });
        },
        'default': function() {
            res.status(406).send('Not Acceptable');
        }
    });
    }
});

router.delete('/:id', function(req, res) {
    let id = req.params.id;

    let deleted = wordleModel.deleteWordle(id);

    if (!deleted) {
        return res.status(404).send("Wordle not found");
    }

    res.format({
        'text/html': function() {
            res.redirect('/wordle');
        },
        'application/json': function() {
            res.status(204).send();
        },
        'default': function() {
            res.status(406).send('Not Acceptable');
        }
    });
});
