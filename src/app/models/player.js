const Gameboard = require("./gameboard");

class Player {
  constructor(name, type = "human") {
    this.name = name;
    this.type = type;
    this.gameboard = new Gameboard();
    this.previousAttacks = new Set(); // track all attacks

    // AI state variables
    if (this.type === "computer") {
      this.mode = "HUNT"; // "HUNT" or "DESTROY"
      this.lastHit = null;
      this.potentialTargets = [];
      this.shipOrientation = null; // "horizontal", "vertical", or null
    }
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
      // computer uses AI algorithm
      return this.computerAttack(opponentGameboard);
    }
  }

  // computer AI for generating attacks
  computerAttack(opponentGameboard) {
    let x, y, coordKey;

    if (this.mode === "HUNT") {
      // Hunt mode: search for ships efficiently
      ({ x, y } = this.huntModeAttack());
    } else {
      // Destroy mode: target around a hit ship
      ({ x, y } = this.destroyModeAttack());
    }

    coordKey = `${x}, ${y}`;

    // safety check - should not happen with proper AI logic
    if (this.previousAttacks.has(coordKey)) {
      // fallback to random if there's an issue
      return this.fallbackRandomAttack(opponentGameboard);
    }

    this.previousAttacks.add(coordKey);
    console.log(`Computer attacks: ${x}, ${y}`);

    const result = opponentGameboard.receiveAttack(x, y);

    // update AI state based on attack result
    this.updateAIState(x, y, result);

    return result;
  }

  huntModeAttack() {
    let x,
      y,
      attempts = 0;

    // use checkerboard pattern for efficient hunting
    do {
      attempts++;
      if (attempts > 100) {
        // fallback: find any unattacked coordinate
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            if (!this.previousAttacks.has(`${i}, ${j}`)) {
              return { x: i, y: j };
            }
          }
        }
      }

      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);

      // checkerboard pattern - only target certain squares
      if ((x + y) % 2 === 0) {
        continue; // skip non-preferred squares in hunt mode
      }
    } while (this.previousAttacks.has(`${x}, ${y}`) && attempts < 200);

    return { x, y };
  }

  destroyModeAttack() {
    // if we have potential targets, use them
    if (this.potentialTargets.length > 0) {
      const target = this.potentialTargets.shift();
      if (!this.previousAttacks.has(`${target.x}, ${target.y}`)) {
        return target;
      }
    }

    // generate new potential targets around the last hit
    this.generatePotentialTargets();

    if (this.potentialTargets.length > 0) {
      const target = this.potentialTargets.shift();
      return target;
    }

    // fallback to hunt mode if no valid targets
    this.mode = "HUNT";
    this.lastHit = null;
    this.shipOrientation = null;
    return this.huntModeAttack();
  }

  generatePotentialTargets() {
    if (!this.lastHit) return;

    const [lastX, lastY] = this.lastHit;
    const directions = [
      [0, 1], // right
      [1, 0], // down
      [0, -1], // left
      [-1, 0], // up
    ];

    // clear existing targets
    this.potentialTargets = [];

    // if we know ship orientation, only check in that axis
    if (this.shipOrientation === "horizontal") {
      // check left and right
      const left = { x: lastX - 1, y: lastY };
      const right = { x: lastX + 1, y: lastY };
      if (this.isValidCoordinate(left.x, left.y))
        this.potentialTargets.push(left);
      if (this.isValidCoordinate(right.x, right.y))
        this.potentialTargets.push(right);
    } else if (this.shipOrientation === "vertical") {
      // check up and down
      const up = { x: lastX, y: lastY - 1 };
      const down = { x: lastX, y: lastY + 1 };
      if (this.isValidCoordinate(up.x, up.y)) this.potentialTargets.push(up);
      if (this.isValidCoordinate(down.x, down.y))
        this.potentialTargets.push(down);
    } else {
      // unknown orientation, check all directions
      directions.forEach(([dx, dy]) => {
        const newX = lastX + dx;
        const newY = lastY + dy;

        if (this.isValidCoordinate(newX, newY)) {
          this.potentialTargets.push({ x: newX, y: newY });
        }
      });
    }

    // filter out already attacked positions
    this.potentialTargets = this.potentialTargets.filter(
      (target) => !this.previousAttacks.has(`${target.x}, ${target.y}`),
    );

    // shuffle to add some randomness
    this.shuffleArray(this.potentialTargets);
  }

  updateAIState(x, y, result) {
    if (result === "hit") {
      this.mode = "DESTROY";

      if (!this.lastHit) {
        // first hit on a ship
        this.lastHit = [x, y];
        this.shipOrientation = null;
      } else {
        // subsequent hit - determine ship orientation
        const [lastX, lastY] = this.lastHit;
        if (x === lastX) {
          this.shipOrientation = "vertical";
        } else if (y === lastY) {
          this.shipOrientation = "horizontal";
        }

        // update last hit to continue pursuing
        this.lastHit = [x, y];
      }

      // regenerate potential targets with new information
      this.potentialTargets = [];
      this.generatePotentialTargets();
    } else if (result === "sunk") {
      // ship sunk - return to hunt mode
      this.mode = "HUNT";
      this.lastHit = null;
      this.shipOrientation = null;
      this.potentialTargets = [];
    }
    // if miss, maintain current state in destroy mode
  }

  isValidCoordinate(x, y) {
    return x >= 0 && x < 10 && y >= 0 && y < 10;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  fallbackRandomAttack(opponentGameboard) {
    // fallback method if AI logic fails
    let x, y, coordKey;
    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      coordKey = `${x}, ${y}`;
    } while (this.previousAttacks.has(coordKey));

    this.previousAttacks.add(coordKey);
    console.log(`Computer fallback attack: ${x}, ${y}`);
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
