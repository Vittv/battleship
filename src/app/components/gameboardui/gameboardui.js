class GameboardUI {
  constructor(playerName, isInteractive = false) {
    this.playerName = playerName;
    this.isInteractive = isInteractive;
    this.size = 10;
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container #${containerId} not found`);
      return;
    }

    container.innerHTML = `
      <div class="gameboard-container">
        <h3>${this.playerName}</h3>
        <div class="gameboard" data-player="${this.playerName.toLowerCase()}">
          ${this.generateGrid()}
        </div>
      </div>
    `;

    if (this.isInteractive) {
      this.addEventListeners(container);
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
        cell.textContent = "💥";
      } else if (status === "miss") {
        cell.textContent = "💦";
      }
    }
  }
}

module.exports = GameboardUI;
