const express = require("express");
const router = express.Router();
const con = require("../lib/db_connection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const middleware = require("../middleware/auth");
const { application } = require("express");

router.post("/register", (req, res) => {
  try {
    let sql = "INSERT INTO user SET ?";
    const {
      username,
      email,
      passwordHash,
      intro,
      profile,
      
    } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(passwordHash, salt);
    
    let user = {
      username,
      email,
      passwordHash: hash,
      intro,
      profile,
    };
    con.query(sql, user, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.json({msg:`User ${(user.username)} created successfully`});
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", (req, res) => {
  try {
    let sql = "SELECT * FROM user WHERE ?";
    let user = {
      email: req.body.email,
    };
    con.query(sql, user, async (err, result) => {
      if (err) throw err;
      if (result.length === 0) {
        res.status(400).json({
          status: "error",
          error: "Email not found please register",
        });
      } else {
        const isMatch = await bcrypt.compare(
          req.body.passwordHash,
          result[0].passwordHash
          );
          if (!isMatch) {
            res.status(400).json({
              status: "error",
              error: "password incorrect",
            });
          } else {
            const payload = {
              user: {
                id: result[0].id,
                username: result[0].username,
                email: result[0].email,
                intro: result[0].intro,
                profile: result[0].profile,
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

  router.get("/user/verify", (req, res) => {
    const token = req.header("x-auth-token");
    jwt.verify(token, process.env.jwtSecret, (error, decodedToken) => {
      if (error) {
        res.status(401).json({
          msg: "Unauthorized Access!",
        });
      } else {
        res.status(200);
        res.json({decodedToken});
      }
    });
  });
  
  router.get("/", middleware, (req, res) => {
    try {
      let sql = "SELECT * FROM user";
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
        `SELECT * FROM user WHERE id = ${req.params.id}`,
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
      email,
      passwordHash,
      username,
      intro,
      profile,
    } = req.body;
    
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(passwordHash, salt);
    con.query(
      `UPDATE user set email="${email}",passwordHash="${hash}",username="${username}",intro="${intro}",profile="${profile}" WHERE id = "${req.params.id}"`,
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
        `DELETE FROM user WHERE id = "${req.params.id}" `,
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
    
    router.post("/forgot-psw", (req, res) => {
      try {
    let sql = "SELECT * FROM user WHERE ?";
    let user = {
      email: req.body.email,
    };
    con.query(sql, user, (err, result) => {
      if (err) {
        throw err;
      }
      if (result === 0) {
        res.status(400), res.send("Email not found");
      } else {
        const transporter = nodemailer.createTransport({
          host: process.env.MAILERHOST,
          port: process.env.MAILERPORT,
          auth: {
            user: process.env.MAILERUSER,
            pass: process.env.MAILERPASS,
          },
        });
        
        // id	username	email	passwordHash	intro	profile
        var mailData = {
          from: process.env.MAILERUSER,
          to: result[0].email,
          
          subject: "Password Reset",
          html: `<div>
          <h3>Hi ${result[0].username},</h3>
          <br>
          <marquee behavior="scroll" direction="right">
          
          <h4>Click link below to reset your password</h4>
          </marquee>
          <iframe src="https://iss-sim.spacex.com/" frameborder="0"></iframe>
          
          
          <a href="https://user-images.githubusercontent.com/4998145/52377595-605e4400-2a33-11e9-80f1-c9f61b163c6a.png">
          Click Here to Reset Password
          </a>
          <br>
          <p>For any queries feel free to contact us...</p>
          <div>
          Email: ${process.env.MAILERUSER}
          <br>
          <div>
          </div>`,
        };

        transporter.verify((error, success) => {
          if (error) {
            console.log(error);
          } else {
            console.log("Email valid! ", success);
          }
        });
        
        transporter.sendMail(mailData, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            res.status("Please Check your email", result[0].email);
          }
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;