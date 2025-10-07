const size = 8;  // 8x8 board
const bombs = 10;
let board = [];
let revealed = [];
let flags = [];
let gameOver = false;

function init() {
  board = Array.from({ length: size }, () => Array(size).fill(0));
  revealed = Array.from({ length: size }, () => Array(size).fill(false));
  flags = Array.from({ length: size }, () => Array(size).fill(false));
  gameOver = false;

  // place bombs
  let placed = 0;
  while (placed < bombs) {
    let r = Math.floor(Math.random() * size);
    let c = Math.floor(Math.random() * size);
    if (board[r][c] !== "B") {
      board[r][c] = "B";
      placed++;

      // increment numbers around bomb
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          let nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] !== "B") {
            board[nr][nc]++;
          }
        }
      }
    }
  }

  render();
}

function render() {
  const boardDiv = document.getElementById("board");
  boardDiv.style.gridTemplateColumns = `repeat(${size}, 35px)`;
  boardDiv.innerHTML = "";

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      // Revealed cells
      if (revealed[r][c]) {
        cell.classList.add("revealed");
        if (board[r][c] === "B") {
          cell.classList.add("bomb");
          cell.textContent = "💣";
        } else if (board[r][c] > 0) {
          cell.textContent = board[r][c];
          cell.setAttribute("data-num", board[r][c]);
        }
      }
      // Flags
      else if (flags[r][c]) {
        cell.classList.add("flag");
        cell.textContent = "🚩";
      }

      // Left click (reveal)
      cell.addEventListener("click", () => reveal(r, c));

      // Right click (toggle flag)
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleFlag(r, c);
      });

      boardDiv.appendChild(cell);
    }
  }
}

function toggleFlag(r, c) {
  if (revealed[r][c] || gameOver) return; // can't flag revealed or finished
  flags[r][c] = !flags[r][c];
  render();
}

function reveal(r, c) {
  if (revealed[r][c] || flags[r][c] || gameOver) return;
  revealed[r][c] = true;

  if (board[r][c] === "B") {
    alert("💥 Game Over!");
    gameOver = true;

    // Reveal all bombs
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) revealed[i][j] = true;
    }

    render();
    return; // stop here so win check won't run after losing
  }

  if (board[r][c] === 0) {
    // BFS flood fill
    let queue = [[r, c]];
    while (queue.length) {
      let [x, y] = queue.shift();
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          let nr = x + dr, nc = y + dc;
          if (
            nr >= 0 &&
            nr < size &&
            nc >= 0 &&
            nc < size &&
            !revealed[nr][nc] &&
            !flags[nr][nc]
          ) {
            revealed[nr][nc] = true;
            if (board[nr][nc] === 0) queue.push([nr, nc]);
          }
        }
      }
    }
  }

  // ✅ Check win only if game not over
  if (!gameOver && checkWin()) {
    alert("🎉 Congratulations, You Win!");
    gameOver = true;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) revealed[i][j] = true;
    }
  }

  render();
}

function checkWin() {
  let safeCells = size * size - bombs;
  let revealedCount = 0;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (revealed[i][j] && board[i][j] !== "B") {
        revealedCount++;
      }
    }
  }

  return revealedCount === safeCells;
}

// Restart button
document.getElementById("restart").addEventListener("click", init);

// Start game
init();
