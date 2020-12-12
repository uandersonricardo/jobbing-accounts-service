const express = require('express');

const authMiddleware = require('../middlewares/auth');
const accountController = require('../controllers/account');

const user = app => {
  const router = express.Router();
  router.use(authMiddleware.verifyToken);

  router.get('/', accountController.list);
  router.get('/search', accountController.search);
  router.get('/:accountId', accountController.show);
  router.put('/:accountId', accountController.update);

  app.use('/account', router);
};

module.exports = user;
