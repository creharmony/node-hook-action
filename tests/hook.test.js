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

const BASE_DIR = '../';
const pjson = require(BASE_DIR+'package.json');
const mainEntryPoint = BASE_DIR + pjson.main;
const nodeHookActionServer = require(mainEntryPoint);

const enableAsyncTests = process.env.ENABLE_ASYNC_TESTS;

var hookServer;
var server;
var asyncTaskId;

before(function (done) {
    console.info(`launching ${mainEntryPoint}`)
    nodeHookActionServer()
    .then((createdServer) => {
      hookServer = createdServer;
      server = hookServer.listeningServer;
      done();
    }).catch((err) => {
      console.error(err);
      done();
    })
});

after(function () {
  try {
    server.close();
  } catch (exception) {
    expect.fail(exception);
  }
});

describe('server webhooks', () => {

  it('should post custom webHook with simpleSecret', function(done) {

      chai.request(server)
        .post('/webhook')
        .set('x-token', 'customFlatSecret')
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

  if (enableAsyncTests === 'true') {

    it('should post custom async webHook with simpleSecret', function(done) {

        chai.request(server)
          .post('/webhook')
          .set('x-token', 'customFlatSecret')
          .set('x-try', 'asyncSample')
          .send()
          .end((err, res) => {
            _assumeSuccess(err, res);
            // DEBUG // console.log(res.headers);
            // DEBUG // console.log(res.body);
            res.headers.location.should.not.be.empty;
            res.body.code.should.be.eql("CREATED");
            res.body.eventType.should.be.eql("custom");
            res.body.actionId.should.not.be.empty;
            asyncTaskId = res.body.actionId;
            done();
          });

    });

    it('should get hook actions', function(done) {

      setTimeout(() => {

        chai.request(server)
          .get('/webhook/actions')
          .set('x-token', 'customFlatSecret')
          .end((err, res) => {
            _assumeSuccess(err, res);
            // DEBUG // console.log(res.headers);
            // DEBUG // console.log(res.body);
            res.body.pending.should.be.eql([asyncTaskId]);
            res.body.done.should.be.empty;
            done();
          });

      }, 500);


    });

  }

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
    var body = JSON.stringify(res.body);
    console.log(` XXX unsuccessful response was: status:${res.status} body:${body}`);
  }
  res.status.should.be.within(200, 299, 'response status 2xx success expected');
}