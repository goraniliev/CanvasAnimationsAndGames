/**
 * Created by goran on 8/19/16.
 */

var context;
var WIDTH = 800, HEIGHT = 400;
var LEFT = 10, UP = 10;
var canvas;
var canvasDiv;
var ball;
var canvasWidth = 1000, canvasHeight = 600;
var RIGHT = LEFT + WIDTH, DOWN = UP + HEIGHT;
var RADIUS = 20;
var MOD = 200;
var myBall;
var lbScore;
var balls = Array();
var count = 0;
var score = 0;

function drawRect() {
    context.fillStyle = "black";
    context.strokeRect(LEFT, UP, WIDTH, HEIGHT);
}

function prepareCanvas(canvasWidth, canvasHeight) {
    canvasDiv = document.getElementById('canvasDiv');

    lbScore = document.createElement('label');
    lbScore.textContent = 'Score: 0';
    document.body.appendChild(lbScore);


    canvas = document.createElement('canvas');
    canvas.setAttribute('width', canvasWidth);
    canvas.setAttribute('height', canvasHeight);
    canvas.setAttribute('id', 'canvas');
    canvasDiv.appendChild(canvas);

    if (typeof G_vmlCanvasManager != 'undefined') {
        canvas = G_vmlCanvasManager.initElement(canvas);
    }

    context = canvas.getContext("2d")
}

function init() {
    prepareCanvas(canvasWidth, canvasHeight);
    drawRect();

    myBall = new ball(50, 50, RADIUS, 'green', 2, 0);
    moveRight(myBall);
    setInterval(draw, 15);
}

function addBall() {
    balls.push(randomBall());
}

function draw() {
    if(count === 0) {
        addBall();
    }
    count = (count + 1) % MOD;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    myBall.move();
    drawRect();
    myBall.draw();
    for(var i in balls) {
        balls[i].draw();
    }
}

function dist(a, b) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

ball = function(x, y, r, c, dx, dy) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = c;
    this.dx = dx;
    this.dy = dy;
    this.opened = true;
    this.circle = function() {
        context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, true);
    };

    this.closedCycles = 0;

    this.move = function() {
        var nextX = this.x + this.dx;
        var nextY = this.y + this.dy;

        if(nextX + this.r > RIGHT) {
            moveLeft(this);
        }

        if(nextX < LEFT + this.r) {
            moveRight(this);
        }

        if(nextY + this.r > DOWN) {
            moveUp(this);
        }

        if(nextY < UP + this.r) {
            moveDown(this);
        }

        this.x += this.dx;
        this.y += this.dy;
        var newBalls = Array();
        for(var i in balls) {
            if(!this.hit(balls[i])) {
                newBalls.push(balls[i]);
            }
            else {
                score++;
                lbScore.textContent = "Score: " + score;
            }
        }
        balls = newBalls;
    }

    this.draw = function() {
        this.closedCycles = (this.closedCycles + 1) % 20;
        context.beginPath();
        context.fillStyle = this.color;
        if(this.closedCycles === 0) {
            this.opened = !this.opened;
        }
        if(this.opened) {
            this.circle();
        }
        else {
            context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, true);
        }
        context.lineTo(this.x, this.y);
        context.stroke();
        context.closePath();
        context.fill();
    }

    this.hit = function(other_ball) {
        return dist(this, other_ball) < this.r + other_ball.r;
    }
}

function randomBall() {
    var xPos = Math.random() * (WIDTH - 2 * RADIUS) + LEFT + RADIUS;
    var yPos = Math.random() * (HEIGHT - 2 * RADIUS) + UP + RADIUS;
    return new ball(xPos, yPos, RADIUS / 3, 'red', 0, 0);
}

function moveUp(b) {
    b.dx = 0;
    b.dy = -2;
    b.circle = function() {
        context.arc(b.x, b.y, b.r, -2 * Math.PI / 3.0, -Math.PI / 3.0, true);
    }
}

function moveDown(b) {
    b.dx = 0;
    b.dy = 2;
    b.circle = function() {
        context.arc(b.x, b.y, b.r, 2 * Math.PI / 3.0, Math.PI / 3.0, false);
    }
}

function moveLeft(b) {
    b.dx = -2;
    b.dy = 0;
    b.circle = function() {
        context.arc(b.x, b.y, b.r, 7 * Math.PI / 6.0, -7 * Math.PI / 6.0, false);
    }
}

function moveRight(b) {
    b.dx = 2;
    b.dy = 0;
    b.circle = function() {
        context.arc(b.x, b.y, b.r, Math.PI / 6.0, -Math.PI / 6.0, false);
    }
}

// left 37, up - 38, right - 39, down - 40
$(document).keydown(function(event){
    switch(event.which) {
        case 37:
            moveLeft(myBall);
            break;
        case 38:
            moveUp(myBall);
            break;
        case 39:
            moveRight(myBall);
            break;
        case 40:
            moveDown(myBall);
            break;
    }

});

window.addEventListener("load", init, true);