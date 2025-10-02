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
