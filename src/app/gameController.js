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
    const toggleContainer = document.createElement("div");
    toggleContainer.className = "mode-toggle";

    const header = document.querySelector("header");
    header.insertAdjacentElement("afterend", toggleContainer);

    // single toggle button
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "mode-btn";
    this.updateModeButton(toggleBtn);
    toggleContainer.appendChild(toggleBtn);

    toggleBtn.addEventListener("click", () => {
      const newMode = this.currentMode === "pve" ? "pvp" : "pve";
      this.switchMode(newMode);
      this.updateModeButton(toggleBtn);
    });
  }

  updateModeButton(btn) {
    const isPVE = this.currentMode === "pve";
    btn.innerHTML = `
      <span class="mode-text">
        <span class="mode-pve ${!isPVE ? "active" : ""}">PVE</span>
        /
        <span class="mode-pvp ${isPVE ? "active" : ""}">PVP</span>
      </span>
    `;
  }

  switchMode(mode) {
    // if current game is PVE and it's CPU's turn, don't allow switching
    if (
      this.currentMode === "pve" &&
      this.currentGame &&
      !this.currentGame.isPlayerTurn
    ) {
      alert(
        "Please wait for the CPU to complete its turn before switching modes.",
      );
      // revert button state
      const buttons = document.querySelectorAll(".mode-btn");
      buttons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.mode === this.currentMode);
      });
      return;
    }

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
      if (placementInfo) placementInfo.textContent = "";

      // remove any remaining event listeners
      const boardsContainer = document.querySelector(".boards-container");
      if (boardsContainer) {
        const newContainer = boardsContainer.cloneNode(false);
        boardsContainer.parentNode.replaceChild(newContainer, boardsContainer);
      }

      // ensure any modals are closed
      const modals = document.querySelectorAll(".game-modal, .handoff-overlay");
      modals.forEach((modal) => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      });

      // nullify the current game to ensure garbage collection
      this.currentGame = null;
    }

    // create boards container if it doesn't exist
    let boardsContainer = document.querySelector(".boards-container");
    if (!boardsContainer) {
      boardsContainer = document.createElement("div");
      boardsContainer.className = "boards-container";
      const main = document.querySelector("main");
      main.appendChild(boardsContainer);

      // create placement info if it doesn't exist
      let placementInfo = document.getElementById("placement-info");
      if (!placementInfo) {
        placementInfo = document.createElement("div");
        placementInfo.id = "placement-info";
        main.appendChild(placementInfo);
      }
    }

    // recreate board divs
    const playerBoardDiv = document.createElement("div");
    playerBoardDiv.id = "player-board";
    const enemyBoardDiv = document.createElement("div");
    enemyBoardDiv.id = "enemy-board";
    boardsContainer.appendChild(playerBoardDiv);
    boardsContainer.appendChild(enemyBoardDiv);

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
