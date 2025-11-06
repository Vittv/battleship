class HandoffScreen {
  constructor() {
    this.overlay = null;
  }

  show(playerName, onReady, delay = 700) {
    // remove existing overlay if any
    this.hide();

    // store callback for keyboard handler
    this.onReady = onReady;

    // if a previous timer exists, clear it
    if (this._delayTimer) {
      clearTimeout(this._delayTimer);
    }

    // set delay before showing the overlay
    this._delayTimer = setTimeout(() => {
      // create overlay
      this.overlay = document.createElement("div");
      this.overlay.className = "handoff-overlay";
      this.overlay.innerHTML = `
      <div class="handoff-content">
        <h1 class="handoff-title">${playerName}'s Turn</h1>
        <p class="handoff-message">Pass the device to ${playerName}</p>
        <button class="handoff-ready-btn">I'm Ready (Press Enter)</button>
      </div>
    `;

      document.body.appendChild(this.overlay);

      // add click handler
      const readyBtn = this.overlay.querySelector(".handoff-ready-btn");
      readyBtn.addEventListener("click", () => this.confirmReady());

      // add keyboard handler
      this.handleKeyPress = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.confirmReady();
        }
      };
      document.addEventListener("keydown", this.handleKeyPress);
    }, delay);
  }

  confirmReady() {
    this.hide();
    if (typeof this.onReady === "function") {
      this.onReady();
    }
  }

  hide() {
    if (this.overlay && this.overlay.parentElement) {
      this.overlay.remove();
      this.overlay = null;
    }
    // remove keyboard listener
    if (this.handleKeyPress) {
      document.removeEventListener("keydown", this.handleKeyPress);
      this.handleKeyPress = null;
    }
  }
}

module.exports = HandoffScreen;
