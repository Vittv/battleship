require("./components/scoreboard/scoreboard.css");
require("./components/gameboardui/gameboardui.css");
const Scoreboard = require("./components/scoreboard/scoreboard");
const GameboardUI = require("./components/gameboardui/gameboardui");

class App {
  constructor() {
    this.scoreboard = new Scoreboard();
    this.playerBoard = new GameboardUI("Player 1", true);
    this.enemyBoard = new GameboardUI("CPU", false);
  }

  init() {
    this.renderUI();
    this.setupEventListeners();
    // ship placement phase for Player 1
    const Player = require("./models/player");
    const shipTypes = require("./models/shipTypes");
    // create player instance and expose globally for debugging
    this.player1 = new Player("Player 1", "human");
    window.player1 = this.player1;
    // prepare ships to place (largest to smallest)
    const shipsToPlace = [
      { name: "Carrier", length: shipTypes.CARRIER },
      { name: "Battleship", length: shipTypes.BATTLESHIP },
      { name: "Destroyer", length: shipTypes.DESTROYER },
      { name: "Submarine", length: shipTypes.SUBMARINE },
      { name: "Patrol Boat", length: shipTypes.PATROL_BOAT },
    ];
    this.playerBoard.startShipPlacement(this.player1, shipsToPlace);

    // ship placement phase for CPU
    const Ship = require("./models/ship");
    // create ship instances for CPU
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
      const { x, y } = e.detail;
      console.log(`Attack at ${x}, ${y}`);
      // we'll connect this to game logic later
    });
  }
}

module.exports = App;
