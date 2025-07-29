const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
  x: 800,
  y: 600,
  size: 50,
  speed: 5,
  angle: 0,
};

const world = { width: 1600, height: 1200 };
let keysPressed = {};
let bullets = [];
let monsters = [];
let boss = null;
let bossBullets = [];
let lives = 3;
const bulletSpeed = 8;
const bulletSize = 7;
const backgroundOffset = { x: 0, y: 0 };
let treasureVisible = false;
let treasureClicked = false;

const playerImg = new Image();
playerImg.src = "player.png";

const monsterImg = new Image();
monsterImg.src = "monster3.png";

const bossImg = new Image();
bossImg.src = "monster3.png";

const bgImg = new Image();
bgImg.src = "background3.jpg";

const heartImg = new Image();
heartImg.src = "heart.png";

const treasureImg = new Image();
treasureImg.src = "treasure.png";

const treasure = {
  x: world.width / 2 - 200,
  y: world.height / 2 - 200,
  size: 550,
};

bgImg.onload = () => loop();

for (let i = 0; i < 8; i++) {
  monsters.push({
    x: Math.random() * world.width,
    y: Math.random() * world.height,
    size: 50,
    dx: (Math.random() - 0.5) * 2,
    dy: (Math.random() - 0.5) * 2,
    health: 3,
  });
}

document.addEventListener("keydown", e => {
  keysPressed[e.key] = true;
  if (e.code === 'Space') shootBullet();
});

document.addEventListener("keyup", e => keysPressed[e.key] = false);

document.addEventListener("mousemove", e => {
  const dx = e.clientX - canvas.width / 2;
  const dy = e.clientY - canvas.height / 2;
  player.angle = Math.atan2(dy, dx);
});

canvas.addEventListener("click", (e) => {
  if (treasureVisible && !treasureClicked) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - backgroundOffset.x;
    const mouseY = e.clientY - rect.top - backgroundOffset.y;

    if (
      mouseX >= treasure.x && mouseX <= treasure.x + treasure.size &&
      mouseY >= treasure.y && mouseY <= treasure.y + treasure.size
    ) {
      treasureClicked = true;
      openPuzzle();
    }
  }
});

function updatePlayer() {
  let moveX = 0;
  let moveY = 0;

  if (keysPressed["ArrowUp"] || keysPressed["w"]) moveY -= player.speed;
  if (keysPressed["ArrowDown"] || keysPressed["s"]) moveY += player.speed;
  if (keysPressed["ArrowLeft"] || keysPressed["a"]) moveX -= player.speed;
  if (keysPressed["ArrowRight"] || keysPressed["d"]) moveX += player.speed;

  player.x += moveX;
  player.y += moveY;

  player.x = Math.max(0, Math.min(player.x, world.width - player.size));
  player.y = Math.max(0, Math.min(player.y, world.height - player.size));

  backgroundOffset.x = Math.min(0, Math.max(canvas.width - world.width, -player.x + canvas.width / 2));
  backgroundOffset.y = Math.min(0, Math.max(canvas.height - world.height, -player.y + canvas.height / 2));
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x + player.size / 2 + backgroundOffset.x, player.y + player.size / 2 + backgroundOffset.y);
  ctx.rotate(player.angle);
  ctx.drawImage(playerImg, -player.size / 2, -player.size / 2, player.size, player.size);
  ctx.restore();
}

function shootBullet() {
  const offset = player.size / 2;
  const bulletX = player.x + offset + Math.cos(player.angle) * offset;
  const bulletY = player.y + offset + Math.sin(player.angle) * offset;

  bullets.push({
    x: bulletX,
    y: bulletY,
    dx: Math.cos(player.angle) * bulletSpeed,
    dy: Math.sin(player.angle) * bulletSpeed
  });
}

function updateBullets() {
  bullets = bullets.filter(b => {
    b.x += b.dx;
    b.y += b.dy;
    return b.x >= 0 && b.x <= world.width && b.y >= 0 && b.y <= world.height;
  });

  bossBullets = bossBullets.filter(b => {
    b.x += b.dx;
    b.y += b.dy;
    return b.x >= 0 && b.x <= world.width && b.y >= 0 && b.y <= world.height;
  });
}

function drawBullets() {
  bullets.forEach(b => {
    const bx = b.x + backgroundOffset.x;
    const by = b.y + backgroundOffset.y;
    const gradient = ctx.createRadialGradient(bx, by, 0, bx, by, bulletSize * 2);
    gradient.addColorStop(0, 'yellow');
    gradient.addColorStop(1, 'red');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(bx, by, bulletSize, 0, 2 * Math.PI);
    ctx.fill();
  });

  bossBullets.forEach(b => {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(b.x + backgroundOffset.x, b.y + backgroundOffset.y, bulletSize, 0, Math.PI * 2);
    ctx.fill();
  });
}

