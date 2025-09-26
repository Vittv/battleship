const Ship = require("../app/ship");

describe("Ship Class", () => {
  test("creates ship with correct length", () => {
    const ship = new Ship(4);
    expect(ship.length).toBe(4);
  });

  test("hit() increases hits", () => {
    const ship = new Ship(3);
    ship.hit();
    expect(ship.hits).toBe(1);
  });

  test("isSunk() works correctly", () => {
    const ship = new Ship(2);
    ship.hit();
    expect(ship.isSunk()).toBe(false);
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });
});
