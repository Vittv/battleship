class Modal {
  constructor() {
    this.modal = document.createElement("div");
    this.modal.className = "game-modal";
    this.modal.style.display = "none";
    this.modal.innerHTML = `
      <div class="modal-content">
        <h1 class="modal-title"></h1>
        <button class="restart-btn">Restart</button>
      </div>
    `;
    document.body.appendChild(this.modal);
    this.restartBtn = this.modal.querySelector(".restart-btn");
    this.restartBtn.addEventListener("click", () => {
      this.hide();
      if (typeof this.onRestart === "function") this.onRestart();
    });
  }

  show(winner, onRestart) {
    this.onRestart = onRestart;
    this.modal.style.display = "flex";
    this.modal.querySelector(".modal-title").textContent = `${winner} wins!`;
    document.body.classList.add("blurred");
  }

  hide() {
    this.modal.style.display = "none";
    document.body.classList.remove("blurred");
  }
}

module.exports = Modal;
