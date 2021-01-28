const fs = require("fs");

const HookServer = require('./HookServer');

function makeServer() {
  return new Promise(function (resolve, reject) {
    try {
      //~ server configuration
      var rawConfig = fs.readFileSync("./config.json");
      var config = JSON.parse(rawConfig.toString());
      var hookServer = new HookServer(config);
      hookServer.start()
        .then((listeningServer)=>{resolve(hookServer);})
        .catch(reject);
    } catch (exception) {
      reject(exception);
    }
  });
}

module.exports = makeServer;