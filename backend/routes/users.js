const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();
const User = require("../models/User");
const catchAsyncError = require("../middleware/catchAsyncError");


//-----update profile----------> api/user/id

router.put(
  "/:id",
  catchAsyncError(async (req, res, next) => {
    let admin = await User.findById({ _id: req.body.id });
    if (req.params.id === req.body.id || admin.isAdmin) {
      const user = await User.findOne({ _id: req.params.id });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
      if (req.body.password) {
        if (req.body.password.length > 5) {
          const salt = await bcrypt.genSalt(10);
          req.body.password = await bcrypt.hash(req.body.password, salt);
        } else {
          return res
            .status(500)
            .send("Password must be grater than 6 character");
        }
      }
      const updateUser = await User.findByIdAndUpdate(
        { _id: req.params.id },
        req.body,
        {},
      );
      res.status(200).json({
        success: true,
        message: "Profile update successfully.",
        updateUser,
      });
    } else {
      res.status(500).send("You can only update your prosile");
    }
  }),
);

//user delete---------->api/user/id
router.delete(
  "/:id",
  catchAsyncError(async (req, res, next) => {
    const admin = await User.findOne({ _id: req.body.id });
    if (req.params.id === req.body.id || admin.isAdmin) {
      const user = await User.findOne({ _id: req.params.id });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      const deleteUser = await User.findByIdAndDelete({ _id: req.params.id });
      res.status(200).json({
        success: true,
        message: "Profile delete successfully.",
        deleteUser,
      });
    } else {
      res.status(500).send("You can only delete your prosile");
    }
  }),
);

//user get--------------api/user/id
router.get(
  "/:id",
  catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  }),
);

// user follow-------------> api/user/:id/follow
router.put(
  "/:id/follow",
  catchAsyncError(async (req, res, next) => {
    if (req.params.id !== req.body.id) {
      const user = await User.findById(req.params.id);
      const currenUser = await User.findById(req.body.id);
      if (!user.followers.includes(req.body.id)) {
        const p = await User.updateOne({ $push: { followers: req.body.id } });
        console.log(p);
        await currenUser.updateOne({ $push: { followings: req.params.id } });

        return res.status(200).json("user has been followed");
      }
      return res.status(403).json("you allready follow this user");
    } else {
      return res.status(403).json("you cant follow yourself");
    }
  }),
);

//user unfollow
router.put(
  "/:id/unfollow",
  catchAsyncError(async (req, res, next) => {
    if (req.params.id !== req.body.id) {
      const user = await User.findById(req.params.id);
      const currenUser = await User.findById(req.body.id);
      if (user.followers.includes(req.body.id)) {
        const p = await User.updateOne({ $pull: { followers: req.body.id } });
        console.log(p);
        await currenUser.updateOne({ $pull: { followings: req.params.id } });

        return res.status(200).json("user has been unfollowed");
      }
      return res.status(403).json("you allready unfollow this user");
    } else {
      return res.status(403).json("you cant unfollow yourself");
    }
  }),
);

module.exports = router;
