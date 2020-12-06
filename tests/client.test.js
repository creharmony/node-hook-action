require('supertest');
const chai = require('chai');
const chaiHttp = require('chai-http');
const util = require('util')
const async = require('async')
const crypto = require("crypto");

chai.should();
chai.use(chaiHttp);
const assert = require('assert').strict;
const expect = require('chai').expect

const SRC_DIR = '../src';
const nodeHookActionServer = require(SRC_DIR + '/server');

var server;

describe('server webhooks', () => {
  before(async function () {
      server = await nodeHookActionServer();
  });

  it('should post custom webHook with simpleSecret', function(done) {

      chai.request(server)
        .post('/webhook')
        .set('x-token', 'simpleFlatSecret')
        .send({ customJson: 'content'})
        .end((err, res) => {
          _assumeSuccess(err, res);
          res.body.code.should.be.eql("OK");
          done();
        });

  });

  it('should post github webHook', function(done) {
      var body = {repository: { name:'node-hook-action'}};
      const calcSecret = "sha1=" + crypto.createHmac("sha1", "githubSecretHere")
        .update(JSON.stringify(body))
        .digest("hex");

      chai.request(server)
        .post('/webhook')
        .set('X-GitHub-Event', 'push')
        .set('X-Hub-Signature', calcSecret)
        .send(body)
        .end((err, res) => {
          _assumeSuccess(err, res);
          res.body.code.should.be.eql("OK");
          done();
        });

  });

  after(function () {
    try {
      server.quit();
    } catch (exception) {
      expect.fail(exception);
    }
  });

});

//~ private

function _expectNoError(err) {
  expect.fail(err);
}

function _assumeSuccess(err, res) {
  if (err) {
    expect.fail(err);
  }
  if (res.status && (res.status < 200 || res.status > 299)) {
    console.log("res:",res.body);
  }
  res.status.should.be.within(200, 299, 'response status 2xx success expected');
}