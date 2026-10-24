class Game {

    #score = 0;
    #health = 0;

    constructor(player) {

        this.running = false;
        this.player = player;

        this.displayPlayer(player);
    }

    startGame() {
        this.running = true;
        this.score = 0;
        this.health = 100;
        this.time = performance.now();

        this.timer = setInterval(this.timer_tick.bind(this), 10);

        document.body.classList.add("playing");
    }

    stopGame() {
        this.running = false;
        clearInterval(this.timer);

        document.body.classList.remove("playing");

        document.dispatchEvent(new CustomEvent("game.over", { detail:

            { player: this.player,
               score: this.score,
                time: this.getElapsedTime() }
        }));
    }

    getElapsedTime() {
        return (performance.now() - this.time) / 1000;
    }

    timer_tick() {
        this.displayTime(this.getElapsedTime())
    }

    set score(s) {
        this.#score = s;

        this.displayScore(s);

        document.dispatchEvent(new CustomEvent("game.score", { detail: { score: this.score } }));
    }

    get score() {
        return this.#score;
    }

    set health(h) {
        this.#health = h;

        if (this.health <= 0) {

            this.stopGame();

        }

        this.displayHealth(h);

        document.dispatchEvent(new CustomEvent("game.health", { detail: { health: this.health } }));
    }

    get health() {
        return this.#health;
    }

    displayScore(s) {
        document.querySelector(".score span").innerHTML = (s < 0 ? "-" : "") + String(Math.round(Math.abs(s))).padStart(6, '0');
    }

    displayHealth(s) {
        document.querySelector(".health span").innerHTML = Math.round(s) + "%";
    }

    displayPlayer(s) {

            document.querySelector(".player span").innerHTML = s;
    }

    displayTime(s) {
        document.querySelector(".time span").innerHTML = formatSeconds(s);
    }

}

class CanvasGame extends Game {

