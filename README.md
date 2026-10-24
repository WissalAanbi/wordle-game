# Wordle with Express

A Wordle clone built with Express 5 and EJS. It works as a server-rendered web app and as a JSON API, using content negotiation on the same routes. Game state is stored in a JSON file.

## Features

- Start, play and delete games; six guesses per game, with per-letter feedback
- On-screen keyboard
- Statistics on the games list: total, won and lost
- Filter the list by `?filter=active|won|lost`
- Advanced statistics: histogram of guesses per win and the most-used guess words
- Add missing words to the dictionary through a form (`POST /words/en`)
- Definition of the secret word fetched server-side from the Free Dictionary API and shown at the end of a game
- Same routes return HTML or JSON depending on the `Accept` header

## Routes

| Method | Path | Description |
| --- | --- | --- |
| GET | `/wordle` | List games (`?filter=` optional) |
| POST | `/wordle` | Create a new game |
| GET | `/wordle/:id` | Show a game |
| POST | `/wordle/:id/guess` | Submit a guess |
| DELETE | `/wordle/:id` | Delete a game |
| POST | `/words/:language` | Add a word to the dictionary |

## Run it

```
npm install
npm start
```

Then open http://localhost:8989/wordle (set `PORT` to use another port).

## Also included

Earlier front-end projects are served as static pages under `public/`:

- `/static-pages/` – hand-written HTML and CSS pages for a games hub and a tic-tac-toe mock-up
- `/typing-game/` – typing game in vanilla JavaScript
- `/snake-game/` – two-player Snake game

## Structure

```
app.js              Express setup and middleware
routes/             wordle, words and index routers
model/              game state, dictionary (words.txt), JSON persistence
views/              EJS layout and templates
public/             styles, client-side script and the static projects above
```
