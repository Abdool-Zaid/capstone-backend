
const express = require("express");
const serverless = require("serverless-http");

const router = express.Router();
const cors = require("cors"); 
const app = express();
app.set("port", process.env.PORT ||6969); 
app.use(express.json());
app.use(cors());


const userRoute = require("../routes/userRoute");
const userPostRoute = require("../routes/userPostRoute");
const userMessageRoute = require("../routes/userMessageRoute");
const userFriendRoute = require("../routes/userFriendRoute");
const groupRoute = require("../routes/groupRoute");
const groupPostRoute = require("../routes/groupPostRoute");
// const groupMetaRoute = require("../routes/groupMetaRoute");
const groupMessageRoute = require("../routes/userMessageRoute");
const groupMemberRoute = require("../routes/groupMemberRoute");

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
router.use("/userPost", userPostRoute);
router.use("/userMessage", userMessageRoute);
router.use("/userFriend", userFriendRoute);
router.use("/group", groupRoute);
router.use("/groupPost", groupPostRoute);
// router.use("/groupMeta", groupMetaRoute);
router.use("/groupMessage", groupMessageRoute);
router.use("/groupMember", groupMemberRoute);

module.exports = app;
module.exports.handler = serverless(app);