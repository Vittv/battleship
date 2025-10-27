class Ship {
  constructor(length) {
    this.length = length;
    this.hits = 0;
  }

  hit() {
    if (!this.isSunk()) {
      this.hits++;
    }
    return this;
  }

  isSunk() {
    return this.hits === this.length;
  }
}

module.exports = Ship;
