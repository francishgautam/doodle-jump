import './style.css';

// Game Board Settings
let canvas : HTMLCanvasElement;
let canvasWidth = 360;
let canvasHeight = 576;
let ctx : CanvasRenderingContext2D;

// Doodler Settings
let doodlerSize = { width: 46, height: 46 };
let doodlerPos = { x: canvasWidth / 2 - doodlerSize.width / 2, y: canvasHeight * 7 / 8 - doodlerSize.height };
let doodlerRightImage : HTMLImageElement;
let doodlerLeftImage : HTMLImageElement;

let doodler: {
    img : HTMLImageElement | null,
    x: number;
    y: number;
    width: number;
    height: number;
} = {
    img : null,
    x: 0,
    y: 0,
    width: 50,
    height: 50
};


// Physics Settings
let velX = 0;
let velY = 0; 
let startVelY = -8; 
let gravity = 0.4;

// Platform Settings
interface Platform {
    img : HTMLImageElement;
    x: number;
    y: number;
    width: number;
    height: number;
}

let platforms: Platform[] = [];

let platformSize = { width: 60, height: 18 };
let platformImage : HTMLImageElement;

//Score parameters
let currentScore : any = 0;
let topScore : number = 0;
let isGameOver : boolean = false;

window.onload = function() {
    canvas = document.getElementById("board") as HTMLCanvasElement;
    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    // Load images
    doodlerRightImage = new Image();
    doodlerRightImage.src = "/doodler-right.png";
    doodler.img = doodlerRightImage as HTMLImageElement;
    doodlerRightImage.onload = function() {
        ctx.drawImage(doodler.img as CanvasImageSource, doodler.x, doodler.y, doodler.width, doodler.height);
}

    doodlerLeftImage = new Image();
    doodlerLeftImage.src = "/doodler-left.png";

    platformImage = new Image();
    platformImage.src = "/platform.png";

    velY = startVelY;
    createPlatforms();
    requestAnimationFrame(gameLoop);
    document.addEventListener("keydown", controlDoodler);
}

function gameLoop() {
    requestAnimationFrame(gameLoop);
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move doodler
    doodler.x += velX;
    if (doodler.x > canvasWidth) {
        doodler.x = 0;
    } else if (doodler.x + doodler.width < 0) {
        doodler.x = canvasWidth;
    }

    velY += gravity;
    doodler.y += velY;
    if (doodler.y > canvas.height) {
        isGameOver = true;
    }
    ctx.drawImage(doodler.img as CanvasImageSource, doodler.x, doodler.y, doodler.width, doodler.height);

    // Move platforms
    platforms.forEach(platform => {
        if (velY < 0 && doodler.y < canvasHeight * 3 / 4) {
            platform.y -= startVelY;
        }
        if (checkCollision(doodler, platform) && velY >= 0) {
            velY = startVelY;
        }
        ctx.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    });

    // Remove off-screen platforms and add new ones
    platforms = platforms.filter(platform => platform.y < canvasHeight);
    while (platforms.length < 7) {
        addNewPlatform();
    }

    // Update score
    updateScore();
    ctx.fillStyle = "black";
    ctx.font = "16px sans-serif";
    ctx.fillText(currentScore ,  5, 20);

    if (isGameOver) {
        ctx.fillText("Game Over: Press 'Space' to Restart", canvasWidth / 7, canvasHeight * 7 / 8);
    }
}

function controlDoodler(e :any) {
    if (e.code === "ArrowRight" || e.code === "KeyD") {
        velX = 4;
        doodler.img = doodlerRightImage;
    } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        velX = -4;
        doodler.img = doodlerLeftImage;
    } else if (e.code === "Space" && isGameOver) {
        resetGame();
    }
}

function createPlatforms() {
    platforms = [];
    let initialPlatform = {
        img: platformImage,
        x: canvasWidth / 2,
        y: canvasHeight - 50,
        width: platformSize.width,
        height: platformSize.height
    };
    platforms.push(initialPlatform);

    for (let i = 0; i < 6; i++) {
        let randomX = Math.random() * (canvasWidth * 3 / 4);
        let platform = {
            img: platformImage,
            x: randomX,
            y: canvasHeight - 75 * i - 150,
            width: platformSize.width,
            height: platformSize.height
        };
        platforms.push(platform);
    }
}

function addNewPlatform() {
    let randomX = Math.random() * (canvasWidth * 3 / 4);
    let platform = {
        img: platformImage,
        x: randomX,
        y: -platformSize.height,
        width: platformSize.width,
        height: platformSize.height
    };
    platforms.push(platform);
}

function checkCollision(a :any, b: any ) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function updateScore() {
    if (velY < 0) {
        topScore += Math.floor(Math.random() * 50);
        currentScore = Math.max(currentScore, topScore);
    } else if (velY >= 0) {
        topScore -= Math.floor(Math.random() * 50);
    }
}

function resetGame() {
    doodler = {
        img: doodlerRightImage,
        x: doodlerPos.x,
        y: doodlerPos.y,
        width: doodlerSize.width,
        height: doodlerSize.height
    };
    velX = 0;
    velY = startVelY;
    currentScore = 0;
    topScore = 0;
    isGameOver = false;
    createPlatforms();
}
