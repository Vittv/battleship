require("./styles/main.css");
const { init } = require("./app/app.js");

document.addEventListener("DOMContentLoaded", async () => {
  init(document.getElementById("content"));
});
