import express from 'express';

const router = express.Router();

export default function apiRoutes(options) {
    const {config, service, logger, listeningUrl} = options;

    router.get('/:actionId', function(req, res, next) {
      if (!service.isXTokenValid(req)) {
          logger.error(`Token is invalid!`);
          res.status(400);
          res.end();
          return;
      }
      const actionId = req.params.actionId;
      if (!actionId) {
          res.status(400);
          res.end();
          return;
      }
      const actionResult = service.getActionResultById(actionId);
      if (!actionResult) {
          res.status(404);
          res.end();
          return;
      }
      if (!actionResult.code) {
          res.status(202);
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
      const pending = service.getAsyncActions();
      const done = service.getActionsResults();
      res.send({pending, done});
    res.status(200);
    res.end();
  });

    return router;
}
