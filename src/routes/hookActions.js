const router = require('express').Router();

function apiRoutes(options) {
  var { config, service } = options;

  router.get('/:actionId', function(req, res, next) {
      if (!service.isXTokenValid(req)) {
          logger.error(`Token is invalid!`);
          res.status(400);
          res.end();
          return;
      }
      var actionId = req.params.actionId
      if (!actionId || actionId === null) {// 400 one parameter (id) is invalid
          res.status(400);//https://http.cat/400
          res.end();
          return;
      }
      var actionResult = service.getActionResultById(actionId);
      if (!actionResult) {// no async task with that id
          res.status(404);//https://http.cat/404
          res.end();
          return;
      }
      if (!actionResult.code) { // async task with that id still in progress
          res.status(202);//https://http.cat/202
          res.end();
          return;
      }
      res.send(actionResult);
      res.status(200);
      res.end();
  });

  router.get('/', function(req, res, next) {
    if (!service.isXTokenValid(req)) {
      logger.error(`Token is invalid!`);
      res.status(400);
      res.end();
      return;
    }
    var pending = service.getAsyncActions();
    var done = service.getActionsResults();
    res.send({pending, done});
    res.status(200);
    res.end();
  });

  return router
}

module.exports.apiRoutes = apiRoutes;