function updateMonsters() {
  monsters.forEach(m => {
    m.x += m.dx;
    m.y += m.dy;

    if (m.x < 0 || m.x > world.width - m.size) m.dx *= -1;
    if (m.y < 0 || m.y > world.height - m.size) m.dy *= -1;
  });
}

function drawMonsters() {
  monsters.forEach(m => {
    const mx = m.x + backgroundOffset.x;
    const my = m.y + backgroundOffset.y;
    ctx.drawImage(monsterImg, mx - m.size / 2, my - m.size / 2, m.size, m.size);

    ctx.fillStyle = "red";
    ctx.fillRect(mx - 25, my - m.size / 2 - 10, 50, 5);
    ctx.fillStyle = "lime";
    ctx.fillRect(mx - 25, my - m.size / 2 - 10, 50 * (m.health / 3), 5);
  });
}

function drawBoss() {
  if (boss) {
    const bx = boss.x + backgroundOffset.x;
    const by = boss.y + backgroundOffset.y;
    ctx.drawImage(bossImg, bx - boss.size / 2, by - boss.size / 2, boss.size, boss.size);

    ctx.fillStyle = "red";
    ctx.fillRect(bx - 50, by - boss.size / 2 - 15, 100, 8);
    ctx.fillStyle = "lime";
    ctx.fillRect(bx - 50, by - boss.size / 2 - 15, 100 * (boss.health / boss.maxHealth), 8);
  }
}

function updateBoss() {
  if (!boss) return;

  const dx = player.x - boss.x;
  const dy = player.y - boss.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 1) {
    boss.x += (dx / dist) * 2;
    boss.y += (dy / dist) * 2;
  }

  if (Date.now() - boss.lastShot > 1000) {
    const angle = Math.atan2(dy, dx);
    bossBullets.push({
      x: boss.x,
      y: boss.y,
      dx: Math.cos(angle) * bulletSpeed,
      dy: Math.sin(angle) * bulletSpeed,
    });
    boss.lastShot = Date.now();
  }
}

function drawHealth() {
  for (let i = 0; i < lives; i++) {
    ctx.drawImage(heartImg, 20 + i * 35, 20, 30, 30);
  }
}

function checkCollisions() {
  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      const dx = b.x - m.x;
      const dy = b.y - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < m.size / 2) {
        bullets.splice(j, 1);
        m.health--;
        if (m.health <= 0) monsters.splice(i, 1);
        break;
      }
    }
  }

  if (boss) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      const dx = b.x - boss.x;
      const dy = b.y - boss.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < boss.size / 2) {
        bullets.splice(i, 1);
        boss.health--;
        if (boss.health <= 0) {
          boss = null;
          window.location.href = "theend.html";
        }
        break;
      }
    }
  }

  bossBullets.forEach((b, i) => {
    const dx = b.x - player.x;
    const dy = b.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < player.size / 2 + bulletSize) {
      bossBullets.splice(i, 1);
      lives--;
    }
  });

  monsters.forEach((m, i) => {
    const dx = player.x + player.size / 2 - m.x;
    const dy = player.y + player.size / 2 - m.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < player.size / 2 + m.size / 2) {
      monsters.splice(i, 1);
      lives--;
    }
  });

  if (boss) {
    const dx = player.x + player.size / 2 - boss.x;
    const dy = player.y + player.size / 2 - boss.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < player.size / 2 + boss.size / 2) {
      lives--;
    }
  }

  if (lives <= 0) {
    alert("Game Over!");
    location.reload();
  }

  if (monsters.length === 0 && !boss && !treasureClicked) {
    boss = {
      x: world.width / 2,
      y: world.height / 2,
      size: 150,
      health: 20,
      maxHealth: 20,
      lastShot: 0
    };
  }
}

function drawTreasure() {
  if (treasureVisible && !treasureClicked) {
    const tx = treasure.x + backgroundOffset.x;
    const ty = treasure.y + backgroundOffset.y;
    ctx.drawImage(treasureImg, tx, ty, treasure.size, treasure.size);
  }
}

function openPuzzle() {
  document.getElementById("quizContainer").style.display = "block";
}

function checkAnswer() {
  const answer = document.getElementById("quizAnswer").value.toLowerCase().trim();
  if (answer === "three") {
    document.getElementById("quizContainer").innerHTML = `
      <h2>Congrats!</h2>
      <p>Now continue for your next mission.</p>
      <a href="index2.html">
        <button style="margin-top: 10px;">Next</button>
      </a>
    `;
  } else {
    alert("Try again!");
  }
}

function drawBackground() {
  ctx.drawImage(bgImg, backgroundOffset.x, backgroundOffset.y, world.width, world.height);
}

function update() {
  updatePlayer();
  updateMonsters();
  updateBullets();
  updateBoss();
  checkCollisions();
}

function draw() {
  drawBackground();
  drawMonsters();
  drawBoss();
  drawBullets();
  drawPlayer();
  drawHealth();
  drawTreasure();
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  draw();
  requestAnimationFrame(loop);
}
