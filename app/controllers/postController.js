const Post = require('../models/Post');
const fs = require('fs');
const { pageRender, sendResponse, errorTemplate } = require('../../helper/util');

exports.homePage = async (req, res) => {
  pageRender(req, res, 'index');
}

exports.getAllPosts = async (req, res) => {
  if(req.query.page && isNaN(req.query.page)) req.query.page = null;
  const { posts, totalCount, totalPage, postsPerPage, currentPage } = await helper.getAllPosts(req);
  let jsonReq = req.headers['x-content-request'] == 'json';

  if(!(totalCount >= 0)) {
    if(jsonReq) {
      return sendResponse(res, 500);
    }
    return errorTemplate(res, {title: "500", sub_title: "Internal Server Error", message: "Something bad happened at our end kindly visit home page or try again"});
  }

  let responseData = {
    posts: posts,
    totalPage: totalPage,
    totalPosts: totalCount,
    postsPerPage,
    currentPage
  }

  
  if(jsonReq) {
    return res.json({...responseData, success: true});
  }
  
  req.options = {
    user: req.user,
    ...responseData
  };
  pageRender(req, res, 'posts');
};

exports.getPostByID = async (req, res) => {
  const post = await Post.findById(req.params.id);

  req.options = { post };
  pageRender(req, res, 'post');
};

exports.createPost = async (req, res) => {
  let { title, content, plainTextContent, publicPost } = req.body;
  if (!title || !plainTextContent || plainTextContent.length <= 1 || typeof publicPost != "boolean") return sendResponse(res, 400, "Invalid Parameter Request");

  await Post.create({
    title: title,
    content: content || "",
    plainTextContent: plainTextContent,
    publicPost: publicPost,
    status: 1,
    created: Date.now()
  })
  res.json({success: true});
};

exports.deletePost = async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id });
  let deletedImage = './public' + post.image;
  fs.unlinkSync(deletedImage);
  await Post.findOneAndRemove({ _id: post._id});
  res.redirect('/');
};

var helper = {
  getAllPosts: async function(req) {
    try {
      const page = req.query.page || 1;
      const search = req.query.search || null;
      const postsPerPage = 50;

      let conditions = [];
      if(req.user) {
        conditions.push({
          $or: [
            { user_id: req.user.user_id },
            { publicPost: true, user_id: { $ne: req.user.user_id } }
          ]
        });
      } else {
        conditions.push({ publicPost: true });
      }

      if(search) {
        conditions.push({
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { plainTextContent: { $regex: search, $options: 'i' } }
          ]
        })
      }

      const pipeline = [
        { $match: { $and: conditions } },
        { $facet: {
            totalCount: [{ $count: "totalCount" }],
            data: [
              { $skip: (page - 1) * postsPerPage },
              { $limit: postsPerPage }
            ]
          }
        }
      ];

      // console.log("pipeline---- ",JSON.stringify(pipeline));

      const result = await Post.aggregate(pipeline);
      const [ data = {} ] = result;
      const totalCount = data.totalCount && data.totalCount[0] && data.totalCount[0].totalCount || 0;
      const posts = data.data || [];
      const totalPage = Math.ceil(totalCount / postsPerPage);
      // console.log("totalCount",totalCount);
      // console.log("posts",posts.length);

      return { posts, totalCount, totalPage, postsPerPage, currentPage: page };
    } catch (error) {
      console.log("CATCHE ERR GET posts",error);
      return { totalCount: -1 };
    }
  }
}