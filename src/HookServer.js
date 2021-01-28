const express = require("express");
const bodyParser = require("body-parser");
const HookService = require('./HookService')
const HookLogger = require('./HookLogger')
const API_MATRIX = require('./routes/ApiRoutes').matrix

class HookServer {

  constructor(config) {
    if (!config || !config.server_config) {
      throw "missing server config";
    }
    this._config = config;
    this._port = config.server_config.port;
    this._hostname = config.server_config.host;
    this._service = new HookService(config);
    this._logger = new HookLogger(config);
  }

  close() {
    console.log('stop');
    if (hookServer.listeningServer) {
      hookServer.listeningServer.close();
    }
  }

  /**
    * server error handler
    */
  onError(err) {
    this._logger.error("HookServer error: " + err);
  }

  start() {
    var hookServer = this;
    return new Promise((resolve, reject) => {
      hookServer.app = express();
      hookServer.app.use(express.json());// accept json payload

      var serverPath = hookServer._config.server_config.path;
      var listeningUrl = `http://${this._hostname}:${this._port}${serverPath}`;

      //~ API options
      var apiOptions = {
        config: hookServer._config,
        service: hookServer._service,
        logger: hookServer._logger,
        listeningUrl
      }
      //~ API mapping
      Object.keys(API_MATRIX).forEach(apiPath => {
        var apiEndpoint = serverPath + apiPath;
        // DEBUG // hookServer._logger.debug(` * serve route ${apiEndpoint}`);
        hookServer.app.use(apiEndpoint, API_MATRIX[apiPath].apiRoutes(apiOptions));
      });

      //~ Express listen
      hookServer.listeningServer = hookServer.app
      .listen(hookServer._port, hookServer._hostname, () => {
        hookServer._logger.info(`Listening ${listeningUrl}`);
        resolve(hookServer);
      })
      .on('error', hookServer.onError.bind(this));
    });
  }
}

module.exports = HookServer;