const { pageRender } = require('../../helper/util');
// const Post = require('../models/Post');

exports.getAddPage = (req, res) => {
  
  if(!req.user) {
    return res.redirect('/login');
  }

  pageRender(req, res, 'add_post');
};