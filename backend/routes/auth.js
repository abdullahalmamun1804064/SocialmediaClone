const express = require("express");
const bcrypt = require("bcrypt");
const sendToken = require("../utils/jwtToken")

const router = express.Router();
const User = require("../models/User");
const catchAsyncError = require("../middleware/catchAsyncError");

//-----------register user => /api/auth/register
router.post(
  "/register",
  catchAsyncError(async (req, res) => {
    //Create New User
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    //Create New Password
    if (newUser.password.length > 6) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(req.body.password, salt);
      newUser.password = hashPassword;
    }
    // Save user
    const user = await newUser.save();
    console.log(user);
    res.status(200).json({
      success: true,
      user,
    });
  }),
);

//-----------Login user => /api/auth/login
router.post(
  "/login",
  catchAsyncError(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
 
    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!validPassword) {
      res.status(404).send("Wrong Password");
      return;
    }
  

    sendToken(user, 200, res);
    
  }),
);


//logOut-> /api/v1/logout
router.get(
  "/logout",catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
}));

module.exports = router;
