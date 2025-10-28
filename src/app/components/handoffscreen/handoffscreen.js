class HandoffScreen {
  constructor() {
    this.overlay = null;
  }

  show(playerName, onReady) {
    // remove existing overlay if any
    this.hide();

    // create overlay
    this.overlay = document.createElement("div");
    this.overlay.className = "handoff-overlay";
    this.overlay.innerHTML = `
      <div class="handoff-content">
        <h1 class="handoff-title">${playerName}'s Turn</h1>
        <p class="handoff-message">Pass the device to ${playerName}</p>
        <button class="handoff-ready-btn">I'm Ready</button>
      </div>
    `;

    document.body.appendChild(this.overlay);

    // add click handler
    const readyBtn = this.overlay.querySelector(".handoff-ready-btn");
    readyBtn.addEventListener("click", () => {
      this.hide();
      if (typeof onReady === "function") {
        onReady();
      }
    });
  }

  hide() {
    if (this.overlay && this.overlay.parentElement) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}

module.exports = HandoffScreen;
