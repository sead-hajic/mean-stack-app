const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const user = require("../models/user");
const { json } = require("body-parser");

const router = express.Router();

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save().then(result => {
        res.status(201).json({
          message: 'User created',
          result: result
        });
      })
      .catch(err => {
        res.status(500).json({
            message: "Invalid authentication!"
        })
      })
    });
});

router.post("/login", (req, res, next) => {
  let storedUser;
  User.findOne({ email: req.body.email }).then(user => {
    if(!user){
      return res.status(401).json({
        message: 'Authentication failed!'
      });
    }
    storedUser = user;
    return bcrypt.compare(req.body.password, user.password)
  }).then(result => {
      if(!result){
        return res.status(401).json({
          message: 'Authentication failed!'
        });
      }
      const token = jwt.sign(
        {email: storedUser.email, userId: storedUser._id},
        'authentication123_secure_secret',
        {expiresIn: "1h"});
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: storedUser._id
      })
  })
    .catch(err => {
      return res.status(401).json({
        message: 'Invalid credentials!'
      });
    });
});

module.exports = router;
