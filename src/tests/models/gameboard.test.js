const Gameboard = require("../../app/models/gameboard");
const Ship = require("../../app/models/ship");

describe("Gameboard", () => {
  let gameboard;
  let ship;

  beforeEach(() => {
    gameboard = new Gameboard();
    ship = new Ship(3); // create a ship of length 3
  });

  describe("Constructor", () => {
    test("creates 10x10 grid", () => {
      expect(gameboard.size).toBe(10);
      expect(gameboard.grid.length).toBe(10);
      gameboard.grid.forEach((row) => {
        expect(row.length).toBe(10);
      });
    });

    test("initializes empty arrays and map", () => {
      expect(gameboard.ships).toEqual([]);
      expect(gameboard.missedShots).toEqual([]);
      expect(gameboard.hits).toEqual([]);
      expect(gameboard.shipPositions.size).toBe(0);
    });

    test("grid is filled with null values", () => {
      for (let i = 0; i < gameboard.size; i++) {
        for (let j = 0; j < gameboard.size; j++) {
          expect(gameboard.grid[i][j]).toBeNull();
        }
      }
    });
  });

  describe("placeShip()", () => {
    test("places ship horizontally correctly", () => {
      gameboard.placeShip(ship, 2, 3, "horizontal");

      // check if ship is in ships array
      expect(gameboard.ships).toContain(ship);
      expect(gameboard.ships.length).toBe(1);

      // check if positions are recorded in grid
      expect(gameboard.grid[3][2]).toBe(ship);
      expect(gameboard.grid[3][3]).toBe(ship);
      expect(gameboard.grid[3][4]).toBe(ship);
      expect(gameboard.grid[3][5]).toBeNull(); // next position should be empty

      // check if positions are recorded in map
      expect(gameboard.shipPositions.has("2, 3")).toBe(true);
      expect(gameboard.shipPositions.has("3, 3")).toBe(true);
      expect(gameboard.shipPositions.has("4, 3")).toBe(true);
    });

    test("places ship vertically correctly", () => {
      gameboard.placeShip(ship, 2, 3, "vertical");

      expect(gameboard.grid[3][2]).toBe(ship);
      expect(gameboard.grid[4][2]).toBe(ship);
      expect(gameboard.grid[5][2]).toBe(ship);
      expect(gameboard.grid[6][2]).toBeNull(); // next position should be empty
    });

    test("throws error for invalid placement (out of bounds right)", () => {
      expect(() => {
        gameboard.placeShip(ship, 8, 2, "horizontal"); // would go to [10,2] - out of bounds
      }).toThrow("Invalid ship placement");
    });

    test("throws error for invalid placement (out of bounds bottom)", () => {
      expect(() => {
        gameboard.placeShip(ship, 2, 8, "vertical"); // would go to [2,10] - out of bounds
      }).toThrow("Invalid ship placement");
    });

    test("throws error for overlapping ships", () => {
      gameboard.placeShip(ship, 2, 3, "horizontal");

      const anotherShip = new Ship(2);
      expect(() => {
        gameboard.placeShip(anotherShip, 2, 3, "vertical"); // overlaps at [2,3]
      }).toThrow("Invalid ship placement");
    });

    test("allows non-overlapping ship placement", () => {
      gameboard.placeShip(ship, 2, 3, "horizontal");

      const anotherShip = new Ship(2);
      expect(() => {
        gameboard.placeShip(anotherShip, 5, 3, "horizontal"); // different position
      }).not.toThrow();

      expect(gameboard.ships.length).toBe(2);
    });
  });

  describe("receiveAttack()", () => {
    beforeEach(() => {
      gameboard.placeShip(ship, 2, 3, "horizontal");
    });

    test("records hit when attack hits a ship", () => {
      const result = gameboard.receiveAttack(2, 3);

      expect(result).toBe("hit");
      expect(ship.hits).toBe(1);
      expect(gameboard.missedShots).toEqual([]);
    });

    test("records miss when attack misses", () => {
      const result = gameboard.receiveAttack(0, 0);

      expect(result).toBe("miss");
      expect(ship.hits).toBe(0);
      expect(gameboard.missedShots).toEqual([{ x: 0, y: 0 }]);
    });

    test("multiple hits on same ship sink it", () => {
      gameboard.receiveAttack(2, 3); // hit
      expect(ship.hits).toBe(1);
      expect(ship.isSunk()).toBe(false);

      gameboard.receiveAttack(3, 3); // hit
      expect(ship.hits).toBe(2);
      expect(ship.isSunk()).toBe(false);

      gameboard.receiveAttack(4, 3); // hit - should sink
      expect(ship.hits).toBe(3);
      expect(ship.isSunk()).toBe(true);
    });

    test("prevents attacking same spot twice", () => {
      gameboard.receiveAttack(2, 3);

      expect(() => {
        gameboard.receiveAttack(2, 3); // same spot should throw error
      }).toThrow("Already attacked this coordinate");
    });

    test("multiple hits on different spots sink ship", () => {
      gameboard.receiveAttack(2, 3); // hit
      gameboard.receiveAttack(3, 3); // hit - different spot
      gameboard.receiveAttack(4, 3); // hit - different spot

      expect(ship.hits).toBe(3);
      expect(ship.isSunk()).toBe(true);
    });

    test("mixed hits and misses", () => {
      gameboard.receiveAttack(2, 3); // hit
      gameboard.receiveAttack(0, 0); // miss
      gameboard.receiveAttack(3, 3); // hit
      gameboard.receiveAttack(1, 1); // miss

      expect(ship.hits).toBe(2);
      expect(gameboard.missedShots).toEqual([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ]);
    });
  });

  describe("allShipsSunk()", () => {
    test("returns false when no ships are placed", () => {
      expect(gameboard.allShipsSunk()).toBe(false);
    });

    test("returns false when not all ships are sunk", () => {
      gameboard.placeShip(ship, 2, 3, "horizontal");
      expect(gameboard.allShipsSunk()).toBe(false);
    });

    test("returns true when all ships are sunk", () => {
      gameboard.placeShip(ship, 2, 3, "horizontal");

      // sink the ship
      gameboard.receiveAttack(2, 3);
      gameboard.receiveAttack(3, 3);
      gameboard.receiveAttack(4, 3);

      expect(gameboard.allShipsSunk()).toBe(true);
    });

    test("works with multiple ships", () => {
      const ship2 = new Ship(2);
      gameboard.placeShip(ship, 2, 3, "horizontal");
      gameboard.placeShip(ship2, 5, 5, "vertical");

      // sink first ship
      gameboard.receiveAttack(2, 3);
      gameboard.receiveAttack(3, 3);
      gameboard.receiveAttack(4, 3);

      expect(gameboard.allShipsSunk()).toBe(false);

      // sink second ship
      gameboard.receiveAttack(5, 5);
      gameboard.receiveAttack(5, 6);

      expect(gameboard.allShipsSunk()).toBe(true);
    });
  });
});
