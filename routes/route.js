const express = require("express");
const router = express.Router();
const User = require("../models/user.model.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + "_" + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// route to get all user data
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.render("index", { users: users });
  } catch (err) {
    res.json({ message: err.message });
  }
});

// route to render add.ejs
router.get("/add", (req, res) => {
  res.render("add_user");
});

// route to render edit_user.ejs by passing an id to the request.param
router.get("/edit/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("edit_user", { user: user });
  } catch (error) {
    res.json({ message: error.message });
  }
});

// route to posting a new user data to database
router.post("/add", upload.single("image"), async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  });
  try {
    const result = await user.save();
    req.session.message = {
      type: "success",
      message: "User added succesfully!",
    };
    res.redirect("/");
  } catch (err) {
    console.log(err.message);
  }
});

// router to edit an existing user data
router.put("/edit/:id", upload.single("image"), async (req, res) => {
  const user = await User.findById(req.params.id);
  let newImage = "";
  // this for deleting the image in the uploads file if the client send a new image
  if (req.file) {
    newImage = req.file.filename;
    try {
      fs.unlinkSync(path.join(__dirname, "..", "uploads", req.body.oldImage));
    } catch (err) {
      console.log(err);
    }
  } else {
    // if the client isn't send a new image, then use the existing image
    newImage = req.body.oldImage;
  }

  try {
    user.name = req.body.name;
    user.email = req.body.email;
    user.phone = req.body.phone;
    user.image = newImage;
    req.session.message = {
      type: "success",
      message: "User edited succesfully!",
    };
    await user.save();
    res.redirect("/");
  } catch (error) {
    res.json({ message: error.message });
  }
});

// route to delete a user data
router.delete("/:id", async (req, res) => {
  try {
    // not just delete the user from db but also delete the picture that saved in uploads file
    const user = await User.findByIdAndDelete(req.params.id);
    fs.unlinkSync(path.join(__dirname, "..", "uploads", user.image));
    req.session.message = {
      type: "danger",
      message: "User Deleted succesfully!",
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message });
  }
});

module.exports = router;
