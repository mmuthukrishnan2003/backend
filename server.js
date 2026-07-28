const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- Game state (in-memory, single game for simplicity) ---
function createNewGame() {
  return {
    board: Array(9).fill(null), // 9 cells, null = empty, 'X' or 'O'
    currentPlayer: 'X',
    winner: null,      // 'X', 'O', 'draw', or null
    winningLine: null, // indices of winning cells, if any
  };
}

let game = createNewGame();

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
];

function checkWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: 'draw', line: null };
  }
  return { winner: null, line: null };
}

// --- Routes ---

// Get current game state
app.get('/api/state', (req, res) => {
  res.json(game);
});

// Start a new game
app.post('/api/new-game', (req, res) => {
  game = createNewGame();
  res.json(game);
});

// Make a move
app.post('/api/move', (req, res) => {
  const { index } = req.body;

  if (typeof index !== 'number' || index < 0 || index > 8) {
    return res.status(400).json({ error: 'Invalid cell index' });
  }
  if (game.winner) {
    return res.status(400).json({ error: 'Game is already over. Start a new game.' });
  }
  if (game.board[index] !== null) {
    return res.status(400).json({ error: 'Cell already taken' });
  }

  game.board[index] = game.currentPlayer;

  const result = checkWinner(game.board);
  game.winner = result.winner;
  game.winningLine = result.line;

  if (!game.winner) {
    game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
  }

  res.json(game);
});

app.listen(PORT, () => {
  console.log(`Tic-Tac-Toe backend running on http://localhost:${PORT}`);
});
