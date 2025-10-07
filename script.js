const size = 8;       // Board size
const bombs = 10;     // Number of bombs

let board = [];
let revealed = [];
let flags = [];
let gameOver = false;
let firstClick = true; // Fix for first click

// Initialize arrays
function createEmptyBoard() {
  board = Array.from({ length: size }, () => Array(size).fill(0));
  revealed = Array.from({ length: size }, () => Array(size).fill(false));
  flags = Array.from({ length: size }, () => Array(size).fill(false));
  gameOver = false;
  firstClick = true;
}

// Place bombs ensuring first click is safe
function placeBombs(safeR, safeC) {
  let placed = 0;
  while (placed < bombs) {
    let r = Math.floor(Math.random() * size);
    let c = Math.floor(Math.random() * size);
    if (board[r][c] !== "B" && !(r === safeR && c === safeC)) {
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
}

// Render the board
function render() {
  const boardDiv = document.getElementById("board");
  boardDiv.style.gridTemplateColumns = `repeat(${size}, 40px)`;
  boardDiv.innerHTML = "";

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      if (revealed[r][c]) {
        cell.classList.add("revealed");
        if (board[r][c] === "B") cell.textContent = "💣";
        else if (board[r][c] > 0) cell.textContent = board[r][c];
      } else if (flags[r][c]) {
        cell.classList.add("flag");
        cell.textContent = "🚩";
      }

      cell.addEventListener("click", () => reveal(r, c));
      cell.addEventListener("contextmenu", e => {
        e.preventDefault();
        toggleFlag(r, c);
      });

      boardDiv.appendChild(cell);
    }
  }
}

// Toggle flag
function toggleFlag(r, c) {
  if (revealed[r][c] || gameOver) return;
  flags[r][c] = !flags[r][c];
  render();
}

// Reveal cell
function reveal(r, c) {
  if (revealed[r][c] || flags[r][c] || gameOver) return;

  // Place bombs on first click
  if (firstClick) {
    placeBombs(r, c);
    firstClick = false;
  }

  revealed[r][c] = true;

  if (board[r][c] === "B") {
    gameOver = true;
    alert("💥 Game Over!");
    revealAll();
    render();
    return;
  }

  // Expand empty cells
  if (board[r][c] === 0) expandEmpty(r, c);

  if (checkWin()) {
    gameOver = true;
    alert("🎉 You Win!");
    revealAll();
  }

  render();
}

// BFS expansion for empty cells
function expandEmpty(r, c) {
  let queue = [[r, c]];
  while (queue.length) {
    let [x, y] = queue.shift();
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        let nr = x + dr, nc = y + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size &&
            !revealed[nr][nc] && board[nr][nc] !== "B") {
          revealed[nr][nc] = true;
          if (board[nr][nc] === 0) queue.push([nr, nc]);
        }
      }
    }
  }
}

// Check win
function checkWin() {
  let safe = 0;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (revealed[r][c] && board[r][c] !== "B") safe++;
  return safe === size*size - bombs;
}

// Reveal all cells
function revealAll() {
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      revealed[r][c] = true;
}

// Restart
function init() {
  createEmptyBoard();
  render();
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("restart").addEventListener("click", init);
  init();
});
