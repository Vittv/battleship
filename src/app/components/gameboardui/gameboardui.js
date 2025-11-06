class GameboardUI {
  // render all ships from the player's gameboard model
  renderShipsFromModel() {
    if (!this.player || !this.player.gameboard) return;
    const grid = this.player.gameboard.grid;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (grid[y][x] !== null) {
          const cell = document.querySelector(
            `.gameboard[data-player='${this.playerName.toLowerCase()}'] .cell[data-x='${x}'][data-y='${y}']`,
          );
          if (cell) cell.classList.add("ship-placed");
        }
      }
    }
  }
  // ship placement state
  startShipPlacement(player, shipsToPlace, onComplete) {
    this.placingShips = true;
    this.player = player;
    this.shipsToPlace = shipsToPlace.slice(); // copy
    this.currentShipIdx = 0;
    this.orientation = "horizontal";
    this.lockedCells = new Set();
    this._setupPlacementListeners();
    this._showPlacementMessage();
    this._onPlacementComplete =
      typeof onComplete === "function" ? onComplete : null;
  }

  _setupPlacementListeners() {
    const board = document.querySelector(
      `.gameboard[data-player='${this.playerName.toLowerCase()}']`,
    );
    if (!board) return;
    const cells = board.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.addEventListener("mouseover", this._handlePlacementHover.bind(this));
      cell.addEventListener("mouseout", this._clearPlacementPreview.bind(this));
      cell.addEventListener("click", this._handlePlacementClick.bind(this));
    });
    document.addEventListener(
      "keydown",
      this._handleOrientationToggle.bind(this),
    );
  }

  _handlePlacementHover(e) {
    if (!this.placingShips || !e.target.classList.contains("cell")) return;
    this._clearPlacementPreview();
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    const shipLen = this.shipsToPlace[this.currentShipIdx].length;
    let valid = true;
    let cells = [];
    for (let i = 0; i < shipLen; i++) {
      let cx = this.orientation === "horizontal" ? x + i : x;
      let cy = this.orientation === "horizontal" ? y : y + i;
      const cell = e.target.parentElement.querySelector(
        `.cell[data-x='${cx}'][data-y='${cy}']`,
      );
      if (!cell || this.lockedCells.has(`${cx},${cy}`)) valid = false;
      cells.push(cell);
    }
    cells.forEach((cell) => {
      if (cell)
        cell.classList.add(
          "placement-preview",
          valid ? "valid-placement" : "invalid-placement",
        );
    });
  }

  _clearPlacementPreview() {
    document.querySelectorAll(".placement-preview").forEach((cell) => {
      cell.classList.remove(
        "placement-preview",
        "valid-placement",
        "invalid-placement",
      );
    });
  }

  _handlePlacementClick(e) {
    if (!this.placingShips || !e.target.classList.contains("cell")) return;
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    const shipLen = this.shipsToPlace[this.currentShipIdx].length;
    let valid = true;
    let coords = [];
    for (let i = 0; i < shipLen; i++) {
      let cx = this.orientation === "horizontal" ? x + i : x;
      let cy = this.orientation === "horizontal" ? y : y + i;
      if (
        cx < 0 ||
        cx >= this.size ||
        cy < 0 ||
        cy >= this.size ||
        this.lockedCells.has(`${cx},${cy}`)
      )
        valid = false;
      coords.push({ x: cx, y: cy });
    }
    if (!valid) return;
    // place ship in game logic
    const Ship = require("../../models/ship");
    try {
      this.player.placeShip(new Ship(shipLen), x, y, this.orientation);
      coords.forEach(({ x, y }) => {
        this.lockedCells.add(`${x},${y}`);
        const cell = e.target.parentElement.querySelector(
          `.cell[data-x='${x}'][data-y='${y}']`,
        );
        if (cell) cell.classList.add("ship-placed");
      });
      this._clearPlacementPreview();
      this.renderShipsFromModel();
      this.currentShipIdx++;
      if (this.currentShipIdx >= this.shipsToPlace.length) {
        this.placingShips = false;
        // remove event listeners and clean up
        document.removeEventListener(
          "keydown",
          this._handleOrientationToggle.bind(this),
        );
        // remove the rotate button and show completion message
        this._showPlacementMessage("All ships placed!");
        if (this._onPlacementComplete) this._onPlacementComplete();
      } else {
        this._showPlacementMessage();
      }
    } catch (err) {
      this._showPlacementMessage("Invalid ship placement");
    }
  }

  _handleOrientationToggle(e) {
    if (e.key === "r" && this.placingShips) {
      this.orientation =
        this.orientation === "horizontal" ? "vertical" : "horizontal";
      this._showPlacementMessage();
      // immediately update hover preview if mouse is over a cell
      const board = document.querySelector(
        `.gameboard[data-player='${this.playerName.toLowerCase()}']`,
      );
      if (!board) return;
      const hovered = board.querySelector(".cell:hover");
      if (hovered) {
        this._handlePlacementHover({ target: hovered });
      } else {
        this._clearPlacementPreview();
      }
    }
  }

  _showPlacementMessage(msg) {
    let info = document.getElementById("placement-info");
    if (!info) {
      info = document.createElement("div");
      info.id = "placement-info";
      document.body.appendChild(info);
    }

    // only show placement and rotation options if we're actively placing ships
    if (!msg && this.placingShips) {
      const ship = this.shipsToPlace[this.currentShipIdx];
      console.log(`Place your ${ship.name} (length ${ship.length})`);

      const rotateBtn = `<button class="rotate-btn">Press 'R' or click&nbsp;<strong>ROTATE</strong></button>`;
      msg = `Placing ${ship.name} - ${this.orientation.toUpperCase()} ${rotateBtn}`;
    }

    info.innerHTML = msg || "";

    // only add rotation functionality if we're still placing ships
    const rotateBtn = info.querySelector(".rotate-btn");
    if (rotateBtn && this.placingShips) {
      rotateBtn.addEventListener("click", () => {
        this.orientation =
          this.orientation === "horizontal" ? "vertical" : "horizontal";
        this._showPlacementMessage();

        // update hover preview if mouse is over a cell
        const board = document.querySelector(
          `.gameboard[data-player='${this.playerName.toLowerCase()}']`,
        );
        if (board) {
          const hovered = board.querySelector(".cell:hover");
          if (hovered) {
            this._handlePlacementHover({ target: hovered });
          } else {
            this._clearPlacementPreview();
          }
        }
      });
    }
  }
  constructor(playerName, isInteractive = false) {
    this.playerName = playerName;
    this.isInteractive = isInteractive;
    this.size = 10;
    this.shipsSunk = 0;
    this.containerId = null;
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container #${containerId} not found`);
      return;
    }
    this.containerId = containerId;

    container.innerHTML = `
      <div class="gameboard-container">
        <div class="board-header">
          <div class="player-name">${this.playerName}</div>
          <div class="score">X - ${this.shipsSunk}</div>
        </div>
        <div class="gameboard" data-player="${this.playerName.toLowerCase()}">
          ${this.generateGrid()}
        </div>
      </div>
    `;

    if (this.isInteractive) {
      this.addEventListeners(container);
      this.renderShipsFromModel();
    }
  }

  generateGrid() {
    let gridHTML = "";
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        gridHTML += `
          <div class="cell" data-x="${x}" data-y="${y}" 
               data-coord="${String.fromCharCode(65 + x)}${y + 1}">
          </div>
        `;
      }
    }
    return gridHTML;
  }

  addEventListeners(container) {
    const cells = container.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.addEventListener("click", (e) => {
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);

        // emit custom event or call callback
        const event = new CustomEvent("cellClick", {
          detail: { x, y, player: this.playerName },
        });
        container.dispatchEvent(event);
      });
    });
  }

  updateCell(x, y, status) {
    const cell = document.querySelector(
      `.gameboard[data-player="${this.playerName.toLowerCase()}"] 
       .cell[data-x="${x}"][data-y="${y}"]`,
    );

    if (cell) {
      cell.className = `cell ${status}`;
      if (status === "hit") {
        cell.innerHTML = `<span class="mark">X</span>`;
      } else if (status === "miss") {
        cell.innerHTML = `<span class="mark">~</span>`;
      } else {
        // clear content for other statuses
        cell.innerHTML = "";
      }
    }
  }

  updateShipsSunk(count) {
    this.shipsSunk = count;
    const container = document.getElementById(this.containerId);
    if (container) {
      const scoreElement = container.querySelector(".score");
      if (scoreElement) {
        scoreElement.textContent = `X - ${count}`;
      }
    }
  }
}

module.exports = GameboardUI;
