$(document).ready(function() {
    //Canvas init
    var canvas = $("#gameCanvas");
    var context = canvas.get(0).getContext("2d");
    // Canvas dimensions
    var canvasWidth = canvas.width();
    var canvasHeight = canvas.height();

    // Game settings
    var explosionRadius = 180;

    var playGame;
    var asteroids; // Array that holds all the asteroids
    var bombs; // array of bombs
    var bombsOnScreenCount = 0;
    var maxBombsOnScreen = 2;
    var myBombs = 0;
    var maxSide = 15, minSide = 5;
    var numAsteroids;
    var numFuels;
    var player;
    var score;
    var scoreTimeout;

    // Keyboard keycodes using descriptive variables (enumeration)
    var arrowUp = 38;
    var arrowRight = 39;
    var arrowDown = 40;
    var enter = 13;

    // Game UI
    var ui = $("#gameUI");
    var uiIntro = $("#gameIntro");
    var uiStats = $("#gameStats");
    var uiComplete = $("#gameComplete");
    var uiPlay = $("#gamePlay"), uiReset = $(".gameReset"), uiScore = $(".gameScore"), uiBombs = $(".bombsCount");
    // Sound
    var soundBackground = $("#gameSoundBackground").get(0);
    var soundThrust = $("#gameSoundThrust").get(0);
    var soundDeath = $("#gameSoundDeath").get(0);

    //Common
    function circle(x, y, r, color) {
        context.beginPath();
        context.fillStyle = color;
        context.arc(x, y, r, 0, 2 * Math.PI, true);
        context.fill();
        context.closePath();
    }

    function euclidDist(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    function dist(player, asteroid) {
        return euclidDist(player.x, player.y, asteroid.x, asteroid.y);
    }

    function intersect(player, asteroid) {
        return dist(player, asteroid) < explosionRadius + asteroid.radius;
    }

    // Asteroid class
    var Asteroid = function(x, y, radius, vX) {
        this.x = x; this.y = y; this.radius = radius; this.vX = vX;
    }

    function changeAsteroid(a){
        a.radius = 5+(Math.random()*10);
        a.x = canvasWidth + a.radius;
        a.y = Math.floor(Math.random() * canvasHeight);
        a.vX = - 5 -(Math.random() * 5);
    }

    function randomAsteroid() {
        var radius = 5+(Math.random()*10);
        var x = Math.floor(Math.random()*canvasWidth)+canvasWidth+radius;
        var y = Math.floor(Math.random()*canvasHeight);
        var vX = -5-(Math.random()*5);

        return new Asteroid(x, y, radius, vX);
    }

    var Bomb = function(x, y, side, vx, vy) {
        this.x = x;
        this.y= y;
        this.side = side;
        this.vx = vx;
        this.vy = vy;
        this.timePassed = 0;

        this.draw = function() {
            context.beginPath();
            context.fillStyle = 'green';
            context.fillRect(this.x, this.y, this.side, this.side);
            //context.fill();
            context.closePath();
        }

        this.move = function() {
            this.x -= this.vx;
            var threshold = Math.random();
            if(threshold > 0.95) {
                this.vy = -this.vy;
                this.timePassed = 0;
            }
            else {
                this.timePassed += 33;
                if(this.timePassed > 10000) {
                    this.timePassed = 0;
                    this.vy = -this.vy;
                }
            }
            this.y += this.vy;
        }
    }

    function randInt(start, end) {
        return Math.floor(Math.random() * (end - start)) + start;
    }

    function randomBomb(minSide, maxSide) {
        var side = randInt(minSide, maxSide);
        var y = randInt(side, canvasHeight - side);
        var x = randInt(canvasWidth, canvasWidth + 50);
        var vx = randInt(4, 7);
        var vy = randInt(2, 4);
        return new Bomb(x, y, side, vx, vy);
    }

    // Player class
    var Player = function(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24; this.height = 24; this.halfWidth = this.width/2;
        this.halfHeight = this.height/2;
        this.vX = 0;
        this.vY = 0;
        this.moveRight = false; this.moveUp = false; this.moveDown = false;
        this.flameLength = 20;
        this.lifeCount = 3;
        this.explosion = false;

        this.colisionWithBombs = function() {
            var leftBombs = new Array();
            for(var b in bombs) {
                if(Math.abs(bombs[b].x - this.x) < bombs[b].side / 2 + this.flameLength / 2 &&
                    Math.abs(bombs[b].y - this.y) < bombs[b].side / 2 + this.halfHeight) {
                    myBombs++;
                    uiBombs.html(myBombs);
                }
                else {
                    leftBombs.push(bombs[b]);
                }
            }
            bombs = leftBombs;
        }

        this.draw = function() {
            if(this.explosion) {
                circle(this.x, this.y, explosionRadius, 'orange');
                setTimeout(finishExplosion, 250);
            }

            // Draw this
            if (this.moveRight) {
                context.save();
                context.translate(this.x, this.y);

                if (this.flameLength == 20) {
                    this.flameLength = 15;
                } else {
                    this.flameLength = 20;
                }

                context.fillStyle = "orange";
                context.beginPath();
                context.moveTo(-12-this.flameLength, 0);
                context.lineTo(0, -5);
                context.lineTo(0, 5);
                context.closePath();
                context.fill();

                context.restore();
            }

            context.fillStyle = "rgb(255, 0, 0)";
            context.beginPath();
            context.moveTo(this.x+this.halfWidth, this.y);
            context.lineTo(this.x-this.halfWidth, this.y-this.halfHeight);
            context.lineTo(this.x-this.halfWidth, this.y+this.halfHeight);
            context.closePath();
            context.fill();

        }
    }

    function finishExplosion() {
        player.explosion = false;
        context.width = context.width;
    }

    // Reset and start the game
    function startGame() {
        // Reset game stats
        uiScore.html("0");
        uiBombs.html("0");
        uiStats.show();

        // Set up initial game settings
        playGame = false;
        asteroids = new Array();
        bombs = new Array();
        //fuels = new Array();
        numAsteroids = 10;
        //numFuels = 1;
        score = 0;

        player = new Player(150, canvasHeight/2);

        // Set up asteroids out of view
        for (var i = 0; i < numAsteroids; i++) {
            asteroids.push(randomAsteroid());
        }

        //document.addEventListener("keyup", function, false);
        // Set up keyboard event listeners
        $(window).keydown(function(e) {
            var keyCode = e.keyCode;

            if (playGame == false) {
                playGame = true;

                // Start the background sound
                soundBackground.currentTime = 0;
                soundBackground.play();

                // Start the animation loop
                animate();

                // Start game timer
                timer();
            }

            if (keyCode == arrowRight) {
                player.moveRight = true;

                // Play sound
                if (soundThrust.paused) {
                    soundThrust.currentTime = 0;
                    soundThrust.play();
                }
            } else if (keyCode == arrowUp) {
                player.moveUp = true;
            } else if (keyCode == arrowDown) {
                player.moveDown = true;
            }
            else if(keyCode == 13 && myBombs > 0) {
                //Enter
                myBombs--;
                player.explosion = true;
                uiBombs.html(myBombs);

                var leftAsteroids = new Array();
                for(var i in asteroids) {
                    if(!intersect(player, asteroids[i])) {
                        leftAsteroids.push(asteroids[i]);
                    }
                }
                asteroids = leftAsteroids;
            }
        });

        $(window).keyup(function(e) {
            var keyCode = e.keyCode;

            if (keyCode == arrowRight) {
                player.moveRight = false;

                // Stop sound
                soundThrust.pause();
            } else if (keyCode == arrowUp) {
                player.moveUp = false;
            } else if (keyCode == arrowDown) {
                player.moveDown = false;
            }
        });

        // Start the animation loop
        animate();
    }

    // Inititialize the game environment
    function init() {
        uiStats.hide();
        uiComplete.hide();

        uiPlay.click(function(e) {
            e.preventDefault();
            uiIntro.hide();
            startGame();
        });

        uiReset.click(function(e) {
            e.preventDefault();
            uiComplete.hide();

            // Stop sound
            soundThrust.pause();
            soundBackground.pause();

            clearTimeout(scoreTimeout);

            $(window).unbind("keyup");
            $(window).unbind("keydown");

            startGame();
        });
    }

    // Dont change this function
    function timer() {
        if (playGame) {
            scoreTimeout = setTimeout(function() {
                uiScore.html(++score);

                // Increase number of asteroids over time
                if (score % 5 == 0) {
                    numAsteroids += 5;
                }

                timer();
            }, 1000);
        }
    }

    // Animation loop that does all the fun stuff
    function animate() {
        // Clear
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        // Loop through every asteroid
        var asteroidsLength = asteroids.length;
        for (var i = 0; i < asteroidsLength; i++) {
            var tmpAsteroid = asteroids[i];

            // Calculate new position
            tmpAsteroid.x += tmpAsteroid.vX;

            // Check to see if you need to reset the asteroid
            if (tmpAsteroid.x+tmpAsteroid.radius < 0) {
                changeAsteroid(tmpAsteroid);
            }

            // Player to asteroid collision detection
            var dX = player.x - tmpAsteroid.x;
            var dY = player.y - tmpAsteroid.y;
            var distance = Math.sqrt((dX*dX) + (dY*dY));

            if (distance < player.halfWidth + tmpAsteroid.radius) {
                score -= 500;
                player.lifeCount -= 1;
                changeAsteroid(tmpAsteroid);
                if(player.lifeCount === 0){

                    uiScore.html(score);
                    // Stop thrust sound
                    soundThrust.pause();

                    // Play death sound
                    soundDeath.currentTime = 0;
                    soundDeath.play();

                    // Game over
                    playGame = false;
                    clearTimeout(scoreTimeout);
                    uiStats.hide();
                    uiComplete.show();

                    // Reset sounds
                    soundBackground.pause();

                    // Reset event handlers
                    $(window).unbind("keyup");
                    $(window).unbind("keydown");
                }

            }

            circle(tmpAsteroid.x, tmpAsteroid.y, tmpAsteroid.radius, "rgb(255, 255, 255)");
        }

        // Update player
        player.vX = 0;
        player.vY = 0;

        if (player.moveRight) {
            player.vX = 3;
        } else {
            player.vX = -3;
        }

        if (player.moveUp) {
            player.vY = -3;
        }

        if (player.moveDown) {
            player.vY = 3;
        }

        player.x += player.vX;
        player.y += player.vY;

        // Player boundary detection
        if (player.x-player.halfWidth < 20) {
            player.x = 20+player.halfWidth;
        } else if (player.x+player.halfWidth > canvasWidth-20) {
            player.x  = canvasWidth-20-player.halfWidth;
        }

        if (player.y-player.halfHeight < 20) {
            player.y = 20+player.halfHeight;
        } else if (player.y+player.halfHeight > canvasHeight-20) {
            player.y = canvasHeight-20-player.halfHeight;
        }

        player.draw();

        // Add any new asteroids
        while (asteroids.length < numAsteroids) {
            var radius = 5+(Math.random()*10);
            var x = Math.floor(Math.random()*canvasWidth)+canvasWidth+radius;
            var y = Math.floor(Math.random()*canvasHeight);
            var vX = -5-(Math.random()*5);

            asteroids.push(new Asteroid(x, y, radius, vX));
        }

        if(bombs.length < maxBombsOnScreen) {
            bombs.push(randomBomb(minSide, maxSide));
        }
        var tmpBombs = new Array();
        for(var b in bombs) {
            bombs[b].draw();
            bombs[b].move();
            if(!(bombs[b].x < 0 || bombs[b].y > canvasHeight || bombs[b].y < 0)) {
                tmpBombs.push(bombs[b]);
            }
        }
        bombs = tmpBombs;

        player.colisionWithBombs();

        if (playGame) {
            // Run the animation loop again in 33 milliseconds
            setTimeout(animate, 33);
        }
    }

    init();
});