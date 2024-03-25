const Post = require('../models/Post');
const fs = require('fs');
const ejs = require('ejs');
const zlib = require('zlib');
const { pageRender, sendResponse, errorTemplate, renderTemplate } = require('../../helper/util');
const { isValidObjectId } = require('mongoose');
const postsPerPage = 50;

exports.homePage = async (req, res) => {
  req.internally = true;
  req.isHome = true;
  const { cards, hasPosts } = await exports.getCardsTemplate(req);

  req.options['hasPosts'] = hasPosts;
  req.options['cards'] = cards;

  pageRender(req, res, 'posts');
}

exports.testPage = async (req, res) => {
  pageRender(req, res, 'test');
}

exports.getAllPosts = async (req, res) => {
  try {
    req.internally = true;
    const { cards, hasPosts } = await exports.getCardsTemplate(req);

    req.options['hasPosts'] = hasPosts;
    req.options['cards'] = cards;

    pageRender(req, res, 'posts');
  } catch (error) {
    console.log("ERROR getting posts",error);
    return errorTemplate(res, { title: "500", sub_title: "Internal Server Error", message: "Something bad happened at our end kindly visit home page or try again" });
  }
};

exports.getPostsCounts = async function(req, res) {
  try {
    const query = helper.getPostsQuery(req);
    const totalCount = await Post.countDocuments(query);
    const totalPage = Math.ceil(totalCount / postsPerPage);
    const hasPosts = totalCount > 0;
    
    let responseData = {
      totalPage,
      hasPosts,
      currentPage: req.query.page
    }

    return responseData;
  } catch (error) {
    console.log("ERRO count", error);
    if(req.internally) throw error;

    return sendResponse(res, 500);
  }
}

exports.getCardsTemplate = async function(req, res) {
  try {
    const query = helper.getPostsQuery(req);
    const page = req.query.page || 1;
    const skip = (page - 1) * postsPerPage;
    
    const posts = await Post.find(query).skip(skip).limit(postsPerPage).populate("user_id", "initial").lean();
    const _card = fs.readFileSync('views/partials/_card.ejs', 'utf8');
    
    let cards = ``;
    for(let post of posts) {
      const cardInfo = { card: { initial: post.user_id.initial || "NA", onclick: post._id, title: post.title, description: post.contentText, admin: req.user && (post.user_id.toString() == req.user.user_id) }};
      const renderedPartial = ejs.render(_card, cardInfo);
      cards += renderedPartial;
    }
    
    const { totalPage, currentPage, hasPosts } = await exports.getPostsCounts(req);
    const pageInfo = JSON.stringify({ totalPage, currentPage });
    
    cards = `${cards}<div id="page-info-hidden">${pageInfo}</div>`;

    if(req.internally) return {cards, hasPosts};
    
    const compressedHtml = zlib.gzipSync(cards);

    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Type', 'text/html');
    res.status(226).send(compressedHtml);
  } catch (error) {
    console.log("ERROR IN TEMPLATE ",error);
    if(req.internally) throw error;

    return sendResponse(res, 500);
  }
}

exports.getPostByID = async (req, res) => {
  const post = await Post.findById(req.params.id);

  req.options['post'] = post;
  pageRender(req, res, 'post');
};

exports.getPost = async (req, res) => {
  if(!req.params.id) return sendResponse(res, 400, "Parameters Missing");

  const post = await Post.findById(req.params.id);
  const _post = fs.readFileSync('views/partials/_postModal.ejs', 'utf8');

  const postInfo = { post: { content: post.content, title: post.title, description: post.contentText, editable: req.user && req.user.user_id == post.user_id.toString() }};
  const renderedPartial = ejs.render(_post, postInfo);

  res.json({success: true, modalHtml: renderedPartial, content: post.content});
};

exports.createPost = async (req, res) => {
  let { title, content, contentText, publicPost } = req.body;
  if (!title || !contentText || contentText.length <= 1 || typeof publicPost != "boolean") return sendResponse(res, 400, "Invalid Parameter Request");

  await Post.create({
    title: title,
    content: content || "",
    contentText: contentText,
    publicPost: publicPost,
    user_id: req.user.user_id,
    status: 1,
    created: Date.now()
  })
  res.json({ success: true });
};

exports.updatePost = async function (req, res) {
  let { content, contentText, id } = req.body;
  if (!contentText || contentText.length <= 1 || !isValidObjectId(id)) return sendResponse(res, 400, "Invalid Parameter Request");

  const update = { $set: { contentText, content } };
  const filter = {user_id: req.user.user_id, _id: id};

  const post = await Post.findOneAndUpdate(filter, update);

  if(!post) return sendResponse(res, 400, "Invalid Request!");

  res.json({ success: true });
}

exports.deletePost = async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id });
  let deletedImage = './public' + post.image;
  fs.unlinkSync(deletedImage);
  await Post.findOneAndRemove({ _id: post._id });
  res.redirect('/');
};

var helper = {
  getPostsQuery: function (req) {
    try {
      req.query.page = +req.query.page;
      if (isNaN(req.query.page)) req.query.page = 1;
      const search = req.query.search || null;

      let conditions = [{status: 1}];
      if (req.user) {
        let q = {
          "$or": [
            { publicPost: true }
          ]
        }

        if(req.isHome) {
          q['$or'].push({ publicPost: false, user_id: req.user.user_id });
        } else {
          q = { user_id: req.user.user_id };
        }
        conditions.push(q);
      } else {
        conditions.push({ publicPost: true });
      }

      if (search) {
        conditions.push({
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { contentText: { $regex: search, $options: 'i' } }
          ]
        })
      }

      let query = { $and: conditions };

      return query;

      

      // const pipeline = [
      //   { $match: { $and: conditions } },
      //   {
      //     $facet: {
      //       totalCount: [{ $count: "totalCount" }],
      //       data: [
      //         { $skip: (page - 1) * postsPerPage },
      //         { $limit: postsPerPage }
      //       ]
      //     }
      //   }
      // ];

      // console.log("pipeline---- ", JSON.stringify(pipeline));

      // const result = await Post.aggregate(pipeline);
      // const [data = {}] = result;
      // const totalCount = data.totalCount && data.totalCount[0] && data.totalCount[0].totalCount || 0;
      // const posts = data.data || [];
      // const totalPage = Math.ceil(totalCount / postsPerPage);
      // console.log("totalCount", totalCount);
      // console.log("posts", posts.length);
    } catch (error) {
      console.log("CATCHE ERR GET posts", error);
      return { totalCount: -1 };
    }
  }
}