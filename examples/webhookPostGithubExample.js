const chai = require('chai');
const chaiHttp = require('chai-http');
const crypto = require("crypto");

chai.should();
chai.use(chaiHttp);

var targetUrl = "http://localhost:1502";
var body = {repository: { name:'node-hook-action'}};
var calcSecret = "sha1=" + crypto.createHmac("sha1", "githubSecretHere")
                                 .update(JSON.stringify(body))
                                 .digest("hex");

chai.request(targetUrl)
  .post('/webhook')
  .set('Content-Type', 'application/json')
  .set('X-GitHub-Event', 'push')
  .set('X-Hub-Signature', calcSecret)
  .send(body)
  .end((err, res) => {
    console.log(JSON.stringify(res.body))
  });