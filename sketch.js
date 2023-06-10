//Declaring Variables and importing modules
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;
//Declaring variables for the game
var engine, world, backgroundImg;
var canvas, angle, tower, ground, cannon, boat;
var balls = [];
var boats = [];
var score = 0;
var boatAnimation = [];
var boatSpritedata, boatSpritesheet;

var brokenBoatAnimation = [];
var brokenBoatSpritedata, brokenBoatSpritesheet;

var waterSplashAnimation = [];
var waterSplashSpritedata, waterSplashSpritesheet;

var backgroundMusic, cannonExplosion, waterSound, pirateLaughSound;

var isGameOver = false;
var isLaughing = false;

//Preloading images, sounds and JSON data
function preload() {
  backgroundImg = loadImage("./assets/background.gif");
  towerImage = loadImage("./assets/tower.png");
  boatSpritedata = loadJSON("assets/boat/boat.json");
  boatSpritesheet = loadImage("assets/boat/boat.png");
  brokenBoatSpritedata = loadJSON("assets/boat/broken_boat.json");
  brokenBoatSpritesheet = loadImage("assets/boat/broken_boat.png");
  waterSplashSpritedata = loadJSON("assets/water_splash/water_splash.json");
  waterSplashSpritesheet = loadImage("assets/water_splash/water_splash.png");
  backgroundMusic = loadSound("assets/background_music.mp3");
  cannonExplosion = loadSound("assets/cannon_explosion.mp3");
  waterSound = loadSound("assets/cannon_water.mp3");
  pirateLaughSound = loadSound("assets/pirate_laugh.mp3");
}

function setup() {
  //Creating the canvas, engine, and adding the world
  canvas = createCanvas(1200,600);
  engine = Engine.create();
  world = engine.world;
  //Setting angle for cannon and changing angle mode (radians to degrees)
  angleMode(DEGREES)
  angle = 15

  //Creating ground and tower bodies for the game
  ground = Bodies.rectangle(0, height - 1, width * 2, 1, { isStatic: true });
  World.add(world, ground);

  tower = Bodies.rectangle(160, 350, 160, 310, { isStatic: true });
  World.add(world, tower);

  //Creating cannon object using Cannon class
  cannon = new Cannon(180, 110, 100, 50, angle);

  //Giving animations to boat, brokenBoat, and waterSplash
  var boatFrames = boatSpritedata.frames;
  for (var i = 0; i < boatFrames.length; i++) {
    var pos = boatFrames[i].position;
    var img = boatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }

  var brokenBoatFrames = brokenBoatSpritedata.frames;
  for (var i = 0; i < brokenBoatFrames.length; i++) {
    var pos = brokenBoatFrames[i].position;
    var img = brokenBoatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    brokenBoatAnimation.push(img);
  }

  var waterSplashFrames = waterSplashSpritedata.frames;
  for (var i = 0; i < waterSplashFrames.length; i++) {
    var pos = waterSplashFrames[i].position;
    var img = waterSplashSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    waterSplashAnimation.push(img);
  }
}

function draw() {
  //Setting Background colour and image
  background(189);
  image(backgroundImg, 0, 0, width, height);

  //Playing background music
  if (!backgroundMusic.isPlaying())
  {
    backgroundMusic.play();
    backgroundMusic.setVolume(0.1);
  }

  Engine.update(engine);
 
  //Displaying ground - push and pop for new and reverting settings
  push();
  translate(ground.position.x, ground.position.y);
  fill("brown");
  rectMode(CENTER);
  rect(0, 0, width * 2, 1);
  pop();

  //Displaying tower - push and pop for new and reverting settings
  push();
  translate(tower.position.x, tower.position.y);
  rotate(tower.angle);
  imageMode(CENTER);
  image(towerImage, 0, 0, 160, 310);
  pop();

  //Calling showBoats function
  showBoats();

  //Calling showCannonBalls and collisionWithBoat in a loop
   for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    collisionWithBoat(i);
  }

  //Displaying the cannon
  cannon.display();
  
  //Displaying Score on the screen
  fill("#6d4c41");
  textSize(40);
  text(`Score:${score}`, width - 200, 50);
  textAlign(CENTER, CENTER);
}

function collisionWithBoat(index) {
  for (var i = 0; i < boats.length; i++) {
    if (balls[index] !== undefined && boats[i] !== undefined) {
      var collision = Matter.SAT.collides(balls[index].body, boats[i].body);

      if (collision.collided) {
        score+=5
          boats[i].remove(i);
        

        Matter.World.remove(world, balls[index].body);
        delete balls[index];
      }
    }
  }
}

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
  }
}

function showCannonBalls(ball, index) {
  if (ball) {
    ball.display();
    ball.animate();
    if (ball.body.position.x >= width || ball.body.position.y >= height - 50) {
      waterSound.play();
        ball.remove(index);
      
    }
  }
}

function showBoats() {
  if (boats.length > 0) {

    if (
      boats.length < 4 &&
      boats[boats.length - 1].body.position.x < width - 300
    ) {
      var positions = [-40, -60, -70, -20];
      var position = random(positions);
      var boat = new Boat(
        width,
        height - 100,
        170,
        170,
        position,
        boatAnimation
      );

      boats.push(boat);
    }

    for (var i = 0; i < boats.length; i++) {
      Matter.Body.setVelocity(boats[i].body, {
        x: -0.9,
        y: 0
      });

      boats[i].display();
      boats[i].animate();
      var collision = Matter.SAT.collides(this.tower, boats[i].body);
      if (collision.collided && !boats[i].isBroken) {
        isGameOver = true;
        if (!isLaughing && !pirateLaughSound.isPlaying())
        {
          pirateLaughSound.play();
          isLaughing = true;
        }
        gameOver();
      }
    }
  } else {
    var boat = new Boat(width, height - 60, 170, 170, -60, boatAnimation);
    boats.push(boat);
  }
}

function keyReleased() {
  if (keyCode === DOWN_ARROW && !isGameOver) {
    cannonExplosion.play();
    balls[balls.length - 1].shoot();
  }
}

function gameOver() {
  //Displaying pop-up alert using sweetalert
  swal(
    {
      title: `Game Over!!!`,
      text: "Thanks for playing!!",
      imageUrl:
        "https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png",
      imageSize: "150x150",
      confirmButtonText: "Play Again"
    },
    function(isConfirm) {
      if (isConfirm) {
        location.reload();
      }
    }
  );
}
