const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');
const { pageRender } = require('../../helper/util');

exports.homePage = async (req, res) => {
  pageRender(req, res, 'index');
}

exports.getAllPosts = async (req, res) => {
  const page = req.query.page || 1;
  const postsPerPage = 100;

  const totalPosts = await Post.find().countDocuments();

  let conditions;
  if(req.user) {
    conditions = [
      { user_id: req.user.user_id },
      { publicPost: true, user_id: { $ne: req.user.user_id } }
    ];
  } else {
    conditions = [
      { publicPost: true }
    ];
  }

  const posts = await Post.find({
    $or: conditions
  })
    .sort('-created')
    .skip((page - 1) * postsPerPage)
    .limit(postsPerPage);

  
  req.options = {
    posts: posts,
    current: page,
    pages: Math.ceil(totalPosts / postsPerPage),
    totalPosts,
    user: req.user
  };
  pageRender(req, res, 'posts');
};

exports.getPostByID = async (req, res) => {
  const post = await Post.findById(req.params.id);

  req.options = { post };
  pageRender(req, res, 'post');
};

exports.createPost = async (req, res) => {
  const uploadDir = 'public/uploads';

  if(!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  let uploadedImage = req.files.image;
  let uploadPath = path.resolve(__dirname,"../../public/uploads/",uploadedImage.name);

  // uploadedImage.mv(uploadPath, async () => {
    await Post.create({
      ...req.body,
      image: 'uploads/' + uploadedImage.name,
      publicPost: !!req.body.publicPost,
      created: Date.now()
    })
  // });
  res.redirect('/');
};

exports.deletePost = async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id });
  let deletedImage = './public' + post.image;
  fs.unlinkSync(deletedImage);
  await Post.findOneAndRemove({ _id: post._id});
  res.redirect('/');
};