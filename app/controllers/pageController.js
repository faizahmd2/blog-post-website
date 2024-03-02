const { pageRender } = require('../../helper/util');
// const Post = require('../models/Post');

exports.getAddPage = (req, res) => {
  pageRender(req, res, 'add_post');
};