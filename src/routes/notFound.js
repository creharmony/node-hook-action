const router = require('express').Router();

function notFound(req, res, next) {
     res.status(404).send({code:"NOT_FOUND"});
}

function apiRoutes(options) {
  var repo = options.repo;

  router.get('/', notFound);
  router.post('/', notFound);
  router.patch('/', notFound);
  router.delete('/', notFound);

  return router
}

module.exports.apiRoutes = apiRoutes;

