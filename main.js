
//canvas
let canvas;
let canvasWidth = 360;
let canvasHeight = 640;
let context;

//fish
let fishWidth = 44; 
let fishHeight = 34;
let fishX = canvasWidth/8;
let fishY = canvasHeight/2;
let fishImg;

let fish = {
    x : fishX,
    y : fishY,
    width : fishWidth,
    height : fishHeight
}

//grasss
let grassArray = [];
let grassWidth = 60; 
let grassHeight = 512;
let grassX = canvasWidth;
let grassY = 0;

let topgrassImg;
let bottomgrassImg;
let coverImg;
let startgameImg;
let buttonplayImg;
let gamestarted=false;
let gameover;
let homeButton;
let highscoreDisplay;

//physics
let velocityX = -2; 
let velocityY = 0; 
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = function() {

  canvas = document.getElementById("canvas");
  canvas.height = canvasHeight;
  canvas.width = canvasWidth;
  context = canvas.getContext("2d"); 
  homeButton = document.getElementById("homeButton"); 
  homeButton.addEventListener("click", function() {
    location.reload();
  });
  document.getElementById("playButton").addEventListener("click", startGame);
  homeButton.addEventListener("click", showStartScreen);
  canvas.addEventListener("click", function(e) {
    movefish(e);
  });
  showStartScreen();
}

function startGame() {
  if (!gamestarted) {
    canvas.style.display = "block"; 
    document.getElementById("start-screen").style.display = "none"; 
    gamestarted = true;

    //load images
    fishImg = new Image();
    fishImg.src = "./flappyfish.png";
    fishImg.onload = function() {
      context.drawImage(fishImg, fish.x, fish.y, fish.width, fish.height);
    }

    topgrassImg = new Image();
    topgrassImg.src = "./topgrass.png";

    bottomgrassImg = new Image();
    bottomgrassImg.src = "./bottomgrass.png";

    setInterval(placegrasss, 1500); 
    document.addEventListener("keydown", movefish);
    requestAnimationFrame(update);
  }
}

// Function to apply linear transformation
let transformationMatrix = [1, 0, 0, 1, 0, 0];
function applyLinearTransformation(x, y) {
  // implemtasion linier transformation 
  let newX = transformationMatrix[0] * x + transformationMatrix[2] * y + transformationMatrix[4];
  let newY = transformationMatrix[1] * x + transformationMatrix[3] * y + transformationMatrix[5];
  return { x: newX, y: newY };
}
let darkScreen = false; 
let darkScreenPeriod = false;

// function animation game
function update() {
  requestAnimationFrame(update);

  // Jika gameOver, kembali ke awal
  if (gameOver) {
    showEndScreen();
    return;
  }

  if ((score >= 0 && score < 10) || (score >= 20 && score < 30) || (score >= 40 && score < 50)) {
    darkScreen = false;
    darkScreenPeriod = false;
  } else if ((score >= 10 && score < 20) || (score >= 30 && score < 40)|| (score >= 50 && score < 60)) {
    darkScreen = true;
    if (!darkScreenPeriod) {
      darkScreenPeriod = true;
    }
  } else if (score === 60) {
    gameOver = true;
    darkScreen = false;
    return;
  } else {
    darkScreen = false;
    darkScreenPeriod = false;
  }
3
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Perbarui kecepatan vertikal ikan dengan gravitasi
  velocityY += gravity;

  // Perbarui posisi ikan berdasarkan kecepatan
  fish.y = Math.max(fish.y + velocityY, 0);

  // Gambar ikan
  context.drawImage(fishImg, fish.x, fish.y, fish.width, fish.height);

  // Periksa jika ikan melampaui batas bawah canvas
  if (fish.y > canvas.height) {
    gameOver = true;
  }

  // Logika rumput
  for (let i = 0; i < grassArray.length; i++) {
    let grass = grassArray[i];
    grass.x += velocityX;
    context.drawImage(grass.img, grass.x, grass.y, grass.width, grass.height);

    if (!grass.passed && fish.x > grass.x + grass.width) {
      score += 0.5;
      grass.passed = true;
    }

    // Panggil fungsi deteksi tabrakan
    if (detectCollision(fish, grass)) {
      gameOver = true;
      return;
    }
  }

  // Bersihkan rumput yang sudah lewat
  while (grassArray.length > 0 && grassArray[0].x < -grassWidth) {
    grassArray.shift();
  }

  // Gambar skor
  if (!darkScreen) {
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
    context.font = "30px sans-serif";
    context.fillText(score, 5, 45);
  } else {
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;
    context.fillStyle = "rgba(255, 255, 255, 0.8)";
    context.font = "30px sans-serif";
    context.fillText(score, 5, 45);
  }
  // Efek cahaya pada ikan
  // komponen
  if (!gameOver && darkScreen) {
    transformationMatrix[4] = fish.x; // Translasi x
    transformationMatrix[5] = fish.y; // Translasi y

    let transformedFish = applyLinearTransformation(fish.width / 2, fish.height / 2);

    let gradient = context.createRadialGradient(
      transformedFish.x, transformedFish.y, 0,
      transformedFish.x, transformedFish.y, fish.width
    );
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(0.8, "transparent");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.5)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(transformedFish.x, transformedFish.y, fish.width * 1.5, 0, Math.PI * 2);
    context.fill();

    context.drawImage(fishImg, fish.x, fish.y, fish.width, fish.height);
  }
}

// funcion place of grass
function placegrasss() {
  // if the grass hits
  if (gameOver) {
    showEndScreen();
    return;
  }
  // output random grass
  let randomgrassY = grassY - grassHeight/4 - Math.random()*(grassHeight/2);
  let openingSpace = canvas.height/4;

  let topgrass = {
    img : topgrassImg,
    x : grassX,
    y : randomgrassY,
    width : grassWidth,
    height : grassHeight,
    passed : false
  }
  
  grassArray.push(topgrass);
 
  let bottomgrass = {
    img : bottomgrassImg,
    x : grassX,
    y : randomgrassY + grassHeight + openingSpace,
    width : grassWidth,
    height : grassHeight,
    passed : false
  }

  grassArray.push(bottomgrass);
}

function movefish(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX"|| e.type == "click") {
        //jump
        velocityY = -6;
        //reset game
        if (gameOver) {
          fish.y = fishY;
          grassArray = [];
          score = 0;
          gameOver = false;
        }
    }
}

function detectCollision(canvas_a, canvas_b) {
  return canvas_a.x < canvas_b.x + canvas_b.width &&   //a's top left corner doesn't reach b's top right corner
        canvas_a.x + canvas_a.width > canvas_b.x &&   //a's top right corner passes b's top left corner
        canvas_a.y < canvas_b.y + canvas_b.height &&  //a's top left corner doesn't reach b's bottom left corner
        canvas_a.y + canvas_a.height > canvas_b.y;    //a's bottom left corner passes b's top left corner
}
function showStartScreen() {
  canvas.style.display = "none";
  document.getElementById("Game-Over").style.display = "none";
  document.getElementById("start-screen").style.display = "flex";
  gameOver = false;
  grassArray = [];
}
function showEndScreen() {
  canvas.style.display = "none";
  document.getElementById("Game-Over").style.display = "flex";
  document.getElementById("start-screen").style.display = "none";
  highscoreDisplay = document.getElementById("score-display");
  highscoreDisplay.innerHTML = "Highscore: " + calculateHighscore();
  homeButton.style.display = "block";
}

function calculateHighscore() {
  return Math.floor(score);
}
console.log(calculateHighscore());

