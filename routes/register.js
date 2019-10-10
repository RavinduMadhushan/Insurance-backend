const express = require("express");
const router = express.Router();
var connection = require("./config");
const bcrypt = require("bcrypt");
const _ = require("lodash");

router.post("/new", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  // const salt = await bcrypt.genSalt(10);

  let password = req.body.password;
  console.log(req.body);
  let email = req.body.email;
  let upassword = await bcrypt.hash(password, salt);

  let role_id;
  if (req.body.role == "Admin") {
    role_id = 1;
  } else if (req.body.role == " Customer") {
    role_id = 3;
  } else if (req.body.role == "Broker") {
    role_id = 2;
  }
  var users = {
    fullname: req.body.fullname,
    email: req.body.email,
    password: upassword,
    address: req.body.address,
    nic: req.body.nic,
    phone_num: req.body.phone_num,
    isActivated: req.body.isActivated,
    role_id: role_id
  };

  connection.query("SELECT * FROM users WHERE email = ?", [email], function(
    err,
    result
  ) {
    if (result.length > 0) {
      res.send({
        message: "user already regisrerd for this email"
      });
    } else {
      connection.query("INSERT INTO users SET ?", users, function(
        error,
        results
      ) {
        if (error) {
          res.json({
            status: false,
            message: "there are some error with query"
          });
        } else {
          res.send(_.pick(users, ["id", "fullname", "email"]));
          //   console.log(results);
        }
      });
    }
  });
});

module.exports = router;
