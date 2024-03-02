const auth = require('../config/middlewares/auth')

const login = require('./controllers/login');
const postController = require('./controllers/postController');
const pageController = require('./controllers/pageController');

module.exports = function (app) {
  // User Routes
  app.get('/login', login.renderLogin);
  app.post('/login', login.loginUser);
  app.post('/signup', login.registerUser);
  app.get('/logout', login.logout);
  
  //ROUTES
  app.get('/', postController.homePage);
  app.get('/posts/:id', postController.getPostByID);
  app.get('/posts', postController.getAllPosts);
  app.post('/posts', auth.requireLogin, postController.createPost);
  app.delete('/posts/:id', auth.requireLogin, postController.deletePost);

  app.get('/add_post', pageController.getAddPage);
};
