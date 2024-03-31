const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'login'
  },
  title: String,
  content: String,
  contentText: String,
  publicPost: {
    type: Boolean,
    default: false
  },
  status: {
    type: Number,
    default: 1
  },
  editor: {
    type: String,
    default: ""
  },
  created: Date,
  modified: {
    type: Date,
    default: Date.now
  },
});

const Post = mongoose.model('posts', PostSchema);

module.exports = Post;