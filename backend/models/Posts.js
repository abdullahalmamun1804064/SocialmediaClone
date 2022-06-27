const mongoose = require('mongoose');
const PostSchema = mongoose.Schema({
  userId: {
    type: String,
    require: true,
  },
  desc: {
    type: String,
    maxlength: 500,
  },
  img: {
    type: String,
  },
  likes: {
    type: Array,
    default:[],
  },
},
{ timestamps: true }
);
module.exports = mongoose.model("Posts", PostSchema);


