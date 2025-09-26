const Player = require("../../app/models/player");
const Ship = require("../../app/models/ship");
const Gameboard = require("../../app/models/gameboard");

describe("Player", () => {
  let humanPlayer;
  let computerPlayer;
  let ship;
  let opponentGameboard;

  beforeEach(() => {
    humanPlayer = new Player("Human", "human");
    computerPlayer = new Player("Computer", "computer");
    ship = new Ship(3);
    opponentGameboard = new Gameboard();

    // place a ship on opponent's board for testing attacks
    opponentGameboard.placeShip(ship, 2, 3, "horizontal");
  });

  describe("Constructor", () => {
    test("creates human player with correct properties", () => {
      expect(humanPlayer.name).toBe("Human");
      expect(humanPlayer.type).toBe("human");
      expect(humanPlayer.gameboard).toBeInstanceOf(Gameboard);
      expect(humanPlayer.previousAttacks).toBeInstanceOf(Set);
      expect(humanPlayer.previousAttacks.size).toBe(0);
    });

    test("creates computer player with correct properties", () => {
      expect(computerPlayer.name).toBe("Computer");
      expect(computerPlayer.type).toBe("computer");
      expect(computerPlayer.gameboard).toBeInstanceOf(Gameboard);
    });

    test("defaults to human type", () => {
      const defaultPlayer = new Player("Test");
      expect(defaultPlayer.type).toBe("human");
    });
  });

  describe("placeShip()", () => {
    test("places ship on player's gameboard", () => {
      humanPlayer.placeShip(ship, 0, 0, "horizontal");

      expect(humanPlayer.gameboard.ships).toContain(ship);
      expect(humanPlayer.gameboard.grid[0][0]).toBe(ship);
    });
  });

  describe("hasLost()", () => {
    test("returns false when ships are not sunk", () => {
      humanPlayer.placeShip(ship, 0, 0, "horizontal");
      expect(humanPlayer.hasLost()).toBe(false);
    });

    test("returns true when all ships are sunk", () => {
      humanPlayer.placeShip(ship, 0, 0, "horizontal");

      // sink the ship
      humanPlayer.gameboard.receiveAttack(0, 0);
      humanPlayer.gameboard.receiveAttack(1, 0);
      humanPlayer.gameboard.receiveAttack(2, 0);

      expect(humanPlayer.hasLost()).toBe(true);
    });

    test("returns false when no ships are placed", () => {
      expect(humanPlayer.hasLost()).toBe(false);
    });
  });

  describe("Human Player attack()", () => {
    test("successfully attacks opponent gameboard", () => {
      const result = humanPlayer.attack(opponentGameboard, 2, 3);

      expect(result).toBe("hit");
      expect(ship.hits).toBe(1);
      expect(humanPlayer.previousAttacks.has("2, 3")).toBe(true);
    });

    test("records missed attacks", () => {
      const result = humanPlayer.attack(opponentGameboard, 0, 0);

      expect(result).toBe("miss");
      expect(opponentGameboard.missedShots).toContainEqual({ x: 0, y: 0 });
      expect(humanPlayer.previousAttacks.has("0, 0")).toBe(true);
    });

    test("prevents attacking same coordinate twice", () => {
      humanPlayer.attack(opponentGameboard, 2, 3);

      expect(() => {
        humanPlayer.attack(opponentGameboard, 2, 3);
      }).toThrow("You already attacked this coordinate");
    });

    test("tracks previous attacks correctly", () => {
      humanPlayer.attack(opponentGameboard, 2, 3);
      humanPlayer.attack(opponentGameboard, 0, 0);
      humanPlayer.attack(opponentGameboard, 5, 5);

      expect(humanPlayer.previousAttacks.size).toBe(3);
      expect(humanPlayer.previousAttacks.has("2, 3")).toBe(true);
      expect(humanPlayer.previousAttacks.has("0, 0")).toBe(true);
      expect(humanPlayer.previousAttacks.has("5, 5")).toBe(true);
    });
  });

  describe("Computer Player attack()", () => {
    test("computer generates valid attacks", () => {
      const result = computerPlayer.attack(opponentGameboard);

      // should return either 'hit' or 'miss'
      expect(["hit", "miss"]).toContain(result);
      expect(computerPlayer.previousAttacks.size).toBe(1);
    });

    test("computer does not attack same spot in multiple attacks", () => {
      // make several computer attacks
      const attacks = new Set();

      for (let i = 0; i < 5; i++) {
        computerPlayer.attack(opponentGameboard);
      }

      // should have 5 unique attacks recorded
      expect(computerPlayer.previousAttacks.size).toBe(5);

      // convert Set to array to check for duplicates
      const attackArray = Array.from(computerPlayer.previousAttacks);
      const uniqueAttacks = new Set(attackArray);
      expect(uniqueAttacks.size).toBe(5); // no duplicates
    });

    test("computer tracks its attacks", () => {
      computerPlayer.attack(opponentGameboard);
      computerPlayer.attack(opponentGameboard);

      expect(computerPlayer.previousAttacks.size).toBe(2);
    });
  });

  describe("autoPlaceShips()", () => {
    test("does nothing for human players", () => {
      const ships = [new Ship(2)]; // use small ship
      humanPlayer.autoPlaceShips(ships);

      expect(humanPlayer.gameboard.ships.length).toBe(0);
    });

    test("places ships for computer players without errors", () => {
      const ships = [new Ship(2)]; // use small ship for reliability
      expect(() => {
        computerPlayer.autoPlaceShips(ships);
      }).not.toThrow();
    });

    test("computer can place multiple small ships", () => {
      const ships = [new Ship(2), new Ship(2)]; // small ships only
      computerPlayer.autoPlaceShips(ships);

      expect(computerPlayer.gameboard.ships.length).toBe(2);
    });

    test("placed ships are valid and not overlapping", () => {
      const ships = [new Ship(2)];
      computerPlayer.autoPlaceShips(ships);

      const placedShip = computerPlayer.gameboard.ships[0];
      expect(placedShip).toBeInstanceOf(Ship);

      // check that ship occupies correct number of cells
      let shipCellCount = 0;
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          if (computerPlayer.gameboard.grid[row][col] === placedShip) {
            shipCellCount++;
          }
        }
      }
      expect(shipCellCount).toBe(2); // ship length should match occupied cells
    });
  });

  // add a simple integration test
  describe("Game flow integration", () => {
    test("players can play against each other", () => {
      // set up human player with a ship
      const humanShip = new Ship(2);
      humanPlayer.placeShip(humanShip, 0, 0, "horizontal");

      // human attacks computer
      const humanAttackResult = humanPlayer.attack(opponentGameboard, 2, 3);
      expect(["hit", "miss"]).toContain(humanAttackResult);

      // computer attacks human
      const computerAttackResult = computerPlayer.attack(humanPlayer.gameboard);
      expect(["hit", "miss"]).toContain(computerAttackResult);

      // both should track their attacks
      expect(humanPlayer.previousAttacks.size).toBe(1);
      expect(computerPlayer.previousAttacks.size).toBe(1);
    });
  });
});
