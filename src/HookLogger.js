const fs = require("fs");
const moment = require("moment");

class HookLogger {

  constructor(config) {
    if (!config || !config.server_config) {
      throw "missing server config";
    }
    this._config = config;
    this._logsDir = null;
    // if 'server_config.directories.logs', then log to that directory
    this._mustLogToFile = (config.server_config.directories && config.server_config.directories.logs);
    if (this._mustLogToFile) {
      this._logsDir = config.server_config.directories.logs;
      if (!fs.existsSync(this._logsDir)) {
        fs.mkdirSync(this._logsDir);
      }
      // DEBUG // console.log(` * log into directory: ./${this._logsDir}`);
    }
  }

  mustLogToFile() {
    return this._mustLogToFile;
  }

  debug(msg) {
    console.log(msg);
  }

  info(msg) {
    this._logMessage(msg, false);
  }

  error(msg) {
    this._logMessage(msg, true);
  }

  //~ private

  _logMessage(msg, isError) {
    if (isError) {
      console.error(msg);
    } else {
      console.log(msg);
    }
    if (!this.mustLogToFile()) {
      return;
    }
    var filename = this._logsDir + "/" + moment(new Date()).format("DD-MM-YYYY") + (isError ? ".err" : ".log");
    var datenow = moment(new Date()).format("LTS");

    fs.appendFile(filename, `[${datenow}] ${msg} \n`, (err) => {
        if (err) { throw err; }
    });
  }

}

module.exports = HookLogger;
