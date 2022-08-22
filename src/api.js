const express = require("express");
const serverless = require("serverless-http");

const router = express.Router();
const cors = require("cors"); // Used to prevent errors when working locally
const app = express(); // Initialize express as an app variable
app.set("port", process.env.PORT ||Math.ceil(Math.random()*9999)); //   the port
app.use(express.json()); // Enable the server to handle JSON requests
app.use(cors()); // Dont let local development give errors
var bodyParser = require("body-parser");


const userRoute = require("../routes/userRoute");
const productsRoute = require("../routes/productsRoute");
const orderRoute = require("../routes/orderRoute");
const staffRoute = require("../routes/staffRoute");


app.listen(app.get("port"), () => {
  console.log(`Listening for calls on port ${app.get("port")}`);
  console.log("Press Ctrl+C to exit server");
});

router.get("/", (req, res) => {
  res.json({
   msg:`Natherah's mustache is mad cute`
  });
});

app.use(`/.netlify/functions/api`, router);

router.use("/users", userRoute);
router.use("/products", productsRoute);
router.use("/orders", orderRoute);
router.use("/staff", staffRoute);

module.exports = app;
module.exports.handler = serverless(app);