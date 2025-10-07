require("./components/scoreboard/scoreboard.css");
require("./components/gameboardui/gameboardui.css");
const Scoreboard = require("./components/scoreboard/scoreboard");
const GameboardUI = require("./components/gameboardui/gameboardui");

class App {
  constructor() {
    this.scoreboard = new Scoreboard();
    this.playerBoard = new GameboardUI("Player 1", true);
    this.enemyBoard = new GameboardUI("CPU", true);
    this.isPlayerTurn = true;
  }

  init() {
    this.renderUI();
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
    // only start game after player ship placement is complete
    this.playerBoard.startShipPlacement(this.player1, shipsToPlace, () => {
      // ship placement phase for CPU
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
      // now enable attack phase
      this.setupEventListeners();
      this.isPlayerTurn = true;
    });
  }

  renderUI() {
    this.scoreboard.render("scoreboard");
    this.playerBoard.render("player-board");
    this.enemyBoard.render("enemy-board");
  }

  setupEventListeners() {
    // handle cell clicks on enemy board (attacks)
    const enemyContainer = document.getElementById("enemy-board");
    enemyContainer.addEventListener("cellClick", (e) => {
      if (!this.isPlayerTurn) return;
      const { x, y } = e.detail;
      // player 1 attacks CPU's gameboard
      try {
        const result = this.player1.attack(this.cpu.gameboard, x, y);
        // update enemy board UI with hit/miss feedback
        this.enemyBoard.updateCell(x, y, result); // 'hit' or 'miss'
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
      this.isPlayerTurn = true;
    } catch (err) {
      // should not happen, but handle gracefully
      alert("CPU error: " + err.message);
    }
  }
}

module.exports = App;
