const bodyParser = require("body-parser");
const crypto = require("crypto");
const express = require("express");
const fs = require("fs");
const moment = require("moment");
const shelljs = require("shelljs");
const jp = require("jsonpath");

const rawConfig = fs.readFileSync("config.json");
const config = JSON.parse(rawConfig.toString());

const originalLog = console.log;
const originalErr = console.error;

var logsDir = null;

console.log = (str) => {
    originalLog(str);
    if (logsDir === null) {
      return;
    }
    const filename = moment(new Date()).format("DD-MM-YYYY");
    const datenow = moment(new Date()).format("LTS");

    fs.appendFile(logsDir + "/" + filename + ".log", `[${datenow}] ` + str + "\n", (err) => {
        if (err) { throw err; }
    });
};

console.error = (str) => {
    originalErr(str);
    if (logsDir === null) {
      return;
    }
    const filename = moment(new Date()).format("DD-MM-YYYY");
    const datenow = moment(new Date()).format("LTS");

    fs.appendFile(logsDir + "/" + filename + ".err", `[${datenow}] ` + str + "\n", (err) => {
        if (err) { throw err; }
    });
};

function makeServer(done) {
  return new Promise(async function (resolve, reject) {
    if (!config.server_config) {
      reject("missing server_config");
    }

    // if 'server_config.directories.logs', then log to that directory
    if (config.server_config.directories && config.server_config.directories.logs) {
      logsDir = config.server_config.directories.logs;
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
      }
    }

    const app = express();
    const port = config.server_config.port;
    const hostname = config.server_config.host;

    app.use(bodyParser.json());

    app.post(config.server_config.path, (req, res) => {
        var eventType = null;
        // DEBUG // console.log('REQ HEADERS' + JSON.stringify(req.headers));
        if (req.headers["x-github-event"]) {
            const calcSecret = "sha1=" +
                    crypto.createHmac("sha1", config.server_config.secret.github)
                .update(JSON.stringify(req.body))
                .digest("hex");
            const reqSecret = req.headers["x-hub-signature"];

            if (calcSecret !== reqSecret) {
                console.error(`Github signature is invalid!`);
                res.status(400);//https://http.cat/400
                res.end();
                return;
            }

            eventType = req.headers["x-github-event"];
        } else if (req.headers["x-token"]) {
            const reqFlatSecret = req.headers["x-token"];
            if (config.server_config.secret.custom !== reqFlatSecret) {
                console.error(`Token is invalid!`);
                res.status(400);
                res.end();
                return;
            }
            eventType = "custom";
        }

        if (eventType === null) {
            console.info(`Unmanaged event received!`);
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
            console.error(`nothing to be done`);
            res.status(304);//https://http.cat/304
            res.end();
            return;
        }
        // DEBUG // console.log('actions : ' + JSON.stringify(actions));
        actions.forEach((todoAction) => todoAction.events.forEach((actionEvent) => {
          if (actionEvent.event !== eventType) {
            return;
          }
          const tpl = eval("`" + actionEvent.action + "`");
          shelljs.exec(tpl);
          console.log(`${eventType} | action '${actionEvent.action}' done`);
        }))

        res.send({code:"OK"});
        res.status(200);
        res.end();
    });

    var server = app.listen(port, hostname, () => {
      console.log(`Listening ${hostname}:${port}!`);
      resolve(server);
    });

    server.quit = function() {
      console.log('stop');
      server.close();
    }
  });
}
module.exports = makeServer;