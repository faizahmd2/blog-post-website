const Post = require('../models/Post');

exports.getAddPage = (req, res) => {
  res.render('add_post');
};