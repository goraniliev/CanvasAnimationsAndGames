/**
 * Created by goran on 8/17/16.
 */

var WIDTH = 700, HEIGHT = 250;

var canvas;
var context;
var images = {};
var charX = 245;
var numResourcesLoaded = 0, totalResources = 8;
var jumping = false;
var fps = 30;
var blinked = false;
var BALL_Y = 185, BALL_X = 1000;

var HEAD_LAND = 40, HEAD_JUMP = 5;

function prepareCanvas(canvasDiv, canvasWidth, canvasHeight) {
    // Create the canvas. neccessary for IE becasuse it doesn't know what a canvas element is.
    canvas = document.createElement('canvas');
    canvas.setAttribute('width', canvasWidth);
    canvas.setAttribute('height', canvasHeight);
    canvas.setAttribute('id', 'canvas');
    canvasDiv.appendChild(canvas);
    canvasDiv.styleFloat = "left";
    document.getElementsByClassName('actionBar').styleFloat = "left";

    if (typeof G_vmlCanvasManager != 'undefined') {
        canvas = G_vmlCanvasManager.initElement(canvas);
    }

    context = canvas.getContext("2d") // Grab the 2d canvas context
    // Note: The above code is a workarount for IE 8 and lower. Otherwise we could have used
    //context = document.getElementById('canvas').getContext('2d');

    canvas.width = canvas.width; // Clears the canvas

    var image_names = 'head leftArm leftArm-jump legs legs-jump rightArm rightArm-jump torso'.split(' ');
    for (var image in image_names) {
        loadImage(image_names[image]);
    }

}


function loadImage(name) {
    images[name] = new Image();
    images[name].onload = function () {
        resourceLoaded();
    }
    images[name].src = "images/zombie-" + name + ".png";
}

function resourceLoaded() {
    numResourcesLoaded += 1;
    if (numResourcesLoaded === totalResources) {
        setInterval(redraw, 1000 / fps);
    }
}

function drawEllipse(centerX, centerY, width, height) {
    context.beginPath(); // Start a path

    context.moveTo(centerX, centerY - height / 2); // Move to the top

    // Make 2 bezier arcs for the left and right side of the elipse
    context.bezierCurveTo(
        centerX + width / 2, centerY - height / 2,
        centerX + width / 2, centerY + height / 2,
        centerX, centerY + height / 2
    );

    context.bezierCurveTo(
        centerX - width / 2, centerY + height / 2,
        centerX - width / 2, centerY - height / 2,
        centerX, centerY - height / 2
    );

    // fill the elipse
    context.fillStyle = "black";
    context.fill();

    // close the path
    context.closePath();
}

function circle(x, y) {
    context.beginPath();
    context.fillStyle = 'black';
    context.arc(x, y, 3, 0, 2 * Math.PI, true);
    context.closePath();
    context.fill();
}

function eyes(x, y) {
    if(blinked) {
        circle(x, y);
        circle(x + 20, y);
        setTimeout(unblink, 500);
    }
    else {
        drawEllipse(x, y, 5, 10);
        drawEllipse(x + 20, y, 5, 10);
    }
}
var ball;
function redraw() {
    context.clearRect(0, 0, WIDTH, HEIGHT);
    if(numResourcesLoaded === totalResources) {
        if(jumping) {
            context.drawImage(images['leftArm-jump'], charX, HEAD_JUMP + 90);
            context.drawImage(images['torso'], charX - 20, HEAD_JUMP + 80);
            context.drawImage(images['head'], charX - 35, HEAD_JUMP);
            eyes(charX + 17, HEAD_JUMP + 55);
            context.drawImage(images['rightArm-jump'], charX - 35, HEAD_JUMP + 85);
            context.drawImage(images['legs-jump'], charX - 20, HEAD_JUMP + 125);
            setTimeout(land, 700);
        }
        else {
            context.drawImage(images['leftArm'], charX, HEAD_LAND + 90);
            context.drawImage(images['torso'], charX - 20, HEAD_LAND + 80);
            context.drawImage(images['head'], charX - 35, HEAD_LAND);
            eyes(charX + 17, HEAD_LAND + 55);
            context.drawImage(images['rightArm'], charX - 35, HEAD_LAND + 85);
            context.drawImage(images['legs'], charX - 20, HEAD_LAND + 130);
        }

        drawBall(ball);
        ball.move();
    }


}

function jump() {
    jumping = true;
}

$('.jumpButton').mousedown(function() {
    jump();
});

$('.blinkButton').mousedown(function() {
   blinked = true;
});


function land() {
    jumping = false;
}

function blink() {
    blinked = true;
}

function unblink() {
    blinked = false;
}

var bodyElement;

function init() {
    prepareCanvas(document.getElementById('canvasDiv'), WIDTH, HEIGHT);

    ball = new Ball(-2);
    setInterval(redraw, 15);
}

// Ball
function Ball(v) {
    this.x = BALL_X;
    this.y = BALL_Y;
    this.v = v;
    this.acceleration = -0.05;
    this.passed = false;

    this.move = function() {
        var nextX = this.x + this.v;
        if(nextX < 0) {
            this.x = BALL_X;
            this.v += this.acceleration;
            this.passed = false;
            return;
        }

        if(!jumping && nextX < charX + 70 && !this.passed && nextX > charX) {
            this.v = -this.v;
            this.passed = true;
        }

        if(this.x > BALL_X) {
            this.v = -this.v + this.acceleration;
            this.passed = false;
        }

        this.x += this.v;
    }
}

function drawBall(b) {
    context.beginPath();
    context.fillStyle = 'black';
    context.arc(b.x, BALL_Y, 15, 0, 2 * Math.PI, true);
    context.stroke();
    context.fillStyle = 'red';
    context.arc(b.x, BALL_Y, 15, 0, 2 * Math.PI, true);
    context.closePath();
    context.fill();
}

window.addEventListener("load", init, true);

// left 37, up - 38, right - 39, down - 40
$(document).keydown(function(event){
    if(event.which === 38) {
        jump();
    }
});