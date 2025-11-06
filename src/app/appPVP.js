require("./components/gameboardui/gameboardui.css");
const GameboardUI = require("./components/gameboardui/gameboardui");
require("./components/modal/modal.css");
const Modal = require("./components/modal/modal");
require("./components/handoffscreen/handoffscreen.css");
const HandoffScreen = require("./components/handoffscreen/handoffscreen");

class AppPvP {
  constructor() {
    this.player1Board = new GameboardUI("Player 1", true);
    this.player2Board = new GameboardUI("Player 2", true);
    this.currentPlayer = 1; // 1 or 2
    this.modal = new Modal();
    this.handoffScreen = new HandoffScreen();
    this.gamePhase = "placement"; // placement or battle
  }

  init() {
    this.renderUI();

    // start with player 1 ship placement
    const Player = require("./models/player");
    const shipTypes = require("./models/shipTypes");

    this.player1 = new Player("Player 1", "human");
    this.player2 = new Player("Player 2", "human");

    window.player1 = this.player1;
    window.player2 = this.player2;

    const shipsToPlace = [
      { name: "Carrier", length: shipTypes.CARRIER },
      { name: "Battleship", length: shipTypes.BATTLESHIP },
      { name: "Destroyer", length: shipTypes.DESTROYER },
      { name: "Submarine", length: shipTypes.SUBMARINE },
      { name: "Patrol Boat", length: shipTypes.PATROL_BOAT },
    ];

    this.startPlayer1Placement(shipsToPlace);
  }

  renderUI() {
    this.player1Board.render("player-board");
    this.player2Board.render("enemy-board");
  }

  startPlayer1Placement(shipsToPlace) {
    console.log("Player 1: Place your ships on the board!");
    this._showPlacementInfo("Player 1 - Place your ships");

    // disable player 2 board during placement
    const player2Container = document.getElementById("enemy-board");
    if (player2Container) player2Container.style.pointerEvents = "none";

    this.player1Board.startShipPlacement(this.player1, shipsToPlace, () =>
      this.onPlayer1PlacementComplete(shipsToPlace),
    );
  }

  onPlayer1PlacementComplete(shipsToPlace) {
    console.log("Player 1 placement complete!");

    // show handoff screen before player 2 placement
    this.handoffScreen.show("Player 2", () => {
      this.startPlayer2Placement(shipsToPlace);
    });
  }

  startPlayer2Placement(shipsToPlace) {
    console.log("Player 2: Place your ships on the board!");
    this._showPlacementInfo("Player 2 - Place your ships");

    // hide player 1's ships
    this._hideShipsOnBoard("player-board");

    // enable player 2 board for placement
    const player1Container = document.getElementById("player-board");
    const player2Container = document.getElementById("enemy-board");

    if (player1Container) player1Container.style.pointerEvents = "none";
    if (player2Container) player2Container.style.pointerEvents = "auto";

    this.player2Board.startShipPlacement(this.player2, shipsToPlace, () =>
      this.onPlayer2PlacementComplete(),
    );
  }

  onPlayer2PlacementComplete() {
    console.log("Player 2 placement complete!");
    this.gamePhase = "battle";

    // show handoff screen before battle starts
    this.handoffScreen.show("Player 1", () => {
      this.startBattlePhase();
    });
  }

  startBattlePhase() {
    console.log("Battle phase started!");
    this._showPlacementInfo("Battle Phase - Player 1's turn");

    // player 1 starts, so they attack player 2's board (enemy-board)
    this.currentPlayer = 1;
    this.updateBoardsForCurrentPlayer();
    this.setupBattleEventListeners();
  }

  updateBoardsForCurrentPlayer() {
    const player1Container = document.getElementById("player-board");
    const player2Container = document.getElementById("enemy-board");

    if (this.currentPlayer === 1) {
      // player 1's turn: show player 1's ships on left, hide player 2's ships on right
      this._showShipsOnBoard("player-board", this.player1);
      this._hideShipsOnBoard("enemy-board");

      // player 1 attacks player 2's board (right)
      if (player1Container) player1Container.style.pointerEvents = "none";
      if (player2Container) player2Container.style.pointerEvents = "auto";
      this._showPlacementInfo("Player 1's turn - Attack!");
    } else {
      // player 2's turn: show player 2's ships on right, hide player 1's ships on left
      this._hideShipsOnBoard("player-board");
      this._showShipsOnBoard("enemy-board", this.player2);

      // player 2 attacks player 1's board (left)
      if (player1Container) player1Container.style.pointerEvents = "auto";
      if (player2Container) player2Container.style.pointerEvents = "none";
      this._showPlacementInfo("Player 2's turn - Attack!");
    }
  }

