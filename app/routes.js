const auth = require('../config/middlewares/auth')
const login = require('./controllers/login');
const postController = require('./controllers/postController');
const pageController = require('./controllers/pageController');

module.exports = function (app) {
  /* PAGES */
  app.get('/', postController.homePage);
  app.get('/test', postController.testPage);
  app.get('/login', login.renderLogin);
  app.get('/posts', postController.getAllPosts);
  app.get('/add_post', pageController.getAddPage);
  app.get('/post/:id', postController.getPostByID);
  app.get('/logout', login.logout);


  /* APIS */ 
  // auth
  app.post('/api/login', auth.isApi, login.loginUser);
  app.post('/api/signup', auth.isApi, login.registerUser);
  app.post('/api/validate-username', auth.isApi, login.createUsernameValidation);

  // posts
  app.get('/api/posts/cards', auth.isApi, postController.getCardsTemplate);
  app.get('/api/post/:id', postController.getPost);
  app.post('/api/add-post', auth.requireLogin, postController.createPost);
  app.delete('/api/posts/:id', auth.requireLogin, postController.deletePost);
};
