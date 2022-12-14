/** @type {HTMLCanvasElement} */

window.addEventListener("load", function () {
this.alert("Click on Toggle Full Screen \nSwipe up to jump and swipe down to restartGmae \nplay in landscape mode for better experience\n for pc  use arrow keys to move and jump  ");
const fullScreenButton=this.document.getElementById("fullScreenButton");

    const canvas = this.document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 1400;
    canvas.height = 720;
    let enemies = [];

    let score = 0;
    let gameOver = false;
    class InputHandler {
        constructor() {
            this.keys = [];
            this.touchY = '';
            this.touchThreshold = 30;
            window.addEventListener('keydown', e => {
                if ((e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') && this.keys.indexOf(e.key) === -1) {
                    this.keys.push(e.key);
                } else
                    if (e.key === "Enter" && gameOver) {
                        restart();
                    }

            });

            window.addEventListener('keyup', e => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }



            });

            window.addEventListener("touchstart", e => {

                this.touchY = e.changedTouches[0].pageY;

            });
            window.addEventListener("touchmove", e => {
                const swipeDistance = e.changedTouches[0].pageY - this.touchY;
                if (swipeDistance < -this.touchThreshold && this.keys.indexOf("swipe up") === -1) {
                    this.keys.push("swipe up");
                }
                else if (swipeDistance > this.touchThreshold && this.keys.indexOf("swipe down") === -1) {
                    this.keys.push("swipe down");
                    if (gameOver) restart();
                }
            });
            window.addEventListener("touchend", e => {
                
                this.keys.splice(this.keys.indexOf("swipe up"), 1);
                this.keys.splice(this.keys.indexOf("swipe down"), 1);
            });



        }
    }

    class Player {

        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById("playerImage");
            this.frameX = 0;
            this.frameY = 0;
            this.speed = 0;
            this.vY = 0;
            this.weight = 1;
            this.maxFrames = 8;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
        }
        restart() {
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.maxFrames = 8;
            this.frameY = 0;
        }
        draw(context) {
            context.strokeStyle = "white";

            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(input, deltaTime, enemies) {

            //collision check
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width / 2-20) - (this.x + this.width / 2);
                const dy = (enemy.y + enemy.height / 2) - (this.y + this.height / 2+20);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= this.width / 3 + enemy.width / 3) {
                    gameOver = true;
                }

            });

            //sprite animations
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrames) {
                    this.frameX = 0;
                } else {
                    this.frameX++;
                }
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }


            //controls
            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 5;
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -5;
            } else {
                this.speed = 0;
            }
            if ((input.keys.indexOf('ArrowUp') > -1 || input.keys.indexOf('swipe up') > -1) && this.onGround()) {
                this.vY = -32;
            }


            //horizontal movement

            this.x += this.speed;
            if (this.x < 0) {
                this.x = 0;
            }
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;
            //vertical movement
            this.y += this.vY;
            if (!this.onGround()) {
                this.vY += this.weight;
                this.frameY = 1;
                this.maxFrames = 5;
            } else {
                this.vY = 0;
                this.frameY = 0;
                this.maxFrames = 8;
            }

            if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
        }

        onGround() {
            return this.y >= this.gameHeight - this.height;
        }

    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 2400;
            this.height = 720;
            this.x = 0;
            this.y = 0;
            this.image = document.getElementById("backgroundImage");
            this.speed = 7;


        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }
        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }

        restart() {
            this.x = 0;
        }

    }

    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.x = this.gameWidth;
            this.y = gameHeight - this.height;
            this.image = document.getElementById("enemyImage");
            this.frameX = 0;
            this.markedForDeletion = false;
            this.speed = Math.random() * 4 + 12;
            this.maxFrames = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
        }
        draw(context) {



            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);


        }
        update(deltaTime) {
            this.x -= this.speed;
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrames) {
                    this.frameX = 0;
                } else {
                    this.frameX++;
                }
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            if (this.x + this.width < 0) {
                this.markedForDeletion = true;
                score++;
            }



        }

    }

    function handleEnemies(deltaTime) {

        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            enemyTimer = 0;
            randomEnemyInterval = Math.random() * 500 + 500;
        } else enemyTimer += deltaTime;

        enemies.forEach(enemy => {
            enemy.update(deltaTime);
            enemy.draw(ctx);

        });
        //deleting enemies that go past the screen
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);

    }

    function displayStatusText(context) {
        context.textAlign = 'left';
        context.fillStyle = "black";
        context.font = "40px Helvetica";
        context.fillText("Score: " + score, 20, 50);
        context.fillStyle = "white";
        context.fillText("Score: " + score, 22, 52);
        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = "black";
            context.fillText("Game Over, \n Press Enter or swipe down to restart", canvas.width / 2, canvas.height / 2);
            context.fillStyle = "white";
            context.fillText("Game Over, \n Press Enter or swipe down to restart", canvas.width / 2 + 2, canvas.height / 2 + 2);
        }

    }

    function restart() {
        player.restart();
        background.restart();
        enemies = [];
        score = 0;
        gameOver = 0;
        animate(0);
    }


function toggleFullScreen(){
    if(!document.fullscreenElement){
        canvas.requestFullscreen().catch(err=>{
            alert(`Error can't eneble full screen mode: ${err.message }`);
            console.log()
        });
    }else{
        document.exitFullscreen();
    }
}
fullScreenButton.addEventListener("click", toggleFullScreen );



    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);
    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 1000;

    let randomEnemyInterval = Math.random() * 1000 + 500;
    function animate(timeStamp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        let deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        player.draw(ctx);
        player.update(input, deltaTime, enemies);
        displayStatusText(ctx)
        handleEnemies(deltaTime);

        if (!gameOver) {
            requestAnimationFrame(animate);
        }


    }

    animate(0);

});
