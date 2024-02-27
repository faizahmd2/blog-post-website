const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: String,
  detail: String,
  image: String,
  shortDescription: String,
  publicPost: {
    type: Boolean,
    default: false
  },
  imageType: String,
  created: Date,
  modified: {
    type: Date,
    default: Date.now
  },
});

const Post = mongoose.model('posts', PostSchema);

module.exports = Post;