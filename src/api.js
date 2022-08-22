
const express = require("express");
const serverless = require("serverless-http");

const router = express.Router();
const cors = require("cors"); 
const app = express();
app.set("port", process.env.PORT ||Math.ceil(Math.random()*9999)); 
app.use(express.json());
app.use(cors());


const userRoute = require("../routes/userRoute");


app.listen(app.get("port"), () => {
  console.log(`Listening for calls on port ${app.get("port")}`);
  console.log("Press Ctrl+C to exit server");
});

router.get("/", (req, res) => {
  res.json({
   msg:`welcome to the Terra Scientia`
  });
});

app.use(`/.netlify/functions/api`, router);

router.use("/users", userRoute);

module.exports = app;
module.exports.handler = serverless(app);