  updateBoardInteractivity() {
    const player1Container = document.getElementById("player-board");
    const player2Container = document.getElementById("enemy-board");

    if (this.currentPlayer === 1) {
      // player 1's turn: they see their board (left) and attack player 2's board (right)
      if (player1Container) player1Container.style.pointerEvents = "none";
      if (player2Container) player2Container.style.pointerEvents = "auto";
      this._showPlacementInfo("Player 1's turn - Attack!");
    } else {
      // player 2's turn: they attack player 1's board (left), see their board (right)
      if (player1Container) player1Container.style.pointerEvents = "auto";
      if (player2Container) player2Container.style.pointerEvents = "none";
      this._showPlacementInfo("Player 2's turn - Attack!");
    }
  }

  setupBattleEventListeners() {
    // player 1 attacks player 2's board (enemy-board on the right)
    const player2Container = document.getElementById("enemy-board");
    player2Container.addEventListener("cellClick", (e) => {
      if (this.currentPlayer !== 1 || this.gamePhase !== "battle") return;
      this.handleAttack(e, this.player1, this.player2, this.player2Board);
    });

    // player 2 attacks player 1's board (player-board on the left)
    const player1Container = document.getElementById("player-board");
    player1Container.addEventListener("cellClick", (e) => {
      if (this.currentPlayer !== 2 || this.gamePhase !== "battle") return;
      this.handleAttack(e, this.player2, this.player1, this.player1Board);
    });
  }

  handleAttack(e, attacker, defender, defenderBoard) {
    const { x, y } = e.detail;

    try {
      const result = attacker.attack(defender.gameboard, x, y);
      defenderBoard.updateCell(x, y, result);

      if (result === "hit") {
        const sunkShips = defender.gameboard.getSunkShipsCount();
        const attackerBoard =
          attacker === this.player1 ? this.player1Board : this.player2Board;
        attackerBoard.updateShipsSunk(sunkShips);
        this.checkWinner();
      }

      // disable both boards immediately so no further clicks register this turn
      const player1Container = document.getElementById("player-board");
      const player2Container = document.getElementById("enemy-board");
      if (player1Container) player1Container.style.pointerEvents = "none";
      if (player2Container) player2Container.style.pointerEvents = "none";

      // disable the attacked cell
      const container =
        attacker === this.player1
          ? document.getElementById("enemy-board")
          : document.getElementById("player-board");
      const cell = container.querySelector(
        `.cell[data-x='${x}'][data-y='${y}']`,
      );
      if (cell) {
        cell.style.pointerEvents = "none";
      }

      // switch turns with handoff screen
      this.switchTurns();
    } catch (err) {
      alert(err.message);
    }
  }

  switchTurns() {
    const nextPlayer = this.currentPlayer === 1 ? 2 : 1;

    this.handoffScreen.show(`Player ${nextPlayer}`, () => {
      this.currentPlayer = nextPlayer;
      this.updateBoardsForCurrentPlayer();
    });
  }

  checkWinner() {
    if (this.player1Board.shipsSunk >= 5) {
      this.endGame("Player 2");
    } else if (this.player2Board.shipsSunk >= 5) {
      this.endGame("Player 1");
    }
  }

  endGame(winner) {
    this.gamePhase = "ended";
    this.modal.show(winner, () => {
      this.resetGame();
    });
  }

  resetGame() {
    const Player = require("./models/player");
    const shipTypes = require("./models/shipTypes");

    this.player1 = new Player("Player 1", "human");
    this.player2 = new Player("Player 2", "human");
    this.player1Board = new GameboardUI("Player 1", true);
    this.player2Board = new GameboardUI("Player 2", true);
    this.player1Board.shipsSunk = 0;
    this.player2Board.shipsSunk = 0;
    this.currentPlayer = 1;
    this.gamePhase = "placement";

    this.renderUI();

    const shipsToPlace = [
      { name: "Carrier", length: shipTypes.CARRIER },
      { name: "Battleship", length: shipTypes.BATTLESHIP },
      { name: "Destroyer", length: shipTypes.DESTROYER },
      { name: "Submarine", length: shipTypes.SUBMARINE },
      { name: "Patrol Boat", length: shipTypes.PATROL_BOAT },
    ];

    this.startPlayer1Placement(shipsToPlace);
  }

  _showPlacementInfo(message) {
    const info = document.getElementById("placement-info");
    if (info) {
      info.textContent = message;
    }
  }

  _hideShipsOnBoard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const shipCells = container.querySelectorAll(".ship-placed");
    shipCells.forEach((cell) => {
      if (!cell.classList.contains("hit")) {
        cell.classList.remove("ship-placed");
      }
    });
  }

  _showShipsOnBoard(containerId, player) {
    const container = document.getElementById(containerId);
    if (!container || !player || !player.gameboard) return;

    const grid = player.gameboard.grid;

    for (let y = 0; y < player.gameboard.size; y++) {
      for (let x = 0; x < player.gameboard.size; x++) {
        if (grid[y][x] !== null) {
          const cell = container.querySelector(
            `.cell[data-x='${x}'][data-y='${y}']`,
          );
          if (
            cell &&
            !cell.classList.contains("hit") &&
            !cell.classList.contains("miss")
          ) {
            cell.classList.add("ship-placed");
          }
        }
      }
    }
  }
}

module.exports = AppPvP;
