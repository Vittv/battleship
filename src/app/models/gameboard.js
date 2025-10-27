const Ship = require("./ship");
const { getShipCoordinates, isValidPlacement } = require("../utils/helpers");

class Gameboard {
  constructor() {
    this.size = 10;
    this.ships = [];
    this.missedShots = [];
    this.hits = [];
    this.grid = this.createGrid();
    this.shipPositions = new Map();
    this.allAttacks = new Set();
  }

  createGrid() {
    const grid = [];
    for (let i = 0; i < this.size; i++) {
      grid[i] = new Array(this.size).fill(null);
    }
    return grid;
  }

  placeShip(ship, x, y, orientation) {
    // validate if ship can be placed here
    if (
      !isValidPlacement(this.grid, this.size, ship.length, x, y, orientation)
    ) {
      throw new Error("Invalid ship placement");
    }

    // calculate all coordinates the ship will occupy
    const coordinates = getShipCoordinates(ship.length, x, y, orientation);

    // place ship on the grid and record positions
    coordinates.forEach((coord) => {
      const { x, y } = coord;
      this.grid[y][x] = ship;
      this.shipPositions.set(`${x}, ${y}`, ship); // add to map
    });

    // add ship to ships array
    this.ships.push(ship);
  }

  receiveAttack(x, y) {
    const coordKey = `${x}, ${y}`;

    // duplicate check
    if (this.allAttacks.has(coordKey)) {
      throw new Error("Already attacked this coordinate");
    }
    // record the attack
    this.allAttacks.add(coordKey);

    // check if these coordinates hit any ship
    if (this.shipPositions.has(`${x}, ${y}`)) {
      // find which ship and hit it
      const ship = this.shipPositions.get(`${x}, ${y}`);
      ship.hit();
      return "hit";
    } else {
      // record missed shot
      this.missedShots.push({ x, y });
      return "miss";
    }
  }

  allShipsSunk() {
    return this.ships.length > 0 && this.ships.every((ship) => ship.isSunk());
  }

  getSunkShipsCount() {
    return this.ships.filter((ship) => ship.isSunk()).length;
  }
}

module.exports = Gameboard;
