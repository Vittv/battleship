class Scoreboard {
  constructor(player1Name = "Player 1", player2Name = "CPU") {
    this.player1Name = player1Name;
    this.player2Name = player2Name;
    this.player1Score = 0;
    this.player2Score = 0;
  }

  render(containerId = "scoreboard") {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container #${containerId} not found`);
      return;
    }

    container.innerHTML = `
      <div class="scoreboard">
        <div class="player-score player-1">
          <h3>${this.player1Name}</h3>
          <div class="score">Ships: <span class="ship-count">5</span></div>
          <div class="hits">Hits: <span class="hit-count">0</span></div>
        </div>
        
        <div class="vs">VS</div>
        
        <div class="player-score player-2">
          <h3>${this.player2Name}</h3>
          <div class="score">Ships: <span class="ship-count">5</span></div>
          <div class="hits">Hits: <span class="hit-count">0</span></div>
        </div>
      </div>
    `;
  }

  updatePlayer1Score(shipsRemaining, hits) {
    this.updateScore("player-1", shipsRemaining, hits);
  }

  updatePlayer2Score(shipsRemaining, hits) {
    this.updateScore("player-2", shipsRemaining, hits);
  }

  updateScore(playerClass, shipsRemaining, hits) {
    const playerEl = document.querySelector(`.${playerClass}`);
    if (playerEl) {
      const shipCounter = playerEl.querySelector(".ship-count");
      const hitCount = playerEl.querySelector(".hit-count");

      if (shipCount) shipCount.textContent = shipsRemaining;
      if (hitCount) hitCount.textContent = hits;
    }
  }
}

module.exports = Scoreboard;
