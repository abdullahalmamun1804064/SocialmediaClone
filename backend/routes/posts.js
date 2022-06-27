const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();
const Post = require("../models/Posts");
const User = require("../models/User")
const catchAsyncError = require("../middleware/catchAsyncError");
const { findById } = require("../models/Posts");

//create a post
router.post(
  "/",
  catchAsyncError(async (req, res) => {
    const createNewPost = new Post(req.body);
    console.log(createNewPost);
    const post = await createNewPost.save();
    res.status(200).json({
      success: true,
      post
    });
  }),
);

//update a post
router.put('/:id', catchAsyncError(async (req, res) => {0
  const post = await Post.findOne({_id:req.params.id});
  if (post.userId === req.body.userId) {
    const updatePost = await Post.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      {},
    );
     res.status(200).json({
      success: true,
      updatePost
    }); 
  }
  else {
    res.status(200).send("You can only Update only Your Post");
  }
  
}));
//delete a post
router.delete('/:id', catchAsyncError(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id });
 if (!post) {
   return res.status(404).json({
     success: false,
     message: "Post not found.",
   });
  }
  if (post.userId === req.body.userId) {
     const deletePost = await Post.findByIdAndDelete({ _id: req.params.id });
     res.status(200).json({
       success: true, 
       message: "Post delete successfully.",
       deletePost,
     });

  } else {
      res.status(200).send("You can only Delete only Your Post");
    }
}));

//like/dislike a post
router.put('/:id/like', catchAsyncError(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post.likes.includes(req.body.userId)) {
    await post.updateOne({ $push: { likes: req.body.userId } });
  
    res.status(200).json({
      success: true,
      message:"You succesfully liked",
    })
  
  }
  else {
    await post.updateOne({ $pull: { likes: req.body.userId } });
    res.status(200).json({
      success: true,
      message: "You succesfully disliked",
    });
  }
  
}));
//get a post
router.get('/:id', catchAsyncError(async (req, res) => {
  const post = await Post.findById(req.params.id);

  res.status(200).json({
    success: true,
    post
  })

}));
//get all post in timeline
router.get('/timeline/all', catchAsyncError(async (req, res) => {
  const currentUser = await User.findById(req.body.userId);
  const userPosts = await Post.find({ userId: currentUser._id });
  const friendPost = await Promise.all(
    currentUser.followings.map((friendId)=> {
      return Post.find({ userId: friendId });
    })
  )
  const timelinePost = userPosts.concat(...friendPost);
   res.status(200).json({
     success: true,
     timelinePost
   });
}));

module.exports = router