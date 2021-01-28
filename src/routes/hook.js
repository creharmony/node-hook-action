const router = require('express').Router();
const shelljs = require("shelljs");
const jp = require("jsonpath");

function apiRoutes(options) {
  var { config, service, logger, listeningUrl } = options;

  router.post('/', function(req, res) {
        var eventType = null;
        // DEBUG // console.log('REQ HEADERS' + JSON.stringify(req.headers));
        // DEBUG // console.log('POST BODY', req.body);
        if (service.isXGithub(req)) {
            try {
              eventType = service.verifySignatureAndGetXGithubEvent(req)
            } catch (githubVerifyError) {
              logger.error(`${service.getSourceIp(req)} | ${githubVerifyError}`);
              res.status(400);//https://http.cat/400
              res.end();
              return;
            }
        } else if (service.isXToken(req)) {
            if (!service.isXTokenValid(req)) {
                logger.error(`${service.getSourceIp(req)} | Token is invalid!`);
                res.status(400);
                res.end();
                return;
            }
            eventType = "custom";
        }

        if (eventType === null) {
            logger.info(`${service.getSourceIp(req)} | Unmanaged event received!`);
            res.status(404);
            res.end();
            return;
        }

        const actions = config.actions.filter((configAction) => {
          if (configAction.headers) {// does headers conditions match the request headers ?
            var matchedHeaders = Object.keys(configAction.headers).filter((configActionHeader) => {
                return (req.headers[configActionHeader] === configAction.headers[configActionHeader]);
            });
            if (matchedHeaders.length !== Object.keys(configAction.headers).length) {
              return false;
            }
          }
          if (configAction.payload) {// does body conditions match the request body ?
            var matchedPayloadConditions = Object.keys(configAction.payload).filter((jsonPath) => {
                // DEBUG // console.info("jp.paths(req.body, " + jsonPath + ") :" + jp.value(req.body, jsonPath));
                return (jp.value(req.body, jsonPath) === configAction.payload[jsonPath]);
            });
            if (matchedPayloadConditions.length !== Object.keys(configAction.payload).length) {
              return false;
            }
          }
          var matchedEvents = configAction.events.filter((actionEvent) => actionEvent.event === eventType);
          // condition are done, lets play!
          return matchedEvents && matchedEvents.length > 0;
        });

        if (!actions || actions.length < 1) {
            logger.error(`${service.getSourceIp(req)} | nothing to be done`);
            res.status(304);//https://http.cat/304
            res.end();
            return;
        }
        // DEBUG // console.log('actions : ' + JSON.stringify(actions));
        var answered = false;
        actions.forEach((todoAction) => todoAction.events.forEach((actionEvent) => {
          if (actionEvent.event !== eventType) {
            return;
          }
          const tpl = eval("`" + actionEvent.action + "`");
          if (actionEvent.async && actionEvent.async === true){
            var actionId = service.generateUUID();
            service.pushAsyncAction(actionId);
            shelljs.exec(tpl, {}, function(code, stdout, stderr) {
              var wasSuccess = (code === 0);
              var actionResult = {actionId, wasSuccess, code, stderr, stdout};
              logger.info(`${service.getSourceIp(req)} | ${eventType} | async action (id='${actionId}') '${actionEvent.action}' done - code:'${code}'`);
              service.doneAsyncAction(actionId, actionResult);
            });
            logger.info(`${service.getSourceIp(req)} | ${eventType} | async action (id='${actionId}') '${actionEvent.action}' CREATED`);
            res.set("Location", `${listeningUrl}/actions/${actionId}`)
            res.send({code:"CREATED", eventType, actionId});
            res.status(201);
            res.end();
            answered = true;
          } else {
            shelljs.exec(tpl);
            logger.info(`${service.getSourceIp(req)} | ${eventType} | action '${actionEvent.action}' done`);
          }
        }))
        if (!answered) {
          res.send({code:"OK"});
          res.status(200);
          res.end();
        }
  });

  return router
}

module.exports.apiRoutes = apiRoutes;