    constructor(player, canvas) {
        super(player)

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    clearCanvas() {

        this.ctx.fillStyle = "black";

        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    paintCanvas() {
        this.clearCanvas();

        if (this.running) {
            requestAnimationFrame(this.paintCanvas.bind(this));
        }
    }

    startGame() {

        super.startGame();
        requestAnimationFrame(this.paintCanvas.bind(this))
    }

}

class SnakeGame extends CanvasGame {

    constructor(player, canvas, initial_length = 5) {
        super(player, canvas);

        this.snake = new Snake(initial_length,
            this.getCanvasBound(canvas),
            { x: canvas.width / 2, y: canvas.height / 2 },
            { dx: 1, dy: 0 });

        this.snake2 = new Snake(initial_length,
            this.getCanvasBound(canvas),
            { x: canvas.width / 2, y: canvas.height / 2 + 50},
            { dx: 1, dy: 0 });

        this.food = [new Food(this.getCanvasBound(canvas)),
                    new Food(this.getCanvasBound(canvas)),
                    new Food(this.getCanvasBound(canvas)),
                    new Food(this.getCanvasBound(canvas)),
                    new Food(this.getCanvasBound(canvas))];
    }

    getCanvasBound(canvas = this.canvas) {
        return { left: 0, top: 0, width: canvas.width, height: canvas.height };
    }

    paintCanvas() {
        super.paintCanvas();
        this.snake.paint(this.ctx);
        this.snake2.paint(this.ctx);
        this.food.forEach(food => food.paint(this.ctx));
    }

    startGame() {
        super.startGame();

        this.snake.reset();

        this.snake_interval = setInterval(this.tick.bind(this), 25);

        this.snake2_interval = setInterval(this.tick2.bind(this), 25);

    this.food_interval = setInterval(this.food_tick.bind(this), 5000);

    this.keydownHandler = this.keydown.bind(this);

    window.addEventListener("keydown", this.keydownHandler);
    }

    stopGame() {
        super.stopGame();
        clearInterval(this.snake_interval);
        clearInterval(this.snake2_interval);

        clearInterval(this.food_interval);

        if(this.keydownHandler){
            window.removeEventListener("keydown", this.keydownHandler);
        }
    }

    tick() {
        if (!this.snake.move()) {
            this.health--;
            return;

        } else {

            this.food_check(this.snake);

        }

    }

    tick2() {
        if (!this.snake2.move()) {
            this.health--;
            return;

        } else {

            this.food_check(this.snake2);

        }

    }

    food_check(snake) {

        for(let food of this.food){

        if(food.hit(snake)){

        snake.eat(food);

        this.score++;

        this.food_tick();

        clearInterval(this.snake_interval);

        let new_speed = Math.max(10, 25 - Math.floor(this.score / 2));

        this.snake_interval = setInterval(this.tick.bind(this), new_speed);
        }
    }

    }

    food_tick() {

        this.food.forEach(food => food.reset());
    }

    keydown(event) {

        if (!this.running) return;

        event.preventDefault();

        const LEFT_KEY = 37;
        const RIGHT_KEY = 39;
        const UP_KEY = 38;
        const DOWN_KEY = 40;

        const A_KEY = 65;
        const D_KEY = 68;
        const W_KEY = 87;
        const S_KEY = 83;

        const key = event.keyCode;

        if (key == LEFT_KEY && this.snake.velocity.dx !== 1) {
            this.snake.goLeft();
        }
        if (key == RIGHT_KEY && this.snake.velocity.dx !== -1) {
            this.snake.goRight();
        }
        if (key == DOWN_KEY && this.snake.velocity.dy !== -1) {
            this.snake.goDown();
        }

        if (key == UP_KEY && this.snake.velocity.dy !== 1) {
            this.snake.goUp();
        }

        if (key == A_KEY && this.snake2.velocity.dx !== 1) {
            this.snake2.goLeft();
        }

        if (key == D_KEY && this.snake2.velocity.dx !== -1) {
            this.snake2.goRight();
        }

        if (key == S_KEY && this.snake2.velocity.dy !== -1) {
            this.snake2.goDown();
        }

        if (key == W_KEY && this.snake2.velocity.dy !== 1) {
            this.snake2.goUp();
        }

    }
}

class Snake {

    constructor(len, bound, pos, velocity ) {
        this.bound = bound;
        this.reset(len, pos, velocity);

    }

    reset(len = 5, pos = { x: this.bound.width / 2, y: this.bound.height / 2 }, velocity = { dx: 1, dy: 0 }) {
        this.length = len;
        this.position = [pos];
        this.velocity = velocity;
        this.color = "white";
    }

    goLeft() {

        this.velocity = { dx: -1, dy: 0 };
    }

    goRight() {
        this.velocity = { dx: +1, dy: 0 };
    }

    goDown() {
        this.velocity = { dx: 0, dy: 1 };
    }

    goUp() {
        this.velocity = { dx: 0, dy: -1 };
    }

    move() {
        let result = true;

        let old_pos = { ...this.position[0] };
        let new_pos = {
            x: old_pos.x + this.velocity.dx,
            y: old_pos.y + this.velocity.dy,
        }

    if (new_pos.x >= this.bound.left + this.bound.width) {
        result = false;
        new_pos.x = this.bound.left;
        new_pos.y = Math.floor(Math.random() * this.bound.height);
    }

    if (new_pos.x < this.bound.left) {
        result = false;
        new_pos.x = this.bound.left + this.bound.width - 1;
        new_pos.y = Math.floor(Math.random() * this.bound.height);
    }

    if (new_pos.y >= this.bound.top + this.bound.height) {
        result = false;
        new_pos.y = this.bound.top;
        new_pos.x = Math.floor(Math.random() * this.bound.width);
    }

    if (new_pos.y < this.bound.top) {
        result = false;
        new_pos.y = this.bound.top + this.bound.height - 1;
        new_pos.x = Math.floor(Math.random() * this.bound.width);
    }

        if (this.position.some(p => p.x == new_pos.x && p.y == new_pos.y)) {
            result = false;
        }

        this.position.unshift(new_pos);
        if (this.position.length > this.length) {
            this.position.pop();
        }
        return result;
    }

    eat(food) {

        this.length += food.length;

            this.color = food.colorString;
    }

    paint(ctx) {
        this.position.forEach((p) => {

            ctx.fillStyle = this.color || "white";
            ctx.fillRect(p.x, p.y, 1, 1);

        });
    }

}

class Food {

    constructor(bound) {

        this.bound = bound;

        this.reset(bound);
    }

    reset(bound = this.bound) {
        function getRandom(min, max) {
            return Math.round((Math.random() * (max - min) + min));
        }

        if (bound) {
            this.bound = bound;
        }

        this.size = {
            w: getRandom(2, 10),
            h: getRandom(2, 10)
        };

        this.position = {
            x: getRandom(this.bound.left, this.bound.left + this.bound.width - this.size.w),
            y: getRandom(this.bound.top, this.bound.top + this.bound.height - this.size.h)
        };

        this.color = { h: getRandom(0, 360), s: getRandom(60, 100), l: getRandom(40, 60) };
    }

    get colorString() {

        return `hsl(${this.color.h}deg ${this.color.s}% ${this.color.l}%)`;
    }

    get length() {
        return this.size.w * this.size.h;
    }

    paint(ctx) {

        ctx.fillStyle = this.colorString;
        ctx.fillRect(this.position.x, this.position.y, this.size.w, this.size.h);

    }

    makeRect() {
        return { left: this.position.x, top: this.position.y, width: this.size.w, height: this.size.h };
    }

    hit(snake) {

        let head = snake.position[0];

        if (!head) {
            return false;
        }

        return detectCollisionRect(head.x, head.y, this.makeRect());
    }

    overlap(snake) {

        return snake.position.some(p => detectCollisionRect(p.x, p.y, this.makeRect()));
    }

}

function init_snake_game() {

    let canvas = document.querySelector("canvas");

    let params = new URLSearchParams(window.location.search);
    let player = params.get("player") || "Player";

    let snake_game = new SnakeGame(player, canvas);

    let start_button = document.querySelector('button[data-action="start"]');
    start_button.addEventListener("click", (event) => {

        snake_game.startGame();

    });

}

document.addEventListener("game.over", (event) => {
    let data = event.detail;

    let rawScores = localStorage.getItem("high_scores");
    let scoreList = rawScores ? JSON.parse(rawScores) : [];

    scoreList = scoreList.filter(score =>
        score &&
        typeof score.player === "string" &&
        typeof score.score === "number" &&
        Number.isFinite(score.score) &&
        score.score >= 0 &&
        typeof score.time === "number" &&
        Number.isFinite(score.time)
    );

    scoreList.push(data);

    scoreList.sort((a,b) => b.score - a.score);

    localStorage.setItem("high_scores", JSON.stringify(scoreList));

    console.log("High scores updated:", scoreList);
});

function detectCollisionRect(x, y, rect) {

    return (rect.left <= x) && (x <= rect.left + rect.width) && (rect.top <= y) && (y <= rect.top + rect.height);

}
