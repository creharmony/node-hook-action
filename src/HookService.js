const uuidv4 = require('uuid').v4;
const crypto = require("crypto");

class HookService {

  constructor(config) {
    if (!config || !config.server_config) {
      throw "missing server config";
    }
    this._config = config;
    this._asyncActions = [];
    this._asyncActionsResult = [];
    this._asyncActionsResultMaxLength = 1000;
  }

  getCustomSecret() {
    return this._config.server_config.secret.custom;
  }

  getGithubSecret() {
    return this._config.server_config.secret.github;
  }

  getSourceIp(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress
  }

  isXToken(req) {
    return (req.headers["x-token"]);
  }

  isXTokenValid(req) {
    const reqFlatSecret = req.headers["x-token"];
    return (this.getCustomSecret() === reqFlatSecret);
  }

  isXGithub(req) {
    return (req.headers["x-github-event"]);
  }

  verifySignatureAndGetXGithubEvent(req) {
    var requestBody = req.body;
    const calcSecret = "sha1=" + crypto.createHmac("sha1", this.getGithubSecret())
                                       .update(JSON.stringify(requestBody))
                                       .digest("hex");
    const reqSecret = req.headers["x-hub-signature"];

    if (calcSecret !== reqSecret) {
      throw "Github signature is invalid!";
    }

    return req.headers["x-github-event"];
  }

  generateUUID() {
    return uuidv4();
  }

  pushAsyncAction(actionId) {
    this._asyncActions.push(actionId);
  }

  doneAsyncAction(actionId, actionResult) {
    this._removeItemOnce(this._asyncActions, actionId);
    this._pushToALimitedArray(this._asyncActionsResult, this._asyncActionsResultMaxLength, actionResult);
  }

  getActionResultById(actionId) {
    return this._findById(this._asyncActionsResult, actionId);
  }

  getAsyncActions() {
    return this._asyncActions;
  }

  getActionsResults() {
    return this._asyncActionsResult;
  }

  //~ private

  _removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

  _pushToALimitedArray(arr, maxLength, arrayEntry) {
    arr.push(arrayEntry);
    if (arr.length > maxLength) {
      arr.shift();
    }
  }

  _findById(arr, id) {
    return arr.find(arrayEntry => (arrayEntry.id && id === arrayEntry.id));
  }

}
module.exports = HookService;