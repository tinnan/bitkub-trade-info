/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
const { getWallet, getTradeHistory } = require("./services/bitkub");

/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";

/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

/**
 * Routes Definitions
 */
app.get("/", async (req, res) => {
  const walletData = await getWallet();
  res.render("index", { title: "Wallets", data: walletData });
});
app.get("/trade/history/:sym", async (req, res) => {
  const sym = req.params.sym;
  const hist = await getTradeHistory({ sym });
  res.render("trade_history", { title: "Trade history", data: hist });
});

/**
 * Server Activation
 */
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
