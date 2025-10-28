const App = require("./app.js");
const AppPvP = require("./appPVP.js");
require("./components/modetoggle/modetoggle.css");

class GameController {
  constructor() {
    this.currentGame = null;
    this.currentMode = "pve"; // default to PvE
  }

  init() {
    this.createModeToggle();
    this.startGame(this.currentMode);
  }

  createModeToggle() {
    // create toggle container
    const toggleContainer = document.createElement("div");
    toggleContainer.className = "mode-toggle-container";
    toggleContainer.innerHTML = `
      <div class="mode-toggle">
        <button class="mode-btn active" data-mode="pve">
          <span class="mode-icon">🤖</span>
          <span class="mode-label">PVE</span>
        </button>
        <button class="mode-btn" data-mode="pvp">
          <span class="mode-icon">👥</span>
          <span class="mode-label">PVP</span>
        </button>
      </div>
    `;

    document.body.appendChild(toggleContainer);

    // add click handlers
    const buttons = toggleContainer.querySelectorAll(".mode-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;
        if (mode === this.currentMode) return;

        // update active state
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // switch game mode
        this.switchMode(mode);
      });
    });
  }

  switchMode(mode) {
    // confirm switch if game is in progress
    const confirmed = confirm(
      "Switching game mode will restart the game. Continue?",
    );
    if (!confirmed) {
      // revert button state
      const buttons = document.querySelectorAll(".mode-btn");
      buttons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.mode === this.currentMode);
      });
      return;
    }

    this.currentMode = mode;
    this.startGame(mode);
  }

  startGame(mode) {
    // clean up existing game
    if (this.currentGame) {
      // clear the boards
      const playerBoard = document.getElementById("player-board");
      const enemyBoard = document.getElementById("enemy-board");
      if (playerBoard) playerBoard.innerHTML = "";
      if (enemyBoard) enemyBoard.innerHTML = "";

      // clear placement info
      const placementInfo = document.getElementById("placement-info");
      if (placementInfo) placementInfo.remove();
    }

    // start new game based on mode
    if (mode === "pve") {
      this.currentGame = new App();
      this.currentGame.init();
    } else {
      this.currentGame = new AppPvP();
      this.currentGame.init();
    }
  }
}

module.exports = GameController;
