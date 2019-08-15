const express = require("express");
const router = express.Router();
var connection = require("./config");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

router.post("/user", async (req, res) => {
  console.log(req.body);
  const { error } = validate(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const email = req.body.email;
  const password = req.body.password;
  let user;

  const salt = await bcrypt.genSalt(10);
  let upassword = await bcrypt.hash(password, salt);

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async function(err, result) {
      user = result[0];
      // console.log(user.password, upassword);
      if (!user) {
        return res.status(400).send("Invalid Email or Password");
      } else {
        bcrypt.compare(password, user.password, function(err, response) {
          // console.log(response);
          if (response == true) {
            const token = jwt.sign(
              {
                id: user.id,
                fullname: user.fullname,
                email: user.email
              },
              "insurance",
              { expiresIn: 60 * 60 * 24 }
            );

            // console.log(token);
            res.send({ token: token });
          } else {
            return res.status(400).send("Invalidpassword.");
          }
        });
      }
    }
  );

  // console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxx");
  // const validPassword = await bcrypt.compare(password, user.password);
  //   console.log(validPassword);
});

function validate(req) {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(555)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(1000)
      .required()
  };

  return Joi.validate(req, schema);
}
module.exports = router;
