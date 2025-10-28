require("./styles/main.css");
const GameController = require("./app/gameController.js");

document.addEventListener("DOMContentLoaded", () => {
  const gameController = new GameController();
  gameController.init();
});
