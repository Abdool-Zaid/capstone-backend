const express = require("express");
const router = express.Router();
const con = require("../lib/db_connection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/newPost", (req, res) => {
  try {
    let sql = "INSERT INTO user_post SET ?";
    const {
      userId,
      senderId,
      message,
      createdAt,
    } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(message, salt);
    
    let user_post = {
      userId,
      senderId,
      message: hash,
      createdAt,
    };
    con.query(sql, user_post, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.json({msg:`user_post ${(user_post.message)} created successfully`});
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", (req, res) => {
  try {
    let sql = "SELECT * FROM user_post WHERE ?";
    let user_post = {
      id: req.body.id,
    };
    con.query(sql, user_post, async (err, result) => {
      if (err) throw err;
      if (result.length === 0) {
        res.status(400).json({
          status: "error",
          error: "id not found ",
        });
      } else {
        const isMatch = await bcrypt.compare(
          req.body.message,
          result[0].message
          );
          if (!isMatch) {
            res.status(400).json({
              status: "error",
              error: "message incorrect",
            });
          } else {
            const payload = {
              user_post: {
                id: result[0].id,
                userId: result[0].userId,
                senderId: result[0].senderId,
                message: result[0].message,
                createdAt: result[0].createdAt,
              },
            };
            jwt.sign(
              payload,
              process.env.jwtSecret,
              {
                expiresIn: "365d",
              },
              (err, token) => {
                if (err) throw err;
                res.json({ token });
              }
              );
            }
          }
        });
      } catch (error) {
        console.log(error);
      }
    });
    
    router.get("/user_post/verify", (req, res) => {
      const token = req.header("x-auth-token");
      jwt.verify(token, process.env.jwtSecret, (error, decodedToken) => {
        if (error) {
          res.status(401).json({
            msg: "no message selected!",
          });
        } else {
          res.status(200);
          res.send(decodedToken);
        }
      });
    });
    const middleware = require("../middleware/auth");
    const { application } = require("express");
    
    router.get("/", middleware, (req, res) => {
      try {
        let sql = "SELECT * FROM user_post";
        con.query(sql, (err, result) => {
          if (err) throw err;
          res.send(result);
        });
      } catch (error) {
        console.log(error);
      }
    });
    
    router.get("/:id", middleware, (req, res) => {
      try {
        con.query(
          `SELECT * FROM user_post WHERE id = ${req.params.id}`,
          (err, result) => {
            if (err) throw err;
            res.send(result);
          }
          );
        } catch (error) {
          console.log(error);
          res.status(400).send(error);
        }
      });
      
      router.put("/:id", middleware,(req, res) => {
        try {
          const {
            userId,
            senderId,
            message,
            createdAt,
          } = req.body;
          
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(message, salt);
          con.query(
            `UPDATE user_post set userId="${userId}",message="${hash}",senderId="${senderId}",createdAt="${createdAt}"WHERE id = "${req.params.id}"`,
            (err, result) => {
              if (err) throw err;
              res.send(result);
            }
            );
          } catch (error) {
            console.log(error);
            res.status(400).send(error);
          }
        });
        router.delete("/:id", (req, res) => {
          try {
            con.query(
              `DELETE FROM user_post WHERE id = "${req.params.id}" `,
        (err, result) => {
          if (err) throw err;
          res.send(result);
        }
        );
      } catch (error) {
        console.log(error);
        res.status(400).send(error);
      }
    });
    // id	userId	senderId	message	createdAt
module.exports = router;