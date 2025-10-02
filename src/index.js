require("./styles/main.css");
const App = require("./app/app");

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App();
  app.init();
});
