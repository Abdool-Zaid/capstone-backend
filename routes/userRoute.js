const express = require("express");
const router = express.Router();
const con = require("../lib/db_connection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

router.post("/register", (req, res) => {
  try {
    let sql = "INSERT INTO users SET ?";
    const {
      full_name,
      email,
      password,
      user_type,
      phone,
      billing_address,
    } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    let user = {
      full_name,
      email,
      password: hash,
      user_type,
      phone,
      billing_address,
    };
    con.query(sql, user, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.json({msg:`User ${(user.email)} created successfully`});
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", (req, res) => {
  try {
    let sql = "SELECT * FROM users WHERE ?";
    let user = {
      email: req.body.email,
    };
    con.query(sql, user, async (err, result) => {
      if (err) throw err;
      if (result.length === 0) {
        // res.send("");
        res.status(400).json({
          status: "error",
          error: "Email not found please register",
        });
      } else {
        const isMatch = await bcrypt.compare(
          req.body.password,
          result[0].password
        );
        if (!isMatch) {
          res.status(400).json({
            status: "error",
            error: "password incorrect",
          });
        } else {
          const payload = {
            user: {
              user_id: result[0].user_id,
              full_name: result[0].full_name,
              email: result[0].email,
              user_type: result[0].user_type,
              phone: result[0].phone,
              billing_address: result[0].billing_address,
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

router.get("/users/verify", (req, res) => {
  const token = req.header("x-auth-token");
  jwt.verify(token, process.env.jwtSecret, (error, decodedToken) => {
    if (error) {
      res.status(401).json({
        msg: "Unauthorized Access!",
      });
    } else {
      res.status(200);
      res.send(decodedToken);
    }
  });
});
router.get("/", (req, res) => {
  try {
    con.query("SELECT * FROM user", (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

const middleware = require("../middleware/auth");
const { application } = require("express");

router.get("/", middleware, (req, res) => {
  try {
    let sql = "SELECT * FROM users";
    con.query(sql, (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", (req, res) => {
  try {
    con.query(
      `SELECT * FROM users WHERE user_id = ${req.params.id}`,
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
router.post("/", (req, res) => {
  const { email, password, full_name, billing_address, phone, user_type } =
    req.body;
  try {
    con.query(
      `INSERT INTO users (email,password,full_name,billing_address,phone,user_type) VALUES ("${email}","${password}","${full_name}","${billing_address}","${phone}","${user_type}")`,
      (err, result) => {
        if (err) throw err;
        res.json(`User registered ${full_name}`);
      }
    );
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});


router.put("/:id", (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      billing_address,
      country,
      phone,
      user_type,
    } = req.body;

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    con.query(
      `UPDATE users set email="${email}",password="${hash}",full_name="${full_name}",billing_address="${billing_address}",country="${country}",phone="${phone}",user_type="${user_type}" WHERE user_id = "${req.params.id}"`,
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
      `DELETE FROM users WHERE user_id = "${req.params.id}" `,
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
    let sql = "SELECT * FROM users WHERE ?";
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

        var mailData = {
          from: process.env.MAILERUSER,
          to: result[0].email,

          subject: "Password Reset",
          html: `<div>
          <h3>Hi ${result[0].full_name},</h3>
          <br>
          <marquee behavior="scroll" direction="right">
          
          <h4>Click link below to reset your password</h4>
          </marquee>
          <iframe src="https://iss-sim.spacex.com/" frameborder="0"></iframe>
          
      
          <a href="https://user-images.githubusercontent.com/4998145/52377595-605e4400-2a33-11e9-80f1-c9f61b163c6a.png">
            Click Here to Reset Password
            user_id = ${result[0].user_id}
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
            res.status("Please Check your email", result[0].user_id);
          }
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;