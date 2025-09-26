const getShipCoordinates = (shipLength, startX, startY, orientation) => {
  const coordinates = [];

  for (let i = 0; i < shipLength; i++) {
    if (orientation === "horizontal") {
      coordinates.push({ x: startX + i, y: startY });
    } else {
      // vertical
      coordinates.push({ x: startX, y: startY + i });
    }
  }

  return coordinates;
};

const isValidPlacement = (
  grid,
  gridSize,
  shipLength,
  startX,
  startY,
  orientation,
) => {
  const coordinates = getShipCoordinates(
    shipLength,
    startX,
    startY,
    orientation,
  );

  for (const coord of coordinates) {
    if (
      coord.x < 0 ||
      coord.x >= gridSize ||
      coord.y < 0 ||
      coord.y >= gridSize
    ) {
      return false;
    }

    if (grid[coord.y][coord.x] !== null) {
      return false;
    }
  }

  return true;
};

module.exports = { getShipCoordinates, isValidPlacement };
