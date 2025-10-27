require("./components/gameboardui/gameboardui.css");
const GameboardUI = require("./components/gameboardui/gameboardui");
require("./components/modal/modal.css");
const Modal = require("./components/modal/modal");

class App {
  constructor() {
    this.playerBoard = new GameboardUI("Player 1", true);
    this.enemyBoard = new GameboardUI("CPU", true);
    this.isPlayerTurn = true;
    this.modal = new Modal();
  }

  init() {
    this.renderUI();
    // disable CPU board clicks until ship placement is done
    const enemyContainer = document.getElementById("enemy-board");
    if (enemyContainer) enemyContainer.style.pointerEvents = "none";

    // ship placement phase for Player 1
    const Player = require("./models/player");
    const shipTypes = require("./models/shipTypes");
    this.player1 = new Player("Player 1", "human");
    window.player1 = this.player1;
    const shipsToPlace = [
      { name: "Carrier", length: shipTypes.CARRIER },
      { name: "Battleship", length: shipTypes.BATTLESHIP },
      { name: "Destroyer", length: shipTypes.DESTROYER },
      { name: "Submarine", length: shipTypes.SUBMARINE },
      { name: "Patrol Boat", length: shipTypes.PATROL_BOAT },
    ];
    console.log("Place your ships on the board!");
    this.playerBoard.startShipPlacement(this.player1, shipsToPlace, () => {
      // after placement, enable CPU board and start game
      const Ship = require("./models/ship");
      const cpuShips = [
        new Ship(shipTypes.CARRIER),
        new Ship(shipTypes.BATTLESHIP),
        new Ship(shipTypes.DESTROYER),
        new Ship(shipTypes.SUBMARINE),
        new Ship(shipTypes.PATROL_BOAT),
      ];
      this.cpu = new Player("CPU", "computer");
      window.cpu = this.cpu;
      this.cpu.autoPlaceShips(cpuShips);
      // enable CPU board clicks
      if (enemyContainer) enemyContainer.style.pointerEvents = "auto";
      // now enable attack phase
      this.setupEventListeners();
      this.isPlayerTurn = true;
      console.log("Attack the enemy board!");
    });
  }

  renderUI() {
    this.playerBoard.render("player-board");
    this.enemyBoard.render("enemy-board");
  }

  setupEventListeners() {
    // handle cell clicks on enemy board (attacks)
    const enemyContainer = document.getElementById("enemy-board");
    enemyContainer.addEventListener("cellClick", (e) => {
      // only allow attacks if ship placement is finished
      if (!this.isPlayerTurn || this.playerBoard.placingShips) return;
      const { x, y } = e.detail;
      // player 1 attacks CPU's gameboard
      try {
        const result = this.player1.attack(this.cpu.gameboard, x, y);
        // update enemy board UI with hit/miss feedback
        this.enemyBoard.updateCell(x, y, result); // 'hit' or 'miss'

        if (result === "hit") {
          const sunkShips = this.cpu.gameboard.getSunkShipsCount();
          this.playerBoard.updateShipsSunk(sunkShips); // player gets points for sinking CPU's ships
          this.checkWinner();
        }

        // permanently disable this cell
        const cell = enemyContainer.querySelector(
          `.cell[data-x='${x}'][data-y='${y}']`,
        );
        if (cell) {
          cell.style.pointerEvents = "none";
        }
        this.isPlayerTurn = false;
        setTimeout(() => this.cpuAttack(), 800); // CPU attacks after short delay
      } catch (err) {
        alert(err.message);
      }
    });
  }

  cpuAttack() {
    // CPU attacks player board
    try {
      const result = this.cpu.computerAttack(this.player1.gameboard);
      // find last attack coordinates
      const lastAttack = Array.from(this.cpu.previousAttacks).pop();
      const [x, y] = lastAttack.split(",").map(Number);
      this.playerBoard.updateCell(x, y, result); // "hit" or "miss"

      if (result === "hit") {
        const sunkShips = this.player1.gameboard.getSunkShipsCount();
        this.enemyBoard.updateShipsSunk(sunkShips); // CPU gets points for sinking Player's ships
        this.checkWinner();
      }

      this.isPlayerTurn = true;
    } catch (err) {
      // should not happen, but handle gracefully
      alert("CPU error: " + err.message);
    }
  }
  checkWinner() {
    if (this.playerBoard.shipsSunk >= 5) {
      this.endGame("Player 1");
    } else if (this.enemyBoard.shipsSunk >= 5) {
      this.endGame("CPU");
    }
  }

  endGame(winner) {
    this.modal.show(winner, () => {
      this.resetGame();
    });
  }

  resetGame() {
    // re-create both players and boards from scratch
    const Player = require("./models/player");
    const shipTypes = require("./models/shipTypes");
    this.player1 = new Player("Player 1", "human");
    this.cpu = new Player("CPU", "computer");
    this.playerBoard = new GameboardUI("Player 1", true);
    this.enemyBoard = new GameboardUI("CPU", true);
    this.playerBoard.shipsSunk = 0;
    this.enemyBoard.shipsSunk = 0;
    this.renderUI();
    // start ship placement again
    const shipsToPlace = [
      { name: "Carrier", length: shipTypes.CARRIER },
      { name: "Battleship", length: shipTypes.BATTLESHIP },
      { name: "Destroyer", length: shipTypes.DESTROYER },
      { name: "Submarine", length: shipTypes.SUBMARINE },
      { name: "Patrol Boat", length: shipTypes.PATROL_BOAT },
    ];
    console.log("Place your ships on the board!");
    this.playerBoard.startShipPlacement(this.player1, shipsToPlace, () => {
      // CPU ship placement
      const Ship = require("./models/ship");
      const cpuShips = [
        new Ship(shipTypes.CARRIER),
        new Ship(shipTypes.BATTLESHIP),
        new Ship(shipTypes.DESTROYER),
        new Ship(shipTypes.SUBMARINE),
        new Ship(shipTypes.PATROL_BOAT),
      ];
      this.cpu.autoPlaceShips(cpuShips);
      this.setupEventListeners();
      this.isPlayerTurn = true;
      console.log("Attack the enemy board!");
    });
  }
}

module.exports = App;
