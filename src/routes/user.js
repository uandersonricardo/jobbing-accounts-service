const express = require('express');

const authMiddleware = require('../middlewares/auth');
const userController = require('../controllers/user');

const user = app => {
  const router = express.Router();
  router.use(authMiddleware.verifyToken);

  router.get('/list', userController.list);
  router.get('/search', userController.search);
  router.get('/:userId', userController.show);
  router.put('/:userId', userController.update);

  app.use('/user', router);
};

module.exports = user;
