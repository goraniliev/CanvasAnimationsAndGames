$(document).ready(function() {
    //Canvas init
    var canvas = $("#gameCanvas");
    var context = canvas.get(0).getContext("2d");
    // Canvas dimensions
    var canvasWidth = canvas.width();
    var canvasHeight = canvas.height();

    // Game settings
    var EXPLOSION_TIME = 2500;
    var explosionRadius = 180;

    var playGame;
    var asteroids; // Array that holds all the asteroids
    var bombs; // array of bombs
    var bombsOnScreenCount = 0;
    var maxBombsOnScreen = 2;
    var myBombs = 0;
    var maxSide = 15, minSide = 5;
    //var fuels; // Array that holds all the fuel items
    var numAsteroids;
    var numFuels;
    var player;
    var score;
    var scoreTimeout;
    //var fuelWidth = 10;

    // Keyboard keycodes using descriptive variables (enumeration)
    var arrowUp = 38;
    var arrowRight = 39;
    var arrowDown = 40;

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

    // Asteroid class
    var Asteroid = function(x, y, radius, vX) {
        this.x = x; this.y = y; this.radius = radius; this.vX = vX;
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
        var vx = randInt(5, 8);
        var vy = randInt(3, 5);
        return new Bomb(x, y, side, vx, vy);
    }


    // Fuel class
    //var Fuel = function(x, y, fuelWidth, vX, vY) {
    //    this.x = x; this.y = y; this.fuelWidth = fuelWidth; this.vX = vX; this.vY = vY;
    //    this.maxVrtMoves = 5 + Math.floor(Math.random() * 10);
    //    this.vrtMoves = 0;
    //}

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
        this.explosionDuration = 1000000;
        this.explosion = false;
    }
    function colision() {
        var leftBombs = Array();
        for(var b in bombs) {
            if(Math.abs(bombs[b].x - player.x) < bombs[b].side / 2 + player.flameLength / 2 &&
                Math.abs(bombs[b].y - player.y) < bombs[b].side / 2 + player.halfHeight) {
                myBombs++;
                uiBombs.html(myBombs);
            }
            else {
                leftBombs.push(bombs[b]);
            }
        }
        bombs = leftBombs;
    }

    function changeAsteroid(a){
        a.radius = 5+(Math.random()*10);
        a.x = canvasWidth + a.radius;
        a.y = Math.floor(Math.random() * canvasHeight);
        a.vX = - 5 -(Math.random() * 5);
    }

    function circle(x, y, r, color) {
        context.beginPath();
        context.fillStyle = color;
        context.arc(x, y, r, 0, 2 * Math.PI, true);
        context.fill();
        context.closePath();
    }

    function dist(player, asteroid) {
        return Math.sqrt((player.x - asteroid.x) * (player.x - asteroid.x) + (player.y - asteroid.y) * (player.y - asteroid.y));
    }

    function intersect(player, asteroid) {
        return dist(player, asteroid) < explosionRadius + asteroid.radius;
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
            var radius = 5+(Math.random()*10);
            var x = canvasWidth+radius+Math.floor(Math.random()*canvasWidth);
            var y = Math.floor(Math.random()*canvasHeight);
            var vX = -5-(Math.random()*5);

            asteroids.push(new Asteroid(x, y, radius, vX));
        }

        //for (var i = 0; i < numFuels; i++) {
        //    var x = canvasWidth + fuelWidth + Math.floor(Math.random()*canvasWidth);
        //    var y = Math.floor(Math.random() * canvasHeight);
        //    var vX = - 5 - (Math.random()*5);
        //    var vY = 5 + (Math.random()*5);
        //
        //    fuels.push(new Fuel(x, y, fuelWidth, vX, vY));
        //}

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

                var leftAsteroids = Array();
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

            context.fillStyle = "rgb(255, 255, 255)";
            context.beginPath();
            context.arc(tmpAsteroid.x, tmpAsteroid.y, tmpAsteroid.radius, 0, Math.PI*2, true);
            context.closePath();
            context.fill();
        }


        // Loop through every fuel
        //var fuelsLength = fuels.length;
        //for (var i = 0; i < fuelsLength; i++) {
        //    var tmpFuel = fuels[i];
        //
        //    // Calculate new position
        //    tmpFuel.x += tmpFuel.vX;
        //    tmpFuel.y += tmpFuel.vY;
        //    tmpFuel.vrtMoves += 1;
        //    // Change vertical orientation
        //    if(tmpFuel.vrtMoves === tmpFuel.maxVrtMoves){
        //        tmpFuel.vrtMoves = 0;
        //        tmpFuel.vY = -tmpFuel.vY;
        //    }
        //
        //    // Check to see if you need to reset the fuel
        //    if (tmpFuel.x + tmpFuel.fuelWidth < 0) {
        //        tmpFuel.x = canvasWidth + tmpFuel.fuelWidth;
        //        tmpFuel.y = Math.floor(Math.random()*canvasHeight);
        //        tmpFuel.vX = -5-(Math.random()*5);
        //    }
        //
        //    if (tmpFuel.y + tmpFuel.fuelWidth < 0 || tmpFuel.y + tmpFuel.fuelWidth > canvasHeight) {
        //        tmpFuel.x = canvasWidth + tmpFuel.fuelWidth + Math.floor(Math.random()*canvasWidth);
        //        tmpFuel.y = Math.floor(Math.random() * canvasHeight);
        //        tmpFuel.vX = - 5 - (Math.random()*5);
        //        tmpFuel.vY = 5 + (Math.random()*5);
        //    }
        //
        //    // Player to fuel collision detection
        //    var dX = player.x - tmpFuel.x;
        //    var dY = player.y - tmpFuel.y;
        //    var distance = Math.sqrt((dX*dX)+(dY*dY));
        //
        //    if (distance < player.halfWidth + tmpFuel.fuelWidth) {
        //
        //        tmpFuel.x = canvasWidth + tmpFuel.fuelWidth + Math.floor(Math.random()*canvasWidth);
        //        tmpFuel.y = Math.floor(Math.random() * canvasHeight);
        //        tmpFuel.vX = - 5 - (Math.random()*5);
        //        tmpFuel.vY = 5 + (Math.random()*5);
        //
        //        // Stop thrust sound
        //        soundThrust.pause();
        //        score += 100;
        //
        //        // Play death sound
        //        soundDeath.currentTime = 0;
        //        soundDeath.play();
        //
        //    }
        //
        //    //context.fillStyle = '#0a0';
        //    //context.fillRect(tmpFuel.x, tmpFuel.y, tmpFuel.fuelWidth, tmpFuel.fuelWidth);
        //}

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

        // Draw player
        if (player.moveRight) {
            context.save();
            context.translate(player.x, player.y);

            if (player.flameLength == 20) {
                player.flameLength = 15;
            } else {
                player.flameLength = 20;
            }

            context.fillStyle = "orange";
            context.beginPath();
            context.moveTo(-12-player.flameLength, 0);
            context.lineTo(0, -5);
            context.lineTo(0, 5);
            context.closePath();
            context.fill();

            context.restore();
        }

        context.fillStyle = "rgb(255, 0, 0)";
        context.beginPath();
        context.moveTo(player.x+player.halfWidth, player.y);
        context.lineTo(player.x-player.halfWidth, player.y-player.halfHeight);
        context.lineTo(player.x-player.halfWidth, player.y+player.halfHeight);
        context.closePath();
        context.fill();

        if(player.explosion) {
            //player.explosionDuration += 33;
            //if(player.explosionDuration < EXPLOSION_TIME) {
            circle(player.x, player.y, explosionRadius, 'orange');
            //}
            setTimeout(finishExplosion, 250);
        }

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
        var tmpBombs = Array();
        for(var b in bombs) {
            bombs[b].draw();
            bombs[b].move();
            if(!(bombs[b].x < 0 || bombs[b].y > canvasHeight || bombs[b].y < 0)) {
                tmpBombs.push(bombs[b]);
            }
        }
        bombs = tmpBombs;

        colision();

        if (playGame) {
            // Run the animation loop again in 33 milliseconds
            setTimeout(animate, 33);
        }
    }

    function finishExplosion() {
        player.explosion = false;
        context.width = context.width;
    }

    init();
});