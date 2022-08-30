const express = require("express");
const router = express.Router();
const con = require("../lib/db_connection");

router.post("/newPost", (req, res) => {
  try {
    let sql = "INSERT INTO user_post SET ?";
    const {
      userId,
      message,
   
    } = req.body;
    let user_post = {
      userId,
      message,
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

router.get("/",  (req, res) => {
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
            message,
          } = req.body;
          
          con.query(
            `UPDATE user_post set userId="${userId}",message="${message}" WHERE id = "${req.params.id}"`,
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
    // id	userId message	
module.exports = router;