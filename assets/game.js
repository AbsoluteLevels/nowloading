

// Snake Game on 7x7 grid
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreBoard = document.getElementById('scoreBoard');


const GRID_SIZE = 7;
const CELL = 50;
const MAX_LEN = 10;
const DESIRE_EMOJIS = ['🍔','💰','🎮','📱','🍰','🍕','🍺','🎲','🎧','🏆'];
let snake, dir, nextDir, food, foodEmoji, score, highScore, interval, alive;

function resetGame() {
  snake = [ {x: 3, y: 3} ];
  dir = {x: 1, y: 0};
  nextDir = {x: 1, y: 0};
  food = randomFood();
  score = 0;
  highScore = parseInt(localStorage.getItem('enlightenHighScore') || '0');
  alive = true;
  drawGame();
  if (interval) clearInterval(interval);
  interval = setInterval(gameStep, 220);
}

function randomFood() {
  let pos;
  do {
    pos = {x: Math.floor(Math.random()*GRID_SIZE), y: Math.floor(Math.random()*GRID_SIZE)};
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  foodEmoji = DESIRE_EMOJIS[Math.floor(Math.random()*DESIRE_EMOJIS.length)];
  return pos;
}

function gameStep() {
  if (!alive) return;
  dir = nextDir;
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  // Wall or self collision
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || snake.some(s => s.x === head.x && s.y === head.y)) {
    alive = false;
    clearInterval(interval);
    setTimeout(resetGame, 1200);
    return;
  }
  snake.unshift(head);
  // Eat food
  if (head.x === food.x && head.y === food.y) {
    score++;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('enlightenHighScore', highScore);
    }
    const isNight = document.body.classList.contains('night');
    if ((isNight && score >= 10) || (!isNight && score >= 108)) {
      showSecret();
    }
    if (snake.length > MAX_LEN) snake.pop();
    food = randomFood();
  } else {
    if (snake.length > MAX_LEN) snake.pop();
    else snake.pop();
  }
  drawGame();
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw grid
  ctx.strokeStyle = '#bbb';
  for (let i = 1; i < GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL, 0);
    ctx.lineTo(i * CELL, GRID_SIZE * CELL);
    ctx.moveTo(0, i * CELL);
    ctx.lineTo(GRID_SIZE * CELL, i * CELL);
    ctx.stroke();
  }
  // Draw food (earthly desire emoji)
  ctx.beginPath();
  ctx.arc(food.x * CELL + 25, food.y * CELL + 25, 16, 0, 2 * Math.PI);
  ctx.fillStyle = '#fffde7';
  ctx.shadowColor = '#ffd600';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffd600';
  ctx.stroke();
  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#ffd600';
  // Center emoji horizontally in the cell
  const emojiMetrics = ctx.measureText(foodEmoji);
  const emojiX = food.x * CELL + (CELL / 2) - (emojiMetrics.width / 2);
  ctx.fillText(foodEmoji, emojiX, food.y * CELL + 33);
  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.beginPath();
    ctx.arc(snake[i].x * CELL + 25, snake[i].y * CELL + 25, 18, 0, 2 * Math.PI);        
    ctx.fillStyle = i === 0 ? '#aa7108ff' : '#d19648ff';
    ctx.globalAlpha = i === 0 ? 1 : 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#aa7108ff';
    ctx.stroke();
    if (i === 0) {
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#fff';
      const humanEmoji = '😚';
      const humanMetrics = ctx.measureText(humanEmoji);
      const humanX = snake[i].x * CELL + (CELL / 2) - (humanMetrics.width / 2);
      ctx.fillText(humanEmoji, humanX, snake[i].y * CELL + 33);
    }
  }
  // Update score below grid
  if (scoreBoard) {
    scoreBoard.innerHTML = `<span style="color:#aa7108ff;font-weight:bold;">Score: ${score}</span> &nbsp; <span style="color:#888;">High: ${highScore}</span>`;
  }
}

// Keyboard controls (Arrow keys and WASD)
window.addEventListener('keydown', function(e) {
  if (!alive) return;
  let d = dir;
  const key = e.key.toLowerCase();
  if ((e.key === 'ArrowUp' || key === 'w') && dir.y !== 1) d = {x:0, y:-1};
  else if ((e.key === 'ArrowDown' || key === 's') && dir.y !== -1) d = {x:0, y:1};
  else if ((e.key === 'ArrowLeft' || key === 'a') && dir.x !== 1) d = {x:-1, y:0};
  else if ((e.key === 'ArrowRight' || key === 'd') && dir.x !== -1) d = {x:1, y:0};
  else return;
  nextDir = d;
});

// Touch controls (swipe)
let touchStartX = 0, touchStartY = 0;
canvas.addEventListener('touchstart', function(e) {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
});
canvas.addEventListener('touchend', function(e) {
  if (!alive) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 20 && dir.x !== -1) nextDir = {x:1, y:0};
    else if (dx < -20 && dir.x !== 1) nextDir = {x:-1, y:0};
  } else {
    if (dy > 20 && dir.y !== -1) nextDir = {x:0, y:1};
    else if (dy < -20 && dir.y !== 1) nextDir = {x:0, y:-1};
  }
});

function showSecret() {
  // Show enlightenment modal with different content for night mode
  const modal = document.getElementById('enlightenModal');
  if (modal) {
    // Pause the game
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    const isNight = document.body.classList.contains('night');
    const modalBody = modal.querySelector('.modal-body');
    if (isNight) {
      modalBody.innerHTML = `
        <div style="text-align:center;">
          <img src="assets/candle.png" alt="Lotus" style="height:2.5em;display:inline-block;">
        </div>
        <h2 style="text-align:center;">A Lesson in the Dark</h2>
        <p style="text-align:center;">You feel unsettled... <br>It isn't called en-darkmode-tenment now is it...<br><em>Try again...</em></p>
      `;
    } else {
      modalBody.innerHTML = `
        <div style="text-align:center;">
          <img src="assets/candle.png" alt="Lotus" style="height:2.5em;display:inline-block;">
        </div>
        <h2 style="text-align:center;">You are enlightened!</h2>
        <p style="text-align:center;">108 steps, one moment of clarity.<br>You've inspected the elements of your journey and found which ones resonate with your true self.</p>
      `;
    }
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    // Close modal on click X or outside
    const closeBtn = document.getElementById('closeModal');
    function closeModal() {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      closeBtn.removeEventListener('click', closeModal);
      window.removeEventListener('click', outsideClick);
      // Optionally, reset the game after closing modal
      resetGame();
    }
    function outsideClick(e) {
      if (e.target === modal) closeModal();
    }
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', outsideClick);
  }
}

// Start game
resetGame();
