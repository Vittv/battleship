const Gameboard = require("./gameboard");

class Player {
  constructor(name, type = "human") {
    this.name = name;
    this.type = type;
    this.gameboard = new Gameboard();
    this.previousAttacks = new Set(); // track all attacks
  }

  // method for attacking opponent's gameboard
  attack(opponentGameboard, x, y) {
    if (this.type === "human") {
      if (this.previousAttacks.has(`${x}, ${y}`)) {
        throw new Error("You already attacked this coordinate");
      }
      this.previousAttacks.add(`${x}, ${y}`);
      return opponentGameboard.receiveAttack(x, y);
    } else {
      // computer generates random coordinates
      return this.computerAttack(opponentGameboard);
    }
  }

  // computer AI for generating attacks
  computerAttack(opponentGameboard) {
    let x, y, coordKey;

    // keep generating random coords until it finds one not attacked yet
    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      coordKey = `${x}, ${y}`;
    } while (this.previousAttacks.has(coordKey));

    this.previousAttacks.add(coordKey);
    console.log(`Computer attacks: ${x}, ${y}`);
    return opponentGameboard.receiveAttack(x, y);
  }

  // check if player has lost
  hasLost() {
    return this.gameboard.allShipsSunk();
  }

  // place ships on player's gameboard
  placeShip(ship, x, y, orientation) {
    this.gameboard.placeShip(ship, x, y, orientation);
  }

  // computer auto-place ships
  autoPlaceShips(ships) {
    if (this.type !== "computer") return;

    ships.forEach((ship) => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 1000;

      while (!placed && attempts < maxAttempts) {
        attempts++;
        try {
          const x = Math.floor(Math.random() * 10);
          const y = Math.floor(Math.random() * 10);
          const orientation = Math.random() > 0.5 ? "horizontal" : "vertical";
          this.placeShip(ship, x, y, orientation);
          placed = true;
        } catch (error) {
          // if placement fails, try again with new coordinates
          continue;
        }
      }
      if (!placed) {
        throw new Error(
          `Could not place ship of length ${ship.length} after ${maxAttempts} attempts`,
        );
      }
    });
  }
}

module.exports = Player;
