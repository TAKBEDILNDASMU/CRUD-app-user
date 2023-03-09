require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const methodOverride = require("method-override");

const app = express();
const PORT = process.env.PORT || 3500;

mongoose.connect(process.env.DATABASE_URI);

const db = mongoose.connection;
db.on("error", () => console.log("error"));
db.once("open", () => console.log("Connected to database"));

app.use(
  session({
    secret: "mysecret21321",
    saveUninitialized: true,
    resave: false,
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.use("/", express.static(path.join(__dirname, "uploads")));
app.use("/edit", express.static(path.join(__dirname, "uploads")));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use("/", require("./routes/route.js"));

app.listen(PORT, () => console.log(`Server Run on Port ${PORT}`));
