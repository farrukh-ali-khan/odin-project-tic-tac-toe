// script.js (corrected version)
const GameBoard = (() => {
  const board = Array(9).fill(null);

  return {
    getBoard: () => [...board],
    markCell: (index, symbol) => {
      if (board[index] === null) {
        board[index] = symbol;
        return true;
      }
      return false;
    },
    reset: () => board.fill(null),
    checkWin: () => {
      const winCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];
      for (const combo of winCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a];
        }
      }
      return null;
    },
    isBoardFull: () => board.every((cell) => cell !== null),
  };
})();

const GameController = (() => {
  let players = [];
  let currentPlayerIndex = 0;
  let gameActive = false;

  const createPlayer = (name, symbol) => ({ name, symbol });

  return {
    startNewGame: (player1Name, player2Name) => {
      players = [
        createPlayer(player1Name || "Player 1", "❌"),
        createPlayer(player2Name || "Player 2", "⭕"),
      ];
      currentPlayerIndex = 0;
      gameActive = true;
      GameBoard.reset();
    },
    getCurrentPlayer: () => players[currentPlayerIndex],
    playTurn: (cellIndex) => {
      if (!gameActive) return false;
      const currentPlayer = players[currentPlayerIndex];
      if (GameBoard.markCell(cellIndex, currentPlayer.symbol)) {
        const winnerSymbol = GameBoard.checkWin();
        if (winnerSymbol) {
          gameActive = false;
          return {
            gameOver: true,
            winner: players.find((p) => p.symbol === winnerSymbol),
            isTie: false,
          };
        }
        if (GameBoard.isBoardFull()) {
          gameActive = false;
          return { gameOver: true, winner: null, isTie: true };
        }
        currentPlayerIndex = 1 - currentPlayerIndex;
        return { gameOver: false };
      }
      return false;
    },
  };
})();

const DisplayController = (() => {
  const boardElement = document.querySelector(".game-board");
  const statusElement = document.querySelector(".game-status");
  const player1Input = document.querySelector("#player1");
  const player2Input = document.querySelector("#player2");
  const startButton = document.querySelector("#start-btn");
  const restartButton = document.querySelector("#restart-btn");

  const renderBoard = () => {
    boardElement.innerHTML = "";
    GameBoard.getBoard().forEach((cell, index) => {
      const cellElement = document.createElement("div");
      cellElement.className = "cell";
      cellElement.textContent = cell || "";
      cellElement.dataset.index = index;
      boardElement.appendChild(cellElement);
    });
  };

  const handleCellClick = (e) => {
    if (!e.target.classList.contains("cell")) return;
    const cellIndex = parseInt(e.target.dataset.index);
    const result = GameController.playTurn(cellIndex);

    if (!result) return;

    renderBoard();

    // CORRECTED LINES HERE (added quotes around CSS variables)
    if (result.gameOver) {
      statusElement.textContent = result.isTie
        ? "Game Over! It's a tie! 🤝"
        : `🏆 ${result.winner.name} wins!`;
      statusElement.style.color = result.isTie
        ? "var(--secondary-color)"
        : "var(--success-color)";
    } else {
      const currentPlayer = GameController.getCurrentPlayer();
      statusElement.textContent = `${currentPlayer.name}'s turn (${currentPlayer.symbol})`;
      statusElement.style.color = "var(--primary-color)";
    }
  };

  const initializeGame = () => {
    const player1Name = player1Input.value.trim();
    const player2Name = player2Input.value.trim();
    GameController.startNewGame(player1Name, player2Name);
    boardElement.removeEventListener("click", handleCellClick);
    boardElement.addEventListener("click", handleCellClick);
    renderBoard();
    statusElement.textContent = `${
      GameController.getCurrentPlayer().name
    }'s turn`;
    statusElement.style.color = "var(--primary-color)";
  };

  startButton.addEventListener("click", initializeGame);
  restartButton.addEventListener("click", initializeGame);

  // Initial setup
  GameController.startNewGame();
  renderBoard();
})();
