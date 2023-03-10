const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
//1rcEMSQtLdBTesKq

const postsRoutes = require("./routes/routes");
const userRoutes = require("./routes/user");

const app = express();

mongoose.connect("mongodb+srv://sead:1rcEMSQtLdBTesKq@cluster0.l0rtmep.mongodb.net/node-angular?retryWrites=true&w=majority")
    .then(() => {
      console.log('Connected to database!');
    })
    .catch(() => {
      console.log('Cennection failed!');
    })

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers",
        "Origin, X-Requested-Width, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods",
        "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);


module.exports = app;
